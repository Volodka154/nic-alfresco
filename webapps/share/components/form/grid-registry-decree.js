/*реестр документов приказы*/
var $gridDecree = "";
var $FilterDecree = "/share/proxy/alfresco/documents/search-regestry-ord?q_state=" + encodeURI(encodeURI('Активные'));
var groupDecree = null;

function showDecree() {
    require(["jquery", "pqgrid", "pqselect", "jquery-ui.datepicker-ru"], function ($) {
        Alfresco.util.Ajax.request({
            method: "GET",
            url: Alfresco.constants.PROXY_URI + "groupPermision?user=" + Alfresco.constants.USERNAME + "&group=ALFRESCO_ADMINISTRATORS",
            successCallback: {
                fn: function addPropetries(complete) {
                    if (complete.json.result == "true") {
                        createGridDecree(1);
                    } else {
                        createGridDecree(0);
                    }
                },
                scope: this
            }
        });
    })
}

//--------------------------создать грид--------------------------------------------------------------------
function createGridDecree($isAdmin) {
    $("#tabs").tabs("option", "disabled", [0, 1, 3, 4, 5]);
    var colMIn = [];
    if ($isAdmin == 1) {
        colMIn.push({
            title: "<input type='checkbox' id='selAllDecree' onclick='selAllDecree()'>",
            dataIndx: "sel",
            width: 30,
            align: "center",
            type: 'checkBoxSelection',
            cls: 'ui-state-default',
            resizable: false,
            sortable: false
        });
    }
    var stateAccess = [
        {"Активные": "Активные"},
        {"Черновик": "Черновик"},
        {"Зарегистрирован": "Зарегистрирован"},       
        {"На доработке": "На доработке"},
        {"На согласовании": "На согласовании"},        
        {"Согласован": "Согласован"},
        {"На подписании": "На подписании"},
        {"Действует": "Действует"},
        {"Исполнен": "Исполнен"},
        {"Утратил силу": "Утратил силу"},
        {"Все": "Все"}
    ];
    
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
                type: 'select', condition: 'equal', options: typedocORD.result,
                prepend: {'': ''},
                listeners: ["change"],
                init: function () {
                    $(this).pqSelect({singlePlaceholder: 'Все', searchRule: "contain", width: '100%'});
                }
            }
        },
        {
            title: "Проект", minWidth: 200, dataType: "string", dataIndx: "btl-document:project-content" ,
            filter: {type: 'textbox', condition: 'contain', listeners: ['change']}
            
        },
        {title: "Резолюции", minWidth: 200, dataType: "string", dataIndx: "nameTask"}
    );


    var dataModel = {
        location: "remote", sorting: "local", dataType: "JSON", method: "GET", url: $FilterDecree + "&format=json",
        getData: function (dataJSON) {
            $gridDecree.pqGrid("showLoading");

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
            $gridDecree.pqGrid("option", "pageModel.curPage", 1);
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
    newObjIn.title += "<button type='button'  style='margin-left: 10px' onclick='addDocDecree()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'";
    newObjIn.title += "role='button'><span class='ui-button-icon-primary ui-icon ui-icon-plus'></span><span class='ui-button-text'>Создать</span></button>";
    if ($isAdmin == 1){
        newObjIn.title += "<button type='button'  style='margin-left: 5px'  onclick='deleteDecree()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'";
        newObjIn.title += "role='button'><span class='ui-button-icon-primary ui-icon ui-icon-cancel'></span><span class='ui-button-text'>Удалить</span></button>";
    }
    newObjIn.title += "<button type='button'  style='margin-left: 10px' onclick='prnInternalPr()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'";
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
                            if ($gridDecree.pqGrid("option", "groupModel") != null) {
                                $gridDecree.pqGrid("option", "groupModel.collapsed", [false,
                                    false,
                                    false]);
                                $gridDecree.pqGrid("refreshView");
                            }
                            switch ($(this).val()) {
                                case "Состояние":
                                    groupDecree = "state";
                                    break;
                                case "Тип документа":
                                    groupDecree = "btl-document:docType-ref";
                                    break;
                                default:
                                    groupDecree = null;
                            }
                            var groupModel = null;
                            /* if (response.items.length != 0) {*/
                            if (groupDecree != null) {
                                groupModel = {
                                    dataIndx: [groupDecree],
                                    collapsed: [true],
                                    title: ["<b style='font-weight:bold;'>{0} ({1})</b>",
                                        "{0} - {1}"],
                                    dir: ["up", "down"]
                                };
                            }
                            //  }
                            $gridDecree.pqGrid("option", "groupModel", groupModel);
                            $gridDecree.pqGrid("refreshDataAndView");
                        }
                    }
                ]
            },
            {type: '<span style="margin-left: 7px"></span>'},
            {
                type: 'button', label: 'Очистить',
                listeners: [{
                    click: function (evt) {
                        clearDocFilter($gridDecree)
                    }
                }],
                icon: 'ui-icon-cancel'
            }
            /*,
             {type: 'separator'},
             {type: 'button', label: 'Печать', listeners: [{click: prn}], icon: 'ui-icon-print'}*/
        ]
    };
    $gridDecree = $("#grid_decree").pqGrid(newObjIn);
    $gridDecree.pqGrid({
        beforeTableView: function (event, ui) {
            $("span:contains('Дополнительно')").parent().prop('disabled', true).prop('disabled', true).removeClass("pq-select-option-label ui-state-enable pq-state-hover").addClass("fd");
        }
    });
    $gridDecree.one("pqgridload", function (evt, ui) {
        $("#tabs").tabs("option", "disabled", -1);
        $gridDecree.pqGrid("refreshHeader");
    });
