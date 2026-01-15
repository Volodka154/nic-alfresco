/**
 * Created by nabokov on 19.09.2016.
 */

define([
    "dojo/_base/declare",
    "./_AlfMenuBarItem",
    "dojo/topic",
    "btlUI/Dialog/DownloadFromScaner",
    "./_mixinIsReadOnly"
], function (declare, MenuBarItem, topic, DownloadFromScaner, _mixinIsReadOnly) {

    return declare([MenuBarItem, _mixinIsReadOnly], {
        label: "Загрузить со сканера",
        iconClass: "dijitCommonIcon icon-add btl-icon-16",
        parentNodeRef: null,

        postMixInProperties: function () {
            this.inherited(arguments);
        },

        postCreate: function () {
            this.inherited(arguments);
            this.downloadFromScaner = new DownloadFromScaner({
                parentNodeRef: this.parentNodeRef
            });
        },

        onClick: function (e) {
            this.downloadFromScaner.openDialog();
        },


    });
});