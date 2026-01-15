/**
 * Created by nabokov on 24.01.2017.
 */
define([
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dojo/topic",
    "dojo/text!./templates/TaskFull.html",
    "../uiLib",
    "jquery", "jqgrid-locale-ru", "jqgrid",

], function(declare, _WidgetBase, _TemplatedMixin, topic, template, uiLib,  jQuery) {

    return declare([_WidgetBase, _TemplatedMixin], {
        templateString: template,
        formId:"",
        nodeId: null,
        colModel: [
            {
                "name":"nodeRef",
                "index":"nodeRef",
                "key":true,
                "hidden":true
            },{
                "name":"name",
                "index":"name",
                //"sorttype":"string",
                "label":"Название",
                "width":170
            },{
                "name":"author",
                "index":"author",
                //"sorttype":"string",
                "label":"Автор",
                "width":100
            },{
                "name":"executor",
                "index":"executor",
                //"sorttype":"string",
                "label":"Исполнитель",
                "width":100
            },{
                "name":"currentExecutor",
                "index":"currentExecutor",
                //"sorttype":"string",
                "label":"Текущий исполнитель",
                "width":100
            },{
                "name":"controller",
                "index":"controller",
                //"sorttype":"string",
                "label":"Контролер",
                "width":100
            },{
                "name":"state",
                "index":"state",
                //"sorttype":"string",
                "label":"Состояние",
                "width":100
            },{
                "name":"endDate",
                "index":"endDate",
                "sorttype":"date",
                "label":"Срок",
                "width":80
            },{
                "name":"color",
                "index":"color",
                "hidden":true
            },{
                "name":"boss_id",
                "hidden":true
            },{
                "name":"lft",
                "hidden":true
            },
            {
                label: "Действия",
                name: "actions",
                "hidden":true,
                width: 50,
                formatter: "actions",
                formatoptions: {
                    keys: true,
                    editbutton: false,
                    delbutton: true,
                    delOptions: {
                        url: "/share/proxy/alfresco/events/delete",
                        mtype: "GET"
                    }
                }
            },
        ],

        startup:function(func, args){
            jQuery('#tab_tasks_full_'+ this.formId +'-grid-tree').jqGrid({
                "url":"/share/proxy/alfresco/task/get-tasks-list-tree?nodeid=" + this.nodeId,
                "colModel": this.colModel,
                "beforeRequest" : function() {
                    if(this.p.postData.nodeid != null) {
                        var nid = this.p.postData.nodeid;
                        jQuery('#tab_tasks_full_'+ this.formId +'-grid-tree').setRowData( nid, { loaded:"true"});
                        this.p.url = "/share/proxy/alfresco/task/get-tasks-list-tree";
                    }
                },
                "loadComplete": function() {
                    var rowIDs = jQuery("#tab_tasks_full_"+ this.formId +"-grid-tree").getDataIDs();
                    for (var i=0;i<rowIDs.length;i++){
                        var rowData = jQuery("#tab_tasks_full_"+ this.formId +"-grid-tree").getRowData(rowIDs[i]);
                        if (rowData['color'] != ""){
                            jQuery('#tab_tasks_full_'+ this.formId +'-grid-tree').setRowData( rowIDs[i],false, {background: rowData['color']});
                        }
                    }
                },
                "ondblClickRow" : function(rowid){
                    if(func){
                        args.nodeRef = rowid;
                        func(false, args);
                    }else {
                        window.location.href = "/share/page/btl-edit-metadata?nodeRef=" + rowid + "&redirect=" + window.location.href;
                        topic.publish("ALF_DISPLAY_NOTIFICATION", {message: "Перенаправление на задачу."});
                    }
                },
                "width":"997",
                "hoverrows":false,
                "viewrecords":false,
                "gridview":true,
                "height":"auto",
                "sortname":"name",
                "loadonce":false,
                "rowNum":100,
                "scrollrows":true,
                // enable tree grid
                "treeGrid":true,
                // which column is expandable
                "ExpandColumn":"name",
                // datatype
                "treedatatype":"json",
                // the model used
                "treeGridModel":"adjacency",
                // configuration of the data comming from server
                "treeReader":{
                    "parent_id_field":"boss_id",
                    "level_field":"level",
                    "leaf_field":"isLeaf",
                    "expanded_field":"expanded",
                    "loaded":"loaded",
                    "icon_field":"icon"
                },
                "sortorder":"asc",
                "datatype":"json"//,
                //"pager":"#tab_tasks_full_" + this.formId + "-grid-tree-pager"
            });

            Alfresco.util.Ajax.request({
                method: "GET",
                url: Alfresco.constants.PROXY_URI + "groupPermision?user=" + Alfresco.constants.USERNAME + "&group=ALFRESCO_ADMINISTRATORS",
                successCallback: {
                    fn: function addPropetries(complete) {
                        if (complete.json.result == "true") {
                            jQuery('#tab_tasks_full_'+ this.formId +'-grid-tree').showCol('actions');
                        }
                    },
                    scope: this
                }
            });
        }
    });
});