//--------------------------фильтры хедера----------------------------------
    $gridDecree.pqGrid({
        rowDblClick: function (event, ui) {
            /*
             window.open("/share/page/btl-edit-metadata?nodeRef=" + ui.rowData.nodeRef + "&redirect=/share/page/search-registry", "_blank");
             require(["dojo/topic"], function (topic) {
             topic.publish("ALF_DISPLAY_NOTIFICATION", {message: "Перенаправление на карточку документа."});
             });
             */
            openModalDecree(ui.rowData.nodeRef);
        }
    });
//-------------------------заменить выпадающее меню на pqSelect--------------------------------------------------------------------
    $(".fGroup").pqSelect({
        singlePlaceholder: 'Нет', width: '150px', search: 'false'
    });
}
function openModalDecree(nodeRef) {
    document.frameSave = function () {
        document.getElementById(modalWindowShadow).style.display = "none";
        document.body.style.overflow = "";
        $gridDecree.pqGrid("refreshDataAndView");
    };
    document.frameCancel = function () {
        document.getElementById(modalWindowShadow).style.display = "none";
        document.body.style.overflow = "";
        $gridDecree.pqGrid("refreshDataAndView");
    };
    var modal = document.getElementById(modalWindowShadow);
    modal.style.display = "block";
    var frameShadowBack = document.getElementById(frameBackground);

    frameShadowBack.innerHTML = '<iframe id="viewDocFrame" style="border-radius: 4px;" width="100%" height="100%" src="/share/page/btl-edit-metadata?nodeRef=' + nodeRef + '&frame=true">';


}
function prnInternalPr() {
    window.open($FilterDecree + "&format=html&q_viewType=1" + prepareLocalFilter($gridDecree), "_blank");
}

//--------------------------удалить--------------------------------------------------------------------
function deleteDecree() {
    deleteSelected($gridDecree, "Вы действительно хотите удалить выбранные документы?");
}

//--------------------------выбрать все--------------------------------------------------------------------
function selAllDecree() {
    require(["jquery"], function ($) {
        if ($("#selAllDecree").prop("checked")) {
            $("#selAllDecree").prop("checked", false);
            $gridDecree.pqGrid("selection",
                {
                    type: 'row',
                    all: 'all',
                    method: 'removeAll'
                }
            );
        } else {
            $("#selAllDecree").attr("checked", "checked");
            $("#selAllDecree").prop("checked", true);
            $gridDecree.pqGrid("selection",
                {
                    type: 'row',
                    all: 'all',
                    method: 'selectAll'
                }
            );
        }
    })
}

//--------------------------клик по табу--------------------------------------------------------------------
require(["jquery"], function ($) {
    $(document).ready(function () {
        $('#li_tab6').click(function () {
            if ($gridDecree == "") {
                showDecree($FilterDecree + "&format=json");
            }
        });
    })
});
