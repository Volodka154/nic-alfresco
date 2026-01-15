/**
 * Created by nabokov on 09.12.2016.
 */
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
        
        isClerk: false,
        isAdmin: false,
        isSecretary: false,
        isChairman : false,
        
        pathToComponents: "meeting/forms/controlAttachmentsForm/MenuItems/",

        postMixInProperties: function () {
            this.inherited(arguments);
            
            
            var store = utilBase.getStoreById("MEETING_STORE");	                
            handleAlfSubscribe = store.handleAlfSubscribe;  
            
            
            handleAlfSubscribe.push(this.alfSubscribe("CHANGE_STATE_MEETING_DOCUMENT", lang.hitch(this, this.setState), true));
            handleAlfSubscribe.push(this.alfSubscribe("SELECT_ROW_ATTACHMENTS_TREE_GRID", lang.hitch(this, this.changeStageMenuBar), true));
            
            
            this.initFirstRowHandle = this.alfSubscribe("ALF_WIDGET_PROCESSING_COMPLETE", lang.hitch(this, this.initFirstRow), true);
            
            handleAlfSubscribe.push(this.initFirstRowHandle);
            
            //topic.subscribe("SELECT_ROW_ATTACHMENTS_TREE_GRID", this.changeStageMenuBar.bind(this));
            
            
        },

        initFirstRow: function () {
            if(this.widgetProcessingComplete){
            	
            	this.alfPublish("TRIGGER_CURRENT_ROW_DATA_ATTACHMENTS", {}, true);
            	
                //topic.publish("TRIGGER_CURRENT_ROW_DATA_ATTACHMENTS", {});
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
                        if (complete.json.item.permissions.userAccess["create"] != true) {
                            this.alfPublish(this.pubSubScope + "IS_READ_ONLY_ATTACHMENTS",{}, true);
                            this.isReadOnly = true;
                        }
                    },
                    scope: this
                }
            });
        },

        changeStageMenuBar: function (payload) {
        	
        	//if(!this.isReadOnly && (isClerk || isAdmin || isSecretary )){
            if(!this.isReadOnly && payload && payload.nodeRef){
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
            var AddAttachments = {
                name: this.pathToComponents + "AddAttachments",
                config: {
                    documentNodeRef: this.documentNodeRef
                }
            };

            var UploadNewVersionAttachment = {
                name: this.pathToComponents + "UploadNewVersionAttachment",
                config: {
                    documentNodeRef: this.documentNodeRef
                }
            };

            var UploadFromScanerMenuItem = {
                name: this.pathToComponents + "UploadFromScanerMenuItem",
                config: {
                    parentNodeRef: this.documentNodeRef
                }
            };

            var RefreshAttachmentsMenuItem = {
                name: this.pathToComponents + "RefreshAttachmentsMenuItem",
                config: {
                    parentNodeRef: this.documentNodeRef
                }
            };

            var DeleteAttachmentsMenuItem = {
                name: this.pathToComponents + "DeleteAttachmentsMenuItem",
                config: {
                    parentNodeRef: this.documentNodeRef
                }
            };

            var EditOnlineAttachmentsMenuItem = {
                name: this.pathToComponents + "EditOnlineAttachmentsMenuItem"
            };

            var EditOfflineAttachmentsMenuItem = {
                name: this.pathToComponents + "EditOfflineAttachmentsMenuItem"
            };

            var DownloadAttachmentsMenuItem = {
                name: this.pathToComponents + "DownloadAttachmentsMenuItem"
            };

            
            var CancelEditingAttachmentsMenuItem = {
                    name: this.pathToComponents + "CancelEditingAttachmentsMenuItem"
                };
            
            if (this.isClerk || this.isAdmin || this.isSecretary || this.isChairman)
        	{
	            this.widgets = [
					                AddAttachments,
					                UploadNewVersionAttachment,
					                UploadFromScanerMenuItem,
					                EditOnlineAttachmentsMenuItem,
					                EditOfflineAttachmentsMenuItem,
					                CancelEditingAttachmentsMenuItem,
					                DeleteAttachmentsMenuItem,
					                RefreshAttachmentsMenuItem,
					                DownloadAttachmentsMenuItem,
					            ];
        	}
            else
        	{
            	 this.widgets = [            		                
            		                RefreshAttachmentsMenuItem,
            		                DownloadAttachmentsMenuItem
            		            ];
        	}

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
        	//console.log("222222");
            var isDisable = payload.isDisable;
            var menuBarWidgets = this._processingWidgets; //AlfMenuBar widgets
            menuBarWidgets.forEach(function (item) {
                item.setDisabled((isDisable) ? true : false);
            });
        }
    });
});