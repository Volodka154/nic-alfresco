//--------------------------входящие документы--------------------------------------------------------------------
var totalRecordsproject = 0;
var $gridProject = "";
var $Filterproject = "/share/proxy/alfresco/documents/search-project?q_state=" + encodeURI(encodeURI('Активные'));
var groupproject = null;
var idAddArch = 0;
var $filterProject = null;
/*var newObj = [];*/
function showProject() {
    var colM = [];
    require(["jquery", "pqgrid", "pqselect", "jquery-ui.datepicker-ru"], function ($) {
        // $gridProject.pqGrid("destroy");
        var idCreate = false;
        Alfresco.util.Ajax.request({
            method: "GET",
            url: Alfresco.constants.PROXY_URI + "groupPermision?user=" + Alfresco.constants.USERNAME + "&group=ALFRESCO_ADMINISTRATORS",
            successCallback: {
                fn: function addPropetries(complete) {
                    if (complete.json.result == "true") {
                        idAddArch = 1;
                        addArchInprojectProject(1, 1, colM);
                    } else {
                        Alfresco.util.Ajax.request({
                            method: "GET",
                            url: Alfresco.constants.PROXY_URI + "groupPermision?user=" + Alfresco.constants.USERNAME + "&group=EEO",
                            successCallback: {
                                fn: function addPropetries(complete) {
                                    if (complete.json.result == "true") {
                                        if (idCreate == false) {
                                            idAddArch = 1;
                                            addArchInprojectProject(1, 0, colM);
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
                                                            addArchInprojectProject(1, 0, colM);
                                                        }
                                                    } else {
                                                        addArchInprojectProject(0, 0, colM);
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



//---------------------------------добавить в архив------------------------------------------------------------
function addArchInprojectProject($arch, $isAdmin, $colM) {
    idCreate = true;
    
    creategridProject($arch, $isAdmin, $colM);
}

//--------------------------создать грид--------------------------------------------------------------------
function creategridProject($arch, $isAdmin, $colM) {
	var stateAccess = [
	                   {"": "Все"},
	                   {"1": "Активные"},
	                   {"0": "Идея"},
	                   {"2": "Закрыт"}
	               ];
	var typeAccess = [
	                   {"": "Все"},
	                   {"0": "Научный"},
	                   {"1": "Общедеятельный"},	                   
	                   {"2": "Аванпроект"}
	               ];
	var stageAccess = [
	                   {"": "Все"},
	                   {"0": "Заявка"},
	                   {"1": "НТС"},	                   
	                   {"2": "Утверждение"},
	                   {"3": "Реализация"},
	                   {"4": "Завершение"}
	               ];

    if ($isAdmin)
        $colM.push(
            {
                title: "<input type='checkbox' id='selAllproject' onclick='selAllproject()'>",
                dataIndx: "sel",
                width: 30,
                align: "center",
                type: 'checkBoxSelection',
                cls: 'ui-state-default',
                resizable: false,
                sortable: false
            });
    $colM.push(
        {title: "nodeRef", width: 100, dataType: "string", dataIndx: "nodeRef", hidden: true, align: "center"},                              
        {
            title: "Шифр", minWidth: 150, dataType: "string", dataIndx: "btl-project:shortName",
            filter: {type: 'textbox', condition: 'contain', listeners: ['change']}
        },
        {
            title: "Руководитель проекта", minWidth: 200, dataType: "string", dataIndx: "btl-project:projectManager-login",
            filter: {
                type: 'select', condition: 'equal', options: document.emploeeDoc,
                prepend: {'': ''},
                listeners: ["change"],
                init: function () {                	
                    $(this).pqSelect({singlePlaceholder: 'Все', searchRule: "begin", width: '100%'});
                }
            }
        }, 
        {
            title: "Направление", minWidth: 150, dataType: "string", dataIndx: "btl-project:directionDepartment-ref",
            filter: {
                type: 'select', condition: 'equal', options: [], prepend: {'': ''},
                listeners: ["change"],
                init: function (arg1) {                 	
                	$(this).pqSelect({
                			singlePlaceholder: 'Все', 
                			searchRule: "begin", 
                			width: '100%', 
                			url:"/share/proxy/alfresco/filters/association?type=btl-depart:department-folder&s_field=name&field=name",
                			urlItem:"/share/proxy/alfresco/picker/associationItem?type=btl-depart:department-folder&field=name",
                			value: arg1.column.filter.value
                	});
                	
                }
            }
        }, 
        {
            title: "Тип проекта", minWidth: 150, dataType: "string", dataIndx: "btl-project:projectType",
            filter: {
                type: 'select', style: "height:32px;", condition: 'equal', options: typeAccess, listeners: ["change"],
                init: function () {
                    $(this).pqSelect({singlePlaceholder: 'Все', searchRule: "begin", width: '100%'});
                },
            }
        },
        {
            title: "Стадия", minWidth: 150, dataType: "string", dataIndx: "btl-project:stage",
            filter: {
                type: 'select', style: "height:32px;", condition: 'equal', options: stageAccess, listeners: ["change"],
                init: function () {
                    $(this).pqSelect({singlePlaceholder: 'Все', searchRule: "begin", width: '100%'});
                },
            }
        },
        {
            title: "Организация-исполнитель", minWidth: 150, dataType: "string", dataIndx: "btl-project:executionOrganization-ref",
            filter: {
                type: 'select', condition: 'equal', options: [], prepend: {'': ''},
                listeners: ["change"],
                init: function (arg1) {                 	
                	$(this).pqSelect({
                			singlePlaceholder: 'Все', 
                			searchRule: "begin", 
                			width: '100%', 
                			url:"/share/proxy/alfresco/filters/association?type=btl-contr:contractor-folder&s_field=name&field=name",
                			urlItem:"/share/proxy/alfresco/picker/associationItem?type=btl-contr:contractor-folder&field=name",
                			value: arg1.column.filter.value
                	});
                	
                }
            }
        },
        
        
        {
            title: "Состояние", minWidth: 140, width: 140, dataType: "string", dataIndx: "btl-project:state",
            prepend: {'': ''},
            filter: {
                type: 'select', style: "height:32px;", condition: 'equal', options: stateAccess, listeners: ["change"],
                init: function () {
                    $(this).pqSelect({singlePlaceholder: 'Все', searchRule: "begin", width: '100%'});
                },
            }
        }
        
        
        
       
 
    );
    var dataModel = {
        location: "remote", sorting: "local", dataType: "JSON", method: "GET", url: $Filterproject + '&totalRecords=' + totalRecordsproject + '&format=json',
        getData: function (dataJSON) {
            var data = dataJSON.items;
            totalRecordsproject = dataJSON.totalRecords;
            
            $filterProject = [];
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
            	
            	
            	if (dataJSON.items[i]["btl-project:state"] == "0") dataJSON.items[i]["btl-project:state"] = "Идея";
            	if (dataJSON.items[i]["btl-project:state"] == "1") dataJSON.items[i]["btl-project:state"] = "Активный";
            	if (dataJSON.items[i]["btl-project:state"] == "2") dataJSON.items[i]["btl-project:state"] = "Закрыт";
            	
            	
            	if (dataJSON.items[i]["btl-project:stage"] == "0") dataJSON.items[i]["btl-project:stage"] = "Заявка";
            	if (dataJSON.items[i]["btl-project:stage"] == "1") dataJSON.items[i]["btl-project:stage"] = "НТС";
            	if (dataJSON.items[i]["btl-project:stage"] == "2") dataJSON.items[i]["btl-project:stage"] = "Утверждение";
            	if (dataJSON.items[i]["btl-project:stage"] == "3") dataJSON.items[i]["btl-project:stage"] = "Реализация";
            	if (dataJSON.items[i]["btl-project:stage"] == "4") dataJSON.items[i]["btl-project:stage"] = "Завершение";
            	
            	if (dataJSON.items[i]["btl-project:projectType"] == "0") dataJSON.items[i]["btl-project:projectType"] = "Научный";
            	if (dataJSON.items[i]["btl-project:projectType"] == "1") dataJSON.items[i]["btl-project:projectType"] = "Общедеятельный";
            	if (dataJSON.items[i]["btl-project:projectType"] == "2") dataJSON.items[i]["btl-project:projectType"] = "Аванпроект";
            	
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
            totalRecordsproject = 0;
            $("#grid_project").pqGrid("option", "dataModel").url = $Filterproject + '&totalRecords=' + totalRecordsproject + '&format=json';
            $gridProject.pqGrid("option", "pageModel.curPage", 1);
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
    newObj.title += "<button type='button'  style='margin-left: 10px' onclick='addDocProject()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'";
  
    newObj.title += "role='button'><span class='ui-button-icon-primary ui-icon ui-icon-plus'></span><span class='ui-button-text'>Создать</span></button>";
    if ($isAdmin == 1){
       newObj.title += "<button type='button'  style='margin-left: 5px'  onclick='deleteProjects()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'";
       newObj.title += "role='button'><span class='ui-button-icon-primary ui-icon ui-icon-cancel'></span><span class='ui-button-text'>Удалить</span></button>";
    }
   
   
    newObj.title += "<button type='button'  style='margin-left: 5px'  onclick='clearDocFilter($gridProject)' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'";
    newObj.title += "role='button'><span class='ui-button-icon-primary ui-icon ui-icon-cancel'></span><span class='ui-button-text'>Очистить</span></button>";
    newObj.title += "<button type='button'  style='margin-left: 10px' onclick='prnPtoject()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'";
    newObj.title += "role='button'><span class='ui-button-icon-primary ui-icon ui-icon-print'></span><span class='ui-button-text'>Печать</span></button>";
    
    
    //   newObj.dataModel = dataModel;
    $gridProject = $("#grid_project").pqGrid(newObj);
    $gridProject.pqGrid({
        beforeTableView: function (event, ui) {
            $("#grid_project").pqGrid("option", "dataModel").url = $Filterproject + '&totalRecords=' + totalRecordsproject + '&format=json';
            $("span:contains('Дополнительно')").parent().prop('disabled', true).prop('disabled', true).removeClass("pq-select-option-label ui-state-enable pq-state-hover").addClass("fd");
        }
    });
    //------------------Инициализация выпадющего меню в хедере-------------------------------------------------------------------------
   
    $gridProject.pqGrid({
        rowDblClick: function (event, ui) {
        	openModalEdit(ui.rowData.nodeRef, $gridProject);
        }
    });
}
//--------------------------списать в архив--------------------------------------------------------------------
function toArchproject() {
    var ans = window.confirm("Вы действительно хотите изменить статус у выбранных документов?");
    if (ans) {
        var data = $gridProject.pqGrid("option", "dataModel.data");
        $gridProject.pqGrid("showLoading");
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
        $gridProject.pqGrid("hideLoading");
        $gridProject.pqGrid("refreshDataAndView");
        $gridProject.pqGrid({flexHeight: true});
    }
}

//--------------------------удалить--------------------------------------------------------------------
function deleteProjects() {
    deleteSelected($gridProject, "Вы действительно хотите удалить выбранные проекты?");
}

//--------------------------выбрать все--------------------------------------------------------------------
function selAllproject() {
    require(["jquery"], function ($) {
        if ($("#selAllproject").prop("checked")) {
            $("#selAllproject").prop("checked", false);
            $gridProject.pqGrid("selection",
                {
                    type: 'row',
                    all: 'all',
                    method: 'removeAll'
                }
            );
        } else {
            $("#selAllproject").attr("checked", "checked");
            $("#selAllproject").prop("checked", true);
            $gridProject.pqGrid("selection",
                {
                    type: 'row',
                    all: 'all',
                    method: 'selectAll'
                }
            );
        }
    })
}



//--------------------------клик по табу--------------------------------------------------------------------
require(["jquery"], function ($) {
    $(document).ready(function () {
        $('#li_tab14').click(function () {
            if ($gridProject == "") {
                showProject($Filterproject + "&format=json");
            }
        });
    })
});

function prnPtoject() {
    window.open($Filterproject + "&format=html&q_viewType=1" + prepareLocalFilter($gridProject), "_blank");

}