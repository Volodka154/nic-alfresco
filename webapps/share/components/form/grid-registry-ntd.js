//--------------------------входящие документы--------------------------------------------------------------------
var totalRecordsNTD = 0;
var $gridNTD = "";
var $FilterNTD = "/share/proxy/alfresco/documents/search-ntd?q_state=" + encodeURI(encodeURI('Активные'));
var groupNTD = null;
var idAddArch = 0;

var $filterProject = null;
/*var newObj = [];*/
function showNTD() {
    var colM = [];
    require(["jquery", "pqgrid", "pqselect", "jquery-ui.datepicker-ru"], function ($) {
        // $gridNTD.pqGrid("destroy");
        var idCreate = false;
        Alfresco.util.Ajax.request({
            method: "GET",
            url: Alfresco.constants.PROXY_URI + "groupPermision?user=" + Alfresco.constants.USERNAME + "&group=ALFRESCO_ADMINISTRATORS",
            successCallback: {
                fn: function addPropetries(complete) {
                    if (complete.json.result == "true") {
                        idAddArch = 1;
                        addArchInNTD(1, 1, colM);
                    } else {
                        Alfresco.util.Ajax.request({
                            method: "GET",
                            url: Alfresco.constants.PROXY_URI + "groupPermision?user=" + Alfresco.constants.USERNAME + "&group=EEO",
                            successCallback: {
                                fn: function addPropetries(complete) {
                                    if (complete.json.result == "true") {
                                        if (idCreate == false) {
                                            idAddArch = 1;
                                            addArchInNTD(1, 0, colM);
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
                                                            addArchInNTD(1, 0, colM);
                                                        }
                                                    } else {
                                                        addArchInNTD(0, 0, colM);
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
function createGridNTD($arch, $isAdmin, $colM) {
    var stateAccessNTD = [
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
        {title: "Том", minWidth: 120, width: 120, dataType: "string", dataIndx: "btl-ntd:tom"},
        {
            title: "Название", minWidth: 150, dataType: "string", dataIndx: "btl-document:name",
            filter: {type: 'textbox', condition: 'contain', listeners: ['change']}
        },

        {
            title: "Ф.И.О. работника, сдавшего НТД", minWidth: 100, dataType: "string", dataIndx: "btl-document:author-login",
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
            title: "Вид НТД", minWidth: 100, dataType: "string", dataIndx: "btl-document:docType-ref",
            filter: {
                type: 'select', condition: 'equal', options: typedocNTD.result,
                prepend: {'': ''},
                listeners: ["change"],
                init: function () {
                    $(this).pqSelect({singlePlaceholder: 'Все', searchRule: "contain", width: '100%'});
                }
            }
        },
        {
            title: "Дата и номер сопроводительного документа", minWidth: 150, dataType: "string", dataIndx: "btl-ntd:document-content",
            filter: {type: 'textbox', condition: 'contain', listeners: ['change']}
            	
        },
        

       
        {
            title: "Примечание", minWidth: 200, dataType: "string", dataIndx: "btl-document:content",
            filter: {type: 'textbox', condition: 'contain', listeners: ['change']}
        },
        {
            title: "Количество листов/брошюр/МНИ", minWidth: 100, dataType: "string", dataIndx: "btl-ntd:sheetsCount"
        },

        {                                              
            title: "Состояние",width: 160,dataType: "string", dataIndx: "state",
            filter: {
                type: 'select', style: "height:32px;", condition: 'equal', options: stateAccessNTD, listeners: ["change"],
                init: function () {
                    $(this).pqSelect({singlePlaceholder: 'Активные', searchRule: "begin", width: '100%'});
                },
            }            
            
        },
        {
            title: "Вид носителя", minWidth: 100, dataType: "string", dataIndx: "btl-ntd:viewMedia"
        }
    );
    var dataModel = {
        location: "remote", sorting: "local", dataType: "JSON", method: "GET", url: $FilterNTD + '&totalRecords=' + totalRecordsNTD + '&format=json',
        getData: function (dataJSON) {
            var data = dataJSON.items;
            totalRecordsNTD = dataJSON.totalRecords;
            //$filterProject = [];
            //tempProject = [];
  			for(var i=0; i<dataJSON.items.length; i++ )
			{
  				if (dataJSON.items[i]["btl-ntd:viewMedia"] == 0) dataJSON.items[i]["btl-ntd:viewMedia"] = "Книга";
  				if (dataJSON.items[i]["btl-ntd:viewMedia"] == 1) dataJSON.items[i]["btl-ntd:viewMedia"] = "Брошюра";
  				if (dataJSON.items[i]["btl-ntd:viewMedia"] == 2) dataJSON.items[i]["btl-ntd:viewMedia"] = "Флэшнакопитель";
  				if (dataJSON.items[i]["btl-ntd:viewMedia"] == 3) dataJSON.items[i]["btl-ntd:viewMedia"] = "CD-диск";
  				if (dataJSON.items[i]["btl-ntd:viewMedia"] == 4) dataJSON.items[i]["btl-ntd:viewMedia"] = "DVD-диск";
  				if (dataJSON.items[i]["btl-ntd:viewMedia"] == 5) dataJSON.items[i]["btl-ntd:viewMedia"] = "А4 – А0";
  				
  				if (dataJSON.items[i]["btl-ntd:viewMedia"] == 6) dataJSON.items[i]["btl-ntd:viewMedia"] = "А4"; 
  				if (dataJSON.items[i]["btl-ntd:viewMedia"] == 7) dataJSON.items[i]["btl-ntd:viewMedia"] = "А3"; 
  				if (dataJSON.items[i]["btl-ntd:viewMedia"] == 8) dataJSON.items[i]["btl-ntd:viewMedia"] = "А2"; 
  				if (dataJSON.items[i]["btl-ntd:viewMedia"] == 9) dataJSON.items[i]["btl-ntd:viewMedia"] = "А1"; 
  				if (dataJSON.items[i]["btl-ntd:viewMedia"] == 10) dataJSON.items[i]["btl-ntd:viewMedia"] = "А0"; 
  				
  				
  				var projectItem = new Object;
  				projectItem[dataJSON.items[i]['btl-document:project-content']] =  dataJSON.items[i]['btl-document:project-content'];
            	/*
            	if (tempProject.indexOf(dataJSON.items[i]['btl-document:project-content']) < 0)
            	{
            		$filterProject.push(projectItem);
            		tempProject.push(dataJSON.items[i]['btl-document:project-content']);
            	}
            	*/
  				
			} 			             
  			
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
            totalRecordsNTD = 0;
            $("#grid_ntd").pqGrid("option", "dataModel").url = $FilterNTD + '&totalRecords=' + totalRecordsNTD + '&format=json';
            $gridNTD.pqGrid("option", "pageModel.curPage", 1);
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
    newObj.title += "<button type='button'  style='margin-left: 10px' onclick='addDocNTD()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'";
    if ($arch == 1) {
        newObj.title += "role='button'><span class='ui-button-icon-primary ui-icon ui-icon-plus'></span><span class='ui-button-text'>Создать</span></button>";
        newObj.title += "<button type='button'  style='margin-left: 5px'  onclick='toArchNTD()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'";
        newObj.title += "role='button'><span class='ui-button-icon-primary ui-icon ui-icon-cancel'></span><span class='ui-button-text'>В архив</span></button>";
    }
    if ($isAdmin == 1){
        newObj.title += "<button type='button'  style='margin-left: 5px'  onclick='deleteNTD()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'";
        newObj.title += "role='button'><span class='ui-button-icon-primary ui-icon ui-icon-cancel'></span><span class='ui-button-text'>Удалить</span></button>";
    }

    newObj.title += "<span style='margin-left: 10px ; margin-bottom: -5px' class='pq-separator '></span>";
    newObj.title += "<button type='button'  style='margin-left: 10px' onclick='prnNtd()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'";
    newObj.title += "role='button'><span class='ui-button-icon-primary ui-icon ui-icon-print'></span><span class='ui-button-text'>Печать</span></button>";
   
    newObj.title += "<span style='margin-left: 10px ; margin-bottom: -5px' class='pq-separator '></span>";
    newObj.title += "<button type='button'  style='margin-left: 10px' onclick='updateFilter(true)' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'" +
    		"role='button'><span class='ui-button-icon-primary ui-icon ui-icon-refresh'></span></span><span class='ui-button-text'>Обновить списки фильтрации</span></button>";
    
  
    newObj.title += "<button type='button'  style='margin-left: 5px'  onclick='clearDocFilter($gridNTD)' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'";
    newObj.title += "role='button'><span class='ui-button-icon-primary ui-icon ui-icon-cancel'></span><span class='ui-button-text'>Очистить</span></button>";
   
    
    
    //   newObj.dataModel = dataModel;
    $gridNTD = $("#grid_ntd").pqGrid(newObj);
    $gridNTD.pqGrid({
        beforeTableView: function (event, ui) {
            $("#grid_ntd").pqGrid("option", "dataModel").url = $FilterNTD + '&totalRecords=' + totalRecordsNTD + '&format=json';
            $("span:contains('Дополнительно')").parent().prop('disabled', true).prop('disabled', true).removeClass("pq-select-option-label ui-state-enable pq-state-hover").addClass("fd");
        }
    });
    //------------------Инициализация выпадющего меню в хедере-------------------------------------------------------------------------
    $(".fNTD").pqSelect({
        singlePlaceholder: 'Все', searchRule: "begin", width: '150px'
    }).on("change", function (evt) {
    });
    $(".f2Group").pqSelect({
        singlePlaceholder: 'Нет', width: '150px'
    })
    
    $gridNTD.one("pqgridload", function (evt, ui) {
    	/*
    	var filterPr = $gridNTD.pqGrid("getColumn", {dataIndx: "btl-document:project-content"}).filter;      
    	filterPr.cache = null;
    	filterPr.options = $filterProject;
    	*/
    	
    	$gridNTD.pqGrid("refreshView");   

    	
    });
    $gridNTD.pqGrid({
        rowDblClick: function (event, ui) {
        	openModalEdit(ui.rowData.nodeRef, $gridNTD);
        },
        
        rowRightClick: function (event, ui) {
            var menu = document.getElementById("contextmenu");
            menu.style.display = "block";
            x = event.pageX;
            y = event.pageY;
            menu.style.left = x + "px";
            menu.style.top = y + "px";
            var menuItemCreate = document.getElementById("menuItemCreateCopy");
            menuItemCreate.nodeRef = ui.rowData.nodeRef;
            menuItemCreate.onclick = function () {
                var menu = document.getElementById("contextmenu");
                menu.style.display = "";
                addDocNTDCreate(this.nodeRef);
            }
            
            return false;
        }
        
    });
}

//--------------------------списать в архив--------------------------------------------------------------------
function toArchNTD() {
    var ans = window.confirm("Вы действительно хотите изменить статус у выбранных документов?");
    if (ans) {
        var data = $gridNTD.pqGrid("option", "dataModel.data");
        $gridNTD.pqGrid("showLoading");
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
        $gridNTD.pqGrid("hideLoading");
        $gridNTD.pqGrid("refreshDataAndView");
        $gridNTD.pqGrid({flexHeight: true});
    }
}

//--------------------------удалить--------------------------------------------------------------------
function deleteNTD() {
    deleteSelected($gridNTD, "Вы действительно хотите удалить выбранные документы?");
}

//--------------------------выбрать все--------------------------------------------------------------------
function selAllNTD() {
    require(["jquery"], function ($) {
        if ($("#selAllNTD").prop("checked")) {
            $("#selAllNTD").prop("checked", false);
            $gridNTD.pqGrid("selection",
                {
                    type: 'row',
                    all: 'all',
                    method: 'removeAll'
                }
            );
        } else {
            $("#selAllNTD").attr("checked", "checked");
            $("#selAllNTD").prop("checked", true);
            $gridNTD.pqGrid("selection",
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
function addArchInNTD($arch, $isAdmin, $colM) {
    idCreate = true;
    if ($arch == 1) {
        $colM.push({
            title: "<input type='checkbox' id='selAllNTD' onclick='selAllNTD()'>",
            dataIndx: "sel",
            width: 30,
            align: "center",
            type: 'checkBoxSelection',
            cls: 'ui-state-default',
            resizable: false,
            sortable: false
        });
    }
    createGridNTD($arch, $isAdmin, $colM);
}

//--------------------------клик по табу--------------------------------------------------------------------
require(["jquery"], function ($) {
    $(document).ready(function () {
        $('#li_tab9').click(function () {
            if ($gridNTD == "") {
                showNTD($FilterNTD + "&format=json");
            }
        });
    })
});

//--------------------------печать--------------------------------------------------------------------
function prnNtd() {
    window.open($FilterNTD + "&format=html&q_viewType=1" + prepareLocalFilter($gridNTD), "_blank");
}
