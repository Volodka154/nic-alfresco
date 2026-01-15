define(["dojo/_base/declare",
        "alfresco/core/Core",
        "dojo/_base/lang",
        "alfresco/core/CoreXhr",
        "service/constants/Default",
        "jquery"],
    function (declare, Core, lang, CoreXhr, AlfConstants, $) {

        return declare([Core, CoreXhr], {

            newNotification: {},

            constructor: function Notification_Form__constructor(args) {
                lang.mixin(this, args);
                this.alfSubscribe("BTL_CREATE_NOTIFICATION", lang.hitch(this, this.createNotification));
                this.alfSubscribe("BTL_EDIT_NOTIFICATION", lang.hitch(this, this.editFormNotification));
                this.alfSubscribe("BTL_CREATE_FORM_NOTIFICATION", lang.hitch(this, this.onCreateFormNotification));
            },
            createNotification: function Notification_Form__create(payload) {
                this.alfLog("log", "Notification_Form__create", payload);
                // console.log("payload = " + payload);
                this.newNotification.title = payload["prop_btl-notification_title"];
                this.newNotification.author = this.userFullName;
                this.newNotification.content = payload["prop_btl-notification_content"];
                this.newNotification.release = payload["prop_btl-notification_release"];
                this.newNotification.comment = payload["prop_btl-notification_comment"];
                this.serviceXhr({
                    url: "/share/proxy/alfresco/api/type/btl-notification:inDictionaries/formprocessor",
                    method: "POST",
                    data: {
                        "alf_destination": payload.alf_destination,
                        "prop_btl-notification_title": payload["prop_btl-notification_title"],
                        "prop_btl-notification_release": payload["prop_btl-notification_release"],
                        "prop_btl-notification_comment": payload["prop_btl-notification_comment"],
                        "prop_btl-notification_author": this.userFullName,
                        "prop_btl-notification_content": payload["prop_btl-notification_content"]
                    },
                    successCallback: this.updateNotificationGrid,
                    callbackScope: this
                });
            },
            updateNotificationGrid: function Notification_Form__updateGrid(response, originalRequestConfig){
                this.newNotification.nodeRef = response.persistedObject;
                this.alfLog("log", "Notification_Form__updateGrid", this);
                this.alfPublish("DATAGRID_ADD_ROW",{
                    nodeRef: this.newNotification.nodeRef,
                    title: this.newNotification.title,
                    author: this.newNotification.author,
                    content: this.newNotification.content,
                    release: this.newNotification.release,
                    comment: this.newNotification.comment
                });
                this.sendNotifications(this.newNotification.nodeRef);
            },
            editFormNotification: function btl_FormNotification__editNotification(payload) {

                this.alfLog("log", "btl_FormNotification__editNotification", payload);

                this.newNotification.rowId = payload["rowId"];
                this.newNotification.title = payload["prop_btl-notification_title"];
                this.newNotification.author = this.userFullName;
                this.newNotification.content = payload["prop_btl-notification_content"];
                this.newNotification.release = payload["prop_btl-notification_release"];
                this.newNotification.comment = payload["prop_btl-notification_comment"];

                this.serviceXhr({
                    url: "/share/proxy/alfresco/api/node/"+ payload.nodeRef.replace("://", "/") +"/formprocessor",
                    method: "POST",
                    data: {
                        "alf_destination": payload.alf_destination,
                        "prop_btl-notification_title": payload["prop_btl-notification_title"],
                        "prop_btl-notification_release": payload["prop_btl-notification_release"],
                        "prop_btl-notification_comment": payload["prop_btl-notification_comment"],
                        "prop_btl-notification_author": this.userFullName,
                        "prop_btl-notification_content": payload["prop_btl-notification_content"]
                    },
                    successCallback: this.alfPublish("DATAGRID_EDIT_ROW", this.newNotification),
                    callbackScope: this
                });
            },
            onCreateFormNotification: function alfresco__onCreateFormNotification(data) {
                this.alfLog("log", "alfresco__onCreateFormNotification", data);

                this.data = data.data;
                this.userFullName = data.userName;
                this.rootNodeRef = data.rootNodeRef;
                var payload = {};

                payload.dialogTitle = data.config.dialogTitle;
                payload.dialogConfirmationButtonTitle = data.config.dialogConfirmationButtonTitle;
                payload.dialogCancellationButtonTitle = data.config.dialogCancellationButtonTitle;
                payload.formSubmissionTopic = data.config.formSubmissionTopic;
                payload.widgets = this.getWidgets();

                $("body").on( "click", ".mce-window", function(event) {
                    $(this).addClass( "dijitPopup" );
                    if(event.target.tagName === "INPUT"){
                        event.target.focus();
                    }
                });

                this.alfLog("log", "alfresco__onCreateFormNotification", payload);
                this.alfPublish("ALF_CREATE_FORM_DIALOG_REQUEST", payload);
            },
            getWidgets: function alfresco__getWidgets() {
                var widgets = [{
                    name: "alfresco/forms/controls/DojoValidationTextBox",
                    id: "btl-notification_title",
                    config: {
                        label: "btl-notification_title.title",
                        name: "prop_btl-notification_title",
                        value: (this.data !== null) ? this.data.title : "",
                        requirementConfig: {
                            initialValue: true
                        }
                    }
                },
                {
                    name: "alfresco/forms/controls/DojoValidationTextBox",
                    id: "btl-pos_release",
                    config: {
                        label: "btl-notification_release.title",
                        name: "prop_btl-notification_release",
                        value: (this.data !== null) ? this.data.release : ""
                    }
                },
                {
                    name: "alfresco/forms/controls/DojoValidationTextBox",
                    id: "btl-pos_comment",
                    config: {
                        label: "btl-notification_comment.title",
                        name: "prop_btl-notification_comment",
                        value: (this.data !== null) ? this.data.comment : ""
                    }
                },
                {
                    name: "btl/widgets/base/TinyMCE",
                    id: "btl-pos_rang",
                    config: {
                        label: "btl-notification_content.title",
                        name: "prop_btl-notification_content",
                        value: (this.data !== null) ? this.data.content : "",
                        defaultEditorConfig:{
                            menu: null,
                            toolbar: null
                        }
                    }
                }
                ];

                if (this.data !== null) {
                    widgets.push({
                            name: "alfresco/forms/controls/DojoValidationTextBox",
                            config: {
                                name: "nodeRef",
                                value: this.data.nodeRef,
                                visibilityConfig: {
                                    initialValue: false
                                }
                            }
                        },
                        {
                            name: "alfresco/forms/controls/DojoValidationTextBox",
                            config: {
                                name: "rowId",
                                value: this.data.rowId,
                                visibilityConfig: {
                                    initialValue: false
                                }
                            }
                        });
                }
                else {
                    widgets.push({
                        name: "alfresco/forms/controls/DojoValidationTextBox",
                        config: {
                            name: "alf_destination",
                            value: this.rootNodeRef,
                            visibilityConfig: {
                                initialValue: false
                            }
                        }
                    });
                }
                return widgets;
            },

            sendNotifications: function (parentNotificationNodeRef) {
                var query = {};
                query["nodeRef"] = parentNotificationNodeRef;
                var config = {
                    url: AlfConstants.PROXY_URI + "notification/send-notification",
                    query: query,
                    method: "GET",
                    successCallback: this.sendNotificationsSuccess,
                    failureCallback: this.sendNotificationsFailure,
                    callbackScope: this
                };
                this.serviceXhr(config);
            },
            sendNotificationsSuccess: function (response) {

            },
            sendNotificationsFailure: function () {

            }
        });
    });