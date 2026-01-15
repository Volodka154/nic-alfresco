define(["dojo/_base/declare",
        "alfresco/core/Core",
        "dojo/_base/lang",
        "alfresco/core/CoreXhr",
        "service/constants/Default"],
        function(declare, Core, lang, CoreXhr, AlfConstants) {

  return declare([Core, CoreXhr], {
	  
    data: {},
    rootNodeRef: null,
    type: "btl-prStatus%3aProjectStatus-content",

    constructor: function btl_EmployeeService__constructor(args) {
      lang.mixin(this, args);
      this.alfSubscribe("BTL_CREATE_PROJECT_STATUS", lang.hitch(this, this.createProjectStatus));
      this.alfSubscribe("BTL_CREATE_FORM_PROJECT_STATUS", lang.hitch(this, this.onCreateFormprojectStatus));
      this.alfSubscribe("BTL_EDIT_PROJECT_STATUS", lang.hitch(this, this.editProjectStatus));
    },
    
    createProjectStatus: function btl_createProjectStatusService__createProjectStatus(payload) {
    	this.alfLog("log", "btl_createProjectStatusService__createProjectStatus", payload);
    	this.data = payload;
    	//this.data.name = payload["prop_btl-prStatus_status"];
    	//this.data.color = payload["prop_btl-prStatus_color"];
    	
    	this.serviceXhr({
    	    url: "/share/proxy/alfresco/api/type/"+ this.type +"/formprocessor",
    	    method: "POST",
    	    data: this.data,
    	    successCallback: this.updateProjectStatusGrid,
    	    callbackScope: this
    	  });
    	},
    	
    updateProjectStatusGrid: function btl_ProjectStatusService__updateProjectStatusGrid(response, originalRequestConfig){
    	this.alfLog("log", "btl_ProjectStatusService__updateProjectStatusGrid", originalRequestConfig);
    	
    	var statusName = "stat";
    	if (originalRequestConfig.data["prop_btl-prStatus_status"] == "0"){statusName = "Заявка"}
		if (originalRequestConfig.data["prop_btl-prStatus_status"] == "1"){statusName = "НТС"}
		if (originalRequestConfig.data["prop_btl-prStatus_status"] == "2"){statusName = "Утверждение"}
		if (originalRequestConfig.data["prop_btl-prStatus_status"] == "3"){statusName = "Реализация"}
		if (originalRequestConfig.data["prop_btl-prStatus_status"] == "4"){statusName = "Завершение"}
    	
    	
    	this.alfPublish("DATAGRID_ADD_ROW", {"nodeRef": response.persistedObject,
    										 "celColor":"<div style='background: "+originalRequestConfig.data["prop_btl-prStatus_color"]+"; height: 14px;'></div>",
    										 "color": originalRequestConfig.data["prop_btl-prStatus_color"],
    										 "name": originalRequestConfig.data["prop_btl-prStatus_status"],
    										 "statusName":statusName
    										 });
    },
    
    editProjectStatus: function btl_ProjectStatusService__editProjectStatus(payload) {
    	
    	this.alfLog("log", "btl_ProjectStatusService__editProjectStatus", payload);
    	
    	var statusName = "stat";
    	if (payload["prop_btl-prStatus_status"] == "0"){statusName = "Заявка"}
		if (payload["prop_btl-prStatus_status"] == "1"){statusName = "НТС"}
		if (payload["prop_btl-prStatus_status"] == "2"){statusName = "Утверждение"}
		if (payload["prop_btl-prStatus_status"] == "3"){statusName = "Реализация"}
		if (payload["prop_btl-prStatus_status"] == "4"){statusName = "Завершение"}
    	
    	this.serviceXhr({
    	    url: "/share/proxy/alfresco/api/node/"+ payload.nodeRef.replace("://", "/") +"/formprocessor",
    	    method: "POST",
    	    data: payload,
    	    successCallback: this.alfPublish("DATAGRID_EDIT_ROW", {"rowId": payload["rowId"],
    	    													   "celColor":"<div style='background: "+payload["prop_btl-prStatus_color"]+"; height: 14px;'></div>",
    	    													   "color": payload["prop_btl-prStatus_color"],
    	    													   "name": payload["prop_btl-prStatus_status"],
    	    													   "statusName":statusName
    	    													   
    	    }),
    	    callbackScope: this
    	  });
    },
    
	   onCreateFormprojectStatus: function alfresco_formProjectStatus__onCreateFormprojectStatus(data){
		    this.alfLog("log", "alfresco_formProjectStatus__onCreateFormprojectStatus", data);
		   	
	    	this.data = data.data;	
	    	this.rootNodeRef = data.rootNodeRef;
	   	    var payload = {};
    	    
    	    
    	    payload.dialogTitle = data.config.dialogTitle;
    	    payload.dialogConfirmationButtonTitle = data.config.dialogConfirmationButtonTitle;
    	    payload.dialogCancellationButtonTitle = data.config.dialogCancellationButtonTitle;
    	    payload.formSubmissionTopic = data.config.formSubmissionTopic;
    	    payload.widgets = this.getWidgets();
    	  
    	  this.alfLog("log", "alfresco_formProjectStatus__onCreateFormprojectStatus", payload);
    	  this.alfPublish("ALF_CREATE_FORM_DIALOG_REQUEST", payload);
	   },
	   
	   projectStatusOptions: [{value:0, label:"Заявка"},
			                     {value:1, label:"НТС"},
			                     {value:2, label:"Утверждение"},
			                     {value:3, label:"Реализация"},
			                     {value:4, label:"Завершение"}
			                     ], 
	   
	   getProjectStatusByValue: function alfresco_formProjectStatus__getProjectStatusByValue(value){
		      
			   if (value != null)
			   {
				   for (var i = 0; i < this.projectStatusOptions.lenght; i++)
				   {
					   if (value == this.projectStatusOptions[i].value)
					   {
						   return this.projectStatusOptions[i].label;
					   }
				   }
			   }
			   return '';
	   },
	   
	   getWidgets: function alfresco_formProjectStatus__getWidgets(){
		   
		   var widgets = [		 
			 {
	  		   name: "alfresco/forms/controls/Select",
	  		   config: {
	  			  label:  "prop_btl-prStatus_status.title",
	  		      name: "prop_btl-prStatus_status",
	  		      value: (this.data !== null) ? this.data.name : "",
	  		      optionsConfig: {
	  		    	  fixed: this.projectStatusOptions
	  		    	}
	  		   }
	  		},
		 {
			 name: "btl/widgets/base/ColorPalette",
			 config: {
			    label: "prop_btl-prStatus_color.title",
			    name: "prop_btl-prStatus_color",
			    value: (this.data !== null) ? this.data.color : "",
			    
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