define([
    "dojo/_base/declare",
    "dojo/dom",
    "dijit/Dialog"
], function(declare, dom, Dialog) {

    return declare([Dialog], {
        title: "Проверка всех подписанных файлов",
        style: "width: 870px",
        parentNodeRef: null,

        postCreate: function () {
            this.inherited(arguments);
            this.domNode.classList.add("alfresco-dialog-AlfDialog");

            this.tbodyId = this.id + "-table-all-verify";

            this.template = '<table style="width:100%;"><thead>' +
            '<tr>' +
            '<th style="width:70%;">Файл</th>' +
            '<th>Статус подписи</th>' +
            '</tr>' +
            '</thead><tbody id ="' + this.tbodyId + '"></tbody></table>';

            this.btlEcp = new BTLEcp();
        },
        
        renderContentDialog: function () {
            this.set('content', this.template);

            var btlEcp = this.btlEcp;
            var tableVerify = dom.byId(this.tbodyId);
            btlEcp.httpGet('/share/proxy/alfresco/get-signed-files?nodeRef=' + this.parentNodeRef).then(
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
                                    newCellStatus.innerHTML = '<img src="/share/res/extension/icons/ok.png" style="height: 20px">' +
                                        ' <span style="position: relative; bottom: 5px;"> Верна</span>';
                                } else {
                                    newCellStatus.innerHTML = '<img src="/share/res/extension/icons/false.png" style="height: 20px"> ' +
                                        '<span style="position: relative; bottom: 5px;">Недействительна</span>';
                                }
                            }, error => {
                                newCellStatus.innerHTML = error;
                            });
                        });
                        this.show();
                    }else{
                        alert("Подписанных документов не обнаруженно");
                    }
                }, error => {
                    console.error((error));
                });
        },

    });

});