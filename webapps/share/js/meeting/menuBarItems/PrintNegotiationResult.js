
define(["dojo/_base/declare",
        "meeting/buttons/_Button",
        "meeting/utils/base"
], function (declare, Button,utilBase) {
    return declare([Button], {
        label: "Печать",
        onClick:function()
        {
        	var store = utilBase.getStoreById("MEETING_STORE");
        	
        	var re = /&/gi;
        	var location1 = window.location.toString().replace(re, '%26');        	
        	window.location.assign(Alfresco.constants.URL_PAGECONTEXT+"negotiation-list?documentNodeRef=" + store.nodeRef + "&redirect="+location1);
        }
    });
});