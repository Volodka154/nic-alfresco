var $gridInternal = "";
var $FilterInternal = "/share/proxy/alfresco/documents/search-regestry-internal?q_state=" + encodeURI(encodeURI('Активные'))+"&decree=0";
var groupInternal = null;
//--------------------------создать грид--------------------------------------------------------------------
function showInternal() {
    $("#tabs").tabs("option", "disabled", [0, 1, 3, 4]);
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
    }
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
            title: "Дата регистрации", minWidth: 160, width: 160, dataType: dateType, dataIndx: "btl-document:regDate",
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
        location: "remote", sorting: "local", dataType: "JSON", method: "GET", url: $FilterInternal + "&format=json",
        getData: function (dataJSON) {
            $gridInternal.pqGrid("showLoading");
            var data = dataJSON.items;
            return {curPage: dataJSON.curPage, totalRecords: dataJSON.totalRecords, data: data};
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
            $gridInternal.pqGrid("option", "pageModel.curPage", 1);
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
    newObjIn.title += "<button type='button'  style='margin-left: 10px' onclick='addDocIntrenal()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'";
    newObjIn.title += "role='button'><span class='ui-button-icon-primary ui-icon ui-icon-plus'></span><span class='ui-button-text'>Создать</span></button>";
    newObjIn.title += "<button type='button'  style='margin-left: 10px' onclick='prnInternal()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'";
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
                type: 'select', cls: 'combo-pg fGroup', prepend: {'': ''},
                options: [
                    'Состояние',
                    'Тип документа'
                ],
                listeners: [
                    {
                        change: function (evt) {
                            if ($gridInternal.pqGrid("option", "groupModel") != null) {
                                $gridInternal.pqGrid("option", "groupModel.collapsed", [false,
                                    false,
                                    false]);
                                $gridInternal.pqGrid("refreshView");
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
                            $gridInternal.pqGrid("option", "groupModel", groupModel);
                            $gridInternal.pqGrid("refreshDataAndView");
                        }
                    }
                ]
            },
            {type: '<span style="margin-left: 7px"></span>'},
            {
                type: 'button', label: 'Очистить',
                listeners: [{
                    click: function (evt) {
                        clearDocFilter($gridInternal)
                    }
                }],
                icon: 'ui-icon-cancel'
            }
            /*,
             {type: 'separator'},
             {type: 'button', label: 'Печать', listeners: [{click: prn}], icon: 'ui-icon-print'}*/
        ]
    };
    $gridInternal = $("#grid_internal").pqGrid(newObjIn);
    $gridInternal.pqGrid({
        beforeTableView: function (event, ui) {
            $("span:contains('Дополнительно')").parent().prop('disabled', true).prop('disabled', true).removeClass("pq-select-option-label ui-state-enable pq-state-hover").addClass("fd");
        }
    });
    $gridInternal.one("pqgridload", function (evt, ui) {
        $("#tabs").tabs("option", "disabled", -1);
        $gridInternal.pqGrid("refreshHeader");
    });
//--------------------------фильтры хедера----------------------------------
    $gridInternal.pqGrid({
        rowDblClick: function (event, ui) {
            /*
             window.open("/share/page/btl-edit-metadata?nodeRef=" + ui.rowData.nodeRef + "&redirect=/share/page/search-registry", "_blank");
             require(["dojo/topic"], function (topic) {
             topic.publish("ALF_DISPLAY_NOTIFICATION", {message: "Перенаправление на карточку документа."});
             });
             */
            openModalInner(ui.rowData.nodeRef);
        }
    });
//-------------------------заменить выпадающее меню на pqSelect--------------------------------------------------------------------
    $(".fGroup").pqSelect({
        singlePlaceholder: 'Нет', width: '150px', search: 'false'
    });
}
function openModalInner(nodeRef) {
    document.frameSave = function () {
        document.getElementById(modalWindowShadow).style.display = "none";
        document.body.style.overflow = "";
        $gridInternal.pqGrid("refreshDataAndView");
    }
    document.frameCancel = function () {
        document.getElementById(modalWindowShadow).style.display = "none";
        document.body.style.overflow = "";
        $gridInternal.pqGrid("refreshDataAndView");
    }
    var modal = document.getElementById(modalWindowShadow);
    modal.style.display = "block";
    var frameShadowBack = document.getElementById(frameBackground);
    frameShadowBack.innerHTML = '<iframe id="viewDocFrame" style="border-radius: 4px;" width="100%" height="100%" src="/share/page/btl-edit-metadata?nodeRef=' + nodeRef + '&frame=true">';

}
function prnInternal() {
    window.open($FilterInternal + "&format=html&q_viewType=1" + prepareLocalFilter($gridInternal), "_blank");
}
//--------------------------клик по табу--------------------------------------------------------------------
require(["jquery"], function ($) {
    $(document).ready(function () {
        $('#li_tab3').click(function () {
            if ($gridInternal == "") {
                showInternal($FilterInternal + "&format=json");
            }
        });
    })
});
