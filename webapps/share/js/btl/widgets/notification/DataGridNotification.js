define(["dojo/_base/declare",
        "btl/widgets/base/DataGrid",
        "dojo/_base/lang"],
    function (declare, DataGrid, lang) {
        return declare([DataGrid], {

            title: "Список должностей",
            Url: "search/notification",
            colModel: [],

            postMixInProperties: function alfresco_PositionDataGrid__postMixInProperties() {
                this.inherited(arguments);
                this.alfSubscribe("DATAGRID_GET_POSITION_DATA", lang.hitch(this, this.getPositionData), true);
                this.alfSubscribe("DATAGRID_DELETE_NOTIFICATION", lang.hitch(this, this.deleteItem), true);
            },
            setEventsDataGrid: function alfresco_DataGrid__setEventsDataGrid(){
                var _this = this;
                this.grid.pqGrid({
                    rowDblClick: function( event, ui ) {
                        _this.getPositionData();
                    }
                });
            },
            deleteItem: function alfresco_taskResolutionDataGrid__deletetaskResolution(){
                var arr = this.grid.pqGrid("selection", { type: 'row', method: 'getSelection' });
                if (arr && arr.length > 0) {
                    var row = arr[0].rowData;
                    var payload = {};

                    payload.requiresConfirmation = true;
                    payload.confirmationTitle = "Удаление оповещения";
                    payload.confirmationPrompt = "Вы действительно хотите удалить: " + row.title +" ?";
                    payload.url = "slingshot/datalists/list/node/" + row.nodeRef.replace("://", "/");
                    payload.responseTopic = "DATAGRID_DELETE_ROW_FROM_STORE";

                    this.alfPublish("ALF_CRUD_DELETE", payload, true);
                }
            },

            getPositionData: function alfresco_PositionDataGrid__getPositionData() {
                var arr = this.grid.pqGrid("selection", {type: 'row', method: 'getSelection'});
                if (arr && arr.length > 0) {
                    var row = arr[0].rowData;
                    var item = {};
                    item.config = {};
                    item.data = row;
                    item.userName = (this.userName)? this.userName : "";
                    item.data.rowId = arr[0].rowIndx;
                    item.config.dialogTitle = "formEditNotification.title";
                    item.config.dialogConfirmationButtonTitle = "edit.title";
                    item.config.dialogCancellationButtonTitle = "cancel.title";
                    item.config.formSubmissionTopic = "BTL_EDIT_NOTIFICATION";
                    this.alfPublish("BTL_CREATE_FORM_NOTIFICATION", item, true);
                    this.alfLog("log", "alfresco_PositionDataGrid__getPositionData", row);
                }
            }
        });
    });






