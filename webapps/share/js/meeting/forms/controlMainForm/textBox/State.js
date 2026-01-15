/**
 * Created by nabokov on 21.11.2016.
 */
define(["dojo/_base/declare",
        "dojo/_base/lang",
    "../../../textBox/_TextBox",
    "meeting/utils/base"
], function (declare, lang, TextBox, utilBase) {
    return declare([TextBox], {
        name: "prop_btl-meeting_state",
        label: "Состояние",
        value: "",
        disablementConfig : {
            initialValue: true
        },
        
        postMixInProperties: function () {
            this.inherited(arguments);                
        	this.alfSubscribe("CHANGE_MEETING_STATE_CONTROL", lang.hitch(this, this.updateValue), true);   
        },
        
        updateValue:function(data){
        	
        	if (this.storeId) {
                var store = utilBase.getStoreById(this.storeId);
                if (store.document) {
                    store.document.properties[this.name] = data;
                }
            }
        	
        	
        	this.setValue(data);
        },
        
        postCreate: function () {
        	this.inherited(arguments);
        	
            if (this.storeId) {
                var store = utilBase.getStoreById(this.storeId);
                if (store.document) {
                    this.setValue(store.document.properties[this.name] );
                    return;
                }
            }
            
            this.setValue("Черновик");
            
            
        }
       
        
        
    });
});