define(["dojo/_base/declare",
        "alfresco/core/Core",
        "dojo/_base/lang",
        "alfresco/services/DialogService"
        ],
        function(declare, Core, lang, DialogService ) {

   return declare([Core], {
	   
	   linkType: null,
	   
	   constructor: function alfresco_formLinkType__registerSubscriptions(args) {
		   lang.mixin(this, args);
		   this.alfSubscribe("BTL_CREATE_FORM_LINK_TYPE", lang.hitch(this, this.onCreateFormlinkType));
	   },
	   
	   onCreateFormlinkType: function alfresco_formLinkType__onCreateFormlinkType(data){
		   this.alfLog("log", "alfresco_formLinkType__onCreateFormlinkType", data);
		   	  this.contactor = data.contactor;
		   	  this.nodeRefContactor = (typeof data.formSubmissionPayloadMixin == "undefined") ? null : data.formSubmissionPayloadMixin.alf_destination;
	    	  var payload = {};    	  
	    	  
	    	  payload.dialogTitle = data.config.dialogTitle;
	    	  payload.dialogConfirmationButtonTitle = data.config.dialogConfirmationButtonTitle;
	    	  payload.dialogCancellationButtonTitle = data.config.dialogCancellationButtonTitle;
	    	  payload.formSubmissionTopic = data.config.formSubmissionTopic;
	    	  payload.widgets = this.getWidgets();
	    	  
	    	  this.alfLog("log", "alfresco_formLinkType__onCreateFormlinkType", payload);
	    	  this.alfPublish("ALF_CREATE_FORM_DIALOG_REQUEST", payload);
	   },
	   
	   getWidgets: function alfresco_formLinkType__getWidgets(){
		   		   
		   var widgets = [
		 {
			 name: "alfresco/forms/controls/DojoValidationTextBox",
			 config: {
			    label: "prop_btl-link_name.title",
			    name: "prop_btl-link_name",
			    value: (this.linkType !== null) ? this.linkType.name : "",
			    
			    }
		 }
		                  ];
		   
		   return widgets;
	   }
	   
   });
});