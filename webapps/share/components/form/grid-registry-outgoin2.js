/*Исходящие*/
var $grid2Out = "";
var $Filter2Outgoing = "/share/proxy/alfresco/documents/search-regestry-outgoing?q_state=" + encodeURI(encodeURI('Активные'));
var groupOutgoing = null;
var contragentPerson;

function show2Out() {
    require(["jquery", "pqgrid", "pqselect", "jquery-ui.datepicker-ru"], function ($) {
        Alfresco.util.Ajax.request({
            method: "GET",
            url: Alfresco.constants.PROXY_URI + "groupPermision?user=" + Alfresco.constants.USERNAME + "&group=ALFRESCO_ADMINISTRATORS",
            successCallback: {
                fn: function addPropetries(complete) {

                    var isAdmin = complete.json.result == "true";

                    if(!isAdmin) {
                        Alfresco.util.Ajax.request({
                            method: "GET",
                            url: Alfresco.constants.PROXY_URI + "groupPermision?user=" + Alfresco.constants.USERNAME + "&group=EEO",
                            successCallback: {
                                fn: function addPropetries(complete) {

                                    var isClerk = complete.json.result == "true";

                                    if (!isClerk) {
                                        Alfresco.util.Ajax.request({
                                            method: "GET",
                                            url: Alfresco.constants.PROXY_URI + "groupPermision?user=" + Alfresco.constants.USERNAME + "&group=CLERK",
                                            successCallback: {
                                                fn: function addPropetries(complete) {

                                                    var isClerk = complete.json.result == "true";

                                                    create2Out(isClerk ? 1 : 0, 0);
                                                },
                                                scope: this
                                            }
                                        });
                                    } else {
                                        create2Out(1, 0);
                                    }

                                }
                            }
                        });
                    }else{
                        create2Out(1, 1);
                    }
                },
                scope: this
            }
        });
    })
}


