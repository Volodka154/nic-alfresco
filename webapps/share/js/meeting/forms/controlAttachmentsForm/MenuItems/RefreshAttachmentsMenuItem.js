define([
    "dojo/_base/declare",
    "./_AlfMenuBarItem",
    "dojo/topic"
], function(declare, MenuBarItem, topic) {

    return declare([MenuBarItem], {
        label: "Обновить",
        iconClass: "dijitCommonIcon icon-refresh btl-icon-16",

        onClick: function(e){
        	this.alfPublish("refreshAttachmentsGrid", {}, true);
            //topic.publish("refreshAttachmentsGrid");
        },
    });
});