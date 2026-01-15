var $gridMeetings = "";

/***
 * Запрос групп для текущего пользователя с последующитм создание таблицы "Мероприятия"
 */
function showMeetings() {
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
                    createGridMeetings(isAdmin, isArch, isUserSED);
                },
                scope: this
            }
        });
    });
}

/***
 * Создание грида
 * @param isAdmin
 * @param isArch
 */
function createGridMeetings(isAdmin, isArch, isUserSED) {
    var pq = getDefaultPq();

    var stateAccessMeeting = [
        {"Активные": "Активные"},
        {"Проекты документов": "Проекты документов"},
        {"Черновик": "Черновик"},
        {"Зарегистрирован": "Зарегистрирован"},
        {"На исполнении": "На исполнении"},
        {"На согласовании": "На согласовании"},
        {"Согласован": "Согласован"},
        {"На подписании": "На подписании"},
        {"На регистрации": "На регистрации"},
        {"На доработке": "На доработке"},
        {"Подтверждение переговорной": "Подтверждение переговорной"},
        {"Переговорная подтверждена": "Переговорная подтверждена"},
        {"Подготовлен": "Подготовлен"},
        {"В архиве": "В архиве"}
    ];

    var colModel = [
        {
            title: "nodeRef",
            dataType: "string",
            dataIndx: "nodeRef",
            hidden: true
        },
        {
            title: "Файл",
            width: 40,
            dataType: "string",
            dataIndx: "fileExists"
        },
        {
            title: "Рег. номер",
            width: 70,
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
            dataIndx: "btl-meeting:regDate",
            filter: {
                type: 'textbox',
                condition: "between",
                init: pqDatePicker,
                listeners: ['change']
            }
        },
        {
            title: "Секретарь",
            width: 150,
            dataType: "string",
            dataIndx: "btl-meeting:secretary-login",
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
            title: "Председатель",
            width: 150,
            dataType: "string",
            dataIndx: "btl-meeting:chairman-login",
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
            title: "Тема",
            width: 360,
            dataType: "string",
            dataIndx: "btl-meeting:theme",
            filter: {
                type: 'textbox',
                condition: 'contain',
                listeners: ['change']
            }
        },
        {
            title: "Начало",
            width: 130,
            dataType: dateType,
            dataIndx: "btl-meeting:startDate",
            filter: {
                type: 'textbox',
                condition: "between",
                init: pqDatePicker,
                listeners: ['change']
            }
        },
        {
            title: "Окончание",
            width: 130,
            dataType: dateType,
            dataIndx: "btl-meeting:endDate",
            filter: {
                type: 'textbox',
                condition: "between",
                init: pqDatePicker,
                listeners: ['change']
            }
        },
        {
            title: "Состояние",
            width: 140,
            dataType: "string",
            dataIndx: "btl-meeting:state",
            filter: {
                type: 'select',
                style: "height:32px;",
                condition: 'equal',
                options: stateAccessMeeting,
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
            title: "Место проведения",
            width: 220,
            dataType: "string",
            dataIndx: "btl-meeting:room-content"
        }
    ];
    if (isArch) {
        colModel.unshift({
            title: "<input type='checkbox' onclick='selectAllInGrid(this, $gridMeetings)'>",
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
                $(this).pqGrid("option", "currentCountId", "f2IMeetingCurrentCount");
                $(this).pqGrid("option", "totalCountId", "f2IMeetingTotalCount");
                $(this).pqGrid("option", "dataUrl", "/share/proxy/alfresco/documents/v2/search-registry-meetings");
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
            openModalMeetingsing(ui.rowData.nodeRef);
        }
    };

    newObjIn.title = "";
    if (isUserSED) {
        newObjIn.title += "<button type='button' onclick='addDocMeetings()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'" +
            " role='button'><span class='ui-button-icon-primary ui-icon ui-icon-plus'></span><span class='ui-button-text'>Создать</span></button>";
    }
    if (isAdmin) {
        newObjIn.title += "<button type='button'  style='margin-left: 5px'  onclick='deleteMeetings()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'" +
            " role='button'><span class='ui-button-icon-primary ui-icon ui-icon-cancel'></span><span class='ui-button-text'>Удалить</span></button>";
    }
    newObjIn.title += "<button type='button' style='margin-left: 5px' onclick='clearGridFilters($gridMeetings)' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'" +
    " role='button'><span class='ui-button-icon-primary ui-icon ui-icon-cancel'></span><span class='ui-button-text'>Очистить</span></button>" +
    "<button type='button' style='margin-left: 5px' onclick='refreshDataAndView($gridMeetings)' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-only' role='button'><span class='ui-button-text'>Обновить</span></button>";

    $gridMeetings = $("#grid_meetings").pqGrid(newObjIn);
}

function openModalMeetingsing(nodeRef) {
    document.frameSave = function () {
        document.getElementById(modalWindowShadow).style.display = "none";
        document.body.style.overflow = "";
        $gridMeetings.pqGrid("option", "isResetData", true);
        $gridMeetings.pqGrid("refreshDataAndView");
    };
    document.frameCancel = function () {
        document.getElementById(modalWindowShadow).style.display = "none";
        document.body.style.overflow = "";
        $gridMeetings.pqGrid("option", "isResetData", true);
        $gridMeetings.pqGrid("refreshDataAndView");
    };

    var modal = document.getElementById(modalWindowShadow);
    modal.style.display = "block";
    var frameShadowBack = document.getElementById(frameBackground);

    frameShadowBack.innerHTML = '<iframe id="viewDocFrame" style="border-radius: 4px;" width="100%" height="100%" src="/share/page/dp/ws/meeting-rooms?nodeRef=' + nodeRef + '&frame=true">';
}

//--------------------------удалить--------------------------------------------------------------------
function deleteMeetings() {
    deleteSelected($gridMeetings, "Вы действительно хотите удалить выбранные мероприятия?");
}

//--------------------------клик по табу--------------------------------------------------------------------
require(["jquery"], function ($) {
    $(document).ready(function () {
        $('#li_tab13').click(function () {
            if ($gridMeetings == "") {
                showMeetings();
            }
        });
    })
});