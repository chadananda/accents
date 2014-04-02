Accents.module("TermsApp.Views", function(Views, Accents, Backbone, Marionette, $, _){
  // form for adding terms
  Views.AddTermFormView = Backbone.Marionette.ItemView.extend({
    template: '#add-term-form-template',
    events: {
         'click button': 'addTerm',
         'change #add-word': 'updateTerm',
         'keyup #add-word': 'updateTerm',
    },
    ui: {
        term: '#add-word',
        ref: '#book-ref',
        rendered_word: '#rendered-word',
    },
    addTerm: function () {
       console.log('Adding new term: ', this.ui.term.val(), this.ui.ref.val());
       var newTerm = new Accents.Entities.Term({
            id: Accents.Utils.genUUID('xxxxxxxxxx'),
            term: this.ui.term.val(),
            ref   : this.ui.ref.val(),
            user : Accents.user.get('user'),
            type: 'term'
       });
        this.collection.add(newTerm);
        newTerm.save({}, {
            error: function(model, response) {
                console.log(response.responseText);
            }
        });
        this.ui.term.val('');
        this.ui.ref.val('');
        this.ui.rendered_word.empty();
        this.ui.term.focus();
    },
    updateTerm: function () {
       var pos = this.ui.term[0].selectionStart;
       var term = this.ui.term.val();
       var part = Accents.Utils.renderGlyph2UTF(term.slice(0, pos));
       this.ui.term.val(part + term.slice(pos));
       this.ui.term[0].selectionStart = part.length;
       this.ui.term[0].selectionEnd = part.length;
       // temporarily display HTML version below since we cannot display underscores in input
       this.ui.rendered_word.html(Accents.Utils.renderTypedTerm(this.ui.term.val()));
    }
  });

  // temporary add/remove links
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

  // table of terms at bottom
  Views.TermView = Backbone.Marionette.ItemView.extend({
    template: '#term-list-item-template',
    tagName: 'tr',
    /*templateHelpers: {
        ilm2html: function() {
            return Accents.Utils.ilm2HTML(this.term);
        }
    }*/
  });

  Views.TermsView = Backbone.Marionette.CompositeView.extend({
    template: '#terms-list-table-template',
    itemView: Views.TermView,
    itemViewContainer: 'tbody',
    collectionEvents: {
        "change reset add remove": "render"
    },
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
      add_term_list_table: "#terms-table"
    }
  });

});
