Accents.module("TermsApp", function(TermsApp, Accents, Backbone, Marionette, $, _){
  TermsApp.Controller = {
    termsList: function(){
      Accents.main.show(new TermsApp.Views.WaitingDataView());

      Accents.terms = new Accents.Entities.Terms();
      var addLayout = new TermsApp.Views.AddTermMainLayout();

    // maincontent controller, show add screen
      addLayout.on('show', function(view){
        addLayout.add_term_form.show(new TermsApp.Views.AddTermFormView({ collection: Accents.terms }));

        var termsListLayout = new TermsApp.Views.TermsListLayout();
        var filteredListView = new TermsApp.Views.FilteredTermsView({ collection: Accents.terms });
        termsListLayout.on('show', function(view){
            termsListLayout.add_term_list_table.show(new TermsApp.Views.TermsView({ collection: Accents.terms }));
            termsListLayout.add_term_list_total.show(new TermsApp.Views.TotalTermsView({ collection: Accents.terms }));
            termsListLayout.add_term_filtered_table.show(filteredListView);
            Accents.terms.on('change remove', function(){
              filteredListView.off();
              termsListLayout.add_term_filtered_table.close();
              filteredListView.remove();
              var tmp = new TermsApp.Views.FilteredTermsView({ collection: Accents.terms });
              termsListLayout.add_term_filtered_table.show(tmp);
	      filteredListView = tmp;
            });
        });
        addLayout.add_terms_list.show(termsListLayout);
      });

      Accents.terms.fetch({
        success: function(){
          TermsApp.refValue = Accents.terms.last();
          if( TermsApp.refValue ){
            TermsApp.refValue = TermsApp.refValue.get("ref");
          }
          Accents.terms.sort();
          Accents.main.show(addLayout);
        }
      });
    }
  };
});
