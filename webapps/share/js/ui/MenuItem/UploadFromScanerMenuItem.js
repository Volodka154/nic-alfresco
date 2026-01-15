/**
 * Created by nabokov on 19.09.2016.
 */

define([
    "dojo/_base/declare",
    "./_MenuItem",
    "dojo/topic",
    "../Dialog/DownloadFromScaner",
    "jquery"
], function (declare, MenuBarItem, topic, DownloadFromScaner, $) {

    return declare([MenuBarItem], {
        label: "Загрузить со сканера",
        iconClass: "dijitCommonIcon icon-add btl-icon-16",
        parentNodeRef: null,


        endPostCreate: function () {
            this.downloadFromScaner = new DownloadFromScaner({
                parentNodeRef: this.parentNodeRef
            });
        },

        onClick: function (e) {
            this.downloadFromScaner.openDialog();
        },


    });
});