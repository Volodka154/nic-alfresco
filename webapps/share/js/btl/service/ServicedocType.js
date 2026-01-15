define(["dojo/_base/declare",
        "alfresco/core/Core",
        "dojo/_base/lang",
        "alfresco/core/CoreXhr",
        "service/constants/Default"],
        function(declare, Core, lang, CoreXhr, AlfConstants) {

  return declare([Core, CoreXhr], {
	  
    newDoc_type: {}, 

    constructor: function btl_Doc_typeService__constructor(args) {
      lang.mixin(this, args);
      this.alfSubscribe("BTL_CREATE_DOC_TYPE", lang.hitch(this, this.createDoc_type));
      this.alfSubscribe("BTL_EDIT_DOC_TYPE", lang.hitch(this, this.editDoc_type));
      this.alfSubscribe("BTL_CREATE_FORM_DOC_TYPE", lang.hitch(this, this.onCreateFormDoc_type));
            
    },
    
    
    
    createDoc_type: function btl_Doc_typeService__createDoc_type(payload) {
    	
    	
    	
    	this.alfLog("log", "btl_Doc_typeService__createDoc_type", payload);
    	
    	this.newDoc_type.name = payload["prop_btl-docType_name"]; 
    	this.newDoc_type.type = payload["prop_btl-docType_type"]; 
    	

    	this.serviceXhr({
    	    url: "/share/proxy/alfresco/api/type/btl-docType%3adocTypeData/formprocessor",
    	    method: "POST",
    	    data: {
    	         "alf_destination": payload.alf_destination,
    	         "prop_btl-docType_name": payload["prop_btl-docType_name"],
        		 "prop_btl-docType_type": payload["prop_btl-docType_type"]
    	      },
    	    successCallback: this.updateDoc_typeGrid,
    	    callbackScope: this
    	  });
    	},
    	
    updateDoc_typeGrid: function btl_Doc_typeService__updateDoc_typeGrid(response, originalRequestConfig){
    	this.newDoc_type.nodeRef = response.persistedObject;
    	
    	this.alfPublish("DATAGRID_ADD_ROW",{
    		nodeRef: this.newDoc_type.nodeRef,
    		name: this.newDoc_type.name,   	
    		type: this.newDoc_type.type    		
    	});
    	
 	    	    	    	
    },
    
    
    
    editDoc_type: function btl_Doc_typeService__editDoc_type(payload) {
    	
    	this.alfLog("log", "btl_Doc_typeService__editDoc_type", payload);
    	
    	this.newDoc_type.rowId = payload["rowId"];
    	this.newDoc_type.name = payload["prop_btl-docType_name"]; 
    	this.newDoc_type.type = payload["prop_btl-docType_type"];    	    	
    	
    	this.serviceXhr({
    	    url: "/share/proxy/alfresco/api/node/"+ payload.nodeRef.replace("://", "/") +"/formprocessor",
    	    method: "POST",
    	    data: {
   	         "prop_btl-docType_name": payload["prop_btl-docType_name"],   	        
    		 "prop_btl-docType_type": payload["prop_btl-docType_type"]
   	      },
    	    successCallback: this.alfPublish("DATAGRID_EDIT_ROW", this.newDoc_type),
    	    callbackScope: this
    	  });
    },
    
       
	   onCreateFormDoc_type: function alfresco_formDoc_type__onCreateFormDoc_type(data){
		   	  this.alfLog("log", "alfresco_formDoc_type__onCreateFormDoc_type", data);
		   
		   	  this.data = data.data;
		   	 
		   	  this.rootNodeRef = data.rootNodeRef;
		   	  var payload = {};    	  
	    	  
	    	  payload.dialogTitle = data.config.dialogTitle;
	    	  payload.dialogConfirmationButtonTitle = data.config.dialogConfirmationButtonTitle;
	    	  payload.dialogCancellationButtonTitle = data.config.dialogCancellationButtonTitle;
	    	  payload.formSubmissionTopic = data.config.formSubmissionTopic;
	    	  payload.widgets = this.getWidgets();
	    	  
	    	  this.alfLog("log", "alfresco_formDoc_type__onCreateFormDoc_type", payload);
	    	  this.alfPublish("ALF_CREATE_FORM_DIALOG_REQUEST", payload);
	   },
	   
	   getWidgets: function alfresco_formDoc_type__getWidgets(){
		   
		   var optionsType = [
		                     	{value:"Входящий", label:"Входящий"},
		                     	{value:"Исходящий", label:"Исходящий"},
		                     	{value:"Внутренний", label:"Внутренний"},
		                     	{value:"НТД", label:"НТД"},
		                     	{value:"Мероприятие", label:"Мероприятие"},
		                     	{value:"ОРД", label:"ОРД"},
		                     	{value:"Договор", label:"Договор"}
		                     	
		                    ];
		   
		   var widgets = [
	{
	   name: "alfresco/forms/controls/Select",
	   config: {
		  label:  "Тип",
	      name: "prop_btl-docType_type",
	      value: (this.data !== null) ? this.data.type : "",
	      optionsConfig: {
	    	  fixed: optionsType
	    	}
	   }
	},
		                  {
       	    name: "alfresco/forms/controls/DojoValidationTextBox",
    	    id:"btl-docType_name",
    	    config: {
    	       label: "Название",
    	       name: "prop_btl-docType_name",
    	       value: (this.data !== null) ? this.data.name : "" , 
    	       requirementConfig: {
    	          initialValue: true
    	       }
    	    }
    	 }
    		 ];
		   
		   if(this.data !== null){
			   widgets.push( {
					name: "alfresco/forms/controls/DojoValidationTextBox",
				      config: {
				         name: "nodeRef",
				         value: this.data.nodeRef,
				         visibilityConfig: {
				            initialValue: false
				         }
				      }
				},
				{
					name: "alfresco/forms/controls/DojoValidationTextBox",
				      config: {
				         name: "rowId",
				         value: this.data.rowId,
				         visibilityConfig: {
				            initialValue: false
				         }
				      }
				});
		   }
		   else{
			   widgets.push( {
					name: "alfresco/forms/controls/DojoValidationTextBox",
				      config: {
				         name: "alf_destination",
				         value: this.rootNodeRef,
				         visibilityConfig: {
				            initialValue: false
				         }
				      }
				});
		   }
		   return widgets;
	   }
    
  });
});