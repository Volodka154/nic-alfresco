function openModalTaskAndDocument(nodeRef, status, urlLocation, rowData, args) {

    if(typeof simpleDialogFormStarting == "undefined"){
        simpleDialogFormStarting = false;
    }

    if(!simpleDialogFormStarting){
        if(typeof getCurFilterTab != "undefined") {
            var curFilterTab = getCurFilterTab();
            if(curFilterTab) {
                curFilterTab.click();
            }
        }else{
            window.parent.window.BTL["currentGrid"].pqGrid("refreshDataAndView");
        }

        document.openRow = {};
        document.openRow.nodeRef = nodeRef;
        document.openRow.status = status;
        document.openRow.gridIndex = rowData.rowIndx;

        document.frameSave  = function(o) {
            document.getElementById("modalWindowShadowTD").style.display = "none";
            document.body.style.overflow = "";

            if (document.modalSimpleDialogForm){
                document.modalSimpleDialogForm.hide();
            }

            document.refreshGrid();
        };

        document.frameCancel  = function(o) {
            document.getElementById("modalWindowShadowTD").style.display = "none";
            document.body.style.overflow = "";

            if (document.modalSimpleDialogForm){
                document.modalSimpleDialogForm.hide();
            }

            window.BTL["currentGrid"].pqGrid("refreshDataAndView");
            document.refreshGrid();
        };
        console.log("startForm");
        createAndOpenForm(rowData, urlLocation, true, args);

    }
}
//
// simpleDialogForm = null;
// simpleDialogFormStarting = false;

document.openFrameTaskByRowNumber = function(number){
	var row = window.BTL["currentGrid"].pqGrid( "getRowData", {rowIndxPage: number} );
	if (row && row.nodeRef) {
		row.rowIndx = number;
		taskAndDocumentOpenModalRowData(row);
	}
};

function hasRow(number, isNext){

    var isActiviti = false;
    var i = number;
    do{
        var row = window.BTL["currentGrid"].pqGrid("getRowData", {rowIndxPage: i});

        if (row) {
            if(row.nodeRef){
                isActiviti = row.nodeRef.includes("activiti");
                if (!isActiviti) {
                    return {result: true, index: i};
                }
            }else{
                return false;
            }
        } else {
            return false;
        }
        i = isNext ?i+1 :i-1;
    }while(isActiviti);

    return false;
}

document.hasNext = function() {
    if (document.openRow) {
        if(document.openRow.nodeRef.includes("activiti")){
            return false;
        }else{
            return hasRow(document.openRow.gridIndex + 1, true);
        }
    } else {
        console.log("document.openRow is null");
    }
    return false;
};

document.openNextTask = function(){
    if (document.openRow) {
        console.log("log", "!row:[" + (document.openRow.gridIndex) + "], nodeRef:[" + document.openRow.nodeRef + "]");
        const hasNextVar = hasNext();
        if (hasNextVar)
            openFrameTaskByRowNumber(hasNextVar.index/*document.openRow.gridIndex + 1*/);
    } else {
        console.log("document.openRow is null");
    }
};

document.hasPrevious = function(){
    if (document.openRow) {
        if(document.openRow.nodeRef.includes("activiti")){
            return false;
        }else{
            return hasRow(document.openRow.gridIndex - 1, false);
        }
    } else {
        console.log("document.openRow is null");
    }
    return false;
};

document.openPreviousTask = function(){
    if (document.openRow) {
        const hasPreviousVar = hasPrevious();
        if (hasPreviousVar)
            openFrameTaskByRowNumber(hasPreviousVar.index/*document.openRow.gridIndex - 1*/);
    } else {
        console.log("document.openRow is null");
    }
};

function taskAndDocumentOpenModalRowData(rowData, args) {

    var urlLocation = "";
    if (document.openRow && document.openRow.viewMode && document.openRow.viewMode == "old") {
        urlLocation = "/share/page/btl-edit-metadata?nodeRef=" + rowData.nodeRef;
    } else {
        urlLocation = "/share/page/btl-execution?nodeRef=" + rowData.nodeRef;
    }

    if (rowData.nodeRef.indexOf("activiti") > -1) {
        urlLocation = getUrlByType(rowData.type, rowData.nodeRef);
    }

    openModalTaskAndDocument(rowData.nodeRef, rowData.status, urlLocation, rowData, args);
}


function getUrlByType(type, nodeRef){
	var urlLocation = "";
	 switch (type) {
	     case "Согласование":
	         urlLocation = "/share/page/btl-negotiation-task?taskId=" + nodeRef;
	         break;
	     case "Подписание":
	         urlLocation = "/share/page/btl-signing-task?taskId=" + nodeRef;
	         break;
	     case "Доработка":
	         urlLocation = "/share/page/btl-revision-task?taskId=" + nodeRef;
	         break;
	     case "Ознакомление":
	         urlLocation = "/share/page/btl-familiarized-task?taskId=" + nodeRef;
	         break;
	     default:
	         urlLocation = "/share/page/task-edit?taskId=" + nodeRef;
	 }
	 return urlLocation;
}

function openForm(rowData) {
    var urlLocation = "/share/page/btl-execution?nodeRef=" + rowData.nodeRef;
    if (rowData.nodeRef.indexOf("activiti") > -1) {
        var changedForm = false;
        switch (rowData.type) {
            case "Согласование":
                urlLocation = "/share/page/btl-negotiation-task?taskId=" + rowData.nodeRef;
                break;
            case "Подписание":
                urlLocation = "/share/page/btl-signing-task?taskId=" + rowData.nodeRef;
                break;
            case "Доработка":
                urlLocation = "/share/page/btl-revision-task?taskId=" + rowData.nodeRef;
                break;
            case "Ознакомление":
                urlLocation = "/share/page/btl-familiarized-task?taskId=" + rowData.nodeRef;
                changedForm = true;
                break;
            default:
                urlLocation = "/share/page/task-edit?taskId=" + rowData.nodeRef;
        }
    }

    var isExecutionTask = urlLocation.includes("btl-execution");

    if(changedForm || isExecutionTask){
        var formId = null;

        if(isExecutionTask){
            formId = "taskExecutionForm"
        }else {
            switch (rowData.type) {
                case "Ознакомление": formId = "familiarizedForm"; break;
            }
        }

        createAndShowForm(rowData.nodeRef, {formId:formId});
    }else{
        window.location.href = urlLocation;
    }
}

