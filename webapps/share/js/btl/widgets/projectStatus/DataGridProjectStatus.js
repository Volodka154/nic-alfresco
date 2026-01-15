define(["dojo/_base/declare",
        "btl/widgets/base/DataGrid",
        "dojo/_base/lang"],
        function(declare, DataGrid, lang) {
   return declare([DataGrid], {
	   
	   title: "",
	   Url: "search/status",
	   colModel: [ ],
		             
	   postMixInProperties: function alfresco_ContactPersonDataGrid__postMixInProperties() {
		      this.inherited(arguments);
		      this.alfSubscribe("DATAGRID_DELETE_PROJECT_STATUS", lang.hitch(this, this.deleteProjectStatus),true);
		      this.alfSubscribe("DATAGRID_GET_PROJECT_STATUS_DATA", lang.hitch(this, this.getProjectStatus), true);
	   },
		             
	   deleteProjectStatus: function alfresco_ContactPersonDataGrid__deleteContactPerson(){
        	 var arr = this.grid.pqGrid("selection", { type: 'row', method: 'getSelection' });
        	 if (arr && arr.length > 0) {
        		 var row = arr[0].rowData;
        		 var payload = {};

        		 payload.requiresConfirmation = true;
        		 payload.confirmationTitle = "Удаление статуса";
        		 payload.confirmationPrompt = "Вы действительно хотите удалить: " + row.statusName +" ?";
        		 payload.url = "slingshot/datalists/list/node/" + row.nodeRef.replace("://", "/");
        		 payload.responseTopic = "DATAGRID_DELETE_ROW_FROM_STORE",   	   	  

        		 this.alfPublish("ALF_CRUD_DELETE", payload, true);   
        		 
        		 this.alfLog("log", "alfresco_ContactPersonDataGrid__deleteContactPerson", row);
        	 } 
		 },
		 
	   getProjectStatus: function alfresco_ContactPersonDataGrid__getContactPersonData(){
				var arr = this.grid.pqGrid("selection", { type: 'row', method: 'getSelection' });
	            if (arr && arr.length > 0) {
	            	var row = arr[0].rowData; 
	            	var data = {};
	            	data.config = {};
	            	data.data = row;
	            	data.data.rowId = arr[0].rowIndx;
	            	data.config.dialogTitle = "formCreateProjectStatus.title.label";
	            	data.config.dialogConfirmationButtonTitle = "edit.title";
	            	data.config.dialogCancellationButtonTitle = "cancel.title";
	            	data.config.formSubmissionTopic = "BTL_EDIT_PROJECT_STATUS";
	            	this.alfPublish("BTL_CREATE_FORM_PROJECT_STATUS", data, true);
	            }
	   },
	   
	   loadDataToDataGrid: function alfresco_DataGrid__loadDataToDataGrid(response, originalRequestConfig){	
		    
		   response.items.forEach(function(item, i, arr) {
			   response.items[i].celColor =  "<div style='background: " + item.color+"; height: 14px;'></div>";
			   if (item.name == "0"){response.items[i].statusName = "Заявка"}
			   if (item.name == "1"){response.items[i].statusName = "НТС"}
			   if (item.name == "2"){response.items[i].statusName = "Утверждение"}
			   if (item.name == "3"){response.items[i].statusName = "Реализация"}
			   if (item.name == "4"){response.items[i].statusName = "Завершение"}			   
			 });
		    this.setDataDataGrid(response.items);
		},
   });
});