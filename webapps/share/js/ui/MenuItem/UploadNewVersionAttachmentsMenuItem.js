/**
 * Created by nabokov on 30.08.2016.
 */
define([
    'dojo/_base/declare',
    './_MenuItem',
    'dojo/topic',
    'jquery',

], function(declare, MenuBarItem, topic, $) {

    return declare([MenuBarItem], {
        label: 'Загрузить новую версию',
        iconClass: 'dijitCommonIcon icon-add-new-version btl-icon-16',
        gridId: null,

        endPostCreate: function() {
            this.grid = $('#' + this.gridId);
            this.fileUpload = Alfresco.getFileUploadInstance();
        },

        onClick: function(e) {
            var rowData = this.getCurrentRow();
            var displayName = rowData['name'],
                nodeRef = new Alfresco.util.NodeRef(rowData['nodeRef']),
                version = rowData['currentVersionLabel'];

            var extensions = '*';
            if (displayName && new RegExp(/[^\.]+\.[^\.]+/).exec(displayName)) {
                // Only add a filtering extension if filename contains a name and a suffix
                extensions = '*' + displayName.substring(displayName.lastIndexOf('.'));
            }
            // console.log('Current version: ' + version);

            var singleUpdateConfig =
                {
                    updateNodeRef: nodeRef,
                    updateFilename: displayName,
                    updateVersion: version,
                    suppressRefreshEvent: true,
                    overwrite: true,
                    filter: [
                        {
                            description: 'Описание',
                            extensions: extensions,
                        }],
                    mode: this.fileUpload.MODE_SINGLE_UPDATE,
                    onFileUploadComplete: {
                        fn: function addPropetries(complete) {
                            if (complete.successful.length > 0) {
                                var descTextarea = this.fileUpload.uploader.description;
                                if (descTextarea && descTextarea.value.length > 0) this.attachmentComment = descTextarea.value;
                                Alfresco.util.Ajax.jsonPost({
                                    method: 'POST',
                                    url: Alfresco.constants.PROXY_URI + 'attachment/set-attachment-comment',
                                    dataObj: {
                                        'attachmentNodeRef': complete.successful[0].nodeRef,
                                        'attachmentComment': (this.attachmentComment) ? this.attachmentComment : '',
                                    },
                                });
                            }
                            topic.publish('refreshAttachmentsGrid');
                        },
                        scope: this,
                    },
                };
            this.fileUpload.show(singleUpdateConfig);
        },
    });
});