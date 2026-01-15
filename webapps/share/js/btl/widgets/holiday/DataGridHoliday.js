define(["dojo/_base/declare",
        "btl/widgets/base/DataGrid",
        "dojo/_base/lang"],
        function(declare, DataGrid, lang) {
   return declare([DataGrid], {
	   
	   title: "Список выходных и переносов",
	   Url: "search/holiday",
	   colModel: [ ],
  	  		             
	   postMixInProperties: function alfresco_HolidayDataGrid__postMixInProperties() {
		      this.inherited(arguments);
		      this.alfSubscribe("DATAGRID_DELETE_HOLIDAY", lang.hitch(this, this.deleteHoliday), true);
		      this.alfSubscribe("DATAGRID_GET_HOLIDAY_DATA", lang.hitch(this, this.getHolidayData), true);		     		      
	   },
	   
	   
	   	   
	   
		             
	   deleteHoliday: function alfresco_HolidayDataGrid__deleteHoliday(){		   		  
		   
        	 var arr = this.grid.pqGrid("selection", { type: 'row', method: 'getSelection' });
        	 if (arr && arr.length > 0) {
        		 var row = arr[0].rowData;          
        		 var payload = {};

        		 payload.requiresConfirmation = true;
        		 payload.confirmationTitle = "Удаление";
        		 payload.confirmationPrompt = "Подтвердите удаление";
        		 payload.url = "slingshot/datalists/list/node/" + row.nodeRef.replace("://", "/");
        		 payload.responseTopic = "DATAGRID_DELETE_ROW_FROM_STORE",   	   	  

        		 this.alfPublish("ALF_CRUD_DELETE", payload, true );   
      		         		        		 
        		 this.alfLog("log", "alfresco_HolidayDataGrid__deleteHoliday", row);    
        		
        		 
        	 }      	  
        	 
        	 
		 },
		 
		 		 
		 getHolidayData: function alfresco_HolidayDataGrid__getHolidayData(){
				var arr = this.grid.pqGrid("selection", { type: 'row', method: 'getSelection' });											
	            if (arr && arr.length > 0) {
	            	var row = arr[0].rowData; 
	            	var item = {};
	            	item.config = {};
	            	item.data = row;
	            	item.data.rowId = arr[0].rowIndx;
	            	item.config.dialogTitle = "formHoliday.title";
	            	item.config.dialogConfirmationButtonTitle = "edit.title";
	            	item.config.dialogCancellationButtonTitle = "cancel.title";
	            	item.config.formSubmissionTopic = "BTL_EDIT_HOLIDAY";
	            	this.alfPublish("BTL_CREATE_FORM_HOLIDAY", item, true);
	            	this.alfLog("log", "alfresco_HolidayDataGrid__getHolidayData", row);
	            }
	            
	            
	   }	   	   
   });
});






