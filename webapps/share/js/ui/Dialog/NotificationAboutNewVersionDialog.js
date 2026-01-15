/**
 * Created by nabokov on 06.10.2016.
 */
define([
    "dojo/_base/declare",
    "dojo/dom",
    "dijit/Dialog",
    "dijit/registry",
    "dojo/text!./templates/NotificationAboutNewVersionDialog.html",
    "dojo/_base/xhr"
], function(declare, dom, Dialog, registry, template, xhr) {

    return declare([Dialog], {
        templateString: template,
        title: "Оповещение о новой версии",
        style: "width: 870px; height: 800px",
        notificationNodeRefs:[],

        postMixInProperties: function () {
            this.inherited(arguments);
            this.uid = registry.getUniqueId(this.declaredClass.replace(/\./g, "_"));
        },
        postCreate: function () {
            this.inherited(arguments);
            this.domNode.classList.add("alfresco-dialog-AlfDialog");
        },
        addNotificationToForm: function (data, totalNotification) {
            this.notificationNodeRefs.push(data.nodeRef);
            var notification = this.templateNotification(data,totalNotification);
            this.set("content", this.get("content") + notification);
        },
        markAsRead: function () {
            // console.log(this.notificationNodeRefs);
            var xhrArgs = {
                url: "/share/proxy/alfresco/notification/set-is-read-notification?nodeRefs=" + this.notificationNodeRefs.join(","),
                handleAs: "json",
                load: function (data) {
                },
                error: function (error) {
                    console.error("Ошибка при отметке оповещений как прочитанных:" + error);
                }
            };
            var deferred = xhr.get(xhrArgs);
        },
        templateNotification: function (data, totalNotification) {
            var maxHeight = 250;
            switch (totalNotification){
                case 1:
                    maxHeight = 700;
                    break;
                case 2:
                    maxHeight = 350;
                    break;
                case 3:
                    maxHeight = 300;
                    break;
            }
            var template =
                "<div style='margin: 20px; margin-top: 0px; max-height: " + maxHeight + "px; overflow: auto; min-height: 150px;' class='panel panel-info'>" +
                "<div class='panel-heading'><h2>" + "Версия: " + data.release + ". " + data.title + "</h2>" +
                "<span style='float: right'>дата:<i style='padding-left:5px'>" + data.date + "</i></span>" +
                "<div style='clear: both'></div></div>" +
                "<div class='content'>" + data.content + "</div>" +
                "</div>";
            return template;
        },
        onCancel: function () {
            //this.markAsRead();
        },
        onSubmit: function () {
            //this.markAsRead();
            this.hide();
        },


        load: function () {

            var _this = this;
            Alfresco.util.Ajax.jsonGet({
                method: "GET",
                url: "/share/proxy/alfresco/notification/get-new-notification?v=" + new Date().getTime(),
                successCallback: {
                    fn: function (responce) {
                        var data = responce.json;

                        if (data.items && data.items.length > 0) {
                            data.items.forEach(function (item) {
                                _this.addNotificationToForm(item, data.items.length);
                            });
                            _this.show();
                            _this.markAsRead();

                        }
                    },
                    scope: this
                }
            });

        },


        onHide: function() {
            this.destroy()
        }

    });
});