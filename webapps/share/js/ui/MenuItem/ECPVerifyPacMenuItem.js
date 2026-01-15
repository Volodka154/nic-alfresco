/*
Для работы кнопки требуется что бы были подключенны следующие библиотеки
<@script type="text/javascript" src="/share/res/components/ecp-panel/cadesplugin_api.js"></@script>
<@script type="text/javascript" src="/share/res/components/ecp-panel/async_code.lib.js"></@script>
*/

define([
    "dojo/_base/declare",
    "./_MenuItem",
    "../Dialog/ECPVerifyPacDialog.lib"
], function(declare, MenuBarItem, ECPVerifyPacDialog) {

    return declare([MenuBarItem], {
        label: "Проверить все подписи",
        iconClass: "dijitCommonIcon dijitIconCopy",
        parentNodeRef: null,

        endPostCreate: function () {
            this.dialog = new ECPVerifyPacDialog({
                parentNodeRef: this.parentNodeRef
            });
        },

        onClick: function(e){
            this.dialog.renderContentDialog();
        },

    });
});