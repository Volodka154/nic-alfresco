//--------------------------входящие документы--------------------------------------------------------------------
var totalRecordsprojectCase = 0;
var $gridprojectCase = "";
var $FilterprojectCase = "/share/proxy/alfresco/documents/search-projectCase?q_state=" + encodeURI(encodeURI('Активные'));
var groupprojectCase = null;
var idAddArch = 0;
var $filterProject = null;
/*var newObj = [];*/
function showprojectCase() {
    var colM = [];
    require(["jquery", "pqgrid", "pqselect", "jquery-ui.datepicker-ru"], function ($) {
        // $gridprojectCase.pqGrid("destroy");
        var idCreate = false;
        Alfresco.util.Ajax.request({
            method: "GET",
            url: Alfresco.constants.PROXY_URI + "groupPermision?user=" + Alfresco.constants.USERNAME + "&group=ALFRESCO_ADMINISTRATORS",
            successCallback: {
                fn: function addPropetries(complete) {
                    if (complete.json.result == "true") {
                        idAddArch = 1;
                        addArchInprojectCase(1, 1, colM);
                    } else {
                        Alfresco.util.Ajax.request({
                            method: "GET",
                            url: Alfresco.constants.PROXY_URI + "groupPermision?user=" + Alfresco.constants.USERNAME + "&group=EEO",
                            successCallback: {
                                fn: function addPropetries(complete) {
                                    if (complete.json.result == "true") {
                                        if (idCreate == false) {
                                            idAddArch = 1;
                                            addArchInprojectCase(1, 0, colM);
                                        }
                                    } else {
                                        Alfresco.util.Ajax.request({
                                            method: "GET",
                                            url: Alfresco.constants.PROXY_URI + "groupPermision?user=" + Alfresco.constants.USERNAME + "&group=CLERK",
                                            successCallback: {
                                                fn: function addPropetries(complete) {
                                                    if (complete.json.result == "true") {
                                                        // console.log('clerk- ' + idCreate);
                                                        if (idCreate == false) {
                                                            idAddArch = 1;
                                                            addArchInprojectCase(1, 0, colM);
                                                        }
                                                    } else {
                                                        addArchInprojectCase(0, 0, colM);
                                                    }
                                                },
                                                scope: this
                                            }
                                        });
                                    }
                                },
                                scope: this
                            }
                        });
                    }
                },
                scope: this
            }
        });
    })
}
//--------------------------создать грид--------------------------------------------------------------------
function createGridprojectCase($arch, $isAdmin, $colM) {
    var stateAccess = [
        {"Активные": "Активные"},
        {"Черновик": "Черновик"},
        {"Зарегистрирован": "Зарегистрирован"},       
        {"В архиве": "В архиве"},
        {"Все": "Все"}
    ];
    
    $colM.push(
        {title: "nodeRef", width: 100, dataType: "string", dataIndx: "nodeRef", hidden: true, align: "center"},
      
        {
            title: "Дата регистрации", minWidth: 160, width: 160,
            dataType: dateType, dataIndx: "btl-document:regDate",
            filter: {type: 'textbox', condition: "between", init: pqDatePicker, listeners: ['change']}
        },       
        {
            title: "Инвентарный номер", minWidth: 100, dataType: "string", dataIndx: "btl-document:regNumber",
            filter: {type: 'textbox', condition: 'contain', listeners: ['change']}
        },   
        {
            title: "Шифр проекта (аванпроекта)", minWidth: 100, dataType: "string", dataIndx: "btl-document:project-ref",
            filter: {
                type: 'select', condition: 'equal', options: [], prepend: {'': ''},
                listeners: ["change"],
                init: function (arg1) {                 	
                	$(this).pqSelect({
                			singlePlaceholder: 'Все', 
                			searchRule: "begin", 
                			width: '100%', 
                			url:"/share/proxy/alfresco/filters/association?type=btl-project:projectDataType&s_field=shortName&field=shortName",
                			urlItem:"/share/proxy/alfresco/picker/associationItem?type=btl-project:projectDataType&field=shortName",
                			value: arg1.column.filter.value
                	});
                	
                }
            }
            /*
            filter: {
                type: 'select', condition: 'equal', options: null,
                prepend: {'': ''},
                listeners: ["change"],
                init: function () {
                    $(this).pqSelect({singlePlaceholder: 'Все', searchRule: "contain", width: '100%'});
                }
            }
            */
        },
        {
            title: "Руководитель проекта (аванпроекта)", minWidth: 100, dataType: "string", dataIndx: "btl-projectCase:manager-login",
            filter: {
                type: 'select', condition: 'equal', options: document.emploeeDoc,
                prepend: {'': ''},
                listeners: ["change"],
                init: function () {
                    $(this).pqSelect({singlePlaceholder: 'Все', searchRule: "begin", width: '100%'});
                },
            }
        },
        {
            title: "Дата начала ведения дела", minWidth: 160, width: 160,
            dataType: dateType, dataIndx: "btl-projectCase:startDate",
            filter: {type: 'textbox', condition: "between", init: pqDatePicker, listeners: ['change']}
        }, 
        {
            title: "Номер и дата служебной записки (об открытии дела) ", minWidth: 150, dataType: "string", dataIndx: "btl-projectCase:documentStart-content",
            filter: {type: 'textbox', condition: 'contain', listeners: ['change']}
        },
        {
            title: "Дата окончания ведения дела", minWidth: 160, width: 160,
            dataType: dateType, dataIndx: "btl-projectCase:endtDate",
            filter: {type: 'textbox', condition: "between", init: pqDatePicker, listeners: ['change']}
        }, 
        {
            title: "Номер и дата служебной записки (о закрытии дела)", minWidth: 150, dataType: "string", dataIndx: "btl-projectCase:documentEnd-content",
            filter: {type: 'textbox', condition: 'contain', listeners: ['change']}
        },
        {
            title: "Дата передачи дела в архив", minWidth: 160, width: 160,
            dataType: dateType, dataIndx: "btl-projectCase:arhiveDate",
            filter: {type: 'textbox', condition: "between", init: pqDatePicker, listeners: ['change']}
        },
        {
            title: "Состояние", minWidth: 140, width: 140, dataType: "string", dataIndx: "state",
            prepend: {'': ''},
            filter: {
                type: 'select', style: "height:32px;", condition: 'equal', options: stateAccess, listeners: ["change"],
                init: function () {
                    $(this).pqSelect({singlePlaceholder: 'Активные', searchRule: "begin", width: '100%'});
                },
            }
        }
        
       
 
    );
    var dataModel = {
        location: "remote", sorting: "local", dataType: "JSON", method: "GET", url: $FilterprojectCase + '&totalRecords=' + totalRecordsprojectCase + '&format=json',
        getData: function (dataJSON) {
            var data = dataJSON.items;
            totalRecordsprojectCase = dataJSON.totalRecords;
            
            //$filterProject = [];
            /*
            tempProject = [];
  			for(var i=0; i<dataJSON.items.length; i++ )
			{  				  				
  				var projectItem = new Object;
  				projectItem[dataJSON.items[i]['btl-document:project-content']] =  dataJSON.items[i]['btl-document:project-content'];
            	
            	if (tempProject.indexOf(dataJSON.items[i]['btl-document:project-content']) < 0)
            	{
            		$filterProject.push(projectItem);
            		tempProject.push(dataJSON.items[i]['btl-document:project-content']);
            	}            	  				
			} 		
            */
            
            return {curPage: dataJSON.curPage, totalRecords: dataJSON.totalRecords, data: data};
        }
    };
    var newObj = {
        selectionModel: {type: 'none', subtype: 'incr', cbHeader: false, cbAll: true},
        showTop: true,
        showHeader: true,
        showTitle: true,
        flexHeight: true,
        flexWidth: true,
        dataModel: dataModel,
        collapsible: false,
        pageModel: {type: "remote", rPP: 100, strRpp: "{0}", rPPOptions: [25, 50, 100]},
        colModel: $colM,
        filterModel: {on: true, mode: "AND", header: true},
        editable: false,
        columnBorders: true,
        width: '100%',
        height: 600,
        beforeFilter: function (evt, ui) {
            totalRecordsprojectCase = 0;
            $("#grid_projectCase").pqGrid("option", "dataModel").url = $FilterprojectCase + '&totalRecords=' + totalRecordsprojectCase + '&format=json';
            $gridprojectCase.pqGrid("option", "pageModel.curPage", 1);
        },
        create: function (ui) {
            var $grid = $(this),
                $pager = $grid.find(".pq-grid-bottom").find(".pq-pager");
            if ($pager && $pager.length) {
                $pager = $pager.detach();
                $grid.find(".pq-grid-top").append($pager);
            }
        }
    };
    newObj.title = "<button type='button' onclick='backHome()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'";
    newObj.title += "role='button'><span class='ui-button-icon-primary ui-icon ui-icon-home'></span><span class='ui-button-text'>Домой</span></button>";
    newObj.title += "<span style='margin-left: 10px ; margin-bottom: -5px' class='pq-separator '></span>";
    newObj.title += "<button type='button'  style='margin-left: 10px' onclick='addDocprojectCase()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'";
    if ($arch == 1) {
        newObj.title += "role='button'><span class='ui-button-icon-primary ui-icon ui-icon-plus'></span><span class='ui-button-text'>Создать</span></button>";
        newObj.title += "<button type='button'  style='margin-left: 5px'  onclick='toArchprojectCase()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'";
        newObj.title += "role='button'><span class='ui-button-icon-primary ui-icon ui-icon-cancel'></span><span class='ui-button-text'>В архив</span></button>";
    }
    if ($isAdmin == 1){
        newObj.title += "<button type='button'  style='margin-left: 5px'  onclick='deleteProjectCase()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'";
        newObj.title += "role='button'><span class='ui-button-icon-primary ui-icon ui-icon-cancel'></span><span class='ui-button-text'>Удалить</span></button>";
    }
   
    newObj.title += "<span style='margin-left: 10px ; margin-bottom: -5px' class='pq-separator '></span>";
    newObj.title += "<button type='button'  style='margin-left: 10px' onclick='updateFilter(true)' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'" +
    		"role='button'><span class='ui-button-icon-primary ui-icon ui-icon-refresh'></span></span><span class='ui-button-text'>Обновить списки фильтрации</span></button>";
    
  
    newObj.title += "<button type='button'  style='margin-left: 5px'  onclick='clearDocFilter($gridprojectCase)' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'";
    newObj.title += "role='button'><span class='ui-button-icon-primary ui-icon ui-icon-cancel'></span><span class='ui-button-text'>Очистить</span></button>";
    newObj.title += "<button type='button'  style='margin-left: 10px' onclick='prnProjectCase()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'";
    newObj.title += "role='button'><span class='ui-button-icon-primary ui-icon ui-icon-print'></span><span class='ui-button-text'>Печать</span></button>";
    
    
    //   newObj.dataModel = dataModel;
    $gridprojectCase = $("#grid_projectCase").pqGrid(newObj);
    $gridprojectCase.pqGrid({
        beforeTableView: function (event, ui) {
            $("#grid_projectCase").pqGrid("option", "dataModel").url = $FilterprojectCase + '&totalRecords=' + totalRecordsprojectCase + '&format=json';
            $("span:contains('Дополнительно')").parent().prop('disabled', true).prop('disabled', true).removeClass("pq-select-option-label ui-state-enable pq-state-hover").addClass("fd");
        }
    });
    //------------------Инициализация выпадющего меню в хедере-------------------------------------------------------------------------
    $(".fprojectCase").pqSelect({
        singlePlaceholder: 'Все', searchRule: "begin", width: '150px'
    }).on("change", function (evt) {
    });
    $(".f2Group").pqSelect({
        singlePlaceholder: 'Нет', width: '150px'
    })
    $gridprojectCase.one("pqgridload", function (evt, ui) {

    	/*
    	var filterPr = $gridprojectCase.pqGrid("getColumn", {dataIndx: "btl-document:project-content"}).filter;      
    	filterPr.cache = null;
    	filterPr.options = $filterProject;
    	
    	
    	$gridprojectCase.pqGrid("refreshView");   
    	*/

    });
    $gridprojectCase.pqGrid({
        rowDblClick: function (event, ui) {
        	openModalEdit(ui.rowData.nodeRef, $gridprojectCase);
        }
    });
}
//--------------------------списать в архив--------------------------------------------------------------------
function toArchprojectCase() {
    var ans = window.confirm("Вы действительно хотите изменить статус у выбранных документов?");
    if (ans) {
        var data = $gridprojectCase.pqGrid("option", "dataModel.data");
        $gridprojectCase.pqGrid("showLoading");
        $.each(data, function (key, value) {
            if (value["sel"] == true) {
                Alfresco.util.Ajax.jsonPost({
                    url: Alfresco.constants.PROXY_URI + "taskDocAction",
                    dataObj: {
                        "nodeRef": value["nodeRef"],
                        "action": "docInArhive",
                    },
                    successCallback: {
                        fn: function (response) {
                        }
                    }
                });
            }
        });
        $gridprojectCase.pqGrid("hideLoading");
        $gridprojectCase.pqGrid("refreshDataAndView");
        $gridprojectCase.pqGrid({flexHeight: true});
    }
}

