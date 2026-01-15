/**
 * Created by nabokov on 23.11.2016.
 */
define(["dojo/_base/declare",
        "alfresco/core/Core",
        "../../../grids/_Grid",
        "dojo/_base/lang",
        "alfresco/core/CoreXhr",
        "meeting/utils/base"],
    function (declare, Core, DataGrid, lang, CoreXhr, utilBase) {
        return declare([DataGrid], {

            Url: "get-children-protocol",
            type: "btl-meetingProtocol:meetingProtocolDataType",
            pageModel: {location: "remote", rPP: 10, strRpp: "{0}", rPPOptions: [10, 25, 50]},

            colModel: [
                {title: "nodeRef", width: 100, dataType: "string", dataIndx: "nodeRef", hidden: true},
                //{title: "Номер", width: 50, dataType: "string", dataIndx: "prop_btl-meetingProtocol_numberProtocol"},
                {title: "Вопрос", width: 200, dataType: "string", dataIndx: "assoc_btl-meetingProtocol_question_val"},
                {
                    title: "Вопрос",
                    width: 200,
                    dataType: "string",
                    dataIndx: "assoc_btl-meetingProtocol_question_added",
                    hidden: true
                },
                {title: "Решение", width: 200, dataType: "string", dataIndx: "prop_btl-meetingProtocol_decision"},
                {
                    title: "Ответственный",
                    width: 130,
                    dataType: "string",
                    dataIndx: "assoc_btl-meetingProtocol_employee_val"
                },
                {
                    title: "Ответственный",
                    width: 200,
                    dataType: "string",
                    dataIndx: "assoc_btl-meetingProtocol_employee_added",
                    hidden: true
                },
                {title: "Срок исполнения", width: 100, dataType: "date", dataIndx: "prop_periodOfExecution"},
                {
                    title: "Требуется контроль",
                    width: 50,
                    dataType: "string",
                    dataIndx: "prop_btl-meetingProtocol_onControl",
                    hidden: true
                },
                {
                    title: "Требуется контроль",
                    width: 50,
                    dataType: "string",
                    dataIndx: "prop_btl-meetingProtocol_onControl_img"
                },
                {
                    title: "Контролер",
                    width: 130,
                    dataType: "string",
                    dataIndx: "assoc_btl-meetingProtocol_controller_val"
                },
                {
                    title: "Контролер",
                    width: 200,
                    dataType: "string",
                    dataIndx: "assoc_btl-meetingProtocol_controller_added",
                    hidden: true
                },
                {
                    title: "", width: 50,
                    render: function (ui) {
                        return '<div style="margin: 0 auto; width: 24px;">' +
                            '<button type="button" title="Удалить" class="delete-btn" role="button">'
                            + '<span class="delete-btn-icon"></span>'
                            + '</button></div>';
                    }
                }
            ],


            postMixInProperties: function () {
                this.inherited(arguments);


                var store = utilBase.getStoreById("MEETING_STORE");
                handleAlfSubscribe = store.handleAlfSubscribe;

                handleAlfSubscribe.push(this.alfSubscribe("BTL_CREATE_FORM_PROTOCOL", lang.hitch(this, this.onCreateFormProtocol), true));
                handleAlfSubscribe.push(this.alfSubscribe("ADD_PROTOCOL_MEETING_PROGRAMM_TOPIC", lang.hitch(this, this.addProtocol), true));
                handleAlfSubscribe.push(this.alfSubscribe("EDIT_PROTOCOL_MEETING_PROGRAMM_TOPIC", lang.hitch(this, this.editProtocol), true));
                handleAlfSubscribe.push(this.alfSubscribe("ALF_EDIT_PROTOCOL", lang.hitch(this, this.editFormProtocol), true));
                handleAlfSubscribe.push(this.alfSubscribe("PROTOCOL_PANE_MAIN_FORM_MEETING_SHOW", lang.hitch(this, this.showData), true));
                handleAlfSubscribe.push(this.alfSubscribe(this.id + "DELETE_ROW__SUCCESS", lang.hitch(this, this.deleteRowSuccess), true));


                if (!this.state && this.storeId) {
                    var store = utilBase.getStoreById(this.storeId);
                    if (store.document) {
                        this.documentNodeRef = store.nodeRef;
                        this.rootNodeRef = this.documentNodeRef;
                    }
                }

            },

            postCreate: function () {

                var _this = this;
                this.inherited(arguments);

                //use refresh & refreshRow events to display jQueryUI buttons and bind events.
                this.grid.on('pqgridrefresh pqgridrefreshrow', function () {
                    var $grid = $(this);

                    //delete button

                    var deleteButtons = $grid.find("button.delete-btn");

                    if (!_this.documentNodeRef || _this._disabled) {
                        deleteButtons.css("display", "none");
                    }

                    deleteButtons.unbind("click")
                        .bind("click", function (evt) {
                            var $tr = $(this).closest("tr"),
                                rowIndx = $grid.pqGrid("getRowIndx", {$tr: $tr}).rowIndx;
                            //console.log("rowIndx = " + rowIndx);
                            _this.deleteRow(rowIndx, $grid);
                        });
                });
            },

            setEventsDataGrid: function () {
                var _this = this;
                if (!_this._disabled) {
                    this.grid.pqGrid({
                        rowDblClick: function (event, ui) {
                            _this.editFormProtocol();
                        }
                    });
                }
                //window.employeeDG = this.grid;
            },

            deleteRow: function (rowIndx, $grid) {
                //Если документ существует, то сразу добавляем новых пользователей в документ
                if (this.documentNodeRef) {
                    var rowData = $grid.pqGrid("getRowData", {rowIndx: rowIndx});
                    this.alfPublish("ALF_CRUD_DELETE", {
                        requiresConfirmation: true,
                        url: "slingshot/datalists/list/node/" + rowData["nodeRef"].replace("://", "/"),
                        confirmationTitle: "Удаление протокола",
                        responseTopic: this.id + "DELETE_ROW",
                        noRefresh: true,
                        item: {rowIndx: rowIndx},
                        confirmationPrompt: "Вы уверены что хотите удалить протокол " + rowData["prop_btl-meetingProtocol_decision"] + "?",
                        successMessage: "Протокол " + rowData["prop_btl-meetingProtocol_decision"] + " успешно удален."
                    }, true);
                } else {
                    this.grid.pqGrid("deleteRow", {rowIndx: rowIndx});
                }
            },


            deleteRowSuccess: function (payload) {
                this.grid.pqGrid("deleteRow", {rowIndx: payload.data.data.item.rowIndx});
            },


            editFormProtocol: function () {
                var arr = this.grid.pqGrid("selection", {type: 'row', method: 'getSelection'});
                if (arr && arr.length > 0) {
                    var row = arr[0].rowData;
                    var data = {};
                    data.config = {};
                    data.data = row;
                    data.data.rowId = arr[0].rowIndx;
                    data.config.dialogTitle = "Редактировать протокол";
                    data.config.dialogConfirmationButtonTitle = "Сохранить";
                    data.config.dialogCancellationButtonTitle = "Отмена";
                    if (data.data["prop_periodOfExecution"]) {
                        var a = data.data["prop_periodOfExecution"];
                        if (a.substr(2, 1) == ".")
                            data.data["prop_periodOfExecution"] = a.substr(6, 4) + "-" + a.substr(3, 2) + "-" + a.substr(0, 2);
                    }
                    data.config.formSubmissionTopic = "EDIT_PROTOCOL_MEETING_PROGRAMM_TOPIC";
                    this.alfPublish("BTL_CREATE_FORM_PROTOCOL", data, true);
                }
            },

            editProtocol: function (payload) {

                // console.log(payload);
                var updateRow = {};

                var img = "Нет";


                if (payload["prop_btl-meetingProtocol_onControl"]) {
                    img = "Да";
                } else if (payload["assoc_btl-meetingProtocol_controller"]) {
                    payload["assoc_btl-meetingProtocol_controller_removed"] = payload["assoc_btl-meetingProtocol_controller"];
                    payload["assoc_btl-meetingProtocol_controller"] = "";
                    payload["assoc_btl-meetingProtocol_controller_added"] = "";
                    payload["assoc_btl-meetingProtocol_controller_val"] = "";
                }

                var periodOfExecution = payload["prop_btl-meetingProtocol_periodOfExecution"];
                if (periodOfExecution) {
                    updateRow["prop_btl-meetingProtocol_periodOfExecution"] = payload["prop_btl-meetingProtocol_periodOfExecution"];
                    periodOfExecution = periodOfExecution.substr(8, 2) + "." + periodOfExecution.substr(5, 2) + "." + periodOfExecution.substr(0, 4);
                    updateRow["prop_periodOfExecution"] = periodOfExecution;

                } else {
                    payload["prop_btl-meetingProtocol_periodOfExecution"] = "";
                }


                payload["prop_btl-meetingProtocol_question-content"] = payload["assoc_btl-meetingProtocol_question_values"];
                payload["prop_btl-meetingProtocol_question-ref"] = payload["assoc_btl-meetingProtocol_question"];

                updateRow["rowId"] = payload["rowId"];
                updateRow["nodeRef"] = payload["nodeRef"];
                updateRow["prop_btl-meetingProtocol_decision"] = payload["prop_btl-meetingProtocol_decision"];
                updateRow["assoc_btl-meetingProtocol_employee_val"] = payload["assoc_btl-meetingProtocol_employee_val"];
                updateRow["assoc_btl-meetingProtocol_employee_added"] = payload["assoc_btl-meetingProtocol_employee"];
                updateRow["prop_btl-meetingProtocol_onControl"] = payload["prop_btl-meetingProtocol_onControl"];
                updateRow["prop_btl-meetingProtocol_onControl_img"] = img;
                updateRow["assoc_btl-meetingProtocol_controller_val"] = payload["assoc_btl-meetingProtocol_controller_val"];
                updateRow["assoc_btl-meetingProtocol_controller_added"] = payload["assoc_btl-meetingProtocol_controller"];
                updateRow["assoc_btl-meetingProtocol_question_val"] = payload["assoc_btl-meetingProtocol_question_values"];
                updateRow["assoc_btl-meetingProtocol_question_added"] = payload["assoc_btl-meetingProtocol_question"];


                payload["prop_btl-meetingProtocol_controller-content"] = payload["assoc_btl-meetingProtocol_controller_val"];
                payload["prop_btl-meetingProtocol_controller-ref"] = payload["assoc_btl-meetingProtocol_controller"];

                payload["prop_btl-meetingProtocol_employee-ref"] = payload["assoc_btl-meetingProtocol_employee"];
                payload["prop_btl-meetingProtocol_employee-content"] = payload["assoc_btl-meetingProtocol_employee_val"];

                if (payload.nodeRef) {
                    this.serviceXhr({
                        url: "/share/proxy/alfresco/api/node/" + payload.nodeRef.replace("://", "/") + "/formprocessor",
                        method: "POST",
                        data: payload,
                        successCallback: this.grid.pqGrid("updateRow", {rowIndx: updateRow.rowId, row: updateRow}),
                        callbackScope: this
                    });
                } else {
                    this.grid.pqGrid("updateRow", {rowIndx: updateRow.rowId, row: updateRow});
                }

            },


            addProtocol: function (payload) {
                var img = "Нет";
                if (payload["prop_btl-meetingProtocol_onControl"])
                    img = "Да";

                var _this = this;

                //console.log(payload);

                var row = {
                    "nodeRef": "",
                    //"prop_btl-meetingProtocol_numberProtocol": payload["prop_btl-meetingProtocol_numberProtocol"],
                    "prop_btl-meetingProtocol_decision": payload["prop_btl-meetingProtocol_decision"],
                    "prop_btl-meetingProtocol_onControl": payload["prop_btl-meetingProtocol_onControl"],
                    "prop_btl-meetingProtocol_onControl_img": img,
                    "assoc_btl-meetingProtocol_employee_added": payload["assoc_btl-meetingProtocol_employee_added"],
                    "assoc_btl-meetingProtocol_employee_val": payload["assoc_btl-meetingProtocol_employee_val"],
                    "prop_btl-meetingProtocol_employee-ref": payload["assoc_btl-meetingProtocol_employee"],
                    "prop_btl-meetingProtocol_employee-content": payload["assoc_btl-meetingProtocol_employee_val"],
                    "assoc_btl-meetingProtocol_controller_added": payload["assoc_btl-meetingProtocol_controller_added"],
                    "assoc_btl-meetingProtocol_controller_val": payload["assoc_btl-meetingProtocol_controller_val"],
                    "prop_btl-meetingProtocol_controller-content": payload["assoc_btl-meetingProtocol_controller_val"],
                    "prop_btl-meetingProtocol_controller-ref": payload["assoc_btl-meetingProtocol_controller"],
                    "assoc_btl-meetingProtocol_question_added": payload["assoc_btl-meetingProtocol_question_added"],
                    "assoc_btl-meetingProtocol_question_val": payload["assoc_btl-meetingProtocol_question_values"],
                    "prop_btl-meetingProtocol_question-content": payload["assoc_btl-meetingProtocol_question_values"],
                    "prop_btl-meetingProtocol_question-ref": payload["assoc_btl-meetingProtocol_question"]

                };

                var periodOfExecution = payload["prop_btl-meetingProtocol_periodOfExecution"];
                if (periodOfExecution) {

                    row["prop_btl-meetingProtocol_periodOfExecution"] = payload["prop_btl-meetingProtocol_periodOfExecution"];

                    periodOfExecution = periodOfExecution.substr(8, 2) + "." + periodOfExecution.substr(5, 2) + "." + periodOfExecution.substr(0, 4);
                    row["prop_periodOfExecution"] = periodOfExecution;

                }

                //Если документ существует, то сразу добавляем новых пользователей в документ
                if (this.documentNodeRef || payload.documentNodeRef) {
                    row["alf_destination"] = (this.documentNodeRef) ? this.documentNodeRef : payload.documentNodeRef;

                    if (payload.rowId != null)
                        row.rowId = payload.rowId;

                    this.serviceXhr({
                        url: "/share/proxy/alfresco/api/type/btl-meetingProtocol%3ameetingProtocolDataType/formprocessor",
                        method: "POST",
                        data: row,
                        //successMessage: 'Протокол успешно добален.',
                        successCallback: this.updateProtocolGrid,
                        callbackScope: this
                    });
                } else {
                    this.grid.pqGrid("addRow", {rowData: row});
                }

            },

            updateProtocolGrid: function (response, row) {
                row.data.nodeRef = response.persistedObject;
                if (row.data.rowId != null) {
                    this.grid.pqGrid("updateRow", {rowIndx: row.data.rowId, row: row.data});
                } else {
                    this.grid.pqGrid("addRow", {rowData: row.data});
                }
            },


            loadDataToDataGrid: function alfresco_DataGrid__loadDataToDataGrid(response, originalRequestConfig) {

                response.items.forEach(function (item, i, arr) {
                    if (item["prop_btl-meetingProtocol_onControl"] == true) {
                        response.items[i]["prop_btl-meetingProtocol_onControl_img"] = "Да"
                    } else {
                        response.items[i]["prop_btl-meetingProtocol_onControl_img"] = "Нет"
                    }

                    //response.items[i]["prop_btl-meetingProtocol_numberProtocol"] = i+1;

                });
                this.setDataDataGrid(response.items);
            },

            onCreateFormProtocol: function (data) {
                this.data = data.data;
                this.rootNodeRef = data.rootNodeRef;
                var payload = {};
                payload.dialogTitle = data.config.dialogTitle;
                payload.contentWidth = "900px";
                payload.dialogConfirmationButtonTitle = data.config.dialogConfirmationButtonTitle;
                payload.dialogCancellationButtonTitle = data.config.dialogCancellationButtonTitle;
                payload.formSubmissionTopic = data.config.formSubmissionTopic;
                payload.widgets = this.getWidgets();

                this.alfPublish("ALF_CREATE_FORM_DIALOG_REQUEST", payload, true);
            },

            getWidgets: function alfresco_formProjectStatus__getWidgets() {

                var widgets = [

                    {
                        name: "alfresco/forms/ControlRow",
                        config: {
                            widgets: [

                                {
                                    name: "btl/widgets/base/ClassicWindow",
                                    id: "WIN_DELEGATES",
                                    config: {
                                        title: "Вопрос",
                                        style: "width: 383px;",
                                        widgets: [
                                            {
                                                name: "meeting/choices/_Choice",
                                                config: {
                                                    name: "assoc_btl-meetingProtocol_question",
                                                    header: "Выбрать вопрос",
                                                    loadData: true,
                                                    width: 360,
                                                    height: 222,
                                                    labelButton: "Выбрать",
                                                    labelText: "Вопрос",
                                                    single: false,
                                                    value: (this.data !== null) ? this.data["assoc_btl-meetingProtocol_question_added"] : "",

                                                    urlList: "/share/proxy/alfresco/filters/association",
                                                    dataUrl: {
                                                        "type": "btl-meetingProgramm:meetingProgrammDataType",
                                                        "s_field": "btl-meetingProgramm:question",
                                                        "field": "btl-meetingProgramm:question",
                                                        "extra": "PARENT:'" + this.documentNodeRef + "'"
                                                    },
                                                    itemUrl: "/share/proxy/alfresco/picker/associationItems",
                                                    dataItemUrl: {
                                                        "type": "btl-meetingProgramm:meetingProgrammDataType",
                                                        "field": "btl-meetingProgramm:question"
                                                    }
                                                }
                                            },
                                        ]
                                    }
                                },

                                {
                                    name: "btl/widgets/base/ClassicWindow",
                                    id: "WIN_DELEGATES",
                                    config: {
                                        title: "Решение",
                                        style: "width: 383px;",
                                        widgets: [
                                            {
                                                name: "alfresco/forms/controls/TextArea",
                                                config: {
                                                    name: "prop_btl-meetingProtocol_decision",
                                                    label: "Описание:",
                                                    rows: "4",
                                                    value: (this.data !== null) ? this.data["prop_btl-meetingProtocol_decision"] : "",
                                                    requirementConfig: {
                                                        initialValue: true
                                                    }
                                                }
                                            },

                                            {
                                                name: "meeting/dateTextBox/_DateTextBox_95",
                                                config: {

                                                    name: "prop_btl-meetingProtocol_periodOfExecution",
                                                    label: "Срок исполнения:",
                                                    value: (this.data !== null) ? this.data["prop_periodOfExecution"] : "",
                                                    style: {

                                                    },
                                                    requirementConfig: {
                                                        initialValue: true
                                                    }
                                                }
                                            },

                                            {
                                                name: "meeting/choices/_Choice",
                                                config: {
                                                    name: "assoc_btl-meetingProtocol_employee",
                                                    header: "Выбрать ответственного",
                                                    labelButton: "Выбрать",
                                                    labelText: "Ответственный:",
                                                    value: (this.data !== null) ? this.data["assoc_btl-meetingProtocol_employee_added"] : "",

                                                    urlList: "/share/proxy/alfresco/filters/association",
                                                    dataUrl: {
                                                        "type": "btl-emp:employee-content",
                                                        "s_field": "btl-people:fio",
                                                        "field": "btl-people:fio"
                                                    },
                                                    itemUrl: "/share/proxy/alfresco/picker/associationItem",
                                                    dataItemUrl: {
                                                        "type": "btl-emp:employee-content",
                                                        "field": "btl-people:fio"
                                                    },
                                                    requirementConfig: {
                                                        initialValue: true
                                                    }

                                                }
                                            },
                                            {
                                                name: "alfresco/forms/controls/CheckBox",
                                                id: "prop_btl-meetingProtocol_onControl",

                                                // widthPx: 25,
                                                // widgetMarginRight: 0,
                                                config: {
                                                    label: "Требуется контроль",
                                                    // style:"width: 25px; margin: 0; margin-top: -3px;",
                                                    style: "margin-top: -3px;",
                                                    name: "prop_btl-meetingProtocol_onControl",
                                                    // label: "Требуется контроль",
                                                    fieldId: "PROTOCOL_ON_CONTROL_CHECK",
                                                    value: (this.data !== null) ? this.data["prop_btl-meetingProtocol_onControl"] : "",
                                                    checked: true
                                                }
                                            },


                                            {
                                                name: "meeting/forms/controlMainForm/choices/ProtocolController",
                                                config: {
                                                    value: (this.data !== null) ? this.data["assoc_btl-meetingProtocol_controller_added"] : "",
                                                }
                                            }

                                        ]
                                    }
                                }

                            ]
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
                } else {
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
            }


        });
    });