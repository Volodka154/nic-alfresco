var $grid2Out = "";

/***
 * Запрос групп для текущего пользователя с последующитм создание таблицы "Исходящие"
 */
function show2Out() {
    require(["jquery", "pqgrid", "pqselect", "jquery-ui.datepicker-ru"], function () {
        Alfresco.util.Ajax.request({
            method: "GET",
            url: Alfresco.constants.PROXY_URI + "v2/groupPermission?username=" + Alfresco.constants.USERNAME,
            successCallback: {
                fn: function (request) {
                    var groups = request.json.groups;
                    var isAdmin = groups.indexOf("GROUP_ALFRESCO_ADMINISTRATORS") !== -1;
                    var isArch = isAdmin || groups.indexOf("GROUP_EEO") !== -1 || groups.indexOf("GROUP_CLERK") !== -1;
                    var isUserSED = isAdmin || groups.indexOf("GROUP_Пользователи СЭД") !== -1;
                    create2Out(isArch, isAdmin, isUserSED);
                },
                scope: this
            }
        });
    })
}

/***
 * Создание грида
 * @param isAdmin
 * @param isArch - могет в архив
 */
function create2Out(isArch, isAdmin, isUserSED) {
    var pq = getDefaultPq();

    var stateAccess = [
        {"Активные": "Активные"},
        {"Проекты документов": "Проекты документов"},
        {"Черновик": "Черновик"},
        {"Зарегистрирован": "Зарегистрирован"},
        {"На исполнении": "На исполнении"},
        {"В архиве": "В архиве"},
        {"На согласовании": "На согласовании"},
        {"На подписании": "На подписании"},
        {"Согласован": "Согласован"},
        {"На регистрации": "На регистрации"},
        {"На доработке": "На доработке"}
    ];
    var colModel = [
        {
            title: "regJournalRef",
            dataType: "string",
            dataIndx: "regJournalFilter",
            hidden: true
        },
        {
            title: "nodeRef",
            width: 100,
            dataType: "string",
            dataIndx: "nodeRef",
            hidden: true
        },
        {
            title: "Файл",
            dataType: "string",
            dataIndx: "fileExists"
        },
        {
            title: "Рег. номер",
            minWidth: 80,
            dataType: "string",
            dataIndx: "btl-document:reg-info",
            filter: {
                type: 'textbox',
                condition: 'contain',
                listeners: ['change']
            }
        },
        {
            title: "Дата регистрации",
            minWidth: 160,
            width: 160,
            dataType: dateType,
            dataIndx: "btl-document:regDate",
            filter: {
                type: 'textbox',
                condition: "between",
                init: pqDatePicker,
                listeners: ['change']
            }
        },
        {
            title: "Подписант",
            width: 120,
            dataType: "string",
            dataIndx: "btl-outgoing:signer-login",
            filter: {
                type: 'select',
                style: "height:32px;",
                condition: 'equal',
                options: document.emploeeDoc,
                prepend: {'': ''},
                listeners: ["change"],
                init: function () {
                    $(this).pqSelect({
                        singlePlaceholder: 'Все',
                        searchRule: "contain",
                        width: '100%'
                    });
                },
            }
        },
        {
            title: "Исполнитель",
            width: 120,
            dataType: "string",
            dataIndx: "btl-document:author-login",
            filter: {
                type: 'select',
                style: "height:32px;",
                condition: 'equal',
                options: document.emploeeDoc,
                prepend: {'': ''},
                listeners: ["change"],
                init: function () {
                    $(this).pqSelect({
                        singlePlaceholder: 'Все',
                        searchRule: "contain",
                        width: '100%'
                    });
                },
            }
        },
        {
            title: "Контрагент",
            minWidth: 160,
            width: 160,
            dataType: "string",
            dataIndx: "btl-outgoing:contragentUnit-ref",
            cls: "just",
            filter: {
                type: 'select',
                condition: 'contain',
                options: document.organizations,
                prepend: {'': ''},
                listeners: ["change"],
                init: function () {
                    $(this).pqSelect({
                        singlePlaceholder: 'Все',
                        searchRule: "begin",
                        width: '100%',
                        url: "/share/proxy/alfresco/filters/association?type=btl-contr:contractor-folder&s_field=name&field=name"
                    });
                }
            }
        },
        {
            title: "Кому",
            minWidth: 120,
            width: 120,
            dataType: "string",
            dataIndx: "btl-outgoing:contragentPerson-ref",
            cls: "just",
            filter: {
                type: 'select',
                condition: 'contain',
                options: [],
                prepend: {'': ''},
                listeners: ["change"],
                init: function (arg1) {
                    $(this).pqSelect({
                        singlePlaceholder: 'Все',
                        searchRule: "begin",
                        width: '100%',
                        url: "/share/proxy/alfresco/filters/association?type=btl-person:person-content&s_field=fio&field=fio",
                        urlItem: "/share/proxy/alfresco/picker/associationItem?type=btl-person:person-content&field=fio",
                        value: arg1.column.filter.value
                    });

                }
            }
        },
        {
            title: "В ответ на",
            minWidth: 100,
            dataType: "string",
            dataIndx: "btl-document:responseTo-content",
            filter: {
                type: 'textbox',
                condition: 'contain',
                listeners: ['change']
            }
        },
        {
            title: "Содержание",
            width: 250,
            dataType: "string",
            dataIndx: "btl-document:content",
            filter: {
                type: 'textbox',
                condition: 'contain',
                listeners: ['change']
            }
        },
        {
            title: "Проект",
            minWidth: 160,
            dataType: "string",
            dataIndx: "btl-document:project-content",
            cls: "just",
            filter: {
                type: 'textbox',
                condition: 'contain',
                listeners: ['change']
            }
        },
        {
            title: "Состояние",
            width: 160,
            dataType: "string",
            dataIndx: "btl-document:state",
            style: "height:32px;",
            filter: {
                type: 'select',
                style: "height:32px;",
                condition: 'equal',
                options: stateAccess,
                listeners: ["change"],
                prepend: {'': ''},
                value: "Активные",
                init: function () {
                    $(this).pqSelect({
                        singlePlaceholder: 'Все',
                        search: false,
                        width: '100%'
                    });
                    formatStateFilter();
                },
            }
        },
        {
            title: "Тип документа",
            minWidth: 130,
            dataType: "string",
            dataIndx: "btl-document:docType-ref",
            filter: {
                type: 'select',
                condition: 'equal',
                options: typedocOut.result,
                prepend: {'': ''},
                listeners: ["change"],
                init: function () {
                    $(this).pqSelect({
                        singlePlaceholder: 'Все',
                        searchRule: "contain",
                        width: '100%'
                    });
                }
            }
        },
        {
            title: "Резолюции",
            minWidth: 130,
            dataType: "string",
            dataIndx: "nameTask",
            sortable: false
        }
    ];

    if (isArch) {
        colModel.unshift({
            title: "<input type='checkbox' onclick='selectAllInGrid(this, $grid2Out)'>",
            dataIndx: "sel",
            width: 30,
            align: "center",
            type: 'checkBoxSelection',
            cls: 'ui-state-default',
            resizable: false,
            sortable: false
        });
    }

    var dataModel = {
        location: "remote",
        sorting: "remote",
        dataType: "JSON",
        method: "GET",
        data: pq.dataCache,
        sortIndx: 'btl-document:reg-info',
        sortDir: 'down',
        getUrl: function (ui) {
            if ($(this).pqGrid("option", "isInit2") !== true) {
                $(this).pqGrid("option", "isInit2", true);
                $(this).pqGrid("option", "currentCountId", "f2OutgoingCurrentCount");
                $(this).pqGrid("option", "totalCountId", "f2OutgoingTotalCount");
                $(this).pqGrid("option", "groupSelectSelector", "select.f2OutgoingGroup");
                $(this).pqGrid("option", "copyCreateFn", addDocOutgoinCreate);
                $(this).pqGrid("option", "dataUrl", "/share/proxy/alfresco/documents/v2/search-registry-outgoing");
                $(this).pqGrid("option", "additionalFiltersSelector", "select.f2Outgoing");
                addPaginationBlock($(this));
            }
            return getUrl2($(this), pq);
        },
        getData: function (response) {
            return getData2($(this), response, pq);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            error2(jqXHR, textStatus, errorThrown);
        }
    };

    var newObjOut = {
        selectionModel: {type: 'none', subtype: 'incr', cbHeader: false, cbAll: true},
        dataModel: dataModel,
        collapsible: false,
        editable: false,
        colModel: colModel,
        filterModel: {on: true, mode: "AND", header: true},
        width: "100%",
        height: 835,
        beforeSort: function (evt, ui) {
            beforeSort2($(this));
        },
        beforeFilter: function (evt, ui) {
            beforeFilter2($(this));
        },
        beforeTableView: function (evt, ui) {
            beforeTableView2(ui, pq, $(this));
        },
        rowRightClick: function (event, ui) {
            return rowRightClick2(event, ui, $(this).pqGrid("option", "copyCreateFn"));
        },
        rowDblClick: function (event, ui) {
            openModalEdit(ui.rowData.nodeRef, $grid2Out);
        }
    };

    newObjOut.title = "";
    if (isUserSED) {
        newObjOut.title += "<button type='button' onclick='addDocOutgoin()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'" +
            " role='button'><span class='ui-button-icon-primary ui-icon ui-icon-plus'></span><span class='ui-button-text'>Создать</span></button>";
    }
    if (isArch) {
        newObjOut.title += "<button type='button'  style='margin-left: 5px'  onclick='toArchOutgoin()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'" +
            " role='button'><span class='ui-button-icon-primary ui-icon ui-icon-cancel'></span><span class='ui-button-text'>В архив</span></button>";
    }
    if (isAdmin) {
        newObjOut.title += "<button type='button'  style='margin-left: 5px'  onclick='deleteOut()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'" +
            " role='button'><span class='ui-button-icon-primary ui-icon ui-icon-cancel'></span><span class='ui-button-text'>Удалить</span></button>";
    }
    newObjOut.title += "<button type='button'  style='margin-left: 5px' onclick='prnOutgoin()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'" +
        " role='button'><span class='ui-button-icon-primary ui-icon ui-icon-print'></span><span class='ui-button-text'>Печать</span></button>";

    newObjOut.toolbar = {
        items: [
            {
                type: '<span>Группировка: </span>'
            },
            {
                type: 'select',
                cls: 'combo-pg f2OutgoingGroup',
                prepend: {'': ''},
                options: [
                    'Контрагент',
                    'Состояние',
                    'Тип документа',
                    'Журнал регистрации'
                ],
                listeners: [
                    {
                        change: function (evt) {
                            var group;
                            switch ($(this).val()) {
                                case "Контрагент":
                                    group = "btl-outgoing:contragentUnit-ref";
                                    break;
                                case "Состояние":
                                    group = "btl-document:state";
                                    break;
                                case "Тип документа":
                                    group = "btl-document:docType-ref";
                                    break;
                                case "Журнал регистрации":
                                    group = "btl-document:reg-journal";
                                    break;
                                default:
                                    group = null;
                            }
                            localGroup(group, $grid2Out, pq);
                        }
                    }
                ]
            },
            {type: '<span style="margin-left: 7px">Журнал регистрации: </span>'},
            {
                type: 'select',
                cls: 'combo-pg f2Outgoing',
                options: document.rjsFilterData["1"],
                prepend: {'': ''},
                listeners: [
                    {
                        change: function (evt) {
                            var filterObject = [{
                                dataIndx: "regJournalFilter",
                                condition: "equal",
                                value: $(this).val()
                            }];
                            $grid2Out.pqGrid("filter", {
                                oper: 'add',
                                data: filterObject
                            });
                        }
                    }
                ]
            },
            {
                type: '<span style="margin-left: 7px"></span>'
            },
            {
                type: 'button',
                label: 'Очистить',
                listeners: [{
                    click: function (evt) {
                        clearGridFilters($grid2Out, ["select.f2Outgoing"]);
                    }
                }],
                icon: 'ui-icon-cancel'
            },
            {type: '<span style="margin-left: 7px"></span>'},
            {
                type: 'button',
                cls: 'registry-refresh-btn',
                label: 'Обновить',
                listeners: [{
                    click: function (evt) {
                        refreshDataAndView($grid2Out);
                    }
                }]
            }
        ]
    };

    $grid2Out = $("#grid_2outgoing").pqGrid(newObjOut);

    $("select.f2Outgoing").pqSelect({
        singlePlaceholder: 'Все',
        searchRule: "begin",
        width: '150px'
    });
    $("select.f2OutgoingGroup").pqSelect({
        singlePlaceholder: 'Нет',
        width: '150px',
        search: 'false'
    });
}

