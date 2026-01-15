define(["dojo/_base/declare",
        "alfresco/forms/controls/BaseFormControl",
        "dojo/_base/lang",
        "dijit/ColorPalette",
        "dojo/dom-class",
        "alfresco/core/ObjectTypeUtils"],
        function(declare, BaseFormControl, lang, ColorPalette, domClass, ObjectTypeUtils) {
   return declare([BaseFormControl], {
	   
	   palette: "7x10",
	
	      /**
	       * Get the configuration for the wrapped widget
	       * 
	       * @instance
	       * @returns {object} The configuration for the form control
	       */
	      getWidgetConfig: function alfresco_forms_controls_ColorPalette__getWidgetConfig() {
	         var placeHolder = this.message(this.placeHolder || "");
	         return {
	        	id : this.generateUuid(),
	            name: this.name,
	            autocomplete: this.autocomplete,
	            placeHolder: placeHolder,
	            options: (this.options !== null) ? this.options : []
	         };
	      },
	      /**
	       * Create and return form control instance
	       *
	       * @instance
	       * @param {object} config The configuration to use when instantiating the form control
	       */
	      createFormControl: function alfresco_forms_controls_ColorPalette__createFormControl(config) {
	         domClass.add(this.domNode, "alfresco-forms-controls-ColorPalette");
	         var myPalette = new ColorPalette({
	        	 palette: this.palette,
	        	 onChange: lang.hitch(this, "onChange"),});
	         
	         return myPalette;
	      },
	      
	      getValue: function alfresco_forms_controls_ColorPalette__getValue(){
	    	  return this.value;
	      },
	      
	      setValue: function alfresco_forms_controls_ColorPalette__setValue(val){
	    	this.value = val;  
	      },
	      
	      onChange: function alfresco_forms_controls_ColorPalette__onChange(val){
	    	  this.alfLog("log", "alfresco_forms_controls_ColorPalette__onChange", val);
	    	  this.setValue(val);
	      }
	   
   });
});