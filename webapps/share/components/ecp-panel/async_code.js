require(["jquery","btlUI/MenuBar/ECPAllMenuBar", "dojo/domReady!"], function ($, ECPAllMenuBar) {

    var loadingBlock = document.getElementById(BTL.formId + "-ecp-loading");
    var loadingMsg = loadingBlock.querySelector("p.loading-msg");

    var linkDownloadSignedDocs = document.getElementById(BTL.formId + "-load-sign-all-file");
    var linkDownloadSignedDoc = document.getElementById(BTL.formId + "-load-sign-file");

    var signatureText = document.getElementById(window.BTL["formId"] + "-signature-text");

    var btlEcp = new BTLEcp();
    btlEcp.signatureText = signatureText;

    var isLoadPlugin = false;

    var currentRowDataGrid = null;

//--------------------------dojo меню ЭЦП действия со всеми докумкентами------------------------------------------------
    new ECPAllMenuBar({
        parentNodeRef: window.BTL["parent"]
    }).placeAt(window.BTL["formId"] + "-menu-ecp-all");
//----------------------------------------------------------------------------------------------------------------------

    var doc_w = $(document).width();
    var doc_h = $(document).height();
    var dialog_w = 870;

    var dialog = new YAHOO.widget.SimpleDialog(window.BTL["formId"] + "-dialog-all-verify", {
        width: dialog_w + "px",
        fixedcenter: false,
        x: doc_w / 2 - dialog_w / 2,
        y: 150,
        modal: true,
        visible: false,
        draggable: true
    });

    var handleYes = function (e, obj) {
        try {

        } catch (e) {

        }

        dialog.hide();
    };

    var Buttons = [
        {text: "Ok", handler: handleYes, isDefault: true}
    ];

    dialog.cfg.queueProperty("buttons", Buttons);
    dialog.setHeader('Проверка всех подписанных файлов');

    dialog.setBody('Загрузка ...');
    dialog.render(document.body);
//-----------------------------------------------------------------------------------

    cadesplugin.then(pluginLoadSuccess, pluginLoadFalse);

    function pluginLoadSuccess() {
        var canAsync = !!cadesplugin.CreateObjectAsync;
        if (canAsync) {
            document.getElementById(BTL.formId + "-block-all").classList.remove("visible_none");
            var elementListCertificates = document.getElementById(BTL.formId + "-list-certificates");
            btlEcp.getListCertificates(elementListCertificates);
            isLoadPlugin = true;
        } else {
            var oSignedData = cadesplugin.CreateObject("CAdESCOM.CadesSignedData");
            var dataToSign = "dataToSign";
            oSignedData.Content = dataToSign;
        }
    }

    function pluginLoadFalse() {
        document.getElementById(BTL.formId + "-msg-init").innerHTML = "Не удалось загрузить плагин ЭЦП.</br>" +
            "Проверьте наличие установленного плагина КриптоПро Browser plug-in";
    }

    //Событие выбора документа
    $("#file-attach-panel").on("onSelectRow", function (event, data) {
        if (isLoadPlugin) {
            currentRowDataGrid = data;
            loading("Загрузка");
            //убираем сообщение по умолчанию
            $("#" + window.BTL["formId"] + "-msg-init").addClass("visible_none");
            //очищаем поле для сообщений
            document.getElementById(BTL.formId + "-signature-text").innerHTML = '';
            // console.log("isSignedEcp:" + data["isSignedEcp"]);
            btlEcp.httpGet('/share/proxy/alfresco/is-signed-file?nodeRef=' + data["nodeRef"]).then(
                results => {
                    if (JSON.parse(results).isSigned) {
                        // console.log("Документ подписан");
                        if(data["nodeRef"].indexOf('version2Store') > -1){
                            $("#" + window.BTL["formId"] + "-block-certificates").addClass("visible_none");
                            $("#" + window.BTL["formId"] + "-block-not-sing").addClass("visible_none");

                            signatureText.textContent = "Последняя версия файла уже подписана с помощью ЭЦП";
                        }else {
                            $("#" + window.BTL["formId"] + "-block-certificates").addClass("visible_none");
                            $("#" + window.BTL["formId"] + "-block-not-sing").removeClass("visible_none");

                            linkDownloadSignedDoc.href = JSON.parse(results).downloadUrl;
                            signatureText.textContent = "Текущий файл уже подпсан с помощью ЭЦП";
                        }
                        endLoading();
                    } else {
                        if (JSON.parse(results).isLockable) {
                            // console.log("Документ заблокирован");
                            $("#" + window.BTL["formId"] + "-block-certificates").addClass("visible_none");
                            $("#" + window.BTL["formId"] + "-block-not-sing").addClass("visible_none");
                            signatureText.textContent = "Документ заблокирован";
                            endLoading();
                        } else {
                            // console.log("Документ не подписан");
                            $("#" + window.BTL["formId"] + "-block-not-sing").addClass("visible_none");
                            $("#" + window.BTL["formId"] + "-block-certificates").removeClass("visible_none");
                            endLoading();
                        }
                    }
                }, error => {
                    console.error(error);
                });
            $("#" + window.BTL["formId"] + "-doc-name").html("<b><i>" + data["name"] + "</i></b>");
            $("#" + window.BTL["formId"] + "-signature-text").html("");
        }
    });

    //Событие клик по кнопке Подписать
    $("#" + window.BTL["formId"] + "-btn-toSign").on("click", function (event) {
        var docInfo = getSelectedDocs();
        var cert = getSelectedCertificate();
        // console.log("Press sign...");
        if (docInfo && cert) {
            loading("Подписание документа...");
            btlEcp.signECP(docInfo.docUrl, docInfo.docNodeRef, cert).then(results => {
                $("#" + window.BTL["formId"] + "-block-certificates").addClass("visible_none");
                $("#" + window.BTL["formId"] + "-block-not-sing").removeClass("visible_none");
                signatureText.innerHTML = "<b style='color: green'>Подпись сформирована успешно</b>";
                reloadGrid();
                endLoading();
            }, error => {
                btlEcp.Reverse(docInfo.docNodeRef).then(result =>{
                    signatureText.innerHTML = "<b style='color: red'>" + error.message + "</b>";
                    endLoading();
                },
                e => {
                    signatureText.innerHTML = "<b style='color: red'>" + error.message + "</b>";
                    endLoading();
                });
            });
        }
    });

    //Событие клик по кнопке проверить подпись
    $("#" + window.BTL["formId"] + "-btn-toVerify").on("click", function (event) {
        loading("Проверка подписи...");
        var docInfo = getSelectedDocs();
        if (docInfo)
            btlEcp.Verify(docInfo.docNodeRef, docInfo.docUrl).then(results => {
                if (results == true) {
                    signatureText.innerHTML = '<img src="/share/res/extension/icons/ok.png" style="height: 20px"> Подпись верна';
                } else {
                    signatureText.innerHTML = '<img src="/share/res/extension/icons/false.png" style="height: 20px"> Подпись недействительна';
                }
                endLoading();
            }, error => {
                signatureText.innerHTML = 'Ошибка:' + error;
                endLoading();
            });
    });

    //Событие клик по кнопке скачать
    $("#" + window.BTL["formId"] + "-btn-load-sign-file").on("click", function (event) {
        linkDownloadSignedDoc.click();
    });

    //Событие клик по кнопке Скачать все подписанные сертификаты
    $("#" + window.BTL["formId"] + "-btn-load-all").on("click", function (event) {
        btlEcp.httpGet('/share/proxy/alfresco/get-all-file-and-sign?nodeRef=' + window.BTL["parent"]).then(
            results => {
                var link = JSON.parse(results).link;
                if (link) {
                    linkDownloadSignedDocs.href = link;
                    linkDownloadSignedDocs.click();
                    // console.log(link);
                } else {
                    alert("Подписанных документов не обнаруженно");
                }

            }, error => {

            });
    });

    //Событие клик по кнопке Проверить все подписи
    $("#" + window.BTL["formId"] + "-btn-toVerifyPac").on("click", function (event) {

        var body = '<table style="width:100%;"><thead>' +
            '<tr>' +
            '<th style="width:70%;">Файл</th>' +
            '<th>Статус подписи</th>' +
            '</tr>' +
            '</thead><tbody id ="' + window.BTL["formId"] + '-table-all-verify"></tbody></table>';
        dialog.setBody(body);
        var tableVerify = document.getElementById(window.BTL["formId"] + '-table-all-verify');
        btlEcp.httpGet('/share/proxy/alfresco/get-signed-files?nodeRef=' + window.BTL["parent"]).then(
            results => {
                if (JSON.parse(results).totalRecords > 0) {
                    var items = JSON.parse(results).items;
                    var signedFiles = [];
                    items.forEach(function (item) {
                        var docUrl = "/share/proxy/alfresco/slingshot/node/content/";
                        docUrl += item.nodeRef.replace('://', '/');
                        docUrl += "/" + item.name + "?a=true";
                        signedFiles.push({"name": item.name, "docNodeRef": item.nodeRef, "docUrl": docUrl});
                        var newRow = tableVerify.insertRow(0);
                        var newCellDoc = newRow.insertCell(0);
                        var newTextDoc = document.createTextNode(item.name);
                        newCellDoc.appendChild(newTextDoc);

                        var newCellStatus = newRow.insertCell(1);
                        newCellStatus.innerHTML = '<img src="/share/res/js/lib/loading/loading.gif" style="height: 20px">';

                        btlEcp.Verify(item.nodeRef, docUrl).then(res => {
                            if (res == true) {
                                newCellStatus.innerHTML = '<img src="/share/res/extension/icons/ok.png" style="height: 20px"> Верна';
                            } else {
                                newCellStatus.innerHTML = '<img src="/share/res/extension/icons/false.png" style="height: 20px"> Недействительна';
                            }
                        }, error => {
                            newCellStatus.innerHTML = error;
                        });
                    });
                    dialog.show();
                }
            }, error => {
                console.error((error));
            });
    });

    //Событие клик по сертификату
    $("#" + window.BTL["formId"] + "-list-certificates").on("click", function (onchange) {
        var thumbprint = getSelectedCertificate();
        var elementBlockInfo = document.getElementById(BTL.formId + "-certificate-info");
        if (thumbprint && elementBlockInfo) {
            btlEcp.viewCertificateInfo(elementBlockInfo, thumbprint);
            elementBlockInfo.classList.remove("visible_none");
        }else{
            onchange.stopPropagation();
        }
    });

    function getSelectedDocs() {
        var docUrl = "",
            celValueNodeRef = "";

            var celValueName;

            if (!currentRowDataGrid) {
                alert("Не выбран ни один документ для подписи");
                return false;
            }
            celValueName = currentRowDataGrid['name'];
            var buf = document.createElement("span");
            buf.innerHTML = celValueName;
            celValueName = buf.textContent;
            celValueNodeRef = currentRowDataGrid['nodeRef'];
            if (celValueName && celValueNodeRef) {
                docUrl = "/share/proxy/alfresco/slingshot/node/content/";
                docUrl += celValueNodeRef.replace('://', '/');
                docUrl += "/" + celValueName + "?a=true";
            }

        return {"docUrl": docUrl, "docNodeRef": celValueNodeRef};
    }

    function getSelectedCertificate() {
        var listCert = document.getElementById(window.BTL["formId"] + "-list-certificates");
        var selectedCertID = listCert.selectedIndex;
        if (selectedCertID == -1) {
            alert("Не выбран не один сертификат");
            return false;
        }
        return listCert.options[selectedCertID].value.split(" ").reverse().join("").replace(/\s/g, "").toUpperCase();
    }

    function loading(message) {
        loadingBlock.setAttribute("style", "display: block");
        loadingMsg.textContent = message;
    }

    function endLoading() {
        loadingBlock.setAttribute("style", "display: none");
        loadingMsg.textContent = '';
    }

    function reloadGrid ()  {
        require(["dojo/topic"], function (topic) {
            topic.publish("refreshAttachmentsGrid");
        });
    }

//dev function----------------------------------------------------------------------------------------------------------
    function loadSignECP(nodeRef, name) {
        var linkLoadSign = $("#" + window.BTL["formId"] + "-load-sign")[0];
        var linkLoadSignUrl = "/share/proxy/alfresco/slingshot/node/content/";
        linkLoadSignUrl += nodeRef.replace('://', '/');
        linkLoadSignUrl += "/" + name + "?a=true";
        linkLoadSign.href = linkLoadSignUrl;
        linkLoadSign.classList.remove("visible_none");
    }

    function loadSignECPFile() {

        var linkLoadSignFile = $("#" + window.BTL["formId"] + "-load-sign-file")[0];
        linkLoadSignFile.href = getSelectedDocs().docUrl;
        linkLoadSignFile.classList.remove("visible_none");
    }

//dev function----------------------------------------------------------------------------------------------------------


});


