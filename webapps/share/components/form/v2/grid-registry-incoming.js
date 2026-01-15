var $grid2Incomming = "";

/***
 * Запрос групп для текущего пользователя с последующитм создание таблицы "Входящие"
 */
function show2Incomming() {
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
                    createGrid2Incomming(isArch, isAdmin, isUserSED);
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
 * @param isUserSED - может создавать рк
 */
function createGrid2Incomming(isArch, isAdmin, isUserSED) {
    var pq = getDefaultPq();

    var stateAccess = [
        {"Активные": "Активные"},
        {"Проекты документов": "Проекты документов"},
        {"Черновик": "Черновик"},
        {"Зарегистрирован": "Зарегистрирован"},
        {"На рассмотрении": "На рассмотрении"},
        {"На исполнении": "На исполнении"},
        {"Исполнен": "Исполнен"},
        {"На регистрации": "На регистрации"},
        {"В архиве": "В архиве"}
    ];
    if (IDViewReport != 0) {
        stateAccess.push({"Дополнительно": "Дополнительно"});
        stateAccess.push({"На исполнении без резолюций": "На исполнении без резолюций"});
        stateAccess.push({"Для списания в архив": "Для списания в архив"});
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
            title: "executorID",
            dataType: "string",
            dataIndx: "btl-document:task-executor-login",
            hidden: true
        },
        {
            title: "ActualExecutorID",
            dataType: "string",
            dataIndx: "btl-document:task-actual-executor-login",
            hidden: true
        },
        {
            title: "Текущий исполнитель",
            dataType: "string",
            dataIndx: "actualExecutor",
            hidden: true
        },
        {
            title: "Исполнитель",
            dataType: "string",
            dataIndx: "executor",
            hidden: true
        },
        {
            title: "nodeRef",
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
            title: "Рег. номер",
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
            title: "Исходящий номер",
            width: 100,
            dataType: "string",
            dataIndx: "btl-incomming:outgoingNumber",
            filter: {
                type: 'textbox',
                condition: 'contain',
                listeners: ['change']
            }
        },
        {
            title: "Организация",
            width: 200,
            dataType: "string",
            dataIndx: "btl-incomming:contragentUnit-ref",
            cls: "just",
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
                        url: "/share/proxy/alfresco/filters/association?type=btl-contr:contractor-folder&s_field=name&field=name",
                        urlItem: "/share/proxy/alfresco/picker/associationItem?type=btl-contr:contractor-folder&field=name",
                        value: arg1.column.filter.value
                    });

                }
            }
        },
        {
            title: "Подписант от контрагента",
            width: 120,
            dataType: "string",
            dataIndx: "btl-incomming:contragentPerson-ref",
            cls: "just",
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
                        url: "/share/proxy/alfresco/filters/association?type=btl-person:person-content&s_field=fio&field=fio",
                        urlItem: "/share/proxy/alfresco/picker/associationItem?type=btl-person:person-content&field=fio",
                        value: arg1.column.filter.value
                    });

                }
            }
        },
        {
            title: "В ответ на",
            width: 100,
            dataType: "string",
            dataIndx: "btl-document:responseTo-content"
        },
        {
            title: "Содержание",
            width: 300,
            dataType: "string",
            dataIndx: "btl-document:content",
            cls: "just",
            filter: {
                type: 'textbox',
                condition: 'contain',
                listeners: ['change']
            }
        },
        {
            title: "Проект",
            width: 150,
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
            title: "Кому",
            width: 120,
            dataType: "string",
            dataIndx: "btl-incomming:recipient-login",
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
            title: "Тип документа",
            width: 100,
            dataType: "string",
            dataIndx: "btl-document:docType-ref",
            filter: {
                type: 'select',
                condition: 'equal',
                options: typedocIncomming.result,
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
            width: 150,
            dataType: "string",
            dataIndx: "nameTask",
            sortable: false
        }
    ];
    if (isArch) {
        colModel.unshift({
            title: "<input type='checkbox' onclick='selectAllInGrid(this, $grid2Incomming)'>",
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
                $(this).pqGrid("option", "currentCountId", "f2IncomingCurrentCount");
                $(this).pqGrid("option", "totalCountId", "f2IncomingTotalCount");
                $(this).pqGrid("option", "groupSelectSelector", "select.f2IncomingGroup");
                $(this).pqGrid("option", "copyCreateFn", addDocIncommingCreate);
                $(this).pqGrid("option", "dataUrl", "/share/proxy/alfresco/documents/v2/search-registry-incoming");
                $(this).pqGrid("option", "additionalFiltersSelector", "select.f2Incomming");
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
            openModal2Incomminging(ui.rowData.nodeRef);
        }
    };

    newObj.title = "";
    if (isUserSED) {
        newObj.title += "<button type='button' onclick='addDoc2Incomming()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'" +
            " role='button'><span class='ui-button-icon-primary ui-icon ui-icon-plus'></span><span class='ui-button-text'>Создать</span></button>";
    }
    if (isArch) {
        newObj.title += "<button type='button'  style='margin-left: 5px'  onclick='toArchIncomming2()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'" +
            " role='button'><span class='ui-button-icon-primary ui-icon ui-icon-cancel'></span><span class='ui-button-text'>В архив</span></button>";
    }
    if (isAdmin) {
        newObj.title += "<button type='button'  style='margin-left: 5px'  onclick='deleteIncomming()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'" +
            " role='button'><span class='ui-button-icon-primary ui-icon ui-icon-cancel'></span><span class='ui-button-text'>Удалить</span></button>";
    }
    newObj.title += "<button type='button'  style='margin-left: 5px'  onclick='uploadIncommingFiles()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'" +
        " role='button'><span class='ui-button-icon-primary ui-icon ui-icon-cancel'></span><span class='ui-button-text'>Скачать вложения</span></button>";
    newObj.title += "<span style='margin-left: 10px ; margin-bottom: -5px' class='pq-separator '></span>";
    newObj.title += "<button type='button'  style='margin-left: 10px' onclick='prnIncommingInt()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'" +
        " role='button'><span class='ui-button-icon-primary ui-icon ui-icon-print'></span><span class='ui-button-text'>Печать</span></button>";
    if (isArch) {
        newObj.title += "<button type='button'  style='margin-left: 5px'  onclick='printNotExe()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'" +
            " role='button'><span class='ui-button-icon-primary ui-icon ui-icon-print'></span><span class='ui-button-text'>Неисполненные документы</span></button>";
        newObj.title += "<button type='button'  style='margin-left: 5px'  onclick='showA()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'" +
            " role='button'><span class='ui-button-icon-primary ui-icon ui-icon-print'></span><span class='ui-button-text'>Отчет по входящим</span></button>";
    }

    if (isAdmin) {
        newObj.title += "<button type='button'  style='margin-left: 5px'  onclick='reportSearchKidJasper()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'" +
            " role='button'><span class='ui-button-icon-primary ui-icon ui-icon-print'></span><span class='ui-button-text'>Неисполненные документы(J)</span></button>";
    }

    newObj.toolbar = {
        items: [
            {type: '<span>Группировка: </span>'},
            {
                type: 'select',
                cls: 'combo-pg f2IncomingGroup',
                prepend: {'': ''},
                options: [
                    'Организация',
                    'Подписант от контрагента',
                    'Журнал регистрации',
                    'Состояние',
                    'Кому',
                    'Тип документа',
                    'Текущий исполнитель',
                    'Ответственный исполнитель'
                ],
                listeners: [{
                    change: function (evt) {
                        var group;
                        switch ($(this).val()) {
                            case "Организация":
                                group = "btl-incomming:contragentUnit-ref";
                                break;
                            case "Журнал регистрации":
                                group = "btl-document:reg-journal";
                                break;
                            case "Подписант от контрагента":
                                group = "btl-incomming:contragentPerson-ref";
                                break;
                            case "Состояние":
                                group = "btl-document:state";
                                break;
                            case "Кому":
                                group = "btl-incomming:recipient-login";
                                break;
                            case "Тип документа":
                                group = "btl-document:docType-ref";
                                break;
                            case "Текущий исполнитель":
                                group = "actualExecutor";
                                break;
                            case "Ответственный исполнитель":
                                group = "executor";
                                break;
                            default:
                                group = null;
                        }
                        localGroup(group, $grid2Incomming, pq);
                    }
                }]
            },
            {
                type: 'separator'
            },
            {
                type: '<span>Ответственный исполнитель: </span>'
            },
            {
                type: 'select',
                cls: 'combo-pg f2Incomming',
                options: document.emploeeDoc,
                prepend: {'': ''},
                id: 'combo-pg-incomming',
                listeners: [
                    {
                        change: function (evt) {
                            var filterObject = [{
                                dataIndx: "btl-document:task-executor-login",
                                condition: "contain",
                                value: $(this).val()
                            }];
                            $grid2Incomming.pqGrid("filter", {
                                oper: 'add',
                                data: filterObject
                            });
                        }
                    }
                ]
            },
            {type: '<span style="margin-left: 7px">Текущий исполнитель: </span>'},
            {
                type: 'select',
                cls: 'combo-pg f2Incomming',
                options: document.emploeeDoc,
                prepend: {'': ''},
                listeners: [
                    {
                        change: function (evt) {
                            var filterObject = [{
                                dataIndx: "btl-document:task-actual-executor-login",
                                condition: "contain",
                                value: $(this).val()
                            }];
                            $grid2Incomming.pqGrid("filter", {
                                oper: 'add',
                                data: filterObject
                            });
                        }
                    }
                ]
            },
            {type: '<span style="margin-left: 7px">Журнал регистрации: </span>'},
            {
                type: 'select',
                cls: 'combo-pg f2Incomming',
                options: document.rjsFilterData["0"],
                prepend: {'': ''},
                listeners: [
                    {
                        change: function (evt) {
                            var filterObject = [{
                                dataIndx: "regJournalFilter",
                                condition: "equal",
                                value: $(this).val()
                            }];
                            $grid2Incomming.pqGrid("filter", {
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
                        clearGridFilters($grid2Incomming, ["select.f2Incomming"]);
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
                        refreshDataAndView($grid2Incomming);
                    }
                }]
            }
        ]
    };

    $grid2Incomming = $("#grid_2_incomming").pqGrid(newObj);

    $(".f2Incomming").pqSelect({
        singlePlaceholder: 'Все',
        searchRule: "begin",
        width: '150px'
    });
    $(".f2IncomingGroup").pqSelect({
        singlePlaceholder: 'Нет',
        width: '150px',
        search: 'false'
    });
}

/***
 * Открыть окно для печати/экспорта
 */
function prnIncommingInt() {
    var $grid = $grid2Incomming;
    var url = $grid.pqGrid("option", "dataUrl") + ".html?" +
        getGridParamsStr($grid,
            {pq_sort: JSON.stringify(getSort($grid.pqGrid("option", "dataModel")))}
        );
    window.open(url, "_blank");
}

require(["jquery"], function ($) {
    $(document).ready(function () {
        $('#li_tab8').click(function () {
            if ($grid2Incomming == "") {
                show2Incomming();
            }
        });
    })
});


///////////////Без понятия что там ниже и зачем это :(
function openModal2Incomminging(nodeRef) {
    document.frameSave = function () {
        document.getElementById(modalWindowShadow).style.display = "none";
        document.body.style.overflow = "";
        $grid2Incomming.pqGrid("option", "isResetData", true);
        $grid2Incomming.pqGrid("refreshDataAndView");
    };
    document.frameCancel = function () {
        document.getElementById(modalWindowShadow).style.display = "none";
        document.body.style.overflow = "";
        $grid2Incomming.pqGrid("option", "isResetData", true);
        $grid2Incomming.pqGrid("refreshDataAndView");
    };
    var modal = document.getElementById(modalWindowShadow);
    modal.style.display = "block";
    var frameShadowBack = document.getElementById(frameBackground);
    frameShadowBack.innerHTML = '<iframe id="viewDocFrame" style="border-radius: 4px;" width="100%" height="100%" src="/share/page/btl-edit-metadata?nodeRef=' + nodeRef + '&frame=true">';
}

//--------------------------списать в архив--------------------------------------------------------------------
function toArchIncomming2() {
    var ans = window.confirm("Вы действительно хотите изменить статус у выбранных документов?");
    if (ans) {
        var data = $grid2Incomming.pqGrid("option", "dataModel.data");
        $grid2Incomming.pqGrid("showLoading");
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
        $grid2Incomming.pqGrid("hideLoading");
        $grid2Incomming.pqGrid("refreshDataAndView");
    }
}

//Скачать вложения
function uploadIncommingFiles() {
    var data = $grid2Incomming.pqGrid("option", "dataModel.data");
    $grid2Incomming.pqGrid("showLoading");

    var nodes = [];

    $.each(data, function (key, value) {
        if (value["sel"] == true) {
            nodes.push(value["nodeRef"]);
        }
    });

    Alfresco.util.Ajax.jsonPost({
        url: "/share/proxy/alfresco/document/downloadFilesDoc",
        dataObj: {
            "nodes": nodes
        },
        successCallback: {
            fn: function (response) {
                window.open(response.json.url, '_blank');
            }
        }
    });

    $grid2Incomming.pqGrid("hideLoading");
}

//--------------------------удалить--------------------------------------------------------------------
function deleteIncomming() {
    deleteSelected($grid2Incomming, "Вы действительно хотите удалить выбранные документы?");
}

//--------------------------отчет неисполненные--------------------------------------------------------------------
function printNotExe() {
    window.open('/share/proxy/alfresco/documents/search-regestry-kid', '_blank');
}

//--------------------------фльтр исходящего номера документа--------------------------------------------------------------------
// function filterOnOutNum(evt, ui) {
//     if (evt != null) {
//         event = evt.currentTarget.value;
//     }
//     var filterObject = [{
//         dataIndx: "btl-2Incomming:outgoingNumber",
//         condition: "contain",
//         value: event
//     }];
//     /* $('#gridOnExecuteTasksUrgently')[0].checked = false;*/
//     $grid2Incomming.pqGrid("filter", {
//         oper: 'add',
//         data: filterObject
//     });
// }

require(["jquery", "pqgrid"], function ($) {

    //--------------------------отчет-входящие-------------------------------------------------------------------------------------
    $('#searchKIDexe').click(function () {
        var emplReport = $("#emplReport").val();
        var paramSearch = Alfresco.constants.PROXY_URI + "documents/report-kid?q_type=1";
        if (emplReport && emplReport != "") {
            paramSearch += "&emplReport=" + emplReport;
        }
        //датат от
        var fieldVal = '';
        fieldVal = $("#DateKID").val();
        if (fieldVal !== '') {
            paramSearch = paramSearch + '&q_dateFrom=' + fieldVal;
        }
        //дата до
        fieldVal = $("#DateKIDTo").val();
        if (fieldVal !== '') {
            paramSearch = paramSearch + '&q_dateTo=' + fieldVal;
        }
        //незавершенные
        if ($("#finishTaskIn").prop("checked") == true) {
            paramSearch = paramSearch + '&q_finishTask=1';
        }
        //Только первый уровень задач
        if ($("#firstTaskLevel").prop("checked") == true) {
            paramSearch = paramSearch + '&q_firstTaskLevel=1';
        }
        //Только контрольные
        if ($("#taskControl").prop("checked") == true) {
            paramSearch = paramSearch + '&q_taskControl=1';
        }
        // C датой исполнения
        if ($("#dateExe").prop("checked") == true) {
            paramSearch = paramSearch + '&q_dateExe=1';
        }
        //   alert(paramSearch);
        window.open(paramSearch, '_blank');
    });
});

//---------------------------отчет входящие-------------------------------------------------------------------

function showA() {
    b.style.filter = "alpha(opacity=80)";
    b.style.opacity = 0.8;
    b.style.display = "block";
    a.style.display = "block";
    a.style.top = "50%";
    a.style.left = "50%";
    a.style.position = "absolute";
    a.style.marginLeft = "-100px";
    a.style.marginTop = "-75px";
}

function hideA() {
    b.style.display = "none";
    a.style.display = "none";
}

//test jasper
require(["jquery",
    "pqgrid"], function ($) {
    //--------------------------отчет-входящие(jasper)-------------------------------------------------------------------------------------
    $('#reportKIDJasperexe').click(function () {
        var paramSearch = "";
        var emplReport = $("#emplReportJ").val();
        if (emplReport != "") {
            paramSearch += "&emplReport=" + emplReport;
        }
        //дата от
        var fieldVal = '';
        fieldVal = $("#DateKIDJ").val();
        if (fieldVal !== '') {
            paramSearch = paramSearch + '&q_dateFrom=' + fieldVal;
        }
        //дата до
        fieldVal = $("#DateKIDToJ").val();
        if (fieldVal !== '') {
            paramSearch = paramSearch + '&q_dateTo=' + fieldVal;
        }
        //незавершенные
        if ($("#finishTaskInJ").prop("checked") == true) {
            paramSearch = paramSearch + '&q_finishTask=1';
        }
        //Только первый уровень задач
        if ($("#firstTaskLevelJ").prop("checked") == true) {
            paramSearch = paramSearch + '&q_firstTaskLevel=1';
        }
        //Только контрольные
        if ($("#taskControlJ").prop("checked") == true) {
            paramSearch = paramSearch + '&q_taskControl=1';
        }
        // C датой исполнения
        if ($("#dateExeJ").prop("checked") == true) {
            paramSearch = paramSearch + '&q_dateExe=1';
        }

        reportKidJasper(paramSearch);
    });
});
window.onload = function () {
    a = document.getElementById("a");
    b = document.getElementById("b");
    c = document.getElementById("c");
    d = document.getElementById("d");
};

//---------------------------отчет входящие(jasper)-------------------------------------------------------------------
function showReportKidJasper() {
    d.style.filter = "alpha(opacity=80)";
    d.style.opacity = 0.8;
    d.style.display = "block";
    c.style.display = "block";
    c.style.top = "50%";
    c.style.left = "50%";
    c.style.position = "absolute";
    c.style.marginLeft = "-100px";
    c.style.marginTop = "-75px";
}

function hideReportKidJasper() {
    c.style.display = "none";
    d.style.display = "none";
}

function reportKidJasper(param) {
    var reportUrl = Alfresco.constants.PROXY_URI + 'documents/report-kid_jasper';
    var reportParams = '' + param;
    var reportTitle = 'Отчет по входящим';

    document.frameCancel = function () {
        document.getElementById(modalWindowShadow).style.display = "none";
        document.body.style.overflow = "";
        $grid2Incomming.pqGrid("refreshDataAndView");
    };
    var modal = document.getElementById(modalWindowShadow);
    modal.style.display = 'block';
    var frameShadowBack = document.getElementById(frameBackground);
    frameShadowBack.innerHTML = '<iframe id="viewReportFrame" style="border-radius: 4px;" width="100%" height="100%"'
        + ' title="' + reportTitle + '"'
        + ' src="/share/page/arm/reportpreview?reportUrl=' + encodeURIComponent(reportUrl)
        + '&reportParams=' + encodeURIComponent(reportParams)
        + '&reportTitle=' + encodeURIComponent(reportTitle)
        + '">';
}

//--------------------------отчет неисполненные(Jasper)--------------------------------------------------------------------
function reportSearchKidJasper() {

    var reportUrl = Alfresco.constants.PROXY_URI + 'documents/search-regestry-kid_jasper';
    var reportParams = '';
    var reportTitle = 'Неисполненные документы';

    document.frameCancel = function () {
        document.getElementById(modalWindowShadow).style.display = "none";
        document.body.style.overflow = "";
        $grid2Incomming.pqGrid("refreshDataAndView");
    };
    var modal = document.getElementById(modalWindowShadow);
    modal.style.paddingTop = '40px';
    modal.style.display = 'block';

    var closeButton = document.getElementsByClassName("closeButton");
    if (closeButton.length > 0) {
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
