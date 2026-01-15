/**
 * Created by nabokov on 31.08.2016.
 */
define([
    "dojo/_base/declare",
    "./_MenuItem",
    "dojo/topic",
    "../Dialog/DeleteAnswerDialog",
    "jquery"
], function(declare, MenuBarItem, topic, DeleteAnswerDialog, $) {

    return declare([MenuBarItem], {
        label: "Удалить",
        iconClass: "dijitCommonIcon icon-delete btl-icon-16",
        gridId: null,

        endPostCreate: function () {
            this.grid = $("#" + this.gridId);
            this.deleteDialog = new DeleteAnswerDialog({
                title: "Удаление вложения"
            });
        },

        onClick: function(e){
            var rowData = this.getCurrentRow();

            var displayName = rowData['name'],
                nodeRef = rowData['nodeRef'];

            this.deleteDialog.set('content', 'Вы действительно хотите удалить файл:</br>"' + displayName + '" ?');
            this.deleteDialog.callback = this.deleteAttachment.bind(this, nodeRef);

            this.deleteDialog.show();
        },
        deleteAttachment: function (nodeRef) {
            Alfresco.util.Ajax.jsonPost({
                method: "POST",
                url: "/share/proxy/alfresco/slingshot/doclib/action/files?alf_method=delete",
                dataObj: {nodeRefs: [nodeRef]},
                successCallback: {
                    fn: function () {
                        this.deleteDialog.hide();
                        topic.publish("refreshAttachmentsGrid");
                    },
                    scope: this
                }
            });
        }
    });
});