define(["dojo/_base/declare",
        "btl/widgets/base/DataGrid",
        "dojo/_base/lang"],
        function(declare, DataGrid, lang) {
   return declare([DataGrid], {
	   
	   title: "Список видов документов",
	   Url: "search/docType",
	   colModel: [ ],
  	  
	   pageModel: { type: "local", rPP: 500, strRpp: "{0}" , rPPOptions:[100, 250, 500] },
	   
	   postMixInProperties: function alfresco_doc_TypeDataGrid__postMixInProperties() {
		      this.inherited(arguments);
		      this.alfSubscribe("DATAGRID_DELETE_DOC_TYPE", lang.hitch(this, this.deletedoc_Type), true);
		      this.alfSubscribe("DATAGRID_GET_DOC_TYPE_DATA", lang.hitch(this, this.getdoc_TypeData), true);	
		     
	   },
	   
	   
	   setEventsDataGrid: function alfresco_DataGrid__setEventsDataGrid(){
	        var groupModel = {
            				dataIndx : [ "type" ],
            				collapsed : [ true, true ],
            				title : [ "<b style='font-weight:bold;'>{0} ({1})</b>", "{0} - {1}" ],
            				dir : [ "up", "down" ]
            			};
            this.grid.pqGrid( "option", "groupModel", groupModel );
            
            var _this = this;
            this.grid.pqGrid({
                rowDblClick: function( event, ui ) {
                    _this.getdoc_TypeData();
                }
            });
       },
	   
		             
	   deletedoc_Type: function alfresco_doc_TypeDataGrid__deletedoc_Type(){		   		  
		   
        	 var arr = this.grid.pqGrid("selection", { type: 'row', method: 'getSelection' });
        	 if (arr && arr.length > 0) {
        		 var row = arr[0].rowData;          
        		 var payload = {};

        		 payload.requiresConfirmation = true;
        		 payload.confirmationTitle = "Удаление вида";
        		 payload.confirmationPrompt = "Вы действительно хотите удалить: " + row.name +" ?";
        		 payload.url = "slingshot/datalists/list/node/" + row.nodeRef.replace("://", "/");
        		 payload.responseTopic = "DATAGRID_DELETE_ROW_FROM_STORE",   	   	  

        		 this.alfPublish("ALF_CRUD_DELETE", payload, true );   
      		         		        		 
        		 this.alfLog("log", "alfresco_doc_TypeDataGrid__deletedoc_Type", row);    
        		
        		 
        	 }      	  
        	 
        	 
		 },
		 
		
		 		 
		 getdoc_TypeData: function alfresco_doc_TypeDataGrid__getdoc_TypeData(){
				var arr = this.grid.pqGrid("selection", { type: 'row', method: 'getSelection' });											
	            if (arr && arr.length > 0) {
	            	var row = arr[0].rowData; 
	            	var item = {};
	            	item.config = {};
	            	item.data = row;
	            	item.data.rowId = arr[0].rowIndx;
	            	item.config.dialogTitle = "Редактировать вид";
	            	item.config.dialogConfirmationButtonTitle = "edit.title";
	            	item.config.dialogCancellationButtonTitle = "cancel.title";
	            	item.config.formSubmissionTopic = "BTL_EDIT_DOC_TYPE";
	            	this.alfPublish("BTL_CREATE_FORM_DOC_TYPE", item, true);
	            	this.alfLog("log", "alfresco_doc_TypeDataGrid__getdoc_TypeData", row);
	            }
	            
	            
	   }
   });
});






