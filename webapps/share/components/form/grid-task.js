//--------------------------входящие документы--------------------------------------------------------------------
var totalRecordsTask = 0;
var $gridTask = "";
var $FilterTask = "/share/proxy/alfresco/documents/doc-task?q_state=" + encodeURI(encodeURI('Активные'));
var group2Incomming = null;
var idAddArch = 0;
/*var newObj = [];*/
function showTask() {
    var colM = [];
    require(["jquery", "pqgrid", "pqselect", "jquery-ui.datepicker-ru"], function ($) {
        // $gridTask.pqGrid("destroy");
        var idCreate = false;
        Alfresco.util.Ajax.request({
            method: "GET",
            url: Alfresco.constants.PROXY_URI + "groupPermision?user=" + Alfresco.constants.USERNAME + "&group=ALFRESCO_ADMINISTRATORS",
            successCallback: {
                fn: function addPropetries(complete) {
                    if (complete.json.result == "true") {
                        idAddArch = 1;
                        addArchInTask(1, 1, colM);
                    } else {
                        Alfresco.util.Ajax.request({
                            method: "GET",
                            url: Alfresco.constants.PROXY_URI + "groupPermision?user=" + Alfresco.constants.USERNAME + "&group=EEO",
                            successCallback: {
                                fn: function addPropetries(complete) {
                                    if (complete.json.result == "true") {
                                        if (idCreate == false) {
                                            idAddArch = 1;
                                            addArchInTask(1, 0, colM);
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
                                                            addArchInTask(1, 0, colM);
                                                        }
                                                    } else {
                                                        addArchInTask(0, 0, colM);
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
function creategridTask($arch, $isAdmin, $colM) {
	var stateAccess = [
	                   {"Активные": "Активные"},
	            	   {"Все": "Все"},
	            	   {"Черновик": "Черновик"},
	            	   {"Назначена": "Назначена"},
	            	   {"Делегирована": "Делегирована"},
	            	   {"В работе у делегата": "В работе у делегата"},
	            	   {"На исполнении": "На исполнении"},
	            	   {"Завершено": "Завершено"},
	            	   {"На проверке": "На проверке"},
	            	   {"На контроле": "На контроле"}
	            	   
	            	  
	                ];
	
   
    stateAccess.push({"Дополнительно": "Дополнительно"});
    stateAccess.push( {"Делегированные (на проверке)": "Делегированные (на проверке)"}   );
    stateAccess.push( {"Активные. Родительская завершена": "Активные. Родительская завершена"}   );
    stateAccess.push(  {"Активные без исполнителя": "Активные без исполнителя"}  );
    stateAccess.push(  {"Завершенные без исполнителя": "Завершенные без исполнителя"}  );
    stateAccess.push(  {"Разные исполнители": "Разные исполнители"}  );
    stateAccess.push(  {"Просроченные исполненные": "Просроченные исполненные"}  );
    stateAccess.push(  {"Просроченные неисполненные": "Просроченные неисполненные"}  );

    var typeAccess = [                      
	                   {"0": "Резолюция по Входящему"},
	            	   {"1": "Задание по Исходящему"},
	            	   {"2": "Резолюция по Внутреннему"},
	            	   {"3": "Задание по Проекту"},
	            	   {"4": "Инициативное задание"},
	            	   {"5": "Задание по НТД"},
                       {"7": "Задание по мероприятию"},
                       {"8": "Задание по ОРД"},
                       {"9": "Задание по договору"}
	                ];

    document.emploeeDoc.unshift({"----------------": "-------------"});
    document.emploeeDoc.unshift({"Уволенные сотрудники": "Уволенные сотрудники"});

    $colM.push(
			{ title: "nodeRef", width: 100, dataType: "string", dataIndx: "nodeRef", hidden: true, align: "center" },
			{
				title: "Тип", minWidth: 100, dataType: "string", dataIndx: "btl-task:taskType",
				filter: {
	                type: 'select', style: "height:32px;", condition: 'equal', options: typeAccess,
	                prepend: {'': ''},
	                listeners: ["change"],
	                init: function () {
	                    $(this).pqSelect({singlePlaceholder: 'Все', searchRule: "contain", width: '100%'});
	                },
            }
				
			},
            {
                title: "Название", minWidth: 180, width: 180, dataType: "string", dataIndx: "btl-task:name",
                filter: {type: 'textbox', condition: 'contain', listeners: ['change']}
            },
            {
                title: "Описание задачи", minWidth: 160, width: 160, dataType: "string", dataIndx: "btl-task:content",
                filter: {type: 'textbox', condition: 'contain', listeners: ['change']}
            },
            {
                title: "Отчёт", minWidth: 160, width: 160, dataType: "string", dataIndx: "btl-task:report",
                filter: {type: 'textbox', condition: 'contain', listeners: ['change']}
            },
            {
                title: "Состояние",width: 145,dataType: "string", dataIndx: "state",
                filter: {
                    type: 'select', style: "height:32px;", condition: 'equal', options: stateAccess, listeners: ["change"],
                    init: function () {
                        $(this).pqSelect({singlePlaceholder: 'Активные', searchRule: "begin", width: '100%'});
                    },
                }
            },
            {
                title: "Плановая дата завершения", minWidth: 160, width: 160, dataType: dateType, dataIndx: "btl-task:endDate",
                filter: {type: 'textbox', condition: "between", init: pqDatePicker, listeners: ['change']}
            },
            {
                title: "Фактическая дата завершения", minWidth: 160, width: 160, dataType: dateType, dataIndx: "btl-task:actualEndDate",
                filter: {type: 'textbox', condition: "between", init: pqDatePicker, listeners: ['change']}
            },
            /* {title: "Дата контроля", width: 100, dataType: "string", dataIndx: "controlDate"},*/
            {
                title: "Автор", width: 127,  dataType: "string", dataIndx: "btl-task:author-login",
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
                title: "Ответственный исполнитель", width: 127,  dataType: "string", dataIndx: "btl-task:executor-login",
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
                title: "Текущий исполнитель",  width: 127, dataType: "string", dataIndx: "btl-task:actualExecutor-login",
                filter: {
                    type: 'select', style: "height:32px;", condition: 'equal', options: document.emploeeDoc,
                    prepend: {'': ''},
                    listeners: ["change"],
                    init: function () {
                        $(this).pqSelect({singlePlaceholder: 'Все', searchRule: "contain", width: '100%'});
                    },
                }
            },
            /*  {title: "Делегат", minWidth: 150, dataType: "string", dataIndx: ""},*/
            {title: "Основание", minWidth: 130, dataType: "string", hidden: false, dataIndx: "task:parentDocument-content"},
            {
                title: "Проект", minWidth: 110, dataType: "string", dataIndx: "btl-task:project-ref",
                filter: {
                    type: 'select', condition: 'equal', options: [], prepend: {'': ''},
                    listeners: ["change"],
                    init: function (arg1) {
                        $(this).pqSelect({
                            singlePlaceholder: 'Все',
                            searchRule: "begin",
                            width: '100%',
                            url:"/share/proxy/alfresco/filters/association?type=btl-project:projectDataType&s_field=shortName&field=shortName",
                            urlItem:"/share/proxy/alfresco/picker/associationItem?type=btl-project:projectDataType&field=shortName",
                            value: arg1.column.filter.value
                        });

                    }
                }
            },
            {title: "Делегаты ", minWidth: 100, dataType: "string", dataIndx: "btl-task:delegates-content"}
    );
    var dataModel = {
        /*location: "remote", sorting: "local", dataType: "JSON", method: "GET", url: $FilterTask + '&totalRecords=' + totalRecordsTask + '&format=json',*/
        location: "remote", sorting: "local", dataType: "JSON", method: "GET", url: $FilterTask + "&format=json",
        getData: function (dataJSON) {
            var data = dataJSON.items;
            /*totalRecordsTask = dataJSON.totalRecords;*/
            return {curPage: dataJSON.curPage, totalRecords: dataJSON.totalRecords, data: data};
        }
    };

    var tableWidth = $('div.container').width() - 5;
    var tableHeight = $('div.container').height() - $('ul.yui-nav.ui-tabs-nav.ui-helper-reset.ui-helper-clearfix.ui-widget-header.ui-corner-all').height() - 10;

    var newObj = {
        width: tableWidth,
        height: tableHeight,
        selectionModel: {type: 'none', subtype: 'incr', cbHeader: false, cbAll: true},
        showTop: true,
        showHeader: true,
        showTitle: true,
        // flexHeight: true,
        // flexWidth: true,
        dataModel: dataModel,
        collapsible: false,
        pageModel: {type: "remote", rPP: 100, strRpp: "{0}", rPPOptions: [25, 50, 100]},
        colModel: $colM,
        filterModel: {on: true, mode: "AND", header: true},
        editable: false,
        columnBorders: true,
        // width: '100%',
        // height: 600,
        beforeFilter: function (evt, ui) {
          /*  totalRecordsTask = 0;*/
       /*     $("#grid_task").pqGrid("option", "dataModel").url = $FilterTask + '&totalRecords=' + totalRecordsTask + '&format=json';*/
            $gridTask.pqGrid("option", "pageModel.curPage", 1);
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

    newObj.title = "";
    if ($isAdmin == 1) {
        newObj.title += "<button type='button'  style='margin-left: 5px'  onclick='deleteSelectTask()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'";
        newObj.title += "role='button'><span class='ui-button-icon-primary ui-icon ui-icon-cancel'></span><span class='ui-button-text'>Удалить выбранные</span></button>";
    }
    newObj.title += "<button type='button'  style='margin-left: 10px' onclick='prnTasks()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'";
    newObj.title += "role='button'><span class='ui-button-icon-primary ui-icon ui-icon-print'></span><span class='ui-button-text'>Печать</span></button>";

    //   newObj.dataModel = dataModel;
    $gridTask = $("#grid_task").pqGrid(newObj);
    $gridTask.pqGrid({
        beforeTableView: function (event, ui) {
          /*  $("#grid_task").pqGrid("option", "dataModel").url = $FilterTask + '&totalRecords=' + totalRecordsTask + '&format=json';*/
            $("#grid_task").pqGrid("option", "dataModel").url = $FilterTask + '&format=json';
            $("span:contains('Дополнительно')").parent().prop('disabled', true).prop('disabled', true).removeClass("pq-select-option-label ui-state-enable pq-state-hover").addClass("fd");
            $("span:contains('-------------')").parent().prop('disabled', true).prop('disabled', true).removeClass("pq-select-option-label ui-state-enable pq-state-hover").addClass("fd");
        }
    });
    
   
    
    //------------------Инициализация выпадющего меню в хедере-------------------------------------------------------------------------
    $(".fTask").pqSelect({
        singlePlaceholder: 'Все', searchRule: "begin", width: '150px'
    }).on("change", function (evt) {
    });
    $(".fTaskGroup").pqSelect({
        singlePlaceholder: 'Нет', width: '150px'
    })
    $gridTask.one("pqgridload", function (evt, ui) {
        //$("#tabs").tabs("option", "disabled", -1);
    });
    $gridTask.pqGrid({
        rowDblClick: function (event, ui) {
            openModalTask(ui.rowData.nodeRef);
        }
    });
}

window.onresize = function () {


    var tableWidth = $('div.container').width() - 5;
    var tableHeight = $('div.container').height() - $('ul.yui-nav.ui-tabs-nav.ui-helper-reset.ui-helper-clearfix.ui-widget-header.ui-corner-all').height() - 10;

    if ($gridTask) {
        $gridTask.pqGrid("option", "width", tableWidth);
        $gridTask.pqGrid("option", "height", tableHeight);
        $gridTask.pqGrid("refreshView", {header: false});
    }
};

function openModalTask(nodeRef) {
    document.frameSave = function () {
        document.getElementById(modalWindowShadow).style.display = "none";
        document.body.style.overflow = "";
        $gridTask.pqGrid("refreshDataAndView");
    };
    document.frameCancel = function () {
        document.getElementById(modalWindowShadow).style.display = "none";
        document.body.style.overflow = "";
        $gridTask.pqGrid("refreshDataAndView");
    };

    getArgsAndShowForm(nodeRef);
}

function getArgsAndShowForm(nodeRef) {
    if (!String.format) {
        String.format = function(format) {
            var args = Array.prototype.slice.call(arguments, 1);
            return format.replace(/{(\d+)}/g, function(match, number) {
                return typeof args[number] != 'undefined'
                    ? args[number]
                    : match
                    ;
            });
        };
    }

    function getFullUrl(pars) {
        i=0;
        url = Alfresco.constants.PROXY_URI + pars.url;
        for(key in pars.args){
            url += String.format("{0}{1}={2}", (i++===0 ?"?" :"&"), key, pars.args[key])
        }
        return url;
    }

    function getAjaxResult(pars){
        return $.ajax(getFullUrl(pars));
    }

    const userName = Alfresco.constants.USERNAME;

    var ajaxesPars1 = [
        {url: "hasPernission", args: {id: nodeRef, operation: "AddChildren"}, varName: "isHasAddChildren"},
        {url: "groupPermision", args: {user: userName, group: "ALFRESCO_ADMINISTRATORS"}, varName: "isAdmin"},
        // {url: "groupPermision", args: {user: userName, group: "GD"}, varName: "isGD"},
        {url: "check/if-can-see-acceptReport-button", args: {nodeRef: nodeRef}, varName: "canSeeAcceptReportButton"},

        {url: "hasPernission", args: {id: nodeRef, operation: "Write"}, varName: "isHasEdit"},
        {url: "hasPernission", args: {id: nodeRef, operation: "Coordinator"}, varName: "isCoordinator"},
        // {url: "groupPermision", args: {user: userName, group: "EEO"}, varName: "isEEO"},
        {url: "groupPermision", args: {user: userName, group: "CLERK"}, varName: "isClerk"},
        {url: "groupPermision", args: {user: userName, group: "DEV"}, varName: "isDEV"},

        // {url: "search/getEmpDelegates", args: {user: userName}, varName: "userDelegates"},
        {url: "getting/get-employee-delegates", args: {user: userName}, varName: "userDelegates"},
        {url: "documentDetail/documentType", args: {nodeRef: nodeRef}, varName: "docType"},
        {url: "common/getNodeInfo", args: {nodeRef: nodeRef, Assoc: "true"}, varName: "templateData"},
        // {url: "document/get-document-info", args: {nodeRef: nodeRef}, varName: "docStatus"},
        // {url: "document/get-next-consideration-document", args: {nodeRef: nodeRef}, varName: "nextDoc"},
        // {url: "document/get-document-gd-setting", args: {nodeRef: nodeRef}, varName: "gdSetting"}
    ];

    var ajaxesPars2 = [
        {url: "groupPermision", args: {user: userName, group: "GD"}, varName: "isGD"},
        {url: "groupPermision", args: {user: userName, group: "EEO"}, varName: "isEEO"},
        {url: "document/get-document-info", args: {nodeRef: nodeRef}, varName: "docStatus"}
    ];

    var ajaxesPars3 = [
        {url: "document/get-next-consideration-document", args: {nodeRef: nodeRef}, varName: "nextDoc", requires:{docStatus:"На рассмотрении", isGD:"true", isEEO:"true"}},
        {url: "document/get-document-gd-setting", args: {nodeRef: nodeRef}, varName: "gdSetting", requires:{docStatus:"На исполнении", isGD:"true"}}
    ];

    function getAjaxesResults(ajaxesPars) {
        ajaxesResults = [];
        for(j=0; j<ajaxesPars.length; j++){
            ajaxesResults.push(getAjaxResult(ajaxesPars[j]));
        }
        return ajaxesResults;
    }

    function printError(url, msg){
        console.log(String.format("Во время вебскрипта {0} произошла ошибка {1}", url, msg));
    }

    function getParsFromAjaxResults(ajaxesPars, args){
        resultPars = {};

        function getArgFromCheckResult(checkResult, ajaxPars){
            result = Boolean(checkResult && checkResult[0] && checkResult[0].result);
            if(result) {
                if (checkResult[1] == "success") {
                    result = checkResult[0].result == "true";
                } else {
                    printError(getFullUrl(ajaxPars), (checkResult[0].message ?checkResult[0].message :""));
                    result = false;
                }
            }
            return result ?"true" :"false";
        }

        for(i=0; i<args.length; i++){
            ajaxResult = args[i];
            ajaxPars = ajaxesPars[i];
            if (ajaxResult && (res = ajaxResult[0])) {
                switch (ajaxPars.varName) {
                    case "userDelegates":{
                        resultPars.userDelegates = [];
                        try {
                            for(j=0; j<res.items.length; j++){
                                resultPars.userDelegates.push(res.items[j].name);
                            }
                        } catch (e) {
                            printError(getFullUrl(ajaxesPars), e)
                        }
                    }
                        break;
                    case "docType": {
                        try {
                            resultPars.docType = res.docType;
                        } catch (e) {
                            resultPars.docType = "";
                            printError(getFullUrl(ajaxesPars), e)
                        }
                    }
                        break;
                    case "templateData": {
                        try {
                            resultPars.templateData = eval('(' + res + ')');
                        } catch (e) {
                        }
                    }break;
                    case "docStatus": {
                        try {
                            resultPars.docStatus = res.state;
                        } catch (e) {
                            resultPars.docStatus = ""
                        }
                    }break;
                    case "nextDoc": {
                        try {
                            resultPars.nextDoc = res.documentNodeRef
                        } catch (e) {
                        }
                    }break;
                    case "gdSetting": {
                        try {
                            for (key in res) {
                                resultPars[key] = res[key];
                            }
                        }catch(e){
                        }
                    }break;
                    default:resultPars[ajaxPars.varName] = getArgFromCheckResult(ajaxResult, ajaxPars);break;
                }
            }
        }
        return resultPars;
    }

    var pars = {};
    var parsObj = {resultPars:{firstPars:{}, secondPars:{}}, ready:{firstPart: false, secondPart: false}};

    setTimeout(function () {
        $.when.apply($,getAjaxesResults(ajaxesPars1)).done(function () {
            parsObj.resultPars.firstPars = getParsFromAjaxResults(ajaxesPars1, arguments);
            parsObj.ready.firstPart = true;
        });
    },10);

    setTimeout(function () {
        $.when.apply($, getAjaxesResults(ajaxesPars2)).done(function () {

            // getParsFromAjaxResults(ajaxesPars2);
            parsObj.resultPars.secondPars = getParsFromAjaxResults(ajaxesPars2, arguments);
            ajaxesPars = [];
            for(i=0; i<ajaxesPars3.length; i++){
                ajaxPars = ajaxesPars3[i];
                if(ajaxPars.requires){
                    requiresPassed = true;
                    for(key in ajaxPars.requires){
                        if(resultPars[key]!=ajaxPars.requires[key]){
                            requiresPassed = false;
                            break;
                        }
                    }
                    if(requiresPassed){
                        ajaxesPars.push(ajaxPars);
                    }
                }
            }

            // pars = $.extend({}, pars, resultPars);

            if(ajaxesPars.length>0) {
                $.when.apply($, getAjaxesResults(ajaxesPars)).done(function () {

                    resultPars = getParsFromAjaxResults(ajaxesPars, arguments);
                    parsObj.resultPars.secondPars = $.extend({}, parsObj.resultPars.secondPars, resultPars);
                    parsObj.ready.secondPart = true;
                })
            }else{
                parsObj.ready.secondPart = true;
            }
        });
    },10);

    var waitForPars = setInterval(function () {
        if(parsObj.ready.firstPart && parsObj.ready.secondPart){
            pars = $.extend({}, pars, parsObj.resultPars.firstPars);
            pars = $.extend({}, pars, parsObj.resultPars.secondPars);

            showTaskEditForm(pars);

            clearInterval(waitForPars);
        }
    },100);

    function showTaskEditForm(pars){
        function getUrlStr(pars) {
            var urlStr = "";
            for(var key in pars){
                var value = pars[key];
                if(Array.isArray(value)) {
                    var strValue = "";
                    for(var i=0; i<value.length; i++){
                        strValue += value[i];
                        if(i!=value.length-1){
                            strValue += ",";
                        }
                    }
                    value = strValue;
                }
                urlStr += String.format("&{0}={1}", key, value);
            }
            return urlStr;
        }
        var urlStr = getUrlStr(pars);


        var modal = document.getElementById(modalWindowShadow);
        modal.style.display = "block";
        var frameShadowBack = document.getElementById(frameBackground);
        frameShadowBack.innerHTML = '<iframe id="viewDocFrame" style="border-radius: 4px;" width="100%" height="100%" src="/share/page/btl-edit-metadata?nodeRef=' + nodeRef + '&frame=true' + urlStr + '">';
    }

    setTimeout(function () {
        clearInterval(waitForPars);
    },10000)
}

//---------------------------------добавить в архив------------------------------------------------------------
function addArchInTask($arch, $isAdmin, $colM) {
    idCreate = true;
    
    $colM.push({
        title: "<input type='checkbox' id='selAllTask' onclick='selAllTask()'>",
        dataIndx: "sel",
        width: 30,
        align: "center",
        type: 'checkBoxSelection',
        cls: 'ui-state-default',
        resizable: false,
        sortable: false
    });
    
    creategridTask($arch, $isAdmin, $colM);
}

//--------------------------выбрать все--------------------------------------------------------------------
function selAllTask() {
    require(["jquery"], function ($) {
        if ($("#selAllTask").prop("checked")) {
            $("#selAllTask").prop("checked", false);
            $gridTask.pqGrid("selection",
                {
                    type: 'row',
                    all: 'all',
                    method: 'removeAll'
                }
            );
        } else {
            $("#selAllTask").attr("checked", "checked");
            $("#selAllTask").prop("checked", true);
            $gridTask.pqGrid("selection",
                {
                    type: 'row',
                    all: 'all',
                    method: 'selectAll'
                }
            );
        }
    })
}

function deleteSelectTask() {
    deleteSelected($gridTask, "Вы действительно хотите удалить выбранные задачи?");
}

//--------------------------клик по табу--------------------------------------------------------------------
require(["jquery"], function ($) {
    $(document).ready(function () {
        $('#li_tab4').click(function () {
            if ($gridTask == "") {
                showTask($FilterTask + "&format=json");
            }
        });
    })
});

function prnTasks() {
    window.open($FilterTask + "&format=html&q_viewType=1" + prepareLocalFilter($gridTask), "_blank");
}