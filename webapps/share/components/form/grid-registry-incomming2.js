//--------------------------входящие документы--------------------------------------------------------------------
var totalRecords2Incomming = 0;
var $grid2Incomming = "";
var $Filter2Incomming = "/share/proxy/alfresco/documents/search-regestry2?q_state=" + encodeURI(encodeURI('Активные'));
var group2Incomming = null;
var idAddArch = 0;
var isTest = false;

Alfresco.util.Ajax.request({
    method: "GET",
    url: Alfresco.constants.PROXY_URI + "groupPermision?user=" + Alfresco.constants.USERNAME + "&group=TEST",
    successCallback: {
        fn: function addPropetries(complete) {
            if (complete.json.result == "true") {
                isTest = true;
                // console.log("Test enabled!")
            } else {
                isTest = false;
            }
        },
        scope: this
    }
});

/*var newObj = [];*/
function show2Incomming() {
    var colM = [];
    require(["jquery", "pqgrid", "pqselect", "jquery-ui.datepicker-ru"], function ($) {
        // $grid2Incomming.pqGrid("destroy");
        var idCreate = false;
        Alfresco.util.Ajax.request({
            method: "GET",
            url: Alfresco.constants.PROXY_URI + "groupPermision?user=" + Alfresco.constants.USERNAME + "&group=ALFRESCO_ADMINISTRATORS",
            successCallback: {
                fn: function addPropetries(complete) {
                    if (complete.json.result == "true") {
                        idAddArch = 1;
                        addArchIn2Incomming(1, 1, colM);
                    } else {
                        Alfresco.util.Ajax.request({
                            method: "GET",
                            url: Alfresco.constants.PROXY_URI + "groupPermision?user=" + Alfresco.constants.USERNAME + "&group=EEO",
                            successCallback: {
                                fn: function addPropetries(complete) {
                                    if (complete.json.result == "true") {
                                        if (idCreate == false) {
                                            idAddArch = 1;
                                            addArchIn2Incomming(1, 0, colM);
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
                                                            addArchIn2Incomming(1, 0, colM);
                                                        }
                                                    } else {
                                                        addArchIn2Incomming(0, 0, colM);
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
function createGrid2Incomming($arch, $isAdmin, $colM) {
    var stateAccess = [
        {"Активные": "Активные"},
        {"Черновик": "Черновик"},
        {"Зарегистрирован": "Зарегистрирован"},
        {"На рассмотрении": "На рассмотрении"},
        {"На исполнении": "На исполнении"},
        {"Исполнен": "Исполнен"},
        {"На регистрации": "На регистрации"},
        {"В архиве": "В архиве"},
        {"Все": "Все"}
    ];
    if (IDViewReport != 0) {
        stateAccess.push({"Дополнительно": "Дополнительно"});
        stateAccess.push({"На исполнении без резолюций": "На исполнении без резолюций"});
        stateAccess.push({"Для списания в архив": "Для списания в архив"});
        stateAccess.push({"Исполнен с незавершенными резолюциями": "Исполнен с незавершенными резолюциями"});
    }

    function filterhandler(evt, ui){
    	// console.log(ui);
    }

    $colM.push(
        {title: "nodeRef", width: 100, dataType: "string", dataIndx: "nodeRef", hidden: true, align: "center"},
        {title: "executorID", width: 100, dataType: "string", dataIndx: "btl-document:task-executor-login", hidden: true},
        {title: "ActualExecutorID", width: 100, dataType: "string", dataIndx: "btl-document:task-actual-executor-login", hidden: true},
        {title: "Файл", width: 40, dataType: "string", dataIndx: "fileExists"},
        {
            title: "Рег. номер", minWidth: 70, dataType: "string", dataIndx: "btl-document:regNumber",
            filter: {type: 'textbox', condition: 'contain', listeners: ['change']}
        },
        {
            title: "Дата регистрации", minWidth: 160, width: 160,
            dataType: dateType, dataIndx: "btl-document:regDate",
            filter: {type: 'textbox', condition: "between", init: pqDatePicker, listeners: ['change']}
        },
        {
            title: "Исходящий номер", minWidth: 100, dataType: "string", dataIndx: "btl-incomming:outgoingNumber",
            filter: {type: 'textbox', condition: 'contain', listeners: ['change']}
        },
        {
            title: "Организация", minWidth: 200, width: 200, dataType: "string", dataIndx: "btl-incomming:contragentUnit-ref", cls: "just",
            filter: {
                type: 'select', condition: 'equal', options: [], prepend: {'': ''},
                listeners: ["change"],
                init: function (arg1) {
                	$(this).pqSelect({
                			singlePlaceholder: 'Все',
                			searchRule: "begin",
                			width: '100%',
                			url:"/share/proxy/alfresco/filters/association?type=btl-contr:contractor-folder&s_field=name&field=name",
                			urlItem:"/share/proxy/alfresco/picker/associationItem?type=btl-contr:contractor-folder&field=name",
                			value: arg1.column.filter.value
                	});

                }
            }
        },
        {
            title: "Подписант от контрагента", minWidth: 120, width: 120, dataType: "string", dataIndx: "btl-incomming:contragentPerson-ref", cls: "just",
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
        {title: "В ответ на", minWidth: 100, dataType: "string", dataIndx: "responseTo"},
        {
            title: "Содержание", minWidth: 300, dataType: "string", dataIndx: "btl-document:content", cls: "just",
            filter: {type: 'textbox', condition: 'contain', listeners: ['change']}
        },
        {
            title: "Проект", minWidth: 160, dataType: "string", dataIndx: "btl-document:project-content", cls: "just",
            filter: {type: 'textbox', condition: 'contain', listeners: ['change']}
        },
        {
            title: "Состояние", minWidth: 140, width: 140, dataType: "string", dataIndx: "state",
            prepend: {'': ''},
            filter: {
                type: 'select', style: "height:32px;", condition: 'equal', options: stateAccess, listeners: ["change"],
                init: function () {
                    $(this).pqSelect({singlePlaceholder: 'Активные', searchRule: "begin", width: '100%'});
                },
            }
        },
        {
            title: "Кому", minWidth: 150, dataType: "string", dataIndx: "btl-incomming:recipient-login",
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
            title: "Тип документа", minWidth: 100, dataType: "string", dataIndx: "btl-document:docType-ref",
            filter: {
                type: 'select', condition: 'equal', options: typedocIncomming.result,
                prepend: {'': ''},
                listeners: ["change"],
                init: function () {
                    $(this).pqSelect({singlePlaceholder: 'Все', searchRule: "contain", width: '100%'});
                }
            }
        },
        {title: "Резолюции", minWidth: "130px", dataType: "string", dataIndx: "nameTask"},
        {title: "Текущий исполнитель", width: 100, dataType: "string", dataIndx: "actualExecutor", hidden: true},
        {title: "Исполнитель", width: 100, dataType: "string", dataIndx: "executor", hidden: true}
    );


    var dataModel = {
        location: "remote", sorting: "local", dataType: "JSON", method: "GET", url: $Filter2Incomming + '&totalRecords=' + totalRecords2Incomming + '&format=json',
        getData: function (dataJSON) {


            totalRecords2Incomming = dataJSON.items.length;
            return {curPage: dataJSON.curPage, totalRecords: dataJSON.totalRecords, data: dataJSON.items};
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
            totalRecords2Incomming = 0;
            $("#grid_2_incomming").pqGrid("option", "dataModel").url = $Filter2Incomming + '&totalRecords=' + totalRecords2Incomming + '&format=json';
            $grid2Incomming.pqGrid("option", "pageModel.curPage", 1);
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
    newObj.title += "<button type='button'  style='margin-left: 10px' onclick='addDoc2Incomming()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'";
    if ($arch == 1) {
        newObj.title += "role='button'><span class='ui-button-icon-primary ui-icon ui-icon-plus'></span><span class='ui-button-text'>Создать</span></button>";
        newObj.title += "<button type='button'  style='margin-left: 5px'  onclick='toArchIncomming2()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'";
        newObj.title += "role='button'><span class='ui-button-icon-primary ui-icon ui-icon-cancel'></span><span class='ui-button-text'>В архив</span></button>";
    }
    if ($isAdmin == 1){
        newObj.title += "<button type='button'  style='margin-left: 5px'  onclick='deleteIncomming()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'";
        newObj.title += "role='button'><span class='ui-button-icon-primary ui-icon ui-icon-cancel'></span><span class='ui-button-text'>Удалить</span></button>";
    }

    newObj.title += "<button type='button'  style='margin-left: 5px'  onclick='uploadIncommingFiles()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'";
    newObj.title += "role='button'><span class='ui-button-icon-primary ui-icon ui-icon-cancel'></span><span class='ui-button-text'>Скачать вложения</span></button>";

    newObj.title += "<span style='margin-left: 10px ; margin-bottom: -5px' class='pq-separator '></span>";
    newObj.title += "<button type='button'  style='margin-left: 10px' onclick='prnIncommingInt()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'";
    newObj.title += "role='button'><span class='ui-button-icon-primary ui-icon ui-icon-print'></span><span class='ui-button-text'>Печать</span></button>";
    if ($arch == 1) {
        newObj.title += "<button type='button'  style='margin-left: 5px'  onclick='printNotExe()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'";
        newObj.title += "role='button'><span class='ui-button-icon-primary ui-icon ui-icon-print'></span><span class='ui-button-text'>Неисполненные документы</span></button>";
        newObj.title += "<button type='button'  style='margin-left: 5px'  onclick='showA()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'";
        newObj.title += "role='button'><span class='ui-button-icon-primary ui-icon ui-icon-print'></span><span class='ui-button-text'>Отчет по входящим</span></button>";
		//test jasper
        if (isTest == true) {
            newObj.title += "<button type='button' style='margin-left: 5px' onclick='reportSearchKidJasper()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'";
            newObj.title += "role='button'><span class='ui-button-icon-primary ui-icon ui-icon-print'></span><span class='ui-button-text'>Неисполненные документы(J)</span></button>";
            newObj.title += "<button type='button' style='margin-left: 5px' onclick='showReportKidJasper()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'";
            newObj.title += "role='button'><span class='ui-button-icon-primary ui-icon ui-icon-print'></span><span class='ui-button-text'>Отчет по входящим(J)</span></button>";
        }
    }
    newObj.title += "<span style='margin-left: 10px ; margin-bottom: -5px' class='pq-separator '></span>";
    newObj.title += "<button type='button'  style='margin-left: 10px' onclick='updateFilter(true)' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'" +
    		"role='button'><span class='ui-button-icon-primary ui-icon ui-icon-refresh'></span></span><span class='ui-button-text'>Обновить списки фильтрации</span></button>";
    newObj.toolbar = {
        items: [
           {type: '<span>Группировка: </span>'},
            {
                type: 'select', cls: 'combo-pg f2Group', prepend: {'': ''},
                options: [
                    'Организация',
                    'Подписант от контрагента',
                    'Состояние',
                    'Кому',
                    'Тип документа',
                    'Текущий исполнитель',
                    'Ответственный исполнитель'
                ],
                listeners: [
                    {
                        change: function (evt) {
                            if ($grid2Incomming.pqGrid("option", "groupModel") != null) {
                                $grid2Incomming.pqGrid("option", "groupModel.collapsed", [false,
                                    false,
                                    false]);
                                $grid2Incomming.pqGrid("refreshView");
                            }
                            switch ($(this).val()) {
                                case "Организация":
                                    group2Incomming = "btl-incomming:contragentUnit-ref";
                                    break;
                                case "Подписант от контрагента":
                                    group2Incomming = "btl-incomming:contragentPerson-ref";
                                    break;
                                case "Состояние":
                                    group2Incomming = "state";
                                    break;
                                case "Кому":
                                    group2Incomming = "btl-incomming:recipient-login";
                                    break;
                                case "Тип документа":
                                    group2Incomming = "btl-document:docType-ref";
                                    break;
                                case "Текущий исполнитель":
                                    group2Incomming = "actualExecutor";
                                    break;
                                case "Ответственный исполнитель":
                                    group2Incomming = "executor";
                                    break;
                                default:
                                    group2Incomming = null;
                            }
                            // updateView2Incomming();
                            var groupModel = null;
                            if (group2Incomming != null) {
                                groupModel = {
                                    dataIndx: [group2Incomming],
                                    collapsed: [true],
                                    title: ["<b style='font-weight:bold;'>{0} ({1})</b>",
                                        "{0} - {1}"],
                                    dir: ["up",
                                        "down"]
                                };
                            }
                            //  }
                            $grid2Incomming.pqGrid("option", "groupModel", groupModel);
                            $grid2Incomming.pqGrid("refreshDataAndView");
                        }
                    }
                ]
            },
            {type: 'separator'},
            {type: '<span>Ответственный исполнитель: </span>'},
            {
                type: 'select', cls: 'combo-pg f2Incomming', options: document.emploeeDoc, prepend: {'': ''}, id:'combo-pg-incomming',
                listeners: [
                    {
                        change: function (evt) {
                            var filterObject = [{
                                dataIndx: "btl-document:task-executor-login",
                                condition: "contain",
                                value: $(this).val()
                            }];
                            $grid2Incomming.pqGrid("filter", {
                                oper: 'add',
                                data: filterObject
                            });
                        }
                    }
                ],
                init: function () {
                    $(this).pqSelect({singlePlaceholder: 'Все', searchRule: "contain", width: '100%'});
                },
            },
            {type: '<span style="margin-left: 7px">Текущий исполнитель: </span>'},
            {
                type: 'select', cls: 'combo-pg f2Incomming', options: document.emploeeDoc, prepend: {'': ''},
                listeners: [
                    {
                        change: function (evt) {
                            var filterObject = [{
                                dataIndx: "btl-document:task-actual-executor-login",
                                condition: "contain",
                                value: $(this).val()
                            }];
                            $grid2Incomming.pqGrid("filter", {
                                oper: 'add',
                                data: filterObject
                            });
                        }
                    }
                ]
            },
            {type: '<span style="margin-left: 7px"></span>'},
            {
                type: 'button', label: 'Очистить',
                cls: 'pq-select-item ui-corner-all ui-state-default',
                listeners: [{
                    click: function (evt) {
                        clearDocFilter($grid2Incomming);
                        /*
                        $(".f2Incomming")[1].innerHTML = '<span class="ui-icon ui-icon-triangle-1-s"></span><div style="max-width: 135px;" class="pq-select-text">Все</div>'
                        $(".f2Incomming")[3].innerHTML = '<span class="ui-icon ui-icon-triangle-1-s"></span><div style="max-width: 135px;" class="pq-select-text">Все</div>'
                        */
                    }
                }],
                icon: 'ui-icon-cancel'
            }
        ]
    };
    //   newObj.dataModel = dataModel;
    $grid2Incomming = $("#grid_2_incomming").pqGrid(newObj);
    $grid2Incomming.pqGrid({
        beforeTableView: function (event, ui) {
            $("#grid_2_incomming").pqGrid("option", "dataModel").url = $Filter2Incomming + '&totalRecords=' + totalRecords2Incomming + '&format=json';
            $("span:contains('Дополнительно')").parent().prop('disabled', true).prop('disabled', true).removeClass("pq-select-option-label ui-state-enable pq-state-hover").addClass("fd");
        }
    });
    //------------------Инициализация выпадющего меню в хедере-------------------------------------------------------------------------
    $(".f2Incomming").pqSelect({
        singlePlaceholder: 'Все', searchRule: "begin", width: '150px'
    }).on("change", function (evt) {
    });
    $(".f2Group").pqSelect({
        singlePlaceholder: 'Нет', width: '150px'
    })

    $grid2Incomming.pqGrid({
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
                addDocIncommingCreate(this.nodeRef);
            }

            return false;
        }
    });

    $grid2Incomming.one("pqgridload", function (evt, ui) {
        //$("#tabs").tabs("option", "disabled", -1);
    });
    $grid2Incomming.pqGrid({
        rowDblClick: function (event, ui) {
            openModal2Incomminging(ui.rowData.nodeRef);
        }
    });
}
function openModal2Incomminging(nodeRef) {
   document.frameSave = function () {
        document.getElementById(modalWindowShadow).style.display = "none";
        document.body.style.overflow = "";
        $grid2Incomming.pqGrid("refreshDataAndView");
    };
    document.frameCancel = function () {
        document.getElementById(modalWindowShadow).style.display = "none";
        document.body.style.overflow = "";
        $grid2Incomming.pqGrid("refreshDataAndView");
    };
    var modal = document.getElementById(modalWindowShadow);
    modal.style.display = "block";
    var frameShadowBack = document.getElementById(frameBackground);
    frameShadowBack.innerHTML = '<iframe id="viewDocFrame" style="border-radius: 4px;" width="100%" height="100%" src="/share/page/btl-edit-metadata?nodeRef=' + nodeRef + '&frame=true">';
    // frameShadowBack.innerHTML = changeLocation(false, {nodeRef:nodeRef, isFrame:true, formId:"taskEdit"});
    // changeLocation(false, {nodeRef:"${form.fields['assoc_packageItems'].value}", redirect:location1, newTab:true, formId:"taskEdit"});
}
//--------------------------списать в архив--------------------------------------------------------------------
function toArchIncomming2() {
    var ans = window.confirm("Вы действительно хотите изменить статус у выбранных документов?");
    if (ans) {
        var data = $grid2Incomming.pqGrid("option", "dataModel.data");
        $grid2Incomming.pqGrid("showLoading");
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
        $grid2Incomming.pqGrid("hideLoading");
        $grid2Incomming.pqGrid("refreshDataAndView");
        $grid2Incomming.pqGrid({flexHeight: true});
    }
}
//Скачать вложения
function uploadIncommingFiles(){
	var data = $grid2Incomming.pqGrid("option", "dataModel.data");
    $grid2Incomming.pqGrid("showLoading");

    var nodes = [];

    $.each(data, function (key, value) {
        if (value["sel"] == true) {
        	nodes.push(value["nodeRef"]);
        }
    });

    Alfresco.util.Ajax.jsonPost({
        url: "/share/proxy/alfresco/document/downloadFilesDoc",
        dataObj: {
            "nodes": nodes
        },
        successCallback: {
            fn: function (response) {
            	window.open(response.json.url, '_blank');
            }
        }
    });

    $grid2Incomming.pqGrid("hideLoading");
}

//--------------------------удалить--------------------------------------------------------------------
function deleteIncomming() {
    deleteSelected($grid2Incomming, "Вы действительно хотите удалить выбранные документы?");
}

//--------------------------отчет неисполненные--------------------------------------------------------------------
function printNotExe() {
    window.open('/share/proxy/alfresco/documents/search-regestry-kid', '_blank');
}
//--------------------------печать--------------------------------------------------------------------
function prnIncommingInt() {
    window.open($Filter2Incomming + "&format=html&q_viewType=1" + prepareLocalFilter($grid2Incomming), "_blank");
}
//--------------------------выбрать все--------------------------------------------------------------------
function selAllIncomming2() {
    require(["jquery"], function ($) {
        if ($("#selAllIncomming2").prop("checked")) {
            $("#selAllIncomming2").prop("checked", false);
            $grid2Incomming.pqGrid("selection",
                {
                    type: 'row',
                    all: 'all',
                    method: 'removeAll'
                }
            );
        } else {
            $("#selAllIncomming2").attr("checked", "checked");
            $("#selAllIncomming2").prop("checked", true);
            $grid2Incomming.pqGrid("selection",
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
        dataIndx: "btl-2Incomming:outgoingNumber",
        condition: "contain",
        value: event
    }];
    /* $('#gridOnExecuteTasksUrgently')[0].checked = false;*/
    $grid2Incomming.pqGrid("filter", {
        oper: 'add',
        data: filterObject
    });
}
//---------------------------------добавить в архив------------------------------------------------------------
function addArchIn2Incomming($arch, $isAdmin, $colM) {
    idCreate = true;
    if ($arch == 1) {
        $colM.push({
            title: "<input type='checkbox' id='selAllIncomming2' onclick='selAllIncomming2()'>",
            dataIndx: "sel",
            width: 30,
            align: "center",
            type: 'checkBoxSelection',
            cls: 'ui-state-default',
            resizable: false,
            sortable: false
        });
    }
    createGrid2Incomming($arch, $isAdmin, $colM);
}

require(["jquery",
    "pqgrid"], function ($) {

    //--------------------------отчет-входящие-------------------------------------------------------------------------------------
    $('#searchKIDexe').click(function () {
        var emplReport = $("#emplReport").val();
        var paramSearch = Alfresco.constants.PROXY_URI + "documents/report-kid?q_type=1";
        if (emplReport && emplReport != "") {
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
    });
});
//---------------------------отчет входящие-------------------------------------------------------------------
//window.onload = function () {
//    a = document.getElementById("a");
//    b = document.getElementById("b");
//};
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

//test jasper
require(["jquery",
    "pqgrid"], function ($) {
    //--------------------------отчет-входящие(jasper)-------------------------------------------------------------------------------------
    $('#reportKIDJasperexe').click(function () {
        var paramSearch = "";
        var emplReport = $("#emplReportJ").val();
        if (emplReport != "") {
            paramSearch += "&emplReport=" + emplReport;
        }
        //дата от
        var fieldVal = '';
        fieldVal = $("#DateKIDJ").val();
        if (fieldVal !== '') {
            paramSearch = paramSearch + '&q_dateFrom=' + fieldVal;
        }
        //дата до
        fieldVal = $("#DateKIDToJ").val();
        if (fieldVal !== '') {
            paramSearch = paramSearch + '&q_dateTo=' + fieldVal;
        }
        //незавершенные
        if ($("#finishTaskInJ").prop("checked") == true) {
            paramSearch = paramSearch + '&q_finishTask=1';
        }
        //Только первый уровень задач
        if ($("#firstTaskLevelJ").prop("checked") == true) {
            paramSearch = paramSearch + '&q_firstTaskLevel=1';
        }
        //Только контрольные
        if ($("#taskControlJ").prop("checked") == true) {
            paramSearch = paramSearch + '&q_taskControl=1';
        }
        // C датой исполнения
        if ($("#dateExeJ").prop("checked") == true) {
            paramSearch = paramSearch + '&q_dateExe=1';
        }

        reportKidJasper(paramSearch);
    });
});
window.onload = function () {
    a = document.getElementById("a");
    b = document.getElementById("b");
    c = document.getElementById("c");
    d = document.getElementById("d");
};
//---------------------------отчет входящие(jasper)-------------------------------------------------------------------
function showReportKidJasper() {
    d.style.filter = "alpha(opacity=80)";
    d.style.opacity = 0.8;
    d.style.display = "block";
    c.style.display = "block";
    c.style.top = "50%";
    c.style.left = "50%";
    c.style.position = "absolute";
    c.style.marginLeft = "-100px";
    c.style.marginTop = "-75px";
}
function hideReportKidJasper() {
    c.style.display = "none";
    d.style.display = "none";
}
function reportKidJasper(param) {
    var reportUrl = Alfresco.constants.PROXY_URI + 'documents/report-kid_jasper';
    var reportParams = '' + param;
    var reportTitle = 'Отчет по входящим';

    document.frameCancel = function () {
        document.getElementById(modalWindowShadow).style.display = "none";
        document.body.style.overflow = "";
        $grid2Incomming.pqGrid("refreshDataAndView");
    };
    var modal = document.getElementById(modalWindowShadow);
    modal.style.display = 'block';
    var frameShadowBack = document.getElementById(frameBackground);
    frameShadowBack.innerHTML = '<iframe id="viewReportFrame" style="border-radius: 4px;" width="100%" height="100%"'
        + ' title="' + reportTitle + '"'
        + ' src="/share/page/arm/reportpreview?reportUrl=' + encodeURIComponent(reportUrl)
            + '&reportParams=' + encodeURIComponent(reportParams)
            + '&reportTitle=' + encodeURIComponent(reportTitle)
        + '">';
}
//--------------------------отчет неисполненные(Jasper)--------------------------------------------------------------------
function reportSearchKidJasper() {
    var reportUrl = Alfresco.constants.PROXY_URI + 'documents/search-regestry-kid_jasper';
    var reportParams = '';
    var reportTitle = 'Неисполненные документы';

    document.frameCancel = function () {
        document.getElementById(modalWindowShadow).style.display = "none";
        document.body.style.overflow = "";
        $grid2Incomming.pqGrid("refreshDataAndView");
    };
    var modal = document.getElementById(modalWindowShadow);
    modal.style.display = 'block';
    var frameShadowBack = document.getElementById(frameBackground);
    frameShadowBack.innerHTML = '<iframe id="viewReportFrame" style="border-radius: 4px;" width="100%" height="100%"'
        + ' title="' + reportTitle + '"'
        + ' src="/share/page/arm/reportpreview?reportUrl=' + encodeURIComponent(reportUrl)
            + '&reportParams=' + encodeURIComponent(reportParams)
            + '&reportTitle=' + encodeURIComponent(reportTitle)
        + '">';
}

//--------------------------клик по табу--------------------------------------------------------------------
require(["jquery"], function ($) {
    $(document).ready(function () {
        $('#li_tab8').click(function () {
            if ($grid2Incomming == "") {
                show2Incomming($Filter2Incomming + "&format=json");
            }
        });
    })
});