/*Исходящие*/
var $gridOut = "";
var $FilterOutgoing = "/share/proxy/alfresco/documents/search-regestry-out?q_state=" + encodeURI(encodeURI('Активные'));
var groupOutgoing = null;
var contragentPerson;
function showOut() {
    $("#tabs").tabs("option", "disabled", [0, 2, 3]);
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
    var colMOut = [
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
            title: "Подписант", width: 160, dataType: "string", dataIndx: "btl-outgoing:signer-login",
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
            title: "Исполнитель", width: 160, dataType: "string", dataIndx: "btl-document:author-login",
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
                listeners: ["change", {change: getContragentPerson}],
                init: function () {
                    //$(this).pqSelect({singlePlaceholder: 'Все', searchRule: "contain", width: '100%'});
                	$(this).pqSelect({singlePlaceholder: 'Все', searchRule: "begin", width: '100%', url:"/share/proxy/alfresco/filters/association?type=btl-contr:contractor-folder&s_field=name&field=name"});
                }
            }
        },
        {title: "contragentNodeRef", dataIndx: "contragentNodeRef", hidden: true},
        {
            title: "Кому", minWidth: 180, width: 180, dataType: "string", dataIndx: "btl-outgoing:contragentPerson-ref", cls: "just"/*,
            filter: {
                type: 'select', condition: 'equal', options: '', prepend: {'': ''},
                listeners: ["change"],
                init: function () {
                    $(this).pqSelect({singlePlaceholder: 'Выберите контрагента', searchRule: "contain", width: '100%'});
                    contragentPerson = $(this);
                    $(this).pqSelect("disable");
                }
            }
            */
        },
        {
            title: "В ответ на", minWidth: 100, dataType: "string", dataIndx: "responseTo"/*,
         filter: {type: 'textbox', condition: 'contain', listeners: ['change']}*/
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
            minWidth: 200,
            dataType: "string", dataIndx: "nameTask"
        }
    ];
    /*  var dataModelOut = {
     location: "local",
     sorting: "local",
     method: "GET"
     }*/
    var dataModelOut = {
        location: "remote", sorting: "local", dataType: "JSON", method: "GET", url: $FilterOutgoing + "&format=json",
        getData: function (dataJSON) {
            $gridOut.pqGrid("showLoading");
            var data = dataJSON.items;
            return {curPage: dataJSON.curPage, totalRecords: dataJSON.totalRecords, data: data};
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
            $gridOut.pqGrid("option", "pageModel.curPage", 1);
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
                            if ($gridOut.pqGrid("option", "groupModel") != null) {
                                $gridOut.pqGrid("option", "groupModel.collapsed", [false,
                                    false,
                                    false]);
                                $gridOut.pqGrid("refreshView");
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
                            $gridOut.pqGrid("option", "groupModel", groupModel);
                            $gridOut.pqGrid("refreshDataAndView");
                        }
                    }
                ]
            },
            {type: '<span style="margin-left: 7px"></span>'},
            {
                type: 'button', label: 'Очистить',
                listeners: [{
                    click: function (evt) {
                        clearDocFilter($gridOut)
                    }
                }],
                icon: 'ui-icon-cancel'
            }
            /*,
             {type: 'separator'},
             {type: 'button', label: 'Печать', listeners: [{click: prn}], icon: 'ui-icon-print'}*/
        ]
    };
    $gridOut = $("#grid_outgoing").pqGrid(newObjOut);
    /*exeFilter($FilterOutgoing + "&format=json", groupOutgoing, $gridOut);*/
    //  updateViewOutgoin();
    $gridOut.pqGrid({
        rowDblClick: function (event, ui) {
            /*
             window.open("/share/page/btl-edit-metadata?nodeRef=" + ui.rowData.nodeRef + "&redirect=/share/page/search-registry", "_blank");
             require(["dojo/topic"], function (topic) {
             topic.publish("ALF_DISPLAY_NOTIFICATION", {message: "Перенаправление на карточку документа."});
             });
             */
            openModalOutgoin(ui.rowData.nodeRef);
        }
    });
    $gridOut.pqGrid({
        rowRightClick: function (event, ui) {
            var menu = document.getElementById("contextmenu");
            menu.style.display = "block";
            x = event.clientX - 5;
            y = event.clientY - 5;
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
    $gridOut.one("pqgridload", function (evt, ui) {
        $("#tabs").tabs("option", "disabled", -1);
        $gridOut.pqGrid("refreshHeader");
    });
    $(".fGroupOut").pqSelect({
        singlePlaceholder: 'Нет', width: '150px', search: 'false'
    });
}
document.onclick = function () {
    document.getElementById("contextmenu").style.display = "";
}
//--------------------------метод очистки фильтров--------------------------------------------------------------------
function clearOutDocFilter() {
    $FilterOutgoing = "/share/proxy/alfresco/documents/search-regestry-out?q_state=" + encodeURI(encodeURI('Активные'));
    $gridOut.pqGrid("destroy");
    showOut();
    //clearDocFilter($gridOut)
    /*require(["jquery", "pqgrid"], function ($) {
     $('#regNumberOut').val('');
     $('#contentOut').val('');
     $('#outgoingDateOut-cntrl-date').val('');
     $('#outgoingDateOutTo-cntrl-date').val('');
     $("#outgoingDateOut").val('');
     $("#outgoingDateOutTo").val('');
     $('#senderOut-cntrl').val('');
     $('#executorOut-cntrl').val('');
     $('#contragentOut-cntrl').val('');
     $('#recipientOut-cntrl').val('');
     $("#contentOut").val('');
     $("#stateOut").val('Активные');
     $FilterOutgoing = "/share/proxy/alfresco/documents/search-regestry-out?q_state=" + encodeURI(encodeURI('Активные'));
     exeFilter($FilterOutgoing + "&format=json", groupOutgoing, $gridOut);
     });*/
}
//--------------------------метод фильтрации--------------------------------------------------------------------
function filterOutgoing() {
    require(["jquery"], function ($) {
        var paramSearch = "/share/proxy/alfresco/documents/search-regestry-out";
        fieldVal = $("#stateOut").val();
        if (fieldVal !== '') {
            paramSearch = paramSearch + '?q_state=' + encodeURI(encodeURI(fieldVal));
        }
        //номер
        /*if (fieldVal !== '') {
         var fieldVal = $("#regNumberOut").val();
         paramSearch = paramSearch + '?q_regNumber=*' + encodeURI(encodeURI(fieldVal)) + '*';
         }*/
        //содержание
        /* fieldVal = $("#contentOut").val();
         if (fieldVal !== '') {
         paramSearch = paramSearch + '&q_content=' + encodeURI(encodeURI(fieldVal));
         }*/
        /*  //датат от
         fieldVal = $("#outgoingDateOut").val();
         if (fieldVal !== '') {
         paramSearch = paramSearch + '&q_dateFrom=' + fieldVal;
         }
         else {
         paramSearch = paramSearch + '&q_dateFrom=MIN';
         }
         //дата до
         fieldVal = $("#outgoingDateOutTo").val();
         if (fieldVal !== '') {
         paramSearch = paramSearch + '&q_dateTo=' + fieldVal;
         }
         else {
         paramSearch = paramSearch + '&q_dateTo=MAX';
         }*/
        //состояние
        /*  //контрагент
         fieldVal = $("#contragentOut-cntrl").attr("sub_info");
         if (fieldVal) {
         var obj = eval("(" + fieldVal + ')');
         paramSearch = paramSearch + '&q_executionOrganization=' + obj.nodeRef;
         }*/
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
        /* //кому
         fieldVal = $("#recipientOut-cntrl").attr("sub_info");
         if (fieldVal) {
         var obj = eval("(" + fieldVal + ')');
         paramSearch = paramSearch + '&q_recipient=' + obj.nodeRef;
         }*/
        $FilterOutgoing = paramSearch;
        paramSearch += "&format=json";
        exeFilter(paramSearch, groupOutgoing, $gridOut);
        /* showOut(paramSearch, groupOutgoing);

         $("#grid_outgoing").pqGrid("refreshDataAndView");*/
    })
}
//--------------------------отрисовка combonox  ->> передалать частично в гриде----------------------------------------------------
require(["jquery", "combobox"], function ($) {
    $(document).ready(function () {
        /*//Подписант
         var type = "btl-emp:employee-content";
         // поле по которому производится поиск
         var s_field = "surname";
         // значения какого поля ворзвращать
         var field = "surname,firstname,middlename";
         var filter = "";
         var listUrl = "/share/proxy/alfresco/filters/association?type=" + type + "&s_field=" + s_field + "&field=" + field + filter;
         $('#senderOut-cntrl').ajaxComboBox(
         listUrl,
         {
         db_table: 'nation',
         lang: 'en',
         button_img: '/share/res/js/lib/combobox/btn.png',
         bind_to: 'foo',
         sub_info: true,
         instance: true
         });
         //Исполнитель
         $('#executorOut-cntrl').ajaxComboBox(
         listUrl,
         {
         db_table: 'nation',
         lang: 'en',
         button_img: '/share/res/js/lib/combobox/btn.png',
         bind_to: 'foo',
         sub_info: true,
         instance: true
         });*/
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
        //clearDocFilter($gridOut)
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
        exeFilter($FilterOutgoing + "&format=json", groupOutgoing, $gridOut);
    });
})
//------------------------------на печать ----------------------------------------------
function prnOutgoin() {
    window.open($FilterOutgoing + "&format=html&q_viewType=1" + prepareLocalFilter($gridOut), "_blank");
    /*  var f = prepareLocalFilterOut();
     if (f != 1) {
     /!* console.log($FilterIncom + "&format=html&q_viewType=1" + fieldVal);*!/
     window.open($FilterOutgoing + "&format=html&q_viewType=1" + f, "_blank");
     }
     else {
     alert("Нет данных для отчета.");
     }*/
}
function prepareLocalFilterOut() {
    var fieldVal = "";
    var column = "";
    var filter = "";
    var dataModel = $gridOut.pqGrid("option", "dataModel");
    if (dataModel.data) {
        /* column = $gridOut.pqGrid("getColumn", {dataIndx: "regDate"});
         filter = column.filter;*/
        /* if (typeof filter.value != "undefined" && filter.value != "") {

         //дата от
         if (filter.value != "") {
         fieldVal += '&q_dateFrom=' + filter.value.substr(6, 4) + '-' + filter.value.substr(3, 2) + '-' + filter.value.substr(0, 2);
         } else {
         fieldVal += '&q_dateFrom=MIN';
         }

         }
         if (typeof filter.value2 != "undefined" && filter.value != "") {
         //дата до
         if (filter.value2 != "") {
         fieldVal += '&q_dateTo=' + filter.value2.substr(6, 4) + '-' + filter.value2.substr(3, 2) + '-' + filter.value2.substr(0, 2);
         } else {
         fieldVal += '&q_dateTo=MAX';
         }
         }*/
        /*контрагент*/
        column = $gridOut.pqGrid("getColumn", {dataIndx: "contragent"});
        filter = column.filter;
        if (typeof filter.value != "undefined" && filter.value != "") {
            fieldVal += "&q_executionOrganization=" + dataModel.data[0].contragentNodeRef;
        }
        column = $gridOut.pqGrid("getColumn", {dataIndx: "contragentPerson"});
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
/*require(["jquery"], function ($) {
 $('div[name="btl-outgoing:contragentUnit-ref"]').bind('change', function(){

 });
 })*/
/*function detectSelectContragent() {
    require(["jquery"], function ($) {

        try {
            var contragent = "";
            var column = $gridOut.pqGrid("getColumn", {dataIndx: "btl-outgoing:contragentUnit-ref"});
            var filter = column.filter;
            filter.cache = null;
        } catch (e) {
        }
        /!*    alert(filter.value);*!/
    })
}*/
function getContragentPerson() {
    require(["jquery"], function ($) {
        // var contragentOutNodeRef = "workspace://SpacesStore/33054a55-61d7-4d71-a041-9f2995294941";
        var contragents = "";
        var column = $gridOut.pqGrid("getColumn", {dataIndx: "btl-outgoing:contragentUnit-ref"});
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
                    column = $gridOut.pqGrid("getColumn", {dataIndx: "btl-outgoing:contragentPerson-ref"});
                    filter = column.filter;
                    filter.cache = null;
                    filter.options = response.result;
                    $gridOut.pqGrid("refreshHeader");
                    contragentPerson.pqSelect("enable");
                    contragentPerson.pqSelect({singlePlaceholder: 'Все', searchRule: "contain", width: '100%'});
                    contragentPerson.pqSelect("refresh");
                    /*   contragentPerson.pqSelect({singlePlaceholder: 'Все', searchRule: "contain", width: '100%'});*/
                    /* contragentPerson.pqSelect("refresh");*/
                } else {
                    var CM = $gridOut.pqGrid("getColModel");
                    delete CM[8].filter.value;
                    delete CM[8].filter.cache;
                    delete CM[8].filter.options;
                    //  contragentPerson.pqSelect({singlePlaceholder: 'Выберите контрагента', searchRule: "contain", width: '100%'});
                    contragentPerson.pqSelect("disable");
                    contragentPerson.pqSelect({singlePlaceholder: 'Выберите контрагента', searchRule: "contain", width: '100%'});
                    /*    contragentPerson.pqSelect("refresh");*/
                    $gridOut.pqGrid("refreshDataAndView");
                }
            }
        })
    });
    /* test.push({"11": "11"})
     return test;*/
}
function openModalOutgoin(nodeRef) {
    document.frameSave = function () {
        document.getElementById(modalWindowShadow).style.display = "none";
        document.body.style.overflow = "";
        $gridOut.pqGrid("refreshDataAndView");
    }
    document.frameCancel = function () {
        document.getElementById(modalWindowShadow).style.display = "none";
        document.body.style.overflow = "";
        $gridOut.pqGrid("refreshDataAndView");
    }
    var modal = document.getElementById(modalWindowShadow);
    modal.style.display = "block";
    var frameShadowBack = document.getElementById(frameBackground);
    frameShadowBack.innerHTML = '<iframe id="viewDocFrame" style="border-radius: 4px;" width="100%" height="100%" src="/share/page/btl-edit-metadata?nodeRef=' + nodeRef + '&frame=true">';
}
//--------------------------клик по табу--------------------------------------------------------------------
require(["jquery"], function ($) {
    $(document).ready(function () {
        $('#li_tab2').click(function () {
            if ($gridOut == "") {
                showOut($FilterOutgoing + "&format=json");
                //$("#grid_outgoing").pqGrid("refreshView");
                /*contragentPerson.pqSelect("disable");*/
            }
        });
    })
});
