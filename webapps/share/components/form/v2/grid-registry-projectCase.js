var $gridprojectCase = "";

/***
 * Запрос групп для текущего пользователя с последующитм создание таблицы "Дела проектов"
 */
function showprojectCase() {

    require(["jquery", "pqgrid", "pqselect", "jquery-ui.datepicker-ru"], function () {
        Alfresco.util.Ajax.request({
            method: "GET",
            url: Alfresco.constants.PROXY_URI + "v2/groupPermission?username=" + Alfresco.constants.USERNAME,
            successCallback: {
                fn: function (response) {
                    var groups = response.json.groups;
                    var isAdmin = groups.indexOf("GROUP_ALFRESCO_ADMINISTRATORS") !== -1;
                    var isArch = isAdmin || groups.indexOf("GROUP_EEO") !== -1 || groups.indexOf("GROUP_CLERK") !== -1;
                    var isUserSED = isAdmin || groups.indexOf("GROUP_Пользователи СЭД") !== -1;
                    createGridprojectCase(isAdmin, isArch, isUserSED);
                },
                scope: this
            }
        });
    })
}

/***
 * Создание грида
 * @param isAdmin
 * @param isArch
 * @param isUserSED
 */
function createGridprojectCase(isAdmin, isArch, isUserSED) {
    var pq = getDefaultPq();

    var stateAccess = [
        {"Активные": "Активные"},
        {"Проекты документов": "Проекты документов"},
        {"Черновик": "Черновик"},
        {"Зарегистрирован": "Зарегистрирован"},
        {"В архиве": "В архиве"}
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
            hidden: true,
            align: "center"
        },
        {
            title: "Дата регистрации",
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
            title: "Инвентарный номер",
            width: 160,
            dataType: "string",
            dataIndx: "btl-document:reg-info",
            filter: {
                type: 'textbox',
                condition: 'contain',
                listeners: ['change']
            }
        },
        {
            title: "Шифр проекта (аванпроекта)",
            width: 180,
            dataType: "string",
            dataIndx: "btl-document:project-ref",
            filter: {
                type: 'select',
                condition: 'equal',
                options: [],
                prepend: {'': ''},
                listeners: ["change"],
                init: function (arg1) {
                    $(this).pqSelect({
                        singlePlaceholder: 'Все',
                        searchRule: "begin",
                        width: '100%',
                        url: "/share/proxy/alfresco/filters/association?type=btl-project:projectDataType&s_field=shortName&field=shortName",
                        urlItem: "/share/proxy/alfresco/picker/associationItem?type=btl-project:projectDataType&field=shortName",
                        value: arg1.column.filter.value
                    });
                }
            }
        },
        {
            title: "Руководитель проекта (аванпроекта)",
            width: 200,
            dataType: "string",
            dataIndx: "btl-projectCase:manager-login",
            filter: {
                type: 'select',
                condition: 'equal',
                options: document.emploeeDoc,
                prepend: {'': ''},
                listeners: ["change"],
                init: function () {
                    $(this).pqSelect({
                        singlePlaceholder: 'Все',
                        searchRule: "begin",
                        width: '100%'
                    });
                },
            }
        },
        {
            title: "Дата начала ведения дела",
            width: 160,
            dataType: dateType,
            dataIndx: "btl-projectCase:startDate",
            filter: {
                type: 'textbox',
                condition: "between",
                init: pqDatePicker,
                listeners: ['change']
            }
        },
        {
            title: "Номер и дата служебной записки (об открытии дела)",
            width: 180,
            dataType: "string",
            dataIndx: "btl-projectCase:documentStart-content",
            sortable: false
        },
        {
            title: "Дата окончания ведения дела",
            width: 160,
            dataType: dateType,
            dataIndx: "btl-projectCase:endtDate",
            filter: {
                type: 'textbox',
                condition: "between",
                init: pqDatePicker,
                listeners: ['change']
            }
        },
        {
            title: "Номер и дата служебной записки (о закрытии дела)",
            width: 250,
            dataType: "string",
            dataIndx: "btl-projectCase:documentEnd-content",
            sortable: false
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
                },
            }
        },
        {
            title: "Дата передачи дела в архив",
            width: 160,
            dataType: dateType,
            dataIndx: "btl-projectCase:arhiveDate",
            filter: {
                type: 'textbox',
                condition: "between",
                init: pqDatePicker,
                listeners: ['change']
            }
        }
        ];

    if (isArch) {
        colModel.unshift({
            title: "<input type='checkbox' onclick='selectAllInGrid(this, $gridprojectCase)'>",
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
                $(this).pqGrid("option", "currentCountId", "f2projectCaseCurrentCount");
                $(this).pqGrid("option", "totalCountId", "f2projectCaseTotalCount");
                $(this).pqGrid("option", "groupSelectSelector", "select.f2projectCaseGroup");
                $(this).pqGrid("option", "dataUrl", "/share/proxy/alfresco/documents/v2/search-registry-projectCase");
                $(this).pqGrid("option", "additionalFiltersSelector", "select.f2projectCase");
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

    var newObj = {
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
        rowDblClick: function (event, ui) {
            openModalEdit(ui.rowData.nodeRef, $(this));
        }
    };

    newObj.title = "";
    if (isUserSED) {
        newObj.title += "<button type='button' onclick='addDocprojectCase()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'" +
            " role='button'><span class='ui-button-icon-primary ui-icon ui-icon-plus'></span><span class='ui-button-text'>Создать</span></button>";
    }

    if (isArch) {
        newObj.title += "<button type='button' style='margin-left: 5px'  onclick='toArchprojectCase()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'" +
            " role='button'><span class='ui-button-icon-primary ui-icon ui-icon-cancel'></span><span class='ui-button-text'>В архив</span></button>";
    }
    if (isAdmin) {
        newObj.title += "<button type='button'  style='margin-left: 5px'  onclick='deleteProjectCase()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'" +
            " role='button'><span class='ui-button-icon-primary ui-icon ui-icon-cancel'></span><span class='ui-button-text'>Удалить</span></button>";
    }
    newObj.title += "<button type='button'  style='margin-left: 5px' onclick='prnProjectCase()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'" +
        " role='button'><span class='ui-button-icon-primary ui-icon ui-icon-print'></span><span class='ui-button-text'>Печать</span></button>" +
        "<button type='button'  style='margin-left: 5px'  onclick='clearGridFilters($gridprojectCase)' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary' role='button'>";

    newObj.toolbar = {
        items: [
            {
                type: '<span>Группировка: </span>'
            },
            {
                type: 'select',
                cls: 'combo-pg f2projectCaseGroup',
                prepend: {'': ''},
                options: [
                    'Журнал регистрации'
                ],
                listeners: [
                    {
                        change: function (evt) {
                            var group;
                            switch ($(this).val()) {
                                case "Журнал регистрации":
                                    group = "btl-document:reg-journal";
                                    break;
                                default:
                                    group = null;
                            }
                            localGroup(group, $gridprojectCase, pq);
                        }
                    }
                ]
            },
            {type: '<span style="margin-left: 7px">Журнал регистрации: </span>'},
            {
                type: 'select',
                cls: 'combo-pg f2projectCase',
                options: document.rjsFilterData["4"],
                prepend: {'': ''},
                listeners: [
                    {
                        change: function (evt) {
                            var filterObject = [{
                                dataIndx: "regJournalFilter",
                                condition: "equal",
                                value: $(this).val()
                            }];
                            $gridprojectCase.pqGrid("filter", {
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
                        clearGridFilters($gridprojectCase, ["select.f2projectCase"]);
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
                        refreshDataAndView($gridprojectCase);
                    }
                }]
            }
        ]
    };

    $gridprojectCase = $("#grid_projectCase").pqGrid(newObj);

    $("select.f2projectCase").pqSelect({
        singlePlaceholder: 'Все',
        searchRule: "begin",
        width: '150px'
    });
    $("select.f2projectCaseGroup").pqSelect({
        singlePlaceholder: 'Нет',
        width: '150px',
        search: 'false'
    });
}

/***
 * Открыть окно для печати/экспорта
 */
function prnProjectCase() {
    var $grid = $gridprojectCase;
    var url = $grid.pqGrid("option", "dataUrl") + ".html?" +
        getGridParamsStr($grid,
            {pq_sort: JSON.stringify(getSort($grid.pqGrid("option", "dataModel")))}
        );
    window.open(url, "_blank");
}

//--------------------------списать в архив--------------------------------------------------------------------
function toArchprojectCase() {
    var ans = window.confirm("Вы действительно хотите изменить статус у выбранных документов?");
    if (ans) {
        var data = $gridprojectCase.pqGrid("option", "dataModel.data");
        $gridprojectCase.pqGrid("showLoading");
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
        $gridprojectCase.pqGrid("hideLoading");
        $gridprojectCase.pqGrid("refreshDataAndView");
    }
}

//--------------------------удалить--------------------------------------------------------------------
function deleteProjectCase() {
    deleteSelected($gridprojectCase, "Вы действительно хотите удалить выбранные дела?");
}

//--------------------------клик по табу--------------------------------------------------------------------
require(["jquery"], function ($) {
    $(document).ready(function () {
        $('#li_tab10').click(function () {
            if ($gridprojectCase == "") {
                showprojectCase();
            }
        });
    })
});