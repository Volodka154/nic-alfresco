define(["dojo/_base/declare",
        "alfresco/core/Core",
        "dojo/_base/lang",
        "alfresco/core/CoreXhr",
        "service/constants/Default"],
        function(declare, Core, lang, CoreXhr, AlfConstants) {

  return declare([Core, CoreXhr], {
	  
    data: {},
    rootNodeRef: null,
    type: "btl-link%3alinkType",

    constructor: function btl_EmployeeService__constructor(args) {
      lang.mixin(this, args);
      this.alfSubscribe("BTL_CREATE_LINK_TYPE", lang.hitch(this, this.createLinkType));
      this.alfSubscribe("BTL_CREATE_FORM_LINK_TYPE", lang.hitch(this, this.onCreateFormlinkType));
      this.alfSubscribe("BTL_EDIT_LINK_TYPE", lang.hitch(this, this.editLinkType));
    },
    
    createLinkType: function btl_createLinkTypeService__createLinkType(payload) {
    	this.alfLog("log", "btl_createLinkTypeService__createLinkType", payload);
    	this.data = payload;
    	this.data.name = payload["prop_btl-link_name"];
    	//this.data.color = payload["prop_btl-prStatus_color"];
    	
    	this.serviceXhr({
    	    url: "/share/proxy/alfresco/api/type/"+ this.type +"/formprocessor",
    	    method: "POST",
    	    data: this.data,
    	    successCallback: this.updateLinkTypeGrid,
    	    callbackScope: this
    	  });
    	},
    	
    updateLinkTypeGrid: function btl_LinkTypeService__updateLinkTypeGrid(response, originalRequestConfig){
    	this.alfLog("log", "btl_LinkTypeService__updateLinkTypeGrid", originalRequestConfig);
    	
    
    	
    	
    	this.alfPublish("DATAGRID_ADD_ROW", {"nodeRef": response.persistedObject,    										 
    										 "name": originalRequestConfig.data["prop_btl-link_name"]
    										 });
    },
    
    editLinkType: function btl_LinkTypeService__editLinkType(payload) {
    	
    	this.alfLog("log", "btl_LinkTypeService__editLinkType", payload);
    	
    	
    	
    	this.serviceXhr({
    	    url: "/share/proxy/alfresco/api/node/"+ payload.nodeRef.replace("://", "/") +"/formprocessor",
    	    method: "POST",
    	    data: payload,
    	    successCallback: this.alfPublish("DATAGRID_EDIT_ROW", {"rowId": payload["rowId"],
    	    													   "name": payload["prop_btl-link_name"]
    	    													   
    	    }),
    	    callbackScope: this
    	  });
    },
    
	   onCreateFormlinkType: function alfresco_formLinkType__onCreateFormlinkType(data){
		    this.alfLog("log", "alfresco_formLinkType__onCreateFormLinkType", data);
		   	
	    	this.data = data.data;	
	    	this.rootNodeRef = data.rootNodeRef;
	   	    var payload = {};
    	    
    	    
    	    payload.dialogTitle = data.config.dialogTitle;
    	    payload.dialogConfirmationButtonTitle = data.config.dialogConfirmationButtonTitle;
    	    payload.dialogCancellationButtonTitle = data.config.dialogCancellationButtonTitle;
    	    payload.formSubmissionTopic = data.config.formSubmissionTopic;
    	    payload.widgets = this.getWidgets();
    	  
    	  this.alfLog("log", "alfresco_formLinkType__onCreateFormLinkType", payload);
    	  this.alfPublish("ALF_CREATE_FORM_DIALOG_REQUEST", payload);
	   },
	   
	  
	   
	   getWidgets: function alfresco_formLinkType__getWidgets(){
		   
		   var widgets = [		 
			 {
	  		   name: "alfresco/forms/controls/DojoValidationTextBox",
	  		   config: {
	  			  label:  "Название",
	  		      name: "prop_btl-link_name",
	  		      value: (this.data !== null) ? this.data.name : ""
	  		     
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