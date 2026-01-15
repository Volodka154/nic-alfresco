var $gridRegistration = "";

/***
 * Запрос групп для текущего пользователя с последующитм создание таблицы "На регистрацию"
 */
function showRegistration() {
    require(["jquery", "pqgrid", "pqselect", "jquery-ui.datepicker-ru"], function () {
        Alfresco.util.Ajax.request({
            method: "GET",
            url: Alfresco.constants.PROXY_URI + "v2/groupPermission?username=" + Alfresco.constants.USERNAME,
            successCallback: {
                fn: function (response) {
                    var groups = response.json.groups;
                    var isAdmin = groups.indexOf("GROUP_ALFRESCO_ADMINISTRATORS") !== -1;
                    var isClerk = isAdmin || groups.indexOf("GROUP_CLERK") !== -1;
                    var isContract =  isAdmin || groups.indexOf("GROUP_BTLab_Contract") !== -1;
                    createRegistration(isClerk, isContract);
                },
                scope: this
            }
        });
    })
}

/***
 * Создание грида
 * @param isClerk
 * @param isContract
 */
function createRegistration(isClerk, isContract) {
    var pq = getDefaultPq();

    var typeAccess = [];

    if (isClerk) {
        typeAccess.push(
            {"btl-internal:documentDataType": "Внутренний"},
            {"btl-outgoing:documentDataType": "Исходящий"},
            {"btl-incomming:documentDataType": "Входящий"},
            {"btl-ord:documentDataType": "ОРД"}
        );
    }

    if (isContract) {
        typeAccess.push(
            {"btl-contract:contractTypeData": "Договор"}
        );
    }


    var colModel = [
        {
            title: "nodeRef",
            width: 100,
            dataType: "string",
            dataIndx: "nodeRef",
            hidden: true
        },
        {
            title: "Файл",
            width: 100,
            dataType: "string",
            dataIndx: "fileExists"
        },
        {
            title: "Вид",
            width: 100,
            dataType: "string",
            dataIndx: "docType",
            sortable: false,
            filter: {
                type: 'select',
                condition: 'equal',
                options: typeAccess,
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
            title: "Инициатор",
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
            width: 600,
            dataType: "string",
            dataIndx: "btl-document:content",
            filter: {
                type: 'textbox',
                condition: 'contain',
                listeners: ['change']
            }
        },
        {
            title: "Тип документа",
            width: 200,
            dataType: "string",
            dataIndx: "btl-document:docType-content",
            filter: {
                type: 'textbox',
                condition: 'contain',
                listeners: ['change']
            }
        },
        {
            title: "Контрагент",
            width: 200,
            dataType: "string",
            dataIndx: "contractors",
            sortable: false
        },
        {
            title: "Статус",
            width: 200,
            dataType: "string",
            dataIndx: "btl-document:state",
            filter: {
                type: 'textbox',
                condition: 'contain',
                listeners: ['change']
            }
        }
    ];

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
                $(this).pqGrid("option", "currentCountId", "f2RegistrationCurrentCount");
                $(this).pqGrid("option", "totalCountId", "f2RegistrationTotalCount");
                $(this).pqGrid("option", "groupSelectSelector", "select.fRegistrationGroup");
                $(this).pqGrid("option", "dataUrl", "/share/proxy/alfresco/documents/v2/search-registry-registration");
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
            if (ui.rowData.docType === "Договор") {
                openModalEditContract(ui.rowData.nodeRef, $(this));
            } else {
                openModalEdit(ui.rowData.nodeRef, $gridRegistration, ui.rowData.link);
            }
        }
    };

    newObjIn.toolbar = {
        items: [
            {type: '<span>Группировка: </span>'},
            {
                type: 'select',
                cls: 'combo-pg fRegistrationGroup',
                prepend: {'': ''},
                options: ['Вид документа', 'Тип документа'],
                listeners: [{
                        change: function (evt) {
                            var group;
                            switch ($(this).val()) {
                                case "Вид документа":
                                    group = "docType";
                                    break;
                                case "Тип документа":
                                    group = "btl-document:docType-content";
                                    break;
                                default:
                                    group = null;
                            }
                            localGroup(group, $gridRegistration, pq);
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
                        clearGridFilters($gridRegistration, []);
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
                        refreshDataAndView($gridRegistration);
                        regElementCount();
                    }
                }]
            }
        ]
    };

    $gridRegistration = $("#grid_registration").pqGrid(newObjIn);

    $("select.fRegistrationGroup").pqSelect({
        singlePlaceholder: 'Нет',
        width: '150px',
        search: 'false'
    });
}

//--------------------------клик по табу--------------------------------------------------------------------
require(["jquery"], function ($) {
    $(document).ready(function () {
        $('#li_tab5').click(function () {
            if ($gridRegistration == "") {
                showRegistration();
                
                
            }
        });
    })
});
