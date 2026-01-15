var $gridDecree = "";

/***
 * Запрос групп для текущего пользователя с последующитм создание таблицы "ОРД"
 */
function showDecree() {
    require(["jquery", "pqgrid", "pqselect", "jquery-ui.datepicker-ru"], function () {
        Alfresco.util.Ajax.request({
            method: "GET",
            url: Alfresco.constants.PROXY_URI + "v2/groupPermission?username=" + Alfresco.constants.USERNAME,
            successCallback: {
                fn: function (response) {
                    var groups = response.json.groups;
                    var isAdmin = groups.indexOf("GROUP_ALFRESCO_ADMINISTRATORS") !== -1;
                    var isUserSED = isAdmin || groups.indexOf("GROUP_Пользователи СЭД") !== -1;
                    createGridDecree(isAdmin, isUserSED);
                },
                scope: this
            }
        });
    })
}

/***
 * Создание грида
 * @param isAdmin
 */
function createGridDecree(isAdmin, isUserSED) {
    var pq = getDefaultPq();

    var stateAccess = [
        {"Активные": "Активные"},
        {"Проекты документов": "Проекты документов"},
        {"Черновик": "Черновик"},
        {"Зарегистрирован": "Зарегистрирован"},
        {"На доработке": "На доработке"},
        {"На согласовании": "На согласовании"},
        {"Согласован": "Согласован"},
        {"На подписании": "На подписании"},
        {"На регистрации": "На регистрации"},
        {"Действует": "Действует"},
        {"Исполнен": "Исполнен"},
        {"Утратил силу": "Утратил силу"}
    ];

    var colModel =[
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
            minWidth: 100,
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
            width: 300,
            dataType: "string",
            dataIndx: "btl-document:content",
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
                },
            }
        },
        {
            title: "Тип документа",
            minWidth: 200,
            dataType: "string",
            dataIndx: "btl-document:docType-ref",
            filter: {
                type: 'select',
                condition: 'equal',
                options: typedocORD.result,
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
            title: "Проект",
            minWidth: 200,
            dataType: "string",
            dataIndx: "btl-document:project-content" ,
            filter: {
                type: 'textbox',
                condition: 'contain',
                listeners: ['change']
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
    if (isAdmin) {
        colModel.unshift({
            title: "<input type='checkbox' id='selAllDecree' onclick='selectAllInGrid(this, $gridDecree)'>",
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
                $(this).pqGrid("option", "currentCountId", "f2DecreeCurrentCount");
                $(this).pqGrid("option", "totalCountId", "f2DecreeTotalCount");
                $(this).pqGrid("option", "groupSelectSelector", "select.fDecreeGroup");
                $(this).pqGrid("option", "dataUrl", "/share/proxy/alfresco/documents/v2/search-registry-decree");
                $(this).pqGrid("option", "additionalFiltersSelector", "select.f2Decree");
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
        rowDblClick: function (event, ui) {
            openModalDecree(ui.rowData.nodeRef);
        }
    };

    newObjIn.title = "";
    if (isUserSED) {
        newObjIn.title += "<button type='button' onclick='addDocDecree()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'" +
            " role='button'><span class='ui-button-icon-primary ui-icon ui-icon-plus'></span><span class='ui-button-text'>Создать</span></button>";
    }
    if (isAdmin){
        newObjIn.title += "<button type='button'  style='margin-left: 5px'  onclick='deleteDecree()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'"+
        " role='button'><span class='ui-button-icon-primary ui-icon ui-icon-cancel'></span><span class='ui-button-text'>Удалить</span></button>";
    }
    newObjIn.title += "<button type='button'  style='margin-left: 5px' onclick='prnInternalPr()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'" +
    " role='button'><span class='ui-button-icon-primary ui-icon ui-icon-print'></span><span class='ui-button-text'>Печать</span></button>";

    newObjIn.toolbar = {
        items: [
            {type: '<span>Группировка: </span>'},
            {
                type: 'select',
                cls: 'combo-pg fDecreeGroup',
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
                            localGroup(group, $gridDecree, pq);
                        }
                    }
                ]
            },
            {type: '<span style="margin-left: 7px">Журнал регистрации: </span>'},
            {
                type: 'select',
                cls: 'combo-pg f2Decree',
                options: document.rjsFilterData["6"],
                prepend: {'': ''},
                listeners: [
                    {
                        change: function (evt) {
                            var filterObject = [{
                                dataIndx: "regJournalFilter",
                                condition: "equal",
                                value: $(this).val()
                            }];
                            $gridDecree.pqGrid("filter", {
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
                        clearGridFilters($gridDecree, ["select.f2Decree"]);
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
                        refreshDataAndView($gridDecree);
                    }
                }]
            }
        ]
    };

    $gridDecree = $("#grid_decree").pqGrid(newObjIn);

    $("select.f2Decree").pqSelect({
        singlePlaceholder: 'Все',
        searchRule: "begin",
        width: '150px'
    });
    $("select.fDecreeGroup").pqSelect({
        singlePlaceholder: 'Нет',
        width: '150px',
        search: 'false'
    });
}

function openModalDecree(nodeRef) {
    document.frameSave = function () {
        document.getElementById(modalWindowShadow).style.display = "none";
        document.body.style.overflow = "";
        $gridDecree.pqGrid("option", "isResetData", true);
        $gridDecree.pqGrid("refreshDataAndView");
    };
    document.frameCancel = function () {
        document.getElementById(modalWindowShadow).style.display = "none";
        document.body.style.overflow = "";
        $gridDecree.pqGrid("option", "isResetData", true);
        $gridDecree.pqGrid("refreshDataAndView");
    };
    var modal = document.getElementById(modalWindowShadow);
    modal.style.display = "block";
    var frameShadowBack = document.getElementById(frameBackground);

    frameShadowBack.innerHTML = '<iframe id="viewDocFrame" style="border-radius: 4px;" width="100%" height="100%" src="/share/page/btl-edit-metadata?nodeRef=' + nodeRef + '&frame=true">';
}

function prnInternalPr() {
    var $grid = $gridDecree;
    var url = $grid.pqGrid("option", "dataUrl") + ".html?" +
        getGridParamsStr($grid,
            {pq_sort: JSON.stringify(getSort($grid.pqGrid("option", "dataModel")))}
        );
    window.open(url, "_blank");
}

//--------------------------удалить--------------------------------------------------------------------
function deleteDecree() {
    deleteSelected($gridDecree, "Вы действительно хотите удалить выбранные документы?");
}

//--------------------------клик по табу--------------------------------------------------------------------
require(["jquery"], function ($) {
    $(document).ready(function () {
        $('#li_tab6').click(function () {
            if ($gridDecree == "") {
                showDecree();
            }
        });
    })
});
