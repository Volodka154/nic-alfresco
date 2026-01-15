/**
 * Created by nabokov on 14.12.2016.
 */

define([
    "dojo/_base/declare",
    "dojo/topic",
    "dojo/_base/lang",
    "meeting/utils/base",
    "alfresco/core/Core"
], function (declare, topic, lang, utilBase, Core) {

    return declare(null, {

        postMixInProperties: function () {
        	
        	
        	var store = utilBase.getStoreById("MEETING_STORE");	                
            handleAlfSubscribe = store.handleAlfSubscribe;  
            
            
            handleAlfSubscribe.push(this.alfSubscribe(this.pubSubScope + "IS_READ_ONLY_ATTACHMENTS", lang.hitch(this, this.isReadOnly), true));
            this.inherited(arguments);
        },
        isReadOnly: function (payload) {
            this.setVisibly(false);
        }
    });
});