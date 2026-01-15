define(["dojo/_base/declare",
        "btl/widgets/base/DataGrid",
        "dojo/_base/lang"],
        function(declare, DataGrid, lang) {
   return declare([DataGrid], {
	   
	   title: "Шаблоны проектов",
	   Url: "projects/getProjectTemplates",
	   colModel: [ ],
		             
	   postMixInProperties: function alfresco_projectTemplateDataGrid__postMixInProperties() {
		      this.inherited(arguments);
		      this.alfSubscribe("DATAGRID_DELETE_projectTemplate", lang.hitch(this, this.deleteprojectTemplate),true);
	   },
     
	   deleteprojectTemplate: function alfresco_projectTemplateDataGrid__deleteprojectTemplate(){
        	 var arr = this.grid.pqGrid("selection", { type: 'row', method: 'getSelection' });
        	 if (arr && arr.length > 0) {
        		 var row = arr[0].rowData;
        		 var payload = {};

        		 payload.requiresConfirmation = true;
        		 payload.confirmationTitle = "Удаление шаблона";
        		 payload.confirmationPrompt = "Подтвердите удаление";
        		 payload.url = "slingshot/datalists/list/node/" + row.nodeRef.replace("://", "/");
        		 payload.responseTopic = "DATAGRID_DELETE_ROW_FROM_STORE"; 	   	  
        		 this.alfPublish("ALF_CRUD_DELETE", payload, true);          		 
        		 this.alfLog("log", "alfresco_projectTemplateDataGrid__deleteprojectTemplate", row);
        	 } 
		 },		 		 
	   
	   setEventsDataGrid: function alfresco_DataGrid__setEventsDataGrid(){
	    	this.grid.pqGrid({
	    	    rowDblClick: function( event, ui ) {
	    	    	window.open("/share/page/btl-edit-metadata?nodeRef="+ui.rowData.nodeRef, '_blank');
	    	    	 require(["dojo/topic"], function(topic){
	                    	topic.publish("ALF_DISPLAY_NOTIFICATION", {  message: "Перенаправление на карточку проекта."});
	    	    	 });
	    	    }
	    	});
		},
   });
});