require(["jquery", "pqgrid", "combobox", "pqselect", "jquery-ui.datepicker-ru", "jquery.datepicker.extension.range", "dojo/domReady!"], function ($) {
    var param = null;
    var paramMenu = null;
    var paramFilter = null;
    var author = '';
    var executor = '';
    var role = '';
    var fun = 'newTasks';
    var $grid = null;
    var gridType = null;
    var filter2type = 'btl-emp:employee-content';
    var filter2s_field = 'surname';
    var filter2field = 'surname,firstname,middlename';
    var filter2url = "/share/proxy/alfresco/filters/association?type=" + filter2type + "&s_field=" + filter2s_field + "&field=" + filter2field;
    var imageLoad = '<img src="/share/res/components/images/lightbox/loading.gif" title="Загрузка" alt="загрузка" style="position: absolute; padding-left: 5px;">';

    var countInWeek = $("#filter-date-week-tasks-and-documents_dashlet .count");
    var countInMonth = $("#filter-date-month-tasks-and-documents_dashlet .count");
    var countInYear = $("#filter-date-year-tasks-and-documents_dashlet .count");
    var countDateOff = $("#filter-date-off-tasks-and-documents_dashlet .count");

    
    Date.prototype.daysInMonth = function () {
        return 33 - new Date(this.getFullYear(), this.getMonth(), 33).getDate();
    };

    var user = Alfresco.constants.USERNAME;

    var dateType = function (val1, val2) {
        var dateBuf1 = $.trim(val1).split('-');
        if (dateBuf1.length < 2)
            return 1;

        var date1 = new Date(dateBuf1[2], dateBuf1[1], dateBuf1[0]);

        var dateBuf2 = $.trim(val2).split('-');
        if (dateBuf2.length < 2)
            return -1;

        var date2 = new Date(dateBuf2[2], dateBuf2[1], dateBuf2[0]);

        if (date1 > date2) {
            return 1;
        }
        else if (date1 < date2) {
            return -1;
        }
        else {
            return 0;
        }
    };

    var documentType = function (docName1, docName2) {

        var element = document.createElement("snap");
        element.innerHTML = docName1;

        docName1 = element.textContent;

        element.innerHTML = docName2;
        docName2 = element.textContent;

        if (docName1 > docName2) {
            return 1;
        }
        else if (docName1 < docName2) {
            return -1;
        }
        else {
            return 0;
        }
    };

    function pqDatePicker(ui) {
        var $this = $(this);
        $this
            .css({zIndex: 3, position: "relative"})
            .datepicker({
                dateFormat: 'dd-mm-yy',
                yearRange: "-20:+20", //20 years prior to present.
                changeYear: true,
                changeMonth: true,
                onClose: function (evt, ui) {
                    //$(this).focus();
                }
            });
    }

    /*function pqDatePicker(ui) {
        var $this = $(this);
        $this
            .css({zIndex: 3, position: "relative"});

        $this.datepicker({
            range: 'period', // режим - выбор периода
            numberOfMonths: 2,
            dateFormat: 'dd-mm-yy',
            onSelect: function (dateText, inst, extensionRange) {
                // extensionRange - объект расширения
                $this.filter(".pq-from").val(extensionRange.startDateText);
                $this.filter(".pq-to").val(extensionRange.endDateText);
                if (extensionRange.step == 0) {
                    $this.datepicker("hide");

                    $grid.pqGrid("filter", {
                        oper: 'replace',
                        data: [
                            {
                                dataIndx: 'duration',
                                condition: 'between',
                                value: extensionRange.startDateText,
                                value2: extensionRange.endDateText
                            }
                        ]
                    });

                    var element = $grid.find('input[name="grouping-of-document"]')[0];
                    eventGroupingOfDocumentRefreshView(element);
                    $grid.find('input[name="duration"].pq-from').val(extensionRange.startDateText);
                    $grid.find('input[name="duration"].pq-to').val(extensionRange.endDateText);
                    $grid.pqGrid("option", "colModel")[10].filter.value = extensionRange.startDateText;
                    $grid.pqGrid("option", "colModel")[10].filter.value2 = extensionRange.endDateText;
                }
            }
        });

        //$this.filter(".pq-from").datepicker('setDate', ['+4d', '+8d']);

        // объект расширения (хранит состояние календаря)
        //var extensionRange = $this.filter(".pq-from").datepicker('widget').data('datepickerExtensionRange');


        //default From date
        //var date1 = $this.filter(".pq-from").datepicker("option", "defaultDate", new Date());
        //$this.filter(".pq-from").datepicker({ dateFormat: 'dd-mm-yy' });
        //default To date
        //$this.filter(".pq-to").datepicker("option", "defaultDate", new Date());
    }*/

   /* function pqDatePickerDocs(ui) {
        var $this = $(this);
        $this
            .css({zIndex: 3, position: "relative"});

        $this.datepicker({
            range: 'period', // режим - выбор периода
            numberOfMonths: 2,
            dateFormat: 'dd-mm-yy',
            onSelect: function (dateText, inst, extensionRange) {
                // extensionRange - объект расширения
                $this.filter(".pq-from").val(extensionRange.startDateText);
                $this.filter(".pq-to").val(extensionRange.endDateText);
                if (extensionRange.step == 0) {
                    $this.datepicker("hide");

                    $grid.pqGrid("filter", {
                        oper: 'replace',
                        data: [
                            {
                                dataIndx: 'regDate',
                                condition: 'between',
                                value: extensionRange.startDateText,
                                value2: extensionRange.endDateText
                            }
                        ]
                    });
                    window.BTL["currentGrid"].pqGrid("refreshView", {header: false});
                    //window.BTL["currentGrid"].pqGrid("refreshDataAndView");
                    //$grid.find('input[name="duration"].pq-from').val(extensionRange.startDateText);
                    //$grid.find('input[name="duration"].pq-to').val(extensionRange.endDateText);
                    //$grid.pqGrid("option", "colModel")[4].filter.value = extensionRange.startDateText;
                    //$grid.pqGrid("option", "colModel")[4].filter.value2 = extensionRange.endDateText;
                }
            }
        });
    }*/

    function filterTypeTasks(evt, ui) {
        var currentGrid = window.BTL["currentGrid"];
        var buf = {"date": [], "dataUf": []};
        var checkboxGrouping = currentGrid.find("input[name='grouping-of-document']")[0];
        var checkboxUrgently = currentGrid.find("input[name='TasksUrgently']")[0];
        var checkboxSpecControl = currentGrid.find("input[name='specialControl']")[0];
        var data = (currentGrid.pqGrid("option", "dataModel.data")) ? currentGrid.pqGrid("option", "dataModel.data") : [];
        var dataUF = (currentGrid.pqGrid("option", "dataModel.dataUF")) ? currentGrid.pqGrid("option", "dataModel.dataUF") : [];
        data = data.concat(dataUF);
        dataUF = [];
        if (checkboxUrgently.checked) {
            buf = _filterUrgently(data, dataUF);
            data = buf.data;
            dataUF = buf.dataUF;
        }
        if (checkboxSpecControl.checked) {
            buf = _filterSpecControl(data, dataUF);
            data = buf.data;
            dataUF = buf.dataUF;
        }
        buf = _filterType(data, dataUF);
        data = buf.data;
        dataUF = buf.dataUF;
        currentGrid.pqGrid("option", "dataModel.data", data);
        currentGrid.pqGrid("option", "dataModel.dataUF", dataUF);
        eventGroupingOfDocumentRefreshView(checkboxGrouping);
    }

    function _filterSpecControl(data, dataUF) {
        var newData = [];
        data.forEach(function (item) {
            if (item.specControl == true) {
                newData.push(item);
            } else {
                dataUF.push(item);
            }
        });
        return {"data": newData, "dataUF": dataUF};
    }

    function _filterUrgently(data, dataUF) {
    	    	
        var toDay = new Date();
        var newData = [];
        toDay.setHours(0, 0, 0, 0);
        data.forEach(function (item) {
            if (item.duration && item.status != "Завершено" && toDay >= fromClientFormatDateToDate(item.duration)) {
                newData.push(item);
            } else {
                dataUF.push(item);
            }
        });
        return {"data": newData, "dataUF": dataUF};
    }

    function _filterType(data, dataUF) {
        var newData = [];
        var value = window.BTL["currentGrid"].find("select[name='type'] option:selected")[1].value;
        if (value != "") {
            data.forEach(function (item) {
                if (item.type == value) {
                    newData.push(item);
                } else {
                    dataUF.push(item);
                }
            });
        } else {
            newData = data;
        }
        return {"data": newData, "dataUF": dataUF};
    }

    function filterOnExecuteTasks(evt, ui) {
        var currentGrid = window.BTL["currentGrid"];
        var checkboxGrouping = currentGrid.find("input[name='grouping-of-document']")[0];
        var checkbox = currentGrid.find("input[name='TasksUrgently']")[0];
        var checkboxSpecControl = currentGrid.find("input[name='specialControl']")[0];
        var event = "^(?!Завершено).*";
        if (evt != null) {
            event = evt.currentTarget.value;
        }
        switch (event) {
            case "all":
                var filterObject = [{dataIndx: "status", condition: "regexp", value: ""}];
                currentGrid.pqGrid("option", "colModel").forEach(function( item ){
                    if(item.filter && item.dataIndx != "status"){
                        filterObject.push({dataIndx: item.dataIndx, condition: item.filter.condition, value: item.filter.value});
                    }
                });
                checkbox.checked = false;
                checkboxSpecControl.checked = false;
                currentGrid.pqGrid("filter", {oper: 'replace', data: filterObject});
                eventGroupingOfDocumentRefreshView(checkboxGrouping);
                break;
            case "closed":
                var filterObject = [{dataIndx: "status", condition: "regexp", value: "Завершено"}];
                currentGrid.pqGrid("option", "colModel").forEach(function( item ){
                    if(item.filter && item.dataIndx != "status"){
                        filterObject.push({dataIndx: item.dataIndx, condition: item.filter.condition, value: item.filter.value});
                    }
                });
                checkbox.checked = false;
                checkboxSpecControl.checked = false;
                currentGrid.pqGrid("filter", {oper: 'replace', data: filterObject});
/*                var data = (currentGrid.pqGrid("option", "dataModel.data")) ? currentGrid.pqGrid("option", "dataModel.data") : [];
                var dataUF = (currentGrid.pqGrid("option", "dataModel.dataUF")) ? currentGrid.pqGrid("option", "dataModel.dataUF") : [];
                data = data.concat(dataUF);
                var newDate = [];
                dataUF = [];
                data.forEach(function (item) {
                    if (item.status == "Завершено") {
                        newDate.push(item);
                        for (var i = 0, j = data.length; i < j; i++) {
                            if (item.parentNodeRef == data[i].nodeRef) {
                                newDate.push(data[i]);
                                break;
                            }
                        }
                    }
                });
                data.forEach(function (item) {
                    var isDataUF = true;
                    for (var i = 0, j = newDate.length; i < j; i++) {
                        if (item.nodeRef == newDate[i].nodeRef) {
                            isDataUF = false;
                            break;
                        }
                    }
                    if (isDataUF) {
                        dataUF.push(item);
                    }
                });
                currentGrid.pqGrid("option", "dataModel.data", newDate);
                currentGrid.pqGrid("option", "dataModel.dataUF", dataUF);*/
                eventGroupingOfDocumentRefreshView(checkboxGrouping);
                break;
            case "^(?!Завершено).*":
                var filterObject = [{dataIndx: "status", condition: "regexp", value: "^(?!Завершено).*"}];
                currentGrid.pqGrid("option", "colModel").forEach(function( item ){
                    if(item.filter && item.dataIndx != "status"){
                        filterObject.push({dataIndx: item.dataIndx, condition: item.filter.condition, value: item.filter.value});
                    }
                });
                checkbox.checked = false;
                checkboxSpecControl.checked = false;
                currentGrid.pqGrid("filter", {oper: 'replace', data: filterObject});
                /*var buf = {"date": [], "dataUf": []};
                var data = (currentGrid.pqGrid("option", "dataModel.data")) ? currentGrid.pqGrid("option", "dataModel.data") : [];
                var dataUF = (currentGrid.pqGrid("option", "dataModel.dataUF")) ? currentGrid.pqGrid("option", "dataModel.dataUF") : [];
                buf = _filterType(data, dataUF);
                data = buf.data;
                dataUF = buf.dataUF;
                currentGrid.pqGrid("option", "dataModel.data", data);
                currentGrid.pqGrid("option", "dataModel.dataUF", dataUF);*/
                eventGroupingOfDocumentRefreshView(checkboxGrouping);
                break;
/*            case "specControl":
                currentGrid.pqGrid("option", "colModel")[12].filter.value = "specControl";
                checkboxSpecControl.checked = true;
                var buf = {"date": [], "dataUf": []};
                var data = (currentGrid.pqGrid("option", "dataModel.data")) ? currentGrid.pqGrid("option", "dataModel.data") : [];
                var dataUF = (currentGrid.pqGrid("option", "dataModel.dataUF")) ? currentGrid.pqGrid("option", "dataModel.dataUF") : [];
                //data = data.concat(dataUF);
                //dataUF = [];
                if (checkbox.checked) {
                    buf = _filterUrgently(data, dataUF);
                    data = buf.data;
                    dataUF = buf.dataUF;
                }
                buf = _filterType(data, dataUF);
                data = buf.data;
                dataUF = buf.dataUF;
                buf = _filterSpecControl(data, dataUF);
                data = buf.data;
                dataUF = buf.dataUF;

                currentGrid.pqGrid("option", "dataModel.data", data);
                currentGrid.pqGrid("option", "dataModel.dataUF", dataUF);
                eventGroupingOfDocumentRefreshView(checkboxGrouping);
                break;
            case "urgently":
                currentGrid.pqGrid("option", "colModel")[12].filter.value = "urgently";
                checkbox.checked = true;
                var buf = {"date": [], "dataUf": []};
                var data = (currentGrid.pqGrid("option", "dataModel.data")) ? currentGrid.pqGrid("option", "dataModel.data") : [];
                var dataUF = (currentGrid.pqGrid("option", "dataModel.dataUF")) ? currentGrid.pqGrid("option", "dataModel.dataUF") : [];
                //data = data.concat(dataUF);
                //dataUF = [];
                if (checkboxSpecControl.checked) {
                    buf = _filterSpecControl(data, dataUF);
                    data = buf.data;
                    dataUF = buf.dataUF;
                }
                buf = _filterType(data, dataUF);
                data = buf.data;
                dataUF = buf.dataUF;
                buf = _filterUrgently(data, dataUF);
                data = buf.data;
                dataUF = buf.dataUF;

                currentGrid.pqGrid("option", "dataModel.data", data);
                currentGrid.pqGrid("option", "dataModel.dataUF", dataUF);
                eventGroupingOfDocumentRefreshView(checkboxGrouping);
                break;*/
            case "childrenClosed":
                currentGrid.pqGrid("option", "colModel")[13].filter.value = "childrenClosed";
                checkbox.checked = false;
                checkboxSpecControl.checked = false;
                var data = (currentGrid.pqGrid("option", "dataModel.data")) ? currentGrid.pqGrid("option", "dataModel.data") : [];
                var dataUF = (currentGrid.pqGrid("option", "dataModel.dataUF")) ? currentGrid.pqGrid("option", "dataModel.dataUF") : [];
                data = data.concat(dataUF);
                dataUF = [];
                var completeTasks = [];
                data.forEach(function (item) {
                    var isComplete = true;
                    // если это задача текущего исполнителя
                    if (item.nodeRef == item.parentNodeRef) {
                        for (var i = 0, j = data.length; i < j; i++) {
                            //если это дочерняя задача
                            if (item.nodeRef == data[i].parentNodeRef && item.nodeRef != data[i].nodeRef) {
                                if (data[i].status != "Завершено") {
                                    isComplete = false;
                                    break;
                                }
                            }
                        }
                        if (isComplete) {
                            completeTasks.push(item);
                        } else {
                            dataUF.push(item);
                        }
                    } else {
                        dataUF.push(item);
                    }
                });
                currentGrid.pqGrid("option", "dataModel.data", completeTasks);
                currentGrid.pqGrid("option", "dataModel.dataUF", dataUF);
                eventGroupingOfDocumentRefreshView(checkboxGrouping);
        }
    }

    var widthGridTasksAndDocuments = $('div.dashlet.tasks-and-documents').width() - $('#left-column-tasks-and-documents_dashlet').outerWidth(true) - 5;
    var heightGridTasksAndDocuments = $('div.dashlet.tasks-and-documents').height() - $('#filters-tasks-and-documents_dashlet').outerHeight(true) - 30;
    var dataModel = {
        location: "local",
        sorting: "local",
        dataType: "JSON",
        method: "GET",
        url: "/share/proxy/alfresco/tasks-and-documents/get-all?fun=newTasks",
        getData: function (response) {
            response = preProcessingDataGrid(response);
            return {data: response.items};
        }
    };

    function isDelegateMeTasks() {
        var curPartId = $('#left-column-tasks-and-documents_dashlet').children().find('div.active').attr('id');
        return curPartId.includes("delegateMe")/* || curPartId.includes("tasksFromMyDirector")*/;
    }

    var obj = {
        width: widthGridTasksAndDocuments, height: heightGridTasksAndDocuments,
        pageModel: {type: "local", rPP: 50, strRpp: "{0}", rPPOptions: [50, 250, 500]},
        filterModel: {on: true, mode: "AND", header: true},
        showTitle: false,
        toolbar: {
            cls: 'pq-toolbar-crud',
            items: [
                {type: '<span><input type="checkbox" name="grouping-of-document" onchange="eventGroupingOfDocument(this)" checked >Группировка по документу</span>'},
                {type: '<button onclick="_refreshGrid()" style="margin-left:20px;" type="button" title="Обновить " class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-icon-primary" role="button"><span class="ui-button-icon-primary ui-icon ui-icon-refresh"></span><span class="ui-button-text">Обновить</span></button>'}
            ]
        },
        editable: false,
        collapsible: false,
        showBottom: true,
        resizable: false,
        beforeFilter: function (event, ui) {
            var element = $grid.find('input[name="grouping-of-document"]')[0];
            eventGroupingOfDocumentRefreshView(element);
        },
        beforeSort: function (event, ui) {
            window.BTL["currentGrid"].pqGrid("option", "dataModel.sortIndx", [ui.dataIndx ]);
        },
        rowDblClick: function (event, ui) {

        	ui.rowData.rowIndx = ui.rowIndx;

            // createAndShowForm(ui.rowData.nodeRef, {formId:"negotiationForm"});
        	taskAndDocumentOpenModalRowData(ui.rowData, {isCompleteMe: isDelegateMeTasks()});

            require(["dojo/topic"], function (topic) {
                topic.publish("ALF_DISPLAY_NOTIFICATION", {message: "Перенаправление на задачу."});
            });
        },
        
        cellClick: function( event, ui ) {

        	ui.rowData.rowIndx = ui.rowIndx;

            if (ui.dataIndx == "name_a") {
                taskAndDocumentOpenModalRowData(ui.rowData, {isCompleteMe: isDelegateMeTasks()});
            }
        	/*else if (ui.dataIndx == "doc_a")
            {
                var urlLocation = ui.rowData.docHref;
                if (urlLocation != "")
                {
                    openModalTaskAndDocument(ui.rowData.nodeRef, ui.rowData.status, urlLocation, ui.rowData);
                }
            }*/



        }
        
    };

    obj.colModel = [
        {
            title: "Тип задачи", minWidth: 150, dataType: "string", dataIndx: "type",
            filter: {
                type: "select",
                condition: 'equal',
                valueIndx: "type",
                labelIndx: "type",
                prepend: {'': ''},
                options: [
                    {"Резолюция по входящему": "Резолюция по входящему"},
                    {"Задание по исходящему": "Задание по исходящему"},
                    {"Резолюция по внутреннему": "Резолюция по внутреннему"},
                    {"Задание по проекту": "Задание по проекту"},
                    {"Инициативное задание": "Инициативное задание"},
                    {"Согласование": "Согласование"},
                    {"Изменение сроков": "Изменение сроков"},
                    {"Подписание": "Подписание"},
                    {"Ознакомление": "Ознакомление"}
                ],
                listeners: ['change'],
                init: function () {
                    $(this).pqSelect({singlePlaceholder: 'Все', searchRule: "contain", width: '100%'});
                }
            }
        },
        {title: "", minWidth: 30, dataType: "string", align: "center", dataIndx: "level", hidden: true},
        {title: "Файл", minWidth: 40, dataType: "string", dataIndx: "existFile"},
        {
            title: "Наименование задачи", width: 200, dataType: documentType, dataIndx: "name_a",
            filter: {type: 'textbox', condition: 'contain', listeners: ['keyup']},
            cls:'klickedColl'
        },
        {title: "Родительская задача", width: 150, dataType: "string", dataIndx: "parentTaskNameValue", hidden: true},
        {
            title: "Документ/Проект", width: 200, dataType: documentType, dataIndx: "doc", hidden: true
           // filter: {type: 'textbox', condition: 'contain', listeners: ['keyup']}
        },
        {
            title: "Документ/Проект", width: 200, dataType: documentType, dataIndx: "doc_a",
            filter: {type: 'textbox', condition: 'contain', listeners: ['keyup']}
        },
        {title: "Режим исполнения", minWidth: 80, width: 80, dataType: "string", dataIndx: "runtime", hidden: true},
        {
            title: "Дата регистрации", minWidth: 160, width: 160, dataType: "date", dataIndx: "regDate",
            filter: {type: 'textbox', condition: "between", init: pqDatePicker, listeners: ['change']}
        },
        {
            title: "Инициатор", minWidth: 90, width: 110, dataType: "string", dataIndx: "author",
            filter: {type: 'textbox', condition: 'begin', listeners: ['keyup']}
        },
        {
            title: "Исполнитель", minWidth: 90, width: 110, dataType: "string", dataIndx: "executor",
            filter: {type: 'textbox', condition: 'begin', listeners: ['keyup']}
        },
        {title: "ШИФР", minWidth: 50, width: 70, dataType: "string", dataIndx: "cipher"},
        {
            title: "Срок исполнения", minWidth: 160, width: 160, dataType: "date", dataIndx: "duration",
            filter: {type: 'textbox', condition: "between", init: pqDatePicker, listeners: ['change']}
        },
        {
            title: "Контрагент", minWidth: 80, width: 150, dataType: "string", dataIndx: "contractor",
            filter: {type: 'textbox', condition: 'contain', listeners: ['keyup']}
        },
        {
            title: "Статус", minWidth: 100, width: 200, dataType: "string", dataIndx: "status",
            filter: {
                type: "select",
                condition: "regexp",
                options: [{"^(?!Завершено).*": "Активные"}, {"Завершено": "Завершеные"}, {"": "Все"}],
                value: "^(?!Завершено).*",
                listeners: ['change']
            }
        },
        {title: "", width: 0, dataType: documentType, dataIndx: "doc_group", hidden: true},
        {title: "", width: 0, dataType: "string", dataIndx: "parentNodeRef", hidden: true},
        {title: "", width: 0, dataType: "string", dataIndx: "nodeRef", hidden: true},
        {title: "", width: 0, dataType: "string", dataIndx: "specControl", hidden: true,
            filter: {
                type: "select",
                condition: "equal",
                options: [{"": "все"}, {"true": "Специальный контроль"}, {"false": "Без контроля"}],
                value: "",
                listeners: ['change']
            }
        },
        {title: "", width: 0, dataType: "string", dataIndx: "urgently", hidden: true,
            filter: {
                type: "select",
                condition: "equal",
                options: [{"": "все"}, {"true": "Срочно"}, {"false": "Не срочно"}],
                value: "",
                listeners: ['change']
            }
        },
        {title: "", width: 1, dataType: "string"}
    ];
    obj.dataModel = dataModel;

    
    

    var dataModelMail = {

    		location: "remote",
            sorting: "local",
            dataType: "JSON",
            method: "GET",
            url: "/share/proxy/alfresco/mailMessage/getMessage",
            getData: function (response) {
                response = preProcessingDataGrid(response);
                return {data: response.items};
            }
        };

    var objMails = {
    		selectionModel: {type: 'none', subtype: 'incr', cbHeader: false, cbAll: true},
            width: widthGridTasksAndDocuments, height: heightGridTasksAndDocuments,
            pageModel: {type: "local", rPP: 100, strRpp: "{0}", rPPOptions: [50, 250, 500]},
            filterModel: {on: true, mode: "AND", header: true},
            showTitle: false,
            toolbar: {
                cls: 'pq-toolbar-crud',
                items: [
                    {type: '<button ' +
                    			' onclick="_refreshGrid()" style="margin-left:20px;"'+  
                    			' type="button" '+ 
                    			' title="Обновить "'+  
                    			' class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-icon-primary"'+  
                    			' role="button">'+ 
                    			' <span class="ui-button-icon-primary ui-icon ui-icon-refresh"></span><span class="ui-button-text">Обновить</span>'+ 
                    		' </button>' +
                    		'<button ' +
	                			' onclick="_deleteSelectedMails()" style="margin-left:20px;"'+  
	                			' type="button" '+ 
	                			' title="Удалить выбранные"'+  
	                			' class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-icon-primary"'+  
	                			' role="button">'+ 
	                			' <span class="ui-button-icon-primary ui-icon ui-icon-cancel"></span><span class="ui-button-text">Удалить выбранные</span>'+ 
	                		' </button>'
                     } 
                ]
            },
            editable: false,
            collapsible: false,
            showBottom: true,
            resizable: false,
            beforeFilter: function (evt, ui) {
            	document.refreshGrid();
            },
            
            beforeSort: function (event, ui) {
                window.BTL["currentGrid"].pqGrid("option", "dataModel.sortIndx", [ui.dataIndx ]);
            },
            rowDblClick: function (event, ui) {
            	ui.rowData.rowIndx = ui.rowIndx;
            	openModalTaskAndDocument(ui.rowData.nodeRef, "", "/share/page/arm/mailMessage?nodeRef=" + ui.rowData.nodeRef, ui.rowData);
            }        
        };

        objMails.colModel = [
            {
            	title: "<input type='checkbox' id='selAllMail' class='selAllMails' onclick='_selAllMails(this)'>",
                dataIndx: "sel",
                width: 30,
                align: "center",
                type: 'checkBoxSelection',
                cls: 'ui-state-default',
                resizable: false,
                sortable: false
            },
            {title: "Файл", minWidth: 40, dataType: "string", dataIndx: "fileExists", sortable: false, resizable: false},                        
            {title: "Рег. Номер", minWidth: 100, width: 150, dataType: "string", dataIndx: "regNum", hidden: true},                       
            {
                title: "Тема", width: 400, dataType: "string", dataIndx: "theme",  
                filter: {type: 'textbox', condition: 'contain', listeners: ['change']}
            },
            {
                title: "Отправитель", width: 200, dataType: "string", dataIndx: "author-content", 
                filter: {type: 'textbox', condition: 'contain', listeners: ['change']}
            },
    		{
                title: "Получатель", width: 200, dataType: "string", dataIndx: "recipients-content", 
                filter: {type: 'textbox', condition: 'contain', listeners: ['change']}
            },
            {
            	title: "Дата отправки", minWidth: 100, width: 150, dataType: "date", dataIndx: "regDate",
            	filter: {type: 'textbox', condition: "between", init: pqDatePicker, listeners: ['change']}
            	
            },
            {
            	title: "Время отправки", minWidth: 100, width: 150, dataType: "string", dataIndx: "regTime"
            	
            },
            {title: "", width: 1, dataType: "string", sortable: false}
           
        ];
        objMails.dataModel = dataModelMail;
    
    //Отрисовка меню
    renderMenu();
//-----------------------------------Grid waitingCompletes---------------------------------------------------------
    var isWaitingCompletesGrid = $("#grid-tasks-and-documents_dashlet-waitingCompletes");
    if (isWaitingCompletesGrid) {
        window.BTL["waitingCompletes"] = isWaitingCompletesGrid.pqGrid($.extend(true, {}, obj));
        window.BTL["waitingCompletes"].pqGrid("option", "colModel")[13].filter = null;
        window.BTL["waitingCompletes"].pqGrid("option", "colModel")[13].filter = {
            type: 'select',
            condition: 'equal',
            valueIndx: "status",
            labelIndx: "status",
            prepend: {'': ''},
            listeners: ["change"],
            init: function () {
                $(this).pqSelect({singlePlaceholder: 'Все', searchRule: "contain", width: '100%'});
            }
        }
    }
//-----------------------------------Grid newTasks---------------------------------------------------------
    var isNewTasksGrid = $("#grid-tasks-and-documents_dashlet-newTasks");
    if (isNewTasksGrid) {
        window.BTL["newTasksGrid"] = isNewTasksGrid.pqGrid($.extend(true, {}, obj));
        window.BTL["newTasksGrid"].pqGrid("option", "colModel")[13].filter = null;
        window.BTL["newTasksGrid"].pqGrid("option", "colModel")[13].filter = {
            type: 'select',
            condition: 'equal',
            valueIndx: "status",
            labelIndx: "status",
            prepend: {'': ''},
            listeners: ["change"],
            init: function () {
                $(this).pqSelect({singlePlaceholder: 'Все', searchRule: "contain", width: '100%'});
            }
        }
    }
//-----------------------------------Grid inWorkTasks---------------------------------------------------------
    var isInWorkTasks = $("#grid-tasks-and-documents_dashlet-inWorkTasks");
    if (isInWorkTasks) {
        var objInWorkTasks = $.extend(true, {}, obj);

        objInWorkTasks.toolbar.items.splice(1, 0,
            {type: '<span style="color:#fb3838"> <span class="pq-separator"></span> <input type="checkbox" name="TasksUrgently"> <u> Срочные документы </u> </input> <span class="pq-separator"></span> </span>'});
        objInWorkTasks.toolbar.items.splice(2, 0,
            {type: '<span style="color:#fb3838"> <input type="checkbox" name="specialControl"> <u> Особый контроль </u> </input> <span class="pq-separator"></span> </span>'});

        window.BTL["inWorkTasks"] = isInWorkTasks.pqGrid(objInWorkTasks);
        window.BTL["inWorkTasks"].pqGrid("option", "colModel")[13].filter = null;
        window.BTL["inWorkTasks"].pqGrid("option", "colModel")[13].filter = {
            type: 'select',
            condition: 'equal',
            valueIndx: "status",
            labelIndx: "status",
            prepend: {'': ''},
            listeners: ["change"],
            init: function () {
                $(this).pqSelect({singlePlaceholder: 'Все', searchRule: "contain", width: '100%'});
            }
        }
        $("#grid-tasks-and-documents_dashlet-inWorkTasks input[name='specialControl']").change(changeSpecialControl);
        $("#grid-tasks-and-documents_dashlet-inWorkTasks input[name='TasksUrgently']").change(changeTasksUrgently);
    }
//-----------------------------------Grid assignedTasks---------------------------------------------------------
    var isAssignedTasks = $("#grid-tasks-and-documents_dashlet-assignedTasks");
    if (isAssignedTasks) {
        var objOnAssignedTasks = $.extend(true, {}, obj);
        objOnAssignedTasks.toolbar.items.splice(1, 0,
            {type: '<span style="color:#fb3838"> <span class="pq-separator"></span> <input type="checkbox" name="TasksUrgently"> <u> Срочные документы </u> </input> <span class="pq-separator"></span> </span>'});
        objOnAssignedTasks.toolbar.items.splice(2, 0,
            {type: '<span style="color:#fb3838"> <input type="checkbox" name="specialControl"> <u> Особый контроль </u> </input> <span class="pq-separator"></span> </span>'});

        window.BTL["assignedTasks"] = isAssignedTasks.pqGrid(objOnAssignedTasks);
        window.BTL["assignedTasks"].pqGrid("option", "colModel")[13].filter = null;
        window.BTL["assignedTasks"].pqGrid("option", "colModel")[13].filter = {
            type: "select",
            condition: "regexp",
            options: [{"^(?!Завершено).*": "Активные"}, {"all": "Все"}],
            value: "^(?!Завершено).*",
            listeners: [{'change': filterOnExecuteTasks}]
        };
        window.BTL["assignedTasks"].pqGrid("option", "colModel")[0].filter = null;
        window.BTL["assignedTasks"].pqGrid("option", "colModel")[0].filter = {
            type: "select",
            condition: 'equal',
            valueIndx: "type",
            labelIndx: "type",
            prepend: {'': ''},
            options: [{"Резолюция по входящему": "Резолюция по входящему"},
                {"Задание по исходящему": "Задание по исходящему"},
                {"Резолюция по внутреннему": "Резолюция по внутреннему"},
                {"Задание по проекту": "Задание по проекту"},
                {"Инициативное задание": "Инициативное задание"},
                {"Согласование": "Согласование"},
                {"Изменение сроков": "Изменение сроков"},
                {"Подписание": "Подписание"},
                {"Ознакомление": "Ознакомление"}
            ],
            listeners: ['change'],
            init: function () {
                $(this).pqSelect({singlePlaceholder: 'Все', searchRule: "contain", width: '100%'});
            }
        };
        $("#grid-tasks-and-documents_dashlet-assignedTasks input[name='specialControl']").change(changeSpecialControl);
        $("#grid-tasks-and-documents_dashlet-assignedTasks input[name='TasksUrgently']").change(changeTasksUrgently);
    }
//-----------------------------------Grid onExecuteTasks---------------------------------------------------------
    var isOnExecuteTasks = $("#grid-tasks-and-documents_dashlet-onExecuteTasks");
    if (isOnExecuteTasks) {
        var objOnExecuteTasks = $.extend(true, {}, obj);
        objOnExecuteTasks.toolbar.items.splice(1, 0,
            {type: '<span style="color:#fb3838"> <span class="pq-separator"></span> <input type="checkbox" name="TasksUrgently"> <u> Срочные документы </u> </input> <span class="pq-separator"></span> </span>'});
        objOnExecuteTasks.toolbar.items.splice(2, 0,
            {type: '<span style="color:#fb3838"> <input type="checkbox" name="specialControl"> <u> Особый контроль </u> </input> <span class="pq-separator"></span> </span>'});

        window.BTL["onExecuteTasks"] = isOnExecuteTasks.pqGrid(objOnExecuteTasks);
        window.BTL["onExecuteTasks"].pqGrid("option", "colModel")[13].filter = null;
        window.BTL["onExecuteTasks"].pqGrid("option", "colModel")[13].filter = {
            type: "select",
            condition: "regexp",
            options: [{"^(?!Завершено).*": "Активные"}, {"closed": "Завершеные"}, {"all": "Все"}, {"childrenClosed": "Все завершены"}],
            value: "^(?!Завершено).*",
            listeners: [{'change': filterOnExecuteTasks}]
        };
        window.BTL["onExecuteTasks"].pqGrid("option", "colModel")[0].filter = null;
        window.BTL["onExecuteTasks"].pqGrid("option", "colModel")[0].filter = {
            type: "select",
            condition: 'equal',
            valueIndx: "type",
            labelIndx: "type",
            prepend: {'': ''},
            options: [{"Резолюция по входящему": "Резолюция по входящему"},
                {"Задание по исходящему": "Задание по исходящему"},
                {"Резолюция по внутреннему": "Резолюция по внутреннему"},
                {"Задание по проекту": "Задание по проекту"},
                {"Инициативное задание": "Инициативное задание"},
                {"Согласование": "Согласование"},
                {"Изменение сроков": "Изменение сроков"},
                {"Подписание": "Подписание"},
                {"Ознакомление": "Ознакомление"}
            ],
            listeners: ['change'],
            init: function () {
                $(this).pqSelect({singlePlaceholder: 'Все', searchRule: "contain", width: '100%'});
            }
        };
        window.BTL["onExecuteTasks"].pqGrid({
            beforeSort: function (event, ui) {
                window.BTL["onExecuteTasks"].pqGrid("option", "dataModel.sortIndx", [ui.dataIndx ]);
                var isGrouping = $("#grid-tasks-and-documents_dashlet-onExecuteTasks input[name='grouping-of-document']")[0].checked;
                if (!isGrouping) {
                    var sortIndx = window.BTL["onExecuteTasks"].pqGrid("option", "dataModel.sortIndx");
                    var index = sortIndx.indexOf("parentTaskNameValue");
                    if (index > -1) {
                        sortIndx.splice(index, 1);
                        window.BTL["onExecuteTasks"].pqGrid("option", "dataModel.sortIndx", sortIndx);
                    }
                }
            }
        });

        $("#grid-tasks-and-documents_dashlet-onExecuteTasks input[name='TasksUrgently']").change(changeTasksUrgently);
        $("#grid-tasks-and-documents_dashlet-onExecuteTasks input[name='specialControl']").change(changeSpecialControl);
    }
//-----------------------------------Grid onControlTasks---------------------------------------------------------
    var isOnControlTasks = $("#grid-tasks-and-documents_dashlet-onControlTasks");
    if (isOnControlTasks) {
        var objOnControlTasks = $.extend(true, {}, obj);
        objOnControlTasks.toolbar.items.splice(1, 0,
            {type: '<span style="color:#fb3838"> <span class="pq-separator"></span> <input type="checkbox" name="TasksUrgently"> <u> Срочные документы </u> </input> <span class="pq-separator"></span> </span>'});
        objOnControlTasks.toolbar.items.splice(2, 0,
            {type: '<span style="color:#fb3838"> <input type="checkbox" name="specialControl"> <u> Особый контроль </u> </input> <span class="pq-separator"></span> </span>'});

        window.BTL["onControlTasks"] = isOnControlTasks.pqGrid(objOnControlTasks);
        window.BTL["onControlTasks"].pqGrid("option", "colModel")[13].filter = null;
        window.BTL["onControlTasks"].pqGrid("option", "colModel")[13].filter = {
            type: 'select',
            condition: 'equal',
            valueIndx: "status",
            labelIndx: "status",
            prepend: {'': ''},
            listeners: ["change"],
            init: function () {
                $(this).pqSelect({singlePlaceholder: 'Все', searchRule: "contain", width: '100%'});
            }
        };
        
        window.BTL["onControlTasks"].onlyActive = true;
        $("#grid-tasks-and-documents_dashlet-onControlTasks input[name='TasksUrgently']").change(changeTasksUrgently);
        $("#grid-tasks-and-documents_dashlet-onControlTasks input[name='specialControl']").change(changeSpecialControl);
    }
//-----------------------------------Grid delegateTasks---------------------------------------------------------
    //window.BTL["delegateTasks"] = $("#grid-tasks-and-documents_dashlet-delegateTasks").pqGrid( $.extend(true, {}, obj) );
//-----------------------------------Grid draftTasks---------------------------------------------------------
    var isDraftTasks = $("#grid-tasks-and-documents_dashlet-draftTasks");
    if (isDraftTasks) {
        window.BTL["draftTasks"] = isDraftTasks.pqGrid($.extend(true, {}, obj));
        window.BTL["draftTasks"].pqGrid("option", "colModel")[13].filter = null;
    }
//-----------------------------------Grid completeMe---------------------------------------------------------
    
    
    	var objComplete = {
            width: widthGridTasksAndDocuments, height: heightGridTasksAndDocuments,
            pageModel: {type: "local", rPP: 50, strRpp: "{0}", rPPOptions: [50, 250, 500]},
            filterModel: {on: true, mode: "AND", header: true},
            showTitle: false,
            toolbar: {
                cls: 'pq-toolbar-crud',
                items: [
                    {type: '<span><input type="checkbox" name="grouping-of-document" onchange="eventGroupingOfDocument(this)" checked >Группировка по документу</span>'},
                    {type: '<button onclick="refreshGrid()" style="margin-left:20px;" type="button" title="Обновить " class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-icon-primary" role="button"><span class="ui-button-icon-primary ui-icon ui-icon-refresh"></span><span class="ui-button-text">Обновить</span></button>'}
                ]
            },
            editable: false,
            collapsible: false,
            showBottom: true,

            resizable: false,
            beforeFilter: function (event, ui) {
                var element = $grid.find('input[name="grouping-of-document"]')[0];
                eventGroupingOfDocumentRefreshView(element);
            },
            beforeSort: function (event, ui) {
                window.BTL["currentGrid"].pqGrid("option", "dataModel.sortIndx", [ui.dataIndx ]);
            },
            rowDblClick: function (event, ui) {
                openForm(ui.rowData);
                require(["dojo/topic"], function (topic) {
                    topic.publish("ALF_DISPLAY_NOTIFICATION", {message: "Перенаправление на задачу."});
                });
            },
            cellClick: function( event, ui ) {
                openForm(ui.rowData);
            }
        };

        objComplete.colModel = [
            {
                title: "Тип задачи", minWidth: 150, dataType: "string", dataIndx: "type",
                filter: {
                    type: "select",
                    condition: 'equal',
                    valueIndx: "type",
                    labelIndx: "type",
                    prepend: {'': ''},
                    options: [{"Резолюция по входящему": "Резолюция по входящему"},
                        {"Задание по исходящему": "Задание по исходящему"},
                        {"Резолюция по внутреннему": "Резолюция по внутреннему"},
                        {"Задание по проекту": "Задание по проекту"},
                        {"Инициативное задание": "Инициативное задание"},
                        {"Согласование": "Согласование"},
                        {"Изменение сроков": "Изменение сроков"},
                        {"Подписание": "Подписание"},
                        {"Ознакомление": "Ознакомление"}
                    ],
                    listeners: ['change'],
                    init: function () {
                        $(this).pqSelect({singlePlaceholder: 'Все', searchRule: "contain", width: '100%'});
                    }
                }
            },
            {title: "", minWidth: 30, dataType: "string", align: "center", dataIndx: "level", hidden: true},
            {title: "Файл", minWidth: 40, dataType: "string", dataIndx: "existFile"},
            {
                title: "Наименование задачи", width: 200, dataType: documentType, dataIndx: "name_a",
                filter: {type: 'textbox', condition: 'contain', listeners: ['keyup']}
            },
            {title: "Родительская задача", width: 150, dataType: "string", dataIndx: "parentTaskNameValue", hidden: true},
            {
                title: "Документ/Проект", width: 200, dataType: documentType, dataIndx: "doc",
                filter: {type: 'textbox', condition: 'contain', listeners: ['keyup']}
            },
            {title: "Режим исполнения", minWidth: 80, width: 80, dataType: "string", dataIndx: "runtime"},
            {
                title: "Инициатор", minWidth: 90, width: 110, dataType: "string", dataIndx: "author",
                filter: {type: 'textbox', condition: 'begin', listeners: ['keyup']}
            },
            {
                title: "Исполнитель", minWidth: 90, width: 110, dataType: "string", dataIndx: "executor",
                filter: {type: 'textbox', condition: 'begin', listeners: ['keyup']}
            },
            {title: "ШИФР", minWidth: 50, width: 70, dataType: "string", dataIndx: "cipher"},
            {
                title: "Срок исполнения", minWidth: 160, width: 160, dataType: "date", dataIndx: "duration",
                filter: {type: 'textbox', condition: "between", init: pqDatePicker, listeners: ['change']}
            },
            {
                title: "Фактическая дата завершения", minWidth: 160, width: 160, dataType: "date", dataIndx: "durationActual",
                filter: {type: 'textbox', condition: "between", init: pqDatePicker, listeners: ['change']}
            },
            {
                title: "Контрагент", minWidth: 80, width: 150, dataType: "string", dataIndx: "contractor",
                filter: {type: 'textbox', condition: 'contain', listeners: ['keyup']}
            },
            {
                title: "Статус", minWidth: 100, width: 200, dataType: "string", dataIndx: "status",
                filter: {
                    type: "select",
                    condition: "regexp",
                    options: [{"^(?!Завершено).*": "Активные"}, {"Завершено": "Завершеные"}, {"": "Все"}],
                    value: "^(?!Завершено).*",
                    listeners: ['change']
                }
            },
            {title: "", width: 0, dataType: documentType, dataIndx: "doc_group", hidden: true},
            {title: "", width: 0, dataType: "string", dataIndx: "parentNodeRef", hidden: true},
            {title: "", width: 0, dataType: "string", dataIndx: "nodeRef", hidden: true},
            {title: "", width: 0, dataType: "string", dataIndx: "specControl", hidden: true,
                filter: {
                    type: "select",
                    condition: "equal",
                    options: [{"": "все"}, {"true": "Специальный контроль"}, {"false": "Без контроля"}],
                    value: "",
                    listeners: ['change']
                }
            },
            {title: "", width: 0, dataType: "string", dataIndx: "urgently", hidden: true,
                filter: {
                    type: "select",
                    condition: "equal",
                    options: [{"": "все"}, {"true": "Срочно"}, {"false": "Не срочно"}],
                    value: "",
                    listeners: ['change']
                }
            },
            {title: "", width: 1, dataType: "string"}
        ];
        objComplete.dataModel = dataModel;

    var isCompleteMe = $("#grid-tasks-and-documents_dashlet-completeMe");
    if (isCompleteMe) {
        window.BTL["completeMe"] = isCompleteMe.pqGrid($.extend(true, {}, objComplete));
        window.BTL["completeMe"].pqGrid("option", "colModel")[13].filter = null;
    }
//-----------------------------------Grid completeFromMe---------------------------------------------------------
    var isCompleteFromMe = $("#grid-tasks-and-documents_dashlet-completeFromMe");
    if (isCompleteFromMe) {
        window.BTL["completeFromMe"] = isCompleteFromMe.pqGrid($.extend(true, {}, objComplete));
        window.BTL["completeFromMe"].pqGrid("option", "colModel")[13].filter = null;
    }
//-----------------------------------Grid delegateTasks---------------------------------------------------------
    var isDelegate = $("#grid-tasks-and-documents_dashlet-delegate");
    if (isDelegate) {
        window.BTL["delegateMeTasks"] = isDelegate.pqGrid($.extend(true, {}, obj));
        window.BTL["delegateMeTasks"].pqGrid("option", "colModel")[13].filter = null;
        window.BTL["delegateMeTasks"].pqGrid("option", "colModel")[13].filter = {
            type: 'select',
            condition: 'equal',
            valueIndx: "status",
            labelIndx: "status",
            prepend: {'': ''},
            listeners: ["change"],
            init: function () {
                $(this).pqSelect({singlePlaceholder: 'Все', searchRule: "contain", width: '100%'});
            }
        }
    }
//----------------------------------------------------------------------------------------------------------------------

//-----------------------------------Grid tasksFromMyDirector---------------------------------------------------------
    var isTasksFromMyDirector = $("#grid-tasks-and-documents_dashlet-tasksFromMyDirector");
    if (isTasksFromMyDirector) {
        window.BTL["tasksFromMyDirector"] = isTasksFromMyDirector.pqGrid($.extend(true, {}, obj));
        window.BTL["tasksFromMyDirector"].pqGrid("option", "colModel")[13].filter = null;
        window.BTL["tasksFromMyDirector"].pqGrid("option", "colModel")[13].filter = {
            type: 'select',
            condition: 'equal',
            valueIndx: "status",
            labelIndx: "status",
            prepend: {'': ''},
            listeners: ["change"],
            init: function () {
                $(this).pqSelect({singlePlaceholder: 'Все', searchRule: "contain", width: '100%'});
            }
        }
    }
//----------------------------------------------------------------------------------------------------------------------

    function changeTasksUrgently(event) {
    	
        var currentGrid = window.BTL["currentGrid"];
        var filterObject = [];
        var checkboxGrouping = currentGrid.find("input[name='grouping-of-document']")[0];
        currentGrid.pqGrid("option", "colModel").forEach(function( item ){
            if(item.filter && item.dataIndx != "urgently"){
                filterObject.push({dataIndx: item.dataIndx, condition: item.filter.condition, value: item.filter.value});
            }
        });

        if (this.checked) {
             filterObject.push({dataIndx: "urgently", condition: "equal", value: "true"});
        }else{
            filterObject.push({dataIndx: "urgently", condition: "equal", value: ""});
        }

        currentGrid.pqGrid("filter", {oper: 'replace', data: filterObject});
        currentGrid.pqGrid("refreshView",{header: false});
        eventGroupingOfDocumentRefreshView(checkboxGrouping);
    }

    function changeSpecialControl(event) {
        var currentGrid = window.BTL["currentGrid"];
        var filterObject = [];
        var checkboxGrouping = currentGrid.find("input[name='grouping-of-document']")[0];
        currentGrid.pqGrid("option", "colModel").forEach(function( item ){
            if(item.filter && item.dataIndx != "specControl"){
                filterObject.push({dataIndx: item.dataIndx, condition: item.filter.condition, value: item.filter.value});
            }
        });

        if (this.checked) {
            filterObject.push({dataIndx: "specControl", condition: "equal", value: "true"});
        }else{
            filterObject.push({dataIndx: "specControl", condition: "equal", value: ""});
        }

        currentGrid.pqGrid("filter", {oper: 'replace', data: filterObject});
        currentGrid.pqGrid("refreshView",{header: false});
        eventGroupingOfDocumentRefreshView(checkboxGrouping);
    }

//=====================================Docs=========================================================================
    heightGridTasksAndDocuments = $('div.dashlet.tasks-and-documents').height() - 40;

    var objDocs = {
        width: widthGridTasksAndDocuments, height: heightGridTasksAndDocuments,
        filterModel: {on: true, mode: "AND", header: true},
        pageModel: {type: "local", rPP: 50, strRpp: "{0}", rPPOptions: [50, 250, 500]},
        showTitle: false,
        toolbar: {
            cls: 'pq-toolbar-crud',
            items: [
                {type: '<button onclick="_refreshGrid()" style="margin-left:5px; display: block;" type="button" title="Обновить " class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-icon-primary" role="button"><span class="ui-button-icon-primary ui-icon ui-icon-refresh"></span><span class="ui-button-text">Обновить</span></button>'}
            ]
        },
        rowDblClick: function (event, ui) {
            var changedForm = false;
            var formId = null;
            var href = "";
            if(ui.rowData && ui.rowData.type === "Договор"){
             href = "/share/page/arm/contract?nodeRef=" + ui.rowData.nodeRef;
            }else {
                if ($("#menu-consideration-tasks-and-documents_dashlet").hasClass("active") ||
                    $("#menu-delegateConsideration-tasks-and-documents_dashlet").hasClass("active")) {
                    href = "/share/page/btl-review?nodeRef=" + ui.rowData.nodeRef;
                    changedForm = true;
                    formId = "reviewForm";
                }else{
                    href = "/share/page/btl-edit-metadata?nodeRef=" + ui.rowData.nodeRef;
                }
            }
            if(changedForm){
                createAndShowForm(ui.rowData.nodeRef, {formId:formId});
            }else{
                window.location.href = href;
            }
            require(["dojo/topic"], function (topic) {
                topic.publish("ALF_DISPLAY_NOTIFICATION", {message: "Перенаправление на документ."});
            });
        },
        load: function (event, ui) {
            $grid.find("select[name='status']").change();
        },
        beforeSort: function (event, ui) {
            window.BTL["currentGrid"].pqGrid("option", "dataModel.sortIndx", [ui.dataIndx ]);
        },
        editable: false,
        collapsible: false,
        showBottom: true,
        resizable: false
    };

    objDocs.colModel = [
        {
            title: "Вид документа", minWidth: 150, dataType: "string", dataIndx: "type",
            filter: {
                type: "select",
                condition: "equal",
                valueIndx: "type",
                labelIndx: "type",
                prepend: {'': ''},
                value: "",
                listeners: ['change'],
                init: function () {
                    $(this).pqSelect({singlePlaceholder: 'Все', searchRule: "contain", width: '100%'});
                }
            }
        },
        {
            title: "Тип", minWidth: 80, width: 150, dataType: "string", align: "center", dataIndx: "level",
            filter: {
                type: "select",
                condition: "equal",
                valueIndx: "level",
                labelIndx: "level",
                prepend: {'': ''},
                value: "",
                listeners: ['change'],
                init: function () {
                    $(this).pqSelect({singlePlaceholder: 'Все', searchRule: "contain", width: '100%'});
                }
            }},
        {title: "Файл", minWidth: 40, dataType: "string", dataIndx: "existFile"},
        {title: "Наименование", width: 200, dataType: "string", dataIndx: "name"},
        {title: "Дата регистрации", minWidth: 100, width: 150, dataType: "date", dataIndx: "regDate"},
        {title: "Рег. Номер", minWidth: 100, width: 150, dataType: "string", dataIndx: "regNum"},
        {
            title: "Инициатор", minWidth: 100, width: 150, dataType: "string", dataIndx: "author",
            filter: {type: 'textbox', condition: 'begin', listeners: ['keyup']}
        },
        {
            title: "Статус", minWidth: 100, width: 200, dataType: "string", dataIndx: "status",
            filter: {
                type: 'select',
                condition: 'equal',
                valueIndx: "status",
                labelIndx: "status",
                prepend: {'': ''},
                listeners: ["change"],
                init: function () {
                    $(this).pqSelect({singlePlaceholder: 'Все', searchRule: "contain", width: '100%'});
                }
            }
        },
        {title: "", width: 1, dataType: "string"}
    ];

    objDocs.dataModel = {};
//-----------------------------------Grid draftDocs---------------------------------------------------------
    var isDraftDocs = $("#grid-tasks-and-documents_dashlet-draftDocs");
    if (isDraftDocs) {
        window.BTL["draftDocs"] = isDraftDocs.pqGrid($.extend(true, {}, objDocs));
        window.BTL["draftDocs"].pqGrid("option", "colModel")[1].filter = null;
        window.BTL["draftDocs"].pqGrid("option", "colModel")[7].filter = null;
    }
//-----------------------------------Grid considerationDocs---------------------------------------------------------
    var oldColModel = objDocs.colModel;
    objDocs.colModel = [
        {
            title: "Вид документа", minWidth: 150, dataType: "string", dataIndx: "type",
            filter: {
                type: "select",
                condition: "equal",
                valueIndx: "type",
                labelIndx: "type",
                prepend: {'': ''},
                value: "",
                listeners: ['change'],
                init: function () {
                    $(this).pqSelect({singlePlaceholder: 'Все', searchRule: "contain", width: '100%'});
                }
            }
        },
        {

            title: "Тип", minWidth: 80, width: 150, dataType: "string", align: "center", dataIndx: "level",
            filter: {
                type: "select",
                condition: "equal",
                valueIndx: "level",
                labelIndx: "level",
                prepend: {'': ''},
                value: "",
                listeners: ['change'],
                init: function () {
                    $(this).pqSelect({singlePlaceholder: 'Все', searchRule: "contain", width: '100%'});
                }
            }
        },
        {
            title: "Наименование", minWidth: 200, width: 350, dataType: "string", dataIndx: "name",
            filter: {type: 'textbox', condition: 'contain', listeners: ['keyup']}
        },
        {
            title: "Дата регистрации", minWidth: 100, width: 180, dataType: "date", dataIndx: "regDate",
            filter: {type: 'textbox', condition: "between", init: pqDatePicker, listeners: ['change']}
        },
        {title: "Рег. Номер", minWidth: 100, width: 180, dataType: "string", dataIndx: "regNum",
            filter: {type: 'textbox', condition: 'contain', listeners: ['keyup']}},
        {
            title: "Инициатор/Контрагент", minWidth: 100, width: 220, dataType: "string", dataIndx: "author",
            filter: {type: 'textbox', condition: 'contain', listeners: ['keyup']}
        }
    ];

    var isConsiderationDocs = $("#grid-tasks-and-documents_dashlet-considerationDocs");
    if (isConsiderationDocs) {
        window.BTL["considerationDocs"] = isConsiderationDocs.pqGrid($.extend(true, {}, objDocs));
    }
//-----------------------------------Grid delegateConsideration---------------------------------------------------------
    var isDelegateConsiderationDocs = $("#grid-tasks-and-documents_dashlet-delegateConsideration");
    if (isDelegateConsiderationDocs) {
        window.BTL["delegateConsiderationDocs"] = isDelegateConsiderationDocs.pqGrid($.extend(true, {}, objDocs));
    }
    objDocs.colModel = oldColModel;
//-----------------------------------Grid myDocs------------------------------------------------------------------------
    var isMyDocs = $("#grid-tasks-and-documents_dashlet-myDocs");
    if (isMyDocs){
        var objMyDocs = $.extend(true, {}, objDocs);
        if(window.BTL["isGD"]){
            objMyDocs.rowDblClick = function (event, ui) {
                var changedForm = false;
                var formId = null;
                var href ="";
                if(ui.rowData.status == "На исполнении" && (ui.rowData.type == "Внутренний" || ui.rowData.type == "Входящий")) {
                    href = "/share/page/btl-review?nodeRef=" + ui.rowData.nodeRef;
                    changedForm = true;
                    formId = "reviewForm";
                }else{
                    href = "/share/page/btl-edit-metadata?nodeRef=" + ui.rowData.nodeRef;
                }
                if(changedForm){
                    createAndShowForm(ui.rowData.nodeRef, {formId:formId});
                }else{
                    window.location.href = href;
                }
                require(["dojo/topic"], function (topic) {
                    topic.publish("ALF_DISPLAY_NOTIFICATION", {message: "Перенаправление на документ."});
                });
            }
        }
        window.BTL["myDocs"] = isMyDocs.pqGrid(objMyDocs);
        window.BTL["myDocs"].pqGrid("option", "colModel")[4].filter = null;
        window.BTL["myDocs"].pqGrid("option", "colModel")[4].filter = {type: 'textbox', condition: "between", init: pqDatePicker, listeners: ['change']};
        window.BTL["myDocs"].pqGrid("option", "colModel")[5].filter = null;
        window.BTL["myDocs"].pqGrid("option", "colModel")[5].filter = {type: 'textbox', condition: 'contain', listeners: ['keyup']};
    }
    
//--------------Mail grids--------------------------------
    var isMailInput = $("#grid-mails_dashlet-input");
    if (isMailInput){
        var objMailInput = $.extend(true, {}, objMails);        
        window.BTL["mail_input"] = isMailInput.pqGrid(objMailInput);       
    }
    
    var isMailOut = $("#grid-mails_dashlet-out");
    if (isMailOut){
        var objMailOut = $.extend(true, {}, objMails);        
        window.BTL["mail_out"] = isMailOut.pqGrid(objMailOut);       
    }
    
    
    
//-----------------------------------Grid onReworkDocs---------------------------------------------------------
    // window.BTL["onReworkDocs"] = $("#grid-tasks-and-documents_dashlet-onReworkDocs").pqGrid( $.extend(true, {}, objDocs)  );
    //  window.BTL["onReworkDocs"].pqGrid( "option", "colModel" )[7].filter = null;

//-----------------------------------Grid allDocs---------------------------------------------------------
    var isAllDocs = $("#grid-tasks-and-documents_dashlet-allDocs");
    if (isAllDocs) {
        window.BTL["allDocs"] = isAllDocs.pqGrid($.extend(true, {}, objDocs));
        isAllDocs.delegate("select[name='status']", 'change', function (event) {
            if (!event.isTrigger) {

                switch (this.value) {
                    case "" : // Все
                        delete paramFilter["btl-document:state"];
                        window.BTL["allDocs"].pqGrid("showLoading");
                        getGridData();
                        break;
                    case "^(?!(В архиве|Черновик))" : // Активные
                        paramFilter = {"btl-document:state": "Активные"};
                        window.BTL["allDocs"].pqGrid("showLoading");
                        getGridData();
                        break;
                    case "В архиве" :
                        paramFilter = {"btl-document:state": "В архиве"};
                        window.BTL["allDocs"].pqGrid("showLoading");
                        getGridData();
                        break;
                    case "Завершено" :
                        paramFilter = {"btl-document:state": "Завершено"};
                        window.BTL["allDocs"].pqGrid("showLoading");
                        getGridData();
                        break;
                    case "На рассмотрении" :
                        paramFilter = {"btl-document:state": "На рассмотрении"};
                        window.BTL["allDocs"].pqGrid("showLoading");
                        getGridData();
                        break;
                    case "Зарегистрирован" :
                        paramFilter = {"btl-document:state": "Зарегистрирован"};
                        window.BTL["allDocs"].pqGrid("showLoading");
                        getGridData();
                        break;
                    case "На подписании" :
                        paramFilter = {"btl-document:state": "На подписании"};
                        window.BTL["allDocs"].pqGrid("showLoading");
                        getGridData();
                        break;
                    case "На исполнении" :
                        paramFilter = {"btl-document:state": "На исполнении"};
                        window.BTL["allDocs"].pqGrid("showLoading");
                        getGridData();
                        break;
                    case "Исполнен" :
                        paramFilter = {"btl-document:state": "Исполнен"};
                        window.BTL["allDocs"].pqGrid("showLoading");
                        getGridData();
                        break;
                }
            }
            event.preventDefault();
        });
    }
//--------------------------------------------------------------------------------------------
    var contentTasksAndDocumentsDashlet = $('#content-tasks-and-documents_dashlet');

    contentTasksAndDocumentsDashlet.delegate("select[name='type']", 'change', function (event) {
        if (gridType == "task") {
            var element = $grid.find('input[name="grouping-of-document"]')[0];
            eventGroupingOfDocumentRefreshView(element);
        }
    });

    contentTasksAndDocumentsDashlet.delegate("select[name='status']", 'change', function (event) {
        if (gridType == "task") {
            if ($grid.attr('id') != "grid-tasks-and-documents_dashlet-allDocs") {
                var element = $grid.find('input[name="grouping-of-document"]')[0];
                eventGroupingOfDocumentRefreshView(element);
            }
        }
    });

    contentTasksAndDocumentsDashlet.delegate('input[name="duration"].pq-from', 'change', function (event) {
        if (gridType == "task") {
            var element = $grid.find('input[name="grouping-of-document"]')[0];
            eventGroupingOfDocumentRefreshView(element);
        }
        //window.BTL["currentGrid"].pqGrid( "refreshView",{header: false} );
    });

    contentTasksAndDocumentsDashlet.delegate('input[name="duration"].pq-to', 'change', function (event) {
        if (gridType == "task") {
            var element = $grid.find('input[name="grouping-of-document"]')[0];
            eventGroupingOfDocumentRefreshView(element);
        }
        //window.BTL["currentGrid"].pqGrid( "refreshView",{header: false} );
    });

    contentTasksAndDocumentsDashlet.delegate('input[name="author"]', 'keyup', function (event) {
        if (gridType == "task") {
            var element = $grid.find('input[name="grouping-of-document"]')[0];
            eventGroupingOfDocumentRefreshView(element);
            var input = window.BTL["currentGrid"].find('input[name="author"]')[1];
            input.focus();
            input.selectionStart = input.value.length;
        }
    });

    contentTasksAndDocumentsDashlet.delegate('input[name="executor"]', 'keyup', function (event) {
        if (gridType == "task") {
            var element = $grid.find('input[name="grouping-of-document"]')[0];
            eventGroupingOfDocumentRefreshView(element);
            var input = window.BTL["currentGrid"].find('input[name="executor"]')[1];
            input.focus();
            input.selectionStart = input.value.length;
        }
    });

    contentTasksAndDocumentsDashlet.delegate('input[name="name"]', 'keyup', function (event) {
        if (gridType == "task") {
            var element = $grid.find('input[name="grouping-of-document"]')[0];
            eventGroupingOfDocumentRefreshView(element);
            var input = window.BTL["currentGrid"].find('input[name="name"]')[1];
            input.focus();
            input.selectionStart = input.value.length;
        }
    });

    contentTasksAndDocumentsDashlet.delegate('input[name="contractor"]', 'keyup', function (event) {
        if (gridType == "task") {
            var element = $grid.find('input[name="grouping-of-document"]')[0];
            eventGroupingOfDocumentRefreshView(element);
            var input = window.BTL["currentGrid"].find('input[name="contractor"]')[1];
            input.focus();
            input.selectionStart = input.value.length;
        }
    });

    contentTasksAndDocumentsDashlet.delegate('input[name="doc"]', 'keyup', function (event) {
        if (gridType == "task") {
            var element = $grid.find('input[name="grouping-of-document"]')[0];
            eventGroupingOfDocumentRefreshView(element);
            var input = window.BTL["currentGrid"].find('input[name="doc"]')[1];
            input.focus();
            input.selectionStart = input.value.length;
        }
    });
//----------------------------------------------------------------------------------------------

    /*-----------------------------меню задачи----------------------------------------------*/
    $('#menu-new-tasks-and-documents_dashlet').click(function (event) {
    	$('#filter-date-off-tasks-and-documents_dashlet').show();
    	cleanCurFilterTab();
        $grid = window.BTL["newTasksGrid"];
        window.BTL["currentGrid"] = $grid;
        document.openRow = {};
        gridType = "task";
        cleanMenuSetting();
        window.BTL["newTasksGrid"].pqGrid("getColumn", {dataIndx: "status"}).filter.value = "";
        fun = 'newTasks';
        setCurrentMenuItem($(this));
        $("#content-tasks-and-documents_dashlet div.grid-tasks-and-documents").css({"display": "none"});
        $("#filter-child-tasks-end-and-documents_dashlet").css({"display": "none"});
        $("#grid-tasks-and-documents_dashlet-newTasks").css({"display": "block"});
        $("#filters-tasks-and-documents_dashlet").css({"display": "block"});
        $("#grid-mails_dashlet-input").css({"display": "none"});
        $("#grid-mails_dashlet-out").css({"display": "none"});
        $(window).trigger('resize');
        $grid.pqGrid("showLoading");
        getGridData();
    });

// В работе
    $('#menu-inWork-tasks-and-documents_dashlet').click(function (event) {
    	$('#filter-date-off-tasks-and-documents_dashlet').show();
        cleanCurFilterTab();
        $grid = window.BTL["inWorkTasks"];
        window.BTL["currentGrid"] = $grid;
        document.openRow = {};
        window.BTL["inWorkTasks"].find("input[name='grouping-of-document']")[0].checked = false;
        gridType = "task";
        cleanMenuSetting();
        window.BTL["inWorkTasks"].pqGrid("getColumn", {dataIndx: "status"}).filter.value = "";
        fun = 'inWorkTasks';
        setCurrentMenuItem($(this));
        $("#content-tasks-and-documents_dashlet div.grid-tasks-and-documents").css({"display": "none"});
        $("#grid-tasks-and-documents_dashlet-inWorkTasks").css({"display": "block"});
        $("#filter-child-tasks-end-and-documents_dashlet").css({"display": "none"});
        $("#filters-tasks-and-documents_dashlet").css({"display": "block"});
        $("#grid-mails_dashlet-input").css({"display": "none"});
        $("#grid-mails_dashlet-out").css({"display": "none"});
        $("#grid-tasks-and-documents_dashlet-inWorkTasks input[name='TasksUrgently']")[0].checked = false;
        $("#grid-tasks-and-documents_dashlet-inWorkTasks input[name='specialControl']")[0].checked = false;
        $(window).trigger('resize');
        $grid.pqGrid("showLoading");
        getGridData();
    });

//Я - инициатор
    $('#menu-assigned-tasks-and-documents_dashlet').click(function (event) {
    	$('#filter-date-off-tasks-and-documents_dashlet').show();
        cleanCurFilterTab();
        $grid = window.BTL["assignedTasks"];
        window.BTL["currentGrid"] = $grid;
        document.openRow = {};
        gridType = "task";
        cleanMenuSetting();
        window.BTL["assignedTasks"].pqGrid("getColumn", {dataIndx: "status"}).filter.value = "^(?!Завершено).*";
        fun = 'assignedTasks';
        setCurrentMenuItem($(this));
        $("#content-tasks-and-documents_dashlet div.grid-tasks-and-documents").css({"display": "none"});
        $("#filter-child-tasks-end-and-documents_dashlet").css({"display": "none"});
        $("#grid-tasks-and-documents_dashlet-assignedTasks").css({"display": "block"});
        $("#filters-tasks-and-documents_dashlet").css({"display": "block"});
        $("#grid-mails_dashlet-input").css({"display": "none"});
        $("#grid-mails_dashlet-out").css({"display": "none"});
        $("#grid-tasks-and-documents_dashlet-assignedTasks input[name='TasksUrgently']")[0].checked = false;
        $("#grid-tasks-and-documents_dashlet-assignedTasks input[name='specialControl']")[0].checked = false;
        $(window).trigger('resize');
        $grid.pqGrid("showLoading");
        getGridData();
    });

// На исполнении
    $('#menu-onExecute-tasks-and-documents_dashlet').click(function (event) {
    	$('#filter-date-off-tasks-and-documents_dashlet').show();
        cleanCurFilterTab();
        $grid = window.BTL["onExecuteTasks"];
        window.BTL["currentGrid"] = $grid;
        document.openRow = {};
        gridType = "task";
        cleanMenuSetting();
        window.BTL["onExecuteTasks"].pqGrid("getColumn", {dataIndx: "status"}).filter.value = "^(?!Завершено).*";
        fun = 'onExecuteTasks';
        setCurrentMenuItem($(this));
        $("#content-tasks-and-documents_dashlet div.grid-tasks-and-documents").css({"display": "none"});
        $("#filter-child-tasks-end-and-documents_dashlet").css({"display": "none"});
        $("#grid-tasks-and-documents_dashlet-onExecuteTasks").css({"display": "block"});
        $("#filters-tasks-and-documents_dashlet").css({"display": "block"});
        $("#grid-mails_dashlet-input").css({"display": "none"});
        $("#grid-mails_dashlet-out").css({"display": "none"});
        $("#grid-tasks-and-documents_dashlet-onExecuteTasks input[name='TasksUrgently']")[0].checked = false;
        $("#grid-tasks-and-documents_dashlet-onExecuteTasks input[name='specialControl']")[0].checked = false;
        $(window).trigger('resize');
        $grid.pqGrid("showLoading");
        getGridData();
    });

// У меня на контроле
    $('#menu-onControl-tasks-and-documents_dashlet').click(function (event) {
    	$('#filter-date-off-tasks-and-documents_dashlet').show();
        cleanCurFilterTab();
        $grid = window.BTL["onControlTasks"];
        
        window.BTL["currentGrid"] = $grid;
        
        document.openRow = {};
        gridType = "task";
        cleanMenuSetting();
        window.BTL["onControlTasks"].pqGrid("getColumn", {dataIndx: "status"}).filter.value = "";
        fun = 'onControlTasks';
        setCurrentMenuItem($(this));
        $("#content-tasks-and-documents_dashlet div.grid-tasks-and-documents").css({"display": "none"});
        $("#filter-child-tasks-end-and-documents_dashlet").css({"display": "none"});
        $("#grid-tasks-and-documents_dashlet-onControlTasks").css({"display": "block"});
        $("#filters-tasks-and-documents_dashlet").css({"display": "block"});
        $("#grid-mails_dashlet-input").css({"display": "none"});
        $("#grid-mails_dashlet-out").css({"display": "none"});
        $("#grid-tasks-and-documents_dashlet-onControlTasks input[name='TasksUrgently']")[0].checked = false;
        $("#grid-tasks-and-documents_dashlet-onControlTasks input[name='specialControl']")[0].checked = false;
        $(window).trigger('resize');
        //window.location.hash = "#onControlTasks";
        $grid.pqGrid("showLoading");
        
        $grid.pqGrid("filter", {
            oper: 'replace',
            data: [
                {
                	dataIndx: "status", 
                	condition: "regexp",
                	value: "^(?!Завершено).*"
                }	
            ]
        });
        
        getGridData();
    });

    /*
     // Делегировано
     $('#menu-delegate-tasks-and-documents_dashlet').click(function(event){
     $grid = window.BTL["delegateTasks"];
     window.BTL["currentGrid"] = $grid;
     gridType = "task";
     cleanMenuSetting();
     fun = 'delegateTasks';
     setCurrentMenuItem($(this));
     $("#content-tasks-and-documents_dashlet div.grid-tasks-and-documents").css({"display":"none"});
     $("#grid-tasks-and-documents_dashlet-delegateTasks").css({"display":"block"});
     $("#filters-tasks-and-documents_dashlet").css({"display":"block"});
     $(window).trigger('resize');
     window.location.hash = "#delegateTasks";
     $grid.pqGrid( "showLoading" );
     getGridData();
     });*/

// Черновики
    $('#menu-draft-tasks-and-documents_dashlet').click(function (event) {
    	$('#filter-date-off-tasks-and-documents_dashlet').show();
        cleanCurFilterTab();
        $grid = window.BTL["draftTasks"];
        window.BTL["currentGrid"] = $grid;
        document.openRow = {};
        gridType = "task";
        cleanMenuSetting();
        fun = 'draftTasks';
        setCurrentMenuItem($(this));
        $("#content-tasks-and-documents_dashlet div.grid-tasks-and-documents").css({"display": "none"});
        $("#filter-child-tasks-end-and-documents_dashlet").css({"display": "none"});
        $("#grid-tasks-and-documents_dashlet-draftTasks").css({"display": "block"});
        $("#filters-tasks-and-documents_dashlet").css({"display": "block"});
        $("#grid-mails_dashlet-input").css({"display": "none"});
        $("#grid-mails_dashlet-out").css({"display": "none"});
        $(window).trigger('resize');
        $grid.pqGrid("showLoading");
        getGridData();
    });

// Ожидают завершения
    $('#menu-waitingCompletes-tasks-and-documents_dashlet').click(function (event) {
        $('#filter-date-off-tasks-and-documents_dashlet').show();
        cleanCurFilterTab();
        $grid = window.BTL["waitingCompletes"];
        window.BTL["currentGrid"] = $grid;
        document.openRow = {};
        window.BTL["waitingCompletes"].find("input[name='grouping-of-document']")[0].checked = false;
        gridType = "task";
        cleanMenuSetting();
        window.BTL["waitingCompletes"].pqGrid("getColumn", {dataIndx: "status"}).filter.value = "";
        fun = 'onWaitingCompletesTasks';
        setCurrentMenuItem($(this));
        $("#content-tasks-and-documents_dashlet div.grid-tasks-and-documents").css({"display": "none"});
        $("#filter-child-tasks-end-and-documents_dashlet").css({"display": "none"});
        $("#grid-tasks-and-documents_dashlet-waitingCompletes").css({"display": "block"});
        $("#filters-tasks-and-documents_dashlet").css({"display": "block"});
        $("#grid-mails_dashlet-input").css({"display": "none"});
        $("#grid-mails_dashlet-out").css({"display": "none"});
        $(window).trigger('resize');
        $grid.pqGrid("showLoading");
        getGridData();
    });

    /*------------------------------меню задачи завершено---------------------------------------*/
//Завершено мной
    $('#menu-complete-me-tasks-and-documents_dashlet').click(function (event) {
    	
    	$('#filter-date-off-tasks-and-documents_dashlet').hide();
        cleanCurFilterTab();
    	
        $grid = window.BTL["completeMe"];
        window.BTL["currentGrid"] = $grid;
        document.openRow = {};
        gridType = "task";
        cleanMenuSetting();
        fun = 'completeMe';
        setCurrentMenuItem($(this));
        $("#content-tasks-and-documents_dashlet div.grid-tasks-and-documents").css({"display": "none"});
        $("#filter-child-tasks-end-and-documents_dashlet").css({"display": "none"});
        $("#grid-tasks-and-documents_dashlet-completeMe").css({"display": "block"});
        $("#filters-tasks-and-documents_dashlet").css({"display": "block"});
        $("#grid-mails_dashlet-input").css({"display": "none"});
        $("#grid-mails_dashlet-out").css({"display": "none"});
        $(window).trigger('resize');
        $grid.pqGrid("showLoading");
        getGridData();
    });
//Задачи от меня
    $('#menu-complete-from-me-tasks-and-documents_dashlet').click(function (event) {
    	$('#filter-date-off-tasks-and-documents_dashlet').show();
        cleanCurFilterTab();
        $grid = window.BTL["completeFromMe"];
        window.BTL["currentGrid"] = $grid;
        document.openRow = {};
        gridType = "task";
        cleanMenuSetting();
        fun = 'completeFromMe';
        setCurrentMenuItem($(this));
        $("#content-tasks-and-documents_dashlet div.grid-tasks-and-documents").css({"display": "none"});
        $("#filter-child-tasks-end-and-documents_dashlet").css({"display": "none"});
        $("#grid-tasks-and-documents_dashlet-completeFromMe").css({"display": "block"});
        $("#filters-tasks-and-documents_dashlet").css({"display": "block"});
        $("#grid-mails_dashlet-input").css({"display": "none"});
        $("#grid-mails_dashlet-out").css({"display": "none"});
        $(window).trigger('resize');
        $grid.pqGrid("showLoading");
        getGridData();
    });

    /*------------------------------меню Задания моему руководителю---------------------------------------*/
    $('#menu-delegateMe-tasks-and-documents_dashlet').click(function (event) {
    	$('#filter-date-off-tasks-and-documents_dashlet').show();
        cleanCurFilterTab();
        $grid = window.BTL["delegateMeTasks"];
        window.BTL["currentGrid"] = $grid;
        document.openRow = {};
        gridType = "task";
        cleanMenuSetting();
        window.BTL["delegateMeTasks"].pqGrid("getColumn", {dataIndx: "status"}).filter.value = "";
        fun = 'delegateMeTasks';
        setCurrentMenuItem($(this));
        $("#content-tasks-and-documents_dashlet div.grid-tasks-and-documents").css({"display": "none"});
        $("#filter-child-tasks-end-and-documents_dashlet").css({"display": "none"});
        $("#grid-tasks-and-documents_dashlet-delegate").css({"display": "block"});
        $("#filters-tasks-and-documents_dashlet").css({"display": "block"});
        $("#grid-mails_dashlet-input").css({"display": "none"});
        $("#grid-mails_dashlet-out").css({"display": "none"});
        $(window).trigger('resize');
        $grid.pqGrid("showLoading");
        getGridData();
    });

    /*------------------------------меню Задания от моего руководителя---------------------------------------*/
    $('#menu-tasksFromMyDirector-tasks-and-documents_dashlet').click(function (event) {
        $('#filter-date-off-tasks-and-documents_dashlet').show();
        cleanCurFilterTab();
        $grid = window.BTL["tasksFromMyDirector"];
        window.BTL["currentGrid"] = $grid;
        document.openRow = {};
        gridType = "task";
        cleanMenuSetting();
        window.BTL["tasksFromMyDirector"].pqGrid("getColumn", {dataIndx: "status"}).filter.value = "";
        fun = 'tasksFromMyDirector';
        setCurrentMenuItem($(this));
        $("#content-tasks-and-documents_dashlet div.grid-tasks-and-documents").css({"display": "none"});
        $("#filter-child-tasks-end-and-documents_dashlet").css({"display": "none"});
        $("#grid-tasks-and-documents_dashlet-tasksFromMyDirector").css({"display": "block"});
        $("#filters-tasks-and-documents_dashlet").css({"display": "block"});
        $("#grid-mails_dashlet-input").css({"display": "none"});
        $("#grid-mails_dashlet-out").css({"display": "none"});
        $(window).trigger('resize');
        $grid.pqGrid("showLoading");
        getGridData();
    });

    /*-----------------------------меню документы----------------------------------------------*/

//мои черновики
    $('#menu-draft-docs-tasks-and-documents_dashlet').click(function (event) {
        cleanCurFilterTab();
        $grid = window.BTL["draftDocs"];
        window.BTL["currentGrid"] = $grid;
        document.openRow = {};
        gridType = "doc";
        cleanMenuSetting();
        fun = 'draftDocs';
        setCurrentMenuItem($(this));
        $("#content-tasks-and-documents_dashlet div.grid-tasks-and-documents").css({"display": "none"});
        $("#grid-tasks-and-documents_dashlet-draftDocs").css({"display": "block"});
        $("#filters-tasks-and-documents_dashlet").css({"display": "none"});
        $("#grid-mails_dashlet-input").css({"display": "none"});
        $("#grid-mails_dashlet-out").css({"display": "none"});
        $(window).trigger('resize');
        //window.location.hash = "#draftDocs";
        $grid.pqGrid("showLoading");
        getGridData();
    });

    $('#menu-consideration-tasks-and-documents_dashlet').click(function (event) {
        cleanCurFilterTab();
        $grid = window.BTL["considerationDocs"];
        window.BTL["currentGrid"] = $grid;
        document.openRow = {};
        gridType = "doc";
        cleanMenuSetting();
        fun = 'considerationDocs';
        setCurrentMenuItem($(this));
        $("#content-tasks-and-documents_dashlet div.grid-tasks-and-documents").css({"display": "none"});
        $("#grid-tasks-and-documents_dashlet-considerationDocs").css({"display": "block"});
        $("#filters-tasks-and-documents_dashlet").css({"display": "none"});
        $("#grid-mails_dashlet-input").css({"display": "none"});
        $("#grid-mails_dashlet-out").css({"display": "none"});
        $(window).trigger('resize');
        $grid.pqGrid("showLoading");
        getGridData();
    });

    $('#menu-delegateConsideration-tasks-and-documents_dashlet').click(function (event) {
        cleanCurFilterTab();
        $grid = window.BTL["delegateConsiderationDocs"];
        window.BTL["currentGrid"] = $grid;
        document.openRow = {};
        gridType = "doc";
        cleanMenuSetting();
        fun = 'delegateConsiderationDocs';
        setCurrentMenuItem($(this));
        $("#content-tasks-and-documents_dashlet div.grid-tasks-and-documents").css({"display": "none"});
        $("#grid-tasks-and-documents_dashlet-delegateConsideration").css({"display": "block"});
        $("#filters-tasks-and-documents_dashlet").css({"display": "none"});
        $("#grid-mails_dashlet-input").css({"display": "none"});
        $("#grid-mails_dashlet-out").css({"display": "none"});
        $(window).trigger('resize');
        $grid.pqGrid("showLoading");
        getGridData();
    });

    /*$('#menu-on-rework-docs-tasks-and-documents_dashlet').click(function(event){
     $grid = window.BTL["onReworkDocs"];
     window.BTL["currentGrid"] = $grid;
     gridType = "doc";
     cleanMenuSetting();
     fun = 'onReworkDocs';
     setCurrentMenuItem($(this));
     $("#content-tasks-and-documents_dashlet div.grid-tasks-and-documents").css({"display":"none"});
     $("#grid-tasks-and-documents_dashlet-onReworkDocs").css({"display":"block"});
     $("#filters-tasks-and-documents_dashlet").css({"display":"none"});
     $(window).trigger('resize');
     window.location.hash = "#onReworkDocs";
     $grid.pqGrid( "showLoading" );
     getGridData();
     });*/

    $('#menu-all-docs-tasks-and-documents_dashlet').click(function (event) {
        cleanCurFilterTab();
        $grid = window.BTL["allDocs"];
        window.BTL["currentGrid"] = $grid;
        document.openRow = {};
        gridType = "doc";
        cleanMenuSetting();
        fun = 'allDocs';
        setCurrentMenuItem($(this));
        $("#content-tasks-and-documents_dashlet div.grid-tasks-and-documents").css({"display": "none"});
        $("#grid-tasks-and-documents_dashlet-allDocs").css({"display": "block"});
        $("#filters-tasks-and-documents_dashlet").css({"display": "none"});
        $("#grid-mails_dashlet-input").css({"display": "none"});
        $("#grid-mails_dashlet-out").css({"display": "none"});
        $(window).trigger('resize');
        $grid.pqGrid("showLoading");
        paramFilter = {"btl-document:state": "Активные"};
        getGridData();

    });

    $('#menu-my-docs-tasks-and-documents_dashlet').click(function (event) {
        cleanCurFilterTab();
        $grid = window.BTL["myDocs"];
        window.BTL["currentGrid"] = $grid;
        document.openRow = {};
        gridType = "doc";
        cleanMenuSetting();
        fun = 'myDocs';
        setCurrentMenuItem($(this));
        $("#content-tasks-and-documents_dashlet div.grid-tasks-and-documents").css({"display": "none"});
        $("#grid-tasks-and-documents_dashlet-myDocs").css({"display": "block"});
        $("#filters-tasks-and-documents_dashlet").css({"display": "none"});
        
        $("#grid-mails_dashlet-input").css({"display": "none"});
        $("#grid-mails_dashlet-out").css({"display": "none"});
        
        $(window).trigger('resize');
        $grid.pqGrid("showLoading");
        paramFilter = {"btl-document:state": "Активные"};
        getGridData();
    });
    
    
    $('#menu-mails-input_dashlet').click(function (event) {
        cleanCurFilterTab();
        $grid = window.BTL["mail_input"];
        window.BTL["currentGrid"] = $grid;
        
        window.BTL["currentGrid"].url = "/share/proxy/alfresco/mailMessage/getMessage";
        window.BTL["currentGrid"].remote = true;
        
       
        var tempReCount = function(){reCount('menu-mails-input_dashlet', 'mail_input', '/share/proxy/alfresco/mailMessage/getMessage')};
        
        window.BTL["currentGrid"].reCount = tempReCount.bind(this);
        
        document.openRow = {}
        gridType = "mail";
        cleanMenuSetting();
        fun = 'mail_input';
        setCurrentMenuItem($(this));

        $("#content-tasks-and-documents_dashlet div.grid-tasks-and-documents").css({"display": "none"});
        $("#filters-tasks-and-documents_dashlet").css({"display": "none"});

        
        $("#grid-mails_dashlet-out").css({"display": "none"});
        $("#grid-mails_dashlet-input").css({"display": "block"});
        $(window).trigger('resize');
        $grid.pqGrid("showLoading");
        //paramFilter = {"btl-document:state": "Активные"};
        getGridData();
    });
    
    
    $('#menu-mails-out_dashlet').click(function (event) {
        cleanCurFilterTab();
        $grid = window.BTL["mail_out"];
        window.BTL["currentGrid"] = $grid;
        
        window.BTL["currentGrid"].url = "/share/proxy/alfresco/mailMessage/getMessage";
        window.BTL["currentGrid"].remote = true;
        
        document.openRow = {}
        gridType = "mail";
        cleanMenuSetting();
        fun = 'mail_out';
        setCurrentMenuItem($(this));
        $("#content-tasks-and-documents_dashlet div.grid-tasks-and-documents").css({"display": "none"});
        $("#filters-tasks-and-documents_dashlet").css({"display": "none"});
        
        $("#grid-mails_dashlet-input").css({"display": "none"});
        $("#grid-mails_dashlet-out").css({"display": "block"});
        $(window).trigger('resize');
        $grid.pqGrid("showLoading");
        //paramFilter = {"btl-document:state": "Активные"};
        getGridData();
    });
    var filterState = "all";

    /*-----------------------------фильтры 1 уровня----------------------------------------------*/
    $('#filter-projects-tasks-and-documents_dashlet').click(function (event) {
        setCurrentFilter($(this));
        paramFilter = {"btl-task:isProject": "true", "btl-internal:documentDataType:isProject": "true"};
        $grid.pqGrid("showLoading");
        getGridData(param, author, executor, user, role, setDataModelGrid);
    });

    $('#filter-all-tasks-and-documents_dashlet').click(function (event) {
        setCurrentFilter($(this));
        filterState = "all";
        $('#menu-my-tasks_dashlet div.item-menu.active').click();
    });

    $('#filter-personal-tasks-and-documents_dashlet').click(function (event) {
        setCurrentFilter($(this));
        paramFilter = {"btl-task:isProject": "false", "btl-internal:documentDataType:isProject": "false"};
        $grid.pqGrid("showLoading");
        getGridData(param, author, executor, user, role, setDataModelGrid);
    });

   var curFilterTab = null;

   cleanCurFilterTab = function(){
       if(curFilterTab){
           curFilterTab = null;
       }
   };

   setCurFilterTab = function(curTab){
       curFilterTab = curTab;
   };

    getCurFilterTab = function(){
        return curFilterTab;
    };

//----------------Задачи на неделю--------------------------------------------------------------------------------------
    $('#filter-date-week-tasks-and-documents_dashlet').click(function (event) {
        cleanMenuSetting();
        setCurrentFilter($(this));

        setCurFilterTab(this);

        var date = new Date();
        var srartWeek = new Date();
        var endWeek = new Date();
        srartWeek.setDate(date.getDate() - date.getUTCDay() + 1);
        endWeek.setDate(date.getDate() + (7 - date.getUTCDay()));

        var data = [
                    {
                        dataIndx: 'duration',
                        condition: 'between',
                        value: formatClientDate(srartWeek),
                        value2: formatClientDate(endWeek)
                    }
                ];
        if ($grid.onlyActive)
    	{
        	data.push({
                	dataIndx: "status", 
                	condition: "regexp",
                	value: "^(?!Завершено).*"
        	});
    	}
        
        $grid.pqGrid("filter", {
            oper: 'replace',
            data: data
        });

        filterState = "week";

        var element = $grid.find('input[name="grouping-of-document"]')[0];
        eventGroupingOfDocumentRefreshView(element);
        $grid.find('input[name="duration"].pq-from').val(formatClientDate(srartWeek));
        $grid.find('input[name="duration"].pq-to').val(formatClientDate(endWeek));
        var column = $grid.pqGrid("getColumn", {dataIndx: "duration"});
        column.filter.value =  formatClientDate(srartWeek);
        column.filter.value2 = formatClientDate(endWeek);

        //$grid.find('input[name="duration"].pq-from').trigger("change");
        /*paramFilter = {"btl-task:endDate": formatDateStart(srartWeek) + " TO " + formatDateEnd(endWeek),"btl-taskwf:endDate": formatDateStart(srartWeek) + " TO " + formatDateEnd(endWeek)};
         $grid.pqGrid( "showLoading" );
         getGridData(param, author, executor, user, role, setDataModelGrid);*/
    });
//----------------Задачи на месяц---------------------------------------------------------------------------------------
    $('#filter-date-month-tasks-and-documents_dashlet').click(function (event) {
        cleanMenuSetting();
        setCurrentFilter($(this));

        setCurFilterTab(this);

        var date = new Date();
        var srartMonth = new Date();
        var endMonth = new Date();
        srartMonth.setFullYear(date.getFullYear(), date.getMonth(), 1);
        endMonth.setFullYear(date.getFullYear(), date.getMonth(), date.daysInMonth());
        var data = [
                    {
                        dataIndx: 'duration',
                        condition: 'between',
                        value: formatClientDate(srartMonth),
                        value2: formatClientDate(endMonth)
                    }
                ];
        if ($grid.onlyActive)
    	{
        	data.push({
                	dataIndx: "status", 
                	condition: "regexp",
                	value: "^(?!Завершено).*"
        	});
    	}
        
        $grid.pqGrid("filter", {
            oper: 'replace',
            data: data
        });

        filterState = "month";

        var element = $grid.find('input[name="grouping-of-document"]')[0];
        eventGroupingOfDocumentRefreshView(element);
        $grid.find('input[name="duration"].pq-from').val(formatClientDate(srartMonth));
        $grid.find('input[name="duration"].pq-to').val(formatClientDate(endMonth));
        var column = $grid.pqGrid("getColumn", {dataIndx: "duration"});
        column.filter.value =  formatClientDate(srartMonth);
        column.filter.value2 = formatClientDate(endMonth);
        /*paramFilter = {"btl-task:endDate":formatDateStart(srartMonth) + " TO " + formatDateEnd(endMonth),"btl-taskwf:endDate": formatDateStart(srartMonth) + " TO " + formatDateEnd(endMonth) };
         $grid.pqGrid( "showLoading" );
         getGridData(param, author, executor, user, role, setDataModelGrid);*/
    });
//----------------Задачи на год-----------------------------------------------------------------------------------------
    $('#filter-date-year-tasks-and-documents_dashlet').click(function (event) {
        cleanMenuSetting();
        setCurrentFilter($(this));

        setCurFilterTab(this);

        var date = new Date();
        var srartYear = new Date();
        var endYear = new Date();
        srartYear.setFullYear(date.getFullYear(), 0, 1);
        endYear.setFullYear(date.getFullYear(), 11, 31);
        $grid.find('input[name="duration"].pq-from').val(formatClientDate(srartYear));
        $grid.find('input[name="duration"].pq-to').val(formatClientDate(endYear));
        var data = [
                    {
                        dataIndx: 'duration',
                        condition: 'between',
                        value: formatClientDate(srartYear),
                        value2: formatClientDate(endYear)
                    }
                ];
        if ($grid.onlyActive)
    	{
        	data.push({
                	dataIndx: "status", 
                	condition: "regexp",
                	value: "^(?!Завершено).*"
        	});
    	}
        
        $grid.pqGrid("filter", {
            oper: 'replace',
            data: data
        });

        filterState = "year";

        var element = $grid.find('input[name="grouping-of-document"]')[0];
        eventGroupingOfDocumentRefreshView(element);
        $grid.find('input[name="duration"].pq-from').val(formatClientDate(srartYear));
        $grid.find('input[name="duration"].pq-to').val(formatClientDate(endYear));
        var column = $grid.pqGrid("getColumn", {dataIndx: "duration"});
        column.filter.value =  formatClientDate(srartYear);
        column.filter.value2 = formatClientDate(endYear);
        //$grid.find('input[name="duration"].pq-from').trigger("change");
        /*paramFilter = {"btl-task:endDate":formatDateStart(srartYear) + " TO " + formatDateEnd(endYear),"btl-taskwf:endDate": formatDateStart(srartYear) + " TO " + formatDateEnd(endYear) };
         $grid.pqGrid( "showLoading" );
         getGridData(param, author, executor, user, role, setDataModelGrid);*/
    });
//----------------Просроченные задачи-----------------------------------------------------------------------------------
    $('#filter-date-off-tasks-and-documents_dashlet').click(function (event) {
        cleanMenuSetting();
        setCurrentFilter($(this));

        setCurFilterTab(this);

        var date = new Date();
        var startDateOff = new Date(0);
        var endDateOff = new Date();
        endDateOff.setDate(date.getDate() -1);
        endDateOff.setHours(0,0,0);
        $grid.find('input[name="duration"].pq-from').val("");
        $grid.find('input[name="duration"].pq-to').val(formatClientDate(endDateOff));
        $grid.pqGrid("filter", {
            oper: 'replace',
            data: [
                {
                    dataIndx: 'duration',
                    condition: 'between',
                    value: formatClientDate(startDateOff),
                    value2: formatClientDate(endDateOff)
                },
                {
                	dataIndx: "status", 
                	condition: "regexp",
                	value: "^(?!Завершено).*"
                }	
            ]
        });

        filterState = "off";

        var element = $grid.find('input[name="grouping-of-document"]')[0];
        eventGroupingOfDocumentRefreshView(element);
        $grid.find('input[name="duration"].pq-from').val("");
        $grid.find('input[name="duration"].pq-to').val(formatClientDate(endDateOff));
        var column = $grid.pqGrid("getColumn", {dataIndx: "duration"});
        column.filter.value = "";
        column.filter.value2 = formatClientDate(endDateOff);
    });

    //----------------Дочернии завершены-----------------------------------------------------------------------------------
    $('#filter-child-tasks-end-and-documents_dashlet').click(function (event) {
        cleanMenuSetting();
        setCurrentFilter($(this));
        $(window).trigger('resize');
        $grid.pqGrid("showLoading");
        fun = 'inWorkTasks';
        paramMenu = {childTasksEnd: true};
        getGridData();
    });

//----------------------------------------------------------------------------------------------
    $("button[title='Обновить']").css("display", "none");

    /*-----------------------------Меню по умолчанию----------------------------------------------*/

    if (!$('#' + sessionStorage.getItem("menuTasksAndDocsItem"))[0]) {
        sessionStorage.setItem("menuTasksAndDocsItem", $('#left-column-tasks-and-documents_dashlet div.item-menu')[0].id);
    }

    switch (sessionStorage.getItem("menuTasksAndDocsItem")) {
        case "menu-new-tasks-and-documents_dashlet":
            var isMenuNewTask = $('#menu-new-tasks-and-documents_dashlet');
            if (isMenuNewTask)
                isMenuNewTask.click();
            break;
        case "menu-inWork-tasks-and-documents_dashlet":
            var isMenuInWorkTask = $('#menu-inWork-tasks-and-documents_dashlet');
            if (isMenuInWorkTask)
                isMenuInWorkTask.click();
            break;
        case "menu-assigned-tasks-and-documents_dashlet":
            var isMenuAssignedTask = $('#menu-assigned-tasks-and-documents_dashlet');
            if (isMenuAssignedTask)
                isMenuAssignedTask.click();
            break;
        case "menu-onExecute-tasks-and-documents_dashlet":
            var isMenuOnExecuteTask = $('#menu-onExecute-tasks-and-documents_dashlet');
            if (isMenuOnExecuteTask)
                isMenuOnExecuteTask.click();
            break;
        case "menu-onControl-tasks-and-documents_dashlet":
            var isMenuOnControlTask = $('#menu-onControl-tasks-and-documents_dashlet');
            if (isMenuOnControlTask)
                isMenuOnControlTask.click();
            break;
        case "menu-draft-tasks-and-documents_dashlet":
            var isMenuDraftTask = $('#menu-draft-tasks-and-documents_dashlet');
            if (isMenuDraftTask)
                isMenuDraftTask.click();
            break;
        case "menu-waitingCompletes-tasks-and-documents_dashlet":
            var isMenuWaitingCompletesTask = $('#menu-waitingCompletes-tasks-and-documents_dashlet');
            if (isMenuWaitingCompletesTask)
                isMenuWaitingCompletesTask.click();
            break;
        case "menu-delegateMe-tasks-and-documents_dashlet":
            var isMenuDelegateMe = $('#menu-delegateMe-tasks-and-documents_dashlet');
            if (isMenuDelegateMe)
                isMenuDelegateMe.click();
            break;
        case "menu-complete-me-tasks-and-documents_dashlet":
            var isMenuCompleteMeTask = $('#menu-complete-me-tasks-and-documents_dashlet');
            if (isMenuCompleteMeTask)
                isMenuCompleteMeTask.click();
            break;
        case "menu-complete-from-me-tasks-and-documents_dashlet":
            var isMenuCompleteFromMeTask = $('#menu-complete-from-me-tasks-and-documents_dashlet');
            if (isMenuCompleteFromMeTask)
                isMenuCompleteFromMeTask.click();
            break;
        case "menu-draft-docs-tasks-and-documents_dashlet":
            var isMenuDraftDoc = $('#menu-draft-docs-tasks-and-documents_dashlet');
            if (isMenuDraftDoc)
                isMenuDraftDoc.click();
            break;
        case "menu-consideration-tasks-and-documents_dashlet":
            var isMenuConsiderationTask = $('#menu-consideration-tasks-and-documents_dashlet');
            if (isMenuConsiderationTask)
                isMenuConsiderationTask.click();
            break;
        case "menu-delegateConsideration-tasks-and-documents_dashlett":
            var isMenuDConsiderationTask = $('#menu-delegateConsideration-tasks-and-documents_dashlet');
            if (isMenuDConsiderationTask)
                isMenuDConsiderationTask.click();
            break;
        case "menu-my-docs-tasks-and-documents_dashlet":
            var isMenuMyDocs = $('#menu-my-docs-tasks-and-documents_dashlet');
            if (isMenuMyDocs)
                isMenuMyDocs.click();
            break;
        case "menu-all-docs-tasks-and-documents_dashlet":
            var isMenuAllDocs = $('#menu-all-docs-tasks-and-documents_dashlet');
            if (isMenuAllDocs)
                isMenuAllDocs.click();
            break;
        case "menu-tasksFromMyDirector-tasks-and-documents_dashlet":
            var isMenuTasksFromMyDirector = $('#menu-tasksFromMyDirector-tasks-and-documents_dashlet');
            if (isMenuTasksFromMyDirector)
                isMenuTasksFromMyDirector.click();
            break;
        case "menu-mails-input_dashlet":
            var isMenuInputMails= $('#menu-mails-input_dashlet');
            if (isMenuInputMails)
                isMenuInputMails.click();
            break;
        case "menu-mails-out_dashlet":
            var isMenuOutputMails = $('#menu-mails-out_dashlet');
            if (isMenuOutputMails)
                isMenuOutputMails.click();
            break;
        default :
            if (window.BTL["isEEO"])
                var consideration = $('#menu-consideration-tasks-and-documents_dashlet');
            if (consideration)
                consideration.click();
            else
                var new_tasks = $('#menu-new-tasks-and-documents_dashlet');
            if (new_tasks)
                new_tasks.click();
            break;
    }

    /*-------------------------------------------------------------------------------------------*/
    $(window).resize(function () {
        var resizeWidthGridTasksAndDocuments = $('div.dashlet.tasks-and-documents').width() - $('#left-column-tasks-and-documents_dashlet').outerWidth(true) - 5;
        if (gridType == "task") {
            var resizeHeightGridTasksAndDocuments = $('div.dashlet.tasks-and-documents').height() - $('#filters-tasks-and-documents_dashlet').outerHeight(true) - 30;
        } else {
            var resizeHeightGridTasksAndDocuments = $('div.dashlet.tasks-and-documents').height() - 40;
        }
        if ($grid) {
            $grid.pqGrid("option", "width", resizeWidthGridTasksAndDocuments);
            $grid.pqGrid("option", "height", resizeHeightGridTasksAndDocuments);
            $grid.pqGrid("refreshView", {header: false});
        }
    });
    /*---------------------------------------Добавление счетчиков----------------------------------------------------*/

    if (document.getElementById('menu-new-tasks-and-documents_dashlet')) {
        var countNewTask = document.createElement('span');
        countNewTask.innerHTML = imageLoad;
        document.getElementById('menu-new-tasks-and-documents_dashlet').appendChild(countNewTask);
        reCount('menu-new-tasks-and-documents_dashlet', 'countNewTasks');
    }
    if (document.getElementById('menu-inWork-tasks-and-documents_dashlet')) {
        var countInWork = document.createElement('span');
        countInWork.innerHTML = imageLoad;
        document.getElementById('menu-inWork-tasks-and-documents_dashlet').appendChild(countInWork);
        reCount('menu-inWork-tasks-and-documents_dashlet', 'countInWorkTasks');
    }
    if (document.getElementById('menu-assigned-tasks-and-documents_dashlet')) {
        var countAssigned = document.createElement('span');
        countAssigned.innerHTML = imageLoad;
        document.getElementById('menu-assigned-tasks-and-documents_dashlet').appendChild(countAssigned);
        reCount('menu-assigned-tasks-and-documents_dashlet', 'countAssignedTasks');
    }

    if (document.getElementById('menu-onControl-tasks-and-documents_dashlet')) {
        var countOnControl = document.createElement('span');
        countOnControl.innerHTML = imageLoad;
        document.getElementById('menu-onControl-tasks-and-documents_dashlet').appendChild(countOnControl);
        reCount('menu-onControl-tasks-and-documents_dashlet', 'countOnControlTasks');
    }

    //reCount('menu-delegate-tasks-and-documents_dashlet','countDelegateTasks');
    if (document.getElementById('menu-draft-tasks-and-documents_dashlet')) {
        var countDraftTask = document.createElement('span');
        countDraftTask.innerHTML = imageLoad;
        document.getElementById('menu-draft-tasks-and-documents_dashlet').appendChild(countDraftTask);
        reCount('menu-draft-tasks-and-documents_dashlet', 'countDraftTasks');
    }
    if (document.getElementById('menu-waitingCompletes-tasks-and-documents_dashlet')) {
        var countWaitingCompletesTask = document.createElement('span');
        countWaitingCompletesTask.innerHTML = imageLoad;
        document.getElementById('menu-waitingCompletes-tasks-and-documents_dashlet').appendChild(countWaitingCompletesTask);
        reCount('menu-waitingCompletes-tasks-and-documents_dashlet', 'countWaitingCompletesTasks');
    }

    //reCount('menu-delegateMe-tasks-and-documents_dashlet','countDelegateMeTasks');

    //reCount('menu-complete-me-tasks-and-documents_dashlet','countCompleteMeTasks');
    //reCount('menu-complete-from-me-tasks-and-documents_dashlet','countCompleteFromMeTasks');
    if (document.getElementById('menu-draft-docs-tasks-and-documents_dashlet')) {
        var countDraftDocs = document.createElement('span');
        countDraftDocs.innerHTML = imageLoad;
        document.getElementById('menu-draft-docs-tasks-and-documents_dashlet').appendChild(countDraftDocs);
        reCount('menu-draft-docs-tasks-and-documents_dashlet', 'countDraftDocs');
    }
    if (document.getElementById('menu-consideration-tasks-and-documents_dashlet')) {
        var countConsideration = document.createElement('span');
        countConsideration.innerHTML = imageLoad;
        document.getElementById('menu-consideration-tasks-and-documents_dashlet').appendChild(countConsideration);
        reCount('menu-consideration-tasks-and-documents_dashlet', 'countConsiderationDocs');
    }
    if (document.getElementById('menu-delegateConsideration-tasks-and-documents_dashlet')) {
        var countDelegateConsideration = document.createElement('span');
        countDelegateConsideration.innerHTML = imageLoad;
        document.getElementById('menu-delegateConsideration-tasks-and-documents_dashlet').appendChild(countDelegateConsideration);
        reCount('menu-delegateConsideration-tasks-and-documents_dashlet', 'countDelegateConsiderationDocs');
    }
    if (document.getElementById('menu-my-docs-tasks-and-documents_dashlet')) {
        var countMyDocs = document.createElement('span');
        countMyDocs.innerHTML = imageLoad;
        document.getElementById('menu-my-docs-tasks-and-documents_dashlet').appendChild(countMyDocs);
        reCount('menu-my-docs-tasks-and-documents_dashlet', 'countMyDocs');
    }

    if (document.getElementById('filter-child-tasks-end-and-documents_dashlet')) {
        var countMyDocs = document.createElement('span');
        countMyDocs.innerHTML = imageLoad;
        document.getElementById('filter-child-tasks-end-and-documents_dashlet').appendChild(countMyDocs);
        reCount('filter-child-tasks-end-and-documents_dashlet', 'countInWorkTasks&param=%257B%2522childTasksEnd%2522%253Atrue%257D');
    }
    
    
    if (document.getElementById('menu-mails-input_dashlet')) {
        var countMyDocs = document.createElement('span');
        countMyDocs.innerHTML = imageLoad;
        document.getElementById('menu-mails-input_dashlet').appendChild(countMyDocs);
        reCount('menu-mails-input_dashlet', 'mail_input', '/share/proxy/alfresco/mailMessage/getMessage');
    }
    if (document.getElementById('menu-mails-out_dashlet')) {
        var countMyDocs = document.createElement('span');
        countMyDocs.innerHTML = imageLoad;
        document.getElementById('menu-mails-out_dashlet').appendChild(countMyDocs);
        reCount('menu-mails-out_dashlet', 'mail_out', '/share/proxy/alfresco/mailMessage/getMessage');
    }
    //reCount('menu-on-rework-docs-tasks-and-documents_dashlet','countOnReworkDocs');


    /*-------------------------------------------------------------------------------------------*/
    function reCount(id, countName, url) {
        $.ajax({
            url: url || "/share/proxy/alfresco/tasks-and-documents/get-all",
            data: "fun=" + countName,
            success: function (response) {
                ( $("#" + id + " span")[1]) ? $("#" + id + " span")[1].innerHTML = " (" + (countName=="mail_input" ?response.noReadCount || response.cnt_whole :response.cnt_whole) + ")" : "";
            },
            error: function (response) {
                if (Number(response.status) == 401) {
                    window.location.href = "/share/page/";
                    require(["dojo/topic"], function (topic) {
                        topic.publish("ALF_DISPLAY_NOTIFICATION", {message: "Время ссессии истекло."});
                    });
                }
            }
        });
    }

    function setCurrentMenuItem(item) {
        $('.item-menu').removeClass("active");
        $(item).addClass("active");
        paramFilter = null;
        paramMenu = null;
        executor = '';
        author = '';
        sessionStorage.setItem('menuTasksAndDocsItem', item[0].id);
        $('#initiator-filters-tasks-and-documents_dashlet').val('');
        $('#performer-filters-tasks-and-documents_dashlet').val('');
        $('#status-filters-tasks-and-documents_dashlet :first').prop("selected", true);
        $('#type-tasks-filters-tasks-and-documents_dashlet :first').prop("selected", true);
        $('#type-docs-filters-tasks-and-documents_dashlet :first').prop("selected", true);
        $('#status-docs-filters-tasks-and-documents_dashlet :first').prop("selected", true);

        if (item.find("span")[1]) {
            item.find("span")[1].innerHTML = imageLoad;
        }
    }

    function setCurrentFilter(item) {
        $('.item-first-filters').removeClass("active");
        $(item).addClass("active");
        paramFilter = null;
        executor = '';
        author = '';
        $('#initiator-filters-tasks-and-documents_dashlet').val('');
        $('#performer-filters-tasks-and-documents_dashlet').val('');
        $('#status-filters-tasks-and-documents_dashlet :first').prop("selected", true);
        $('#type-tasks-filters-tasks-and-documents_dashlet :first').prop("selected", true);
        $('#type-docs-filters-tasks-and-documents_dashlet :first').prop("selected", true);
        $('#status-docs-filters-tasks-and-documents_dashlet :first').prop("selected", true);

    }

    function refreshFilter() {
        switch (filterState) {
            case "all": $('#filter-all-tasks-and-documents_dashlet').click(); break;
            case "week": $('#filter-date-week-tasks-and-documents_dashlet').click(); break;
            case "month": $('#filter-date-month-tasks-and-documents_dashlet').click(); break;
            case "year": $('#filter-date-year-tasks-and-documents_dashlet').click(); break;
            case "off": $('#filter-date-off-tasks-and-documents_dashlet').click(); break;
        }
    }

    function getGridData() {
        //var oldParamMenu = clone(paramMenu);
        param = $.extend({}, paramFilter, paramMenu);
        if (param != null)
            param = encodeURIComponent(JSON.stringify(param));
        //paramMenu = oldParamMenu;

        window.BTL["fun"] = fun;
        $.get(
        	window.BTL["currentGrid"].url || window.BTL["queryURL"],//"/share/proxy/alfresco/tasks-and-documents/get-all",
            {
                param: param,
                author: author,
                executor: executor,
                role: role,
                fun: fun
            },
            setDataModelGrid
        ).error(function (response) {
                $grid.pqGrid("hideLoading");
                if (Number(response.status) == 401) {
                    window.location.href = "/share/page/";
                    require(["dojo/topic"], function (topic) {
                        topic.publish("ALF_DISPLAY_NOTIFICATION", {message: "Время ссессии истекло."});
                    });
                }
            }
        );                
    }

    function getGridDataRefgesh() {
        //var oldParamMenu = clone(paramMenu);
        param = $.extend({}, paramFilter, paramMenu);
        if (param != null)
            param = encodeURIComponent(JSON.stringify(param));
        //paramMenu = oldParamMenu;

        window.BTL["fun"] = fun;
        $.get(
        	window.BTL["currentGrid"].url || window.BTL["queryURL"],//"/share/proxy/alfresco/tasks-and-documents/get-all",
            {
                param: param,
                author: author,
                executor: executor,
                role: role,
                fun: fun
            },
            setDataModelGridRefresh
        ).error(function (response) {
                $grid.pqGrid("hideLoading");
                if (Number(response.status) == 401) {
                    window.location.href = "/share/page/";
                    require(["dojo/topic"], function (topic) {
                        topic.publish("ALF_DISPLAY_NOTIFICATION", {message: "Время ссессии истекло."});
                    });
                }
            }
        );                
    }


    document.refreshGrid = getGridDataRefgesh;

    function setDataModelGridRefresh(data, status, xhr) {

    	window.BTL["currentGrid"].pqGrid("showLoading");    	
        data = preProcessingDataGrid(data);
        
        if (document.openRow)
    	{
        	var items = [];
	        for(var i in data.items)
	    	{
	        	
	        	if (!(data.items[i].nodeRef == document.openRow.nodeRef && document.openRow.status &&  data.items[i].status != document.openRow.status))
	        	{
	        		items.push(data.items[i]);
	        	}	//data.items = data.items.splice(i, 1);
	    	}
	        data.items = items;
    	}
        
        window.data = data;
        
        window.BTL["currentGrid"].pqGrid("option", "dataModel", {data: data.items, location: "local", sorting: "local"});
        if (data.func == "mail_input" || data.func == "mail_out")
    	{
	        window.BTL["currentGrid"].pqGrid("option", "dataModel.sortIndx", "regDate");
	    	window.BTL["currentGrid"].pqGrid( "option", "dataModel.sortDir", "doun" );
    	}
        
        window.BTL["currentGrid"].pqGrid("refreshDataAndView");     
        
        if (!window.BTL["currentGrid"].remote)
    	{
	        window.BTL["currentGrid"].pqGrid("option", "dataModel", {data: data.items, location: "local", sorting: "local"});  
	        if (data.func == "mail_input" || data.func == "mail_out")
	    	{
		        window.BTL["currentGrid"].pqGrid("option", "dataModel.sortIndx", "regDate");
		    	window.BTL["currentGrid"].pqGrid( "option", "dataModel.sortDir", "doun" );
	    	}
    	}
        
        
   	    window.BTL["currentGrid"].pqGrid("hideLoading");
   	    if (window.BTL["currentGrid"].reCount)
			window.BTL["currentGrid"].reCount();


        refreshFilter;
    }
    
    
    function preViewTaskGrid(grid, data) {
        grid.pqGrid("option", "dataModel", {data: data.items, location: "local", sorting: "local"});

        var getData = grid.pqGrid("option", "dataModel.data");
        if (!getData || getData.length < 1) {
            grid.pqGrid("option", "groupModel", null);
            grid.pqGrid("refreshView");
        } else {
            var checkbox = grid.find('input[name="grouping-of-document"]')[0];
            if (grid.pqGrid("option", "groupModel") != null) {
                grid.pqGrid("option", "groupModel", null);
                grid.pqGrid("refreshView");
            }
            eventGroupingOfDocument(checkbox);
            grid.pqGrid("refreshView");
        }
    }

    function preViewDocGrid(grid, data) {
        grid.pqGrid("option", "dataModel", {
            data: data.items,
            location: "local",
            sorting: "local",
            sortIndx: ["regDate", "regNum"],
            sortDir: ["down", "down"]
        });
        grid.pqGrid("refreshView");
    }

    /***
     * Сбросит кеш у фильтра колонки и добавит текущие данные
     * Работает только с простыми фильтрами типа "select", без группировки
     * @param $grid - объект таблицы
     * @param dataIndx - индекс колонки
     */
    function refreshColumnFilter($grid, dataIndx){
        var c = $grid.pqGrid("getColumn", { dataIndx: dataIndx });
        var f = c.filter;
        f.cache = null;
        f.options =  $grid.pqGrid("getData", { dataIndx: [dataIndx] });
    }

    function setDataModelGrid(data, status, xhr) {
        data = preProcessingDataGrid(data);


        if (data.func != "allDocs") {
            switch (data.func) {
                case "newTasks":
                    var isCount = $("#menu-new-tasks-and-documents_dashlet span")[1];
                    (isCount) ? isCount.innerHTML = " (" + data.items.length + ")" : "";
                    preViewTaskGrid(window.BTL["newTasksGrid"], data);
                    if (data.items.length > 0) {
                        var column = window.BTL["newTasksGrid"].pqGrid("getColumn", {dataIndx: "status"});
                        var filter = column.filter;
                        filter.cache = null;
                        filter.options = window.BTL["newTasksGrid"].pqGrid("getData", {dataIndx: ["status"]});

                        column = window.BTL["newTasksGrid"].pqGrid("getColumn", {dataIndx: "type"});
                        filter = column.filter;
                        filter.cache = null;
                        filter.options = window.BTL["newTasksGrid"].pqGrid("getData", {dataIndx: ["type"]});
                        window.BTL["newTasksGrid"].pqGrid("refreshDataAndView");
                    }
                    countBetweenDate(data);
                    break;
                case "inWorkTasks":

                    var isCount = $("#menu-inWork-tasks-and-documents_dashlet span")[1];
                    (isCount) ? isCount.innerHTML = " (" + data.items.length + ")" : "";
                    preViewTaskGrid(window.BTL["inWorkTasks"], data);
                    if (data.items.length > 0) {
                        var column = window.BTL["inWorkTasks"].pqGrid("getColumn", {dataIndx: "status"});
                        var filter = column.filter;
                        filter.cache = null;
                        filter.options = window.BTL["inWorkTasks"].pqGrid("getData", {dataIndx: ["status"]});

                        column = window.BTL["inWorkTasks"].pqGrid("getColumn", {dataIndx: "type"});
                        filter = column.filter;
                        filter.cache = null;
                        filter.options = window.BTL["inWorkTasks"].pqGrid("getData", {dataIndx: ["type"]});
                        window.BTL["inWorkTasks"].pqGrid("option", "dataModel.sortIndx", ["duration"]);
                        window.BTL["inWorkTasks"].pqGrid("option", "dataModel.sortDir", ["up"]);
                        window.BTL["inWorkTasks"].pqGrid("refreshDataAndView");
                    }
                    countBetweenDate(data);
                    var inWorkTasksLoadedEvent = new CustomEvent("inWorkTasksLoaded");
                    document.dispatchEvent(inWorkTasksLoadedEvent);
                    break;
                case "childTasksEnd":

                    var isCount = $("#filter-child-tasks-end-and-documents_dashlet span")[1];
                    (isCount) ? isCount.innerHTML = " (" + data.items.length + ")" : "";
                    preViewTaskGrid(window.BTL["inWorkTasks"], data);
                    if (data.items.length > 0) {
                        var column = window.BTL["inWorkTasks"].pqGrid("getColumn", {dataIndx: "status"});
                        var filter = column.filter;
                        filter.cache = null;
                        filter.options = window.BTL["inWorkTasks"].pqGrid("getData", {dataIndx: ["status"]});

                        column = window.BTL["inWorkTasks"].pqGrid("getColumn", {dataIndx: "type"});
                        filter = column.filter;
                        filter.cache = null;
                        filter.options = window.BTL["inWorkTasks"].pqGrid("getData", {dataIndx: ["type"]});
                        window.BTL["inWorkTasks"].pqGrid("option", "dataModel.sortIndx", ["duration"]);
                        window.BTL["inWorkTasks"].pqGrid("option", "dataModel.sortDir", ["up"]);
                        window.BTL["inWorkTasks"].pqGrid("refreshDataAndView");
                    }
                    countBetweenDate(data);
                    break;
                case "assignedTasks":
                    var isCount = $("#menu-assigned-tasks-and-documents_dashlet span")[1];
                    (isCount) ? isCount.innerHTML = " (" + data.items.length + ")" : "";
                    preViewTaskGrid(window.BTL["assignedTasks"], data);
                    var filterObject = [{dataIndx: "status", condition: "regexp", value: "^(?!Завершено).*"}];

                    var column = window.BTL["assignedTasks"].pqGrid("getColumn", {dataIndx: "type"});
                    var filter = column.filter;
                    filter.cache = null;
                    filter.options = window.BTL["assignedTasks"].pqGrid("getData", {dataIndx: ["type"]});
                    window.BTL["assignedTasks"].pqGrid("filter", {oper: 'replace', data: filterObject});
                    window.BTL["assignedTasks"].pqGrid("refreshDataAndView");
                    countBetweenDate(data);
                    break;
                case "onControlTasks":
                    var isCount = $("#menu-onControl-tasks-and-documents_dashlet span")[1];
                    (isCount) ? isCount.innerHTML = " (" + data.items.length + ")" : "";
                    preViewTaskGrid(window.BTL["onControlTasks"], data);
                    if (data.items.length > 0) {
                        var column = window.BTL["onControlTasks"].pqGrid("getColumn", {dataIndx: "status"});
                        var filter = column.filter;
                        filter.cache = null;
                        filter.options = window.BTL["onControlTasks"].pqGrid("getData", {dataIndx: ["status"]});

                        column = window.BTL["onControlTasks"].pqGrid("getColumn", {dataIndx: "type"});
                        filter = column.filter;
                        filter.cache = null;
                        filter.options = window.BTL["onControlTasks"].pqGrid("getData", {dataIndx: ["type"]});
                        window.BTL["onControlTasks"].pqGrid("refreshDataAndView");
                    }
                    countBetweenDate(data);
                    break;
                case "delegateTasks":
                    var isCount = $("#menu-delegate-tasks-and-documents_dashlet span")[1];
                    (isCount) ? isCount.innerHTML = " (" + data.items.length + ")" : "";
                    preViewTaskGrid(window.BTL["delegateTasks"], data);

                    var column = window.BTL["delegateTasks"].pqGrid("getColumn", {dataIndx: "type"});
                    var filter = column.filter;
                    filter.cache = null;
                    filter.options = window.BTL["delegateTasks"].pqGrid("getData", {dataIndx: ["type"]});
                    countBetweenDate(data);
                    break;
                case "onWaitingCompletesTasks":
                    var isCount = $("#menu-waitingCompletes-tasks-and-documents_dashlet span")[1];
                    (isCount) ? isCount.innerHTML = " (" + data.items.length + ")" : "";
                    preViewTaskGrid(window.BTL["waitingCompletes"], data);
                    if (data.items.length > 0) {
                        var column = window.BTL["waitingCompletes"].pqGrid("getColumn", {dataIndx: "status"});
                        var filter = column.filter;
                        filter.cache = null;
                        filter.options = window.BTL["waitingCompletes"].pqGrid("getData", {dataIndx: ["status"]});

                        column = window.BTL["waitingCompletes"].pqGrid("getColumn", {dataIndx: "type"});
                        filter = column.filter;
                        filter.cache = null;
                        filter.options = window.BTL["waitingCompletes"].pqGrid("getData", {dataIndx: ["type"]});
                        window.BTL["waitingCompletes"].pqGrid("refreshDataAndView");
                    }
                    countBetweenDate(data);
                    break;
                case "draftTasks":
                    var isCount = $("#menu-draft-tasks-and-documents_dashlet span")[1];
                    (isCount) ? isCount.innerHTML = " (" + data.items.length + ")" : "";
                    preViewTaskGrid(window.BTL["draftTasks"], data);
                    var column = window.BTL["draftTasks"].pqGrid("getColumn", {dataIndx: "type"});
                    var filter = column.filter;
                    filter.cache = null;
                    filter.options = window.BTL["draftTasks"].pqGrid("getData", {dataIndx: ["type"]});
                    countBetweenDate(data);
                    break;
                case "delegateMeTasks":
                    var isCount = $("#menu-delegateMe-tasks-and-documents_dashlet span")[1];
                    (isCount) ? isCount.innerHTML = " (" + data.items.length + ")" : "";
                    preViewTaskGrid(window.BTL["delegateMeTasks"], data);
                    if (data.items.length > 0) {
                        var column = window.BTL["delegateMeTasks"].pqGrid("getColumn", {dataIndx: "status"});
                        var filter = column.filter;
                        filter.cache = null;
                        filter.options = window.BTL["delegateMeTasks"].pqGrid("getData", {dataIndx: ["status"]});

                        column = window.BTL["delegateMeTasks"].pqGrid("getColumn", {dataIndx: "type"});
                        filter = column.filter;
                        filter.cache = null;
                        filter.options = window.BTL["delegateMeTasks"].pqGrid("getData", {dataIndx: ["type"]});
                        window.BTL["delegateMeTasks"].pqGrid("refreshDataAndView");
                    }
                    countBetweenDate(data);
                    break;
                case "tasksFromMyDirector":
                    var isCount = $("#menu-tasksFromMyDirector-tasks-and-documents_dashlet span")[1];
                    (isCount) ? isCount.innerHTML = " (" + data.items.length + ")" : "";
                    preViewTaskGrid(window.BTL["tasksFromMyDirector"], data);
                    if (data.items.length > 0) {
                        var column = window.BTL["tasksFromMyDirector"].pqGrid("getColumn", {dataIndx: "status"});
                        var filter = column.filter;
                        filter.cache = null;
                        filter.options = window.BTL["tasksFromMyDirector"].pqGrid("getData", {dataIndx: ["status"]});

                        column = window.BTL["tasksFromMyDirector"].pqGrid("getColumn", {dataIndx: "type"});
                        filter = column.filter;
                        filter.cache = null;
                        filter.options = window.BTL["tasksFromMyDirector"].pqGrid("getData", {dataIndx: ["type"]});
                        window.BTL["tasksFromMyDirector"].pqGrid("refreshDataAndView");
                    }
                    countBetweenDate(data);
                    break;
                case "completeMe":
                    var isCount = $("#menu-complete-me-tasks-and-documents_dashlet span")[1];
                    (isCount) ? isCount.innerHTML = " (" + data.items.length + ")" : "";
                    preViewTaskGrid(window.BTL["completeMe"], data);

                    var column = window.BTL["completeMe"].pqGrid("getColumn", {dataIndx: "type"});
                    var filter = column.filter;
                    filter.cache = null;
                    filter.options = window.BTL["completeMe"].pqGrid("getData", {dataIndx: ["type"]});
                    countBetweenDate(data);
                    break;
                case "completeFromMe":
                    var isCount = $("#menu-complete-from-me-tasks-and-documents_dashlet span")[1];
                    (isCount) ? isCount.innerHTML = " (" + data.items.length + ")" : "";
                    preViewTaskGrid(window.BTL["completeFromMe"], data);
                    var column = window.BTL["completeFromMe"].pqGrid("getColumn", {dataIndx: "type"});
                    var filter = column.filter;
                    filter.cache = null;
                    filter.options = window.BTL["completeFromMe"].pqGrid("getData", {dataIndx: ["type"]});
                    countBetweenDate(data);
                    break;
                case "draftDocs":
                    var isCount = $("#menu-draft-docs-tasks-and-documents_dashlet span")[1];
                    (isCount) ? isCount.innerHTML = " (" + data.items.length + ")" : "";
                    preViewDocGrid(window.BTL["draftDocs"], data);
                    var column = window.BTL["draftDocs"].pqGrid("getColumn", {dataIndx: "type"});
                    var filter = column.filter;
                    filter.cache = null;
                    filter.options = window.BTL["draftDocs"].pqGrid("getData", {dataIndx: ["type"]});
                    break;
                case "considerationDocs":
                    var isCount = $("#menu-consideration-tasks-and-documents_dashlet span")[1];
                    (isCount) ? isCount.innerHTML = " (" + data.items.length + ")" : "";
                    preViewDocGrid(window.BTL["considerationDocs"], data);
                    refreshColumnFilter(window.BTL["considerationDocs"], "type");
                    refreshColumnFilter(window.BTL["considerationDocs"], "level");
                    window.BTL["considerationDocs"].pqGrid("refreshDataAndView");
                    break;
                case "delegateConsiderationDocs":
                    var isCount = $("#menu-delegateConsideration-tasks-and-documents_dashlet span")[1];
                    (isCount) ? isCount.innerHTML = " (" + data.items.length + ")" : "";
                    preViewDocGrid(window.BTL["delegateConsiderationDocs"], data);
                    refreshColumnFilter(window.BTL["delegateConsiderationDocs"], "type");
                    refreshColumnFilter(window.BTL["delegateConsiderationDocs"], "level");
                    window.BTL["delegateConsiderationDocs"].pqGrid("refreshDataAndView");
                    break;
                case "myDocs":
                    var isCount = $("#menu-my-docs-tasks-and-documents_dashlet span")[1];
                    (isCount) ? isCount.innerHTML = " (" + data.items.length + ")" : "";
                    preViewDocGrid(window.BTL["myDocs"], data);

                    var column = window.BTL["myDocs"].pqGrid("getColumn", {dataIndx: "type"});
                    var filter = column.filter;
                    filter.cache = null;
                    filter.options = window.BTL["myDocs"].pqGrid("getData", {dataIndx: ["type"]});

                    var column = window.BTL["myDocs"].pqGrid("getColumn", {dataIndx: "level"});
                    var filter = column.filter;
                    filter.cache = null;
                    filter.options = window.BTL["myDocs"].pqGrid("getData", {dataIndx: ["level"]});

                    column = window.BTL["myDocs"].pqGrid("getColumn", {dataIndx: "status"});
                    filter = column.filter;
                    filter.cache = null;
                    filter.options = window.BTL["myDocs"].pqGrid("getData", {dataIndx: ["status"]});

                    window.BTL["myDocs"].pqGrid("refreshHeader");
                    break;
                case "onExecuteTasks":
                    preViewTaskGrid(window.BTL["onExecuteTasks"], data);
                    var filterObject = [{dataIndx: "status", condition: "regexp", value: "^(?!Завершено).*"}];
                    window.BTL["onExecuteTasks"].pqGrid("filter", {oper: 'replace', data: filterObject});
                    filterOnExecuteTasks(null, null);

                    var column = window.BTL["onExecuteTasks"].pqGrid("getColumn", {dataIndx: "type"});
                    var filter = column.filter;
                    filter.cache = null;
                    filter.options = window.BTL["onExecuteTasks"].pqGrid("getData", {dataIndx: ["type"]});
                    window.BTL["onExecuteTasks"].pqGrid("refreshDataAndView");
                    countBetweenDate(data);
                    break;
                    
                case "mail_input":
                	var isCount = $("#menu-mails-input_dashlet span")[1];
                    (isCount) ? isCount.innerHTML = " (" + data.noReadCount + ")" : "";
                	
                	preViewDocGrid(window.BTL["mail_input"], data);           
                	window.BTL["mail_input"].pqGrid("option", "dataModel.sortIndx", "regDate");
                	window.BTL["mail_input"].pqGrid( "option", "dataModel.sortDir", "doun" );
                    window.BTL["mail_input"].pqGrid("refreshDataAndView");
                    break;
                case "mail_out":
                    var isCount = $("#menu-mails-out_dashlet span")[1];
                    (isCount) ? isCount.innerHTML = " (" + data.cnt_whole + ")" : "";

                	preViewDocGrid(window.BTL["mail_out"], data);
                	window.BTL["mail_out"].pqGrid("option", "dataModel.sortIndx", "regDate");
                	window.BTL["mail_out"].pqGrid( "option", "dataModel.sortDir", "doun" );
                    window.BTL["mail_out"].pqGrid("refreshDataAndView");                	
                    break;
            }
        } else {
            preViewDocGrid(window.BTL["allDocs"], data);
            var column = window.BTL["allDocs"].pqGrid("getColumn", {dataIndx: "type"});
            var filter = column.filter;
            filter.cache = null;
            filter.options = window.BTL["allDocs"].pqGrid("getData", {dataIndx: ["type"]});
            window.BTL["allDocs"].pqGrid("refreshHeader");
        }
        $grid.pqGrid("hideLoading");

    }

    function preProcessingDataGrid(response) {
        response.items.forEach(function (item, i, arr) {
       	       	   
        	if (response.func && response.func == "mail_input") {
        		if (item.readRefs.indexOf(Alfresco.constants.USERNAME) < 0) {
        			item.pq_rowcls = "rowcls_bold";
    			}   
    		}
        	
            if (item.level == "true") response.items[i].level = '<span style="margin: auto;" class="icon-yellow-star"></span>';
            if (item.level == "false") response.items[i].level = '<span style="margin: auto;" class="icon-star"></span>';

            if (item.existFile == "true")response.items[i].existFile = '<span style="margin: auto;" class="icon-clip"></span>';

            if (item.author) {
                if((response.func == 'considerationDocs' || response.func == 'delegateConsiderationDocs') && item.type == 'Входящий'){

                }else{
                    var name = item.author.split(" ");
                    item.author = (name[0]) ? name[0] + " " : "";
                    item.author += (name[1]) ? name[1].slice(0, 1) + "." : "";
                    item.author += (name[2]) ? name[2].slice(0, 1) + "." : "";
                }
            }
            if (item.executor) {
                var name = item.executor.split(" ");
                item.executor = (name[0]) ? name[0] + " " : "";
                item.executor += (name[1]) ? name[1].slice(0, 1) + "." : "";
                item.executor += (name[2]) ? name[2].slice(0, 1) + "." : "";
            }
            //-------------------- замена " на html символ --------------------------------
            if (item.parentTaskNameValue) {
                item.parentTaskNameValue = item.parentTaskNameValue.replace(/"+/g, "&quot;");
            }
            if (item.doc) {
                item.doc = item.doc.replace(/"+/g, "&quot;");
            }

            //-----------------------------------------------------------------------------
            if (response.func == "onExecuteTasks" ||
                response.func == "assignedTasks" ||
                response.func == "inWorkTasks" ||
                response.func == "onControlTasks"
            ) {
                if (item.color) {
                    item["pq_rowcls"] = item.color;
                }
                if(item.duration){
                    var toDay = new Date();
                    toDay.setDate(toDay.getDate() + 3);
                    // var toDay = new Date().addDays(3);
                    toDay.setHours(0, 0, 0, 0);
                    if ( item.status != "Завершено" && toDay >= fromClientFormatDateToDate(item.duration)) {
                        item.urgently = "true";
                    } else {
                        item.urgently = "false";
                    }
                }
            } else {
                if (item.actualEndDate) {
                    var durationBuf = item.duration.split('-');
                    var durationDay = (durationBuf.length > 2) ? new Date(durationBuf[2], durationBuf[1] - 1, durationBuf[0]) : null;

                    var actualEndDateBuf = item.actualEndDate.split('-');
                    var actualEndDate = (actualEndDateBuf.length > 2) ? new Date(actualEndDateBuf[2], actualEndDateBuf[1] - 1, actualEndDateBuf[0]) : null;

                    if (durationDay != null && actualEndDateBuf != null && durationDay < actualEndDate) {
                        item["pq_rowcls"] = "overdue-tasks";
                    }
                } else if (item.duration) {
                    var durationBuf = item.duration.split('-');
                    var durationDay = (durationBuf.length > 2) ? new Date(durationBuf[2], durationBuf[1] - 1, durationBuf[0]) : null;
                    var toDay = new Date();
                    toDay.setHours(0, 0, 0, 0);

                    if (durationDay != null && (durationDay <= toDay)) {
                        item["pq_rowcls"] = "overdue-tasks";
                    }
                }
            }
            //runtime--------------------------------------------------------
            if (!item.isWF)
                item.runtime = '<a href = "/share/page/btl-edit-metadata?nodeRef=' + item.nodeRef + '"><center>Открыть</center></a>';
        });
        return response;
    }

    function formatDateStart(date) {
        date.setDate(date.getDate() - 1);
        date.setHours(23, 59, 59, 0);
        return date;
    }

    function formatDateEnd(date) {
        date.setHours(23, 59, 59, 0);
        return date;
    }

    function formatClientDate(date) {
        return ((date.getDate() > 9)? date.getDate() : (String("0" + date.getDate())) ) + "-" +
               (((date.getMonth() + 1) > 9 ) ? (date.getMonth() + 1) : ( String("0" + (date.getMonth() + 1)) ) ) + "-" +
                date.getFullYear();
    }

    function fromClientFormatDateToDate(date) {
        var bufDate = date.split('.');
        date = new Date(bufDate[2], bufDate[1] - 1, bufDate[0]);
        return date;
    }

    function cleanMenuSetting() {
        $('.item-first-filters').removeClass("active");
        $('#filter-all-tasks-and-documents_dashlet').addClass("active");
        $grid.pqGrid("option", "colModel").forEach(function (item, index) {
            if (item.filter) {
                if (item.dataIndx == "status") {

                }
                else if (item.dataIndx == "duration") {
                    item.filter.value = "";
                    item.filter.value2 = "";
                } else {
                    item.filter.value = "";
                }
            }
        });
        fun = '';
        var checkboxUrgently = window.BTL["currentGrid"].find("input[name='TasksUrgently']")[0];
        if(checkboxUrgently){
            checkboxUrgently.checked = false;
        }
        var checkboxSpecControl = window.BTL["currentGrid"].find("input[name='specialControl']")[0];
        if(checkboxSpecControl){
            checkboxSpecControl.checked = false;
        }
        window.BTL["currentGrid"].pqGrid("refreshView");
    }

    function clone(o) {
        return eval("(" + JSON.stringify(o) + ")");
    }

    function renderMenu() {
        //Отрисовка меню если есть файл с конфигурацией
        var settingTaskAndDocument = window.BTL["settingTaskAndDocument"];
        var rootElement = document.getElementById('left-column-tasks-and-documents_dashlet');
        rootElement.innerHTML = "";
        if (settingTaskAndDocument) {
            for (menu in settingTaskAndDocument) {
                var menuEl = document.createElement('div');
                menuEl.setAttribute("id", settingTaskAndDocument[menu].id);
                var divHeader = document.createElement('div');
                var h3Header = document.createElement('h3');
                h3Header.textContent = settingTaskAndDocument[menu].name;
                divHeader.appendChild(h3Header);
                divHeader.classList.add("title");
                menuEl.appendChild(divHeader);
                rootElement.appendChild(menuEl);
                for (submenu in settingTaskAndDocument[menu].submenu) {
                    var valSubmenu = settingTaskAndDocument[menu].submenu[submenu];
                    var values = valSubmenu.value.filter(filterByIsVisible);
                    if (values.length < 1)
                        continue;
                    if (submenu != "main") {
                        var divHeaderSubMenu = document.createElement('div');
                        var h4Header = document.createElement('h3');
                        h4Header.textContent = settingTaskAndDocument[menu].submenu[submenu].name;
                        divHeaderSubMenu.appendChild(h4Header);
                        divHeaderSubMenu.classList.add("title");
                        menuEl.appendChild(divHeaderSubMenu);
                    }
                    if (values.length > 1)
                        values.sort(sortByPosition);
                    for (item in values) {
                        if (!sessionStorage.getItem("menuTasksAndDocsItem") && values[item].isMain) {
                            sessionStorage.setItem('menuTasksAndDocsItem', values[item].id);
                        }
                        var itemEl = document.createElement('div');
                        itemEl.setAttribute("id", values[item].id);
                        itemEl.classList.add("item-menu");
                        var itemElName = document.createElement('span');
                        itemElName.textContent = values[item].aliasName || values[item].name;
                        itemEl.appendChild(itemElName);
                        menuEl.appendChild(itemEl);
                    }
                }
            }
        } else {

        }
    }

    function sortByPosition(a, b) {
        return a.position - b.position;
    }

    function filterByIsVisible(item) {
        if (item.visible) {
            return true;
        } else {
            return false;
        }
    }
    
    function getDateWithoutTime(date) {
        return date.setHours(0,0,0,0);
    }

    function countBetweenDate(data){
        if(data.items.length > 0) {
            //подсчет задач на неделю
            var date = new Date();
            var srartWeek = new Date();
            var endWeek = new Date();

            srartWeek.setDate(date.getDate() - date.getUTCDay() + 1);
            endWeek.setDate(date.getDate() + (7 - date.getUTCDay()));
            var count = taskBetweenDateCount(data.items, getDateWithoutTime(srartWeek), getDateWithoutTime(endWeek));
            countInWeek.html("(" + count + ")");

            //подсчет задач на месяц
            var startMonth = new Date();
            var endMonth = new Date();
            startMonth.setFullYear(date.getFullYear(), date.getMonth(), 1);
            endMonth.setFullYear(date.getFullYear(), date.getMonth(), date.daysInMonth());
            count = taskBetweenDateCount(data.items, getDateWithoutTime(startMonth), getDateWithoutTime(endMonth));
            countInMonth.html("(" + count + ")");

            //подсчет задач на год
            var startYear = new Date();
            var endYear = new Date();
            startYear.setFullYear(date.getFullYear(), 0, 1);
            endYear.setFullYear(date.getFullYear(), 11, 31);
            count = taskBetweenDateCount(data.items, getDateWithoutTime(startYear), getDateWithoutTime(endYear));
            countInYear.html("(" + count + ")");

            //подсчет просроченых задач
            var date = new Date();
            var startDateOff = null;
            var endDateOff = new Date();
            endDateOff.setDate(date.getDate() - 1);
            count = taskBetweenDateCount(data.items, startDateOff, getDateWithoutTime(endDateOff), true);
            countDateOff.html("(" + count + ")");
        }else{
            countInWeek.html("(0)");
            countInMonth.html("(0)");
            countInYear.html("(0)");
            countDateOff.html("(0)");
        }
    }
});

function eventGroupingOfDocument(element) {
    if (element.checked) {
        var getData = window.BTL["currentGrid"].pqGrid("option", "dataModel.data");
        if (!getData || getData.length < 1) {
            window.BTL["currentGrid"].pqGrid("option", "groupModel", null);
            window.BTL["currentGrid"].pqGrid("refreshView");
        } else {
            window.BTL["currentGrid"].pqGrid("option", "dataModel.sortIndx", ["doc", "parentTaskNameValue"]);
            window.BTL["currentGrid"].pqGrid("option", "dataModel.sortDir", ["down", "down"]);

            //window.BTL["currentGrid"].pqGrid( "refreshDataAndView" );
            var groupModel = {
                dataIndx: (window.BTL["fun"] == "onExecuteTasks") ? ["doc_group", "parentTaskNameValue"] : ["doc_group"],
                collapsed: (window.BTL["fun"] == "onExecuteTasks") ? [false, false] : [false],
                title: (window.BTL["fun"] == "onExecuteTasks") ? ["<b style='font-weight:bold;'>{0}</b>", "{0}"] : ["<b style='font-weight:bold;'>{0}</b>"],
                dir: ["up", "down"]
            };
            window.BTL["currentGrid"].pqGrid("option", "groupModel", groupModel);
            window.BTL["currentGrid"].pqGrid("refreshView");
        }
    } else {
        window.BTL["currentGrid"].pqGrid("option", "groupModel", null);
        window.BTL["currentGrid"].pqGrid("option", "dataModel.sortIndx", ["doc", "parentTaskNameValue"]);
        window.BTL["currentGrid"].pqGrid("option", "dataModel.sortDir", ["down", "down"]);
        window.BTL["currentGrid"].pqGrid("refreshView");
    }
}

function eventGroupingOfDocumentRefreshView(element) {
    if (element.checked) {
        var getData = window.BTL["currentGrid"].pqGrid("option", "dataModel.data");
        if (!getData || getData.length < 1) {
            window.BTL["currentGrid"].pqGrid("option", "groupModel", null);
            window.BTL["currentGrid"].pqGrid("refreshView", {header: false});
        } else {
            window.BTL["currentGrid"].pqGrid("option", "dataModel.sortIndx", ["doc", "parentTaskNameValue"]);
            window.BTL["currentGrid"].pqGrid("option", "dataModel.sortDir", ["down", "down"]);

            //window.BTL["currentGrid"].pqGrid( "refreshView",{header: false} );
            var groupModel = {
                dataIndx: (window.BTL["fun"] == "onExecuteTasks") ? ["doc_group", "parentTaskNameValue"] : ["doc_group"],
                collapsed: (window.BTL["fun"] == "onExecuteTasks") ? [false, false] : [false],
                title: (window.BTL["fun"] == "onExecuteTasks") ? ["<b style='font-weight:bold;'>{0}</b>", "{0}"] : ["<b style='font-weight:bold;'>{0}</b>"],
                dir: ["up", "down"]
            };
            window.BTL["currentGrid"].pqGrid("option", "groupModel", groupModel);
            window.BTL["currentGrid"].pqGrid("refreshView", {header: false});
        }
    } else {
        window.BTL["currentGrid"].pqGrid("option", "groupModel", null);
        window.BTL["currentGrid"].pqGrid("option", "dataModel.sortIndx", ["doc", "parentTaskNameValue"]);
        window.BTL["currentGrid"].pqGrid("option", "dataModel.sortDir", ["down", "down"]);
        window.BTL["currentGrid"].pqGrid("refreshView", {header: false});
    }
}



function taskBetweenDateCount(data, date1, date2, noComplite){
   var result = data.filter(function(item){
       if (item["duration"] && dateParse(item["duration"]) >= date1 && dateParse(item["duration"]) <= date2 && (!noComplite || item.status != "Завершено")) {
           return true;
       }
   });

    return result.length;
}

function dateParse(date) {
    var dateBuf = [];
    if(date[2] == '-') {
        dateBuf = $.trim(date).split('-');
    }
    if(date[2] == '.'){
        dateBuf = $.trim(date).split('.');
    }
    if (dateBuf.length < 2)
        return 0;
    return new Date(dateBuf[2], Number(dateBuf[1] - 1), dateBuf[0]);
}

function refreshGrid() {
    $("div.item-menu.active").click();
    cleanCurFilterTab();
}

function _refreshGrid() {
    $("div.item-menu.active").click();
    cleanCurFilterTab();
}
function _deleteSelectedMails(){
	       
        window.BTL["currentGrid"].pqGrid("showLoading");     
        var data = window.BTL["currentGrid"].pqGrid("option", "dataModel.data");
        var nodesForDel = [];        
        $.each(data, function (key, value) {
            if (value["sel"] == true) {            	
            	nodesForDel.push(value["nodeRef"]);            	
            }
        });
        
        if (nodesForDel.length > 0)
    	{
        	var ans = window.confirm("Вы действительно хотите удалить выбранные письма?");
            if (ans) {            	            
		        Alfresco.util.Ajax.jsonPost({
		            url: "/share/proxy/alfresco/mailMessage/delete",
		            dataObj: {
		                "nodes": nodesForDel,
                        "fun": window.BTL["fun"]
		            },
		            successCallback: {
		                fn: function (response) {
		                	Alfresco.util.PopupManager.displayMessage(
	            			{
	            	        	text: "Письма удалены",
	            	        	displayTime: 1       	
	            	        });
		                	window.BTL["currentGrid"].pqGrid("hideLoading");
		                	_refreshGrid();
		                }
		            }
		        });
            }
    	}
        else
    	{
        	Alfresco.util.PopupManager.displayMessage(
			{
	        	text: "Нет выбранных элементов",
	        	displayTime: 1       	
	        });
        	window.BTL["currentGrid"].pqGrid("hideLoading");
    	}
               
    
}

function _selAllMails(check){
	require(["jquery"], function ($) {
        if (check.checked) {        
            
        	window.BTL["currentGrid"].pqGrid("selection",
                    {
                        type: 'row',
                        all: 'all',
                        method: 'selectAll'
                    }
                );
            
            
        } else {
        	
        	window.BTL["currentGrid"].pqGrid( "setSelection", null );
        	
            
        }
    });
}

function tasksAndDocumentsDashletSetSetting() {
    windowSettingTasksAndDocs.show();
}
