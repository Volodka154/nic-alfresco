/**
 * Created by nabokov on 26.12.2016.
 */
define(["dojo/_base/declare",
    "../../../dateTextBox/_DateTextBox",
    "dojo/_base/lang",
    "meeting/utils/base"
], function (declare, DateTextBox, lang, utilBase) {
    return declare([DateTextBox], {
        label: "Дата",
        name: "-",
        value: "",

        _disabled : true,
        
        postMixInProperties: function () {
            this.inherited(arguments);
        	this.alfSubscribe("CHANGE_MEETING_START_DATE", lang.hitch(this, this.updateValue), true);   
        },
        
        updateValue:function(data){
        	this.setValue(data);
        },
        
        postCreate: function () {
            if (this.storeId) {
                var store = utilBase.getStoreById(this.storeId);
                if (store.document) {
                    this.setValue(store.document.properties["prop_btl-meeting_startDate"] );
                }
            }
            this.inherited(arguments);
        }
    });
});