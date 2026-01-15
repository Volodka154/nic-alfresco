define(["dojo/_base/declare",
    "meeting/forms/_DynamicForm",
    "dijit/_TemplatedMixin",
    "dojo/text!./templates/Links.html",
    "meeting/utils/base",
    "alfresco/core/topics",
    "dojo/_base/lang"

],function (declare, DynamicForm, _TemplatedMixin, template, utilBase, topics, lang) {

    return declare([DynamicForm, _TemplatedMixin], {
        templateString: template,
        state: "",

        postMixInProperties: function () {
            this.uid = Math.random().toString(36).substr(2, 9) + "-grid-version-link";
            this.uidGrid = this.uid + "_links-grid";
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
                    name: "meeting/forms/controlLinksForm/menus/MainMenuBar",
                    config: {
                       storeId: this.storeId,
                       gridId: this.uidGrid,
                       documentNodeRef: this.documentNodeRef
                    }
                },
                {
                    name: "alfresco/forms/ControlRow",
                    config: {
                        widgets: [
                            {
                                name: "meeting/layout/ClassicWindow",
                                //widthPx: "770",
                                config: {
                                    title: "Ссылки:",
                                    type: "primary",
                                    widgets: [
                                        {
                                            name: "meeting/forms/controlLinksForm/Grid/LinksGrid",
                                            config: {
                                                documentNodeRef: this.documentNodeRef,
                                                uidGrid: this.uidGrid
                                               // hideHeader: true
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

        renderAttach: function (){}
    });
});