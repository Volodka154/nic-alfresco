
define([
    "dojo/_base/declare",
    "dojo/dom",
    "dijit/Dialog",
    "dijit/registry",
    "dojo/text!./templates/UserNotFamDialog.html",
    "dojo/_base/xhr"
], function (declare, dom, Dialog, registry, template, xhr) {
    return declare([Dialog], {
        templateString: template,
        title: "Оповещение",
        style: "width: 620px;",
        postMixInProperties: function () {
            this.inherited(arguments);
            this.uid = registry.getUniqueId(this.declaredClass.replace(/\./g, "_"));
        },
        postCreate: function () {
            this.inherited(arguments);
            this.domNode.classList.add("alfresco-dialog-AlfDialog");
        },
        addNotificationToForm: function (data, totalNotification) {
            var notification = this.templateNotification(data, totalNotification);
            this.set("content", this.get("content") + notification);
        },
        templateNotification: function (data, totalNotification) {
            var template =
                "<div style='clear: both'></div></div>" +
                "<div style='margin: 10px 15px'>" + data.content + "</div>" +
                "</div>";
            return template;
        },
        onCancel: function () {

        },
        onSubmit: function () {

            this.hide();
        }
    });
});