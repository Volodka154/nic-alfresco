/*
 Для работы кнопки требуется что бы были подключенны следующие библиотеки
 <@script type="text/javascript" src="/share/res/components/ecp-panel/cadesplugin_api.js"></@script>
 <@script type="text/javascript" src="/share/res/components/ecp-panel/async_code.lib.js"></@script>
 */
define([
    "dojo/_base/declare",
    "./_MenuItemLink"
], function(declare, MenuItemLink) {

    return declare([MenuItemLink], {
        label: "Скачать все подписанные ЭЦП",
        iconUrl: "/share/res/components/documentlibrary/actions/document-download-16.png",
        parentNodeRef: null,

        endPostCreate: function () {
            this.btlEcp = new BTLEcp();
        },

        onClick: function(e){
            this.btlEcp.httpGet('/share/proxy/alfresco/get-all-file-and-sign?nodeRef=' + this.parentNodeRef).then(
                results => {
                    var link = JSON.parse(results).link;
                    if (link) {
                        this.link.href = link;
                        this.link.click();
                    } else {
                        alert("Подписанных документов не обнаруженно");
                    }

                }, error => {
                    alert("Ошибка при попытке скачать все подписанные документы");
                    console.error(error);
                }
            );
        },
    });

});