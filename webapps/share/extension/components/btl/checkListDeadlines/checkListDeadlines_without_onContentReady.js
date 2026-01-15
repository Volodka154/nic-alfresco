(function () {
    var Dom = YAHOO.util.Dom,
        Event = YAHOO.util.Event;

    Alfresco.CheckListDeadlines = function BTL_CheckListDeadlines(htmlId) {
        // Alfresco.CheckListDeadlines.superclass.constructor.call(this, "Alfresco.CheckListDeadlines", htmlId, []);
        this.name = "Alfresco.CheckListDeadlines";
        this.id = htmlId;
        this.eventSetValue = new YAHOO.util.CustomEvent("setValue", this);
        this.eventLoadSuccess = new YAHOO.util.CustomEvent("loadSuccess", this);
        return this;
    };

    Alfresco.CheckListDeadlines.prototype = {
        options: {
            url: "/share/proxy/alfresco/search/periodOfExecution",
            dataUrl: {
                type: "0"
            },
            renderData: "items",
            renderName: "name",
            iconCheck: ""
        },

        tableMainBody: null,
        endDate: null,
        value: {},
        eventSetValue: null,
        eventLoadSuccess: null,
        waitForAndDo: function waitForAndDo(ids, func, timeout, context){

            function isFunction(funcToCheck) {
                return funcToCheck && {}.toString.call(funcToCheck) === '[object Function]';
            }
            function waitFor(){
                function defCheckFunc(){
                    var isReady = true;
                    for(var i=0; i<ids.length; i++){
                        if($('#'+ids[i]).length==0){
                            isReady = false;
                            break;
                        }
                    }
                    return isReady;
                }

                var checkFunc = isFunction(ids) ?ids :defCheckFunc;

                return setInterval(function(){
                    if(checkFunc()) {
                        var logStr = "";
                        for(var i=0; i<ids.length; i++){
                            logStr += ids[i] + ", ";
                        }
                        // console.log("ready", logStr);
                        func.call(context);
                        clearInterval(intervalWaitFor);
                    }
                },100);
            }

            var intervalWaitFor = waitFor();

            setTimeout(function(){
                clearInterval(intervalWaitFor);
            },timeout ?timeout :10000);
        },
        waitReadyAndDo: function waitReadyAndDo() {
            this.value = {};//против "кеширования" значения, что бы setValue отрабатывал верно
            this.waitForAndDo([this.id], this.onReady, null, this);
            return this;
        },
        setOptions: function CheckListDeadlines_setOptions(obj) {
            if ('dataUrl' in obj) {
                this.options.dataUrl = YAHOO.lang.merge(this.options.dataUrl, obj.dataUrl);
                delete obj.dataUrl;
            }
            // Alfresco.CheckListDeadlines.superclass.setOptions.call(this, obj);

            return this;
        },
        init: function init() {
            Alfresco.constants.MM = new Alfresco.DatePicker(this.id + "-endTime", this.id + "-value").setOptions(
                {
                    currentValue: "",
                    showTime: false,
                    submitTime: false,
                    mandatory: false,
                    minToday: true
                }).setMessages({
                    "form.control.date-picker.choose": "Дата завершения:",
                    "form.control.date-picker.entry.date.format": "dd.MM.yyyy"
                }
            );
            /*var scope = this;
             var calendarInit = function(){
             Alfresco.constants.MM.widgets.calendar.selectEvent.scope = scope;
             Alfresco.constants.MM.widgets.calendar.selectEvent.subscribe(function(){

             });
             };
             setTimeout(calendarInit, 200);*/
        },
        getCurrentEndDateValue: function CheckListDeadlines_getCurrentEndDateValue() {
            return document.getElementById(this.id + "-value").innerHTML;
        },
        setCurrentEndDateValue: function CheckListDeadlines_setCurrentEndDateValue(date) {
            document.getElementById(this.id + "-value").value = this.formatDate(date);
            document.getElementById(this.id + "-endTime-date").value = date;
        },
        onReady: function CheckListDeadlines_onReady() {
            this.formCreate();
            this.loadData();
            this.init();
        },
        getCheckedNodeRefs: function getCheckedNodeRefs() {
            var values = [];
            var elements = this.tableMainBody.querySelectorAll(".checked");
            for (var i = 0; i < elements.length; i++) {
                values.push(elements[i].cells[2].innerHTML);
            }
            return values;
        },
        calculateDate: function CheckListDeadlines_calculateDate(dayType, tasktime, nodeRef) {
            var duration = "";
            var date = "";
            if (dayType == 1) {
                var d = new Date();

                var start_curr_date = (d.getDate().toString().length == 1) ? "0" + d.getDate() : d.getDate();
                var start_curr_month = ((d.getMonth() + 1).toString().length == 1) ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1);
                var start_curr_year = d.getFullYear();


                d.setDate(d.getDate() + Number(tasktime));
                var curr_date = (d.getDate().toString().length == 1) ? "0" + d.getDate() : d.getDate();
                var curr_month = ((d.getMonth() + 1).toString().length == 1) ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1);
                var curr_year = d.getFullYear();

                var url = '/share/proxy/alfresco/utils/get-workschedule-duration?dateFormat=dd.MM.yyyy&fromDate=' + start_curr_date + '.' + start_curr_month + '.' + start_curr_year + '&toDate=' + curr_date + '.' + curr_month + '.' + curr_year;

                var xmlHttp = new XMLHttpRequest();
                // Открыть соединение с сервером
                xmlHttp.open("GET", url, false);

                // SПередать запрос
                xmlHttp.send(null);

                datetext = xmlHttp.responseText.substring(9);
                duration = datetext;
                date = curr_date + '.' + curr_month + '.' + curr_year;
            }
            else {
                if(tasktime){
                    duration = tasktime;
                    var d = new Date();
                    var start_curr_date = d.getDate();
                    var start_curr_month = d.getMonth() + 1;
                    var start_curr_year = d.getFullYear();

                    var url = "/share/proxy/alfresco/utils/get-workschedule-completion-date?dateFormat=yyyy-MM-dd&fromDate=" + start_curr_year + '-' + start_curr_month + '-' + start_curr_date + "&duration=" + tasktime;

                    var xmlHttp = new XMLHttpRequest();
                    // Открыть соединение с сервером
                    xmlHttp.open("GET", url, false);

                    // Передать запрос
                    xmlHttp.send(null);

                    datetext = xmlHttp.responseText.substring(9, 19);
                    date = datetext.substring(8, 10) + "." + datetext.substring(5, 7) + "." + datetext.substring(0, 4);
                }else{
                    date = "";
                    duration = "";
                }
            }
            this.setValue(nodeRef, date, duration);
        },
        setValue: function CheckListDeadlines_setValue(nodeRef, date, duration) {
            if (!this.isEmpty(this.value)) {
                if (Number(this.value.duration) == 0 || (Number(duration) > 0 && Number(this.value.duration) > Number(duration))) {
                    this.value.duration = duration;
                    this.value.date = date;
                    this.value.nodeRef = nodeRef;
                    this.eventSetValue.fire();
                }
            } else {
                this.value["duration"] = duration;
                this.value["date"] = date;
                this.value["nodeRef"] = nodeRef;
                this.eventSetValue.fire();
            }
        },
        getValue: function getValue() {

            return (!this.isEmpty(this.value)) ? {
                duration: this.value.duration,
                date: this.formatDate(this.value.date),
                nodeRef: this.value.nodeRef
            } : null;
        },
        formatDate: function formatDate(date) {
            if (date) {
                var buf = date.split(".");
                date = buf[2] + "-" + buf[1] + "-" + buf[0];
            }
            return date;
        },
        formCreate: function CheckListDeadlines_onReady() {
            var main = document.getElementById(this.id);
            var tableMain = document.createElement('table');
            tableMain.width = "100%";
            tableMain.style.cursor = "default";
            var tableMainHead = document.createElement('thead');
            var headRow = tableMainHead.insertRow(-1);
            var checkCell = headRow.insertCell(0);
            checkCell.style = "width:5px;";
            var fioCell = headRow.insertCell(1);
            fioCell.innerHTML = "Срок исполнения";
            var nodeRefCell = headRow.insertCell(2);
            //nodeRefCell.style = "display: none; width:1px;"
            Dom.setStyle(nodeRefCell, 'display', 'none');
            Dom.setStyle(nodeRefCell, 'width', '1px');
            var durationCell = headRow.insertCell(3);
            //durationCell.style = "display: none; width:1px;"
            Dom.setStyle(durationCell, 'display', 'none');
            Dom.setStyle(durationCell, 'width', '1px');
            var dayTypeCell = headRow.insertCell(4);
            //dayTypeCell.style = "display: none; width:1px;"
            Dom.setStyle(dayTypeCell, 'display', 'none');
            Dom.setStyle(dayTypeCell, 'width', '1px');
            var dateCell = headRow.insertCell(5);
            //dateCell.style = "display: none; width:1px;"
            Dom.setStyle(dateCell, 'display', 'none');
            Dom.setStyle(dateCell, 'width', '1px');
            var tableMainBody = document.createElement('tbody');
            tableMainHead.setAttribute("onselectstart", "return false");
            tableMainHead.setAttribute("onmousedown", "return false");
            this.tableMainBody = tableMainBody;
            //tableMain.appendChild(tableMainHead);
            tableMain.appendChild(tableMainBody);
            main.insertBefore(tableMain, main.firstChild);
        },
        loadData: function CheckListDeadlines_loadData() {

            function createElementFromHTML(htmlString) {
                var div = document.createElement('div');
                div.innerHTML = htmlString.trim();
                return div.firstChild;
            }

            var onSuccess = function CheckList_load_success(response) {
                var items = response.json[this.options.renderData];
                var resolutions = document.getElementById(this.id);
                if(items.length>0) {
                    var title = createElementFromHTML("<span><b>Сроки<b></b></b></span>");
                    resolutions.insertBefore(title, resolutions.firstChild);
                }else{
                    resolutions.parentElement.style.display = "none";
                }
                var item;
                for (var i = 0, il = items.length; i < il; i++) {
                    item = items[i];
                    this.createItemCheck(item.nodeRef, item[this.options.renderName], item["time"], item["dayType"]);
                }
                this.eventLoadSuccess.fire();
            };

            var config = {
                url: this.options.url,
                dataObj: this.options.dataUrl,
                successCallback: {
                    fn: onSuccess,
                    scope: this
                }
            };
            Alfresco.util.Ajax.request(config);
        },
        createItemCheck: function CheckListDeadlines_createItemCheck(nodeRef, value, time, dayType) {
            var newRow = this.tableMainBody.insertRow(-1);
            newRow.id = nodeRef;
            var checkCell = newRow.insertCell(0);
            //checkCell.style = "width:5px;"
            Dom.setStyle(checkCell, 'width', '15px');
            var fioCell = newRow.insertCell(1);
            fioCell.innerHTML = value;
            var nodeRefCell = newRow.insertCell(2);
            //nodeRefCell.style = "display: none; width:1px;"
            Dom.setStyle(nodeRefCell, 'display', 'none');
            Dom.setStyle(nodeRefCell, 'width', '1px');
            nodeRefCell.innerHTML = nodeRef;
            var durationCell = newRow.insertCell(3);
            //durationCell.style = "display: none; width:1px;"
            Dom.setStyle(durationCell, 'display', 'none');
            Dom.setStyle(durationCell, 'width', '1px');
            durationCell.innerHTML = time;
            var dayTypeCell = newRow.insertCell(4);
            //dayTypeCell.style = "display: none; width:1px;"
            Dom.setStyle(dayTypeCell, 'display', 'none');
            Dom.setStyle(dayTypeCell, 'width', '1px');
            dayTypeCell.innerHTML = dayType;

            var click = function onClick(e) {
                if (Dom.hasClass(newRow, "checked")) {
                    Dom.removeClass(newRow, "checked");
                    Dom.removeClass(newRow.cells[0], "icon-check-list");
                    var checked = this.getChecked();
                    if (checked.length > 0) {
                        checked.sort(this.compareDuration);
                        this.value = {};
                        this.calculateDate(checked[0].dayType, checked[0].duration, checked[0].nodeRef);
                    } else {
                        this.value = {};
                        this.eventSetValue.fire();
                        //this.setCurrentEndDateValue("");
                        //this.calculateDate(checked[0].dayType,checked[0].duration,checked[0].nodeRef);
                    }
                } else {
                    Dom.addClass(newRow, "checked");
                    Dom.addClass(newRow.cells[0], "icon-check-list");
                    this.calculateDate(dayType, time, nodeRef);
                }
            };

            var handle = Event.addListener(newRow, "click", click, this, true);
        },
        isEmpty: function ObjectWindowChoiceItem_isEmpty(obj) {
            return Object.keys(obj).length === 0;
        },
        compareDuration: function compareDuration(Item1, Item2) {
            if(Item1.duration == "")
                return true;
            if(Item2.duration == "")
                return false;
            return Item1.duration - Item2.duration;
        },
        getChecked: function getChecked() {
            var values = [];
            var elements = this.tableMainBody.querySelectorAll(".checked");
            for (var i = 0; i < elements.length; i++) {
                values.push({
                    nodeRef: elements[i].cells[2].innerHTML,
                    dayType: elements[i].cells[4].innerHTML,
                    duration: elements[i].cells[3].innerHTML
                });
            }
            return values.sort(this.compareDuration);
        },
        clean: function clean() {
            var elements = this.tableMainBody.querySelectorAll(".checked");
            for (var i = 0; i < elements.length; i++) {
                Dom.removeClass(elements[i], "checked");
                Dom.removeClass(elements[i].cells[0], "icon-check-list");
                this.value = {};
                this.eventSetValue.fire();
            }
        },
        preSets: function (nodeRefs) {
            var _this = this;
            if (nodeRefs && nodeRefs.length > 0) {
                nodeRefs.forEach(function (nodeRef) {
                    var row = document.getElementById(nodeRef);
                    Dom.addClass(row, "checked");
                    Dom.addClass(row.cells[0], "icon-check-list");
                    _this.calculateDate(row.cells[4].textContent, row.cells[3].textContent, nodeRef);
                });
            }
        }

    };
})();