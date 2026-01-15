/**
 * Created by nabokov on 26.08.2016.
 */
define([
    "dojo/_base/declare",
    "./_MenuItem",
    "../Dialog/AddAttachmentsDialog"
], function(declare, MenuBarItem, AddAttachmentsDialog) {

    return declare([MenuBarItem], {
        label: "Добавить",
        iconClass: "dijitCommonIcon icon-add btl-icon-16",
        parentNodeRef: null,

        endPostCreate: function () {        	
            this.attachmentsDialog = new AddAttachmentsDialog({
                parentNodeRef: this.parentNodeRef,
                contentType: this.contentType
            });
        },

        onClick: function(e){
            this.attachmentsDialog.show();
        },
    });
});