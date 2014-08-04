Accents.module("TermsApp", function(TermsApp, Accents, Backbone, Marionette, $, _){
  //replacing the new <functions/views> into variables
  // AddTermFormView = new TermsApp.Views.AddTermFormView();
  // TermsListLayout = new TermsApp.Views.TermsListLayout();
  // FilteredListView = new TermsApp.Views.FilteredTermsView();
  // TermsView = new TermsApp.Views.TermsView();

  TermsApp.Controller = {
    termsList: function(){
      Accents.main.show(new TermsApp.Views.WaitingDataView());

      try{
        if(Accents.Entities.Preload.models.length > 0)
        {
          Accents.terms = Accents.Entities.Preload;
          debugger;
          Accents.terms.trigger("fetch");
        }else{
          Accents.Entities.Preload.fetch({
            success:function(){
              Accents.terms = Accents.Entities.Preload;
              TermsApp.refValue = Accents.terms.last();
              if( TermsApp.refValue ){
                TermsApp.refValue = TermsApp.refValue.get("ref");
              }
              Accents.terms.sort();
              Accents.main.show(addLayout);
            }
          });
        }
      }catch(error){
        Accents.Entities.Preload.fetch({
          success:function(){
            Accents.terms = Accents.Entities.Preload;
            TermsApp.refValue = Accents.terms.last();
            if( TermsApp.refValue ){
              TermsApp.refValue = TermsApp.refValue.get("ref");
            }
            Accents.terms.sort();
            Accents.main.show(addLayout);
          }
        });
      }      
      
      console.log(Accents.terms);
      //debugger;
      var addLayout = new TermsApp.Views.AddTermMainLayout();

      // maincontent controller, show add screen
      addLayout.on('show', function(view){
        console.log("addLayout show triggered");

        
        //debugger;
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
    }
  };
});