function create2Out($arch, $isAdmin) {
    $("#tabs").tabs("option", "disabled", -1);
    var colMIn = [];
    var stateAccess = [
        {"Активные": "Активные"},
        {"Черновик": "Черновик"},
        {"Зарегистрирован": "Зарегистрирован"},
        {"На исполнении": "На исполнении"},
        {"В архиве": "В архиве"},
        {"На согласовании": "На согласовании"},
        {"На подписании": "На подписании"},
        {"Согласован": "Согласован"},
        {"На регистрации": "На регистрации"},
        {"На доработке": "На доработке"},
        {"Все": "Все"}
    ];
    var colMOut = [];
    if ($arch) {
        colMOut.push(
            {
                title: "<input type='checkbox' id='selAllOutgoing' onclick='selAllOutgoin()'>",
                dataIndx: "sel",
                width: 30,
                align: "center",
                type: 'checkBoxSelection',
                cls: 'ui-state-default',
                resizable: false,
                sortable: false
            });
    }
    colMOut.push (
        {
            title: "nodeRef",
            width: 100,
            dataType: "string",
            dataIndx: "nodeRef",
            hidden: true
        },
        {
            title: "Файл",
            /*  minWidth: 100,*/
            dataType: "string", dataIndx: "fileExists"
        },
        {
            title: "Рег. номер", minWidth: 80, dataType: "string", dataIndx: "btl-document:regNumber",
            filter: {type: 'textbox', condition: 'contain', listeners: ['change']}
        },
        {
            title: "Дата регистрации", minWidth: 160, width: 160,
            dataType: dateType, dataIndx: "btl-document:regDate",
            filter: {type: 'textbox', condition: "between", init: pqDatePicker, listeners: ['change']}
        },
        {
            title: "Подписант", width: 120, dataType: "string", dataIndx: "btl-outgoing:signer-login",
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
            title: "Исполнитель", width: 120, dataType: "string", dataIndx: "btl-document:author-login",
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
            title: "Контрагент", minWidth: 160, width: 160, dataType: "string", dataIndx: "btl-outgoing:contragentUnit-ref", cls: "just",
            filter: {
                type: 'select', condition: 'contain', options: document.organizations, prepend: {'': ''},
                //listeners: ["change", {change: get2ContragentPerson}],
                listeners: ["change"],
                init: function () {
                    //$(this).pqSelect({singlePlaceholder: 'Все', searchRule: "contain", width: '100%'});
                	$(this).pqSelect({singlePlaceholder: 'Все', searchRule: "begin", width: '100%', url:"/share/proxy/alfresco/filters/association?type=btl-contr:contractor-folder&s_field=name&field=name"});
                }
            }
        },
        {title: "contragentNodeRef", dataIndx: "contragentNodeRef", hidden: true},
        {
            title: "Кому", minWidth: 120, width: 120, dataType: "string", dataIndx: "btl-outgoing:contragentPerson-ref", cls: "just",
            filter: {
                type: 'select', condition: 'equal', options: [], prepend: {'': ''},
                listeners: ["change"],
                init: function (arg1) {
                    $(this).pqSelect({
                        singlePlaceholder: 'Все',
                        searchRule: "begin",
                        width: '100%',
                        url:"/share/proxy/alfresco/filters/association?type=btl-person:person-content&s_field=fio&field=fio",
                        urlItem:"/share/proxy/alfresco/picker/associationItem?type=btl-person:person-content&field=fio",
                        value: arg1.column.filter.value
                    });

                }
            }
        },
        {
            title: "В ответ на", minWidth: 100, dataType: "string", dataIndx: "btl-document:responseTo-content",
            filter: {type: 'textbox', condition: 'contain', listeners: ['change']}
        },
        {title: "contragentPersonNodeRef", dataIndx: "contragentPersonNodeRef", hidden: true},
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
            title: "Тип документа", minWidth: 130, dataType: "string", dataIndx: "btl-document:docType-ref",
            filter: {
                type: 'select', condition: 'equal', options: typedocOut.result,
                prepend: {'': ''},
                listeners: ["change"],
                init: function () {
                    $(this).pqSelect({singlePlaceholder: 'Все', searchRule: "contain", width: '100%'});
                }
            }
        },
        {
            title: "Резолюции",
            minWidth: 130,
            dataType: "string", dataIndx: "nameTask"
        }
    );
    /*  var dataModelOut = {
     location: "local",
     sorting: "local",
     method: "GET"
     }*/


    var dataModelOut = {
        location: "remote", sorting: "local", dataType: "JSON", method: "GET", url: $Filter2Outgoing + "&format=json",
        getData: function (dataJSON) {
            $grid2Out.pqGrid("showLoading");



            // totalRecords2Incomming = data.length;
            return {curPage: dataJSON.curPage, totalRecords: dataJSON.totalRecords, data: dataJSON.items};
        }
    };
    var newObjOut = {
        selectionModel: {type: 'none', subtype: 'incr', cbHeader: false, cbAll: true},
        showTop: true,
        showHeader: true,
        showTitle: true,
        flexHeight: true,
        flexWidth: true,
        dataModel: dataModelOut,
        collapsible: false,
        pageModel: {type: "remote", rPP: 100, strRpp: "{0}", rPPOptions: [25, 50, 100]},
        colModel: colMOut,
        filterModel: {on: true, mode: "AND", header: true},
        editable: false,
        columnBorders: true,
        width: '100%',
        height: 600,
        beforeFilter: function (evt, ui) {
            $grid2Out.pqGrid("option", "pageModel.curPage", 1);
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
    newObjOut.title = "<button type='button' onclick='backHome()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'";
    newObjOut.title += "role='button'><span class='ui-button-icon-primary ui-icon ui-icon-home'></span><span class='ui-button-text'>Домой</span></button>";
    newObjOut.title += "<span style='margin-left: 10px ; margin-bottom: -5px' class='pq-separator '></span>";
    newObjOut.title += "<button type='button'  style='margin-left: 10px' onclick='addDocOutgoin()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'";
    newObjOut.title += "role='button'><span class='ui-button-icon-primary ui-icon ui-icon-plus'></span><span class='ui-button-text'>Создать</span></button>";
    if($arch == 1){
        newObjOut.title += "<button type='button'  style='margin-left: 5px'  onclick='toArchOutgoin()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'";
        newObjOut.title += "role='button'><span class='ui-button-icon-primary ui-icon ui-icon-cancel'></span><span class='ui-button-text'>В архив</span></button>";
    }
    if ($isAdmin == 1){
        newObjOut.title += "<button type='button'  style='margin-left: 5px'  onclick='deleteOut()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'";
        newObjOut.title += "role='button'><span class='ui-button-icon-primary ui-icon ui-icon-cancel'></span><span class='ui-button-text'>Удалить</span></button>";
    }
    newObjOut.title += "<button type='button'  style='margin-left: 10px' onclick='prnOutgoin()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'";
    newObjOut.title += "role='button'><span class='ui-button-icon-primary ui-icon ui-icon-print'></span><span class='ui-button-text'>Печать</span></button>";
    newObjOut.toolbar = {
        items: [
            {type: '<span>Группировка: </span>'},
            {
                type: 'select', cls: 'combo-pg fGroupOut', prepend: {'': ''},
                options: [
                    'Контрагент',
                    'Состояние',
                    'Тип документа'
                ],
                listeners: [
                    {
                        change: function (evt) {
                            if ($grid2Out.pqGrid("option", "groupModel") != null) {
                                $grid2Out.pqGrid("option", "groupModel.collapsed", [false,
                                    false,
                                    false]);
                                $grid2Out.pqGrid("refreshView");
                            }
                            switch ($(this).val()) {
                                case "Состояние":
                                    groupOutgoing = "state";
                                    break;
                                case "Тип документа":
                                    groupOutgoing = "btl-document:docType-ref";
                                    break;
                                case "Контрагент":
                                    groupOutgoing = "btl-outgoing:contragentUnit-ref";
                                    break;
                                default:
                                    groupOutgoing = null;
                            }
                            var groupModel = null;
                            /* if (response.items.length != 0) {*/
                            if (groupOutgoing != null) {
                                groupModel = {
                                    dataIndx: [groupOutgoing],
                                    collapsed: [true],
                                    title: ["<b style='font-weight:bold;'>{0} ({1})</b>",
                                        "{0} - {1}"],
                                    dir: ["up", "down"]
                                };
                            }
                            //  }
                            $grid2Out.pqGrid("option", "groupModel", groupModel);
                            $grid2Out.pqGrid("refreshDataAndView");
                        }
                    }
                ]
            },
            {type: '<span style="margin-left: 7px"></span>'},
            {
                type: 'button', label: 'Очистить',
                listeners: [{
                    click: function (evt) {
                        clearDocFilter($grid2Out)
                    }
                }],
                icon: 'ui-icon-cancel'
            }
            /*,
             {type: 'separator'},
             {type: 'button', label: 'Печать', listeners: [{click: prn}], icon: 'ui-icon-print'}*/
        ]
    };
    $grid2Out = $("#grid_2outgoing").pqGrid(newObjOut);
    /*exeFilter($Filter2Outgoing + "&format=json", groupOutgoing, $grid2Out);*/
    //  updateViewOutgoin();
    $grid2Out.pqGrid({
        rowDblClick: function (event, ui) {
            
            openModalEdit(ui.rowData.nodeRef, $grid2Out);
        }
    });
    $grid2Out.pqGrid({
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
                addDocOutgoinCreate(this.nodeRef);
            }
            
            return false;
        }
    });
    $grid2Out.one("pqgridload", function (evt, ui) {
        $("#tabs").tabs("option", "disabled", -1);
        $grid2Out.pqGrid("refreshHeader");
    });
    $(".fGroupOut").pqSelect({
        singlePlaceholder: 'Нет', width: '150px', search: 'false'
    });
}
document.onclick = function () {
    document.getElementById("contextmenu").style.display = "";
}

