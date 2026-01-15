define(["dojo/_base/declare",
        "btl/widgets/base/DataGrid",
        "dojo/_base/lang"],
        function(declare, DataGrid, lang) {
   return declare([DataGrid], {
	   
	   title: "Типы ссылок",
	   Url: "search/linktype",
	   colModel: [ ],
		             
	   postMixInProperties: function alfresco_LinkTypeDataGrid__postMixInProperties() {
		      this.inherited(arguments);
		      this.alfSubscribe("DATAGRID_DELETE_LINK_TYPE", lang.hitch(this, this.deleteLinkType),true);
		      this.alfSubscribe("DATAGRID_GET_LINK_TYPE_DATA", lang.hitch(this, this.getLinkTypeData), true);
	   },
		             
	   deleteLinkType: function alfresco_LinkTypeDataGrid__deleteLinkType(){
        	 var arr = this.grid.pqGrid("selection", { type: 'row', method: 'getSelection' });
        	 if (arr && arr.length > 0) {
        		 var row = arr[0].rowData;
        		 var payload = {};

        		 payload.requiresConfirmation = true;
        		 payload.confirmationTitle = "Удаление типа";
        		 payload.confirmationPrompt = "Вы действительно хотите удалить: " + row.name +" ?";
        		 payload.url = "slingshot/datalists/list/node/" + row.nodeRef.replace("://", "/");
        		 payload.responseTopic = "DATAGRID_DELETE_ROW_FROM_STORE",   	   	  

        		 this.alfPublish("ALF_CRUD_DELETE", payload, true);   
        		 
        		 this.alfLog("log", "alfresco_LinkTypeDataGrid__deleteLinkType", row);
        	 } 
		 },
		 
		 getLinkTypeData: function alfresco_LinkTypeDataGrid__getLinkTypeData(){
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
	            	data.config.formSubmissionTopic = "BTL_EDIT_LINK_TYPE";
	            	this.alfPublish("BTL_CREATE_FORM_LINK_TYPE", data, true);
	            }
	   }
   });
});