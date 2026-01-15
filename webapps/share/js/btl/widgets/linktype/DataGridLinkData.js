define(["dojo/_base/declare",
        "btl/widgets/base/DataGrid",
        "dojo/_base/lang"],
        function(declare, DataGrid, lang) {
   return declare([DataGrid], {
	   
	   title: "Типы ссылок",
	   Url: "search/linkdata",
	   colModel: [ ],
		             
	   postMixInProperties: function alfresco_LinkDataDataGrid__postMixInProperties() {
		      this.inherited(arguments);
		      this.alfSubscribe("DATAGRID_DELETE_LINK_DATA", lang.hitch(this, this.deleteLinkData),true);
		      this.alfSubscribe("DATAGRID_GET_LINK_DATA_DATA", lang.hitch(this, this.getLinkDataData), true);
	   },

       setEventsDataGrid: function alfresco_DataGrid__setEventsDataGrid(){
       	        var groupModel = {
                   				dataIndx : [ "docType_text" ],
                   				collapsed : [ true, true ],
                  				title : [ "<b style='font-weight:bold;'>{0} ({1})</b>"],
                   				dir : [ "up", "down" ]
                   			};
                //this.grid.pqGrid( "option", "groupModel", groupModel );
       },

	   deleteLinkData: function alfresco_LinkDataDataGrid__deleteLinkData(){
        	 var arr = this.grid.pqGrid("selection", { type: 'row', method: 'getSelection' });
        	 if (arr && arr.length > 0) {
        		 var row = arr[0].rowData;
        		 var payload = {};

        		 payload.requiresConfirmation = true;
        		 payload.confirmationTitle = "Удаление ссылки";
        		 payload.confirmationPrompt = "Подтвердите удаление";
        		 payload.url = "slingshot/datalists/list/node/" + row.nodeRef.replace("://", "/");
        		 payload.responseTopic = "DATAGRID_DELETE_ROW_FROM_STORE",   	   	  

        		 this.alfPublish("ALF_CRUD_DELETE", payload, true);   
        		 
        		 this.alfLog("log", "alfresco_LinkDataDataGrid__deleteLinkData", row);
        	 } 
		 },
		 
		 getLinkDataData: function alfresco_LinkDataDataGrid__getLinkDataData(){
				var arr = this.grid.pqGrid("selection", { type: 'row', method: 'getSelection' });
	            if (arr && arr.length > 0) {
	            	var row = arr[0].rowData; 
	            	var data = {};
	            	data.config = {};
	            	data.data = row;
	            	data.data.rowId = arr[0].rowIndx;
	            	data.config.dialogTitle = "Редактировать";
	            	data.config.dialogConfirmationButtonTitle = "edit.title";
	            	data.config.dialogCancellationButtonTitle = "cancel.title";
	            	data.config.formSubmissionTopic = "BTL_EDIT_LINK_DATA";
	            	this.alfPublish("BTL_CREATE_FORM_LINK_DATA", data, true);
	            }
	   }
   });
});