//--------------------------выбрать все--------------------------------------------------------------------
function selAllOutgoin() {
    require(["jquery"], function ($) {
        if ($("#selAllOutgoing").prop("checked")) {
            $("#selAllOutgoing").prop("checked", false);
            $grid2Out.pqGrid("selection",
                {
                    type: 'row',
                    all: 'all',
                    method: 'removeAll'
                }
            );
        } else {
            $("#selAllOutgoing").attr("checked", "checked");
            $("#selAllOutgoing").prop("checked", true);
            $grid2Out.pqGrid("selection",
                {
                    type: 'row',
                    all: 'all',
                    method: 'selectAll'
                }
            );
        }
    })
}

//--------------------------списать в архив--------------------------------------------------------------------
function toArchOutgoin() {
    var ans = window.confirm("Вы действительно хотите изменить статус у выбранных документов?");
    if (ans) {
        var data = $grid2Out.pqGrid("option", "dataModel.data");
        $grid2Out.pqGrid("showLoading");
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
        $grid2Out.pqGrid("hideLoading");
        $grid2Out.pqGrid("refreshDataAndView");
        $grid2Out.pqGrid({flexHeight: true});
    }
}

//--------------------------удалить--------------------------------------------------------------------
function deleteOut() {
    deleteSelected($grid2Out, "Вы действительно хотите удалить выбранные документы?");
}

