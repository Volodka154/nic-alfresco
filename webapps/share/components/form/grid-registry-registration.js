var $gridRegistration = "";
var $FilterRegistration = "/share/proxy/alfresco/documents/search-regestry-inout?q_state=" + encodeURI(encodeURI('На регистрации'));
var groupRegistration = null;

var $filterDoc = null;
var $filterAuthor = null;
//--------------------------создать грид--------------------------------------------------------------------

function getcolMIn()
{
	var colMIn = [];    
    
    var typeAccess = [];
    
    if (isClerk)
	{
		typeAccess.push(
          	{"Внутренний" : "Внутренний"}, 
          	{"Исходящий" : "Исходящий"},
          	{"Входящий" : "Входящий"},
          	{"ОРД" : "ОРД"}
         );
	}
    
    if (isContract)
	{
	    typeAccess.push(
	          	{"Договор" : "Договор"}
	         );
	}
    
    
    
    colMIn.push(
        {title: "nodeRef", width: 100, dataType: "string", dataIndx: "nodeRef", hidden: true},
        {
            title: "Файл", minWidth: 100,
            dataType: "string", dataIndx: "fileExists"
        },
        {
            title: "Вид", minWidth: 100,
            dataType: "string", dataIndx: "docType",
            filter: {
                type: 'select', condition: 'equal', options: typeAccess,
                prepend: {'': ''},
                listeners: ["change"],
                init: function () {
                    $(this).pqSelect({singlePlaceholder: 'Все', searchRule: "contain", width: '100%'});
                },
            }
        },       
        {title: "recipientNodeRef", dataIndx: "recipientNodeRef", hidden: true},
       
        {
            title: "Инициатор", width: 200, dataType: "string", dataIndx: "btl-document:author-login",
            filter: {
                type: 'select', style: "height:32px;", condition: 'equal', options: document.emploeeDoc,
                prepend: {'': ''},
                listeners: ["change"],
                init: function () {
                    $(this).pqSelect({singlePlaceholder: 'Все', searchRule: "contain", width: '100%'});
                },
            }
        },
        {
            title: "Содержание",
            width: 300,
            dataType: "string",
            dataIndx: "btl-document:content",
            filter: {type: 'textbox', condition: 'contain', listeners: ['change']}
        },        
        {
            title: "Тип документа", minWidth: 200, dataType: "string", dataIndx: "btl-document:docType-ref",
            filter: {
                type: 'select', condition: 'equal', options: null,
                prepend: {'': ''},
                listeners: ["change"],
                init: function () {
                    $(this).pqSelect({singlePlaceholder: 'Все', searchRule: "contain", width: '100%'});
                }
            }
        },
        {title: "Контрагент", minWidth: 200, dataType: "string", dataIndx: "contractor"
            
        },
        {title: "Статус", minWidth: 200, dataType: "string", dataIndx: "state"       	        	        	
            
        }
        
        

        
    );
    
    return colMIn;
}



