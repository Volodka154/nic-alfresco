define(["dojo/_base/declare",
        "btl/widgets/base/DataGrid",
        "dojo/_base/lang"],
        function(declare, DataGrid, lang) {
   return declare([DataGrid], {
	   
	   title: "Список должностей",
	   Url: "search/position",
	   colModel: [ ],
  	  		             
	   postMixInProperties: function alfresco_PositionDataGrid__postMixInProperties() {
		      this.inherited(arguments);
		      this.alfSubscribe("DATAGRID_DELETE_POSITION", lang.hitch(this, this.deletePosition), true);
		      this.alfSubscribe("DATAGRID_GET_POSITION_DATA", lang.hitch(this, this.getPositionData), true);		     		      
	   },

	   deletePosition: function alfresco_PositionDataGrid__deletePosition(){		   		  
		   
        	 var arr = this.grid.pqGrid("selection", { type: 'row', method: 'getSelection' });
        	 if (arr && arr.length > 0) {
        		 var row = arr[0].rowData;          
        		 var payload = {};

        		 payload.requiresConfirmation = true;
        		 payload.confirmationTitle = "Удаление должности";
        		 payload.confirmationPrompt = "Вы действительно хотите удалить: " + row.name +" ?";
        		 payload.url = "slingshot/datalists/list/node/" + row.nodeRef.replace("://", "/");
        		 payload.responseTopic = "DATAGRID_DELETE_ROW_FROM_STORE",   	   	  

        		 this.alfPublish("ALF_CRUD_DELETE", payload, true );   
      		         		        		 
        		 this.alfLog("log", "alfresco_PositionDataGrid__deletePosition", row);    
        		
        		 
        	 }
		 },
		 
		 		 
		 getPositionData: function alfresco_PositionDataGrid__getPositionData(){
				var arr = this.grid.pqGrid("selection", { type: 'row', method: 'getSelection' });											
	            if (arr && arr.length > 0) {
	            	var row = arr[0].rowData; 
	            	var item = {};
	            	item.config = {};
	            	item.data = row;
	            	item.data.rowId = arr[0].rowIndx;
	            	item.config.dialogTitle = "formPosition.title";
	            	item.config.dialogConfirmationButtonTitle = "edit.title";
	            	item.config.dialogCancellationButtonTitle = "cancel.title";
	            	item.config.formSubmissionTopic = "BTL_EDIT_POSITION";
	            	this.alfPublish("BTL_CREATE_FORM_POSITION", item, true);
	            	this.alfLog("log", "alfresco_PositionDataGrid__getPositionData", row);
	            }
	   }	   	   
   });
});






