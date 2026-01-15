var IDViewReport = 0;
//--------------------------права----------------------------------------------------------------------------------
//    $(document).ready(function () {
require(["jquery", "pqgrid", "pqselect", "jquery-ui.datepicker-ru"], function ($) {
    Alfresco.util.Ajax.request({
        method: "GET",
        url: Alfresco.constants.PROXY_URI + "groupPermision?user=" + Alfresco.constants.USERNAME + "&group=ALFRESCO_ADMINISTRATORS",
        successCallback: {
            fn: function addPropetries(complete) {
                if (complete.json.result == "false") {
                    // $('#li_tab4').css("display", "none");
                }
                else {
                    $('#searchNotExe').css("display", "block");
                    $('#searchKID').css("display", "block");
                    $('#add_incoming_doc_btn').css("display", "block");
                    $('#state_in_adv_div').css("display", "block");
                    //      $('#state_incom_adv_div').css("display", "block");
                    IDViewReport = 1;
                }
            },
            scope: this
        }
    });
    Alfresco.util.Ajax.request({
        method: "GET",
        url: Alfresco.constants.PROXY_URI + "groupPermision?user=" + Alfresco.constants.USERNAME + "&group=CLERK",
        successCallback: {
            fn: function addPropetries(complete) {
                if (complete.json.result == "false") {
                    /* $('#searchNotExe').css("display", "none");
                     $('#searchKID').css("display", "none");*/
                } else {
                    $('#searchNotExe').css("display", "block");
                    $('#searchKID').css("display", "block");
                    $('#add_incoming_doc_btn').css("display", "block");
                    //   $('#state_incom_adv_div').css("display", "block");
                    IDViewReport = 1;
                }
            },
            scope: this
        }
    });
    Alfresco.util.Ajax.request({
        method: "GET",
        url: Alfresco.constants.PROXY_URI + "groupPermision?user=" + Alfresco.constants.USERNAME + "&group=EEO",
        successCallback: {
            fn: function addPropetries(complete) {
                if (complete.json.result == "false") {
                    /* $('#searchNotExe').css("display", "none");
                     $('#searchKID').css("display", "none");*/
                }
                else {
                    $('#searchNotExe').css("display", "block");
                    $('#searchKID').css("display", "block");
                    $('#state_in_adv_div').css("display", "block");
                    //     $('#state_incom_adv_div').css("display", "block");
                    IDViewReport = 1;
                }
            },
            scope: this
        }
    });
});

