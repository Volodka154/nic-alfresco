//пум
if(typeof simpleDialogForm=="undefined" || !simpleDialogForm) {
    simpleDialogForm = null;
}
simpleDialogFormStarting = false;

changeLocation = function(pars, args) {
    var result = null;
    if(!pars){
        getArgsAndDo(changeLocation, args);
    }else {

        if (!String.format) {
            String.format = function (format) {
                var args = Array.prototype.slice.call(arguments, 1);
                return format.replace(/{(\d+)}/g, function (match, number) {
                    return typeof args[number]!='undefined' ?args[number] :match;
                });
            }
        }

        if(pars.userDelegates && pars.userDelegates.length>0){
            var userDelegates = "";
            pars.userDelegates.forEach(function(userDelegate, i) {
                userDelegates += userDelegate + (i<pars.userDelegates.length-1 ?"," :"");
            });
            pars.userDelegates = userDelegates;
        }

        var href = (args.url ?args.url :"/share/page/btl-edit-metadata") + "?nodeRef=" + args.nodeRef + (args.noRedirect||args.isFrame ?"" :"&redirect=" + (args.redirect ?args.redirect :window.location.href));
        for (var key in pars) {
            href += String.format("&{0}={1}", key, pars[key]);
        }

        if(args.isFrame){
            result = '<iframe id="viewDocFrame" style="border-radius: 4px;" width="100%" height="100%" src='+href+'>'
        }else
        if(args.newTab){
            window.open(href);
        }else{
            window.location.href = href;
        }

        return result;
    }
};

