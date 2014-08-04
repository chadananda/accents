Accents.module("TermsApp", function(TermsApp, Accents, Backbone, Marionette, $, _){
  //replacing the new <functions/views> into variables
  // AddTermFormView = new TermsApp.Views.AddTermFormView();
  // TermsListLayout = new TermsApp.Views.TermsListLayout();
  // FilteredListView = new TermsApp.Views.FilteredTermsView();
  // TermsView = new TermsApp.Views.TermsView();

  TermsApp.Controller = {
    termsList: function(){
      Accents.main.show(new TermsApp.Views.WaitingDataView());


      
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
            console.log(Accents.terms);
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
      try{
        if(Accents.Entities.Preload.models.length > 0)
        {
          Accents.terms = Accents.Entities.Preload;
          // Accents.terms.trigger("fetch");
          console.log(Accents.terms);
          TermsApp.refValue = Accents.terms.last();
          if( TermsApp.refValue ){
            TermsApp.refValue = TermsApp.refValue.get("ref");
          }
          Accents.terms.sort();
          Accents.main.show(addLayout);
        }else{
          Accents.on("fetch:preload",function(data){
            Accents.terms = data;
            console.log(Accents.terms);
            TermsApp.refValue = Accents.terms.last();
            if( TermsApp.refValue ){
              TermsApp.refValue = TermsApp.refValue.get("ref");
            }
            Accents.terms.sort();
            Accents.main.show(addLayout);
          });
        }
      }catch(error){
        // Accents.Entities.Preload.fetch({
        //   success:function(){
        //     Accents.terms = Accents.Entities.Preload;
        //     TermsApp.refValue = Accents.terms.last();
        //     if( TermsApp.refValue ){
        //       TermsApp.refValue = TermsApp.refValue.get("ref");
        //     }
        //     Accents.terms.sort();
        //     Accents.main.show(addLayout);
        //   }
        // });
        Accents.on("fetch:preload",function(data){
          Accents.terms = data;
          console.log(Accents.terms);
          TermsApp.refValue = Accents.terms.last();
          if( TermsApp.refValue ){
            TermsApp.refValue = TermsApp.refValue.get("ref");
          }
          Accents.terms.sort();
          Accents.main.show(addLayout);
        });
      }
      Accents.Entities.Preload.fetch({
        success:function(){
          //debugger;
          console.log("triggerring fetch:preload");
          console.log(Accents.Entities.Preload);
          Accents.trigger("fetch:preload",Accents.Entities.Preload);
        }
      });
    }
  };
});
