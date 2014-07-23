Accents.module("TermsApp", function(TermsApp, Accents, Backbone, Marionette, $, _){
  //replacing the new <functions/views> into variables
  // AddTermFormView = new TermsApp.Views.AddTermFormView();
  // TermsListLayout = new TermsApp.Views.TermsListLayout();
  // FilteredListView = new TermsApp.Views.FilteredTermsView();
  // TermsView = new TermsApp.Views.TermsView();

  TermsApp.Controller = {
    termsList: function(){
      Accents.main.show(new TermsApp.Views.WaitingDataView());

      Accents.terms = new Accents.Entities.Terms(); //execution of request
      Accents.DBpage = new Accents.Entities.DBpage();
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
        termsListLayout.add_term_list_table.on("show",function(view){
            Accents.Entities.requestMoreFlag=true;//meaning ready to accept further loadmore triggers
            var maxHeight = $("#terms-table").height();
            var childHeight = $("#terms-table div:nth-child(1)").height();
            $("#terms-table").scroll(TermsApp.Controller.scrollCheck);
            console.log("assigning scroll location value");
            if(Accents.Entities.currTermsPos["oldmaxHeight"] == undefined)
            {
              Accents.Entities.currTermsPos={};
              Accents.Entities.currTermsPos["oldmaxHeight"] = maxHeight;
              Accents.Entities.currTermsPos["oldchildHeight"] = childHeight;
              Accents.Entities.currTermsPos["oldscrollTop"] = Number($("#terms-table").scrollTop());
              Accents.Entities.currTermsPos["currentPos"] = Number(maxHeight)+Number($("#terms-table").scrollTop());
            }
            if(Accents.Entities.currTermsPos["oldchildHeight"]!=childHeight)
            {
              $("#terms-table").scrollTop(Accents.Entities.currTermsPos["oldscrollTop"]);
              Accents.Entities.currTermsPos["oldchildHeight"]=childHeight;
            }
        });
        
        //console.log("afterRender terms-list-table-template");
        addLayout.add_terms_list.show(termsListLayout);
      });

      Accents.terms.fetch({
        success: function(){
          //debugger;
          // TermsApp.refValue = Accents.terms.last();
          // if( TermsApp.refValue ){
          //   TermsApp.refValue = TermsApp.refValue.get("ref");
          // }
          //Accents.terms.sort();
          Accents.main.show(addLayout);
          Accents.DBpage = new Accents.Entities.DBpage();

          Accents.DBpage.fetch({
            success:function() {
              //debugger;
              TermsApp.refValue = Accents.DBpage.last();
              if( TermsApp.refValue ){
                TermsApp.refValue = TermsApp.refValue.get("ref");
              }
              $("#book-ref").val(TermsApp.refValue);
              //debugger;
            }
          });
        }
      });
      //load more information
      Accents.on("loadmore",function(){
        if(Accents.Entities.lastrowsLength>0 && (Number(Accents.Entities.TotalTermsView)>(Number(Accents.Entities.currPos) + Number(Accents.Entities.limit))))
        {
          if(Accents.Entities.limit!=Accents.Entities.limitorig)//check
          {
            Accents.Entities.limit = Number(Accents.Entities.limitorig);
          }
          Accents.Entities.currPos = Number(Accents.Entities.currPos) + Number(Accents.Entities.limit);
          if(Number(Accents.Entities.TotalTermsView)<(Number(Accents.Entities.currPos) + Number(Accents.Entities.limit)))
          {
            var newDiff = Number(Accents.Entities.TotalTermsView) - (Number(Accents.Entities.currPos) + Number(Accents.Entities.limit));
            Accents.Entities.limit = Number(newDiff);
          }
          console.log("fetching records : "+Accents.Entities.currPos+" -> "+(Accents.Entities.currPos+Accents.Entities.limit));
          var newInfo = Backbone.Collection.extend({
              model: Accents.Entities.Term,
              sync: BackbonePouch.sync({
                db: PouchDB('accents'),
                fetch: 'query',
                options: {
                  query: {
                    include_docs: true,
                    fun: "entities_terms",
                    // fun:{
                    //   map: function(doc) {
                    //     if (doc.type === 'term') {
                    //       emit(doc.position, null)
                    //     }
                    //   }
                    // },
                    limit: Accents.Entities.limit,
                    skip: Accents.Entities.currPos
                  }
                }
              }),
              comparator: 'term',
              sort_key: "term",

              parse: function(result) {
                console.log("parser collection");
                console.log("Entities.limit : "+Accents.Entities.limit+" Entities.currPos : "+Accents.Entities.currPos);
                console.log("From terms controller");
                console.log(result);
                //check if returned items 
                // check if the total_rows 
                Accents.Entities.lastrowsLength = result.rows.length;
                Accents.Entities.TotalTermsView = result.total_rows;
                return _.pluck(result.rows, 'doc');
              },

             comparator: function(a, b){
               a = Accents.Utils.dotUndersRevert( a.get(this.sort_key) );
               b = Accents.Utils.dotUndersRevert( b.get(this.sort_key) );
               return a > b ?  1 : a < b ? -1 : 0;
             }

          });
          var myold = new newInfo();
          console.log(myold);
          //debugger;
          myold.fetch({
            success: function(){
              //Merge old with Accents.terms
              //debugger;
              myold.models.forEach(function(terms){
                Accents.terms.models.push(terms);
              });
              //replacement
              //Accents.terms = old;
              // TermsApp.refValue = Accents.terms.last();
              // if( TermsApp.refValue ){
              //   TermsApp.refValue = TermsApp.refValue.get("ref");
              // }
              //Accents.terms.sort();
              Accents.main.show(addLayout);

            }
          });
        }
      });
    },
    scrollCheck:function(){
      var maxHeight = $("#terms-table").height();
      var childHeight = $("#terms-table div:nth-child(1)").height();
      //debugger;
      //initialize  Accents.Entities.currTermsPos
      if(Accents.Entities.currTermsPos["oldchildHeight"]!=childHeight)
      {
        $("#terms-table").scrollTop(Accents.Entities.currTermsPos["oldscrollTop"]);
        Accents.Entities.currTermsPos["oldchildHeight"]=childHeight;
      }
      Accents.Entities.currTermsPos["currentPos"] = Number(maxHeight)+Number($("#terms-table").scrollTop());
      Accents.Entities.currTermsPos["oldscrollTop"] = Number($("#terms-table").scrollTop());
      //console.log("checking scroll : curPos - "+Accents.Entities.currTermsPos["currentPos"]+" childHeight - "+childHeight);
      if(Accents.Entities.currTermsPos["currentPos"]>=(childHeight*0.65))
      {
        console.log("triggerring loadmore -> currPosPage "+Accents.Entities.currPos);
        Accents.trigger("loadmore");
      }
    }
  };
});