var dateType = function (val1, val2) {
    var dateBuf1 = $.trim(val1).split('-');
    if (dateBuf1.length < 2)
        return -1;
    var date1 = new Date(dateBuf1[2], dateBuf1[1], dateBuf1[0]);
    var dateBuf2 = $.trim(val2).split('-');
    if (dateBuf2.length < 2)
        return 1;
    var date2 = new Date(dateBuf2[2], dateBuf2[1], dateBuf2[0]);
    if (date1 > date2) {
        return 1;
    }
    else if (date1 < date2) {
        return -1;
    }
    else {
        return 0;
    }
}
function pqDatePicker(ui) {
    var $this = $(this);
    $this
        .css({zIndex: 3, position: "relative"})
        .datepicker({
            dateFormat: 'dd-mm-yy',
            yearRange: "-20:+20", //20 years prior to present.
            changeYear: true,
            changeMonth: true,
            onClose: function (evt, ui) {
                //$(this).focus();
            }
        }).attr("autocomplete", "off");
}
function backHome() {
    window.location.href = "/share/page";
}
//--------------------------фильтр \хэдера для типичных полеей--------------------------------------------------------------------
/*тип*/
function refreshFilterType($grid) {
    var dm = $grid.pqGrid("option", "dataModel");
    dm = dm.data;
    dm.sort(function (obj1, obj2) {
        if (obj1.docType < obj2.docType) return -1;
        if (obj1.docType > obj2.docType) return 1;
        return 0;
    });
    var combo = [{"docType": dm[0].docType}];
    for (var i = 1; i < dm.length; i++) {
        if (dm[i].docType != dm[i - 1].docType) {
            combo.push({"docType": dm[i].docType});
        }
    }
    var column = $grid.pqGrid("getColumn", {dataIndx: "docType"});
    var filter = column.filter;
    filter.cache = null;
    filter.options = combo;
}
/*получатель*/
function refreshFilterRecipient($grid, f1) {
    var dm = $grid.pqGrid("option", "dataModel");
    dm = dm.data;
    dm.sort(function (obj1, obj2) {
        if (obj1.recipient < obj2.recipient) return -1;
        if (obj1.recipient > obj2.recipient) return 1;
        return 0;
    });
    var combo = [{"recipient": dm[0].recipient}];
    for (var i = 1; i < dm.length; i++) {
        if (dm[i].recipient != dm[i - 1].recipient) {
            combo.push({"recipient": dm[i].recipient});
        }
    }
    var column = $grid.pqGrid("getColumn", {dataIndx: "recipient"});
    var filter = column.filter;
    filter.cache = null;
    filter.options = combo;
}
function refreshFilterHeader($grid, $field) {
   /* var $field ="recipient"*/
    var dm = $grid.pqGrid("option", "dataModel");
    dm = dm.data;

    dm.sort(function (obj1, obj2) {
        if (obj1[$field] < obj2[$field]) return -1;
        if (obj1[$field] > obj2[$field]) return 1;
        return 0;
    });
    var q = [$field];
    var combo = [{q: dm[0][$field]}];

    for (var i = 1; i < dm.length; i++) {
        // console.log(dm[i][$field] );
        if (dm[i][$field] != dm[i - 1][$field]) {

            combo.push({q: dm[i][$field]});
        }
    }
    var column = $grid.pqGrid("getColumn", {dataIndx: [$field]});
    var filter = column.filter;
    filter.cache = null;
    filter.options = combo;
}
//--------------------------очистка фильтра--------------------------------------------------------------------
function clearDocFilter($grid) {
    require(["jquery"], function ($) {
        var CM = $grid.pqGrid("getColModel");
        for (var i = 0, len = CM.length; i < len; i++) {
            var dataIndx = CM[i].dataIndx;
            try {
                delete   CM[i].filter.value;
                delete   CM[i].filter.value2;
            } catch (e) {
                value = null;
            }
        }

        $('input').val("");
        $grid.pqGrid("refreshDataAndView");
    });

}
//--------------------------подготовить локальный фильтр--------------------------------------------------------------------
function prepareLocalFilter($grid) {
    var existsFilter = false;
    var filterObject = '{"mode":"AND","data":[';
    var CM = $grid.pqGrid("getColModel");
    for (var i = 0, len = CM.length; i < len; i++) {
        var condition = '';
        var value = null;
        var value2 = null;
        var dataIndx = CM[i].dataIndx;
        try {
            condition = CM[i].filter.condition;
            value = CM[i].filter.value;
            if (value != null) {
                existsFilter = true;
                //если диапазон
                if (condition == "between") {
                    // console.log("between");
                    value2 = CM[i].filter.value2;
                    if (value != "" && value2 != "") {
                        //condition = "between";
                        value = value + '","value2":"' + value2;
                    } else if (value != "") {
                        condition = "gte";
                    } else if (value2 != "") {
                        condition = "lte";
                        value = value2;
                    }
                }
                filterObject += '{"dataIndx":"' + dataIndx + '","value":"' + value + '","condition":"' + condition +
                    '","dataType":"string","cbFn":""},';
            }
        } catch (e) {
        }
    }
    if (existsFilter == true) {
        filterObject = filterObject.substr(0, filterObject.length - 1);
        filterObject += ']}';
        filterObject = filterObject.replace(/\{/gi, "%7B")
            .replace(/\[/gi, "%5B")
            .replace(/\:/gi, "%3A")
            .replace(/\//gi, "%2F")
            .replace(/\,/gi, "%2C")
            .replace(/\}/gi, "%7D")
            .replace(/\]/gi, "%5D");
        return "&pq_filter=" + filterObject;
    } else {
        return ""
    }
}

//--------------------------удалить--------------------------------------------------------------------
function deleteSelected(table, question){
    var ans = window.confirm(question);
    if (ans) {
        var data = table.pqGrid("option", "dataModel.data");
        table.pqGrid("showLoading");
        var toDelete = [];
        var toDelteIds = [];
        $.each(data, function (key, value) {
            if (value["sel"] == true) {
                toDelteIds.push(key);
                toDelete.push(value["nodeRef"]);
            }
        });

        table.pqGrid("selection", {
            type: 'row',
            all: 'all',
            method: 'removeAll'
        });

        toDelteIds.forEach(function(k){
            table.pqGrid( "deleteRow", { rowIndx: k } );
        });

        if (toDelete.length == 0){
            refreshTable(table);
        } else {
            table.pqGrid( "option", "isResetData", true);
            Alfresco.util.Ajax.jsonPost({
                url: "/share/proxy/alfresco/slingshot/doclib/action/files?alf_method=delete",
                dataObj: {
                    "nodeRefs": toDelete
                },
                successCallback: { fn: function (response) {
                                   refreshTable(table);
                                  }
                },
                failureCallback: { fn: function (response) {
                                    refreshTable(table);
                                    Alfresco.util.PopupManager.displayPrompt({
                                       title: "Ошибка удаления",
                                       text: getFormattedDateTime(new Date()) + "\nОдин или несколько документов удалить не удалось"
                                    });
                                  }
                }
            });
        }
    }
}

function getFormattedDateTime(date){
    return ("0" + date.getDate()).slice(-2) + "." + ("0"+(date.getMonth()+1)).slice(-2) + "." +
        date.getFullYear() + " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2);
}

function refreshTable(table){
    table.pqGrid("hideLoading");
    table.pqGrid("refreshDataAndView");
}