//--------------------------метод очистки фильтров--------------------------------------------------------------------
function clearOutDocFilter() {
    $Filter2Outgoing = "/share/proxy/alfresco/documents/search-regestry-out?q_state=" + encodeURI(encodeURI('Активные'));
    $grid2Out.pqGrid("destroy");
    show2Out();
  
}
//--------------------------метод фильтрации--------------------------------------------------------------------
function filterOutgoing() {
    require(["jquery"], function ($) {
        var paramSearch = "/share/proxy/alfresco/documents/search-regestry-out";
        fieldVal = $("#stateOut").val();
        if (fieldVal !== '') {
            paramSearch = paramSearch + '?q_state=' + encodeURI(encodeURI(fieldVal));
        }
        
        //исполнитель
        fieldVal = $("#executorOut-cntrl").attr("sub_info");
        if (fieldVal) {
            var obj = eval("(" + fieldVal + ')');
            paramSearch = paramSearch + '&q_autor=' + obj.nodeRef;
        }
        //Подписант
        fieldVal = $("#senderOut-cntrl").attr("sub_info");
        if (fieldVal) {
            var obj = eval("(" + fieldVal + ')');
            paramSearch = paramSearch + '&q_sender=' + obj.nodeRef;
        }
       
        $Filter2Outgoing = paramSearch;
        paramSearch += "&format=json";
        exeFilter(paramSearch, groupOutgoing, $grid2Out);
    
    })
}
//--------------------------отрисовка combonox  ->> передалать частично в гриде----------------------------------------------------
require(["jquery", "combobox"], function ($) {
    $(document).ready(function () {
        
        //состояние
        $('#stateOut').ajaxComboBox(
            "/share/proxy/alfresco/documents/state-doc-out?field=name",
            {
                db_table: 'nation',
                lang: 'en',
                button_img: '/share/res/js/lib/combobox/btn.png',
                bind_to: 'foo',
                sub_info: true,
                instance: true
            }
        );
        $('#stateOut').val('Активные');
        $(".ac_subinfo").css("display", "none");
    });
});
//--------------------------фильтры действия  ->> передалать частично в гриде-----------------------------------------------
require(["jquery"], function ($) {
    $('#contentOut').keyup(function (e) {
        if (e.keyCode == 13) {
            filterOutgoing();
        }
    });
    $('#stateOut').keyup(function (e) {
        if (e.keyCode == 13) {
            filterOutgoing();
        }
    });
    /*очистка*/
    $('#clearFiltersOut').click(function () {
        clearOutDocFilter();
        //------------заменить на функцию локальной очистки после переделывания
        //clearDocFilter($grid2Out)
    });
//--------------------------группировка  ->> передалать в гриде--------------------------------------------------------------------
    $('#out_group').change(function () {
        switch ($('#out_group').val()) {
            case "Контрагент":
                groupOutgoing = "contragent";
                break;
            case "Состояние":
                groupOutgoing = "state";
                break;
            case "Тип документа":
                groupOutgoing = "docType";
                break;
            default:
                groupOutgoing = null;
        }
        exeFilter($Filter2Outgoing + "&format=json", groupOutgoing, $grid2Out);
    });
})
//------------------------------на печать ----------------------------------------------
function prnOutgoin() {
    var link= "/share/proxy/alfresco/documents/search-regestry-out?q_state=" + encodeURI(encodeURI('Активные'));
    window.open(link + "&format=html&q_viewType=1" + prepareLocalFilter($grid2Out), "_blank");
   
}
function prepareLocalFilterOut() {
    var fieldVal = "";
    var column = "";
    var filter = "";
    var dataModel = $grid2Out.pqGrid("option", "dataModel");
    if (dataModel.data) {
       
        column = $grid2Out.pqGrid("getColumn", {dataIndx: "contragent"});
        filter = column.filter;
        if (typeof filter.value != "undefined" && filter.value != "") {
            fieldVal += "&q_executionOrganization=" + dataModel.data[0].contragentNodeRef;
        }
        column = $grid2Out.pqGrid("getColumn", {dataIndx: "contragentPerson"});
        filter = column.filter;
        if (typeof filter.value != "undefined" && filter.value != "") {
            fieldVal += "&q_recipient=" + dataModel.data[0].contragentPersonNodeRef;
        }
        /* if (typeof filter.value != "undefined" && filter.value != "") {
         fieldVal += "&q_docType=" + dataModel.data[0].docTypeNodeRef;
         }*/
        return fieldVal;
    }
    else {
        return 1
    }
}

