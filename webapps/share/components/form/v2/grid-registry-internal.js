var $grid2Internal = "";

/***
 * Запрос групп для текущего пользователя с последующитм создание таблицы "Внутренние"
 */
function show2Internal() {
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
                    var isClerk = isAdmin || groups.indexOf("GROUP_CLERK") !== -1;
                    var isTest = isAdmin || groups.indexOf("GROUP_TEST") !== -1;
                    create2Internal(isAdmin, isArch, isUserSED, isClerk, isTest);
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
 */
function create2Internal(isAdmin, isArch, isUserSED, isClerk, isTest) {
    var pq = getDefaultPq();

    var stateAccess = [
        {"Активные": "Активные"},
        {"Проекты документов": "Проекты документов"},
        {"Черновик": "Черновик"},
        {"Зарегистрирован": "Зарегистрирован"},
        {"На исполнении": "На исполнении"},
        {"Исполнен": "Исполнен"},
        {"В архиве": "В архиве"},
        {"На согласовании": "На согласовании"},
        {"На подписании": "На подписании"},
        {"На регистрации": "На регистрации"},
        {"Согласован": "Согласован"},
        {"На доработке": "На доработке"},
        {"На рассмотрении": "На рассмотрении"}
    ];
    if (IDViewReport != 0) {
        stateAccess.push({"Дополнительно": "Дополнительно"});
        stateAccess.push({"На исполнении без резолюций": "На исполнении без резолюций"});
        stateAccess.push({"Исполнен с незавершенными резолюциями": "Исполнен с незавершенными резолюциями"});
    }

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
            width: 50,
            dataType: "string",
            dataIndx: "fileExists"
        },
        {
            title: "Номер",
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
            title: "Дата регистрации",
            width: 140,
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
            title: "Получатель",
            width: 200,
            dataType: "string",
            dataIndx: "btl-internal:recipient-login",
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
            width: 200,
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
            title: "Содержание",
            width: 400,
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
            width: 200,
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
            width: 150,
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
            width: 100,
            dataType: "string",
            dataIndx: "btl-document:docType-ref",
            filter: {
                type: 'select',
                condition: 'equal',
                options: typedocInternal.result,
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
            minWidth: 200,
            dataType: "string",
            dataIndx: "nameTask",
            sortable: false
        }
    ];
    if (isArch) {
        colModel.unshift({
            title: "<input type='checkbox' onclick='selectAllInGrid(this, $grid2Internal)'>",
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
                $(this).pqGrid("option", "currentCountId", "f2InternalCurrentCount");
                $(this).pqGrid("option", "totalCountId", "f2InternalTotalCount");
                $(this).pqGrid("option", "groupSelectSelector", "select.f2InternalGroup");
                $(this).pqGrid("option", "copyCreateFn", addDocInternalCreate);
                $(this).pqGrid("option", "dataUrl", "/share/proxy/alfresco/documents/v2/search-registry-internal");
                $(this).pqGrid("option", "additionalFiltersSelector", "select.f2Internal");
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
    var newObjIn = {
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
            openModalEdit(ui.rowData.nodeRef, $(this));
        }
    };

    newObjIn.title = "";
    if (isUserSED) {
        newObjIn.title += "<button type='button' onclick='addDoc2Intrenal()' class='ui-corner-all" +
            " ui-button ui-widget ui-state-default ui-button-text-icon-primary' role='button'><span class='ui-button-icon-primary" +
            " ui-icon ui-icon-plus'></span><span class='ui-button-text'>Создать</span></button>";
    }
    if (isArch) {
        newObjIn.title += "<button type='button'  style='margin-left: 5px'  onclick='toArchInternal()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'" +
        " role='button'><span class='ui-button-icon-primary ui-icon ui-icon-cancel'></span><span class='ui-button-text'>В архив</span></button>";
    }
    if (isAdmin) {
        newObjIn.title += "<button type='button'  style='margin-left: 5px'  onclick='deleteInternal()' class='ui-corner-all" +
            " ui-button ui-widget ui-state-default ui-button-text-icon-primary' role='button'><span class='ui-button-icon-primary" +
            " ui-icon ui-icon-cancel'></span><span class='ui-button-text'>Удалить</span></button>";
    }
    newObjIn.title += "<button type='button' style='margin-left: 5px' onclick='prn2Internal()' class='ui-corner-all" +
        " ui-button ui-widget ui-state-default ui-button-text-icon-primary' role='button'><span class='ui-button-icon-primary" +
        " ui-icon ui-icon-print'></span><span class='ui-button-text'>Печать</span></button>";
    if (isAdmin || isClerk || isTest) {
        newObjIn.title += "<button type='button'  style='margin-left: 5px'  onclick='reportInternalKidJasper()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'" +
            " role='button'><span class='ui-button-icon-primary ui-icon ui-icon-print'></span><span class='ui-button-text'>Неисполненные внутренние документы(J-js)</span></button>";
        newObjIn.title += "<button type='button'  style='margin-left: 5px'  onclick='reportInternalKidJasperJava()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'" +
            " role='button'><span class='ui-button-icon-primary ui-icon ui-icon-print'></span><span class='ui-button-text'>Неисполненные внутренние документы(J)</span></button>";
    }

    newObjIn.toolbar = {
        items: [
            {type: '<span>Группировка: </span>'},
            {
                type: 'select',
                cls: 'combo-pg f2InternalGroup',
                prepend: {'': ''},
                options: [
                    'Состояние',
                    'Тип документа',
                    'Журнал регистрации'
                ],
                listeners: [{
                    change: function (evt) {
                        var group;
                        switch ($(this).val()) {
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
                        localGroup(group, $grid2Internal, pq);
                    }
                }]
            },
            {type: '<span style="margin-left: 7px">Журнал регистрации: </span>'},
            {
                type: 'select',
                cls: 'combo-pg f2Internal',
                options: document.rjsFilterData["2"],
                prepend: {'': ''},
                listeners: [
                    {
                        change: function (evt) {
                            var filterObject = [{
                                dataIndx: "regJournalFilter",
                                condition: "equal",
                                value: $(this).val()
                            }];
                            $grid2Internal.pqGrid("filter", {
                                oper: 'add',
                                data: filterObject
                            });
                        }
                    }
                ]
            },
            {type: '<span style="margin-left: 7px"></span>'},
            {
                type: 'button',
                label: 'Очистить',
                listeners: [{
                    click: function (evt) {
                        clearGridFilters($grid2Internal, ["select.f2Internal"]);
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
                        refreshDataAndView($grid2Internal);
                    }
                }]
            }
        ]
    };

    $grid2Internal = $("#grid_2internal").pqGrid(newObjIn);

    $("select.f2Internal").pqSelect({
        singlePlaceholder: 'Все',
        searchRule: "begin",
        width: '150px'
    });
    $("select.f2InternalGroup").pqSelect({
        singlePlaceholder: 'Нет',
        width: '150px',
        search: 'false'
    });
}

//--------------------------списать в архив--------------------------------------------------------------------
function toArchInternal() {
    var ans = window.confirm("Вы действительно хотите изменить статус у выбранных документов?");
    if (ans) {
        var data = $grid2Internal.pqGrid("option", "dataModel.data");
        $grid2Internal.pqGrid("showLoading");
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
        $grid2Internal.pqGrid("hideLoading");
        $grid2Internal.pqGrid("refreshDataAndView");
    }
}

/***
 * Открыть окно для печати/экспорта
 */
function prn2Internal() {
    var $grid = $grid2Internal;
    var url = $grid.pqGrid("option", "dataUrl") + ".html?" +
        getGridParamsStr($grid,
            {pq_sort: JSON.stringify(getSort($grid.pqGrid("option", "dataModel")))}
        );
    window.open(url, "_blank");
}

/***
 * Удалит выбранные записи
 */
function deleteInternal() {
    deleteSelected($grid2Internal, "Вы действительно хотите удалить выбранные документы?");
}

//--------------------------клик по табу--------------------------------------------------------------------
require(["jquery"], function ($) {
    $(document).ready(function () {
        $('#li_tab11').click(function () {
            if ($grid2Internal == "") {
                show2Internal();
            }
        });
    })
});

//--------------------------отчет Внутренние документы (Jasper)--------------------------------------------------------------------
function reportInternalKidJasper() {
    var reportUrl = Alfresco.constants.PROXY_URI + 'documents/search-regestry-internal_jasper';
    var reportParams = '';
    var reportTitle = 'Внутренние документы';

    document.frameCancel = function () {
        document.getElementById(modalWindowShadow).style.display = "none";
        document.body.style.overflow = "";
        $grid2Incomming.pqGrid("refreshDataAndView");
    };
    var modal = document.getElementById(modalWindowShadow);
    modal.style.paddingTop = '40px';
    modal.style.display = 'block';

    var closeButton = document.getElementsByClassName("closeButton");
    if(closeButton.length>0){
        closeButton[0].style.display = "none";
    }

    var frameShadowBack = document.getElementById(frameBackground);
    frameShadowBack.innerHTML = '<iframe id="viewReportFrame" style="border-radius: 4px;" width="100%" height="100%"'
        + ' title="' + reportTitle + '"'
        + ' src="/share/page/arm/reportpreview?reportUrl=' + encodeURIComponent(reportUrl)
        + '&reportParams=' + encodeURIComponent(reportParams)
        + '&reportTitle=' + encodeURIComponent(reportTitle)
        + '">';
}

//-----отчет Внутренние документы (Jasper Java)
function reportInternalKidJasperJava() {
    var reportUrl = Alfresco.constants.PROXY_URI + 'documents/search-regestry-internal-jasper';
    var reportParams = '';
    var reportTitle = 'Внутренние документы (java)';

    document.frameCancel = function () {
        document.getElementById(modalWindowShadow).style.display = "none";
        document.body.style.overflow = "";
        $grid2Incomming.pqGrid("refreshDataAndView");
    };
    var modal = document.getElementById(modalWindowShadow);
    modal.style.paddingTop = '40px';
    modal.style.display = 'block';

    var closeButton = document.getElementsByClassName("closeButton");
    if(closeButton.length>0){
        closeButton[0].style.display = "none";
    }

    var frameShadowBack = document.getElementById(frameBackground);
    frameShadowBack.innerHTML = '<iframe id="viewReportFrame" style="border-radius: 4px;" width="100%" height="100%"'
        + ' title="' + reportTitle + '"'
        + ' src="/share/page/arm/reportpreview?reportUrl=' + encodeURIComponent(reportUrl)
        + '&reportParams=' + encodeURIComponent(reportParams)
        + '&reportTitle=' + encodeURIComponent(reportTitle)
        + '">';
}