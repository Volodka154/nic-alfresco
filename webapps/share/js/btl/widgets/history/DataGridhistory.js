define(["dojo/_base/declare",
        "btl/widgets/base/DataGrid",
        "dojo/_base/lang"],
        function(declare, DataGrid, lang) {
   return declare([DataGrid], {
   	   
	   Url: "history/getAllHistory",
	   colModel: [ ],
	   filterModel: { on: true, mode: "AND", header: true },
  	  		             
	   postMixInProperties: function alfresco_historyDataGrid__postMixInProperties() {
		      this.inherited(arguments);
		     	     		      
	   },
	   
	   loadDataToDataGrid: function alfresco_DataGrid__loadDataToDataGrid(response, originalRequestConfig){	
		    
		   response.items.forEach(function(item, i, arr) {
			 
			   if (item["mainObject-ref"])
				   response.items[i]["mainObject-ref"] = "<a href='/alfresco/s/admin/admin-nodebrowser?query=" + item["mainObject-ref"] +"'>Cсылка</a>";
			  
			 });
		    this.setDataDataGrid(response.items);
		}
	   
	   
		
   });
});






