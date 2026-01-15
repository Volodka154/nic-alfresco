/**
 * Created by nabokov on 21.11.2016.
 */
define(["dojo/_base/declare",
    "dijit/layout/BorderContainer",
    "./_DateTextBox_95",
    "dijit/form/TimeTextBox",
    "dijit/form/DateTextBox",
    "dojo/dom-class",
    "dojo/_base/lang",
    "dojo/date/stamp",
    "meeting/utils/base"
], function (declare, BorderContainer, DateTextBox_95, TimeTextBox, DateTextBox, domClass, lang, stamp, utilBase) {
    return declare([DateTextBox_95], {
        value: null,
        placeHolderTime: "Время",
        placeHolder: "Дата",
        valueFormatSelector: "datetime",
        minTime: 8,
        maxTime: 20,
        position: "horizontal",  // horizontal - горизонтально расположение, vertical - вертикальное расположение
        constraintsTime: {
            //timePattern: 'HH:mm',
            clickableIncrement: 'T01:00:00',
            visibleIncrement: 'T01:00:00',
            visibleRange: 'T03:00:00'
        },

        additionalCssClasses: "_DateTimeTextBox",

        cssRequirements: [{cssFile:"./css/_DateTimeTextBox.css"}],

        postCreate: function () {
            if (!this.value && this.storeId) {
                var store = utilBase.getStoreById(this.storeId);
                if (store.document) {
                    this.value = store.document.properties[this.name];
                }
            }
            this.inherited(arguments);
        },

        createFormControl: function (config) {

            var today = new Date();

            var min = new Date(
                today.getYear(),
                today.getMonth(),
                today.getDay(),
                this.minTime, 0, 0);

            var max = new Date(
                today.getYear(),
                today.getMonth(),
                today.getDay(),
                this.maxTime, 0, 0);

            this.constraintsTime["min"] = min;
            this.constraintsTime["max"] = max;

            domClass.add(this.domNode, "alfresco-forms-controls-DateTextBox");

            config["onChange"] = this.updateTextDateTime.bind(this);
            this.value = (this.value)? stamp.fromISOString(this.value) : null;
            config["value"] = this.value;
            config["placeHolder"] = (config["placeHolder"])? config["placeHolder"] : this.placeHolder;
            config["valueFormatSelector"] = (config["valueFormatSelector"])? config["valueFormatSelector"] : this.valueFormatSelector;

            this.dateTextBox = new DateTextBox(config);

            this.timeTextBox = new TimeTextBox({
                id: this.id + "_timeTextBox",
                onChange: this.updateTextDateTime.bind(this),
                placeHolder: this.placeHolderTime,
                value: this.value,
                constraints: this.constraintsTime,
                style:"margin-top: 3px;",
                _disabled:this._disabled,
                disabled:this.disabled
            });

            var container = new BorderContainer({

            });

            if (this.position == "vertical"){
                this.dateTextBox.domNode.classList.remove('dijitInline');
                this.dateTextBox.domNode.style.marginBottom = "5px";
            }

            if(this.value) {
                this.updateTextDateTime();
            }
            //this.timeTextBox.textbox.disabled = true;

            container.addChild(this.dateTextBox);
            container.addChild(this.timeTextBox);

            this.dateTextBox.validate = lang.hitch(this, function () {
                setTimeout(lang.hitch(this, this.validate), 0);
                return true;
            });
            this.timeTextBox.validate = lang.hitch(this, function () {
                setTimeout(lang.hitch(this, this.validate), 0);
                return true;
            });

            return container;
        },

        updateTextDateTime: function () {
            this.value = this.getCurrentValue();
        },

        getCurrentValue: function () {
            var dateEpoch = (this.dateTextBox.get("value")) ? this.dateTextBox.get("value") : null;
            var timeEpoch = (this.timeTextBox.get("value")) ? this.timeTextBox.get("value") : null;

            var value = null;

            if(dateEpoch){
                if(timeEpoch){
                    value = dateEpoch;
                    value.setHours(timeEpoch.getHours(),timeEpoch.getMinutes());
                }else{
                    value = dateEpoch;
                }
            }

            if(value === null){
                if((this.dateTextBox.textbox.value !="" && (!this.dateTextBox.value || this.dateTextBox.value.toString() == "Invalid Date"))
                    || (this.timeTextBox.textbox.value !="" && (!this.timeTextBox.value || this.timeTextBox.value.toString() == "Invalid Date")))
                    return "";
            }
            return value;
        },

        getValue: function () {
            var value = this.getCurrentValue();
            var returnValue = this.processDateValue(value);
            return returnValue;
        },

        customValidator: function (validationConfig) {
            var currentValue = new Date(this.getValue()),
                isValid = currentValue instanceof Date && !isNaN(currentValue.valueOf());
            if (!isValid && !this._required) {
                isValid = this.wrappedWidget.get("displayedValue") === "";
            }
            this.reportValidationResult(validationConfig, isValid);
        },

        processDateValue: function (value) {
            var returnValue = value && stamp.toISOString(value, {selector: this.valueFormatSelector});
            if (!returnValue && typeof this.unsetReturnValue !== "undefined") {
                returnValue = this.unsetReturnValue;
            }
            return returnValue;
        },

        formControlValueChange: function (attributeName, oldValue, value) {
            if (value && value instanceof Date) {
                value = stamp.toISOString(value, {selector: this.valueFormatSelector});
            }
            if (!value && typeof this.unsetReturnValue !== "undefined") {
                this.inherited(arguments, [attributeName, oldValue, this.unsetReturnValue]);
            }
            else {
                this.inherited(arguments, [attributeName, oldValue, value]);
            }
        },

    });
});