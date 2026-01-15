/**
 * Created by nabokov on 13.12.2016.
 */
define([
    "dojo/_base/declare",
    "dojo/topic",
    "dojo/_base/lang",
    "meeting/utils/base",
    "alfresco/core/Core"
], function (declare, topic, lang, utilBase, Core) {

    return declare(null, {
        isVisible: true,

        selectedRowNode: {},
        postCreate: function () {
        	
        	var store = utilBase.getStoreById("MEETING_STORE");	                
            handleAlfSubscribe = store.handleAlfSubscribe;  
            
            
            handleAlfSubscribe.push(this.alfSubscribe("SELECT_ROW_ATTACHMENTS_TREE_GRID", lang.hitch(this, this.selectRowEvent), true));  
        	
            
            this.inherited(arguments);
            if(!this.isVisible){
                this.setVisibly(false);
            }
        },
        selectRowEvent: function (data) {
            this.selectedRowNode = lang.clone(data);
        },

       
        setVisibly: function (isVisibly) {
            if (isVisibly) {
                this.domNode.style.display = "inline-block";
            } else {
                this.domNode.style.display = "none";
            }
        },
    });
});