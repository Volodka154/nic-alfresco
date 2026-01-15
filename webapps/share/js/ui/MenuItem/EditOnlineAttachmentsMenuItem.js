/**
 * Created by nabokov on 01.09.2016.
 */
define([
    "dojo/_base/declare",
    "./_MenuItem",
    "dojo/topic",
    "jquery"
], function(declare, MenuBarItem, topic, $) {

    return declare([MenuBarItem], {
        label: "Редактировать OnLine",
        iconClass: "dijitCommonIcon icon-edit-for-attach btl-icon-16",
        gridId: null,

        endPostCreate: function () {
            this.grid = $("#" + this.gridId);
        },

        onClick: function(e){
            var rowData = this.getCurrentRow();
            //var displayName = rowData['name'],
            var webDavServiceURL = rowData['webDavServiceURL'];
            //    webDavURL= rowData['webDavURL'];
            var davProtocol = "vnd.sun.star.webdav";
            if (window.location.protocol.indexOf("https") != -1) {
                davProtocol = "vnd.sun.star.webdavs";
            }
            var webdavPath = davProtocol + "://" + window.location.host + "/alfresco" + webDavServiceURL;
            //var webdavPath = davProtocol + "://"+ window.location.host +"/alfresco/s/api/node/versionStore/version2Store/4ee8cfad-4833-46bd-b4e8-29e83aabd470/content;cm%3Acontent";
            //var displayName = rowData['name'],
            //    nodeRef = new Alfresco.util.NodeRef(rowData['nodeRef']);
            document.location.assign(webdavPath);
        },
    });
});