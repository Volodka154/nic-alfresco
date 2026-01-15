var $gridNTD = "";

/***
 * Запрос групп для текущего пользователя с последующитм создание таблицы "НТД"
 */
function showNTD() {
    require(["jquery", "pqgrid", "pqselect", "jquery-ui.datepicker-ru"], function () {
        Alfresco.util.Ajax.request({
            method: "GET",
            url: Alfresco.constants.PROXY_URI + "v2/groupPermission?username=" + Alfresco.constants.USERNAME,
            successCallback: {
                fn: function (response) {
                    var groups = response.json.groups;
                    var isAdmin = groups.indexOf("GROUP_ALFRESCO_ADMINISTRATORS") !== -1;
                    var isArch = isAdmin || groups.indexOf("GROUP_EEO") !== -1 || groups.indexOf("GROUP_CLERK") !== -1;
                    createGridNTD(isArch, isAdmin);
                },
                scope: this
            }
        });
    })
}

//--------------------------создать грид--------------------------------------------------------------------
function createGridNTD(isArch, isAdmin) {
    var pq = getDefaultPq();

    var stateAccess = [
        {"Активные": "Активные"},
        {"Проекты документов": "Проекты документов"},
        {"Черновик": "Черновик"},
        {"Зарегистрирован": "Зарегистрирован"},
        {"В архиве": "В архиве"}
    ];

    var mediaTypes = [
        {"0": "Книга"},
        {"1": "Брошюра"},
        {"2": "Флэшнакопитель"},
        {"3": "CD-диск"},
        {"4": "DVD-диск"},
        {"5": "А4 – А0"},
        {"6": "А4"},
        {"7": "А3"},
        {"8": "А2"},
        {"9": "А1"},
        {"10": " А0"}
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
            width: 100,
            dataType: "string",
            dataIndx: "btl-document:reg-info",
            filter: {
                type: 'textbox',
                condition: 'contain',
                listeners: ['change']
            }
        },
        {
            title: "Том",
            width: 120,
            dataType: "string",
            dataIndx: "btl-ntd:tom"
        },
        {
            title: "Название",
            width: 300,
            dataType: "string",
            dataIndx: "btl-document:name",
            filter: {
                type: 'textbox',
                condition: 'contain',
                listeners: ['change']
            }
        },

        {
            title: "Ф.И.О. работника, сдавшего НТД",
            width: 130,
            dataType: "string",
            dataIndx: "btl-document:author-login",
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
            title: "Шифр проекта (аванпроекта)",
            width: 100,
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
            title: "Вид НТД",
            width: 130,
            dataType: "string",
            dataIndx: "btl-document:docType-ref",
            filter: {
                type: 'select',
                condition: 'equal',
                options: typedocNTD.result,
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
            title: "Дата и номер сопроводительного документа",
            width: 150,
            dataType: "string",
            dataIndx: "btl-ntd:document-content",
            filter: {
                type: 'textbox',
                condition: 'contain',
                listeners: ['change']
            }
        },
        {
            title: "Примечание",
            width: 200,
            dataType: "string",
            dataIndx: "btl-document:content",
            filter: {
                type: 'textbox',
                condition: 'contain',
                listeners: ['change']
            }
        },
        {
            title: "Количество листов/брошюр/МНИ",
            width: 100,
            dataType: "string",
            dataIndx: "btl-ntd:sheetsCount"
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
            title: "Вид носителя",
            width: 100,
            dataType: "string",
            dataIndx: "btl-ntd:viewMedia",
            sortable: false,
            filter: {
                type: 'select',
                style: "height:32px;",
                condition: 'equal',
                options: mediaTypes,
                listeners: ["change"],
                prepend: {'': ''},
                init: function () {
                    $(this).pqSelect({
                        singlePlaceholder: 'Все',
                        search: false,
                        width: '100%'
                    });
                },
            }
        }
    ];

    if (isArch) {
        colModel.unshift({
            title: "<input type='checkbox' id='selAllNTD' onclick='selectAllInGrid(this, $gridNTD)''>",
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
                $(this).pqGrid("option", "currentCountId", "f2NTDCurrentCount");
                $(this).pqGrid("option", "totalCountId", "f2NTDTotalCount");
                $(this).pqGrid("option", "groupSelectSelector", "select.f2NTDGroup");
                $(this).pqGrid("option", "copyCreateFn", addDocNTDCreate);
                $(this).pqGrid("option", "dataUrl", "/share/proxy/alfresco/documents/v2/search-registry-ntd");
                $(this).pqGrid("option", "additionalFiltersSelector", "select.f2NTD");
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
        rowRightClick: function (event, ui) {
            return rowRightClick2(event, ui, $(this).pqGrid("option", "copyCreateFn"));
        },
        rowDblClick: function (event, ui) {
            openModalEdit(ui.rowData.nodeRef, $gridNTD);
        }
    };

    newObj.title = "";
    if (isArch) {
        newObj.title += "<button type='button' onclick='addDocNTD()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'" +
            " role='button'><span class='ui-button-icon-primary ui-icon ui-icon-plus'></span><span class='ui-button-text'>Создать</span></button>" +
            "<button type='button'  style='margin-left: 5px'  onclick='toArchNTD()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'" +
            " role='button'><span class='ui-button-icon-primary ui-icon ui-icon-cancel'></span><span class='ui-button-text'>В архив</span></button>";
    }
    if (isAdmin) {
        newObj.title += "<button type='button'  style='margin-left: 5px'  onclick='deleteNTD()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'" +
            " role='button'><span class='ui-button-icon-primary ui-icon ui-icon-cancel'></span><span class='ui-button-text'>Удалить</span></button>";
    }
    newObj.title += "<button type='button'  style='margin-left: 10px' onclick='prnNtd()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'" +
        " role='button'><span class='ui-button-icon-primary ui-icon ui-icon-print'></span><span class='ui-button-text'>Печать</span></button>" +
        "<button type='button'  style='margin-left: 5px'  onclick='clearGridFilters($gridNTD)' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary' role='button'>";

    newObj.toolbar = {
        items: [
            {
                type: '<span>Группировка: </span>'
            },
            {
                type: 'select',
                cls: 'combo-pg f2NTDGroup',
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
                            localGroup(group, $gridNTD, pq);
                        }
                    }
                ]
            },
            {type: '<span style="margin-left: 7px">Журнал регистрации: </span>'},
            {
                type: 'select',
                cls: 'combo-pg f2NTD',
                options: document.rjsFilterData["3"],
                prepend: {'': ''},
                listeners: [
                    {
                        change: function (evt) {
                            var filterObject = [{
                                dataIndx: "regJournalFilter",
                                condition: "equal",
                                value: $(this).val()
                            }];
                            $gridNTD.pqGrid("filter", {
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
                        clearGridFilters($gridNTD, ["select.f2NTD"]);
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
                        refreshDataAndView($gridNTD);
                    }
                }]
            }
        ]
    };

    $gridNTD = $("#grid_ntd").pqGrid(newObj);

    $("select.f2NTD").pqSelect({
        singlePlaceholder: 'Все',
        searchRule: "begin",
        width: '150px'
    });
    $("select.f2NTDGroup").pqSelect({
        singlePlaceholder: 'Нет',
        width: '150px',
        search: 'false'
    });
}

//--------------------------списать в архив--------------------------------------------------------------------
function toArchNTD() {
    var ans = window.confirm("Вы действительно хотите изменить статус у выбранных документов?");
    if (ans) {
        var data = $gridNTD.pqGrid("option", "dataModel.data");
        $gridNTD.pqGrid("showLoading");
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
        $gridNTD.pqGrid("hideLoading");
        $gridNTD.pqGrid("refreshDataAndView");
    }
}

//--------------------------удалить--------------------------------------------------------------------
function deleteNTD() {
    deleteSelected($gridNTD, "Вы действительно хотите удалить выбранные документы?");
}

//--------------------------клик по табу--------------------------------------------------------------------
require(["jquery"], function ($) {
    $(document).ready(function () {
        $('#li_tab9').click(function () {
            if ($gridNTD == "") {
                showNTD();
            }
        });
    })
});

//--------------------------печать--------------------------------------------------------------------
function prnNtd() {
    var $grid = $gridNTD;
    var url = $grid.pqGrid("option", "dataUrl") + ".html?" +
        getGridParamsStr($grid,
            {pq_sort: JSON.stringify(getSort($grid.pqGrid("option", "dataModel")))}
        );
    window.open(url, "_blank");
}
