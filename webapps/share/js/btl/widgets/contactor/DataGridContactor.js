define(["dojo/_base/declare",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dojo/text!../base/templates/DataGrid.html",
        "service/constants/Default",
        "alfresco/core/Core",
        "alfresco/core/CoreWidgetProcessing",
        "alfresco/documentlibrary/_AlfDocumentListTopicMixin",
        "alfresco/services/_NavigationServiceTopicMixin",
        "dojo/dom-construct",
        "dojo/_base/lang",
        "alfresco/core/CoreXhr",
        "alfresco/core/topics",
        "btl/service/FormContactPerson",
        "dojo/topic",
        "jquery",
        "jqueryui",
        "pqgrid"
    ],
    function (declare, _WidgetBase, _TemplatedMixin, template, AlfConstants, AlfCore, CoreWidgetProcessing, _AlfDocumentListTopicMixin,
              _NavigationServiceTopicMixin, domConstruct, lang, CoreXhr, topics, FormContactPerson, topic, $) {

        return declare([_WidgetBase, _TemplatedMixin, AlfCore, CoreWidgetProcessing, _AlfDocumentListTopicMixin, _NavigationServiceTopicMixin, CoreXhr], {

            templateString: template,

            customCssClasses: "",

            getInfoContactorUrl: "search/contactor",

            itemContactPerson: {},

            actualContactor: false,

            all: false,

            contactorUrl: "/share/proxy/alfresco/search/contactor-list?",

            curRowIndxContactor: -1,

            paramsContactor: {},

            postMixInProperties: function alfresco_ContactPersonDataGrid__postMixInProperties() {
                this.inherited(arguments);
                this.alfSubscribe("DATAGRID_LOAD_DATA", lang.hitch(this, this.reSend), true);
                this.alfSubscribe("Re_Send_Delete", lang.hitch(this, this.reSendDelete), true);
                this.alfSubscribe("DATAGRID_GET_CONTRACTORS", lang.hitch(this, this.getContractors), true);
                this.alfSubscribe("SET_ITEM_CONTACT_PERSON_INFO", lang.hitch(this, this.setContactPersonInfo), true);
                this.alfSubscribe("BTL_GET_INFO_CONTACTOR", lang.hitch(this, this.getContactorData), true);
                this.alfSubscribe("DATAGRID_DELETE_CONTACTOR", lang.hitch(this, this.DeteleContactor), true);
                this.alfSubscribe("DATAGRID_DELETE_ROW_CONTACTOR_SUCCESS", lang.hitch(this, this.DeteleRowContactor), true);
                this.alfSubscribe("DATAGRID_DELETE_ROW_CONTACT_PERSON_SUCCESS", lang.hitch(this, this.DeteleRowContactPerson), true);
                this.alfSubscribe("DATAGRID_EDIT_ROW_CONTACT_PERSON", lang.hitch(this, this.editRowContactPerson), true);
                this.alfSubscribe("DATAGRID_EDIT_ROW_CONTACTOR", lang.hitch(this, this.editRowContactor), true);
                this.alfSubscribe("DATAGRID_ADD_ROW_CONTACTOR", lang.hitch(this, this.addRowContactor), true);
                this.alfSubscribe("DATAGRID_ADD_ROW_CONTACT_PERSON", lang.hitch(this, this.addRowContactPerson), true);
            },

            reSend: function reSend(data) {
                this.alfLog("log", "alfresco_ContactorDataGrid__deleteContactPerson reSend", data);
                this.curRowIndxContactor = data.rowIndx;
                this.alfPublish(this.pubSubScope + "DATAGRID_LOAD_DATA", {"nodeRef": data.rowData.nodeRef}, true);
            },

            postCreate: function alfresco_DataGrid__postCreate() {
                var RegEx = /^([a-zа-яё0-9]|[a-zа-яё0-9][a-zа-яё0-9/ /./-]+)$/i; //Первая только буква или цифра остальное цифры, буквы, пробел, точка, минус и /
                var RegExDigit = /^([0-9]+)$/; //Первая только буквы остальное цифры, буквы, пробел, точка, минус и /

                function filterHandlerName(evt, ui) {
                    if (ui.value.length == 0 || RegEx.test(ui.value)) {
                        if (evt.keyCode == 13) {
                            require(["dojo/topic"], function (topic) {
                                topic.publish("DATAGRID_GET_CONTRACTORS", {});
                            });
                        }
                    } else {
                        console.log("Недопустимое значение");
                        alert("Недопустимое значение");
                    }
                }

                function filterHandlerInn(evt, ui) {
                    if (ui.value.length == 0 || RegExDigit.test(ui.value)) {
                        if (evt.keyCode == 13) {
                            require(["dojo/topic"], function (topic) {
                                topic.publish("DATAGRID_GET_CONTRACTORS", {});
                            });
                        }
                    } else {
                        console.log("Недопустимое значение");
                        alert("Недопустимое значение");
                    }
                }

                function filterHandlerKpp(evt, ui) {
                    if (ui.value.length == 0 || RegExDigit.test(ui.value)) {
                        if (evt.keyCode == 13) {
                            require(["dojo/topic"], function (topic) {
                                topic.publish("DATAGRID_GET_CONTRACTORS", {});
                            });
                        }
                    } else {
                        console.log("Недопустимое значение");
                        alert("Недопустимое значение");
                    }
                }

                var colM = [
                    {title: "", minWidth: 27, width: 27, type: "detail", resizable: false, editable: false},
                    {title: "nodeRef", width: 600, dataIndx: "nodeRef", hidden: true},
                    {
                        title: "Название",
                        width: 500,
                        dataIndx: "name",
                        filter: {
                            on: true,
                            type: 'textbox',
                            condition: 'begin',
                            listeners: ['change'/*,{ 'keyup': filterHandlerName}*/]
                        }
                    },
                    {
                        title: "ИНН",
                        width: 120,
                        dataIndx: "inn",
                        filter: {
                            type: 'textbox',
                            condition: 'begin',
                            listeners: ['change' /*{ 'keyup': filterHandlerInn}*/]
                        }
                    },
                    {
                        title: "КПП",
                        width: 120,
                        dataIndx: "kpp",
                        filter: {
                            type: 'textbox',
                            condition: 'begin',
                            listeners: ['change' /*{ 'keyup': filterHandlerKpp}*/]
                        }
                    },
                    {title: "", width: 120}
                ];

                if (!this.all) {
                    this.paramsContactor["notActual"] = this.actualContactor;
                    this.contactorUrl += 'params=' + encodeURI(encodeURIComponent(JSON.stringify(this.paramsContactor)));
                }

                var dataModel = {
                    location: "remote",
                    sorting: "local",
                    method: "GET",
                    url: this.contactorUrl,
                    getData: function (dataJSON) {
                        var data = dataJSON.items;
                        return {curPage: dataJSON.curPage, totalRecords: dataJSON.totalRecords, data: data};
                    }
                };
                var _this = this;

                var height = document.documentElement.offsetHeight;
                height -= document.getElementById('SHARE_HEADER').offsetHeight;
                height -= 70;

                var width = document.documentElement.offsetWidth - document.getElementById('MAIN_LIST_MENU').offsetWidth;
                width -= 30;

                var gridModel = {
                    width: width,
                    flexHeight: false,
                    collapsible: false,
                    height: height,
                    dataModel: dataModel,
                    selectionModel: {type: 'row', mode: 'range', all: null, cbAll: null, cbHeader: null},
                    pageModel: {type: "remote", rPP: 25, strRpp: "{0}", rPPOptions: [25, 50, 100]},
                    filterModel: {on: true, mode: "AND", header: true},
                    editable: false,
                    colModel: colM,
                    wrap: false,
                    hwrap: false,
                    numberCell: {show: false},
                    title: "<b>Список контрагентов</b>",
                    resizable: true,
                    freezeCols: 1,
                    freezeRows: 0,
                    // selectionModel: { type: 'cell' },
                    detailModel: {
                        cache: true,
                        collapseIcon: "ui-icon-plus",
                        expandIcon: "ui-icon-minus",
                        init: function (ui) {
                            var rowData = ui.rowData,
                                nodeRef = rowData["nodeRef"];

                            //make a deep copy of gridDetailModel
                            var objCopy = $.extend(true, {}, gridDetailModel);

                            var paramsContactor = {};
                            paramsContactor["btl-people:notActual"] = false;
                            var paramUrl = 'params=' + encodeURI(encodeURIComponent(JSON.stringify(paramsContactor)));

                            objCopy.dataModel.url = "/share/proxy/alfresco/search/search?nodeRef=" + nodeRef + "&" + paramUrl;
                            objCopy.dataModel.error = function () {
                                _this.grid.pqGrid("rowInvalidate", {rowData: rowData});
                            };
                            var $grid = $("<div></div>").pqGrid(objCopy);                            
                            return $grid;
                        }
                    }
                };


                this.grid = $(this.domNode).pqGrid(gridModel);
                var grid = this.grid;
                window["gridB"] = grid;
                this.grid.pqGrid({
                    rowSelect: function (event, ui) {

                        require(["dojo/topic"], function (topic) {
                            topic.publish("DATAGRID_LOAD_DATA", ui);
                        });
                    }
                });

                var _this = this;
                this.grid.pqGrid({
                    rowDblClick: function (event, ui) {
                        _this.getContactorData();
                    }
                });

                function send(ui) {
                    this.alfLog("log", "alfresco_ContactorDataGrid__deleteContactPerson ui", ui);
                };

                var gridDetailModel = {
                    width: "100%",
                    flexHeight: true,
                    height: 150,
                    collapsible: false,
                    pageModel: {type: "local", rPP: 100, strRpp: "{0}", rPPOptions: [25, 50, 100]},
                    selectionModel: {type: 'row', mode: 'range', all: null, cbAll: null, cbHeader: null},
                    dataModel: {
                        location: "remote",
                        sorting: "local",
                        method: "GET",
                        //sortIndx: "ProductName",
                        getData: function (dataJSON) {
                            dataJSON.items.forEach(function (item) {
                                item["org"] = dataJSON.org;
                            });
                            return {data: dataJSON.items};
                        }
                    },
                    colModel: [
                        {title: "nodeRef", width: 100, dataType: "string", dataIndx: "nodeRef", hidden: true},
                        {title: "Имя", width: 100, dataType: "string", dataIndx: "firstname"},
                        {title: "Отчество", width: 100, dataType: "string", align: "right", dataIndx: "middlename"},
                        {title: "Фамилия", width: 100, dataType: "string", align: "right", dataIndx: "surname"},
                        {title: "Пол", width: 80, dataType: "string", dataIndx: "sex"},
                        {title: "Должность", width: 200, dataType: "string", dataIndx: "position", hidden: true},
                        {
                            title: "Пользователь Alfresco",
                            width: 200,
                            dataType: "string",
                            align: "right",
                            dataIndx: "alfrescoUser_val",
                            hidden: true
                        },
                        {
                            title: "Пользователь Alfresco",
                            width: 200,
                            dataType: "string",
                            align: "right",
                            dataIndx: "alfrescoUser_ref",
                            
                            hidden: true
                        },
                        {title: "Телефон", width: 150, dataType: "string", dataIndx: "phone"},
                        {title: "Мобильный телефон", width: 150, dataType: "string", dataIndx: "mobile"},
                        {title: "Сайт компании", width: 150, dataType: "string", dataIndx: "site"},
                        {title: "Email", width: 150, dataType: "string", dataIndx: "email"},
                        {
                            title: "", editable: false, minWidth: 165, sortable: false, render: function (ui) {
                            return "<button type='button' class='edit_btn'>Редактировать</button>\
		                            <button type='button' class='delete_btn'>Удалить</button>";
                        }
                        },
                        {title: "Фдрес", width: 1, dataType: "string", dataIndx: "address", hidden: true},

                    ],
                    load: function (event, ui) {
                        var $grid = $(this);
                        if (!$grid) {
                            return;
                        }
                        if (ui.dataModel.data.length < 4) {
                            $grid.pqGrid("option", "flexHeight", false);
                            $grid.pqGrid("option", "height", 200);
                            $grid.pqGrid("refresh");
                        }
                        else {
                            $grid.pqGrid("option", "flexHeight", true);
                        }

                    },
                    refresh: function () {
                        var $grid = $(this);
                        if (!$grid) {
                            return;
                        }
                        //edit button
                        $grid.find("button.edit_btn").button({icons: {primary: 'ui-icon-pencil'}})
                            .unbind("click")
                            .bind("click", function (evt) {
                                var $tr = $(this).closest("tr"),
                                    rowIndx = $grid.pqGrid("getRowIndx", {$tr: $tr}).rowIndx;

                                var row = $grid.pqGrid("getRowData", {rowIndxPage: rowIndx});
                                require(["dojo/topic"], function (topic) {
                                    topic.publish("SET_ITEM_CONTACT_PERSON_INFO", {"grid": $grid, "rowIndx": rowIndx});
                                    var data = {};
                                    data.config = {};
                                    //console.log(row);
                                    data.contactPerson = row;
                                    data.contactPerson.rowId = rowIndx;
                                    data.config.dialogTitle = "formEditContactPerson.title.label";
                                    data.config.dialogConfirmationButtonTitle = "edit.title";
                                    data.config.dialogCancellationButtonTitle = "cancel.title";
                                    data.config.formSubmissionTopic = "BTL_EDIT_CONTACT_PERSON";
                                    //this.alfPublish("BTL_CREATE_FORM_CONTACT_PERSON", data, true);
                                    topic.publish("BTL_CREATE_FORM_CONTACT_PERSON", data);
                                });
                                return false;
                            });

                        //delete button
                        $grid.find("button.delete_btn").button({icons: {primary: 'ui-icon-close'}})
                            .unbind("click")
                            .bind("click", function (evt) {

                                var $tr = $(this).closest("tr"),
                                    rowIndx = $grid.pqGrid("getRowIndx", {$tr: $tr}).rowIndx;
                                var row = $grid.pqGrid("getRowData", {rowIndxPage: rowIndx});

                                require(["dojo/topic"], function (topic) {
                                    topic.publish("SET_ITEM_CONTACT_PERSON_INFO", {"grid": $grid, "rowIndx": rowIndx});
                                    topic.publish("Re_Send_Delete", {"row": row, "rowIndx": rowIndx});
                                });

                            });
                    },
                    editable: false,
                    /* groupModel: {
                     dataIndx: ["firstname"],
                     dir: ["up"],
                     title: ["Список контактных лиц"],
                     icon: [["ui-icon-triangle-1-se", "ui-icon-triangle-1-e"]]
                     },*/
                    //freezeCols: 1,
                    //flexHeight: true,
                    // flexWidth: true,
                    numberCell: {show: false},
                    title: "Список контактных лиц",
                    //showTop: false,
                    // showBottom: false
                };
                this.setEventsDataGrid();

                $(window).resize(function(){
                    var size = _this.gridAutoSize();
                    _this.grid.pqGrid( "option", "width", size.width );
                    _this.grid.pqGrid( "option", "height", size.height );
                    _this.grid.pqGrid("refreshView", {header: false});
                });
            },

            gridAutoSize: function gridAutoSize(){
                var height = document.documentElement.offsetHeight ;
                height -= document.getElementById('SHARE_HEADER').offsetHeight;
                height -= 50;

                var width = document.documentElement.offsetWidth - document.getElementById('MAIN_LIST_MENU').offsetWidth;
                width -= 30;
                return { "height": height, "width": width};
            },

            getContractors: function getContractors() {
                var colM = this.grid.pqGrid("option", "colModel");
                var data = [];
                var filterName = ($('input[name="name"]')[1].value) ? $('input[name="name"]')[1].value : "";
                var filterInn = ($('input[name="inn"]')[1].value) ? $('input[name="inn"]')[1].value : "";
                var filterKpp = ($('input[name="kpp"]')[1].value) ? $('input[name="kpp"]')[1].value : "";
                var query = {
                    "data": [
                        (filterName) ? {"dataIndx": "name", "value": filterName} : {},
                        (filterInn) ? {"dataIndx": "inn", "value": filterInn} : {},
                        (filterKpp) ? {"dataIndx": "kpp", "value": filterKpp} : {}
                    ]
                };
                var queryStr = encodeURIComponent(JSON.stringify(query));
                this.grid.pqGrid("showLoading");
                this.serviceXhr({
                    url: "/share/proxy/alfresco/search/contactor-list",
                    method: "GET",
                    query: "pq_filter=" + queryStr,
                    successCallback: this.setDataToDataGrid,
                    callbackScope: this
                });
            },

            setDataToDataGrid: function setDataToDataGrid(response, originalRequestConfig) {
                this.grid.pqGrid("option", "dataModel.data", response.items);
                this.grid.pqGrid("refreshView", {header: false});//"refreshView");
                this.grid.pqGrid("hideLoading");
                this.alfLog("log", "alfresco_DataGrid__setDataToDataGrid", this.grid);
            },

            getContactorData: function alfresco_ContactorDataGrid__getContactorData() {
                var arr = this.grid.pqGrid("selection", {type: 'row', method: 'getSelection'});
                if (arr && arr.length > 0) {
                    var row = arr[0].rowData;

                    this.serviceXhr({
                        url: "/share/proxy/alfresco/" + this.getInfoContactorUrl + "?nodeRef=" + row.nodeRef,
                        method: "GET",

                        successCallback: this.edit,
                        callbackScope: this
                    });
                }
            },

            setEventsDataGrid: function alfresco_DataGrid__setEventsDataGrid() {
                var RegEx1 = /^([a-zа-яё0-9])$/i; //Первая только буква или цифра
                var RegEx2 = /^([a-zа-яё0-9/ /./-])$/i; // цифры, буквы, пробел, точка, минус и /
                var RegEx3 = /^([0-9])$/; // только цифры
                var _this = this;

                $('input[name="name"]').keypress(function (event) {
                    if ((event.target.value.length == 0 && RegEx1.test(String.fromCharCode(event.which))) ||
                        (event.target.value.length > 0 && RegEx2.test(String.fromCharCode(event.which))) ||
                        event.which < 32) {

                    } else {
                        event.preventDefault();
                    }
                });

                $('input[name="inn"]').keypress(function (event) {
                    if (RegEx3.test(String.fromCharCode(event.which)) || event.which < 32) {

                    } else {
                        event.preventDefault();
                    }
                });

                $('input[name="kpp"]').keypress(function (event) {
                    if (RegEx3.test(String.fromCharCode(event.which)) || event.which < 32) {

                    } else {
                        event.preventDefault();
                    }
                });

            },

            edit: function alfresco_navigation_Tree__edit(response, originalRequestConfig) {
                this.alfLog("log", "alfresco_navigation_Tree__edit response", response);
                this.alfLog("log", "alfresco_navigation_Tree__edit originalRequestConfig", originalRequestConfig);

                var data = {};
                data.config = {};
                data.contactor = response;
                data.config.dialogTitle = "formEditContactor.title.label";
                data.config.dialogConfirmationButtonTitle = "create.title";
                data.config.dialogCancellationButtonTitle = "cancel.title";
                data.config.formSubmissionTopic = "BTL_EDIT_CONTACTOR";

                this.alfPublish("BTL_CREATE_FORM_CONTACTOR", data, true);
            },

            editRowContactPerson: function alfresco_DataGridContactor__editRowContactPerson(data) {
                this.alfLog("log", "alfresco_DataGridContactor__editRowContactPerson", data);
                this.alfLog("log", "alfresco_DataGridContactor__editRowContactPerson this.itemContactPerson", this.itemContactPerson);
                if (typeof this.itemContactPerson.grid.pqGrid !== "undefined") {
                    this.itemContactPerson.grid.pqGrid("updateRow", {
                        rowIndx: this.itemContactPerson.rowIndx,
                        row: data
                    });
                }
            },

            editRowContactor: function alfresco_DataGridContactor__editRowContactor(data) {
                if (this.curRowIndxContactor > -1) {
                    this.grid.pqGrid("updateRow", {rowIndx: this.curRowIndxContactor, row: data});
                    this.grid.pqGrid("refresh");
                }
            },

            setContactPersonInfo: function alfresco_DataGridContactor__setContactPersonInfo(data) {
                this.itemContactPerson = {"grid": data.grid, "rowIndx": data.rowIndx};
            },

            DeteleContactor: function alfresco_DataGridContactor__DeteleContactor(data) {
                var arr = this.grid.pqGrid("selection", {type: 'row', method: 'getSelection'});
                if (arr && arr.length > 0) {
                    this.curRowIndxContactor = arr[0].rowIndx;
                    var payload = {};

                    payload.requiresConfirmation = true;
                    payload.confirmationTitle = "deleteContactor.title.label";
                    payload.confirmationPrompt = "Вы действительно хотите удалить: " + arr[0].rowData.name + "?";
                    payload.nodeRef = arr[0].rowData.nodeRef;
                    payload.responseTopic = "BTL_SING_REMOVE_CONTACTOR";

                    this.alfPublish("BTL_MSG_DELETE_DIALOG", payload, true);
                }
            },

            DeteleRowContactor: function alfresco_DataGridContactor__DeteleContactor() {
                this.grid.pqGrid("deleteRow", {rowIndx: this.curRowIndxContactor});
                var message = "crudservice.generic.success.message";
                this.alfServicePublish(topics.DISPLAY_NOTIFICATION, {
                    message: this.message(message)
                });
            },

            DeteleRowContactPerson: function alfresco_DataGridContactor__DeteleRowContactPerson() {
                if (typeof this.itemContactPerson.grid.pqGrid !== "undefined") {
                    this.itemContactPerson.grid.pqGrid("deleteRow", {rowIndx: this.itemContactPerson.rowIndx});
                    var message = "crudservice.generic.success.message";
                    this.alfServicePublish(topics.DISPLAY_NOTIFICATION, {
                        message: this.message(message)
                    });
                }
            },

            reSendDelete: function alfresco_DataGridContactor__reSendDelete(data) {
                var payload = {};

                payload.requiresConfirmation = true;
                payload.confirmationTitle = "deleteContactor.title.label";
                payload.confirmationPrompt = "Вы действительно хотите удалить: " + data.row.surname + " " + data.row.firstname + " " + data.row.middlename + "?";
                payload.nodeRef = data.row.nodeRef;
                payload.responseTopic = "BTL_SING_REMOVE_CONTACT_PERSON";

                this.alfPublish("BTL_MSG_DELETE_DIALOG", payload, true);
            },

            addRowContactor: function alfresco_DataGridContactor__addRowContactor(data) {

                this.grid.pqGrid("addRow", {rowData: data});
            },
            addRowContactPerson: function alfresco_DataGridContactor__addRowContactPerson(data) {
                var arr = this.grid.pqGrid("selection", {type: 'row', method: 'getSelection'});
                if (arr && arr.length > 0) {
                    var $grid = arr[0].rowData.pq_detail.child;
                    $grid.pqGrid("addRow", {rowData: data});
                }
            }

        });
    });