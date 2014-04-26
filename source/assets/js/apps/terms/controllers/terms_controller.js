Accents.module("TermsApp", function(TermsApp, Accents, Backbone, Marionette, $, _){
  TermsApp.Controller = {
    termsList: function(){
      Accents.terms = new Accents.Entities.Terms();
      var addLayout = new TermsApp.Views.AddTermMainLayout();
      //Accents.terms.fetch();
      var term_list_defer = Accents.request("term:entities");


    // maincontent controller, show add screen
      addLayout.on('show', function(view){
        addLayout.add_term_form.show(new TermsApp.Views.AddTermFormView({ collection: Accents.terms }));
        //addLayout.add_remove_links.show(new TermsApp.Views.TempLinksView({ collection: Accents.terms }));

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

      term_list_defer.then(function(data){
	var lastRefValue = "";
        _.each(data.rows, function(row){
          if(row.doc && row.doc.type && row.doc.type == 'term'){
            Accents.terms.add(row.doc);
            lastRefValue = row.doc.ref;
          }
        });
        TermsApp.refValue = lastRefValue;
        Accents.terms.sort();
        Accents.main.show(addLayout);
      });

      // replace with layout
      // then move to navbar controller
      //Accents.navbar.show(new NavLinksBoss({  })); // replace this with layout
    }
  };
});
