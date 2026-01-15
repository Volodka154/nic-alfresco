/**
 * Created by nabokov on 01.09.2016.
 */
define([
    "dojo/_base/declare",
    "./_AlfMenuBarItem",
    "dojo/topic",
    "./_mixinIsReadOnly"
], function(declare, MenuBarItem, topic, _mixinIsReadOnly) {

    return declare([MenuBarItem, _mixinIsReadOnly], {
        label: "Редактировать OnLine",
        iconClass: "dijitCommonIcon icon-edit-for-attach btl-icon-16",

        postMixInProperties: function () {
            this.inherited(arguments);
        },

        metaSelectDocument: function (payload) {
            if(payload.item.status != ""){
                this.setVisibly(false);
            }else {
                this.setVisibly(true);
            }
        },

        onClick: function(e){

            var webDavServiceURL = this.selectedRowNode['webDavServiceURL'];
            var davProtocol = "vnd.sun.star.webdav";
            if (window.location.protocol.indexOf("https") != -1) {
                davProtocol = "vnd.sun.star.webdavs";
            }
            var webdavPath = davProtocol + "://" + window.location.host + "/alfresco" + webDavServiceURL;

            document.location.assign(webdavPath);
        },
    });
});