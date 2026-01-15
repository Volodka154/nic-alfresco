var $gridProject = "";

/***
 * Запрос групп для текущего пользователя с последующитм создание таблицы "Внутренние"
 */
function showProject() {
    require(["jquery", "pqgrid", "pqselect", "jquery-ui.datepicker-ru"], function ($) {
        Alfresco.util.Ajax.request({
            method: "GET",
            url: Alfresco.constants.PROXY_URI + "v2/groupPermission?username=" + Alfresco.constants.USERNAME,
            successCallback: {
                fn: function (response) {
                    var groups = response.json.groups;
                    var isAdmin = groups.indexOf("GROUP_ALFRESCO_ADMINISTRATORS") !== -1;
                    var isArch = isAdmin || groups.indexOf("GROUP_EEO") !== -1 || groups.indexOf("GROUP_CLERK") !== -1;
                    var isUserSED = isAdmin || groups.indexOf("GROUP_Пользователи СЭД") !== -1;
                    var isProjectCreator = isAdmin || groups.indexOf("GROUP_BTLab_ProjectCreator") !== -1;
                    creategridProject(isAdmin, isArch, isUserSED, isProjectCreator);
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
 * @param isProjectCreator
 */
function creategridProject(isAdmin, isArch, isUserSED, isProjectCreator) {
    var pq = getDefaultPq();

    var stateAccess = [
        {"1": "В работе"},
        {"0": "Черновик"},
        {"2": "Закрыт"}
    ];


    var colModel = [
        {
            title: "nodeRef",
            width: 100,
            dataType: "string",
            dataIndx: "nodeRef",
            hidden: true,
            align: "center"
        },
        {
            title: "Название",
            width: 150,
            dataType: "string",
            dataIndx: "btl-project:shortName",
            filter: {
                type: 'textbox',
                condition: 'contain',
                listeners: ['change']
            }
        },
       {
            title: "Автор",
            width: 200,
            dataType: "string",
            dataIndx: "btl-project-aspect:author-login",
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
                }
            }
        },
        {
            title: "Руководитель проекта",
            width: 200,
            dataType: "string",
            dataIndx: "btl-project:projectManager-login",
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
                }
            }
        },
        {
            title: "Главный конструктор",
            width: 200,
            dataType: "string",
            dataIndx: "btl-project-aspect:chiefDesigner-login",
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
                }
            }
        },
        {
            title: "Системный архитектор",
            width: 200,
            dataType: "string",
            dataIndx: "btl-project-aspect:systemArchitect-login",
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
                }
            }
        },
        {
            title: "Системный аналитик",
            width: 200,
            dataType: "string",
            dataIndx: "btl-project-aspect:systemsAnalyst-login",
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
                }
            }
        },
        {
            title: "Статус",
            width: 140,
            dataType: "string",
            dataIndx: "btl-project:state",
            filter: {
                type: 'select',
                style: "height:32px;",
                condition: 'equal',
                options: stateAccess,
                prepend: {'': ''},
                value: "1",
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
            title: "Дата создания", minWidth: 160, width: 160,
            dataType: dateType, dataIndx: "cm:created",
            filter: {type: 'textbox', condition: "between", init: pqDatePicker, listeners: ['change']}
        },
    ];

    if (isAdmin || isProjectCreator) {
        colModel.unshift({
            title: "<input type='checkbox' onclick='selectAllInGrid(this, $gridProject)'>",
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
        sortIndx: 'btl-project:projectManager-login',
        sortDir: 'up',
        getUrl: function (ui) {
            if ($(this).pqGrid("option", "isInit2") !== true) {
                $(this).pqGrid("option", "isInit2", true);
                $(this).pqGrid("option", "currentCountId", "f2ProjectCurrentCount");
                $(this).pqGrid("option", "totalCountId", "f2ProjectTotalCount");
                $(this).pqGrid("option", "dataUrl", "/share/proxy/alfresco/documents/v2/search-registry-project");
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
            openModalEdit(ui.rowData.nodeRef, $(this));
        }
    };

    newObjIn.title = "";
    if (isAdmin || isProjectCreator) {
        newObjIn.title += "<button type='button' onclick='addDocProject()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'" +
            " role='button'><span class='ui-button-icon-primary ui-icon ui-icon-plus'></span><span class='ui-button-text'>Создать</span></button>";

        newObjIn.title += "<button type='button'  style='margin-left: 5px'  onclick='deleteProjects()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'" +
            " role='button'><span class='ui-button-icon-primary ui-icon ui-icon-cancel'></span><span class='ui-button-text'>Удалить</span></button>";
    }
    newObjIn.title += "<button type='button'  style='margin-left: 5px' onclick='prnPtoject()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'" +
        " role='button'><span class='ui-button-icon-primary ui-icon ui-icon-print'></span><span class='ui-button-text'>Печать</span></button>";
    newObjIn.title += "<button type='button'  style='margin-left: 5px'  onclick='clearGridFilters($gridProject)' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'" +
        " role='button'><span class='ui-button-icon-primary ui-icon ui-icon-cancel'></span><span class='ui-button-text'>Очистить</span></button>" +
        "<button type='button' style='margin-left: 5px' onclick='refreshDataAndView($gridProject)' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-only' role='button'><span class='ui-button-text'>Обновить</span></button>";


    $gridProject = $("#grid_project").pqGrid(newObjIn);
}

//--------------------------удалить--------------------------------------------------------------------
function deleteProjects() {
    deleteSelected($gridProject, "Вы действительно хотите удалить выбранные проекты?");
}

//--------------------------клик по табу--------------------------------------------------------------------
require(["jquery"], function ($) {
    $(document).ready(function () {
        $('#li_tab14').click(function () {
            if ($gridProject == "") {
                showProject();
            }
        });
    })
});

function prnPtoject() {
    var $grid = $gridProject;
    var url = $grid.pqGrid("option", "dataUrl") + ".html?" +
        getGridParamsStr($grid,
            {pq_sort: JSON.stringify(getSort($grid.pqGrid("option", "dataModel")))}
        );
    window.open(url, "_blank");
}