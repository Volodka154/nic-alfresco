/**
 * Created by nabokov on 23.11.2016.
 */
define(["dojo/_base/declare",
        "btl/widgets/base/DataGrid",
        "dojo/_base/lang"],
    function (declare, DataGrid, lang) {
        return declare([DataGrid], {
            sizeAuto: false,
            // width: '98%',
            flexHeight: true,
            flexWidth: true,
            loadData:false,
            cssRequirements: [{cssFile:"./css/_Grid.css"}],

            gridAutoSize: function () {

            },

            eventAfterInit: function () {

            },

            showData: function (payload) {
                if(this.documentNodeRef && !this.isDataLoad){
                    this.loadDataDataGrid({nodeRef: this.documentNodeRef});
                }
                this.grid.pqGrid("refreshDataAndView");
            },
            // избавляемся от избыточности полученных данных, оставляем только те что указанны в таблице
            loadDataToDataGrid: function alfresco_DataGrid__loadDataToDataGrid(response, originalRequestConfig){
                var filteredItems = [];
                var props = []; // свойства указанные в моделе
                this.gridModel.colModel.forEach(function (item) {
                    props.push(item.dataIndx);
                });
                response.items.forEach(function (item) {
                    var newItem = {};
                    for (var key in item) {
                        if(props.indexOf(key) > -1){
                            newItem[key] = item[key];
                        }
                    }
                    filteredItems.push(newItem);
                });
                this.setDataDataGrid(filteredItems);
            },

            getValue: function () {
                return this.grid.pqGrid( "option" , "dataModel.data" );
            }
        });
    });