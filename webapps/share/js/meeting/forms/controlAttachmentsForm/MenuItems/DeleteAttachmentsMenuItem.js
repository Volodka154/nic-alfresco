define([
    "dojo/_base/declare",
    "./_AlfMenuBarItem",
    "./_mixinIsReadOnly",
    "dojo/topic"
], function(declare, MenuBarItem, _mixinIsReadOnly, topic) {

    return declare([MenuBarItem, _mixinIsReadOnly], {
        label: "Удалить",
        iconClass: "dijitCommonIcon icon-delete btl-icon-16",

        postMixInProperties: function () {

            this.inherited(arguments);
        },
        isReadOnly: function (payload) {
        	this.setVisibly(false);
        },

        onClick: function(e){
            this.alfPublish("ALF_CRUD_DELETE", {
                requiresConfirmation: true,
                url: "slingshot/datalists/list/node/" + this.selectedRowNode["nodeRef"].replace("://", "/"),
                confirmationTitle: "Удаление вложения",
                responseTopic: this.id + "DELETE_ROW",
                noRefresh: true,
                confirmationPrompt: "Вы уверены что хотите удалить файл " + this.selectedRowNode["name"] + "?",
                successMessage: "Файл " + this.selectedRowNode["name"] + " успешно удален."
            }, true);
        }
    });
});