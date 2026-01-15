define(["dojo/_base/declare",
        "btl/widgets/base/DataGrid",
        "dojo/_base/lang"],
        function(declare, DataGrid, lang) {
   return declare([DataGrid], {

	   title: "",
	   Url: "search/taskResolution",
	   colModel: [ ],

	   postMixInProperties: function alfresco_taskResolutionDataGrid__postMixInProperties() {
		      this.inherited(arguments);
		      this.alfSubscribe("DATAGRID_DELETE_taskResolution", lang.hitch(this, this.deletetaskResolution),true);
		      this.alfSubscribe("DATAGRID_GET_taskResolution_DATA", lang.hitch(this, this.gettaskResolutionData), true);
	   },

	   deletetaskResolution: function alfresco_taskResolutionDataGrid__deletetaskResolution(){
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

        		 this.alfLog("log", "alfresco_taskResolutionDataGrid__deletetaskResolution", row);
        	 }
		 },

		 gettaskResolutionData: function alfresco_taskResolutionDataGrid__gettaskResolutionData(){
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
	            	data.config.formSubmissionTopic = "BTL_EDIT_taskResolution";
	            	this.alfPublish("BTL_CREATE_FORM_taskResolution", data, true);
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
			   if (item.taskType == "5"){response.items[i].taskTypeName = "Задание по НТД"}			   
			   if (item.taskType == "6"){response.items[i].taskTypeName = "Задание по делу проекта"}
			   if (item.taskType == "7"){response.items[i].taskTypeName = "Задание по мероприятию"}
			   if (item.taskType == "8"){response.items[i].taskTypeName = "Задание по ОРД"}				   
			   if (item.taskType == "9"){response.items[i].taskTypeName = "Задание по договору"}


			 });
		    this.setDataDataGrid(response.items);
		},
   });
});