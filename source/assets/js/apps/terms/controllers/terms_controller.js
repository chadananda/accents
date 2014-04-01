Accents.module("TermsApp", function(TermsApp, Accents, Backbone, Marionette, $, _){
  TermsApp.Controller = {
    termsList: function(){
      Accents.terms = new Accents.Entities.Terms();
      Accents.terms.fetch();
      // maincontent controller, show add screen
      var addLayout = new TermsApp.Views.AddTermMainLayout();
      addLayout.on('show', function(view){
        addLayout.add_term_form.show(new TermsApp.Views.AddTermFormView({ collection: Accents.terms }));
        addLayout.add_remove_links.show(new TermsApp.Views.TempLinksView({ collection: Accents.terms }));

        var termsListLayout = new TermsApp.Views.TermsListLayout();
        termsListLayout.on('show', function(view){
            termsListLayout.add_term_list_table.show(new TermsApp.Views.TermsView({ collection: Accents.terms }));
            termsListLayout.add_term_list_total.show(new TermsApp.Views.TotalTermsView({ collection: Accents.terms }));
        });
        addLayout.add_terms_list.show(termsListLayout);
      });


      // replace with layout
      // then move to navbar controller
      //Accents.navbar.show(new NavLinksBoss({  })); // replace this with layout
      Accents.main.show(addLayout);
    }
  };
});