getArgsAndDo = function(func, args) {
    if (!String.format) {
        String.format = function(format) {
            var args = Array.prototype.slice.call(arguments, 1);
            return format.replace(/{(\d+)}/g, function(match, number) {
                return typeof args[number] != 'undefined' ?args[number] :match;
            });
        };
    }

    var nodeRef = args.nodeRef;

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

    function setAjaxesPars(neededPars) {
        var results = {};
        var allAjaxesPars = {
            isHasAddChildren: {url: "hasPernission", args: {id: nodeRef, operation: "AddChildren"}, varName: "isHasAddChildren"},
            isAdmin: {url: "groupPermision", args: {user: userName, group: "ALFRESCO_ADMINISTRATORS"}, varName: "isAdmin"},
            canSeeAcceptReportButton: {url: "check/if-can-see-acceptReport-button", args: {nodeRef: nodeRef}, varName: "canSeeAcceptReportButton"},
            isHasEdit: {url: "hasPernission", args: {id: nodeRef, operation: "Write"}, varName: "isHasEdit"},
            isCoordinator: {url: "hasPernission", args: {id: nodeRef, operation: "Coordinator"}, varName: "isCoordinator"},
            isClerk: {url: "groupPermision", args: {user: userName, group: "CLERK"}, varName: "isClerk"},
            isDEV: {url: "groupPermision", args: {user: userName, group: "DEV"}, varName: "isDEV"},
            userDelegates: {url: "getting/get-employee-delegates", args: {user: userName}, varName: "userDelegates"},
            docType: {url: "documentDetail/documentType", args: {nodeRef: nodeRef}, varName: "docType"},
            templateData: {url: "common/getNodeInfo", args: {nodeRef: nodeRef, Assoc: "true"}, varName: "templateData"},
            isGD: {url: "groupPermision", args: {user: userName, group: "GD"}, varName: "isGD"},
            isEEO: {url: "groupPermision", args: {user: userName, group: "EEO"}, varName: "isEEO"},
            docStatus: {url: "document/get-document-info", args: {documentNodeRef: nodeRef}, varName: "docStatus"},
            nextDoc: {url: "document/get-next-consideration-document", args: {nodeRef: nodeRef}, varName: "nextDoc", requires:{docStatus:"На рассмотрении", or:{isGD:"true", isEEO:"true"}}},
            gdSetting: {url: "document/get-document-gd-setting", args: {nodeRef: nodeRef}, varName: "gdSetting", requires:{docStatus:"На исполнении", isGD:"true"}}
        };
        var resultAjaxesPars = ["ajaxesPars1","ajaxesPars2","ajaxesPars3"];
        for(var i=0; i<resultAjaxesPars.length; i++){
            results[resultAjaxesPars[i]] = [];
            for(var key in allAjaxesPars){
                if(neededPars[i].includes(key)){
                    results[resultAjaxesPars[i]].push(allAjaxesPars[key]);
                }
            }
        }
        return results;
    }

    var resultsPars = null;
    switch (args.formId){
        case "taskExecutionForm":{
            resultsPars = setAjaxesPars([["isHasAddChildren","isAdmin","canSeeAcceptReportButton","userDelegates"],["isGD"],[]]);
        }break;
        case "reviewForm":{
            resultsPars = setAjaxesPars([["isHasAddChildren"],["isGD","isEEO","docStatus"],["nextDoc","gdSetting"]]);
        }break;
        case "taskEdit":{
            resultsPars = setAjaxesPars([["isHasAddChildren","isAdmin","isClerk","canSeeAcceptReportButton","userDelegates"],["isGD"],[]]);
        }break;
        // case "familiarizedForm":{
        //     resultsPars = setAjaxesPars([[],[],[]]);
        // }break;
        // case "editDateForm":{
        //     resultsPars = setAjaxesPars([[],[],[]]);
        // }break;
    }

    var ajaxesPars1;
    var ajaxesPars2;
    var ajaxesPars3;

    if(!resultsPars||resultsPars==={}){
        return;
    }else{
        ajaxesPars1 = resultsPars.ajaxesPars1 ?resultsPars.ajaxesPars1 :[];
        ajaxesPars2 = resultsPars.ajaxesPars2 ?resultsPars.ajaxesPars2 :[];
        ajaxesPars3 = resultsPars.ajaxesPars3 ?resultsPars.ajaxesPars3 :[];
    }

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

        if(ajaxesPars.length>0){
            if(ajaxesPars.length==1){
                args = [args];
            }
            for(i=0; i<ajaxesPars.length; i++){
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
                                resultPars.docStatus = res.document.state;
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

    function requiresPassed(requires, curType) {
        var result;

        var nextType = requires.and ?"and" :(requires.or ?"or" :null);

        //если есть and или or
        if(nextType){
            //входим во внутрь и проверяем
            result = requiresPassed(requires[nextType], nextType);

            //доделываем оставшиеся проверки
            var otherRequiresPassed = curRequiresPassed(requires, curType, nextType);
            switch (curType){
                case "or":{
                    result = result || otherRequiresPassed
                }break;
                default/*"and"*/:{
                    result = result && otherRequiresPassed
                }
            }
        }else{
            //делаем проверки
            result = curRequiresPassed(requires, curType=="or" ?"or" :"and");
        }

        function curRequiresPassed(requires, curType, nextType) {
            var result;
            switch (curType){
                case "or":{
                    result = false;
                    if (nextType) {
                        for(var key in requires) {
                            if (key != nextType && resultPars[key] == requires[key]) {
                                result = true;
                                break;
                            }
                        }
                    }else{
                        for(var key in requires) {
                            if (resultPars[key] == requires[key]) {
                                result = true;
                                break;
                            }
                        }
                    }
                }break;
                default/*"and"*/:{
                    result = true;
                    if(nextType){
                        for(var key in requires){
                            if(key!=nextType && resultPars[key]!=requires[key]){
                                result = false;
                                break;
                            }
                        }
                    }else{
                        for(var key in requires){
                            if(resultPars[key]!=requires[key]){
                                result = false;
                                break;
                            }
                        }
                    }
                }
            }
            return result;
        }

        return result;
    }

    setTimeout(function () {
        $.when.apply($, getAjaxesResults(ajaxesPars2)).done(function () {

            // getParsFromAjaxResults(ajaxesPars2);
            parsObj.resultPars.secondPars = getParsFromAjaxResults(ajaxesPars2, arguments);
            ajaxesPars = [];
            for(i=0; i<ajaxesPars3.length; i++){
                ajaxPars = ajaxesPars3[i];
                if(ajaxPars.requires){
                    var allRequiresPassed = requiresPassed(ajaxPars.requires);
                    // var allRequiresPassed = true;
                    // for(key in ajaxPars.requires){
                        // if(resultPars[key]!=ajaxPars.requires[key]){
                        //     allRequiresPassed = false;
                        //     break;
                        // }
                    // }
                    if(allRequiresPassed){
                        ajaxesPars.push(ajaxPars);
                    }
                }
            }

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
            func(pars, args);
            clearInterval(waitForPars);
        }
    },100);

    setTimeout(function () {
        clearInterval(waitForPars);
    },10000)
};



createAndShowForm = function(nodeRef, args){
    var requiredArgs;

    switch(args.formId) {
        case "taskExecutionForm":{
            requiredArgs = true;
        }break;
        case "reviewForm":{
            requiredArgs = true;
        }break;
        case "familiarizedForm":{
            requiredArgs = false;
        }break;
        case "editDateForm":{
            requiredArgs = false;
        }break;
    }

    args.nodeRef = nodeRef;

    $.ajax({
        url: "/share/proxy/alfresco/getting/get-current-userName",
        type: "GET",
        success: function(data){
            run();
        },
        error:function (xhr){
            if(xhr.status==401) {
                window.location.href = "/share"
            }else{
                run();
            }
        }
    });

    function run() {
        if(requiredArgs){
            getArgsAndDo(showSimpleDialogForm, args);
        }else{
            showSimpleDialogForm({}, args);
        }
    }
};



function showSimpleDialogForm(otherPars, args) {

    var pars = {
        itemKind: null,
        itemId: args.nodeRef,
        mode: "edit",
        formId: null,
        submitType: "json",
        showCancelButton: false,
        showCaption: false
    };

    switch(args.formId) {
        case "taskExecutionForm":{
            pars.itemKind = "node";
            pars.formId = "execution";
        }break;
        case "reviewForm":{
            pars.itemKind = "node";
            pars.formId = "review";
        }break;
        case "familiarizedForm":{
            pars.itemKind = "task";
            pars.formId = "familiarizedForm";
        }break;
        case "editDateForm":{
            pars.itemKind = "task";
            pars.formId = "editDateForm";
        }break;
    }

    pars = $.extend({}, pars, otherPars);


    var formId = args && args.formId && args.formId!=="" ?args.formId :"simpleDialogForm";

    if(simpleDialogForm) {//Если форма уже существует
        doBeforeReStart(formId, simpleDialogForm);
    }
    $('#file-panel').remove(); //При открытии формы почему то в консоле браузера иногда ругается на то, что id=='file-panel' уже существовал

    simpleDialogForm = new Alfresco.module.SimpleDialog(formId);
    simpleDialogForm.setOptions({
        width: "99vw",
        templateUrl: Alfresco.constants.URL_SERVICECONTEXT + "btlab/components/form",
        templateRequestParams: pars,
        actionUrl: null,
        destroyOnHide: true,
        doBeforeDialogShow: {
            fn: function (p_form, p_dialog) {
                console.log('000');
                hideMask();
                customizeForm();
            },
            scope: this
        },
        onFailure: {
            fn: function DataGrid_onActionCreate_failure(response) {
            },
            scope: simpleDialogForm
        }
    });
    simpleDialogForm.show();


    function showMask(){
        var $document = $(document);
        const mask = '<div class="mask" id="'+formId+'_mask" style="z-index:10; height:'+$document.height()+'px; width:'+$document.width()+'px; display:block;">&nbsp;</div>';
        $('#'+formId+'-form_c').before(mask);
    }

    function hideMask(){
        $('#'+formId+'_mask').remove();
    }

    function doBeforeReStart(formId, simpleDialogForm){
        showMask();
        removeExcess();
        setTimeout(function () {
            hideMask();
        },3000);
    }

    function removeExcess() {
        switch(formId) {
            case "taskExecutionForm":{
                $('#startBPForm-form_dialog_block_window_c').remove();// удаляем окно отправки на ознакомление
                $('#startBPForm-form_dialog_block_window_mask').remove();// удаляем маску этого окна
            }break;
        }

        YAHOO.Bubbling.fire("formContainerDestroyed");
        if(simpleDialogForm.onBeforeFormRuntimeInit) {
            YAHOO.Bubbling.unsubscribe("beforeFormRuntimeInit", simpleDialogForm.onBeforeFormRuntimeInit, this);
        }
        if(simpleDialogForm.dialog){
            simpleDialogForm.dialog.destroy();
            delete simpleDialogForm.dialog;
        }
        if(simpleDialogForm.widgets){
            delete simpleDialogForm.widgets;
        }
        if (simpleDialogForm.isFormOwner && simpleDialogForm.form)
        {
            delete simpleDialogForm.form;
        }
        $('#'+formId+'-form_c').remove();

        $('.loadingoverlay').remove();
    }

    function customizeForm() {

        //Удаляем дефолтные кнопки
        $('#'+formId+'-ok').css('display', 'none');
        $('#'+formId+'-cancel').css('display', 'none');

        //Скрываем скролы страницы пока форма существует
        var form = $('#'+formId+'-form');
        form.append(createElementFromHTML("<style id='hideScrollStyle'>html { overflow: hidden; }</style>"));
        form.css("font-family", "Arial, Helvetica, sans-serif");

        //Указываем что форму можно двигать и за какой элемент
        form.draggable({scroll: false, handle: "#"+formId+"-form_h"});

        //Указываем Z координату формы
        var formParent = form.parent();
        waitForAndDo([formId+'-form_mask'],function(){
            formParent.css('z-index', 12);
            $('#'+formId+'-form_mask').css('z-index', 11);
        });

        //Красим форму в белый цвет
        form.css('background-color','white');

        //Указываем начальное расположение формы
        formParent.css({top: 10+$(window).scrollTop(), left: 10});

        //Указываем размер верхней панели и центрируем крестик
        $('#'+formId+'-form_h').css('height','20px');
        $(form.children().get(0)).css({top: 9, right: 12});

        //Флаг того что форма ещё запускается меняем на false
        simpleDialogFormStarting = false;
    }

    function createElementFromHTML(htmlString) {
        var div = document.createElement('div');
        div.innerHTML = htmlString.trim();
        return div.firstChild;
    }
}