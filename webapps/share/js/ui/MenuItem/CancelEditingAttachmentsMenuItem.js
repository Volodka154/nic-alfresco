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
        label: "Отменить редактирование",
        iconClass: "dijitCommonIcon cancel-edit btl-icon-16",
        gridId: null,

        endPostCreate: function () {
            this.grid = $("#" + this.gridId);
            this.actions = new Alfresco.module.DoclibActions();
        },

        onClick: function(e){
            var rowData = this.getCurrentRow();
            var displayName = rowData['name'],
                nodeRef = new Alfresco.util.NodeRef(rowData['nodeRef']);
            this.actions.genericAction(
                {
                    success: {
                        callback: {
                            fn: function DocumentActions_oACE_success(data) {
                                require(["dojo/topic"], function (topic) {
                                    topic.publish("ALF_DISPLAY_NOTIFICATION", {message: "Редактирование документа " + displayName + " завершено"});
                                });
                                topic.publish("refreshAttachmentsGrid");
                            },
                            scope: this
                        }
                    },
                    failure: {},
                    webscript: {
                        method: Alfresco.util.Ajax.POST,
                        name: "cancel-checkout/node/{nodeRef}",
                        params: {
                            nodeRef: nodeRef.uri
                        }
                    }
                });
        },
    });
});