/**
 * Created by nabokov on 02.09.2016.
 */
define([
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dojo/topic",
    "dojo/text!./templates/AttachmentsTreeGrid.html",
    "../uiLib",
    "jquery", "jqgrid-locale-ru", "jqgrid",

], function(declare, _WidgetBase, _TemplatedMixin, topic, template, uiLib, $) {

    return declare([_WidgetBase, _TemplatedMixin], {
        templateString: template,
        parentNodeRef:"",
        contentType:"btl-tasksAttachments:tasksAttachmentsDataType",
        url: "",
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
                "width": 40,
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
                name: "attachmentComment",
                index: "attachmentComment",
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
            },
            {
                "name": "created",
                search: false,
                "hidden": true
            },
            {
                name: "category",
                search: true,
                sortable: true,
                label: "Категория",
                width: 130
            },
            {
                name: "select",
                hidden: true
            }
        ],
        isPrimary: true,
        signIcon: "<span class='icon-is-sing btl-icon-16' style='margin: 0 5px;'></span>",

        cssRequirements: [{cssFile: "/share/res/extension/css/attachment-tree-grid.css"}],

        postMixInProperties: function () {
            this.uid = this.formId + "-tree-version-attach";
            topic.subscribe("refreshAttachmentsGrid", this.refreshAttachmentsGrid.bind(this));
            topic.subscribe("SELECT_ROW_ATTACHMENTS_TREE_GRID", this.selectRowEvent.bind(this));
            this.inherited(arguments);
        },

        refreshAttachmentsGrid: function () {
            this.setDataFromServer();
        },

        selectRowEvent: function (data) {
            if(data.uid != this.uid){
                this.nodeGrid.find('tr').removeClass('ui-state-highlight');
            }
        },

        startup: function(){
            var _this = this;
            if(!this.url) {
                this.url = "/share/proxy/alfresco/common/get-attachments-tree?" +
                    "objectType="+this.contentType+"&" +
                    'qualifyStr=AND PARENT:"' + this.parentNodeRef + '"&allVersions=true';
            }

            this.nodeGrid = $('#' + this.uid);

            var grid = this.nodeGrid.jqGrid({
                datatype: "jsonstring",
                colModel: this.colModel,
                gridview: true,
                width: this.domNode.clientWidth,
                height: "auto",
                treeGrid: true,
                treeGridModel: 'adjacency',
                treedatatype: "local",
                ExpandColumn: "name",
                loadonce: true,
                treeReader: {
                    "parent_id_field": "rootVersion",
                    "level_field": "level",
                    "leaf_field": "isLeaf",
                    "expanded_field": "expanded",
                    "loaded": "loaded",
                },
                onSelectRow: function (id) {
                    var rowData = grid.getRowData(id);
                    rowData["uid"] = _this.uid;
                    topic.publish("SELECT_ROW_ATTACHMENTS_TREE_GRID", rowData);
                    grid.trigger("onSelectRow", [rowData]);
                    document.getElementById(id).classList.add('ui-state-highlight');
                },
                rowattr: function (rd) {
                    if(rd.select){
                        return {"class": "select-category"};
                    }
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

            if(this.hideHeader) {
                $('#gview_'+ this.uid + ' .ui-jqgrid-htable').hide();
            }

            $(window).bind('resize', function () {
                grid.setGridWidth(_this.domNode.clientWidth);
            }).trigger('resize');

            this.inherited(arguments);
            this.grid = grid;
            window.grid = grid;
            _this.setDataFromServer();
        },

        beforeProcess: function (data) {
            var _this = this;
            var categories = {};
            data.forEach(function (item) {
                if(item.category!=null){
                    categories[item.category] = null;
                }
                if(item.isSignedEcp){
                    _this.grid.showCol("signIcon");
                    item.signIcon = _this.signIcon;
                }
                item.modifier = uiLib.getShotFIO(item.modifier);
            });

            if (this.isPrimary) {
                var $categoryFilter = $("#gs_category");
                if ($categoryFilter.length > 0) {
                    $categoryFilter.empty().append('<option value="">Все</option>')
                    Object.keys(categories).forEach(function (c) {
                        $categoryFilter.append('<option value="' + c + '">' + c + '</option>')
                    });
                } else {
                    this.nodeGrid.jqGrid("setColProp", "category", {
                        stype: "select",
                        searchoptions: {
                            value: ":Все;" + Object.keys(categories).map(function (c) {
                                return c + ":" + c;
                            }).join(";"),
                            sopt: ["eq"]
                        }
                    });
                    this.nodeGrid.jqGrid('filterToolbar', {
                        stringResult: true
                    });
                }
            }
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
                        //Не хочет сортироваться при первой загрузке, так что руками
                        complete.json.rows = complete.json.rows.sort(function (a, b) {
                            var gd = a.grade - b.grade;
                            if (gd !== 0) {
                                return gd;
                            }
                            if (a.category === b.category) {
                                return 0;
                            } else {
                                return a.category > b.category ? 1 : -1;
                            }
                        });
                        if( this.nodeGrid.get(0).p.treeGrid ) {
                            var data;
                            if(complete.json.rows.length > 0){
                                data = _this.beforeProcess(complete.json.rows);
                                this.nodeGrid.get(0).addJSONData({
                                    total: 1,
                                    page: 1,
                                    records: data.length,
                                    rows: data
                                });
                            }
                        } else {
                            this.nodeGrid.jqGrid('setGridParam', {
                                datatype: 'local',
                                datastr: complete.json.rows,
                                rowNum: complete.json.rows.length
                            });
                        }

                        if (_this.isPrimary && complete.json && complete.json.rows.length > 0) {
                            var rowData = complete.json.rows[0];
                            window.defRowDataGrid = rowData;
                            rowData["uid"] = _this.uid;
                            var linkDownloadEcpElemId = _this.linkDownloadEcpElemId;
                            $.ajax({
                                url: '/share/proxy/alfresco/is-signed-file?nodeRef='+rowData.nodeRef,
                                success: function(data){
                                    if(typeof linkDownloadEcpElemId != "undefined"){
                                        var parseResult = typeof complete.json.downloadUrl == "undefined" ?JSON.parse(data) :data;
                                        if(parseResult.isSigned){
                                            $('#' + linkDownloadEcpElemId).attr('href', parseResult.downloadUrl);
                                            $('#documentDownloadButton').css('display', 'block');
                                        }
                                    }
                                },
                                scope: _this
                            });
                            _this.grid.setSelection(rowData.nodeRef, false);
                            topic.publish("SELECT_ROW_ATTACHMENTS_TREE_GRID", rowData);
                        }
                        _this.grid.setGridWidth(_this.domNode.clientWidth);
                    },
                    scope: this
                }
            });
        }
    });
});