//--------------------------удалить--------------------------------------------------------------------
function deleteProjectCase() {
    deleteSelected($gridprojectCase, "Вы действительно хотите удалить выбранные дела?");
}

//--------------------------выбрать все--------------------------------------------------------------------
function selAllprojectCase() {
    require(["jquery"], function ($) {
        if ($("#selAllprojectCase").prop("checked")) {
            $("#selAllprojectCase").prop("checked", false);
            $gridprojectCase.pqGrid("selection",
                {
                    type: 'row',
                    all: 'all',
                    method: 'removeAll'
                }
            );
        } else {
            $("#selAllprojectCase").attr("checked", "checked");
            $("#selAllprojectCase").prop("checked", true);
            $gridprojectCase.pqGrid("selection",
                {
                    type: 'row',
                    all: 'all',
                    method: 'selectAll'
                }
            );
        }
    })
}

//---------------------------------добавить в архив------------------------------------------------------------
function addArchInprojectCase($arch, $isAdmin, $colM) {
    idCreate = true;
    if ($arch == 1) {
        $colM.push({
            title: "<input type='checkbox' id='selAllprojectCase' onclick='selAllprojectCase()'>",
            dataIndx: "sel",
            width: 30,
            align: "center",
            type: 'checkBoxSelection',
            cls: 'ui-state-default',
            resizable: false,
            sortable: false
        });
    }
    createGridprojectCase($arch, $isAdmin, $colM);
}

//--------------------------клик по табу--------------------------------------------------------------------
require(["jquery"], function ($) {
    $(document).ready(function () {
        $('#li_tab10').click(function () {
            if ($gridprojectCase == "") {
                showprojectCase($FilterprojectCase + "&format=json");
            }
        });
    })
});

function prnProjectCase() {

    window.open($FilterprojectCase + "&format=html&q_viewType=1" + prepareLocalFilter($gridprojectCase), "_blank");
}