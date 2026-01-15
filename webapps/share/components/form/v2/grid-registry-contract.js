var $gridContract = '';

/***
 * Запрос групп для текущего пользователя с последующитм создание таблицы "Договоры"
 */
function showContract() {
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
                    createContract(isAdmin, isArch, isUserSED);
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
function createContract(isAdmin, isArch, isUserSED) {
    var pq = getDefaultPq();

    var typeContract = [
        {'Договор': 'Договор'},
        {'ДС': 'ДС'},

    ];

    var stateContract = [
        {'Проект': 'Проект'},
        {'На согласовании': 'На согласовании'},
        {'На доработке': 'На доработке'},
        {'Согласован': 'Согласован'},
        {'На регистрации': 'На регистрации'},
        {'Отозван': 'Отозван'},
        {'Отменен': 'Отменен'},
        {'Зарегистрирован': 'Зарегистрирован'},
        {'Действует': 'Действует'}
    ];

    var colModel = [
        {
            title: 'nodeRef',
            dataType: 'string',
            dataIndx: 'nodeRef',
            hidden: true
        },
        {
            title: 'Файл',
            width: 70,
            dataType: 'string',
            dataIndx: 'fileExists',
        },
        {
            title: 'Дата создания',
            width: 160,
            dataType: dateType,
            dataIndx: 'cm:created',
            filter: {
                type: 'textbox',
                condition: 'between',
                init: pqDatePicker,
                listeners: ['change']
            },
        },
        {
            title: 'Тип',
            width: 200,
            dataType: 'string',
            dataIndx: 'btl-contract:type',
            filter: {
                type: 'select',
                condition: 'equal',
                options: typeContract,
                prepend: {'': ''},
                listeners: ['change'],
                init: function () {
                    $(this).pqSelect({
                        singlePlaceholder: 'Все',
                        searchRule: 'contain',
                        width: '100%'
                    });
                },
            },
        },
        {
            title: 'Вид договора',
            width: 160,
            dataType: 'string',
            dataIndx: 'btl-document:docType-ref',
            cls: 'just',
            filter: {
                type: 'select',
                condition: 'contain',
                options: {},
                prepend: {'': ''},
                listeners: ['change'],
                init: function () {
                    $(this).pqSelect({
                        singlePlaceholder: 'Все',
                        searchRule: 'begin',
                        width: '100%',
                        url: encodeURI(encodeURI('/share/proxy/alfresco/filters/association?type=btl-docType:docTypeData&s_field=name&field=name&filter=type:"Договор"'))
                    });
                },
            },
        },
        // {
        //     title: 'docTypes',
        //     dataIndx: 'docTypes',
        //     hidden: true
        // },
        {
            title: 'Номер',
            width: 100,
            dataType: 'string',
            dataIndx: 'btl-document:regNumber',
            filter: {
                type: 'textbox',
                condition: 'contain',
                listeners: ['change']
            },
        },
        {
            title: 'Дата регистрации',
            width: 160,
            dataType: dateType,
            dataIndx: 'btl-document:regDate',
            filter: {
                type: 'textbox',
                condition: 'between',
                init: pqDatePicker,
                listeners: ['change']
            },
        },
        {
            title: 'Контрагент(ы)',
            width: 160,
            dataType: 'string',
            dataIndx: 'btl-contract:contractors-ref',
            cls: 'just',
            filter: {
                type: 'select',
                condition: 'contain',
                options: document.organizations,
                prepend: {'': ''},
                listeners: ['change'],
                init: function () {
                    $(this).pqSelect({
                        singlePlaceholder: 'Все',
                        searchRule: 'begin',
                        width: '100%',
                        url: '/share/proxy/alfresco/filters/association?type=btl-contr:contractor-folder&s_field=name&field=name'
                    });
                },
            },
        },
        // {
        //     title: 'contragents',
        //     dataIndx: 'contragents',
        //     hidden: true
        // },
        {
            title: 'Номер контрагента',
            width: 120,
            dataType: 'string',
            dataIndx: 'btl-contract:numberContractor',
            filter: {
                type: 'textbox',
                condition: 'contain',
                listeners: ['change']
            },
        },
        {
            title: 'Состояние',
            width: 120,
            dataType: 'string',
            dataIndx: 'btl-document:state',
            filter: {
                type: 'select',
                condition: 'equal',
                options: stateContract,
                prepend: {'': ''},
                listeners: ['change'],
                init: function () {
                    $(this).pqSelect({
                        singlePlaceholder: 'Все',
                        search: false,
                        width: '100%'
                    });
                },
            },
        },
        {
            title: 'Предмет',
            width: 180,
            dataType: 'string',
            dataIndx: 'btl-contract:summaryContract',
            filter: {
                type: 'textbox',
                condition: 'contain',
                listeners: ['change']
            },
        }

    ];
    if (isAdmin) {
        colModel.unshift({
            title: "<input type='checkbox' onclick='selectAllInGrid(this, $gridContract)'>",
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
                $(this).pqGrid("option", "currentCountId", "f2ContractCurrentCount");
                $(this).pqGrid("option", "totalCountId", "f2ContractTotalCount");
                $(this).pqGrid("option", "groupSelectSelector", "select.f2ContractGroup");
                $(this).pqGrid("option", "copyCreateFn", addDocInternalCreate);
                $(this).pqGrid("option", "dataUrl", "/share/proxy/alfresco/documents/v2/search-registry-contract");
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
            openModalEditContract(ui.rowData.nodeRef, $(this));
        }
    };

    newObj.title = "";
    if (isUserSED) {
        newObj.title += "<button type='button'  style='margin-left: 10px' onclick='addContract()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'" +
            " role='button'><span class='ui-button-icon-primary ui-icon ui-icon-plus'></span><span class='ui-button-text'>Создать</span></button>";
    }
    if (isAdmin) {
        newObj.title += "<button type='button'  style='margin-left: 5px'  onclick='deleteContract()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'" +
            " role='button'><span class='ui-button-icon-primary ui-icon ui-icon-cancel'></span><span class='ui-button-text'>Удалить</span></button>";
    }
    newObj.title += "<button type='button'  style='margin-left: 10px' onclick='prnContract()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'" +
        " role='button'><span class='ui-button-icon-primary ui-icon ui-icon-print'></span><span class='ui-button-text'>Печать</span></button>";
    newObj.toolbar = {
        items: [
            {type: '<span>Группировка: </span>'},
            {
                type: 'select',
                cls: 'combo-pg f2ContractGroup',
                prepend: {'': ''},
                options: ['Тип', 'Вид договора',],
                listeners: [{
                    change: function (evt) {
                        var group;
                        switch ($(this).val()) {
                            case "Тип":
                                group = "btl-contract:type";
                                break;
                            case "Вид договора":
                                group = "btl-document:docType-ref";
                                break;
                            default:
                                group = null;
                        }
                        localGroup(group, $gridContract, pq);
                    },
                },
                ],
            },
            {type: '<span style="margin-left: 7px"></span>'},
            {
                type: 'button',
                label: 'Очистить',
                listeners: [
                    {
                        click: function (evt) {
                            clearGridFilters($gridContract, []);
                        },
                    }],
                icon: 'ui-icon-cancel',
            },
            {type: '<span style="margin-left: 7px"></span>'},
            {
                type: 'button',
                cls: 'registry-refresh-btn',
                label: 'Обновить',
                listeners: [{
                    click: function (evt) {
                        refreshDataAndView($gridContract);
                    }
                }]
            }
        ],
    };

    $gridContract = $('#grid_contract').pqGrid(newObj);

    $('.f2ContractGroup').pqSelect({
        singlePlaceholder: 'Нет',
        width: '150px',
        search: 'false',
    });
}


function openModalEditContract(nodeRef, grid) {
    document.activeGrid = grid;

    document.frameSave = function () {
        document.getElementById(modalWindowShadow).style.display = "none";
        document.body.style.overflow = "";
        $gridContract.pqGrid("option", "isResetData", true);
        $gridContract.pqGrid('refreshDataAndView');
    };
    document.frameCancel = function () {
        document.getElementById(modalWindowShadow).style.display = "none";
        document.body.style.overflow = "";
        $gridContract.pqGrid("option", "isResetData", true);
        $gridContract.pqGrid('refreshDataAndView');
    };
    var modal = document.getElementById(modalWindowShadow);
    modal.style.display = "block";
    var frameShadowBack = document.getElementById(frameBackground);
    frameShadowBack.innerHTML = '<iframe id="viewDocFrame" style="border-radius: 4px;" width="100%" height="100%" src="/share/page/arm/contract?nodeRef=' + nodeRef + '&frame=true">';
}

function addContract(id) {
    setSaveCancelFunction($gridContract);


    var modal = document.getElementById(modalWindowShadow);
    modal.style.display = "block";

    var frameShadowBack = document.getElementById(frameBackground);

    frameShadowBack.innerHTML = '<iframe id="viewDocFrame" style="border-radius: 4px;" width="100%" height="100%" src="/share/page/arm/contract">';
    document.body.style.overflow = "hidden";
}

//------------------------------на печать ----------------------------------------------
function prnContract() {
    var $grid = $gridContract;
    var url = $grid.pqGrid("option", "dataUrl") + ".html?" +
        getGridParamsStr($grid,
            {pq_sort: JSON.stringify(getSort($grid.pqGrid("option", "dataModel")))}
        );
    window.open(url, "_blank");
}

//--------------------------удалить--------------------------------------------------------------------
function deleteContract() {
    deleteSelected($gridContract, "Вы действительно хотите удалить выбранные договоры?");
}

//--------------------------клик по табу--------------------------------------------------------------------
require(['jquery'], function ($) {
    $(document).ready(function () {
        $('#li_tab15').click(function () {
            if ($gridContract == '') {
                showContract();
            }
        });
    });
});
