/**
 * Created by nabokov on 02.09.2016.
 */
define([
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dojo/topic",
    "jquery"

],function(declare, _WidgetBase, topic, $ ) {

    return declare([_WidgetBase], {

        idPosition:"",

        postMixInProperties: function () {
            this.inherited(arguments);
            topic.subscribe("SELECT_ROW_ATTACHMENTS_TREE_GRID", this.filePreview.bind(this));
        },

        filePreview: function (rowData) {
            var nodeRef = rowData.nodeRef,
                name = rowData.name,
                preview = rowData.webDavURL,
                idPosition = this.idPosition,
                urlFrame ="/share/proxy/alfresco/createReview?cardId=";

            var src = urlFrame + preview;
            if (rowData.currentVersionLabel && rowData.versionLabel && rowData.currentVersionLabel == rowData.versionLabel && rowData.preview){
                src = "/share/page/btl-filePreview?nodeRef=" + preview;
            }

            if (document.getElementById(idPosition))
    		{
	            document.getElementById(idPosition).innerHTML = '<iframe id="iframe" width="100%" height="1000" src="' + src + '">';
	            $('#iframe').load(function (e) {
	                var iframe = $("#iframe")[0];
	                var ifTitle = iframe.contentDocument.title;
	                if (ifTitle.indexOf("500") >= 0) {
	                    document.getElementById(idPosition).innerHTML = 'Для данного файла предпросмотр недоступен. <a style="color: blue;"  href="/share/proxy/alfresco/slingshot/node/' + nodeRef.replace("://", "/") + '/content/' + name + '?a=true">Для загрузки нажмите здесь.</a>';
	                }
	            });
    		}
        }
    });

});