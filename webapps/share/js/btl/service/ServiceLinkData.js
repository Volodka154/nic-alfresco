define(["dojo/_base/declare",
        "alfresco/core/Core",
        "dojo/_base/lang",
        "alfresco/core/CoreXhr",
        "service/constants/Default"],
    function (declare, Core, lang, CoreXhr, AlfConstants) {
        return declare([Core, CoreXhr], {
            data: {},
            rootNodeRef: null,
            type: "btl-link%3alinkDataType",
            newLink: {},
            constructor: function btl_EmployeeService__constructor(args) {
                lang.mixin(this, args);
                this.alfSubscribe("BTL_CREATE_LINK_DATA", lang.hitch(this, this.createLinkData));
                this.alfSubscribe("BTL_CREATE_FORM_LINK_DATA", lang.hitch(this, this.onCreateFormlinkType));
                this.alfSubscribe("BTL_EDIT_LINK_DATA", lang.hitch(this, this.editLinkData));
            },
            createLinkData: function btl_createLinkDataService__createLinkData(payload) {
                this.alfLog("log", "btl_createLinkDataService__createLinkData", payload);
                this.newLink.link_val = payload["assoc_btl-link_link_val"];
                this.newLink.link_ref = payload["assoc_btl-link_link"];
                this.newLink.relink_val = payload["assoc_btl-link_relink_val"];
                this.newLink.relink_ref = payload["assoc_btl-link_relink"];
                this.newLink.docType = payload["prop_btl-link_docType"];
                this.newLink.docTypeRelink = payload["prop_btl-link_docTypeRelink"];
                this.serviceXhr({
                    url: "/share/proxy/alfresco/api/type/" + this.type + "/formprocessor",
                    method: "POST",
                    data: {
                        "alf_destination": payload.alf_destination,
                        "assoc_btl-link_link_added": payload["assoc_btl-link_link_added"],
                        "assoc_btl-link_link_removed": payload["assoc_btl-link_link_removed"],
                        "assoc_btl-link_relink_added": payload["assoc_btl-link_relink_added"],
                        "assoc_btl-link_relink_removed": payload["assoc_btl-link_relink_removed"],
                        "prop_btl-link_docType": payload["prop_btl-link_docType"],
                        "prop_btl-link_docTypeRelink": payload["prop_btl-link_docTypeRelink"]
                    },
                    successCallback: this.updateLinkDataGrid,
                    callbackScope: this
                });
            },
            updateLinkDataGrid: function btl_LinkDataService__updateLinkDataGrid(response, originalRequestConfig) {
                this.alfLog("log", "btl_LinkDataService__updateLinkDataGrid", originalRequestConfig);
                this.newLink.nodeRef = response.persistedObject;
                this.alfPublish("DATAGRID_ADD_ROW", {
                    nodeRef: this.newLink.nodeRef,
                    link_val: this.newLink.link_val,
                    link_ref: this.newLink.link_ref,
                    relink_val: this.newLink.relink_val,
                    relink_ref: this.newLink.relink_ref,
                    docType_text: this.valueToText(this.newLink.docType),
                    docType: this.newLink.docType,
                    docTypeRelink_text: this.valueToText(this.newLink.docTypeRelink),
                    docTypeRelink: this.newLink.docTypeRelink
                });
            },
            editLinkData: function btl_LinkDataService__editLinkData(payload) {
                this.alfLog("log", "btl_LinkDataService__editLinkData", payload);
                this.newLink.rowId = payload["rowId"];
                this.newLink.link_val = payload["assoc_btl-link_link_val"];
                this.newLink.link_ref = payload["assoc_btl-link_link"];
                this.newLink.relink_val = payload["assoc_btl-link_relink_val"];
                this.newLink.relink_ref = payload["assoc_btl-link_relink"];
                this.newLink.docType = payload["prop_btl-link_docType"];
                this.newLink.docType_text = this.valueToText(payload["prop_btl-link_docType"]);
                this.newLink.docTypeRelink = payload["prop_btl-link_docTypeRelink"];
                this.newLink.docTypeRelink_text = this.valueToText(payload["prop_btl-link_docTypeRelink"]);
                this.serviceXhr({
                    url: "/share/proxy/alfresco/api/node/" + payload.nodeRef.replace("://", "/") + "/formprocessor",
                    method: "POST",
                    data: {
                        "assoc_btl-link_link_added": payload["assoc_btl-link_link_added"],
                        "assoc_btl-link_link_removed": payload["assoc_btl-link_link_removed"],
                        "assoc_btl-link_relink_added": payload["assoc_btl-link_relink_added"],
                        "assoc_btl-link_relink_removed": payload["assoc_btl-link_relink_removed"],
                        "prop_btl-link_docType": payload["prop_btl-link_docType"],
                        "prop_btl-link_docTypeRelink": payload["prop_btl-link_docTypeRelink"]
                    },
                    successCallback: this.alfPublish("DATAGRID_EDIT_ROW", this.newLink),
                    callbackScope: this
                });
            },
            onCreateFormlinkType: function alfresco_formLinkData__onCreateFormlinkType(data) {
                this.alfLog("log", "alfresco_formLinkData__onCreateFormLinkData", data);
                this.data = data.data;
                this.rootNodeRef = data.rootNodeRef;
                var payload = {};
                payload.dialogTitle = data.config.dialogTitle;
                payload.dialogId = "FORM_LINK_TYPE";
                payload.contentWidth = "650px";
                payload.dialogConfirmationButtonTitle = data.config.dialogConfirmationButtonTitle;
                payload.dialogCancellationButtonTitle = data.config.dialogCancellationButtonTitle;
                payload.formSubmissionTopic = data.config.formSubmissionTopic;
                payload.widgets = this.getWidgets();
                this.alfLog("log", "alfresco_formLinkData__onCreateFormLinkData", payload);
                this.alfPublish("ALF_CREATE_FORM_DIALOG_REQUEST", payload);
            },
            valueToText: function alfresco_formLinkData__valueToText(value) {
                var text = "";
                switch (value) {
                    case "btl-project:projectDataType":
                        text = "Проект";
                        break;
                    case "btl-incomming:documentDataType":
                        text = "Входящий";
                        break;
                    case "btl-outgoing:documentDataType":
                        text = "Исходящий";
                        break;
                    case "btl-internal:documentDataType":
                        text = "Внутренний";
                        break;
                    case "btl-meeting:meetingDataType":
                        text = "Мероприятие";
                        break;
                    case "btl-contract:contractTypeData":
                        text = "Договор";
                        break;
                    case "0":
                        text = "Резолюция по Входящему";
                        break;
                    case "1":
                        text = "Задание по исходящему";
                        break; 
                    case "2":
                        text = "Резолюция по внутреннему";
                        break;
                    case "3":
                        text = "Задание по проекту";
                        break;
                    case "4":
                        text = "Инициативное задание";
                        break;
                    case "5":
                        text = "НТД";
                        break;
                    case "6":
                        text = "Дела проектов";
                        break;
                    case "7":
                        text = "ОРД";
                        break;
                    case "8":
                        text = "Задание по ОРД";
                        break;
                                                              
                }
                return text;
            },
            getWidgets: function alfresco_formLinkData__getWidgets() {
                var widgets = [];
                var link = {
                    name: "alfresco/forms/controls/DojoValidationTextBox",
                    config: {
                        label: "Ссылка",
                        name: "prop_btl-link_link",
                        value: (this.data !== null) ?
                            this.data.link :
                            "",
                        requirementConfig: {
                            initialValue: true
                        }
                    }
                };
                //--------требуется для коректного отображения модуля btl/widgets/base/ItemPicker---------------------------------
                var buf = {
                    name: "alfresco/buttons/AlfButton",
                    config: {
                        widgets: [
                            {
                                name: "alfresco/forms/controls/SimplePicker"
                            }
                        ]
                    }
                };
                var refTolink = {
                    name: "btl/widgets/base/ItemPicker",
                    config: {
                        name: "assoc_btl-link_link",
                        value: (this.data !== null) ?
                            this.data.link_ref :
                            "",
                        labelText: "Ссылка",
                        labelButton: "...",
                        labelPicker: "Выбрать",
                        pickedItemsLabel: "Текущая",
                        availableItemsLabel: "Доступные",
                        propertyToRender: "name",
                        url: "search/linktype",
                        itemUrl: "/share/proxy/alfresco/picker/linkItem?nodeRef="
                    }
                };
                /*var refTolink = {
                 name:"btl/widgets/base/btlChoice",
                 id: "ASSOC_BTL_LINK_LINK",
                 config:{
                 name: "assoc_btl-link_link",
                 header: "Выбрать ссылку",
                 value: (this.data !== null) ? this.data.link_ref  : "",
                 labelText: "Ссылка n",
                 labelButton: "...",
                 renderData: "items",
                 search: false,
                 propertyToRender:"name",
                 urlList: "/share/proxy/alfresco/search/linktype",
                 itemUrl:"/share/proxy/alfresco/picker/linkItem"
                 }
                 };*/
                var relink = {
                    name: "alfresco/forms/controls/DojoValidationTextBox",
                    config: {
                        label: "Обратная ссылка",
                        name: "prop_btl-link_relink",
                        value: (this.data !== null) ?
                            this.data.relink :
                            "",
                        requirementConfig: {
                            initialValue: true
                        }
                    }
                };
                var refTorelink = {
                    name: "btl/widgets/base/ItemPicker",
                    config: {
                        name: "assoc_btl-link_relink",
                        value: (this.data !== null) ?
                            this.data.relink_ref :
                            "",
                        labelText: "Обратная ссылка",
                        labelButton: "...",
                        labelPicker: "Выбрать",
                        pickedItemsLabel: "Текущая",
                        availableItemsLabel: "Доступные",
                        propertyToRender: "name",
                        url: "search/linktype",
                        itemUrl: "/share/proxy/alfresco/picker/linkItem?nodeRef="
                    }
                };
                var docType = {
                    name: "alfresco/forms/controls/Select",
                    config: {
                        fieldId: "docType",
                        label: "Тип ссылки",
                        //description: "Выберете вид документа для ссылки",
                        name: "prop_btl-link_docType",
                        width: "400px",
                        value: (this.data !== null) ?
                            this.data.docType :
                            "btl-project:projectDataType",
                        optionsConfig: {
                            fixed: [
                                {label: "Проект", value: "btl-project:projectDataType"},
                                {label: "Входящий", value: "btl-incomming:documentDataType"},
                                {label: "Исходящий", value: "btl-outgoing:documentDataType"},
                                {label: "Внутренний", value: "btl-internal:documentDataType"},
                                {label: "Резолюция по Входящему", value: "0"},
                                {label: "Задание по исходящему", value: "1"},
                                {label: "Резолюция по внутреннему", value: "2"},
                                {label: "Задание по проекту", value: "3"},
                                {label: "Инициативное задание", value: "4"},
                                {label: "НТД", value: "5"},
                                {label: "Дела проектов", value: "6"},
                                {label: "Орд", value: "7"},
                                {label: "Задание по ОРД", value: "8"},
                                {label: "Мероприятие", value: "btl-meeting:meetingDataType"},
                                {label: "Договор", value: "btl-contract:contractTypeData"}
                            ]
                        }
                    }
                };
                var docTypeRelink = {
                    name: "alfresco/forms/controls/Select",
                    config: {
                        fieldId: "docType",
                        label: "Тип обратной ссылки",
                        //description: "Выберете вид документа для ссылки",
                        name: "prop_btl-link_docTypeRelink",
                        width: "400px",
                        value: (this.data !== null) ?
                            this.data.docTypeRelink :
                            "btl-project:projectDataType",
                        optionsConfig: {
                            fixed: [
                                {label: "Проект", value: "btl-project:projectDataType"},
                                {label: "Входящий", value: "btl-incomming:documentDataType"},
                                {label: "Исходящий", value: "btl-outgoing:documentDataType"},
                                {label: "Внутренний", value: "btl-internal:documentDataType"},
                                {label: "Резолюция по Входящему", value: "0"},
                                {label: "Задание по исходящему", value: "1"},
                                {label: "Резолюция по внутреннему", value: "2"},
                                {label: "Задание по проекту", value: "3"},
                                {label: "Инициативное задание", value: "4"},
                                {label: "НТД", value: "5"},
                                {label: "Дела проектов", value: "6"},
                                {label: "Орд", value: "7"},
                                {label: "Задание по ОРД", value: "8"},
                                {label: "Мероприятие", value: "btl-meeting:meetingDataType"},
                                {label: "Договор", value: "btl-contract:contractTypeData"}
                            ]
                        }
                    }
                };
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
                var rowInfo = {
                    name: "alfresco/forms/ControlRow",
                    widthPx: 200,
                    config: {
                        widgets: []
                    }
                };
                var rowInfoRelink = {
                    name: "alfresco/forms/ControlRow",
                    widthPx: 200,
                    config: {
                        widgets: []
                    }
                };
                var rowLink = {
                    name: "alfresco/forms/ControlRow",
                    widthPx: 400,
                    config: {
                        widgets: []
                    }
                };
                var rowRelink = {
                    name: "alfresco/forms/ControlRow",
                    widthPx: 400,
                    config: {
                        widgets: []
                    }
                };
                rowInfo.config.widgets.push(docType);
                rowInfoRelink.config.widgets.push(docTypeRelink);
                rowLink.config.widgets.push(rowInfo, refTolink);
                rowRelink.config.widgets.push(rowInfoRelink, refTorelink);
                widgets.push(rowLink, rowRelink);
                return widgets;
            }
        });
    });