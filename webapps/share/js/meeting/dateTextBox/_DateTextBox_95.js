/**
 * Creates a date-field input box. Can be preset to today's date by passing a value of "TODAY".
 *
 * @example <caption>Sample usage:</caption>
 * {
 *    name: "alfresco/forms/controls/DateTextBox",
 *    id: "VALID_DATE_VALUE_1",
 *    config: {
 *       name: "validDate1",
 *       value: "2012-12-12",
 *       label: "Valid date #1"
 *    }
 * }
 *
 * @module meeting/dateTextBox/_DateTextBox_95
 * @extends alfresco/forms/controls/DateTextBox
 * @author Dave Draper
 */
define(["dojo/_base/declare",
        "alfresco/forms/controls/BaseFormControl",
        "alfresco/forms/controls/utilities/TextBoxValueChangeMixin",
        "dojo/_base/lang",
        "dojo/date/stamp",
        "dijit/form/DateTextBox",
        "dojo/dom-class",
        "alfresco/core/ObjectTypeUtils",
        "dojo/dom-style"],
    function(declare, BaseFormControl, TextBoxValueChangeMixin, lang, stamp, DateTextBox, domClass, ObjectTypeUtils, domStyle) {
        return declare([BaseFormControl, TextBoxValueChangeMixin], {

            /**
             * The value to return when no date has been selected. By default this will return null, however some
             * REST APIs may require an alternative value such as the empty string.
             *
             * @instance
             * @type {object|string|null}
             * @default
             * @since 1.0.85
             */
            unsetReturnValue: undefined,

            /**
             * The selector to use for formatting a date. An alternative might be "datetime".
             *
             * @instance
             * @type {string}
             * @default
             * @since 1.0.84
             */
            valueFormatSelector: "date",

            /**
             * An array of the CSS files to use with this widget.
             *
             * @instance
             * @type {object[]}
             * @default [{cssFile:"./css/DateTextBox.css"}]
             */
            cssRequirements: [{cssFile:"./css/DateTextBox.css"}],

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
                } else if (typeof this.value === "string")
            	{
                	this.value = new Date(this.value);
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
                if (!this.validationConfig || !ObjectTypeUtils.isArray(this.validationConfig)) {
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
                var returnValue = this.processDateValue(value);
                if (value !== null && value && value instanceof Date) {
                    var today = new Date();
                    today.setHours(0, 0, 0, 0);

                    if ((value.valueOf() < today.valueOf())) {
                        returnValue = null;
                    }
                }
                return returnValue;
            },

            completeWidgetSetup: function () {
                this.inherited(arguments);
                if (this.style && document.getElementById("widget_" + this.dateTextBox.id)){
                    domStyle.set("widget_" + this.dateTextBox.id, this.style);
                }
            },

            /**
             * Processes a value to apply date formatting as necessary.
             *
             * @instance
             * @param  {object} value The value to process
             * @return {object} The processed value
             * @since 1.0.91
             */
            processDateValue: function alfresco_forms_controls_DateTextBox__processDateValue(value) {
                var returnValue = value && stamp.toISOString(value, { selector: this.valueFormatSelector });
                if (!returnValue && typeof this.unsetReturnValue !== "undefined")
                {
                    returnValue = this.unsetReturnValue;
                }
                return returnValue;
            },

            /**
             * Create and return form control instance
             *
             * @instance
             * @param {object} config The configuration to use when instantiating the form control
             */
            createFormControl: function (config) {
                domClass.add(this.domNode, "alfresco-forms-controls-DateTextBox");
                var dateTextBox = new DateTextBox(config);
                this.dateTextBox = dateTextBox;
                dateTextBox.validate = lang.hitch(this, function(){
                    setTimeout(lang.hitch(this, this.validate), 0);
                    return true;
                });
                return dateTextBox;
            },

            /**
             * Extends the [inherited function]{@link module:alfresco/forms/controls/BaseFormControl#formControlValueChange}
             * to format the new date value correctly.
             *
             * @instance
             * @param {string} attributeName
             * @param {object} oldValue
             * @param {object} value
             * @since 1.0.84
             */
            formControlValueChange: function alfresco_forms_controls_DateTextBox__formControlValueChange(attributeName, oldValue, value) {
                if (value && value instanceof Date)
                {
                    value = stamp.toISOString(value, { selector: this.valueFormatSelector });
                }
                if (!value && typeof this.unsetReturnValue !== "undefined")
                {
                    this.inherited(arguments, [attributeName, oldValue, this.unsetReturnValue]);
                }
                else
                {
                    this.inherited(arguments, [attributeName, oldValue, value]);
                }
            }
        });
    });