function showRegistration() {
		
    $("#tabs").tabs( "option", "disabled", -1 );


    var dataModel = {
        location: "remote", sorting: "local", dataType: "JSON", method: "GET", url: $FilterRegistration + "&format=json",
        getData: function (dataJSON) {
            $gridRegistration.pqGrid("showLoading");


            var gridData = dataJSON.items;
            $filterDoc = [];
            $filterAuthor = [];
            tempDoc = [];
            tempAuthor = []

            for(var i=0; i < gridData.length; i++)
        	{
            	var typeDocItem = new Object;
            	typeDocItem[gridData[i]['docTypeNodeRef']] =  gridData[i]['btl-document:docType-ref'];

            	if (tempDoc.indexOf(gridData[i]['docTypeNodeRef']) < 0)
            	{
            		$filterDoc.push(typeDocItem);
            		tempDoc.push(gridData[i]['docTypeNodeRef']);
            	}


            	var authorItem = new Object;
            	authorItem[gridData[i]['autorNodeRef']] =  gridData[i]['btl-document:author-login'];

            	if (tempAuthor.indexOf(gridData[i]['autorNodeRef']) < 0)
            	{
            		$filterAuthor.push(authorItem);
            		tempAuthor.push(gridData[i]['autorNodeRef']);
            	}



        	}
            
            return {curPage: dataJSON.curPage, totalRecords: dataJSON.totalRecords, data: dataJSON.items};

        }

    };
    
    var newObjIn = {
        selectionModel: {type: 'none', subtype: 'incr', cbHeader: false, cbAll: true},
        showTop: true,
        showHeader: true,
        showTitle: true,
        flexHeight: true,
        flexWidth: true,
        dataModel: dataModel,
        collapsible: false,
        pageModel: {type: "remote", rPP: 100, strRpp: "{0}", rPPOptions: [25, 50, 100]},
        colModel: getcolMIn(),
        filterModel: {on: true, mode: "AND", header: true},
        editable: false,
        columnBorders: true,
        width: '100%',
        height: 600,
        beforeFilter: function (evt, ui) {
            $gridRegistration.pqGrid("option", "pageModel.curPage", 1);
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
   
    newObjIn.toolbar = {
        items: [
            {type: '<span>Группировка: </span>'},
            {
                type: 'select',  cls: 'combo-pg fRegistrationGroup', prepend: {'': ''},
                options: [
                    'Вид',
                    'Тип документа'
                ],
                listeners: [
                    {
                        change: function (evt) {
                            if ($gridRegistration.pqGrid("option", "groupModel") != null) {
                                $gridRegistration.pqGrid("option", "groupModel.collapsed", [false,
                                    false,
                                    false]);
                                $gridRegistration.pqGrid("refreshView");
                            }
                            switch ($(this).val()) {
                                case "Вид":
                                    groupRegistration = "docType";
                                    break;
                                case "Тип документа":
                                    groupRegistration = "btl-document:docType-ref";
                                    break;
                                default:
                                    groupRegistration = null;
                            }
                            var groupModel = null;
                            /* if (response.items.length != 0) {*/
                            if (groupRegistration != null) {
                                groupModel = {
                                    dataIndx: [groupRegistration],
                                    collapsed: [true],
                                    title: ["<b style='font-weight:bold;'>{0} ({1})</b>",
                                        "{0} - {1}"],
                                    dir: ["up","down"]
                                };
                            }
                            //  }
                            $gridRegistration.pqGrid("option", "groupModel", groupModel);
                            $gridRegistration.pqGrid("refreshDataAndView");
                        }
                    }
                ]
            },
            {type: '<span style="margin-left: 7px"></span>'},
            {
                type: 'button', label: 'Очистить',
                listeners: [{
                    click: function (evt) {
                        clearDocFilter($gridRegistration);
                        regElementCount();
                    }
                }],
                icon: 'ui-icon-cancel'
            }
            /*,
             {type: 'separator'},
             {type: 'button', label: 'Печать', listeners: [{click: prn}], icon: 'ui-icon-print'}*/
        ]
    };
    $gridRegistration = $("#grid_registration").pqGrid(newObjIn);
    $gridRegistration.pqGrid({
        beforeTableView: function (event, ui) {
            $("span:contains('Дополнительно')").parent().prop('disabled', true).prop('disabled', true).removeClass("pq-select-option-label ui-state-enable pq-state-hover").addClass("fd");
        }
    });
    $gridRegistration.one("pqgridload", function (evt, ui) {

        $("#tabs").tabs( "option", "disabled", -1 );
        $gridRegistration.pqGrid("refreshHeader");
        
        var filterDoc = $gridRegistration.pqGrid("getColumn", {dataIndx: "btl-document:docType-ref"}).filter;      
        filterDoc.cache = null;
        filterDoc.options = $filterDoc
        
        var filterAuthor = $gridRegistration.pqGrid("getColumn", {dataIndx: "btl-document:author-login"}).filter;      
        filterAuthor.cache = null;
        filterAuthor.options = $filterAuthor
        
        
        
        
        $gridRegistration.pqGrid("refreshView");        
        
    });
    
    
    
    

//--------------------------фильтры хедера----------------------------------
    $gridRegistration.pqGrid({
        rowDblClick: function (event, ui) {
        	
        	// console.log(ui.rowData);
        	
        	openModalEdit(ui.rowData.nodeRef, $gridRegistration, ui.rowData.link);  		
        	
        	
            
        }
    });        
//-------------------------заменить выпадающее меню на pqSelect--------------------------------------------------------------------
    $(".fRegistrationGroup").pqSelect({
        singlePlaceholder: 'Нет', width: '150px', search: 'false'
    });

    
}



//--------------------------клик по табу--------------------------------------------------------------------
require(["jquery"], function ($) {
    $(document).ready(function () {
        $('#li_tab5').click(function () {
            if ($gridRegistration == "") {
                showRegistration($FilterRegistration + "&format=json");
                
                
            }
        });
    })
});
