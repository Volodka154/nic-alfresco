/**
 * Created by nabokov on 02.09.2016.
 */
define([
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_Container",
    "dojo/topic",
    "../MenuBar/BaseAttachMenuBar",
    "../TreeGrid/AttachmentsTreeGrid"
],function(declare, _WidgetBase, _Container, topic, TaskAttachMenuBar, AttachmentsTreeGrid ) {

    return declare([_WidgetBase, _Container], {

        parentNodeRef:"",
        formId:"",
        isReadOnly: false,
        postMixInProperties: function () {
            this.inherited(arguments);
            topic.subscribe("refreshAttachmentsGrid", this.refreshAttachmentsGrid.bind(this));
            topic.subscribe("SELECT_ROW_ATTACHMENTS_TREE_GRID", this.changeStageMenuBar.bind(this));
        },

        postCreate: function(){
            this.attachTreeGrid = new AttachmentsTreeGrid({
                parentNodeRef: this.parentNodeRef,
                formId: this.formId,                
                attachmentComment: this.attachmentComment,
                linkDownloadEcpElemId: this.linkDownloadEcpElemId
            });
        },

        render: function(){
            this.addChild(this.attachTreeGrid);
            this.attachTreeGrid.startup();
            
            this.menuBar = new TaskAttachMenuBar({
                gridId: this.attachTreeGrid.uid,
                parentNodeRef: this.parentNodeRef,
                contentType: this.contentType,
                attachmentComment: this.attachmentComment,
                readOnly:this.readOnly
            });

            this.addChild(this.menuBar, 0);
            this.menuBar.setStageNotVisible();
            this.setOnLoadMenuStage();
        },

        refreshAttachmentsGrid: function (data) {
            this.attachTreeGrid.nodeGrid.trigger('reloadGrid');
        },

        setOnLoadMenuStage: function () {
            Alfresco.util.Ajax.request({
                method: "GET",
                url: Alfresco.constants.PROXY_URI + "slingshot/doclib/node/" + this.parentNodeRef.replace("://", "/"),
                successCallback: {
                    fn: function (complete) {
                            if (complete.json.item.permissions.userAccess["create"] == true) {
                                this.menuBar.setStageBase();
                            }else{
                                this.menuBar.setStageReadOnly();
                                this.isReadOnly = true;
                            }
                    },
                    scope: this
                }
            });
        },

        changeStageMenuBar: function (rowData) {        	
        	
            if (rowData['level'] != 0) {
                (this.isReadOnly)? this.menuBar.setStageReadOnly() : this.menuBar.setStageVersionNode();
            } else {
                var nodeRef = rowData['nodeRef'];
                if(this.isReadOnly){
                    this.menuBar.setStageReadOnly();
                }else {
                    var _this = this;
                    Alfresco.util.Ajax.jsonGet({
                        url: Alfresco.constants.PROXY_URI + "slingshot/doclib/node/" + nodeRef.replace("://", "/"),
                        successCallback: {
                            fn: function addPropetries(complete) {
                                if (complete.json.isSigned) {
                                    _this.menuBar.setStageSignedNode();
                                }else {
                                    if (complete.json.item.status != "") {
                                        _this.menuBar.setStageBlockingRootNode();
                                    } else {
                                    	if (
                                    	    (_this.isAdmin && _this.isAdmin == "true")
                                            || (complete.json.item.permissions.userAccess["delete"] == true && (Alfresco.constants.USERNAME == rowData.created))) {
                                            _this.menuBar.setStageRootNode();
                                        } else {
                                            _this.menuBar.setStageEditOnly();
                                        }
                                    }
                                }
                            },
                            scope: this
                        }
                    });
                }
            }
        }

    });

});