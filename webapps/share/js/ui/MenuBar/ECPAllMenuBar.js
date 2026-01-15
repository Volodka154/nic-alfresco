define([
    "dojo/_base/declare",
    "./_MenuBar",
    "btlUI/MenuItem/ECPVerifyPacMenuItem",
    "btlUI/MenuItemLink/ECPDownloadAllMenuItemLink.lib"
], function(declare, MenuBar, ECPVerifyPacMenuItem, ECPDownloadAllMenuItemLink) {

    return declare([MenuBar], {
        parentNodeRef: null,

        addButtons: function () {
            var ECPVerifyPac = new ECPVerifyPacMenuItem({
                parentNodeRef: this.parentNodeRef
            });
            ECPVerifyPac.placeAt(this.domNode);

            var ECPDownloadAll = new ECPDownloadAllMenuItemLink({
                parentNodeRef: this.parentNodeRef
            });
            ECPDownloadAll.placeAt(this.domNode);

        },
    });
});