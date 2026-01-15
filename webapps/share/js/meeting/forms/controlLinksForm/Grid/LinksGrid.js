/**
 * Created by nabokov on 02.09.2016.
 */
define([
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dojo/topic",
    "dojo/_base/lang",
    "dojo/text!./templates/LinksGrid.html",
    "btlUI/uiLib",
    "meeting/utils/base",
    "alfresco/core/Core",
    "alfresco/core/CoreXhr",
    "dojo/_base/lang",
    "jquery",

], function(declare, _WidgetBase, _TemplatedMixin, topic, lang, template, uiLib, utilBase, Core,CoreXhr,lang, $) {

    return declare([_WidgetBase, _TemplatedMixin, Core,CoreXhr], {
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
            },
            {
                "name": "name",
                "label": "Название",
                search: false,
                /*"width":170*/
            },
            {
                "name": "link_val",
                search: false,
                //"sorttype":"string",
                "label": "Тип ссылки",
                //"width": 75,
                "fixed": true
            },
            {
                "name": "nodeRefLinkType",
                search: false,
                "hidden": true
            },
            {
                "name": "typeRK",
                search: false,
                "hidden": true
            },
            {
                "name": "nodeRefRK",
                search: false,
                "hidden": true
            },
            {
                "name": "isEditable",
                search: false,
                "hidden": true
            }
        ],
        loadonce: false,
        hideHeader: false,
        isPrimary: true,
        signIcon: "<span class='icon-is-sing btl-icon-16' style='margin: 0 5px;'></span>",

        postMixInProperties: function () {
            this.uid = this.uidGrid;

            var store = utilBase.getStoreById("MEETING_STORE");
            handleAlfSubscribe = store.handleAlfSubscribe;

            //handleAlfSubscribe.push(this.alfSubscribe("refreshLinksGrid", lang.hitch(this, this.refreshLinksGrid), true));
            handleAlfSubscribe.push(this.alfSubscribe("SELECT_ROW_LINKS_GRID", lang.hitch(this, this.selectRowEvent), true));
            handleAlfSubscribe.push(this.alfSubscribe("REFRESH_LINKS_GRID", lang.hitch(this, this.setDataFromServer), true));
            handleAlfSubscribe.push(this.alfSubscribe("TRIGGER_CURRENT_ROW_DATA_LINKS", lang.hitch(this, this.topicRowData), true));
            handleAlfSubscribe.push(this.alfSubscribe("selectTabLinks", lang.hitch(this, this.selectTabLinks), true));
            handleAlfSubscribe.push(this.alfSubscribe("DATAGRID_GET_WIDGET_LINK_DATA", lang.hitch(this, this.getInfo), true));
            handleAlfSubscribe.push(this.alfSubscribe("DATAGRID_DELETE_WIDGET_LINK", lang.hitch(this, this.deleteLink), true));
            this.inherited(arguments);
        },

        selectTabLinks:function(){
        	if (!this.isLoad) {
    			this.startup();
    		}
    		else {
    		    this.refreshLinksGrid();
    		}
        },

        refreshLinksGrid:function(){
            this.nodeGrid.trigger("reloadGrid");
        },

        postCreate: function () {
            this.parentNodeRef = this.documentNodeRef;
            this.formId = this.uidGrid;
        },

        selectRowEvent: function (data) {
            if(data.uid != this.uid){
                this.nodeGrid.find('tr').removeClass('ui-state-highlight');
            }
        },

        topicRowData: function () {
            if (!this.grid)
                return;
            var selRowId = this.grid.jqGrid('getGridParam', 'selrow');
            if(selRowId) {
                var rowData = this.grid.getRowData(selRowId);
                this.alfPublish("SELECT_ROW_LINKS_GRID", rowData, true);
                //topic.publish("SELECT_ROW_LINKS_GRID", rowData);
                this.grid.trigger("onSelectRow", [rowData]);
                if (document.getElementById(selRowId))
                    document.getElementById(selRowId).classList.add('ui-state-highlight');
            }
        },

        getCurrentRowData: function () {
            var selRowId = this.grid.jqGrid('getGridParam', 'selrow'),
                rowData = this.grid.getRowData((selRowId)? selRowId: 0);
            return rowData;
        },

        getInfo: function () {
            var curRowData = this.getCurrentRowData();
            if (curRowData && curRowData != 0) {

                var item = {};
                item.config = {};
                item.data = {};

                item.data.nodeRef = curRowData.nodeRef;
                item.rootNodeRef = this.parentNodeRef;
                
                
                item.data["prop_btl-link_docType"]= curRowData.typeRK;
                item.data["assoc_btl-link_linkObject"] = curRowData.nodeRefRK;
                
                //{ name : curRowData.name, nodeRef : curRowData.nodeRefRK};
                
                
                item.data["assoc_btl-link_linkType"] = curRowData.nodeRefLinkType;

                item.config.dialogTitle = "Редактировать ссылку";
                item.config.dialogConfirmationButtonTitle = "Сохранить";
                item.config.dialogCancellationButtonTitle = "Отмена";
                item.config.formSubmissionTopic = "BTL_EDIT_WIDGET_LINK";

                this.alfPublish("BTL_CREATE_FORM_WIDGET_LINK", item, true);
            }
        },

        deleteLink: function(){
            var curRowData = this.getCurrentRowData();
            if (curRowData && curRowData != 0){
                if (!confirm("Вы действительно хотите удалить ссылку: " + curRowData.name +" ?"))
                    return;

                nodeRefs = [];
                nodeRefs.push(curRowData.nodeRef);
                this.serviceXhr({
                    url: "/share/proxy/alfresco/slingshot/doclib/action/files?alf_method=delete",
                    method: "POST",
                    data: {
                        "nodeRefs" : nodeRefs
                    },
                    successCallback: this.setDataFromServer(),
                    callbackScope: this
                });
            }
        },

        startup: function(){
        	if (this.isLoad) return;
            var _this = this;
            if(!this.url) {
                this.url = "/share/proxy/alfresco/search/widget-links?nodeRef=" +this.parentNodeRef + "&pq_datatype=JSON" ;
            }

            this.nodeGrid = $('#' + this.uid);

            var grid = this.nodeGrid.jqGrid({
                url: this.url,
                colModel: this.colModel,
                width: 1000,//this.domNode.clientWidth,
                search: false,
                autowidth: true,
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
                    rowData["uid"] = _this.uid;
                    _this.alfPublish("SELECT_ROW_LINKS_GRID", rowData, true);
                    //topic.publish("SELECT_ROW_LINKS_GRID", rowData);
                    grid.trigger("onSelectRow", [rowData]);
                    document.getElementById(id).classList.add('ui-state-highlight');
                },
                loadComplete: function (data) {
                    if (_this.domNode){
                        grid.setGridWidth(1000);//_this.domNode.clientWidth);
                        if (_this.isPrimary && data && data.rows && data.rows.length > 0) {
                            var rowData = data.rows[0];
                            rowData["uid"] = _this.uid;
                            grid.setSelection(rowData.nodeRef, false);
	                        _this.alfPublish("SELECT_ROW_LINKS_GRID", rowData, true);
                        }
                    }
                },
                beforeProcessing: function (data, status, xhr) {
                    if (data && data.rows && data.rows.length > 0) {
                        data = _this.beforeProcess(data.rows);
                    }
                },
                ondblClickRow: function(id){
                    var rowData = grid.getRowData(id);
                    if (rowData.typeRK == "btl-meeting:meetingDataType")
                        window.location.href = "/share/page/hdp/ws/meeting-rooms?nodeRef="+ rowData.nodeRefRK;
                    else
                        window.location.href = "/share/page/btl-edit-metadata?nodeRef="+ rowData.nodeRefRK;
                }
            });

            var orgExpandNode = $.fn.jqGrid.expandNode,
                orgCollapseNode = $.fn.jqGrid.collapseNode;
            $.jgrid.extend({
                expandNode: function (rc) {
                    var rowData = _this.grid.getRowData(rc._id_);
                    rowData.signIcon = "";
                    _this.grid.setRowData( rc._id_, rowData);
                    return orgExpandNode.call(this, rc);
                },
                collapseNode: function (rc) {
                    var rowData = _this.grid.getRowData( rc._id_);
                    var localRow = _this.grid.getLocalRow( rc._id_);
                    var children = _this.grid.getNodeChildren(localRow);
                    children.forEach(function (item) {
                        if(item.isSignedEcp){
                            rowData.signIcon = _this.signIcon;
                            _this.grid.setRowData( rc._id_, rowData);
                        }
                    });
                    return orgCollapseNode.call(this, rc);
                }
            });

            if (document.getElementById(this.filePreviewContainerId))
                document.getElementById(this.filePreviewContainerId).style.width = _this.domNode.clientWidth;
            //grid.setGridWidth(_this.domNode.clientWidth);

            if(this.hideHeader) {
                $('#gview_'+ this.uid + ' .ui-jqgrid-htable').hide();
            }

            $(window).bind('resize', function () {
                grid.setGridWidth(_this.domNode?_this.domNode.clientWidth:1000);
            }).trigger('resize');

            this.inherited(arguments);
            this.grid = grid;

            this.isLoad = true;
        },

        beforeProcess: function (data) {
            var _this = this;
            data.forEach(function (item) {
                if(item.isSignedEcp){
                    _this.grid.showCol("signIcon");
                    item.signIcon = _this.signIcon;
                }
            });
            return data;
        },

        setDataFromServer: function () {
            var _this = this;
            Alfresco.util.Ajax.request({
                method: "GET",
                url: this.url,
                successCallback: {
                    fn: function (complete) {
                        this.nodeGrid.jqGrid('clearGridData');
                        if( this.nodeGrid.get(0).p.treeGrid ) {
                            var data;
                            if(complete.json.rows.length > 0){
                                data = _this.beforeProcess(complete.json.rows);
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