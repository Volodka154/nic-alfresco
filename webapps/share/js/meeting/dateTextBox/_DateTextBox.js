/**
 * Created by nabokov on 21.11.2016.
 */
define(["dojo/_base/declare",
    "./_DateTextBox_95",
    "meeting/utils/base"
], function (declare, DateTextBox, utilBase) {
    return declare([DateTextBox], {
        style: {
            width: "300px"
        },

        postMixInProperties: function(){
            if (!this.value && this.storeId) {
                var store = utilBase.getStoreById(this.storeId);
                if (store.document) {
                    this.setValue(store.document.properties[this.name]);
                }
            }
            this.inherited(arguments);
        },
/*        postCreate: function () {
            if (!this.value && this.storeId) {
                var store = utilBase.getStoreById(this.storeId);
                if (store.document) {
                    this.setValue(store.document.properties[this.name]);
                }
            }
            this.inherited(arguments);
        },*/
    });
});