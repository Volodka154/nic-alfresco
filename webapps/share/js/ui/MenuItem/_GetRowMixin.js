/**
 * Created by nabokov on 01.09.2016.
 */
define([
    "dojo/_base/declare", // declare

], function(declare){
    return declare("ui._GetRowMixin", null, {
        getCurrentRow: function (typeGrid) {
            if(this.grid && this.getTypeGrid() == "jqGrid" ){
                var selRowId = this.grid.jqGrid('getGridParam', 'selrow'),
                    rowData = this.grid.getRowData((selRowId)? selRowId: 0);
                return rowData;
            }
            if(this.grid && this.getTypeGrid() == "pqGrid" ){
                var arrRows = this.grid.pqGrid("selection", { type: 'row', method: 'getSelection' });
                return arrRows[0].rowData;
            }
        },
        getTypeGrid: function () {
            if(this.grid[0].tagName == "DIV")
                return "pqGrid";

            if(this.grid[0].tagName == "TABLE")
                return "jqGrid";

            return false;
        }
    });
});