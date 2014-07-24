Accents.module("TermsApp.Views", function(Views, Accents, Backbone, Marionette, $, _){
  // form for adding terms
  Views.AddTermFormView = Backbone.Marionette.ItemView.extend({
    template: '#add-term-form-template',
    currentAlertView: null,
    timeFilter: null,

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
        //this.ui.ref.val("hey!");
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
        var self = this;
        this.ui.term.val(part + term.slice(pos));
        this.ui.term[0].selectionStart = part.length;
        this.ui.term[0].selectionEnd = part.length;
        this.ui.rendered_word.html(Accents.Utils.renderTypedTerm(this.ui.term.val()));

        if( this.ui.ref.val() == "" && Accents.TermsApp.refValue){
          this.ui.ref.val( Accents.TermsApp.refValue );
          //this.ui.ref.val( "hey2");
        }

        clearTimeout( this.timeFilter );
        this.timeFilter = setTimeout(function(){
          var text_to_filter = self.ui.term.val().replace(/_/g, ""); 
          Accents.trigger("filter:terms", Accents.Utils.renderTypedTerm( text_to_filter  ));
        }, 250);
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
      this.$(".alert-container").html(this.currentAlertView.render().el);
      if( errors.term ){  this.ui.term.parent().addClass("has-error"); }
      if( errors.term ){  this.ui.ref.parent().addClass("has-error"); }
    }
  });
  var successRemove = function(model,response){
    Accents.db.remove(model.toJSON(), function(error, data){ 
      if(error==null)
      {
        console.log(data);
      }else{
        if(error.status==409)
        {
          console.log("Remove has a 409");
          console.log(error);
        }else{
          console.log(error);
        }
      }
    });
  }
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
            successRemove(model,response);
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
      //add capture of scroll

    },

    onClose: function(){
      Accents.off("filter:terms", this.filterTerms);
    },

    filterTerms: function(term){
      if(term.length>3)
      {
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
      }else{
        $("#terms-filtered-table table tbody tr").each(function(){
          $(this).css("display", "");
        });
      }
    }
  });

  // table of terms at bottom
  Views.TotalTermsView = Backbone.Marionette.ItemView.extend({
    template: '#term-list-total-template',
    serializeData: function() {
        return {
            //"total_count": this.collection.length
            "total_count": Accents.Entities.TotalTermsView
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

  Views.WaitingDataView =  Backbone.Marionette.ItemView.extend({
    template: "#waiting-data-template",
    className: "well",

    onRender: function(){
      var opts = {
        lines: 10, // The number of lines to draw
        length: 7, // The length of each line
        width: 3, // The line thickness
        radius: 8, // The radius of the inner circle
        corners: 1, // Corner roundness (0..1)
        rotate: 0, // The rotation offset
        direction: 1, // 1: clockwise, -1: counterclockwise
        color: '#000', // #rgb or #rrggbb or array of colors
        speed: 2, // Rounds per second
        trail: 60, // Afterglow percentage
        shadow: false, // Whether to render a shadow
        hwaccel: false, // Whether to use hardware acceleration
        className: 'spinner', // The CSS class to assign to the spinner
        zIndex: 2e9, // The z-index (defaults to 2000000000)
        top: '10', // Top position relative to parent
        left: '50%' // Left position relative to parent
      };
      var spinner = new Spinner(opts).spin();
      this.$el.find(".spinner-content").html( spinner.el );
    }
  });


});
