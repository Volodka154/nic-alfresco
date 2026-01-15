define(["dojo/_base/declare",
        "btl/widgets/base/DataGrid",
        "dojo/_base/lang"],
        function(declare, DataGrid, lang) {
   return declare([DataGrid], {
   	   
	   Url: "history/getAllhistoryEventCategory",
	   colModel: [ ],
	   filterModel: { on: true, mode: "AND", header: true },
  	  		             
	   postMixInProperties: function alfresco_historyEventCategoryDataGrid__postMixInProperties() {
		      this.inherited(arguments);
		     	     		      
	   },
	   
	   setEventsDataGrid: function alfresco_DataGrid__setEventsDataGrid(){
		   document.historyEvent = this;
           this.grid.pqGrid({
               rowDblClick: function( event, ui ) {
                              	   
            	   document.historyEventRow = ui;
            	   Alfresco.util.Ajax.jsonPost({
                       url: "/share/proxy/alfresco/api/node/"+ ui.rowData.nodeRef.replace("://", "/") +"/formprocessor",
                       dataObj: {
                    	   "prop_btl-historyEventCategory_actionOn":!ui.rowData.on
                        },
	       				successCallback: {
	    					fn: function () {
	    						document.historyEventRow.rowData.on = !document.historyEventRow.rowData.on;
	    						if (document.historyEventRow.rowData.on)
    							{
	    							document.historyEventRow.rowData.onImg = "&#9745;";
    							}
	    						else
    							{
	    							document.historyEventRow.rowData.onImg = "&#9937;";
    							}
  								    						
	    						
	    						document.historyEvent.grid.pqGrid("refreshDataAndView");
	    					}
	    				}
       				});
            	   
            	               	   
            	   
               }
           });
      },
	   
	   loadDataToDataGrid: function alfresco_DataGrid__loadDataToDataGrid(response, originalRequestConfig){	
		    
		   response.items.forEach(function(item, i, arr) {
			   if (item.on == true){
				   response.items[i].onImg = "&#9745;"
			   }
			   else {
				   response.items[i].onImg = "&#9937;"
			   }
			   

	   			   			   
			 });
		    this.setDataDataGrid(response.items);
		}
	   
	   
		
   });
});






