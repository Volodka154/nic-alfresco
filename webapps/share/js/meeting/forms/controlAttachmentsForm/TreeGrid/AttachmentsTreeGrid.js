/**
 * Created by nabokov on 02.09.2016.
 */
define([
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dojo/topic",
    "dojo/_base/lang",
    "dojo/text!./templates/AttachmentsTreeGrid.html",
    "btlUI/uiLib",
    "meeting/utils/base",
    "alfresco/core/Core",
    "jquery",

], function(declare, _WidgetBase, _TemplatedMixin, topic, lang, template, uiLib, utilBase, Core, $) {

    return declare([_WidgetBase, _TemplatedMixin, Core], {
        templateString: template,
        parentNodeRef:"",
        url: "",
        isLoad:false,
        formId:"",
        singIcon: "icon-is-sing",
        colModel: [
            {
                "name": "nodeRef",
                "key": true,
                search: false,
                "hidden": true
            }, {
                "name": "webDavServiceURL",
                /*"width": 175,*/
                "label": "webDavServiceURL",
                search: false,
                "hidden": true
            },
            {
                "name": "webDavURL",
                /*"width": 175,*/
                "label": "webDavURL",
                search: false,
                "hidden": true
            },
            {
                "name": "name",
                "label": "Название",
                search: false,
                width: 170
            }, {
                "name": "versionLabel",
                search: false,
                //"sorttype":"string",
                "label": "Версия",
                "width": 75,
                "fixed": true
            }, {
                "name": "signIcon",
                search: false,
                "label": "ЭЦП",
                "width": 25,
                "fixed": true,
                "hidden": true
            },{
                "name": "modifier",
                search: false,
                //"sorttype":"string",
                "label": "Автор",
                "width": 100,
                "fixed": true
            }, {
                "name": "modifiedDate",
                search: false,
                //"sorttype":"string",
                "label": "Дата добавления",
                "width": 100
            }, {
                "name": "attachmentComment",
                search: false,
                classes: "attachment-comment",
                //"sorttype":"string",
                "label": "Описание документа/Комментарий к версии",
                "width": 250
            }, {
                "name": "preview",
                search: false,
                "hidden": true
            }, {
                "name": "currentVersionLabel",
                search: false,
                "hidden": true
            },
            {
                "name": "isSignedEcp",
                search: false,
                "hidden": true
            }
        ],
        loadonce: false,
        hideHeader: false,
        isPrimary: true,
        signIcon: "<span class='icon-is-sing btl-icon-16' style='margin: 0 5px;'></span>",

        cssRequirements: [{cssFile: "/share/res/extension/css/attachment-tree-grid.css"}],

        postMixInProperties: function () {
            this.uid = this.formId;
            
            
            var store = utilBase.getStoreById("MEETING_STORE");	                
            handleAlfSubscribe = store.handleAlfSubscribe;  
            
            
            handleAlfSubscribe.push(this.alfSubscribe("refreshAttachmentsGrid", lang.hitch(this, this.refreshAttachmentsGrid), true));      
            
            handleAlfSubscribe.push(this.alfSubscribe("selectTabAttachments", lang.hitch(this, this.selectTabAttachments), true)); 
            
            handleAlfSubscribe.push(this.alfSubscribe("SELECT_ROW_ATTACHMENTS_TREE_GRID", lang.hitch(this, this.selectRowEvent), true));
            handleAlfSubscribe.push(this.alfSubscribe("ALF_UPLOAD_DIALOG_OK_CLICK", lang.hitch(this, this.refreshAttachmentsGrid), true));
            handleAlfSubscribe.push(this.alfSubscribe("TRIGGER_CURRENT_ROW_DATA_ATTACHMENTS", lang.hitch(this, this.topicRowData), true));
            handleAlfSubscribe.push(this.alfSubscribe("SELECT_ATTACHMENTS_TAB", lang.hitch(this, this.start), true));
            
            this.inherited(arguments);
        },

        selectTabAttachments:function(){
        	if (!this.isLoad)
    		{
    			this.start();
    		}
        },
        
        refreshAttachmentsGrid: function (data) {
            if (!this.nodeGrid) {
                this.start();
            }
            this.nodeGrid.trigger("reloadGrid");
        },

        selectRowEvent: function (data) {
            if(data.uid != this.uid){
                if (this.nodeGrid)
                    this.nodeGrid.find('tr').removeClass('ui-state-highlight');
            }
        },

        topicRowData: function () {
        	if (this.grid)
    		{
	            var selRowId = this.grid.jqGrid('getGridParam', 'selrow');
	            if(selRowId) {
	                var rowData = this.grid.getRowData(selRowId);
	                
	                this.alfPublish("SELECT_ROW_ATTACHMENTS_TREE_GRID", rowData, true);
	                
	                //topic.publish("SELECT_ROW_ATTACHMENTS_TREE_GRID", rowData);
	                this.grid.trigger("onSelectRow", [rowData]);
	                if (document.getElementById(selRowId))
	                	document.getElementById(selRowId).classList.add('ui-state-highlight');
	            }
    		}        	
        },
        getCurrentRowData: function () {
            var selRowId = this.grid.jqGrid('getGridParam', 'selrow'),
                rowData = this.grid.getRowData((selRowId)? selRowId: 0);
            return rowData;
        },
      
        
        start: function(){
        	
        	if (this.isLoad) return;
        	
            var __atchTreeGrid = this;

            if(!this.url) {
                this.url = "/share/proxy/alfresco/common/get-attachments-tree?" +
                    "objectType=btl-tasksAttachments:tasksAttachmentsDataType&" +
                    'qualifyStr=AND PARENT:"' + this.parentNodeRef + '"&allVersions=true';
            }

            this.nodeGrid = $('#' + this.uid);

            
            var grid = this.nodeGrid.jqGrid({
                url: this.url,
                colModel: this.colModel,
                width: 600,
                search: false,
                hoverrows: false,
                viewrecords: true,
                zIndex: 0,
                gridview: true,
                height: "auto",
                //"sortname":"versionLabel",
                treeGrid: true,
                // which column is expandable
                ExpandColumn: "name",
                // datatype
                treedatatype: "json",
                // the model used
                treeGridModel: "adjacency",
                // configuration of the data comming from server
                treeReader: {
                    "parent_id_field": "rootVersion",
                    "level_field": "level",
                    "leaf_field": "isLeaf",
                    "expanded_field": "expanded",
                    "loaded": "loaded",
                },

                loadonce: this.loadonce,
                rowNum: 100,
                datatype: "json",

                
                onSelectRow: function (id) {
                    var rowData = grid.getRowData(id);
                    rowData["uid"] = __atchTreeGrid.uid;
                    __atchTreeGrid.alfPublish("SELECT_ROW_ATTACHMENTS_TREE_GRID", rowData, true);
                    //topic.publish("SELECT_ROW_ATTACHMENTS_TREE_GRID", rowData);
                    grid.trigger("onSelectRow", [rowData]);
                    document.getElementById(id).classList.add('ui-state-highlight');
                },
                loadComplete: function (data) {
                	if (__atchTreeGrid.domNode)
            		{
	                    //grid.setGridWidth((__atchTreeGrid.domNode)?__atchTreeGrid.domNode.clientWidth:0);
                		grid.setGridWidth(600);
	                    if (__atchTreeGrid.isPrimary && data && data.rows.length > 0) {
	                        var rowData = data.rows[0];
	                        rowData["uid"] = __atchTreeGrid.uid;
	                        grid.setSelection(rowData.nodeRef, false);
	                        __atchTreeGrid.alfPublish("SELECT_ROW_ATTACHMENTS_TREE_GRID", rowData, true);
	                        //topic.publish("SELECT_ROW_ATTACHMENTS_TREE_GRID", rowData);
	                    }
            		}
                },
                beforeProcessing: function (data, status, xhr) {
                    if (data && data.rows.length > 0) {
                        data = __atchTreeGrid.beforeProcess(data.rows);
                    }
                }
            });

            var orgExpandNode = $.fn.jqGrid.expandNode,
                orgCollapseNode = $.fn.jqGrid.collapseNode;
            $.jgrid.extend({
                expandNode: function (rc) {
                    var rowData = __atchTreeGrid.grid.getRowData(rc._id_);
                    rowData.signIcon = "";
                    __atchTreeGrid.grid.setRowData( rc._id_, rowData);
                    return orgExpandNode.call(this, rc);
                },
                collapseNode: function (rc) {
                    var rowData = __atchTreeGrid.grid.getRowData( rc._id_);
                    var localRow = __atchTreeGrid.grid.getLocalRow( rc._id_);
                    var children = __atchTreeGrid.grid.getNodeChildren(localRow);
                    children.forEach(function (item) {
                        if(item.isSignedEcp){
                            rowData.signIcon = __atchTreeGrid.signIcon;
                            __atchTreeGrid.grid.setRowData( rc._id_, rowData);
                        }
                    });
                    return orgCollapseNode.call(this, rc);
                }
            });

            document.getElementById(this.filePreviewContainerId).style.width = "600px"
            
            //grid.setGridWidth((__atchTreeGrid.domNode)?__atchTreeGrid.domNode.clientWidth:0);
            //grid.setGridWidth(600);
            
            if(this.hideHeader) {
                $('#gview_'+ this.uid + ' .ui-jqgrid-htable').hide();
            }

            
            
            $(window).bind('resize', function () {
                grid.setGridWidth((__atchTreeGrid.domNode)?__atchTreeGrid.domNode.clientWidth:0);
            	
            }).trigger('resize');

            this.inherited(arguments);
            this.grid = grid;
            
            this.isLoad = true;
        },

        beforeProcess: function (data) {
            var __atchTreeGrid = this;
            data.forEach(function (item) {
                if(item.isSignedEcp){
                	__atchTreeGrid.grid.showCol("signIcon");
                    item.signIcon = __atchTreeGrid.signIcon;
                }
                item.modifier = uiLib.getShotFIO(item.modifier);
            });
            return data;
        },

        setDataFromServer: function () {
            var __atchTreeGrid = this;
            Alfresco.util.Ajax.request({
                method: "GET",
                url: this.url,
                successCallback: {
                    fn: function (complete) {
                        this.nodeGrid.jqGrid('clearGridData');
                        if( this.nodeGrid.get(0).p.treeGrid ) {
                            var data;
                            if(complete.json.rows.length > 0){
                                data = __atchTreeGrid.beforeProcess(complete.json.rows);
                            }
                            this.nodeGrid.get(0).addJSONData({
                                total: 1,
                                page: 1,
                                records: data.length,
                                rows: data
                            });
                        }
                        else {
                            this.nodeGrid.jqGrid('setGridParam', {
                                datatype: 'local',
                                data: complete.json.rows,
                                rowNum: complete.json.rows.length
                            });
                        }
                        this.nodeGrid.trigger('reloadGrid');
                    },
                    scope: this
                }
            });
        }

    });
});