//--------------------------списать в архив--------------------------------------------------------------------
function toArchOutgoin() {
    var ans = window.confirm("Вы действительно хотите изменить статус у выбранных документов?");
    if (ans) {
        var data = $grid2Out.pqGrid("option", "dataModel.data");
        $grid2Out.pqGrid("showLoading");
        $.each(data, function (key, value) {
            if (value["sel"] == true) {
                Alfresco.util.Ajax.jsonPost({
                    url: Alfresco.constants.PROXY_URI + "taskDocAction",
                    dataObj: {
                        "nodeRef": value["nodeRef"],
                        "action": "docInArhive",
                    },
                    successCallback: {
                        fn: function (response) {
                        }
                    }
                });
            }
        });
        $grid2Out.pqGrid("hideLoading");
        $grid2Out.pqGrid("refreshDataAndView");
    }
}

//--------------------------удалить--------------------------------------------------------------------
function deleteOut() {
    deleteSelected($grid2Out, "Вы действительно хотите удалить выбранные документы?");
}

//------------------------------на печать ----------------------------------------------
function prnOutgoin() {
    var $grid = $grid2Out;
    var url = $grid.pqGrid("option", "dataUrl") + ".html?" +
        getGridParamsStr($grid,
            {pq_sort: JSON.stringify(getSort($grid.pqGrid("option", "dataModel")))}
        );
    window.open(url, "_blank");
}

//--------------------------клик по табу--------------------------------------------------------------------
require(["jquery"], function ($) {
    $(document).ready(function () {
        $('#li_tab12').click(function () {
            if ($grid2Out == "") {
                show2Out();
            }
        });
    })
});