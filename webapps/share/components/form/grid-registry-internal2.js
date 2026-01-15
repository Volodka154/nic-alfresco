var $grid2Internal = "";
var $Filter2Internal = "/share/proxy/alfresco/documents/search-regestry-internal?q_state=" + encodeURI(encodeURI('Активные'))+"&decree=0";
var groupInternal = null;

function show2Internal() {
    require(["jquery", "pqgrid", "pqselect", "jquery-ui.datepicker-ru"], function ($) {
        Alfresco.util.Ajax.request({
            method: "GET",
            url: Alfresco.constants.PROXY_URI + "groupPermision?user=" + Alfresco.constants.USERNAME + "&group=ALFRESCO_ADMINISTRATORS",
            successCallback: {
                fn: function addPropetries(complete) {
                    if (complete.json.result == "true") {
                        create2Internal(1, 1);
                    } else {
                        Alfresco.util.Ajax.request({
                            method: "GET",
                            url: Alfresco.constants.PROXY_URI + "groupPermision?user=" + Alfresco.constants.USERNAME + "&group=EEO",
                            successCallback: {
                                fn: function addPropetries(complete) {
                                    if (complete.json.result == "true") {
                                        if (idCreate == false) {
                                            idAddArch = 1;
                                            create2Internal(1, 0);
                                        }
                                    } else {
                                        Alfresco.util.Ajax.request({
                                            method: "GET",
                                            url: Alfresco.constants.PROXY_URI + "groupPermision?user=" + Alfresco.constants.USERNAME + "&group=CLERK",
                                            successCallback: {
                                                fn: function addPropetries(complete) {
                                                    if (complete.json.result == "true") {
                                                        // console.log('clerk- ' + idCreate);
                                                        if (idCreate == false) {
                                                            idAddArch = 1;
                                                            create2Internal(1, 0);
                                                        }
                                                    } else {
                                                        create2Internal(0, 0);
                                                    }
                                                },
                                                scope: this
                                            }
                                        });
                                    }
                                },
                                scope: this
                            }
                        });
                    }
                },
                scope: this
            }
        });
    })
}
//--------------------------создать грид--------------------------------------------------------------------
function create2Internal($arch, $isAdmin) {
    $("#tabs").tabs("option", "disabled", -1);
    var colMIn = [];
    var stateAccess = [
        {"Активные": "Активные"},
        {"Черновик": "Черновик"},
        {"Зарегистрирован": "Зарегистрирован"},
        {"На исполнении": "На исполнении"},
        {"Исполнен": "Исполнен"},
        {"В архиве": "В архиве"},
        {"На согласовании": "На согласовании"},
        {"На подписании": "На подписании"},
        {"Согласован": "Согласован"},
        {"На доработке": "На доработке"},
        {"На рассмотрении": "На рассмотрении"},
        {"Все": "Все"}
    ];
    if (IDViewReport != 0) {
        stateAccess.push({"Дополнительно": "Дополнительно"});
        stateAccess.push({"На исполнении без резолюций": "На исполнении без резолюций"});
        stateAccess.push({"Исполнен с незавершенными резолюциями": "Исполнен с незавершенными резолюциями"});
    }
    if ($isAdmin)
        colMIn.push(
            {
                title: "<input type='checkbox' id='selAllInternal' onclick='selAllInternal()'>",
                dataIndx: "sel",
                width: 30,
                align: "center",
                type: 'checkBoxSelection',
                cls: 'ui-state-default',
                resizable: false,
                sortable: false
            });
    colMIn.push(
        {title: "nodeRef", width: 100, dataType: "string", dataIndx: "nodeRef", hidden: true},
        {
            title: "Файл", minWidth: 100,
            dataType: "string", dataIndx: "fileExists"
        },
        {
            title: "Номер", width: 100, dataType: "string", dataIndx: "btl-document:regNumber",
            filter: {type: 'textbox', condition: 'contain', listeners: ['change']}
        },
        {
	        title: "Дата регистрации", minWidth: 160, width: 160,
	        dataType: dateType, dataIndx: "btl-document:regDate",
	        filter: {type: 'textbox', condition: "between", init: pqDatePicker, listeners: ['change']}

        },
        {title: "recipientNodeRef", dataIndx: "recipientNodeRef", hidden: true},
        {
            title: "Получатель", width: 200, dataType: "string", dataIndx: "btl-internal:recipient-login",
            filter: {
                type: 'select', style: "height:32px;", condition: 'equal', options: document.emploeeDoc,
                prepend: {'': ''},
                listeners: ["change"],
                init: function () {
                    $(this).pqSelect({singlePlaceholder: 'Все', searchRule: "contain", width: '100%'});
                },
            }
        },
        {
            title: "Исполнитель", width: 200, dataType: "string", dataIndx: "btl-document:author-login",
            filter: {
                type: 'select', style: "height:32px;", condition: 'equal', options: document.emploeeDoc,
                prepend: {'': ''},
                listeners: ["change"],
                init: function () {
                    $(this).pqSelect({singlePlaceholder: 'Все', searchRule: "contain", width: '100%'});
                },
            }
        },
        {
            title: "Содержание",
            width: 300,
            dataType: "string",
            dataIndx: "btl-document:content",
            filter: {type: 'textbox', condition: 'contain', listeners: ['change']}
        },
        {
            title: "Проект", minWidth: 160, dataType: "string", dataIndx: "btl-document:project-content", cls: "just",
            filter: {type: 'textbox', condition: 'contain', listeners: ['change']}
        },
        {
            title: "Состояние", minWidth: 160, width: 160, dataType: "string", dataIndx: "state", style: "height:32px;",
            prepend: {'': ''},
            filter: {
                type: 'select', style: "height:32px;", condition: 'equal', options: stateAccess, listeners: ["change"],
                init: function () {
                    $(this).pqSelect({singlePlaceholder: 'Активные', searchRule: "contain", width: '100%'});
                },
            }
        },
        {
            title: "Тип документа", minWidth: 200, dataType: "string", dataIndx: "btl-document:docType-ref",
            filter: {
                type: 'select', condition: 'equal', options: typedocInternal.result,
                prepend: {'': ''},
                listeners: ["change"],
                init: function () {
                    $(this).pqSelect({singlePlaceholder: 'Все', searchRule: "contain", width: '100%'});
                }
            }
        },
        {title: "Резолюции", minWidth: 200, dataType: "string", dataIndx: "nameTask"}
    );


    var dataModel = {
        location: "remote", sorting: "local", dataType: "JSON", method: "GET", url: $Filter2Internal + "&format=json",
        getData: function (dataJSON) {
            $grid2Internal.pqGrid("showLoading");


            // totalRecords2Incomming = data.length;
            return {curPage: dataJSON.curPage, totalRecords: dataJSON.totalRecords, data: dataJSON.items};
        }
    };
    var newObjIn = {
        selectionModel: {type: 'none', subtype: 'incr', cbHeader: false, cbAll: true},
        showTop: true,
        showHeader: true,
        showTitle: true,
        flexHeight: true,
        flexWidth: true,
        dataModel: dataModel,
        collapsible: false,
        pageModel: {type: "remote", rPP: 100, strRpp: "{0}", rPPOptions: [25, 50, 100]},
        colModel: colMIn,
        filterModel: {on: true, mode: "AND", header: true},
        editable: false,
        columnBorders: true,
        width: '100%',
        height: 600,
        beforeFilter: function (evt, ui) {
            $grid2Internal.pqGrid("option", "pageModel.curPage", 1);
        },
        create: function (ui) {
            var $grid = $(this),
                $pager = $grid.find(".pq-grid-bottom").find(".pq-pager");
            if ($pager && $pager.length) {
                $pager = $pager.detach();
                $grid.find(".pq-grid-top").append($pager);
            }
        }
    };
    newObjIn.title = "<button type='button' onclick='backHome()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'";
    newObjIn.title += "role='button'><span class='ui-button-icon-primary ui-icon ui-icon-home'></span><span class='ui-button-text'>Домой</span></button>";
    newObjIn.title += "<span style='margin-left: 10px ; margin-bottom: -5px' class='pq-separator '></span>";
    newObjIn.title += "<button type='button'  style='margin-left: 10px' onclick='addDoc2Intrenal()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'";
    newObjIn.title += "role='button'><span class='ui-button-icon-primary ui-icon ui-icon-plus'></span><span class='ui-button-text'>Создать</span></button>";
    if ($arch == 1) {
        newObjIn.title += "<button type='button'  style='margin-left: 5px'  onclick='toArchInternal()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'";
        newObjIn.title += "role='button'><span class='ui-button-icon-primary ui-icon ui-icon-cancel'></span><span class='ui-button-text'>В архив</span></button>";
    }
    if ($isAdmin == 1){
        newObjIn.title += "<button type='button'  style='margin-left: 5px'  onclick='deleteInternal()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'";
        newObjIn.title += "role='button'><span class='ui-button-icon-primary ui-icon ui-icon-cancel'></span><span class='ui-button-text'>Удалить</span></button>";
    }
    newObjIn.title += "<button type='button'  style='margin-left: 10px' onclick='prn2Internal()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'";
    newObjIn.title += "role='button'><span class='ui-button-icon-primary ui-icon ui-icon-print'></span><span class='ui-button-text'>Печать</span></button>";
    newObjIn.toolbar = {
        items: [
            /* {type: '<span>Ответственный исполнитель: </span><br/>'},
             {
             type: 'select id="ppp"',
             cls: 'combo-pg',
             options: ['']
             },*/


            {type: '<span>Группировка: </span>'},
            {
                type: 'select', cls: 'combo-pg f2InternalGroup', prepend: {'': ''},
                options: [
                    'Состояние',
                    'Тип документа'
                ],
                listeners: [
                    {
                        change: function (evt) {
                            if ($grid2Internal.pqGrid("option", "groupModel") != null) {
                                $grid2Internal.pqGrid("option", "groupModel.collapsed", [false,
                                    false,
                                    false]);
                                $grid2Internal.pqGrid("refreshView");
                            }
                            switch ($(this).val()) {
                                case "Состояние":
                                    groupInternal = "state";
                                    break;
                                case "Тип документа":
                                    groupInternal = "btl-document:docType-ref";
                                    break;
                                default:
                                    groupInternal = null;
                            }
                            var groupModel = null;
                            /* if (response.items.length != 0) {*/
                            if (groupInternal != null) {
                                groupModel = {
                                    dataIndx: [groupInternal],
                                    collapsed: [true],
                                    title: ["<b style='font-weight:bold;'>{0} ({1})</b>",
                                        "{0} - {1}"],
                                    dir: ["up", "down"]
                                };
                            }
                            //  }
                            $grid2Internal.pqGrid("option", "groupModel", groupModel);
                            $grid2Internal.pqGrid("refreshDataAndView");
                        }
                    }
                ]
            },
            {type: '<span style="margin-left: 7px"></span>'},
            {
                type: 'button', label: 'Очистить',
                listeners: [{
                    click: function (evt) {
                        clearDocFilter($grid2Internal)
                    }
                }],
                icon: 'ui-icon-cancel'
            }
            /*,
             {type: 'separator'},
             {type: 'button', label: 'Печать', listeners: [{click: prn}], icon: 'ui-icon-print'}*/
        ]
    };
    $grid2Internal = $("#grid_2internal").pqGrid(newObjIn);
    $grid2Internal.pqGrid({
        beforeTableView: function (event, ui) {
            $("span:contains('Дополнительно')").parent().prop('disabled', true).prop('disabled', true).removeClass("pq-select-option-label ui-state-enable pq-state-hover").addClass("fd");
        }
    });
    $grid2Internal.one("pqgridload", function (evt, ui) {
        $("#tabs").tabs("option", "disabled", -1);
        $grid2Internal.pqGrid("refreshHeader");
    });
//--------------------------фильтры хедера----------------------------------
    $grid2Internal.pqGrid({
        rowDblClick: function (event, ui) {

            openModalEdit(ui.rowData.nodeRef, $grid2Internal);
        }
    });
    $grid2Internal.pqGrid({
        rowRightClick: function (event, ui) {
            var menu = document.getElementById("contextmenu");
            menu.style.display = "block";
            x = event.pageX;
            y = event.pageY;
            menu.style.left = x + "px";
            menu.style.top = y + "px";
            var menuItemCreate = document.getElementById("menuItemCreateCopy");
            menuItemCreate.nodeRef = ui.rowData.nodeRef;
            menuItemCreate.onclick = function () {
                var menu = document.getElementById("contextmenu");
                menu.style.display = "";
                addDocInternalCreate(this.nodeRef);
            };

            return false;
        }
    });
//-------------------------заменить выпадающее меню на pqSelect--------------------------------------------------------------------
    $(".f2InternalGroup").pqSelect({
        singlePlaceholder: 'Нет', width: '150px', search: 'false'
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
        $grid2Internal.pqGrid({flexHeight: true});
    }
}
//--------------------------выбрать все--------------------------------------------------------------------
function selAllInternal() {
    require(["jquery"], function ($) {
        if ($("#selAllInternal").prop("checked")) {
            $("#selAllInternal").prop("checked", false);
            $grid2Internal.pqGrid("selection",
                {
                    type: 'row',
                    all: 'all',
                    method: 'removeAll'
                }
            );
        } else {
            $("#selAllInternal").attr("checked", "checked");
            $("#selAllInternal").prop("checked", true);
            $grid2Internal.pqGrid("selection",
                {
                    type: 'row',
                    all: 'all',
                    method: 'selectAll'
                }
            );
        }
    })
}

function prn2Internal() {
    var link= "/share/proxy/alfresco/documents/search-regestry-in?q_state=" + encodeURI(encodeURI('Активные'))+"&decree=0"
    window.open(link + "&format=html&q_viewType=1" + prepareLocalFilter($grid2Internal), "_blank");
}
//--------------------------удалить--------------------------------------------------------------------
function deleteInternal() {
    deleteSelected($grid2Internal, "Вы действительно хотите удалить выбранные документы?");
}

//--------------------------клик по табу--------------------------------------------------------------------
require(["jquery"], function ($) {
    $(document).ready(function () {
        $('#li_tab11').click(function () {
            if ($grid2Internal == "") {
                show2Internal($Filter2Internal + "&format=json");
            }
        });
    })
});
