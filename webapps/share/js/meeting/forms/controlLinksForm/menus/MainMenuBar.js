define(["dojo/_base/declare",
    "meeting/menus/_MenuBar",
    "dojo/_base/lang",
    "meeting/utils/base",
    "dojo/topic",

], function (declare, _MenuBar, lang, utilBase, topic) {
    return declare([_MenuBar], {
        access: "",
        state: "",
        documentNodeRef: null,
        isReadOnly: false,

        pathToComponents: "meeting/forms/controlLinksForm/MenuItems/",

         postMixInProperties: function () {
            this.inherited(arguments);
            //this.alfSubscribe("CHANGE_STATE_MEETING_DOCUMENT", lang.hitch(this, this.setState), true);
            this.initFirstRowHandle = this.alfSubscribe("ALF_WIDGET_PROCESSING_COMPLETE", lang.hitch(this, this.initFirstRow), true);
            topic.subscribe("SELECT_ROW_LINKS_GRID", this.changeStageMenuBar.bind(this));
         },

         initFirstRow: function () {
             if(this.widgetProcessingComplete){
                 topic.publish("TRIGGER_CURRENT_ROW_DATA_LINKS", {});
                 this.alfUnsubscribe(this.initFirstRowHandle);
                 if(this.documentNodeRef) {
                     this.setOnLoadMenuStage();
                 }
             }
         },

         setOnLoadMenuStage: function () {
            Alfresco.util.Ajax.request({
                method: "GET",
                url: Alfresco.constants.PROXY_URI + "slingshot/doclib/node/" + this.documentNodeRef.replace("://", "/"),
                successCallback: {
                    fn: function (complete) {
                        if (complete.json.item.permissions.userAccess["edit"] != true) {
                            this.alfPublish(this.pubSubScope + "IS_READ_ONLY_LINKS",{}, true);
                            this.isReadOnly = true;
                        }
                    },
                    scope: this
                }
            });
         },

         changeStageMenuBar: function (payload) {
            //if(!this.isReadOnly && (isClerk || isAdmin || isSecretary )){
             if(!this.isReadOnly){
                 Alfresco.util.Ajax.jsonGet({
                     url: Alfresco.constants.PROXY_URI + "slingshot/doclib/node/" + payload.nodeRef.replace("://", "/"),
                     successCallback: {
                         fn: function sendMetaDocument(complete) {
                             this.alfPublish(this.pubSubScope + "META_SELECT_DOCUMENT",complete.json, true);
                         },
                         scope: this
                     }
                 });
             }
         },

         postCreate: function () {
            if (!this.state && this.storeId) {
                var store = utilBase.getStoreById(this.storeId);
                if (store.document) {
                    this.state = store.state;
                    this.documentNodeRef = store.nodeRef;
                }
            }

            var AddLinkMenuItem = {
                name: this.pathToComponents + "AddLinkMenuItem",
                config: {
                    documentNodeRef: this.documentNodeRef
                }
            };

            var EditLinkMenuItem = {
                name: this.pathToComponents + "EditLinkMenuItem",
                config: {
                    parentNodeRef: this.documentNodeRef
                }
            };

            var DeleteLinkMenuItem = {
                name: this.pathToComponents + "DeleteLinkMenuItem",
                config: {
                    parentNodeRef: this.documentNodeRef
                }
            };

            this.widgets = [
                                AddLinkMenuItem,
                                EditLinkMenuItem,
                                DeleteLinkMenuItem
                           ];

            this.inherited(arguments);
         },

         setState: function (payload) {
             this.state = payload.state;
             switch (this.state) {
                 case "":
                     break;
                 default:
                     break;
             }
         },

         disableMenu: function (payload) {
             var isDisable = payload.isDisable;
             var menuBarWidgets = this._processingWidgets; //AlfMenuBar widgets
             menuBarWidgets.forEach(function (item) {
                 item.setDisabled((isDisable) ? true : false);
             });
         }
    });
});