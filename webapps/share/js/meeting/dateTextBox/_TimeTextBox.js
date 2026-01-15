/**
 * Created by nabokov on 26.12.2016.
 */
define(["dojo/_base/declare",
    "btl/widgets/base/TimeTextBox",
    "dojo/_base/lang",
    "meeting/utils/base"

], function (declare, btlChoice, lang, utilBase) {

    return declare([btlChoice], {
       style: {
           width: "145px",
       },
        minTime: 8,
        maxTime: 20,
        constraintsTime: {
            clickableIncrement: 'T01:00:00',
            visibleIncrement: 'T01:00:00',
            visibleRange: 'T03:00:00'
        },

        postCreate: function () {
            if (this.storeId) {
                var store = utilBase.getStoreById(this.storeId);
                if (store.document) {
                    this.setValue(store.document.properties[this.name] || this.value);
                }
            }
            this.inherited(arguments);
        },

        getWidgetConfig: function () {

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

            this.configureValidation();
            var placeHolder = this.message(this.placeHolder || "");
            return {
                id: this.id + "_CONTROL",
                name: this.name,
                placeHolder: placeHolder,
                options: (this.options !== null) ? this.options : [],
                constraints: this.constraintsTime
            };
        },
    });
});