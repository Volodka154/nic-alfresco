define(["alfresco/forms/controls/BaseFormControl",
        "alfresco/forms/controls/utilities/TextBoxValueChangeMixin",
        "alfresco/forms/controls/utilities/IconMixin",
        "./_validationMixin",
        "dojo/_base/declare",
        "alfresco/forms/controls/TextBoxControl",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/dom-class",
        "dojo/dom-style"],
        function(BaseFormControl, TextBoxValueChangeMixin, IconMixin, _validationMixin, declare, TextBoxControl, lang, array, domClass, domStyle) {
   
   return declare([BaseFormControl, TextBoxValueChangeMixin, IconMixin, _validationMixin], {
	   
	   style: null,
       labelStyle: null,
       notValidClass: "not-valid",
      
      /**
       * An array of the CSS files to use with this widget.
       * 
       * @instance
       * @type {Array}
       */
      cssRequirements: [{cssFile:"./css/TextBox.css"}],

      /**
       * <p>Whether to enable autocomplete on the textbox. Be aware that this can cause issues in two ways. Firstly, change events are not
       * reliably fired by browsers when they autofill fields. Secondly, it may cause problems if set to true on textbox sub-components which
       * would normally verify user-inputs and control them. The default (null) will leave the autocomplete as "off", as per the Dojo defaults.</p>
       *
       * <p><strong>NOTE:</strong> Although one would normally override this with a setting of "on", consideration should be given to instead
       * using a more suitable HTML5-accepted value, such as "username" or "email". A full list of the possible values can be found on
       * the [WHATWG reference page]{@link https://html.spec.whatwg.org/multipage/forms.html#autofill} and further explanation of many of them
       * is available on the [MDN input page]{@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input}.</p>
       *
       * @instance
       * @type {string}
       * @default
       * @since 1.0.45
       */
      autocomplete: "off",

      /**
       * The placeholder to be used (will use native HTML5 if available).
       * 
       * @instance
       * @type {string}
       * @default
       */
      placeHolder: null,
      
      textBox: null,

       /**
        * что бы в мероприятиях поля выбора значений имели 100% ширину.
        * Когда это свойство не null то к input'у применяется стиль, который отрезает 30% свободного места.
       */
      iconClass:null,

      completeWidgetSetup: function alfresco_forms_controls_BaseFormControl__completeWidgetSetup() {
    	  this.inherited(arguments);
          if(this.labelStyle){
              domStyle.set(this._titleRowNode, this.labelStyle);
          }
    	  if (this.style && document.getElementById("widget_" + this.textBox.id)){
           	 domStyle.set("widget_" + this.textBox.id, this.style);
            }
       },
      
      /**
       * @instance
       */
      getWidgetConfig: function alfresco_forms_controls_TextBox__getWidgetConfig() {
         // Return the configuration for the widget
         var placeHolder = (this.placeHolder) ? this.message(this.placeHolder) : "";
         return {
            id : this.generateUuid(),
            name: this.name,
            autocomplete: this.autocomplete,
            placeHolder: placeHolder,
            iconClass: this.iconClass
         };
      },
      
      /**
       * @instance
       */
      createFormControl: function alfresco_forms_controls_TextBox__createFormControl(config, /*jshint unused:false*/ domNode) {
         var textBox = new TextBoxControl(config);
         // Handle adding classes
         this.textBox = textBox;
         
         var additionalCssClasses = "";
         if (this.additionalCssClasses)
         {
            additionalCssClasses = this.additionalCssClasses;
         }
         domClass.add(this.domNode, "alfresco-forms-controls-TextBox " + additionalCssClasses);
         this.addIcon(textBox);
         return textBox;
      },

       showValidationFailure: function alfresco_forms_controls_BaseFormControl__showValidationFailure() {
           if (this.showValidationErrorsImmediately || (this._hadFocus || this._hadUserUpdate))
           {
               this.domNode ? domClass.add(this.domNode, "alfresco-forms-controls-BaseFormControl--invalid") : "";
           }
           else
           {
               this._pendingValidationFailureDisplay = true;
           }
           this._controlNode ? domClass.add(this._controlNode, this.notValidClass) : "";
       },
       hideValidationFailure: function alfresco_forms_controls_BaseFormControl__hideValidationFailure() {
          if(this.domNode) {
              domClass.remove(this.domNode, "alfresco-forms-controls-BaseFormControl--invalid");
              domClass.remove(this.domNode, "alfresco-forms-controls-BaseFormControl--warning");
          }
           this._controlNode ? domClass.remove(this._controlNode, this.notValidClass) : "";
           this._pendingValidationFailureDisplay = false;
       },

   });
});