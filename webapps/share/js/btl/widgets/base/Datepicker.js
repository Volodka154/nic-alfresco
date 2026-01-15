define(["dojo/_base/declare",
        "alfresco/forms/controls/BaseFormControl",
        "dijit/_TemplatedMixin",
        "./_validationMixin",
        "dojo/text!./templates/Datepicker.html",
        "dojo/_base/lang",
        "dojo/date/stamp",
        "dijit/form/DateTextBox",
        "dojo/dom-class",
        "dojo/_base/array",
        "alfresco/core/ObjectTypeUtils"],
        function(declare, BaseFormControl,_TemplatedMixin, _validationMixin, Template, lang, stamp, DateTextBox, domClass, array, ObjectTypeUtils) {
   return declare([BaseFormControl, _TemplatedMixin, _validationMixin], {

      /**
       * An array of the CSS files to use with this widget.
       *
       * @instance
       * @type {object[]}
       * @default [{cssFile:"./css/DateTextBox.css"}]
       */
      cssRequirements: [{cssFile:"./css/DateTextBox.css"}],

       templateString: Template,

      /**
       * Run after properties mixed into instance
       *
       * @instance
       */
      postMixInProperties: function(){
         if (this.value === "TODAY") { // Special case
            this.value = (new Date()).toISOString();
         } else if (!this.value || (typeof this.value === "string" && lang.trim(this.value).length === 0)) {
            this.value = null; // Falsy values and empty strings should be treated as nulls, i.e. no value (see AKU-430)
         }
         this.inherited(arguments); // Must 'clean' the empty strings before calling this
      },

      /**
       * Get the configuration for the wrapped widget
       *
       * @instance
       * @returns {object} The configuration for the form control
       */
      getWidgetConfig: function alfresco_forms_controls_DateTextBox__getWidgetConfig() {
         this.configureValidation();
         var placeHolder = this.message(this.placeHolder || "");
         return {
            id: this.id + "_CONTROL",
            name: this.name,
            placeHolder: placeHolder,
            options: (this.options !== null) ? this.options : []
         };
      },

      /**
       * This function is used to set or update the validationConfig
       *
       * @instance
       */
      configureValidation: function alfresco_forms_controls_DateTextBox__configureValidation() {
         if (!this.validationConfig || ObjectTypeUtils.isObject(this.validationConfig)) {
            this.validationConfig = [];
         }
         this.validationConfig.push({
            validation: "customValidator",
            errorMessage: this.message("formValidation.date.error")
         });
      },

      /**
       * Ensure value is a date
       *
       * @instance
       * @param {object} validationConfig The configuration for this validator
       */
      customValidator: function alfresco_forms_controls_DateTextBox__customValidator(validationConfig){
         var currentValue = this.getValue(),
            isValid = typeof currentValue === "string";
         if(!isValid && !this._required) {
            isValid = this.wrappedWidget.get("displayedValue") === "";
         }
         this.reportValidationResult(validationConfig, isValid);
      },

      /**
       * Get the value currently assigned to the wrapped widget
       *
       * @instance
       * @returns {object} The current value of the field
       */
      getValue: function alfresco_forms_controls_DateTextBox__getValue() {
         var value = this.inherited(arguments);
         return value && stamp.toISOString(value, { selector: "date" });
      },

      /**
       * Create and return form control instance
       *
       * @instance
       * @param {object} config The configuration to use when instantiating the form control
       */
      createFormControl: function alfresco_forms_controls_DateTextBox__createFormControl(config) {
         domClass.add(this.domNode, "alfresco-forms-controls-DateTextBox");
         var dateTextBox = new DateTextBox(config);
         dateTextBox.validate = lang.hitch(this, function(){
            setTimeout(lang.hitch(this, this.validate), 0);
            return true;
         });

         return dateTextBox;
      },

      hideValidationFailure: function alfresco_forms_controls_BaseFormControl__hideValidationFailure() {
         if(this.domNode) {
             domClass.remove(this.domNode, "alfresco-forms-controls-BaseFormControl--invalid");
             this._pendingValidationFailureDisplay = false;
         }
       },

      /*validate: function alfresco_forms_controls_BaseFormControl__validate() {
           if (this.deferValueAssigment)
           {
               // Do nothing until final value has been assigned
           }
           else if (this.validationConfig && ObjectTypeUtils.isArray(this.validationConfig))
           {
               if(this.domNode) {
                   this.startValidation();
               }
           }
           else
           {
               var isValid = this.processValidationRules();
               if (isValid)
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
       },*/
   });
});