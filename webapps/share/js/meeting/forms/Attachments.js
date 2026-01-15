/**
 * Created by nabokov on 23.11.2016.
 */
define(["dojo/_base/declare",
    "meeting/forms/_DynamicForm",
    "dijit/_TemplatedMixin",
    "dojo/text!./templates/Attachments.html",
    "meeting/utils/base",
    "alfresco/core/topics",
    "dojo/_base/lang"

], function (declare, DynamicForm, _TemplatedMixin, template, utilBase, topics, lang) {

    return declare([DynamicForm, _TemplatedMixin], {
        templateString: template,
        state: "",

        isClerk: false,
        isAdmin: false,
        isSecretary: false,
        isChairman: false,
        
        
        postMixInProperties: function () {
            this.uid = Math.random().toString(36).substr(2, 9) + "-tree-version-attach";
            this.uidPreview = this.uid + "_attachments-preview";
            this.uidGrid = this.uid + "_attachments-grid";
            this.inherited(arguments);
        },

        postCreate: function () {
            this.alfSubscribe("CHANGE_STATE_MEETING_DOCUMENT", lang.hitch(this, this.setState), true);

            if (this.storeId) {
                var store = utilBase.getStoreById(this.storeId);
                if (store.document) {
                    this.documentNodeRef = store.nodeRef;
                    this.state = store.state;
                }
            }

            this.widgets = [
                {
                    name: "meeting/forms/controlAttachmentsForm/menus/MainMenuBar",
                    config: {
                       storeId: this.storeId,
                       gridId: this.uidGrid,
                       isClerk:this.isClerk,
			           isAdmin:this.isAdmin,
			           isSecretary:this.isSecretary,
			           isChairman:this.isChairman
                    }
                },
                {
                    name:"btlUI/MenuBar/ECPAllMenuBar",
                    config:{
                        parentNodeRef:this.documentNodeRef
                    }
                },
                {
                    name: "alfresco/forms/ControlRow",
                    config: {
                        widgets: [
                            {
                                name: "meeting/layout/ClassicWindow",
                                widthPx: "770",
                                config: {
                                    title: "Файлы документа:",
                                    type: "primary",
                                    widgets: [
                                        {
                                            name: "meeting/forms/controlAttachmentsForm/TreeGrid/AttachmentsTreeGrid",
                                            config: {
                                                parentNodeRef: this.documentNodeRef,
                                                formId: this.uidGrid ,
                                                filePreviewContainerId:this.uidPreview,
                                                hideHeader: true
                                            }
                                        },
                                    ]
                                }
                            },
                            {
                                name: "meeting/layout/ClassicWindow",
                                config: {
                                    title: "Предпросмотр:",
                                    type: "success",
                                    widgets: [
                                        {
                                            name: "btlUI/Container/FilePreviewContainer",
                                            id: this.uidPreview,
                                            config: {
                                                idPosition: this.uidPreview
                                            }
                                        },

                                    ]
                                }
                            }
                        ]
                    }
                }
            ];
            //Добаляем виджеты до вызова конструктора
            this.inherited(arguments);


            this.setState({state: this.state, access: this.access});
        },

        setState: function (payload) {
            this.state = payload.state;
            if (payload.nodeRef) {
                this.documentNodeRef = payload.nodeRef;
            }
            switch (this.state) {
                case "":

                    break;
                default :
                    if (this.documentNodeRef) {
                        this.renderAttach();
                    } else {
                        console.error("Не удалось получить NodeRef документа");
                    }
                    break;
            }
        },

        renderAttach: function () {

            /*var attachTree = new AttachmentsTreeGrid({
             parentNodeRef: this.documentNodeRef,
             formId: this.id,
             }).placeAt(this.attachmentsGrid);*/

            /* var containerFilePreview = new FilePreviewContainer({
             idPosition: "attachments-preview"
             });*/
        }

    });
});