function get2ContragentPerson() {
    require(["jquery"], function ($) {
        // var contragentOutNodeRef = "workspace://SpacesStore/33054a55-61d7-4d71-a041-9f2995294941";
        var contragents = "";
        var column = $grid2Out.pqGrid("getColumn", {dataIndx: "btl-outgoing:contragentUnit-ref"});
        var filter = column.filter;
        filter.cache = null;
        /* var extra = "?extra=PARENT:'" + filter.value + "'";*/
        var listUrl = "/share/proxy/alfresco/documents/search-regestry-person?extra=PARENT:'" + filter.value + "'";
        /*   console.log("----------"+listUrl);*/
        $.ajax({
            url: listUrl,
            success: function (response) {
                if (response.result.length != 0) {
                    $('div[name="btl-outgoing:contragentPerson-ref"]').css("display", "block");
                    column = $grid2Out.pqGrid("getColumn", {dataIndx: "btl-outgoing:contragentPerson-ref"});
                    filter = column.filter;
                    filter.cache = null;
                    filter.options = response.result;
                    $grid2Out.pqGrid("refreshHeader");
                    contragentPerson.pqSelect("enable");
                    contragentPerson.pqSelect({singlePlaceholder: 'Все', searchRule: "contain", width: '100%'});
                    contragentPerson.pqSelect("refresh");
                    /*   contragentPerson.pqSelect({singlePlaceholder: 'Все', searchRule: "contain", width: '100%'});*/
                    /* contragentPerson.pqSelect("refresh");*/
                } else {
                    var CM = $grid2Out.pqGrid("getColModel");
                    delete CM[8].filter.value;
                    delete CM[8].filter.cache;
                    delete CM[8].filter.options;
                    //  contragentPerson.pqSelect({singlePlaceholder: 'Выберите контрагента', searchRule: "contain", width: '100%'});
                    contragentPerson.pqSelect("disable");
                    contragentPerson.pqSelect({singlePlaceholder: 'Выберите контрагента', searchRule: "contain", width: '100%'});
                    /*    contragentPerson.pqSelect("refresh");*/
                    $grid2Out.pqGrid("refreshDataAndView");
                }
            }
        })
    });
    /* test.push({"11": "11"})
     return test;*/
}

//--------------------------клик по табу--------------------------------------------------------------------
require(["jquery"], function ($) {
    $(document).ready(function () {
        $('#li_tab12').click(function () {
            if ($grid2Out == "") {
                show2Out($Filter2Outgoing + "&format=json");
                //$("#grid_2outgoing").pqGrid("refreshView");
                /*contragentPerson.pqSelect("disable");*/
            }
        });
    })
});
