(function() {
    var Dom = YAHOO.util.Dom,
    Event = YAHOO.util.Event;
    var ua = window.navigator.userAgent.toLowerCase(),
    isIE = (/trident/gi).test(ua) || (/msie/gi).test(ua);

    Alfresco.CheckList = function BTL_CheckList(htmlId){
        Alfresco.CheckList.superclass.constructor.call(this, "Alfresco.CheckList", htmlId, []);
        this.eventLoadSuccess = new YAHOO.util.CustomEvent("loadSuccess" , this);
        return this;
    };

    YAHOO.extend(Alfresco.CheckList, Alfresco.component.Base, {
        options:{
            url:"/share/proxy/alfresco/filters/resource-executor",
            dataUrl:{
                extra:" ASPECT:'btl-people:firstExecutor'"
            },
            renderData:"items",
            renderName:"name",
            iconCheck:""
        },
        eventLoadSuccess: null,
        tableMainBody: null,
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
           this.waitForAndDo([this.id], this.whenReady, null, this);
           return this;
        },
        whenReady: function(){
           this.formCreate();
           this.loadData();
        },
        setOptions: function CheckList_setOptions(obj){
            if('dataUrl' in obj){
                this.options.dataUrl = YAHOO.lang.merge(this.options.dataUrl, obj.dataUrl);
                delete obj.dataUrl;
            }
            Alfresco.CheckList.superclass.setOptions.call(this, obj);

            this.options.isDelegate = obj.isDelegate;

            return this;
        },
        onReady: function CheckList_onReady(){
            // this.formCreate();
            // this.loadData();

            //this.setEvents();
        },
        formCreate: function CheckList_onReady(){
            var main = document.getElementById(this.id);
            var tableMain = document.createElement('table');
            tableMain.width="100%";
            tableMain.style.cursor = "default";
            var tableMainHead = document.createElement('thead');
            var headRow = tableMainHead.insertRow(-1);
            var checkCell = headRow.insertCell(0);
            checkCell.style = "width:5px;";
            var fioCell = headRow.insertCell(1);
            fioCell.innerHTML = "Ф.И.О.";
            var nodeRefCell = headRow.insertCell(2);
            nodeRefCell.style = "display: none; width:1px;";
            var tableMainBody = document.createElement('tbody');
            tableMainHead.setAttribute("onselectstart","return false");
            tableMainHead.setAttribute("onmousedown","return false");
            this.tableMainBody = tableMainBody;
            //tableMain.appendChild(tableMainHead);
            tableMain.appendChild(tableMainBody);
            main.appendChild(tableMain);
        },
        loadData: function CheckList_onReady(){

            var onSuccess = function CheckList_load_success(response){
                var items = response.json[this.options.renderData], item;
                for (var i = 0, il = items.length; i < il; i++)
                    {
                        item = items[i];
                        this.createItemCheck(item.nodeRef, item[this.options.renderName], false, false);
                    }
                this.eventLoadSuccess.fire();
            };
            var config = {
                url: this.options.url,
                dataObj: this.options.dataUrl,
                successCallback:{
                    fn: onSuccess,
                    scope: this
                }
            };
            Alfresco.util.Ajax.request(config);
        },
        createItemCheck: function CheckList_createItemCheck(nodeRef,value,checked,ovtExecutor){
            var newRow = this.tableMainBody.insertRow(-1);
            var checkCell = newRow.insertCell(0);
            //checkCell.style = "width:5px;"
            Dom.setStyle(checkCell, 'width', '51px');
            var fioCell = newRow.insertCell(1);
            fioCell.innerHTML = value;
            var nodeRefCell = newRow.insertCell(2);
            //nodeRefCell.style = "display: none; width:1px;"
            Dom.setStyle(nodeRefCell, 'display', 'none');
            Dom.setStyle(nodeRefCell, 'width', '1px');
            nodeRefCell.innerHTML = nodeRef;
            newRow.id = nodeRef;

            var isDelegate = this.options.isDelegate;
            var isCollective = this.options.isCollective;

            function unCheckIt(newRow) {
                Dom.removeClass(newRow,"checked");
                Dom.removeClass(newRow.cells[0],"icon-check-list");
                if(!isDelegate && newRow.querySelector('span.responsible-text')){
                    newRow.querySelector('span.responsible-text').parentNode.removeChild(newRow.querySelector('span.responsible-text'));
                    Dom.removeClass(newRow,"responsible");
                }
            }

            function checkIt(newRow) {
                Dom.addClass(newRow,"checked");
                Dom.addClass(newRow.cells[0],"icon-check-list");
            }

            function unCheckAll(newRow) {
                var $checkedRows = $(newRow).parent().find('.checked');
                $.each($checkedRows, function(index,row){
                    unCheckIt(row)
                });
            }

            var timeoutId;
            var click = function onClick(e){
                var onOneClick = function(){
                    if(Dom.hasClass(newRow,"checked")){
                        unCheckIt(newRow);
                    }else{
                        if(isDelegate){
                            unCheckAll(newRow);
                        }
                        checkIt(newRow);
                    }
                };
                if(isDelegate){
                    onOneClick();
                }else {
                    timeoutId = setTimeout(onOneClick, 300);
                }
            };

            if(!isDelegate && !isCollective){
                var dbClick = function onDbClick(e) {
                    clearTimeout(timeoutId);
                    if (isIE) {
                        clearTimeout(timeoutId - 3);
                    } else {
                        clearTimeout(timeoutId - 1);
                    }
                    if (!Dom.hasClass(newRow, "checked")) {
                        Dom.addClass(newRow, "checked");
                        Dom.addClass(newRow.cells[0], "icon-check-list");
                    }
                    if (!Dom.hasClass(newRow, "responsible")) {

                        var responsibleNode = this.tableMainBody.querySelector('.responsible');
                        if (responsibleNode) {
                            Dom.removeClass(responsibleNode, "responsible");
                            var node = responsibleNode.querySelector('span.responsible-text');
                            if (node) {
                                //Dom.removeClass(node.parentNode.parentNode,"checked");
                                //Dom.removeClass(node.parentNode.parentNode.cells[0],"icon-check-list");
                                node.parentNode.removeChild(node);
                            }
                        }
                        Dom.addClass(newRow, "responsible");
                        newRow.cells[1].innerHTML += "<span style='color:blue;' class='responsible-text'> <b><i>(Ответственный исполнитель)</i></b></span>";
                    }
                };

                var handleDClick = Event.addListener(newRow, "dblclick", dbClick, this, true);
            }
            var handle = Event.addListener(newRow, "click", click, this ,true);
        },
        getValue: function CheckList_getValue(){
            var values = [];
            var elements = this.tableMainBody.querySelectorAll(".checked");
            for (var i = 0; i < elements.length; i++) {
                    if(!elements[i].querySelector('span.responsible-text'))
                        values.push(elements[i].cells[2].innerHTML);
              }
            return values.join(',');
        },
        getResponsible: function CheckList_getResponsible(){
            try{
                return this.tableMainBody.querySelector('span.responsible-text').parentNode.parentNode.cells[2].innerHTML;
            }catch(e){
                return null;
            }

        },
        clean: function clean(){
            var elements = this.tableMainBody.querySelectorAll(".checked");
            for (var i = 0; i < elements.length; i++) {
                var res = elements[i].querySelector('span.responsible-text');
                if(!res){
                    Dom.removeClass(elements[i],"checked");
                    Dom.removeClass(elements[i].cells[0],"icon-check-list");
                }else{
                    Dom.removeClass(elements[i],"checked");
                    Dom.removeClass(elements[i],"responsible");
                    Dom.removeClass(elements[i].cells[0],"icon-check-list");
                    res.parentNode.removeChild(res);
                }
            }
        },

        setResponsible: function (nodeRef) {
            if(nodeRef) {
                var row = document.getElementById(nodeRef);
                Dom.addClass(row, "responsible");
                Dom.addClass(row, "checked");
                Dom.addClass(row.cells[0], "icon-check-list");
                row.cells[1].innerHTML += "<span style='color:blue;' class='responsible-text'> <b><i>(Ответственный исполнитель)</i></b></span>";
            }
       },

       setAccomplice: function (accomplice) {
           if(accomplice && accomplice.length > 0){
               accomplice.forEach(function (item) {
                   var row = document.getElementById(item);
                   if(item) {
                       Dom.addClass(row, "checked");
                       Dom.addClass(row.cells[0], "icon-check-list");
                   }
               });
           }
       }
   });
})();