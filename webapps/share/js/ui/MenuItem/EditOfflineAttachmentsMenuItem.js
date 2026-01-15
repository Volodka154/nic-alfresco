/**
 * Created by nabokov on 26.08.2016.
 */
define([
    "dojo/_base/declare",
    "./_MenuItem",
    "dojo/topic",
    "jquery"
], function(declare, MenuBarItem, topic, $) {

    return declare([MenuBarItem], {
        label: "Редактировать",
        iconClass: "dijitCommonIcon icon-edit-for-attach btl-icon-16",
        gridId: null,

        endPostCreate: function () {
            this.grid = $("#" + this.gridId);
            this.actions = new Alfresco.module.DoclibActions();
        },

        onClick: function(e){
            var rowData = this.getCurrentRow();
            var displayName = rowData['name'],
                nodeRef = new Alfresco.util.NodeRef(rowData['nodeRef']),
                downloadUrl = Alfresco.constants.PROXY_URI + "slingshot/node/content/" + nodeRef.uri + "/" + displayName + "?a=true";
            this.actions.genericAction(
                {
                    success: {
                        callback: {
                            fn: function DocumentActions_oAEO_success(data) {
                                document.location.assign(downloadUrl);
                                require(["dojo/topic"], function (topic) {
                                    topic.publish("ALF_DISPLAY_NOTIFICATION", {message: "Документ:" + displayName + " загружен для редактирования"});
                                });
                                topic.publish("refreshAttachmentsGrid");
                            },
                            scope: this
                        }
                    },
                    failure: {},
                    webscript: {
                        method: Alfresco.util.Ajax.POST,
                        name: "checkout/node/{nodeRef}",
                        params: {
                            nodeRef: nodeRef.uri
                        }
                    }
                });
        },
    });
});