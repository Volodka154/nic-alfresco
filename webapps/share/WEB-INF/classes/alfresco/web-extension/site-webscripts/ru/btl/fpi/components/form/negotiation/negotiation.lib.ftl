<#import "/ru/btl/fpi/components/form/controls/common/btl_association.inc.ftl" as AssocLib />
<@link rel="stylesheet" type="text/css" href="share/res/extension/components/form/negotiation/negotiation.css" />

<#macro renderFormNegotiation formId tabId destination isTemplate=false isCreate=false fieldDocType="none" mainFormId="">
    <#import "/ru/btl/fpi/components/form/execution/extendedMethods/extendedMethods.lib.ftl" as ExtendedMethods />
    <@ExtendedMethods.add/>
    <style>
        .icon-emp {
            display: block;
            height: auto;
            padding-left: 20px;
            background: transparent url(/share/res/components/form/img/emploee.png) 0 0px no-repeat;
        }
        .ygtvtn{
            width: 0px;
            background: none;
        }
        .ygtvln {
            width: 0px;
            background: none;
        }
    </style>

    <div id = "${formId}-negotiation" class="negotiation-tab" style="font-family:Arial,Helvetica,sans-serif !important;">
        <div class="rowNoMargin" style="display:flex;">
            <div style="float: left; width: 320px;">
                <div class="panel panel-primary">
                    <div class="panel-heading">
                        Маршрут:
                        <#if isCreate == true >
                            <div style="float:right;     margin-top: -5px;">
                                <button type="button" class="negitiationButtonAction" id="${formId}-btn-select-template" onclick="getTemplate()">Загрузить из шаблона</button>
                            </div>
                        </#if>
                    </div>
                    <div class="panel-body" style="padding:5px; 15px">
                        <div id="${formId}-negotiation-list-btns" style="margin-bottom:5px;" class="negotiation-list-btns">
                            <#--<button type="button" id="${formId}-btn-edit-level" disabled class="negotiation-list-btn" style="width: 40%;">Редактировать</button>						-->
                            <#--<button type="button" id="${formId}-btn-up" onClick="MoveUp()" disabled class="negotiation-list-btn" style="width: 15%;">&#9650;</button>-->
                            <#--<button type="button" id="${formId}-btn-down" onClick="MoveDown()" disabled class="negotiation-list-btn" style="width: 15%;">&#9660;</button>												-->
                            <#--<button type="button" id="${formId}-btn-delete-node" onClick="deleteNodeDialog()" disabled class="negotiation-list-btn" style="width: 30%;">Удалить</button>-->
                            <div style="float:left; margin-top:5px; margin-right:5px">
                                <div id="${formId}-btn-edit-level" disabled style="border-radius:4px; background-color:#669079; color:#fff; padding:6px 10px 6px 10px; width:max-content; cursor:pointer;">Редактировать</div>
                            </div>
                            <div style="float:left; margin-top:5px; margin-right:5px">
                                <div id="${formId}-btn-up" onClick="MoveUp()" disabled style="border-color:#ccc; border-style:solid; border-width:1px; border-radius:4px; background-color:#fff; color:#000; padding:5px 10px 5px 10px; width:max-content; cursor:pointer;">&#9650;</div>
                            </div>
                            <div style="float:left; margin-top:5px; margin-right:5px">
                                <div id="${formId}-btn-down" onClick="MoveDown()" disabled style="border-color:#ccc; border-style:solid; border-width:1px; border-radius:4px; background-color:#fff; color:#000; padding:5px 10px 5px 10px; width:max-content; cursor:pointer;">&#9660;</div>
                            </div>
                            <div style="float:left; margin-top:5px;">
                                <div id="${formId}-btn-delete-node" onClick="deleteNodeDialog()" disabled style="border-radius:4px; background-color:#FF5252; color:#fff; padding:6px 10px 6px 10px; width:max-content; cursor:pointer;">Удалить</div>
                            </div>
                        </div>
                        <div id = "${formId}-negotiation-tree" class="negotiation-tree" style="border-radius:4px"></div>
                        <div id="readyFlagNegotiationEdit" style="display:none;"></div>
                    </div>
                </div>
            </div>
            <div style="width:690px; float:right; padding-left:1vw;">
                <div id="${formId}-negotiation-list-edit-container">
                    <div class="panel panel-info">
                        <div class="panel-heading">Формирование маршрута:</div>
                        <div class="panel-body-info" >
                            <div id="${formId}-negotiators-list">
                                <#assign employeeField = {
                                "dataType": "btl-emp:employee-content",
                                "name": "employee-content",
                                "label": "Сотрудник",
                                "mandatory": false,
                                "disabled": false,
                                "mode": "edit",
                                "value": "",
                                "control":{
                                "params":{
                                "enableGroup":"true",
                                "enableRole":"true",
                                "documentNodeRef":"${destination}",
                                "s_field": "btl-people:fio",
                                "field": "btl-people:fio",
                                "style": "width: 587px; height: 17px; padding: 6px 12px; border-radius: 4px;  border: 1px solid #ccc;"
                                }
                                }
                                }>

                                <div class = "negotiators-list">
                                    <@AssocLib.renderBtlAssociation field=employeeField  fieldHtmlId=formId+"-employeeField" />
                                    <div class="rowNoMargin">
                                        <div style="width:577px; float:left;">
                                            <div id = "${formId}-negotiators-list-tree" style="overflow-y:auto; border-radius:4px; height:60px;" class="negotiation-tree"></div>
                                        </div>
                                        <div class="negotiators-list-buttons" style="float:right; margin-right:-5px;">
                                            <div class="rowNoMargin" style="display:block;">
                                                <#--<button type="button" class="negitiationButtonAction" id="${formId}-btn-up-negotiator" style ="display: block; width: 35px; float: left;" disabled>&#9650;</button>-->
                                                <#--<button type="button" class="negitiationButtonAction" id="${formId}-btn-down-negotiator" style ="display: block; width: 35px; float: right;" disabled>&#9660;</button>-->
                                                <div style="float:left; margin-right:5px">
                                                    <div id="${formId}-btn-up-negotiator" <#--onClick="MoveUp()"--> disabled style="border-color:#ccc; border-style:solid; border-width:1px; border-radius:4px; background-color:#fff; color:#000; padding:5px 10px 5px 10px; width:max-content; cursor:pointer;">&#9650;</div>
                                                </div>
                                                <div style="float:left; margin-right:5px">
                                                    <div id="${formId}-btn-down-negotiator" <#--onClick="MoveDown()"--> disabled style="border-color:#ccc; border-style:solid; border-width:1px; border-radius:4px; background-color:#fff; color:#000; padding:5px 10px 5px 10px; width:max-content; cursor:pointer;">&#9660;</div>
                                                </div>
                                            </div>
                                            <#--<button type="button" class="negitiationButtonAction" id="${formId}-btn-delete-negotiator" disabled style ="display: block; width: 74px;">Удалить</button>-->
                                            <div style="float:left; margin-top:5px;">
                                                <div id="${formId}-btn-delete-negotiator" <#--onClick="deleteNodeDialog()"--> disabled style="border-radius:4px; background-color:#FF5252; color:#fff; padding:6px 11px 6px 11px; width:max-content; cursor:pointer;">Удалить</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class = "form-field">
                                    <label for="${formId}-negotiation-type">Тип маршрутизации:</label>
                                    <select name="negotiation-type" class="negitiationfieldStyle" style="width: 326px !important;" id="${formId}-negotiation-type">
                                        <option disabled selected value=""> -- Выберите тип маршрутизации -- </option>
                                        <option value="0">Параллельное</option>
                                        <option value="1">Последовательное</option>
                                    </select>
                                </div>
                                <div class = "form-field">
                                    <label for="${formId}-negotiation-duration">Срок согласования:</label>
                                    <input id="${formId}-negotiation-duration" type="number" class="negitiationfieldStyle" name="negotiation-duration" value="">
                                </div>
                                <div class = "form-field">
                                    <label for="${formId}-negotiation-process-type">Тип задачи:</label>
                                    <select name="negotiation-process-type" class="negitiationfieldStyle" style="width: 326px !important;" id="${formId}-negotiation-process-type" onchange="processTypeChange(this)">
                                        <option value="0" selected>Согласование</option>
                                        <option value="1">Подписание</option>
                                    </select>
                                </div>
                                <div class = "form-field">
                                    <label for="${formId}-negotiation-level-name">Название этапа:</label>
                                    <input id="${formId}-negotiation-level-name" type="text" class="negitiationfieldStyle" name="negotiation-level-name" value="Согласование">
                                </div>
                                <div class = "form-field">
                                    <label for="${formId}-return-on-first-rejection">Возвращать при первом отклонении:</label>
                                    <input id="${formId}-return-on-first-rejection" type="checkbox" checked/>
                                </div>
                                <#if isTemplate != true >
                                    <div class = "form-field">
                                        <label for="${formId}-use-document-signer">Перенести подписанта из основной информации документа:</label>
                                        <input id="${formId}-use-document-signer" type="checkbox" checked disabled/>
                                    </div>
                                </#if>

                                <#--<div class="edit-buttons" style="padding-top: 10px;">-->
                                <#--<button type="button" class="negitiationButtonAction" id="${formId}-btn-add-negotiation-info">Добавить</button>-->
                                <#--</div>-->
                                <div style="float:left; margin-top:5px; margin-bottom:5px; display:contents;">
                                    <div id="${formId}-btn-add-negotiation-info" style="margin-bottom:5px; margin-top:10px; border-radius:4px; background-color:#3CB371; color:#fff; padding:6px 10px 6px 10px; width:max-content; cursor:pointer;">Добавить</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <#if isTemplate != true >
            <div class="row" style="padding-left: 15px;">
                <div class="panel panel-info">
                    <div class="panel-heading">Итоги согласования:
                        <div id="${formId}-print-negotiation-list" class="icon-print" onclick="negotiation_print()"></div>
                    </div>
                    <div class="panel-body-info">
                        <table class="negotiation-result-table">
                            <thead>
                            <tr>
                                <th style="width:200px">Этап</th>
                                <th style="width:300px">ФИО</th>
                                <th style="width:100px">До</th>
                                <th style="width:100px">Дата</th>
                                <th style="width:100px">Статус</th>
                                <th style="width:30px">Круг</th>
                                <th style="width:30px">Файл</th>
                                <th style="width:150px">Комментарий</th>
                            </tr>
                            </thead>
                            <tbody id="negotiationTable">
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </#if>
    </div>

    <div id="${formId}-level-dialog" style="display: none;">
        <div class = "level-dialog">
            Наименование уровня: <input id="${formId}-level-name" type="text" name="level-name" value="Уровень 1"></br>
            Срок согласования: <input id="${formId}-level-duration" type="text" name="level-duration" value="3"> дня</br>
            Тип согласования:
            <select name="level-type" id="${formId}-level-type">
                <option value="0">Параллельное</option>
                <option value="1">Последовательное</option>
            </select>
        </div>
    </div>



    <script type="text/javascript">//<![CDATA[


        var listTree;
        var negotiatorsTree;
        var negotiationList;
        var currentNode;
        var currentNegotiator;
        var documentState = null;
        var hasNegotiators = null;

        var negoForLevelCount = 0;
        var negoLevelSize = 0;


        function processTypeChange(change) {
            document.getElementById("${formId}-negotiation-level-name").value = change.options[change.selectedIndex].innerHTML;
        }

        require(["jquery"], function($){
            <#if mainFormId!="">
            waitForAndDo(["${formId}-negotiators-list"], function () {
                $('#${formId}-negotiators-list').find('label').css('display','block')
            });
            waitForAndDo(["${formId}-level-type"], function () {
                <#else>
                YAHOO.util.Event.onContentReady(["${formId}-level-type"], function() {
                    </#if>
                    $("#${formId}-employeeField-val").change(function() {

                        var label = $("#${formId}-employeeField-val").val();
                        var subInfo = eval("(" + $("#${formId}-employeeField-val").attr('sub_info') + ")");
                        if (subInfo)
                        {
                            var nodeRef = subInfo.nodeRef ;
                            addNegotiatorToList(negotiatorsTree, label, nodeRef);
                            $("#${formId}-employeeField-val").val("");
                        }
                    });


                    $('#${formId}-btn-up-negotiator').click(function(){
                        var ind = currentNegotiator.index;
                        var destNode = negotiatorsTree.getNodeByIndex(ind-1);
                        if (destNode != null){
                            replaceNodeData(currentNegotiator, destNode);
                            currentNegotiator = destNode;
                        }
                        negotiatorsTree.render();
                    });

                    $('#${formId}-btn-down-negotiator').click(function(){
                        var ind = currentNegotiator.index;
                        var destNode = negotiatorsTree.getNodeByIndex(ind+1);
                        if (destNode != null){
                            replaceNodeData(currentNegotiator, destNode);
                            currentNegotiator = destNode;
                        }
                        negotiatorsTree.render();
                    });

                    $('#${formId}-btn-delete-negotiator').click(function(){
                        if (currentNegotiator != null){
                            negotiatorsTree.removeNode(currentNegotiator);
                            currentNegotiator = null;
                            negotiatorsTree.render();
                            setDisabledNegotiatorsButtons(true);
                        }
                    });


                    $('#${formId}-negotiation-duration').keydown(function (e) {
                        if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
                            // Allow: Ctrl+A, Command+A
                            (e.keyCode == 65 && ( e.ctrlKey === true || e.metaKey === true ) ) ||
                            // Allow: home, end, left, right, down, up
                            (e.keyCode >= 35 && e.keyCode <= 40)) {
                            // let it happen, don't do anything
                            return;
                        }
                        // Ensure that it is a number and stop the keypress
                        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                            e.preventDefault();
                        }
                    });

                    $('#${formId}-btn-add-negotiation-info').click(function(){
                        if ($('#${formId}-negotiation-level-name').val() == '' ||
                            $('#${formId}-negotiation-type').val() == null ||
                            $('#${formId}-employeeField-added').val() == '' ||
                            $('#${formId}-negotiation-duration').val() == ''){
                            showPopupMessage("Введены не все данные!");
                            return;
                        }
                        var negData = getNegotiationListData();
                        if ($('#${formId}-btn-add-negotiation-info').html() == 'Добавить'){
                            currentNode = null;
                        }

                        sendNegotiationListData(negData, refreshNegotiationList);
                        clearInfoFields();
                        $('#${formId}-btn-add-negotiation-info').html('Добавить');
                    });

                    $('#${formId}-btn-edit-level').click(function(){
                        loadLevelNodeDetails(currentNode);
                        $('#${formId}-btn-add-negotiation-info').html('Сохранить');
                    });

                    setDisabledNegotiationListButtons(true);
                    setDisabledNegotiatorsButtons(true);

                    <#if isTemplate != true >
                    getNegotiationTableData();
                    checkEditable();
                    <#else>
                    setNegotiationDataEditable(true);
                    </#if>
                });
            });

            function negotiation_print(){
                var re = /&/gi;
                var location1 = window.location.toString().replace(re, '%26');

                window.location.assign(Alfresco.constants.URL_PAGECONTEXT+"negotiation-list?documentNodeRef=${destination}&redirect="+location1);
            }

            function checkEditable(){
                Alfresco.util.Ajax.jsonGet({
                    method:"GET",
                    url: "/share/proxy/alfresco/document/get-document-info?documentNodeRef=${destination}",
                    successCallback:{
                        fn: function getNegotiatorDetails(complete){
                            if(complete.serverResponse.status == 200){
                                var document = complete.json.document;
                                documentState = document.state;
                                if (document.state == "Черновик" || document.state == "На доработке"){
                                    setNegotiationDataEditable(true);
                                }else{
                                    setNegotiationDataEditable(false);
                                }
                            }else{
                                console.log("Error getting negotiation list");
                            }
                        },
                        scope: this
                    }
                });
            }

            function setNegotiationDataEditable(editable){
                if (editable == false){
                    $('#${formId}-negotiation-list-edit-container').addClass("hidden-class");
                    $('#${formId}-negotiation-list-btns').addClass("disabled-class");
                }else{
                    $('#${formId}-negotiation-list-edit-container').removeClass("hidden-class");
                    $('#${formId}-negotiation-list-btns').removeClass("disabled-class");
                }
            }

            function getNegotiationTableData(){
                Alfresco.util.Ajax.jsonGet({
                    method:"GET",
                    url: "/share/proxy/alfresco/negotiation/get-negotiation-result-data?documentNodeRef=${destination}",
                    successCallback:{
                        fn: function getNegotiatorDetails(complete){
                            if(complete.serverResponse.status == 200){
                                document.getElementById("negotiationTable").innerHTML = getNegotiationTableBody(complete.json.negotiationResults);
                                hasNegotiators = complete.json.negotiationResults && complete.json.negotiationResults.length>0;
                            }else{
                                console.log("Error getting negotiation list");
                            }
                        },
                        scope: this
                    }
                });
            }

            function getNegotiationTableBody(results) {
                var result = "";

                for (i = 0; i < results.length; i++) {
                    if (results[i].state == 'Согласован' || results[i].state == 'Подписан' || results[i].state == 'На регистрации' || results[i].state == 'Согласован с замечаниями'){
                        result += "<tr style='background-color: #d6e9c6'>";
                    } else if (results[i].state == 'Отклонен'){
                        result += "<tr style='background-color: #FFA9A9'>";
                    } else if (results[i].state == 'На согласование' || results[i].state == 'На подписание') {
                        result += "<tr style='background-color: #FCECD3'>";
                    } else if (results[i].state == 'Отменен') {
                        result += "<tr style='background-color: #C6C6C6'>";
                    } else if (results[i].state == 'Не визирован'){
                        result += "<tr style='background-color: #FFFFFF'>";
                    } else {
                        result += "<tr>";
                    }

                    result += "<td>" + results[i].levelName + "</td>";
                    result += "<td>" + results[i].fullName + "</td>";
                    result += "<td style='width:70px;'>" + results[i].levelEndDate + "</td>";
                    result += "<td style='width:70px;'>" + results[i].actualNegotiationDate + "</td>";
                    result += "<td>" + results[i].state + "</td>";
                    result += "<td>" + results[i].cycle + "</td>";
                    result += "<td>" + results[i].file + "</td>";
                    result += "<td>" + results[i].negotiatorComment + "</td>";
                    result += "</tr>";
                }
                return result;
            }

            function addNegotiatorToList(treeList, name, nodeRef){
                var node = treeList.getNodeByProperty('id', nodeRef);
                if (node == null){
                    var root = treeList.getRoot();
                    var tmpNode = new YAHOO.widget.TextNode({
                        label: name,
                        id: nodeRef,
                        expanded: false
                    }, root);
                    treeList.render();
                }

                var empField = $('#${formId}-employeeField-added');
                if (empField.val()){
                    empField.val(empField.val() + "," + nodeRef);
                }else{
                    empField.val(nodeRef);
                }

            }

            function setDisabledNegotiatorsButtons(disabled){
                $('#${formId}-btn-up-negotiator').prop('disabled', disabled);
                $('#${formId}-btn-down-negotiator').prop('disabled', disabled);
                $('#${formId}-btn-delete-negotiator').prop('disabled', disabled);
            }

            function setDisabledNegotiationListButtons(disabled){
                $('#${formId}-btn-edit-level').prop('disabled', disabled);
                $('#${formId}-btn-down').prop('disabled', disabled);
                $('#${formId}-btn-up').prop('disabled', disabled);
                $('#${formId}-btn-delete-node').prop('disabled', disabled);
            }

            function onNegotiatorFocusChanged(e){

                if (e.newNode == null){
                    //setDisabledNegotiatorsButtons(false);
                }else{
                    currentNegotiator = e.newNode;
                    setDisabledNegotiatorsButtons(false);
                }
            }

            function replaceNodeData(sourceNode, destNode){
                var tmplabel = sourceNode.label;
                var tmpId = sourceNode.data.id;

                sourceNode.label = destNode.label;
                sourceNode.data.id = destNode.data.id;
                destNode.label = tmplabel;
                destNode.data.id = tmpId;
            }

            function getNegotiatorsData(treeList){
                var negotiators = [];

                var treeNodes = treeList.getNodesBy(function (a){return true;});

                for(i = 0; i < treeNodes.length; i++){
                    negotiators.push(treeNodes[i].data.id);
                }

                return negotiators;
            }

            function getNegotiationListData(){
                var levelNodeRef = "";
                if (currentNode){
                    levelNodeRef = currentNode.data.id;
                }

                useDocSigner = false;
                <#if isTemplate != true >
                useDocSigner = $('#${formId}-use-document-signer').prop("checked");
                </#if>

                var negotiationListData = {
                    documentNodeRef: "${destination}",
                    negotiationLevelNodeRef: levelNodeRef,
                    negotiators : getNegotiatorsData(negotiatorsTree),
                    type : $('#${formId}-negotiation-type').val(),
                    duration : $('#${formId}-negotiation-duration').val(),
                    levelName : $('#${formId}-negotiation-level-name').val(),
                    useDocSigner : useDocSigner,
                    //signer: $('#${formId}-negotiation-level-name').val();
                    processType : $('#${formId}-negotiation-process-type').val(),
                    returnOnFirstRejection : $('#${formId}-return-on-first-rejection').prop("checked"),
                };

                //console.log(negotiationListData);
                return negotiationListData;
            }

            function sendNegotiationListData(negotiationListData, successCallback) {
                //1 = подписание
                if (negotiationListData.processType == 1) {
                    Alfresco.util.Ajax.jsonGet({
                        url: Alfresco.constants.PROXY_URI + "checkSigner/checkSignerNegotiation?docNodeRef=" + negotiationListData.documentNodeRef + "&negotiators=" + negotiationListData.negotiators,
                        responseType: 'json',
                        successCallback: {
                            scope: this,
                            fn: function (response) {
                                var allowed = response.json.allowed;
                                if (allowed) {
                                    Alfresco.util.Ajax.jsonPost({
                                        method: "POST",
                                        url: "/share/proxy/alfresco/negotiation/set-negotiation-list-info",
                                        dataObj: negotiationListData,
                                        successCallback: {
                                            fn: successCallback,
                                            scope: this
                                        }
                                    })
                                } else {
                                    alert("Один из выбранных сотрудников не имеет права подписывать указанный документ");
                                }
                            }
                        }
                    });
                } else {
                    Alfresco.util.Ajax.jsonPost({
                        method: "POST",
                        url: "/share/proxy/alfresco/negotiation/set-negotiation-list-info",
                        dataObj: negotiationListData,
                        successCallback: {
                            fn: successCallback,
                            scope: this
                        }
                    })
                }
            }


            function showRightButton(isBreaks) {
                var $sendByRoutButtons = $('#sendByRoutButtons');
                $sendByRoutButtons.show();

                if(typeof isBreaks == "undefined" || !isBreaks) {
                    var $negotiationTree = $('#${formId}-negotiation-tree');
                    var hasNego = $negotiationTree.find("span:contains('Согласование')").length > 0;
                    var hasSign = $negotiationTree.find("span:contains('Подписание')").length > 0;
                    if(hasNego || (!hasNego && !hasSign)){
                        buttonsShowSwitcher({negoStart: true});
                    } else {
                        buttonsShowSwitcher({signStart: true});
                    }
                }else{
                    if(documentState == "На согласовании") {
                        buttonsShowSwitcher({negoBreak: true});
                    }else
                    if(documentState == "На подписании"){
                        buttonsShowSwitcher({signBreak: true});
                    }
                }
            }

            function buttonsShowSwitcher(args) {
                var {negoStart, signStart, negoBreak, signBreak} = args;
                var buttonsList = [
                    "buttonStartNegotiation",
                    "buttonStartSigning",
                    "buttonBreakNegotiation",
                    "buttonBreakSigning"
                ];

                var indexes = [];
                if(typeof negoStart != "undefined" && negoStart) {indexes.push(0);}
                if(typeof signStart != "undefined" && signStart) {indexes.push(1);}
                if(typeof negoBreak != "undefined" && negoBreak) {indexes.push(2);}
                if(typeof signBreak != "undefined" && signBreak) {indexes.push(3);}

                var buttonsToShow = [];
                for(var i=indexes.length-1; i>=0; i--){
                    var index = indexes[i];
                    buttonsToShow.push(buttonsList[index]);
                    buttonsList.splice(index, 1);
                }

                for(var i in buttonsList){
                    $("#"+buttonsList[i]).css('display', 'none');
                }

                for(var i in buttonsToShow){
                    $("#"+buttonsToShow[i]).css('display', 'block');
                }
            }

            function clearInfoFields(){
                $("#${formId}-employeeField-val").val("");
                $("#${formId}-employeeField-added").val("");
                negotiatorsTree.removeChildren(negotiatorsTree.getRoot());
                negotiatorsTree.render();
                $("#${formId}-negotiation-duration").val("");
                $("#${formId}-negotiation-type").val("");
            }

            function onNegotiationListFocusChanged(e){

                if (e.newNode != null){
                    currentNode = e.newNode;
                    setDisabledNegotiationListButtons(false);
                    if (currentNode.depth > 0){
                        $('#${formId}-btn-edit-level').prop('disabled', true);
                    }
                }else{
                    //setDisabledNegotiationListButtons(true);
                }
            }

            function loadLevelNodeDetails(levelNode){
                Alfresco.util.Ajax.jsonGet({
                    method:"GET",
                    url: "/share/proxy/alfresco/negotiation/get-negotiation-level-info?levelNodeRef="+levelNode.data.id,
                    successCallback:{
                        fn: function getNegotiatorDetails(complete){
                            if(complete.serverResponse.status == 200){
                                // console.log(complete);
                                setNegotiationLevelDetails(complete.json);
                            }else{
                                console.log("Error getting negotiation list");
                            }
                        },
                        scope: this
                    }
                });
            }

            function setNegotiationLevelDetails(levelObjectInfo){
                // console.log(levelObjectInfo);
                clearInfoFields();
                $("#${formId}-negotiation-duration").val(levelObjectInfo.duration);
                $("#${formId}-negotiation-type").val(levelObjectInfo.type);
                $("#${formId}-negotiation-process-type").val(levelObjectInfo.processType);
                $("#${formId}-negotiation-level-name").val(levelObjectInfo.levelName);
                $("#${formId}-return-on-first-rejection")[0].checked = levelObjectInfo.returnOnFirstRejection;
                var negotiators = levelObjectInfo.negotiators;
                for(i = 0; i < negotiators.length; i++){
                    addNegotiatorToList(negotiatorsTree, negotiators[i].fullName, negotiators[i].nodeRef);
                }
            }

            function treeInit() {
                listTree = new YAHOO.widget.TreeView("${formId}-negotiation-tree");
                listTree.setDynamicLoad(loadDataForNode);
                listTree.subscribe("focusChanged", onNegotiationListFocusChanged);

                negotiatorsTree = new YAHOO.widget.TreeView("${formId}-negotiators-list-tree");
                negotiatorsTree.subscribe("focusChanged", onNegotiatorFocusChanged);
                negotiatorsTree.render();
            }

            YAHOO.util.Event.onContentReady("sendByRoutButtons", function(){
                require(["jquery", "pqgrid"], function ($) {
                    YAHOO.util.Event.on('buttonStartNegotiation', 'click', function () {
                        Alfresco.util.Ajax.request({
                            url: "/share/proxy/alfresco/workflow/start-workflow?processName=activiti$Negotiation&packageNodeRef=${args.itemId?js_string}",
                            successCallback: {
                                fn: function (res) {
                                    buttonsShowSwitcher({negoBreak:true});
                                    $("#${formId}-cancel-button").click();
                                    if (frameCancel)
                                        frameCancel();
                                }
                            },
                            successMessage: "Согласование запущено",
                            failureCallback: {
                                fn: function (res) {
                                    if (res.serverResponse.status === 500) {
                                        var json = Alfresco.util.parseJSON(res.serverResponse.responseText);
                                        Alfresco.util.PopupManager.displayPrompt({
                                            title: "Ошибка!",
                                            text: json.message
                                        });
                                    }
                                },
                                scope: this
                            },
                            scope: this,
                            execScripts: true
                        });
                    });

                    YAHOO.util.Event.on('buttonBreakNegotiation', 'click', function () {
                        Alfresco.util.Ajax.request({
                            url: "/share/proxy/alfresco/workflow/cancel-workflow?processName=activiti$Negotiation&packageNodeRef=${args.itemId?js_string}",
                            successCallback: {
                                fn: function (res) {
                                    setDocumentState("Черновик");
                                    $("#${formId}-cancel-button").click();
                                }
                            },
                            successMessage: "Согласование прервано",
                            failureCallback: {
                                fn: function (res) {
                                    if (res.serverResponse.status === 500) {
                                        var json = Alfresco.util.parseJSON(res.serverResponse.responseText);
                                        Alfresco.util.PopupManager.displayPrompt({
                                            title: "Ошибка!",
                                            text: json.message
                                        });
                                    }
                                },
                                scope: this
                            },
                            scope: this,
                            execScripts: true
                        });
                        buttonsShowSwitcher({negoStart:true});
                    });

                    YAHOO.util.Event.on('buttonStartSigning', 'click', function () {

                        Alfresco.util.Ajax.jsonGet({
                            url: Alfresco.constants.PROXY_URI + "checkStartWorkflowSigner?packageNodeRef=${args.itemId?js_string}",
                            responseType: 'json',
                            successCallback: {
                                scope: this,
                                fn: function (response) {
                                    var allowed = response.json.allowed;
                                    if (allowed === true) {
                                        Alfresco.util.Ajax.request({
                                            url: "/share/proxy/alfresco/workflow/start-workflow?processName=activiti$Signing&packageNodeRef=${args.itemId?js_string}",
                                            successCallback: {
                                                fn: function (res) {
                                                    buttonsShowSwitcher({signBreak: true});
                                                    $("#${formId}-cancel-button").click();
                                                }
                                            },
                                            successMessage: "Подписание запущено",
                                            failureCallback: {
                                                fn: function (res) {
                                                    if (res.serverResponse.status === 500) {
                                                        var json = Alfresco.util.parseJSON(res.serverResponse.responseText);
                                                        Alfresco.util.PopupManager.displayPrompt({
                                                            title: "Ошибка!",
                                                            text: json.message
                                                        });
                                                    }
                                                },
                                                scope: this
                                            },
                                            scope: this,
                                            execScripts: true
                                        });
                                    } else {
                                        alert("Указанный в маршруте подписант не имеет права подписывать документы указанного типа");
                                    }
                                }
                            }
                        });
                    });

                    YAHOO.util.Event.on('buttonBreakSigning', 'click', function () {
                        Alfresco.util.Ajax.request({
                            url: "/share/proxy/alfresco/workflow/cancel-workflow?processName=activiti$Signing,activiti$Negotiation&packageNodeRef=${args.itemId?js_string}",
                            successCallback: {
                                fn: function (res) {
                                    setDocumentState("Черновик");
                                    $("#${formId}-cancel-button").click();
                                }
                            },
                            successMessage: "Подписание прервано",
                            failureCallback: {
                                fn: function (res) {
                                    if (res.serverResponse.status === 500) {
                                        var json = Alfresco.util.parseJSON(res.serverResponse.responseText);
                                        Alfresco.util.PopupManager.displayPrompt({
                                            title: "Ошибка!",
                                            text: json.message
                                        });
                                    }
                                },
                                scope: this
                            },
                            scope: this,
                            execScripts: true
                        });
                        buttonsShowSwitcher({signStart:true});
                    });
                });
            });

            function loadDataForNode(node, onCompleteCallback) {
                if (node.depth == 0){
                    levelNodeRef = node.data.id;
                    Alfresco.util.Ajax.jsonGet({
                        url: Alfresco.constants.PROXY_URI + "negotiation/get-negotiators-for-level?negotiationLevelNodeRef="+ levelNodeRef,
                        successCallback:{
                            fn: function getNegotiation(complete){
                                if(complete.serverResponse.status == 200){
                                    loadLevelNegotiators(node, complete.json.negotiators);
                                    negoForLevelCount++;
                                    if(negoForLevelCount == negoLevelSize) {
                                        waitForAndDo(function () {
                                            return hasNegotiators != null;
                                        }, function () {
                                            showRightButton(hasNegotiators);
                                        });
                                    }
                                }else{
                                    console.log("Error getting negotiation list");
                                }
                            },
                            scope: this
                        }
                    });
                }

                // Be sure to notify the TreeView component when the data load is complete
                onCompleteCallback();
            }

            function loadLevelNegotiators(levelNode, negotiators){
                for (var i = 0; i < negotiators.length; i++) {
                    var negotiator = negotiators[i];
                    var tmpNode = new YAHOO.widget.TextNode({
                        id: negotiator.nodeRef,
                        label: negotiator.fullName,
                        labelStyle: "icon-emp",
                        expanded: false,
                        isLeaf : true
                    }, levelNode);
                }
                listTree.render();
            }

            function refreshNegotiationList(){
                getNegotiationList("${destination}", true);
            }

            function refreshButtons() {
                showRightButton();
            }

            function loadLevelsInfo(levels){
                var root = listTree.getRoot();
                for (var i = 0; i<levels.length;i++){
                    var level = levels[i];
                    var postfix = ' (Параллельно)';
                    if (level.levelType == 1){
                        postfix = ' (Последовательно)';
                    }

                    var label = level.levelName+postfix;

                    if (level.negotiationType == 0){
                        if (label.indexOf("Согласование") == -1){
                            label = "Согласование. " + label;
                        }
                    } else if (level.negotiationType == 1){
                        if (label.indexOf("Подписание") == -1){
                            label = "Подписание. " + label;
                        }
                    }

                    var tmpNode = new YAHOO.widget.TextNode({
                        id: level.nodeRef,
                        label: label,
                        expanded: true
                    }, root);
                }
                listTree.render();
            }

            function getNegotiationList(documentNodeRef, needRefreshButtons){
                listTree.removeChildren(listTree.getRoot());
                Alfresco.util.Ajax.jsonGet({
                    url: Alfresco.constants.PROXY_URI + "negotiation/get-negotiation-list?documentNodeRef="+ documentNodeRef,
                    successCallback:{
                        fn: function getNegotiation(complete){
                            if(complete.serverResponse.status == 200){
                                loadLevelsInfo(complete.json.levels);
                                if(typeof needRefreshButtons != "undefined" && needRefreshButtons){
                                    waitForAndDo(["buttonStartNegotiation", "buttonStartSigning", "buttonBreakNegotiation", "buttonBreakSigning"], refreshButtons);
                                }
                                negoLevelSize = complete.json.levels.length;
                            }else{
                                console.log("Error getting negotiation list");
                            }
                        },
                        scope: this
                    }
                });
            }

            function deleteNodeDialog(){
                if (currentNode.depth == 0){
                    deleteAnswer("Удаление уровня согласования",
                        "Вы действительно хотите удалить уровень согласования:</br>"+currentNode.label+" ?",
                        deleteCurrentNode);
                }else{
                    deleteAnswer("Удаление согласующего",
                        "Вы действительно хотите удалить согласующего:</br>"+currentNode.label+" ?",
                        deleteCurrentNode);
                }
            }

            function MoveUp(){
                // console.log(currentNode);
                if (currentNode){
                    var nodeRef = currentNode.data.id;
                    changePosition(nodeRef, -1, refreshNegotiationList);
                }
            }

            function MoveDown(){
                if (currentNode){
                    var nodeRef = currentNode.data.id;
                    changePosition(nodeRef, 1, refreshNegotiationList);
                }
            }

            function changePosition(nodeRef, increment, callback){
                Alfresco.util.Ajax.jsonGet({
                    method:"GET",
                    url: "/share/proxy/alfresco/negotiation/change-position-in-negotiation-list?nodeRef="+nodeRef+"&increment="+increment,
                    successCallback:{
                        fn: callback,
                        scope: this
                    }
                });
            }

            function deleteCurrentNode(){
                if (currentNode) {
                    var nodeRef = currentNode.data.id;
                    var parentNodeRef = getParentIfSingleChild(currentNode);
                    deleteNode(nodeRef, refreshNegotiationList, parentNodeRef);
                }
            }

            function deleteNode(nodeRef, callback, parentNodeRef){
                var data = {"type": "cm:folder"};
                Alfresco.util.Ajax.jsonPost({
                    method:"POST",
                    url: "/share/proxy/alfresco/slingshot/doclib/action/files?alf_method=delete",
                    dataObj: {nodeRefs:parentNodeRef ?[nodeRef, parentNodeRef] :[nodeRef]},
                    successCallback:{
                        fn: callback,
                        scope: this
                    }
                });
            }

            function getParentIfSingleChild(node) {
                var result = null;

                if(node && node.parent && node.parent.data && node.parent.data.id && node.parent.children.length==1){
                    result = node.parent.data.id;
                }

                return result;
            }


            function deleteAnswer(title, text, callback){
                answerDeleteDialog = new YAHOO.widget.SimpleDialog("dlgDelete", {
                    width: "400px",
                    height:"150px",
                    fixedcenter: true,
                    modal: true,
                    visible: false,
                    draggable: false
                });
                var handleYes = function() {
                    callback();
                    this.destroy();
                };

                var handleNo = function() {

                    this.destroy();
                };

                var myButtons = [
                    { text: "Да", handler: handleYes },
                    { text: "Нет", handler: handleNo, isDefault:true}
                ];

                answerDeleteDialog.cfg.queueProperty("buttons", myButtons);
                answerDeleteDialog.setHeader(title);
                answerDeleteDialog.setBody("<p class='delete-message'>"+text+"</p>");
                answerDeleteDialog.render(document.body);
                answerDeleteDialog.cancelEvent.subscribe(function(){
                    this.hide();
                    this.destroy();
                });
                answerDeleteDialog.show();
            }

            function OpenNegotiatorDialog(){
                //negotiatorDialog.show();
            }

            function addNegotiator(callback){
                var levelId = currentNode.data.id;
                var employeeNodes = document.getElementById('${formId}-employeeField-added').value;
                Alfresco.util.Ajax.jsonPost({
                    method:"POST",
                    url: "/share/proxy/alfresco/negotiation/create-negotiator",
                    dataObj: {
                        negotiationLevelNodeRef: levelId,
                        employeeNodeRefs: employeeNodes
                    },
                    successCallback:{
                        fn: callback,
                        scope: this
                    }
                });
            }

            function showPopupMessage(message){
                var popup = Alfresco.util.PopupManager.displayMessage(
                    {
                        text: message,
                        displayTime: 0
                    });
                setTimeout(function(){popup.destroy();},1500);
            }



            function addLevel(callback){
                var levelName = document.getElementById('${formId}-level-name').value;
                var levelDuration = document.getElementById('${formId}-level-duration').value;
                var levelType = document.getElementById('${formId}-level-type').value;

                Alfresco.util.Ajax.jsonPost({
                    method:"POST",
                    url: "/share/proxy/alfresco/negotiation/create-negotiation-level",
                    dataObj: {
                        documentNodeRef: "${destination}",
                        levelName: levelName,
                        levelDuration: levelDuration,
                        levelType: levelType
                    },
                    successCallback:{
                        fn: callback,
                        scope: this
                    }
                });
            }

            <#if isCreate == true >



            function getTemplate()
            {
                doctype = '';
                if ("${fieldDocType}" != "none")
                {
                    doctype=$("#${fieldDocType}").val();

                    if (doctype)
                        doctype= "?docType=" + doctype;

                }

                Alfresco.util.Ajax.request({
                    method: "GET",
                    url: "/share/proxy/alfresco/documents/getNegotiationTemplates" + doctype,
                    successCallback: {
                        fn: function (complete) {

                            table = "";
                            for (i=0; i<complete.json.items.length; i++)
                            {
                                var item = complete.json.items[i];
                                fArgs = "'" + item.nodeRef + "'"
                                table += '<tr onclick="createNegotiationTemplate(' + fArgs + ')">';
                                table += "<td class='templateItem'>" + item.name + "</td>";
                                table += "</tr>";
                            }

                            selectTemplate = '	<div style="padding:5px"> \
												<div class="panel panel-primary"> \
													<div class="panel-body"> \
														<table style="width: 100%;"> \
															<tbody id="templateTable"> ' + table +
                                '</tbody> \
                            </table> \
                        </div> \
                    </div>	\
                </div>	'

                            if (document.negotiationTemplateDialog == null)
                            {
                                var dialog = new YAHOO.widget.SimpleDialog("negotiationTemplate_view" , {
                                    width: "500px",
                                    fixedcenter: true,
                                    modal: true,
                                    visible: false,
                                    draggable: true,
                                    zIndex:10
                                });

                                dialog.setHeader('Выбор шаблона');

                                document.negotiationTemplateDialog =  dialog;
                            }

                            document.negotiationTemplateDialog.setBody(selectTemplate);
                            document.negotiationTemplateDialog.render(document.body);
                            document.negotiationTemplateDialog.show();

                        },
                        scope: this
                    }
                });
            }


            function createNegotiationTemplate(itemId)
            {
                document.negotiationTemplateDialog.setBody("<div class='rowNoMargin'> <div style='float:left'> <img src='/share/res/extension/icons/progress.gif' /> </div> <div style='float:left; padding-left: 10px;'> Загрузка...</div>  </div>");
                Alfresco.util.Ajax.request({
                    method: "GET",
                    url: "/share/proxy/alfresco/document/copyNegotiation?negotiationId=" + itemId + "&docId=${destination}" ,
                    successCallback: {
                        fn: function (complete) {
                            if (complete.json.id)
                                refreshNegotiationList();
                            document.negotiationTemplateDialog.hide();
                            getNegotiationTableData();

                            var problemRoles = complete.json.problemRoles;
                            if (problemRoles && problemRoles.length){

                                var message = "По Ролям:<br>" + problemRoles.map(function (role) {
                                    return "&nbsp;&nbsp;* " + role;
                                }).join("<br>") + "<br>не удалось вычислить исполнителей";

                                message = "<div style='padding: 10px'>" + message + "</div>";


                                var dialog = new YAHOO.widget.SimpleDialog("negotiationWarningTemplate_view" , {
                                    width: "500px",
                                    fixedcenter: true,
                                    modal: true,
                                    visible: false,
                                    draggable: true,
                                    zIndex:10
                                });

                                var handleClose = function() {
                                    this.destroy();
                                };

                                var myButtons = [
                                    { text: "Закрыть", handler: handleClose }
                                ];
                                dialog.cfg.queueProperty("buttons", myButtons);

                                dialog.setHeader('Внимание');
                                dialog.render(document.body);
                                dialog.cancelEvent.subscribe(function(){
                                    this.destroy();
                                });
                                dialog.setBody(message);

                                dialog.show();

                            }

                        },
                        scope: this
                    }
                });



            }


            </#if>

            require(["jquery"], function($){
                <#if mainFormId!="">
                waitForAndDo(["${formId}-negotiation-tree"], function () {
                    <#else>
                    YAHOO.util.Event.onContentReady("${formId}-negotiation-tree", function () {
                        </#if>

                        function loadNegotiation(id) {
                            <#if mainFormId!="">
                            waitForAndDo([id], this.handleOnContentReady);
                            <#else>
                            YAHOO.util.Event.onContentReady(id, this.handleOnContentReady, this);
                            </#if>
                        }

                        loadNegotiation.prototype.handleOnContentReady = function (e) {
                        };

                        var negotiationLoad = new loadNegotiation("${tabId}");

                        treeInit();
                        refreshNegotiationList();
                    });
                });


        //]]></script>

</#macro>