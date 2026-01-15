define(["dojo/_base/declare",
        "alfresco/core/Core",
        "dojo/_base/lang",
        "alfresco/core/CoreXhr",
        "service/constants/Default"],
        function(declare, Core, lang, CoreXhr, AlfConstants) {

  return declare([Core, CoreXhr], {

    data: {},
    rootNodeRef: null,
    type: "btl-link%3awigetLink",

    constructor: function btl_WigetLinkService__constructor(args) {
      lang.mixin(this, args);
      this.alfSubscribe("BTL_CREATE_WIDGET_LINK", lang.hitch(this, this.createWidgetLink));
      this.alfSubscribe("BTL_CREATE_FORM_WIDGET_LINK", lang.hitch(this, this.onCreateFormWidgetLink));
      this.alfSubscribe("BTL_EDIT_WIDGET_LINK", lang.hitch(this, this.editWidgetLink));
    },
    
    createWidgetLink: function btl_createWigetLinkService__createWigetLink(payload) {
    	this.alfLog("log", "btl_createWigetLinkService__createWigetLink", payload);
    	this.data = payload;
    	this.data.name = payload["prop_btl-link_name"];
    	this.data.alf_destination = this.rootNodeRef;
    	this.data["assoc_btl-link_linkType_added"] = payload["assoc_btl-link_linkType"];
    	this.data["prop_btl-link_text"] = payload["assoc_btl-link_linkObject_val"];
    	
    	this.serviceXhr({
    	    url: "/share/proxy/alfresco/api/type/"+ this.type +"/formprocessor",
    	    method: "POST",
    	    data: this.data,
    	    successCallback: this.updateWidgetLinkGrid,
    	    callbackScope: this
    	  });
    	},
    	
    updateWidgetLinkGrid: function btl_WigetLinkService__updateWigetLinkGrid(response, originalRequestConfig){
    	this.alfLog("log", "btl_WigetLinkService__updateWigetLinkGrid", originalRequestConfig);
    	
    	this.alfPublish("REFRESH_LINKS_GRID", null, true);
    },
    
    editWidgetLink: function btl_WigetLinkService__editWigetLink(payload) {
    	this.alfLog("log", "btl_WidgetLinkService__editWidgetLink", payload);

        payload["assoc_btl-link_linkType_added"] = payload["assoc_btl-link_linkType"];
        payload["assoc_btl-link_linkType_removed"] = this.data["assoc_btl-link_linkType"];

    	this.serviceXhr({
    	    url: "/share/proxy/alfresco/api/node/"+ this.data.nodeRef.replace("://", "/") +"/formprocessor",
    	    method: "POST",
    	    data: payload,
    	    successCallback: this.alfPublish("REFRESH_LINKS_GRID", null, true),
    	    callbackScope: this
    	  });
    },
    
    onCreateFormWidgetLink: function alfresco_formWigetLink__onCreateFormWigetLink(data){
        this.alfLog("log", "alfresco_formWidgetLink__onCreateFormWidgetLink", data);
        this.data = data.data;
        this.rootNodeRef = data.rootNodeRef;
        var payload = {};

        payload.dialogTitle = data.config.dialogTitle;
        payload.dialogConfirmationButtonTitle = data.config.dialogConfirmationButtonTitle;
        payload.dialogCancellationButtonTitle = data.config.dialogCancellationButtonTitle;
        payload.formSubmissionTopic = data.config.formSubmissionTopic;
        payload.widgets = this.getWidgets();

        this.alfLog("log", "alfresco_formWidgetLink__onCreateFormWidgetLink", payload);
        this.alfPublish("ALF_CREATE_FORM_DIALOG_REQUEST", payload);
    },

    getWidgets: function alfresco_formWigetLink__getWidgets(){

        var linkObjectType = {
          name: "meeting/forms/controlLinksForm/Controls/LinkObjectTypeSelect",
          config: {
              value: (this.data !== null) ? this.data["prop_btl-link_docType"] : "", // this.linkType.link.docType
              onValueChangeEvent: function(name, oldValue, value){
                  this.alfPublish("BTL_LINK_OBJECT_TYPE_CHANGED", value, true);
              }
          }
        };

        var linkObject = {
            name:"meeting/forms/controlLinksForm/Controls/LinkObjectItemPicker",
            config:{
                readOnly: this.data != null,
                value: (this.data) ? this.data["assoc_btl-link_linkObject"] : "",
                objectType: (this.data !== null) ? this.data["prop_btl-link_docType"] : "",
                rootNodeRef: this.rootNodeRef,
                disablementConfig: {
                    initialValue: true,
                    rules: [
                      {
                         targetId: "LINK_OBJECT_TYPE_SELECT",
                         is: [null]
                      }
                    ]
                },
                requirementConfig: {
                   initialValue: true
                },
            }
        };

        var linkType = {
          name: "meeting/forms/controlLinksForm/Controls/LinkTypeSelect",
          config: {
              value: (this.data !== null) ? this.data["assoc_btl-link_linkType"] : "",
              objectType: (this.data !== null) ? this.data["prop_btl-link_docType"] : "",
              rootNodeRef: this.rootNodeRef,
              requirementConfig: {
                 initialValue: true
              },
          }
        };

       var widgets = [
         linkObjectType, linkObject, linkType
	   ];
		   
       return widgets;
    }
  });
});