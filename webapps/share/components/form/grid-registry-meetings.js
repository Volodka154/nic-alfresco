//--------------------------входящие документы--------------------------------------------------------------------
var totalRecordsMeetings = 0;
var $gridMeetings = "";
var $FilterMeetings = "/share/proxy/alfresco/documents/search-regestry-meetings?q_state=" + encodeURI(encodeURI('Активные'));
var groupMeetings = null;
var idAddArch = 0;
/*var newObj = [];*/
function showMeetings() {
    var colM = [];
    require(["jquery", "pqgrid", "pqselect", "jquery-ui.datepicker-ru"], function ($) {
        // $gridMeetings.pqGrid("destroy");
        var idCreate = false;
        Alfresco.util.Ajax.request({
            method: "GET",
            url: Alfresco.constants.PROXY_URI + "groupPermision?user=" + Alfresco.constants.USERNAME + "&group=ALFRESCO_ADMINISTRATORS",
            successCallback: {
                fn: function addPropetries(complete) {
                    if (complete.json.result == "true") {
                        idAddArch = 1;
                        addArchInMeetings(1, 1, colM);
                    } else {
                        Alfresco.util.Ajax.request({
                            method: "GET",
                            url: Alfresco.constants.PROXY_URI + "groupPermision?user=" + Alfresco.constants.USERNAME + "&group=EEO",
                            successCallback: {
                                fn: function addPropetries(complete) {
                                    if (complete.json.result == "true") {
                                        if (idCreate == false) {
                                            idAddArch = 1;
                                            addArchInMeetings(1, 0, colM);
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
                                                            addArchInMeetings(1, 0, colM);
                                                        }
                                                    } else {
                                                        addArchInMeetings(0, 0, colM);
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
function createGridMeetings($arch, $isAdmin, $colM) {
    var stateAccessMeeting = [
        {"Активные": "Активные"},
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
        {"В архиве": "В архиве"},
        {"Все": "Все"}
    ];
    
    $colM.push(
        {title: "nodeRef", width: 100, dataType: "string", dataIndx: "nodeRef", hidden: true, align: "center"},
        {title: "Файл", width: 40, dataType: "string", dataIndx: "fileExists"},
        {
            title: "Рег. номер", minWidth: 70, dataType: "string", dataIndx: "btl-meeting:number",
            filter: {type: 'textbox', condition: 'contain', listeners: ['change']}
        },
        {
            title: "Дата регистрации", minWidth: 160, width: 160,
            dataType: dateType, dataIndx: "btl-meeting:regDate",
            filter: {type: 'textbox', condition: "between", init: pqDatePicker, listeners: ['change']}
        }, 
        {
            title: "Секретарь", minWidth: 150, dataType: "string", dataIndx: "btl-meeting:secretary-login",
            filter: {
                type: 'select', condition: 'equal', options: document.emploeeDoc,
                prepend: {'': ''},
                listeners: ["change"],
                init: function () {
                    $(this).pqSelect({singlePlaceholder: 'Все', searchRule: "begin", width: '100%'});
                },
            }
        },
        {
            title: "Председатель", minWidth: 150, dataType: "string", dataIndx: "btl-meeting:chairman-login",
            filter: {
                type: 'select', condition: 'equal', options: document.emploeeDoc,
                prepend: {'': ''},
                listeners: ["change"],
                init: function () {
                    $(this).pqSelect({singlePlaceholder: 'Все', searchRule: "begin", width: '100%'});
                },
            }
        },
        {
            title: "Тема", minWidth: 170, dataType: "string", dataIndx: "btl-meeting:theme",
            filter: {type: 'textbox', condition: 'contain', listeners: ['change']}
        },
        {
            title: "Начало", minWidth: 130, width: 130,
            dataType: dateType, dataIndx: "btl-meeting:startDate",
            filter: {type: 'textbox', condition: "between", init: pqDatePicker, listeners: ['change']}
        }, 
        {
            title: "Окончание", minWidth: 130, width: 130,
            dataType: dateType, dataIndx: "btl-meeting:endDate",
            filter: {type: 'textbox', condition: "between", init: pqDatePicker, listeners: ['change']}
        },
        {
            title: "Состояние", minWidth: 140, width: 140, dataType: "string", dataIndx: "state",
            prepend: {'': ''},
            filter: {
                type: 'select', style: "height:32px;", condition: 'equal', options: stateAccessMeeting, listeners: ["change"],
                init: function () {
                    $(this).pqSelect({singlePlaceholder: 'Активные', searchRule: "begin", width: '100%'});
                },
            }
        },
        {
            title: "Место проведения", minWidth: 100, dataType: "string", dataIndx: "btl-meeting:room-content"
        }
        
    );
    var dataModel = {
        location: "remote", sorting: "remote", dataType: "JSON", method: "GET", url: $FilterMeetings + '&totalRecords=' + totalRecordsMeetings + '&format=json',
        getData: function (dataJSON) {
            var data = dataJSON.items;
            totalRecordsMeetings = dataJSON.totalRecords;
            return {curPage: dataJSON.curPage, totalRecords: dataJSON.totalRecords, data: data};
        }
    };
    var newObj = {
        selectionModel: {type: 'none', subtype: 'incr', cbHeader: false, cbAll: true},
        showTop: true,
        showHeader: true,
        showTitle: true,
        flexHeight: true,
        flexWidth: true,
        dataModel: dataModel,
        collapsible: false,
        pageModel: {type: "remote", rPP: 100, strRpp: "{0}", rPPOptions: [25, 50, 100]},
        colModel: $colM,
        filterModel: {on: true, mode: "AND", header: true},
        editable: false,
        columnBorders: true,
        width: '100%',
        height: 600,
        beforeFilter: function (evt, ui) {
            totalRecordsMeetings = 0;
            $("#grid_meetings").pqGrid("option", "dataModel").url = $FilterMeetings + '&totalRecords=' + totalRecordsMeetings + '&format=json';
            $gridMeetings.pqGrid("option", "pageModel.curPage", 1);
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
    newObj.title = "<button type='button' onclick='backHome()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'";
    newObj.title += "role='button'><span class='ui-button-icon-primary ui-icon ui-icon-home'></span><span class='ui-button-text'>Домой</span></button>";
    newObj.title += "<span style='margin-left: 10px ; margin-bottom: -5px' class='pq-separator '></span>";
    newObj.title += "<button type='button'  style='margin-left: 10px' onclick='addDocMeetings()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'";
    
    newObj.title += "role='button'><span class='ui-button-icon-primary ui-icon ui-icon-plus'></span><span class='ui-button-text'>Создать</span></button>";
    if ($isAdmin == 1){
       newObj.title += "<button type='button'  style='margin-left: 5px'  onclick='deleteMeetings()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'";
       newObj.title += "role='button'><span class='ui-button-icon-primary ui-icon ui-icon-cancel'></span><span class='ui-button-text'>Удалить</span></button>";
    }
    
    //   newObj.dataModel = dataModel;
    $gridMeetings = $("#grid_meetings").pqGrid(newObj);
    $gridMeetings.pqGrid({
        beforeTableView: function (event, ui) {
            $("#grid_meetings").pqGrid("option", "dataModel").url = $FilterMeetings + '&totalRecords=' + totalRecordsMeetings + '&format=json';
            $("span:contains('Дополнительно')").parent().prop('disabled', true).prop('disabled', true).removeClass("pq-select-option-label ui-state-enable pq-state-hover").addClass("fd");
        }
    });
    //------------------Инициализация выпадющего меню в хедере-------------------------------------------------------------------------
    $(".fMeetings").pqSelect({
        singlePlaceholder: 'Все', searchRule: "begin", width: '150px'
    }).on("change", function (evt) {
    });
    $(".f2Group").pqSelect({
        singlePlaceholder: 'Нет', width: '150px'
    })
  
    
    
    $gridMeetings.one("pqgridload", function (evt, ui) {
        //$("#tabs").tabs("option", "disabled", -1);
    });
    $gridMeetings.pqGrid({
        rowDblClick: function (event, ui) {
            openModalMeetingsing(ui.rowData.nodeRef);
        }
    });
}
function openModalMeetingsing(nodeRef) {
    document.frameSave = function () {
        document.getElementById(modalWindowShadow).style.display = "none";
        document.body.style.overflow = "";
        $gridMeetings.pqGrid("refreshDataAndView");
    };
    document.frameCancel = function () {
        document.getElementById(modalWindowShadow).style.display = "none";
        document.body.style.overflow = "";
        $gridMeetings.pqGrid("refreshDataAndView");
    };
    var modal = document.getElementById(modalWindowShadow);
    modal.style.display = "block";
    var frameShadowBack = document.getElementById(frameBackground);
    frameShadowBack.innerHTML = '<iframe id="viewDocFrame" style="border-radius: 4px;" width="100%" height="100%" src="/share/page/dp/ws/meeting-rooms?nodeRef=' + nodeRef + '&frame=true">';
}
//--------------------------списать в архив--------------------------------------------------------------------
function toArchMeetings() {
    var ans = window.confirm("Вы действительно хотите изменить статус у выбранных документов?");
    if (ans) {
        var data = $gridMeetings.pqGrid("option", "dataModel.data");
        $gridMeetings.pqGrid("showLoading");
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
        $gridMeetings.pqGrid("hideLoading");
        $gridMeetings.pqGrid("refreshDataAndView");
        $gridMeetings.pqGrid({flexHeight: true});
    }
}

//--------------------------удалить--------------------------------------------------------------------
function deleteMeetings() {
    deleteSelected($gridMeetings, "Вы действительно хотите удалить выбранные мероприятия?");
}

//--------------------------отчет неисполненные--------------------------------------------------------------------
function printNotExe() {
    window.open('/share/proxy/alfresco/documents/search-regestry-kid', '_blank');
}
//--------------------------печать--------------------------------------------------------------------
function prnIncomming2() {
    window.open($FilterMeetings + "&format=html&q_viewType=1" + prepareLocalFilter($gridMeetings), "_blank");
}
//--------------------------выбрать все--------------------------------------------------------------------
function selAllMeetings() {
    require(["jquery"], function ($) {
        if ($("#selAllMeetings").prop("checked")) {
            $("#selAllMeetings").prop("checked", false);
            $gridMeetings.pqGrid("selection",
                {
                    type: 'row',
                    all: 'all',
                    method: 'removeAll'
                }
            );
        } else {
            $("#selAllMeetings").attr("checked", "checked");
            $("#selAllMeetings").prop("checked", true);
            $gridMeetings.pqGrid("selection",
                {
                    type: 'row',
                    all: 'all',
                    method: 'selectAll'
                }
            );
        }
    })
}
//--------------------------фльтр исходящего номера документа--------------------------------------------------------------------
function filterOnOutNum(evt, ui) {
    if (evt != null) {
        event = evt.currentTarget.value;
    }
    var filterObject = [{
        dataIndx: "btl-Meetings:outgoingNumber",
        condition: "contain",
        value: event
    }];
    /* $('#gridOnExecuteTasksUrgently')[0].checked = false;*/
    $gridMeetings.pqGrid("filter", {
        oper: 'add',
        data: filterObject
    });
}
//---------------------------------добавить в архив------------------------------------------------------------
function addArchInMeetings($arch, $isAdmin, $colM) {
    idCreate = true;
    if ($arch == 1) {
        $colM.push({
            title: "<input type='checkbox' id='selAllMeetings' onclick='selAllMeetings()'>",
            dataIndx: "sel",
            width: 30,
            align: "center",
            type: 'checkBoxSelection',
            cls: 'ui-state-default',
            resizable: false,
            sortable: false
        });
    }
    createGridMeetings($arch, $isAdmin, $colM);
}
require(["jquery",
    "pqgrid"], function ($) {

    //--------------------------отчет-входящие-------------------------------------------------------------------------------------
   /* $('#searchKIDexe').click(function () {
        var emplReport = $("#emplReport").val();
        var paramSearch = "/share/proxy/alfresco/documents/report-kid?q_type=1";
        if (emplReport != "") {
            paramSearch += "&emplReport=" + emplReport;
        }
        //датат от
        var fieldVal = '';
        fieldVal = $("#DateKID").val();
        if (fieldVal !== '') {
            paramSearch = paramSearch + '&q_dateFrom=' + fieldVal;
        }
        //дата до
        fieldVal = $("#DateKIDTo").val();
        if (fieldVal !== '') {
            paramSearch = paramSearch + '&q_dateTo=' + fieldVal;
        }
        //незавершенные
        if ($("#finishTaskIn").prop("checked") == true) {
            paramSearch = paramSearch + '&q_finishTask=1';
        }
        //Только первый уровень задач
        if ($("#firstTaskLevel").prop("checked") == true) {
            paramSearch = paramSearch + '&q_firstTaskLevel=1';
        }
        //Только контрольные
        if ($("#taskControl").prop("checked") == true) {
            paramSearch = paramSearch + '&q_taskControl=1';
        }
        // C датой исполнения
        if ($("#dateExe").prop("checked") == true) {
            paramSearch = paramSearch + '&q_dateExe=1';
        }
        //   alert(paramSearch);
        window.open(paramSearch, '_blank');
    });*/
});
//---------------------------отчет входящие-------------------------------------------------------------------
window.onload = function () {
    a = document.getElementById("a");
    b = document.getElementById("b");
};
function showA() {
    b.style.filter = "alpha(opacity=80)";
    b.style.opacity = 0.8;
    b.style.display = "block";
    a.style.display = "block";
    a.style.top = "50%";
    a.style.left = "50%";
    a.style.position = "absolute";
    a.style.marginLeft = "-100px";
    a.style.marginTop = "-75px";
}
function hideA() {
    b.style.display = "none";
    a.style.display = "none";
}
//--------------------------клик по табу--------------------------------------------------------------------
require(["jquery"], function ($) {
    $(document).ready(function () {
        $('#li_tab13').click(function () {
            if ($gridMeetings == "") {
                showMeetings($FilterMeetings + "&format=json");
            }
        });
    })
});