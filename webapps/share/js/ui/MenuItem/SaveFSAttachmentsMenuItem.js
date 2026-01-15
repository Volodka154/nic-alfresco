/**
 * Created by nabokov on 31.08.2016.
 */
define([
    "dojo/_base/declare",
    "./_MenuItem",
    "dojo/topic",
    "jquery"
], function(declare, MenuBarItem, topic, $) {

    return declare([MenuBarItem], {
        label: "Сохранить на ФС",
        iconClass: "dijitCommonIcon icon-edit-for-attach btl-icon-16",
        gridId: null,

        endPostCreate: function () {
            this.grid = $("#" + this.gridId);
        },

        onClick: function(e){
            var rowData = this.getCurrentRow();
            var displayName = rowData['name'],
                nodeRef = (rowData['webDavURL']) ? new Alfresco.util.NodeRef(rowData['webDavURL']) : new Alfresco.util.NodeRef(rowData['nodeRef']),
                downloadUrl = Alfresco.constants.PROXY_URI + "slingshot/node/content/" + nodeRef.uri + "/" + displayName + "?a=true";
            document.location.assign(downloadUrl);
        },
    });
});