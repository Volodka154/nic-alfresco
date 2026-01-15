define([
    "dojo/_base/declare",
    "./_AlfMenuBarItem",
    "./_mixinIsReadOnly",
    "dojo/topic"
], function(declare, MenuBarItem, _mixinIsReadOnly, topic) {

    return declare([MenuBarItem, _mixinIsReadOnly], {
        label: "Сохранить на ФС",
        
        postMixInProperties: function () {

            this.inherited(arguments);
        },
        isReadOnly: function (payload) {
        	this.setVisibly(false);
        },

                
        onClick: function(e){
            var rowData = this.selectedRowNode;
            var displayName = rowData['name'],
                nodeRef = (rowData['webDavURL']) ? new Alfresco.util.NodeRef(rowData['webDavURL']) : new Alfresco.util.NodeRef(rowData['nodeRef']),
                downloadUrl = Alfresco.constants.PROXY_URI + "slingshot/node/content/" + nodeRef.uri + "/" + displayName + "?a=true";
            document.location.assign(downloadUrl);
        }
        
        
        
    });
});