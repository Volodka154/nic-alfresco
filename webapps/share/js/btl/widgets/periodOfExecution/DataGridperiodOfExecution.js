define(["dojo/_base/declare",
        "btl/widgets/base/DataGrid",
        "dojo/_base/lang"],
        function(declare, DataGrid, lang) {
   return declare([DataGrid], {
	   
	   title: "",
	   Url: "search/periodOfExecution",
	   colModel: [ ],
		             
	   postMixInProperties: function alfresco_periodOfExecutionDataGrid__postMixInProperties() {
		      this.inherited(arguments);
		      this.alfSubscribe("DATAGRID_DELETE_periodOfExecution", lang.hitch(this, this.deleteperiodOfExecution),true);
		      this.alfSubscribe("DATAGRID_GET_periodOfExecution_DATA", lang.hitch(this, this.getperiodOfExecutionData), true);
	   },
		             
	   deleteperiodOfExecution: function alfresco_periodOfExecutionDataGrid__deleteperiodOfExecution(){
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
        		 
        		 this.alfLog("log", "alfresco_periodOfExecutionDataGrid__deleteperiodOfExecution", row);
        	 } 
		 },
		 
		 getperiodOfExecutionData: function alfresco_periodOfExecutionDataGrid__getperiodOfExecutionData(){
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
	            	data.config.formSubmissionTopic = "BTL_EDIT_periodOfExecution";
	            	this.alfPublish("BTL_CREATE_FORM_periodOfExecution", data, true);
	            }
	   },
	   loadDataToDataGrid: function alfresco_DataGrid__loadDataToDataGrid(response, originalRequestConfig){	
		    
		   response.items.forEach(function(item, i, arr) {
			   if (item.dayType == "0"){response.items[i].dayTypeName = "Рабочий"}
			   if (item.dayType == "1"){response.items[i].dayTypeName = "Календарный"}			   

			   if (item.taskType == "0"){response.items[i].taskTypeName = "Резолюция по Входящему"}
			   if (item.taskType == "1"){response.items[i].taskTypeName = "Задание по Исходящему"}
			   if (item.taskType == "2"){response.items[i].taskTypeName = "Резолюция по Внутреннему"}
			   if (item.taskType == "3"){response.items[i].taskTypeName = "Задание по Проекту"}
			   if (item.taskType == "4"){response.items[i].taskTypeName = "Инициативное задание"}
			   if (item.taskType == "5"){response.items[i].taskTypeName = "Задание по НТД задание"}
			   
			   
			   if(item.arm == true) response.items[i].star = '&#9733';
   				else response.items[i].star = '&#9734;';	
			   
			 });
		    this.setDataDataGrid(response.items);
		},
   });
});