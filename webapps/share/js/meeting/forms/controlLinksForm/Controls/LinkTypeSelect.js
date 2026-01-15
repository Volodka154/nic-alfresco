define(["dojo/_base/declare",
        "alfresco/forms/controls/Select",
        "meeting/utils/base",
        "alfresco/core/CoreXhr",
        "alfresco/core/ResizeMixin",
        "dojo/_base/lang"],
        function(declare, Select, utilBase,CoreXhr,ResizeMixin,lang){

    return declare([Select, CoreXhr,ResizeMixin], {
        label: "Тип ссылки",
        name: "assoc_btl-link_linkType",
        additionalCssClasses:"width300",
        optionsConfig: {
            fixed: [ {value: " ", label:" ", disabled: true} ],
            fieldId: "LINK_TYPE_SELECT"
        },

        postMixInProperties: function () {
            this.alfSubscribe("BTL_LINK_OBJECT_TYPE_CHANGED", lang.hitch(this, this.changeSource, true), true);
            if (this.objectType != "")
                this.changeSource(false, this.objectType);
            this.alfDisabled(this.value == "");
            this.inherited(arguments);
        },

        changeSource: function btl_LinkTypeSelect__changeSource(clean, newObjectType){
            if (clean){
                if (this.wrappedWidget)
                    this.wrappedWidget.value = null;
                this.alfDisabled(false);
            }
            this.serviceXhr({
	    		url: "/share/proxy/alfresco/filters/link-type-list?doc=" + this.rootNodeRef + "&linkType=" + newObjectType,
	      	    method: "GET",
	      	    successCallback: function(response) {
                    if (this.wrappedWidget)
	      	            this.wrappedWidget.options = [];
	      	        if (response.cnt_whole > 0){
                        for (var i = 0; i < response.cnt_whole; i++)
                            this.addOption( { value: response.result[i].nodeRef, label: response.result[i].name } );
                    } else {
                        this.addOption({value: " ", label:" ", disabled: true});
                    }
                    this.setValue(this.value);
                    this.options = this.wrappedWidget.options;
                },
	      	    callbackScope: this
	      	});
        },

        validate: function alfresco_forms_controls_BaseFormControl__validate() {
             if (this.deferValueAssigment)
             {
                // Do nothing until final value has been assigned
             }
             else if (this.validationConfig && ObjectTypeUtils.isArray(this.validationConfig))
             {
                this.startValidation();
             }
             else
             {
                var isValid = this.processValidationRules();
                if (isValid && this.wrappedWidget.value != null && this.wrappedWidget.value != " ")
                {
                   this.alfPublish("ALF_VALID_CONTROL", {
                      name: this.name,
                      fieldId: this.fieldId
                   });
                   this.hideValidationFailure();
                }
                else
                {
                   this.alfPublish("ALF_INVALID_CONTROL", {
                      name: this.name,
                      fieldId: this.fieldId
                   });

                   this.showValidationFailure();
                }
             }
        },
    });
});