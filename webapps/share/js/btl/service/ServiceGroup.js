define(["dojo/_base/declare",
        "alfresco/core/Core",
        "dojo/_base/lang",
        "alfresco/core/CoreXhr",
        "service/constants/Default"],
        function(declare, Core, lang, CoreXhr, AlfConstants) {

  return declare([Core, CoreXhr], {
	  
    data: {}, 

    constructor: function btl_GroupService__constructor(args) {
      lang.mixin(this, args);
      this.alfSubscribe("BTL_CREATE_GROUP", lang.hitch(this, this.createGroup));
      this.alfSubscribe("BTL_EDIT_GROUP", lang.hitch(this, this.editGroup));
      this.alfSubscribe("BTL_CREATE_FORM_GROUP", lang.hitch(this, this.onCreateFormGroup));
      this.alfSubscribe("BTL_SING_REMOVE_GROUP", lang.hitch(this, this.signRemoveGroup));
    },
       
    createGroup: function btl_GroupService__createGroup(payload) {
    	this.alfLog("log", "btl_GroupService__createGroup", payload);
    	
    	this.data = payload;
    	this.data["prop_cm_name"] = payload["prop_btl-group_name"];
    	this.serviceXhr({
    	    url: "/share/proxy/alfresco/api/type/btl-group%3agroup-folder/formprocessor",
    	    method: "POST",
    	    data: this.data,
    	    successCallback: this.updataGroup,
    	    callbackScope: this
    	  });
    	},
    
    editGroup: function btl_GroupService__editGroup(payload) {
    	
    	this.alfLog("log", "btl_GroupService__editGroup", payload);
    	
    	this.data = payload;
    	this.data["prop_cm_name"] = payload["prop_btl-group_name"];
    	this.serviceXhr({
    	    url: "/share/proxy/alfresco/api/node/"+ payload.nodeRef.replace("://", "/") +"/formprocessor",
    	    method: "POST",
    	    data: this.data,
    	    successCallback: this.alfPublish("TREE_EDIT_NODE_ATTRIBUTE",{ attribute: {name: "name", value: payload["prop_btl-group_name"]}}),
    	    callbackScope: this
    	  });
    },
    
    updataGroup: function btl_GroupService__updataGroup(response, originalRequestConfig) {
    	this.alfLog("log", "btl_GroupService__updataGroup response", response);
    	this.alfLog("log", "btl_GroupService__updataGroup originalRequestConfig", originalRequestConfig);
    	
    	var newItem = {};
    	newItem.id = response.persistedObject;
    	newItem.parent = originalRequestConfig.data.alf_destination;
    	newItem.name = originalRequestConfig.data.prop_cm_name;
    	
    	originalRequestConfig.data.nodeRef = originalRequestConfig.data.alf_destination;
    	
   	   	this.alfPublish("TREE_ADD_NEW_NODE", newItem);
    	this.alfPublish("DATAGRID_ADD_ROW", originalRequestConfig.data);
    },
    
   onCreateFormGroup: function alfresco_formGroup__onCreateFormGroup(data){
	   	  this.alfLog("log", "alfresco_formGroup__onCreateFormGroup", data);
	   
	   	  this.data = data.data;

	   	 
	   	  this.rootNodeRef = data.rootNodeRef;
	   	  var payload = {};    	  
    	  
    	  payload.dialogTitle = data.config.dialogTitle;
    	  payload.dialogConfirmationButtonTitle = data.config.dialogConfirmationButtonTitle;
    	  payload.dialogCancellationButtonTitle = data.config.dialogCancellationButtonTitle;
    	  payload.formSubmissionTopic = data.config.formSubmissionTopic;
    	  payload.widgets = this.getWidgets();
    	  payload.dialogId = "FORM_GROUP";
    	  payload.contentWidth = "450px";
    	  this.alfLog("log", "alfresco_formGroup__onCreateFormGroup", payload);
    	  this.alfPublish("ALF_CREATE_FORM_DIALOG_REQUEST", payload);
   },
	   
	   getWidgets: function alfresco_formGroup__getWidgets(){
		   
		   //var optionsType = [{value:"Организация", label:"Организация"},{value:"Подразделение", label:"Подразделение"}];
		   
		   var widgets = [];
           var groupName = {
                name: "alfresco/forms/controls/DojoValidationTextBox",
                id:"btl-group_name",
                config: {
                   label: "btl-group_name.title",
                   name: "prop_btl-group_name",
                   value: (this.data !== null) ? this.data["prop_btl-group_name"] : "" ,
                   requirementConfig: {
                      initialValue: true
                   }
                }
           };
	   	   /*var groupActual = {
                name: "alfresco/forms/controls/DojoCheckBox",
                config: {
                   label:  "btl-group_actual.title",
                   name: "prop_btl-group_actual",
                   value: (this.data !== null) ? this.data["prop_btl-group_actual"] : ""
                   }
	   	   };*/

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
           var row = { name: "alfresco/forms/ControlRow",

                       config: {
                       widgetMarginLeft: 100,
                                widgets: [ ]
                       }};
           row.config.widgets.push(groupName/*, groupActual*/);
		   widgets.push(row);

		   return widgets;
	   },
	   
	   signRemoveGroup: function btl_GroupService__signRemoveGroup(payload){
	    	this.alfLog("log", "btl_GroupService__signRemoveGroup", payload);
	    	this.serviceXhr({
	    	    url: "/share/proxy/alfresco/api/node/" + payload.nodeRef.replace("://", "/") + "/formprocessor",
	    	    method: "POST",
	    	    sync: true,
	    	    data: {
	    	    	"prop_btl-group_notActual": "true"
	   	      },
	    	    successCallback: this.alfPublish("TREE_DELETE_NODE_FROM_STORE_SUCCESS"), 
	    	    callbackScope: this
	    	  });
	    },
    
  });
});