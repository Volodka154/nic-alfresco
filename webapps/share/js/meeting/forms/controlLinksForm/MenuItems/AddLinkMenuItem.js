define([
    "dojo/_base/declare",
    "./_AlfMenuBarItem",
    "dojo/topic",
    "./_mixinIsReadOnly"
], function (declare, MenuBarItem, topic, _mixinIsReadOnly) {

    return declare([MenuBarItem, _mixinIsReadOnly], {
        parentNodeRef: null,
        label: "Добавить ссылку",
        iconClass: "dijitCommonIcon icon-add btl-icon-16",

        postMixInProperties: function () {
            this.inherited(arguments);
        },

        isReadOnly: function (payload) {
        	this.setVisibly(false);
        },

        postCreate: function () {
            this.parentNodeRef = (this.documentNodeRef)? this.documentNodeRef : null;
            this.inherited(arguments);
        },

        onClick: function (e) {
            var data = {};
            data.rootNodeRef = this.parentNodeRef;
            data.config = {};
            data.data = null;
            data.config.dialogTitle = "Создать ссылку";
            data.config.dialogConfirmationButtonTitle = "Создать";
            data.config.dialogCancellationButtonTitle = "Отмена";
            data.config.formSubmissionTopic = "BTL_CREATE_WIDGET_LINK";

            this.alfPublish("BTL_CREATE_FORM_WIDGET_LINK", data, true, true);
        },
    });
});