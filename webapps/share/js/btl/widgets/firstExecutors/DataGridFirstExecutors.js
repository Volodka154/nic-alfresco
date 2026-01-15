define(["dojo/_base/declare",
        "btl/widgets/base/DataGrid",
        "dojo/_base/lang",
        "btlExtension/windowChoiceItem/window_choice_item",
        "alfresco/core/CoreXhr",
        "dojo/topic",
        "dijit/Dialog",
        "dojox/timing/_base",
        "dojo/dom-construct",
        "dijit/registry"],
    function (declare, DataGrid, lang, ChoiceItem, CoreXhr, topic, Dialog, timing, domConstruct, registry) {
        return declare([DataGrid, CoreXhr], {

            title: "Список первых исполнителей",
            Url: "filters/resource-executor",
            colModel: [],
            height: '100%',
            filterModel: {on: true, mode: "AND", header: true},
            pageModel: {type: "local", rPP: 100, strRpp: "{0}", rPPOptions: [100, 250, 500]},
            extra: "&extra=ASPECT:'btl-people:firstExecutor'",
            editable: false,
            title: "Список первых исполнителей",
            editDialog: null,
            row: null,
            rowId: null,
            colModel: [
                {title: "nodeRef", width: 100, dataType: "string", dataIndx: "nodeRef", hidden: true},
                {title: "Ф.И.О.", width: 200, dataType: "string", align: "right", dataIndx: "name"},
                {title: "Ранг", width: 50, dataType: "integer", align: "right", dataIndx: "rank"},
                {title: "Пользователь Alfresco", width: 200, dataType: "integer", align: "right", dataIndx: "user"},
                {title: "", width: 120, dataType: "string", align: "right"}
            ],

            postMixInProperties: function alfresco_ContactPersonDataGrid__postMixInProperties() {
                this.inherited(arguments);
                this.alfSubscribe("DATAGRID_DELETE_FIRST_EXECUTORS", lang.hitch(this, this.deleteFirstExecutors), true);
                this.alfSubscribe("DATAGRID_GET_FIRST_EXECUTORS_DATA", lang.hitch(this, this.getFirstExecutorsData), true);
                this.alfSubscribe("DATAGRID_EDIT_FIRST_EXECUTORS_DATA", lang.hitch(this, this.updateRow), true);
                this.alfSubscribe("BTL_CREATE_FORM_FIRST_EXECUTORS", lang.hitch(this, this.onCreateFormFirstExecutors), true);

                this.createEditDialog();
            },

            gridAutoSize: function gridAutoSize() {
                var height = document.documentElement.offsetHeight ;
                height -= document.getElementById('SHARE_HEADER').offsetHeight;
                height -= 80;

                width = document.documentElement.offsetWidth - document.getElementById('MAIN_LIST_MENU').offsetWidth;
                width -= 30;
                return { "height": height, "width": width};
            },

            refreshDataDataGrid: function alfresco_DataGrid__refreshDataDataGrid() {
                this.loadDataDataGrid({nodeRef: this.rootNodeRef});
            },
            setEventsDataGrid: function alfresco_DataGrid__setEventsDataGrid() {
                var firstExecutorDG = this;
                this.grid.pqGrid({
                    rowDblClick: function (event, ui) {
                        firstExecutorDG.getFirstExecutorsData();
                    }
                });
                this.grid.pqGrid("option", "height", document.getElementById("MAIN_WIDGET").offsetHeight);
                this.choiceItem = new Alfresco.WindowChoiceItem(this.id + "-btn-add-link").setOptions({
                    header: "Выбор из справочника сотрудников:",
                    single: false,
                    url: "/share/proxy/alfresco/filters/resource-executor",
                    renderData: "items",
                    placeHolder: "Поиск по фамилии",
                    dataUrl: {
                        extra: " !ASPECT:'btl-people:firstExecutor'"
                    }
                });
                this.choiceItem.dialogCreate();
                this.choiceItem.setEvents();
                this.choiceItem.onOk.subscribe(function getValues() {
                    var newFirstExecutors = this.getValues();
                    if (newFirstExecutors != null) {
                        newFirstExecutors.forEach(function (item) {
                            firstExecutorDG.createFirstExecutors(item);
                        });
                    }

                });
            },
            onCreateFormFirstExecutors: function alfresco_onCreateFormFirstExecutors(data) {
                this.alfLog("log", "alfresco_onCreateFormFirstExecutors", data);
                this.choiceItem.dialog.show();
            },
            createFirstExecutors: function alfresco_createFirstExecutors__getWidgets(payload) {
                this.alfLog("log", "alfresco_createFirstExecutors__getWidgets", payload);

                this.serviceXhr({
                    url: "/share/proxy/alfresco/api/node/" + payload.nodeRef.replace("://", "/") + "/formprocessor",
                    method: "POST",
                    data: {"prop_btl-people_rank": 0},
                    successCallback: this.successAddFirstExecutor,
                    failureCallback: this.failureAddFirstExecutor,
                    callbackScope: this,
                    row: {nodeRef: payload.nodeRef, name: payload.name, rank: 0}
                });
            },
            successAddFirstExecutor: function alfresco_successAddFirstExecutor(response, originalRequestConfig) {
                topic.publish("ALF_DISPLAY_NOTIFICATION", {message: "Добавлен новый первый исполнитель."});
                this.grid.pqGrid("addRow", {rowData: originalRequestConfig.row});
            },

            failureAddFirstExecutor: function alfresco_successAddFirstExecutor(response, originalRequestConfig) {
                var response = response;
                failureDialog = new Dialog({
                    title: "Ошибка при добавление первого исполнителя!",
                    content: response.message,
                    style: "width: 300px"
                });
                failureDialog.show();

            },
            editFirstExecutors: function editFirstExecutors(row) {

                this.serviceXhr({
                    url: "/share/proxy/alfresco/api/node/" + row.nodeRef.replace("://", "/") + "/formprocessor",
                    method: "POST",
                    data: {
                        "prop_btl-people_rank": row.rank
                    },
                    successCallback: this.updateRow(this.rowId, row),
                    failureCallback: this.failureDelFirstExecutor,
                    callbackScope: this
                });
            },
            deleteFirstExecutors: function alfresco_deleteFirstExecutors() {
                var arr = this.grid.pqGrid("selection", {type: 'row', method: 'getSelection'});
                if (arr && arr.length > 0) {
                    var row = arr[0].rowData;
                    var rowIndx = arr[0].rowIndx;
                    var payload = {};

                    this.serviceXhr({
                        url: "/alfresco/s/slingshot/doclib/action/aspects/node/" + row.nodeRef.replace("://", "/"),
                        method: "POST",
                        data: {
                            "added": [],
                            "removed": ["btl-people:firstExecutor"]
                        },
                        successCallback: this.successDelFirstExecutor,
                        failureCallback: this.failureDelFirstExecutor,
                        callbackScope: this,
                        rowIndx: rowIndx
                    });
                }
            },
            successDelFirstExecutor: function alfresco_successAddFirstExecutor(response, originalRequestConfig) {
                topic.publish("ALF_DISPLAY_NOTIFICATION", {message: "Удален первый исполнитель."});
                this.grid.pqGrid("deleteRow", {rowIndx: originalRequestConfig.rowIndx});
            },

            failureDelFirstExecutor: function alfresco_successAddFirstExecutor(response, originalRequestConfig) {
                var response = response;
                failureDialog = new Dialog({
                    title: "Ошибка при удалении первого исполнителя!",
                    content: response.message,
                    style: "width: 300px"
                });
                failureDialog.show();

            },
            getFirstExecutorsData: function getFirstExecutorsData() {
                var grid = this.grid;
                var arr = grid.pqGrid("selection", {type: 'row', method: 'getSelection'});
                if (arr && arr.length > 0) {
                    var rowIndx = arr[0].rowIndx;
                    var row = grid.pqGrid('getRowData', {rowIndx: rowIndx});
                    this.rowId = rowIndx;
                    this.row = row;

                    document.getElementById("crud-form-rang").value = (row.rank) ? row.rank : "";
                    this.editDialog.show();
                }
            },
            createEditDialog: function createEditDialog() {
                var firstExecutorDG = this;
                var widget = registry.byId("crud-form")
                if (widget) {
                    widget.destroyRecursive();
                }
                this.editDialog = new Dialog({
                    title: "Изменить ранг",
                    id: "crud-form",
                    content: "",
                    style: "width: 300px"
                });
                var mainDiv = domConstruct.create("div", {
                    "class": "dijitDialogPaneContentArea",
                    "innerHTML": ""
                }, this.editDialog.containerNode);

                var actionBar = domConstruct.create("div", {
                    "class": "dijitDialogPaneActionBar"
                }, this.editDialog.containerNode);

                domConstruct.create("label", {
                    innerHTML: "Ранг:",
                    style: "width:95%;"
                }, mainDiv);

                function getChar(event) {

                    if (event.which == null) { // IE
                        if (event.keyCode < 32) return null; // спец. символ
                        return String.fromCharCode(event.keyCode)
                    }

                    if (event.which != 0 && event.charCode != 0) { // все кроме IE
                        if (event.which < 32) return null; // спец. символ
                        return String.fromCharCode(event.which); // остальные
                    }

                    return null; // спец. символ

                };

                domConstruct.create("input", {
                    type: "text",
                    id: "crud-form-rang",
                    style: "width:95%;",
                    "onkeypress": ""
                }, mainDiv);

                var editDialog = this.editDialog;

                new dijit.form.Button({
                    "label": "OK",
                    onClick: function () {
                        firstExecutorDG.row.rank = document.getElementById("crud-form-rang").value;
                        firstExecutorDG.editFirstExecutors(firstExecutorDG.row);
                        editDialog.hide();
                    }
                }).placeAt(actionBar);


                new dijit.form.Button({
                    "label": "Отмена",
                    onClick: function () {
                        editDialog.hide();
                    }
                }).placeAt(actionBar);

                document.getElementById('crud-form-rang').onkeypress = function (e) {
                    e = e || event;

                    if (e.ctrlKey || e.altKey || e.metaKey) return;

                    var chr = getChar(e);

                    if (chr == null) return;

                    if (chr < '0' || chr > '9') {
                        return false;
                    }
                }

            },
            updateRow: function updateRow(rowId, row) {
                this.grid.pqGrid('updateRow', {rowIndx: rowId, row: row});
                this.grid.pqGrid("refresh");
            }
        });
    });