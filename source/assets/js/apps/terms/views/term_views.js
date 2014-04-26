Accents.module("TermsApp.Views", function(Views, Accents, Backbone, Marionette, $, _){
  // form for adding terms
  Views.AddTermFormView = Backbone.Marionette.ItemView.extend({
    template: '#add-term-form-template',
    currentAlertView: null,
    events: {
         'click button': 'addTerm',
         'change #add-word': 'updateTerm',
         'keyup #add-word': 'updateTerm',
         'keyup #book-ref': 'chekTerm'
    },
    ui: {
        term: '#add-word',
        ref: '#book-ref',
        rendered_word: '#rendered-word',
    },

    onRender: function(){
      if(Accents.TermsApp.refValue){
        this.ui.ref.val( Accents.TermsApp.refValue );
      }
    },

    chekTerm: function(e){
      if(e.keyCode == 13){
        this.addTerm();
      }
    },

    addTerm: function () {
       console.log('Adding new term: ', this.ui.term.val(), this.ui.ref.val());
       var self = this;
       if( this.currentAlertView ){
         this.currentAlertView.remove();
       }
       var validateTerm = new Accents.Entities.Term({
            term: this.ui.term.val(),
            ref: this.ui.ref.val(),
            user : Accents.user.get('user'),
       });
        var errors = validateTerm.validate();
        if( _.isEmpty(errors) ){
          var termValues = validateTerm.get("term").split(" ");
          Accents.TermsApp.refValue = this.ui.ref.val();
          _.each(termValues, function(termV){
              if(termV.trim() != "" ){
                var savedModel = new Accents.Entities.Term({
                    id: Accents.Utils.genUUID('xxxxxxxxxx'),
                    term: termV,
                    ref: self.ui.ref.val(),
                    user : Accents.user.get('user'),
                    type: 'term'
                });
                self.collection.add(savedModel);
                savedModel.save({}, {
                    success: function(model, response){
                      Accents.db.post(model.toJSON(), function(err, d){ console.log(err); console.log(d);  });
                    },
                    error: function(model, response) {
                        console.log(response.responseText);
                    }
                });
              }
          });
          this.showSuccess();
          this.ui.term.val('');
          this.ui.rendered_word.empty();
          this.ui.term.focus();
        }else{ 
          this.showErrors(errors);
	}
    },

    updateTerm: function (e) {
      if(e.keyCode == 13){
        this.addTerm();
      }else{
        var pos = this.ui.term[0].selectionStart;
        var term = this.ui.term.val();
        var part = Accents.Utils.renderGlyph2UTF(term.slice(0, pos));
        this.ui.term.val(part + term.slice(pos));
        this.ui.term[0].selectionStart = part.length;
        this.ui.term[0].selectionEnd = part.length;
        // temporarily display HTML version below since we cannot display underscores in input
        this.ui.rendered_word.html(Accents.Utils.renderTypedTerm(this.ui.term.val()));

        if( this.ui.ref.val() == "" && Accents.TermsApp.refValue){
          this.ui.ref.val( Accents.TermsApp.refValue );
        }
 
        Accents.trigger("filter:terms", Accents.Utils.renderTypedTerm( this.ui.term.val().replace("_", "")  ));
      }
    },

    showSuccess: function(){
      var _errors =[];
      _errors.push("The word(s) have been Added");
      this.currentAlertView = new Views.AlertView( {model: new Backbone.Model({errors: _errors, type: "success"}) } );
      this.$(".alert-container").html(this.currentAlertView.render().el);

      this.ui.term.parent().removeClass("has-error");
      this.ui.ref.parent().removeClass("has-error");
    },

    showErrors: function(errors){
      var _errors =[];
      if(errors.term){
        _errors.push("Term: " + errors.term);
      }
      if(errors.ref){
        _errors.push("Ref: " + errors.ref);
      }
      this.currentAlertView = new Views.AlertView( {model: new Backbone.Model({errors: _errors, type: "danger"}) } );
      //this.$(".form-inline").prepend("<div>"+ _errors  +"</ul>");
      this.$(".alert-container").html(this.currentAlertView.render().el);
      if( errors.term ){  this.ui.term.parent().addClass("has-error"); }
      if( errors.term ){  this.ui.ref.parent().addClass("has-error"); }
    }
  });

  // temporary add/remove links
  /*
  Views.TempLinksView = Backbone.Marionette.ItemView.extend({
    template: '#temp-links-template',
    events: {
         'click button#deleteall': 'deleteAll',
         'click button#generatefakes': 'generateFakes',
    },
    deleteAll: function() {
        while (model = this.collection.first()) {
            model.destroy();
        }
    },
    generateFakes: function () {
        Accents.Entities.fakeTerms(this.collection);
    },
  });
*/

  // table of terms at bottom
  Views.TermView = Backbone.Marionette.ItemView.extend({
    template: '#term-list-item-template',
    tagName: 'tr',

    events: {
      'click .remove': 'removeTerm'
    },

    removeTerm: function(){
      if( confirm('Are you sure?')){
        this.model.destroy({
          success: function(model, response){
            Accents.db.remove(model.toJSON(), function(error, data){ console.log(error); console.log(data); });
          }
        });
      }
    }

  });

  Views.FilteredTermView = Backbone.Marionette.ItemView.extend({
    template: '#term-filtered-list-item-template',
    tagName: 'tr'
  });


  Views.TermsView = Backbone.Marionette.CompositeView.extend({
    template: '#terms-list-table-template',
    itemView: Views.TermView,
    itemViewContainer: 'tbody',
    collectionEvents: {
        "change reset add remove": "render"
    }
  });

  Views.FilteredTermsView = Backbone.Marionette.CompositeView.extend({
    template: '#terms-filtered-list-table-template',
    itemView: Views.FilteredTermView,
    itemViewContainer: 'tbody',
    collectionEvents: {
        "reset add remove": "render"
    },

    initialize: function(){
      var groupedObject = this.collection.countBy("term");
      var array = [];
      for(object in groupedObject ){
        array.push({term: object, count: groupedObject[object]});
      }
      this.collection = new Backbone.Collection(array);
      Accents.on("filter:terms", this.filterTerms);  
    },

    onClose: function(){
      Accents.off("filter:terms", this.filterTerms);
    },

    filterTerms: function(term){
      var text = term || ""
      var patt = new RegExp(text, 'i');
      var patt2 = new RegExp(Accents.Utils.dotUndersRevert(text), 'i');
      $("#terms-filtered-table table tbody tr").each(function(){					
        var text = $(this).find('td.term').text();
        if( patt2.test( Accents.Utils.dotUndersRevert(text)) || patt.test(text) ){
          $(this).css("display", "");
        }else{
          $(this).css( "display", "none" );
          return true;
        }
      });
      console.log("Lets filter terms: " + term );
    }

  });

  // table of terms at bottom
  Views.TotalTermsView = Backbone.Marionette.ItemView.extend({
    template: '#term-list-total-template',
    serializeData: function() {
        return {
            "total_count": this.collection.length
        };
    },
    collectionEvents: {
        "change reset add remove": "render",
    },
    tagName: 'h3'
  });

  // add terms main area
  Views.AddTermMainLayout = Marionette.Layout.extend({
    template: '#add-term-main-layout-template',
    regions: {
      add_term_form : "#add-term-form",
      add_remove_links  : "#add-remove-links",
      add_terms_list  : "#add-terms-list",
    }
  });

  // table layout with total at the top
  Views.TermsListLayout = Marionette.Layout.extend({
    template: '#terms-list-layout-template',
    regions: {
      add_term_list_total: "#terms-total",
      add_term_list_table: "#terms-table",
      add_term_filtered_table: "#terms-filtered-table"
    },
  
    initialize: function(){
      Accents.on("filter:terms", this.selectFilteredTab);
    },

    selectFilteredTab: function(term){
      $('#myTab a:last').tab('show');     
    }

  });

  Views.AlertView =  Backbone.Marionette.ItemView.extend({
    template: "#alert-template",

    events:{
      "click .close": "close"
    },

    close: function(e){
      this.remove();
    }
  });

});
