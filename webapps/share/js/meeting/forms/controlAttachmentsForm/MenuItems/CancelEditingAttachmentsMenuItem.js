/**
 * Created by nabokov on 31.08.2016.
 */
define([
    "dojo/_base/declare",
    "./_AlfMenuBarItem",
    "dojo/topic"

], function(declare, MenuBarItem, topic) {

    return declare([MenuBarItem], {
        label: "Отменить редактирование",
        iconClass: "dijitCommonIcon cancel-edit btl-icon-16",
        isVisible: false,

        postMixInProperties: function () {
            this.inherited(arguments);
            this.actions = new Alfresco.module.DoclibActions();
        },

        metaSelectDocument: function (payload) {
            if(payload.item.status != ""){
                this.setVisibly(true);
            }else {
                this.setVisibly(false);
            }
        },

        onClick: function(e){
            var displayName = this.selectedRowNode['name'],
            nodeRef = new Alfresco.util.NodeRef(this.selectedRowNode['nodeRef']);
            _thisCancaelAttachButton = this;
            this.actions.genericAction(
                {
                    success: {
                        callback: {
                            fn: function DocumentActions_oACE_success(data) {
                                
                            	_thisCancaelAttachButton.alfPublish("ALF_DISPLAY_NOTIFICATION", {message: "Редактирование документа " + displayName + " завершено"}, true);
                            	_thisCancaelAttachButton.alfPublish("refreshAttachmentsGrid", {}, true);
                                	
                                   // topic.publish("ALF_DISPLAY_NOTIFICATION", {message: "Редактирование документа " + displayName + " завершено"});
                                
                                //topic.publish("refreshAttachmentsGrid");
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