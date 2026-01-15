/**
 * Created by nabokov on 26.08.2016.
 */
define([
    "dojo/_base/declare",
    "./_AlfMenuBarItem",
    "dojo/topic",
    "./_mixinIsReadOnly"

], function(declare, MenuBarItem, topic, _mixinIsReadOnly) {

    return declare([MenuBarItem, _mixinIsReadOnly], {
        label: "Редактировать",
        iconClass: "dijitCommonIcon icon-edit-for-attach btl-icon-16",

        postMixInProperties: function () {
            this.inherited(arguments);
            this.actions = new Alfresco.module.DoclibActions();
        },

        metaSelectDocument: function (payload) {
            if(payload.item.status != ""){
                this.setVisibly(false);
            }else {
                this.setVisibly(true);
            }
        },

        onClick: function(e){
            var displayName = this.selectedRowNode['name'],
                nodeRef = new Alfresco.util.NodeRef(this.selectedRowNode['nodeRef']),
                downloadUrl = Alfresco.constants.PROXY_URI + "slingshot/node/content/" + nodeRef.uri + "/" + displayName + "?a=true";

            this.actions.genericAction(
                {
                    success: {
                        callback: {
                            fn: function (data) {
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