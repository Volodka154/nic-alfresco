define(["dojo/_base/declare",
        "btl/widgets/base/DataGrid",
        "dojo/_base/lang"],
        function(declare, DataGrid, lang) {
   return declare([DataGrid], {
	   
	   title: "Шаблоны вложений",
	   Url: "/documents/getfileContainers?docType=all",
	   colModel: [ ],	   
	   type:"btl-fileContainer%3afileContainerData",	 
	   
		             
	   postMixInProperties: function alfresco_fileContainerDataGrid__postMixInProperties() {
		      this.inherited(arguments);
		      this.alfSubscribe("DATAGRID_ADD_fileContainer", lang.hitch(this, this.onCreateFormlinkType),true);
		      this.alfSubscribe("DATAGRID_DELETE_fileContainer", lang.hitch(this, this.deletefileContainer),true);
		      
		      this.alfSubscribe("DATAGRID_ADD_fileContainerSubmit", lang.hitch(this, this.addfileContainer),true);		      		      
		      
	   },
     
	   addfileContainer: function(payload){
		   this.data = payload;
		   
		   this.serviceXhr({
	    	    url: "/share/proxy/alfresco/api/type/"+ this.type +"/formprocessor",
	    	    method: "POST",
	    	    data: this.data,
	    	    successCallback: this.updateLinkTypeGrid,
	    	    callbackScope: this
	    	  });
		   
		   
	   },
	   
	   updateLinkTypeGrid: function btl_LinkTypeService__updateLinkTypeGrid(response, originalRequestConfig){
	    	
		   this.alfPublish("DATAGRID_ADD_ROW", {"nodeRef": response.persistedObject,    										 
	    										 "name": originalRequestConfig.data["prop_btl-fileContainer_name"]
	    										 }, true);
		   
		   
		   this.showTemplate(response.persistedObject);
		   
		    		   		   
		   
	    },
	    
	    showTemplate:function(id)
	    {
	    			
	    	
	    	if (document.fileContainerDialog == null)
	    	{
	    		var dialog = new YAHOO.widget.SimpleDialog("fileContainer_view" , {
	    			width: "1150px",
	    			height:"95vh",
    		        fixedcenter: true,
    		        modal: true,
    		        visible: false,
    		        draggable: true,
    				zIndex:10	    				
    		    });	 
    	    	
	    		document.fileContainerDialog =  dialog;
	    	}
		   
		   var bodyDialog = document.createElement('iframe');
		   
		   bodyDialog.width = "100%";
		   bodyDialog.height = "100%";
		   bodyDialog.src = "/share/page/btl-edit-metadata?nodeRef=" + id;		   
		   
		   document.fileContainerDialog.setBody(bodyDialog);
		   
		   document.fileContainerDialog.render(document.body);
		   document.fileContainerDialog.show();
		   var iframe = document.getElementsByTagName('iframe')[0];

		   var iframeDoc = iframe.contentWindow.document;
		   iframeDoc.fileContainerDialog = document.fileContainerDialog;
	    },
	   
	   
	   
	   deletefileContainer: function alfresco_fileContainerDataGrid__deletefileContainer(){
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
        	 } 
		 },		 		 
	   
	   setEventsDataGrid: function alfresco_DataGrid__setEventsDataGrid(){
	    	this.grid.pqGrid({	    		
	    	    rowDblClick: function( event, ui ) {	  
	    	    	
	    	    	if (document.fileContainerDialog == null)
	    	    	{
	    	    		var dialog = new YAHOO.widget.SimpleDialog("fileContainer_view" , {
	    	    			width: "1150px",
	    	    			height:"95vh",
		    		        fixedcenter: true,
		    		        modal: true,
		    		        visible: false,
		    		        draggable: true,
		    				zIndex:10	    				
		    		    });	 
		    	    	
	    	    		document.fileContainerDialog =  dialog;
	    	    	}
    	    		
	    		   var bodyDialog = document.createElement('iframe');	    		   
	    		   bodyDialog.width = "100%";
	    		   bodyDialog.height = "100%";
	    		   bodyDialog.src = "/share/page/btl-edit-metadata?nodeRef=" + ui.rowData.nodeRef;		   
	    		   
	    		   document.fileContainerDialog.setBody(bodyDialog);
	    		   
	    		   document.fileContainerDialog.render(document.body);
	    		   document.fileContainerDialog.show();	
	    		   
	    		   var iframe = document.getElementsByTagName('iframe')[0];

	    		   var iframeDoc = iframe.contentWindow.document;
	    		   iframeDoc.fileContainerDialog = document.fileContainerDialog;
	    	    	
	    	    }
	    	});
		},
		
		 onCreateFormlinkType: function (){			  
		   	    var payload = {};	    	    
	    	    
	    	    payload.dialogTitle = "Добавить шаблон";
	    	    payload.dialogConfirmationButtonTitle = "Сохранить";
	    	    payload.dialogCancellationButtonTitle = "Отмена";
	    	    payload.formSubmissionTopic = "DATAGRID_ADD_fileContainerSubmit";
	    	    payload.widgets = this.getWidgets();
	    	  
	    	  this.alfPublish("ALF_CREATE_FORM_DIALOG_REQUEST", payload, true);
		   },
		
		 getWidgets: function alfresco_formLinkType__getWidgets(){
			   
			   var widgets = [		 
				 {
		  		   name: "alfresco/forms/controls/DojoValidationTextBox",
		  		   config: {
		  			  label:  "Название",
		  		      name: "prop_btl-fileContainer_name",
		  		      value: ""		  		     
		  		   }
		  		},
		  		{
					name: "alfresco/forms/controls/DojoValidationTextBox",
				      config: {
				         name: "alf_destination",
				         value: this.rootNodeRef,
				         visibilityConfig: {
				            initialValue: false
				         }
				      }
				}
		  		
			 ];
			   
		   
			   
			   return widgets;
		   }
   });
});