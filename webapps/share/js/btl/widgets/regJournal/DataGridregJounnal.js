define(["dojo/_base/declare",
        "btl/widgets/base/DataGrid",
        "dojo/_base/lang"],
        function(declare, DataGrid, lang) {
   return declare([DataGrid], {
	   
	   title: "Список журналов регистрации",
	   Url: "search/regJournal",
	   colModel: [ ],
  	  		             
	   postMixInProperties: function alfresco_regJournalDataGrid__postMixInProperties() {
		      this.inherited(arguments);
		      this.alfSubscribe("DATAGRID_DELETE_REG_JOURNAL", lang.hitch(this, this.deleteregJournal), true);
		      this.alfSubscribe("DATAGRID_GET_REG_JOURNAL_DATA", lang.hitch(this, this.getregJournalData), true);		     		      
	   },
	   
	   
	   	   
	   
		             
	   deleteregJournal: function alfresco_regJournalDataGrid__deleteregJournal(){		   		  
		   
        	 var arr = this.grid.pqGrid("selection", { type: 'row', method: 'getSelection' });
        	 if (arr && arr.length > 0) {
        		 var row = arr[0].rowData;          
        		 var payload = {};

        		 payload.requiresConfirmation = true;
        		 payload.confirmationTitle = "Удаление журнала";
        		 payload.confirmationPrompt = "Вы действительно хотите удалить: " + row.name +" ?";
        		 payload.url = "slingshot/datalists/list/node/" + row.nodeRef.replace("://", "/");
        		 payload.responseTopic = "DATAGRID_DELETE_ROW_FROM_STORE",   	   	  

        		 this.alfPublish("ALF_CRUD_DELETE", payload, true );   
      		         		        		 
        		 this.alfLog("log", "alfresco_regJournalDataGrid__deleteregJournal", row);    
        		
        		 
        	 }      	  
        	 
        	 
		 },
		 
		 		 
		 getregJournalData: function alfresco_regJournalDataGrid__getregJournalData(){
				var arr = this.grid.pqGrid("selection", { type: 'row', method: 'getSelection' });											
	            if (arr && arr.length > 0) {
	            	var row = arr[0].rowData; 
	            	var item = {};
	            	item.config = {};
	            	item.data = row;
	            	item.data.rowId = arr[0].rowIndx;
	            	item.config.dialogTitle = "Редактировать журнал";
	            	item.config.dialogConfirmationButtonTitle = "edit.title";
	            	item.config.dialogCancellationButtonTitle = "cancel.title";
	            	item.config.formSubmissionTopic = "BTL_EDIT_REG_JOURNAL";
	            	this.alfPublish("BTL_CREATE_FORM_REG_JOURNAL", item, true);
	            	this.alfLog("log", "alfresco_regJournalDataGrid__getregJournalData", row);
	            }
	            
	            
	   }
		 ,
	   loadDataToDataGrid: function alfresco_DataGrid__loadDataToDataGrid(response, originalRequestConfig){	
		    
		   response.items.forEach(function(item, i, arr) {
			   if (item.doctype == "0"){response.items[i].typeName = "Входящий"}
			   if (item.doctype == "1"){response.items[i].typeName = "Исходящий"}	
			   if (item.doctype == "2"){response.items[i].typeName = "Внутренний"}
			   if (item.doctype == "3"){response.items[i].typeName = "НТД"}
			   if (item.doctype == "4"){response.items[i].typeName = "Дело проекта"}
			   if (item.doctype == "5"){response.items[i].typeName = "Мероприятие"}
			   if (item.doctype == "6"){response.items[i].typeName = "ОРД"}
			   if (item.doctype == "7"){response.items[i].typeName = "Договор"}

			   
			   if (item.isDraft){
				   	response.items[i].isDraft = '<input type="checkbox"  checked disabled">';
					response.items[i].isDraftBool = true;
			   }
			   else{
				   response.items[i].isDraft = '<input type="checkbox"  disabled>';
				   response.items[i].isDraftBool = false
			   }
	   			   	
				   
				   //
			 });
		    this.setDataDataGrid(response.items);
		},
		
		
   });
});






