/**
 * Created by nabokov on 28.11.2016.
 */
define(["dojo/_base/declare",
    "btl/widgets/base/btlChoice",
    "dojo/_base/lang",
    "meeting/utils/base"

], function (declare, btlChoice, lang, utilBase) {

    return declare([btlChoice], {
        width: 250,
        inputStyle: {width: "240px"},
        postCreate: function () {
            if (!this.value && this.storeId) {
                var store = utilBase.getStoreById(this.storeId);
                if (store.document) {
                    this.value = store.document.assocs[this.name];
                }
            }
            this.inherited(arguments);
                      	
            if (this._disabled)
            	this.setDisable(true);
            
            
        },
        
        getValue:function(){
        	if (this.value)
        		return this.value
    		else
    			return null;
        }
    });
});