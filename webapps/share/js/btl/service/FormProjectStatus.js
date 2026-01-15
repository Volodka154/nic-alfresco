define(["dojo/_base/declare",
        "alfresco/core/Core",
        "dojo/_base/lang",
        "alfresco/services/DialogService"
        ],
        function(declare, Core, lang, DialogService ) {

   return declare([Core], {
	   
	   projectStatus: null,
	   
	   constructor: function alfresco_formProjectStatus__registerSubscriptions(args) {
		   lang.mixin(this, args);
		   this.alfSubscribe("BTL_CREATE_FORM_PROJECT_STATUS", lang.hitch(this, this.onCreateFormprojectStatus));
	   },
	   
	   onCreateFormprojectStatus: function alfresco_formProjectStatus__onCreateFormprojectStatus(data){
		   this.alfLog("log", "alfresco_formProjectStatus__onCreateFormprojectStatus", data);
		   	  this.contactor = data.contactor;
		   	  this.nodeRefContactor = (typeof data.formSubmissionPayloadMixin == "undefined") ? null : data.formSubmissionPayloadMixin.alf_destination;
	    	  var payload = {};    	  
	    	  
	    	  payload.dialogTitle = data.config.dialogTitle;
	    	  payload.dialogConfirmationButtonTitle = data.config.dialogConfirmationButtonTitle;
	    	  payload.dialogCancellationButtonTitle = data.config.dialogCancellationButtonTitle;
	    	  payload.formSubmissionTopic = data.config.formSubmissionTopic;
	    	  payload.widgets = this.getWidgets();
	    	  
	    	  this.alfLog("log", "alfresco_formProjectStatus__onCreateFormprojectStatus", payload);
	    	  this.alfPublish("ALF_CREATE_FORM_DIALOG_REQUEST", payload);
	   },
	   
	   getWidgets: function alfresco_formProjectStatus__getWidgets(){
		   		   
		   var widgets = [
		 {
			 name: "alfresco/forms/controls/DojoValidationTextBox",
			 config: {
			    label: "prop_btl-prStatus_status.title",
			    name: "prop_btl-prStatus_status",
			    value: (this.projectStatus !== null) ? this.projectStatus.name : "",
			    
			    }
		 },
		 {
			 name: "btl/widgets/base/ColorPalette",
			 config: {
			    label: "prop_btl-prStatus_status.title",
			    name: "prop_btl-prStatus_status",
			    value: (this.projectStatus !== null) ? this.projectStatus.name : "",
			    
			    }
		 },
		                  ];
		   
		   return widgets;
	   }
	   
   });
});