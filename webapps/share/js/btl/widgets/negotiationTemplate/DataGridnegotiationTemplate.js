define(["dojo/_base/declare",
        "btl/widgets/base/DataGrid",
        "dojo/_base/lang"],
        function(declare, DataGrid, lang) {
   return declare([DataGrid], {
	   
	   title: "Шаблоны согласований",
	   Url: "/documents/getNegotiationTemplates?docType=all",
	   colModel: [ ],	   
	   type:"btl-negotiation%3alistDataType",	   
		             
	   postMixInProperties: function alfresco_negotiationTemplateDataGrid__postMixInProperties() {
		      this.inherited(arguments);
		      this.alfSubscribe("DATAGRID_ADD_negotiationTemplate", lang.hitch(this, this.onCreateFormlinkType),true);
		      this.alfSubscribe("DATAGRID_DELETE_negotiationTemplate", lang.hitch(this, this.deletenegotiationTemplate),true);
		      
		      this.alfSubscribe("DATAGRID_ADD_negotiationTemplateSubmit", lang.hitch(this, this.addnegotiationTemplate),true);		      		      
		      
	   },
     
	   addnegotiationTemplate: function(payload){
		   this.data = payload;
		   //this.data.name = payload["prop_btl-negotiation_name"];
		   this.data["prop_btl-negotiation_isTemplate"] = true;	
		   
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
	    										 "name": originalRequestConfig.data["prop_btl-negotiation_name"]
	    										 }, true);
		   
		   
		   this.showTemplate(response.persistedObject);
		   
		    		   		   
		   
	    },
	    
	    showTemplate:function(id)
	    {
	    			
	    	
	    	if (document.negotiationTemplateDialog == null)
	    	{
	    		var dialog = new YAHOO.widget.SimpleDialog("negotiationTemplate_view" , {
	    			width: "1450px",
	    			height:"95vh",
    		        fixedcenter: true,
    		        modal: true,
    		        visible: false,
    		        draggable: true,
    				zIndex:10	    				
    		    });	 
    	    	
	    		document.negotiationTemplateDialog =  dialog;
	    	}
		   
		   var bodyDialog = document.createElement('iframe');
		   
		   bodyDialog.width = "100%";
		   bodyDialog.height = "100%";
		   bodyDialog.src = "/share/page/btl-edit-metadata?nodeRef=" + id;		   
		   
		   document.negotiationTemplateDialog.setBody(bodyDialog);
		   
		   document.negotiationTemplateDialog.render(document.body);
		   document.negotiationTemplateDialog.show();
		   var iframe = document.getElementsByTagName('iframe')[0];

		   var iframeDoc = iframe.contentWindow.document;
		   iframeDoc.negotiationTemplateDialog = document.negotiationTemplateDialog;
	    },
	   
	   
	   
	   deletenegotiationTemplate: function alfresco_negotiationTemplateDataGrid__deletenegotiationTemplate(){
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
	    	    	
	    	    	if (document.negotiationTemplateDialog == null)
	    	    	{
	    	    		var dialog = new YAHOO.widget.SimpleDialog("negotiationTemplate_view" , {
	    	    			width: "1450px",
	    	    			height:"95vh",
		    		        fixedcenter: true,
		    		        modal: true,
		    		        visible: false,
		    		        draggable: true,
		    				zIndex:10	    				
		    		    });	 
		    	    	
	    	    		document.negotiationTemplateDialog =  dialog;
	    	    	}
    	    		
	    		   var bodyDialog = document.createElement('iframe');	    		   
	    		   bodyDialog.width = "100%";
	    		   bodyDialog.height = "100%";
	    		   bodyDialog.src = "/share/page/btl-edit-metadata?nodeRef=" + ui.rowData.nodeRef;		   
	    		   
	    		   document.negotiationTemplateDialog.setBody(bodyDialog);
	    		   
	    		   document.negotiationTemplateDialog.render(document.body);
	    		   document.negotiationTemplateDialog.show();	
	    		   
	    		   var iframe = document.getElementsByTagName('iframe')[0];

	    		   var iframeDoc = iframe.contentWindow.document;
	    		   iframeDoc.negotiationTemplateDialog = document.negotiationTemplateDialog;
	    	    	
	    	    }
	    	});
		},
		
		 onCreateFormlinkType: function (){			  
		   	    var payload = {};	    	    
	    	    
	    	    payload.dialogTitle = "Добавить шаблон";
	    	    payload.dialogConfirmationButtonTitle = "Сохранить";
	    	    payload.dialogCancellationButtonTitle = "Отмена";
	    	    payload.formSubmissionTopic = "DATAGRID_ADD_negotiationTemplateSubmit";
	    	    payload.widgets = this.getWidgets();
	    	  
	    	  this.alfPublish("ALF_CREATE_FORM_DIALOG_REQUEST", payload, true);
		   },
		
		 getWidgets: function alfresco_formLinkType__getWidgets(){
			   
			   var widgets = [		 
				 {
		  		   name: "alfresco/forms/controls/DojoValidationTextBox",
		  		   config: {
		  			  label:  "Название",
		  		      name: "prop_btl-negotiation_name",
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