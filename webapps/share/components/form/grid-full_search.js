/*Исходящие*/
var $gridFullSearch = '';
var $FilterFullSearch = "/share/proxy/alfresco/documents/fullTextSearch?text=''"
var groupFullSearch = null;

function showFullSearch() {
   
    var colFullSearch = [
        {
            title: 'nodeRef',
            width: 100,
            dataType: 'string',
            dataIndx: 'nodeRef',
            hidden: true,
        },
        {
            title: 'Дата создания', minWidth: 260, width: 360,
            dataType: dateType, dataIndx: 'cm:created',
            filter: {type: 'textbox', condition: 'between', init: pqDatePicker, listeners: ['change']},

        },
        {
            title: 'Тип документа', minWidth: 300, dataType: 'string', dataIndx: 'typeText',
            filter: {type: 'textbox', condition: 'contain', listeners: ['change']},
        },
        
        {
            title: 'Номер', minWidth: 300, dataType: 'string', dataIndx: 'btl-document:regNumber',
            filter: {type: 'textbox', condition: 'contain', listeners: ['change']},
        },
        {

            title: 'Дата регистрации', minWidth: 360, width: 360,
            dataType: dateType, dataIndx: 'btl-document:regDate',
            filter: {type: 'textbox', condition: 'between', init: pqDatePicker, listeners: ['change']},
        }

    ];

    var dataModelFullSearch = {
       
        getData: function(dataJSON) {
            $gridFullSearch.pqGrid('showLoading');
            var data = dataJSON.items;            
            
            return {curPage: dataJSON.curPage, totalRecords: dataJSON.totalRecords, data: data};
        },
    };
    var newObjFullSearch = {
        selectionModel: {type: 'none', subtype: 'incr', cbHeader: false, cbAll: true},
        showTop: true,
        showHeader: true,
        showTitle: true,
        flexHeight: true,
        flexWidth: true,
        dataModel: dataModelFullSearch,
        collapsible: false,       
        pageModel: {
            type: 'remote', rPP: 100, strRpp: '{0}', rPPOptions: [
                25,
                50,
                100],
        },
        colModel: colFullSearch,
        filterModel: {on: true, mode: 'AND', header: true},
        editable: false,
        columnBorders: true,
        width: '100%',
        height: 600,
        beforeFilter: function(evt, ui) {
            $gridFullSearch.pqGrid('option', 'pageModel.curPage', 1);
        },
        create: function(ui) {
            var $grid = $(this),
                $pager = $grid.find('.pq-grid-bottom').find('.pq-pager');
            if ($pager && $pager.length) {
                $pager = $pager.detach();
                $grid.find('.pq-grid-top').append($pager);
            }
        },
    };
    
    newObjFullSearch.toolbar = {
        items: [
            {type: '<span>Тип документа: </span>'},
            {
                type: 'select', cls: 'combo-pg TypeDocFullSearch', prepend: {'': ''},
                options: [
                          {"btl-incomming:documentDataType" : "Входящий"},
                          {"btl-outgoing:documentDataType":"Исходящий"},
                          {"btl-internal:documentDataType" : "Внутренний"},
                          {"btl-ord:documentDataType":"ОРД"},
                          {"btl-ntd:ntdDataType":"НТД"},
                          {"btl-contract:contractTypeData" : "Договор"},
                          {"btl-projectCase:projectCaseDataType" : "Дело проекта"},
                          {"btl-meeting:meetingDataType" : "Мероприятие"},
                          {"btl-task:taskDataType" : "Задача"},
                          {"btl-project:projectDataType" : "Проект"}
                          
                          
                          
                ],
                listeners: [
                    {
                        change: function(evt) {
                                       
                        	
                        	var val = $(this)[0].options[$(this)[0].options.selectedIndex].text;
                        	var docType = escape(val).replace(/\%/g,'\%5C')
                        	
                        	var vidSelect = $('.VidDocFullSearch');
	                        vidSelect.find('option').remove().end();
                        	
                        	if (docType)
                    		{
	                        	Alfresco.util.Ajax.request({
	                                method: "GET",
	                                url: "/share/proxy/alfresco/filters/association?type=btl-docType:docTypeData&s_field=name&field=name&filter=type:'" + docType + "'",
	                                successCallback:{
	                                    fn: function (complete){
	
	                                    	var vidSelect = $('.VidDocFullSearch');
	                                    	
	                                    	vidSelect.append($("<option></option>").attr("value", "").text(""));
	                                    	
	                                        for(var i in complete.json.result)
	                                    	{                                        	
	                                        	vidSelect.append($("<option></option>").attr("value", complete.json.result[i].nodeRef).text(complete.json.result[i].name));
	                                    	} 
	                                        
	
	                                    },
	                                    scope: this
	                                }
	                            });
                    		}
                            
                            
                        },
                    },
                ],
            },
            {type: '<span>Вид документа: </span>'},
            {
                type: 'select', cls: 'combo-pg VidDocFullSearch', prepend: {'': ''},
                options: [                  
                    
                ],
                listeners: [
                    {
                        change: function(evt) {                            
                        	// console.log($(this).val());
                        }
                    },
                ],
            },
            {type: '<span>Запрос: </span>'},
            {
                type: 'textbox',
                cls: 'TextFullSearch'
              
            },
            {type: '<span style="margin-left: 7px"></span>'},
            {
                type: 'button', label: 'Найти',
                listeners: [
                    {
                        click: function(evt) {
                            
                        	
                        	
                        	var textSearch = $('.TextFullSearch').val().replace(/[.,/\\!@#$%^&*()_"№;:?]/g,' ');
                        		
                        	var vid = $('.VidDocFullSearch').val();
                        	
                        	var type = $(".TypeDocFullSearch").val();
                        	
                        	var text = escape(textSearch).replace(/\%20/g,' ').replace(/\%/g,'\%5C').trim();
                        	
                        	if (!text)
                    		{
                        		
                        		var popup = Alfresco.util.PopupManager.displayMessage(
                				{
                		        	text: "Ошибочный запрос",
                		        	displayTime: 500        	
                		        });
                        		setTimeout(function(){popup.destroy();},2500);
                        		
                        		return;
                    		}
                        	
                        	//$('.TextFullSearch').val(text);
                        	
                        	$gridFullSearch.pqGrid('showLoading');
                        	
                        	Alfresco.util.Ajax.request({
                                method: "GET",
                                url: '/share/proxy/alfresco/documents/fullTextSearch?text=' + text + ((vid)?('&vid=' + vid):'') + ((type)?('&docType=' + type):''),
                                successCallback:{
                                    fn: function (complete){

                                    	// console.log(complete);
                                    	var data = complete.json.items;
                                   	                                    	
                                    	for (var i in data)
                                    	{
                                        	switch (data[i].type)
                                        	{
                                        		case "cm:folder":
                                        			data[i].typeText = "Папка";
                                        			break;
                                        		case "btl-internal:documentDataType":
                                        			data[i].typeText = "Внутренний документ";
                                        			break;
                                        		case "btl-outgoing:documentDataType":
                                        			data[i].typeText = "Исходящий";
                                        			break;
                                        		case "btl-ntd:ntdDataType":
                                        			data[i].typeText = "НТД";
                                        			break;
                                        		case "btl-projectCase:projectCaseDataType":
                                        			data[i].typeText = "Дело проекта";
                                        			break;
                                        		case "btl-meeting:meetingDataType":
                                        			data[i].typeText = "Мероприятие";
                                        			data[i].url = '/share/page/dp/ws/meeting-rooms?nodeRef=';
                                        			break;                                        			
                                        		case "btl-task:taskDataType":
                                        			data[i].typeText = "Задача";
                                        			break;
                                        		case "btl-incomming:documentDataType":
                                        			data[i].typeText = "Входящий документ";
                                        			break;
                                        		case "btl-project:projectDataType":
                                        			data[i].typeText = "Проект";
                                        			break;  
                                        		case "btl-fileContainer:fileContainerData":
                                        			data[i].typeText = "Шаблон вложения";
                                        			break; 
                                        		case "btl-ord:documentDataType":
                                        			data[i].typeText = "ОРД";
                                        			break;                                       			                                        			                                        			
                                        		case "btl-contract:contractTypeData":
                                        			data[i].typeText = "Договор";
                                        			data[i].url = '/share/page/arm/contract?nodeRef=';
                                        			break;
                                        		case "btl-mailMessage:mailMessageDataType":
                                        			data[i].typeText = "Письмо";
                                        			data[i].url = '/share/page/btl-mailMessage?nodeRef=';
                                        			break;
                                        			
                                        			
                                        		default:data[i].typeText = data[i].type;
                                        				
                                        	}
                                    	}
                                    	
                                    	$gridFullSearch.pqGrid("option", "dataModel", {data: complete.json.items, location: "local", sorting: "local"});
                                        $gridFullSearch.pqGrid('refreshDataAndView');
                                    	$gridFullSearch.pqGrid('hideLoading');

                                    },
                                    scope: this
                                }
                            });
                        	
                        	
                        	
                        },
                    }]
            },
            /*,
             {type: 'separator'},
             {type: 'button', label: 'Печать', listeners: [{click: prn}], icon: 'ui-icon-print'}*/
        ],
    };
    $gridFullSearch = $('#grid_FullSearch').pqGrid(newObjFullSearch);

    $gridFullSearch.pqGrid({
        rowDblClick: function(event, ui) {

            openModalEditFullSearch(ui.rowData, $gridFullSearch);
        },
    });

    $gridFullSearch.one('pqgridload', function(evt, ui) {
        $('#tabs').tabs('option', 'disabled', -1);
        $gridFullSearch.pqGrid('refreshHeader');
    });
    $('.fGroupFullSearch').pqSelect({
        singlePlaceholder: 'Нет', width: '150px', search: 'false',
    });
}
document.onclick = function() {
    document.getElementById('contextmenu').style.display = '';
};

function openModalEditFullSearch(rowData, grid)
{
    document.activeGrid = grid;

    document.frameSave = function () {
        document.getElementById(modalWindowShadow).style.display = "none";
        document.body.style.overflow = "";
        $gridFullSearch.pqGrid('refreshDataAndView');
    }
    document.frameCancel = function () {
        document.getElementById(modalWindowShadow).style.display = "none";
        document.body.style.overflow = "";
        $gridFullSearch.pqGrid('refreshDataAndView');
    }
    var modal = document.getElementById(modalWindowShadow);
    modal.style.display = "block";
    var frameShadowBack = document.getElementById(frameBackground);
    var url = (rowData.url)?rowData.url:'/share/page/btl-edit-metadata?nodeRef=';
    frameShadowBack.innerHTML = '<iframe id="viewDocFrame" style="border-radius: 4px;" width="100%" height="100%" src="' + url + rowData.nodeRef + '&frame=true">';
}
function addFullSearch(id)
{
    setSaveCancelFunction($gridFullSearch);


    var modal = document.getElementById(modalWindowShadow);
    modal.style.display = "block";

    var frameShadowBack = document.getElementById(frameBackground);

    frameShadowBack.innerHTML = '<iframe id="viewDocFrame" style="border-radius: 4px;" width="100%" height="100%" src="/share/page/arm/FullSearch">';
    document.body.style.overflow = "hidden";
}


//--------------------------клик по табу--------------------------------------------------------------------
require(['jquery'], function($) {
    $(document).ready(function() {
        $('#li_tab16').click(function() {
            if ($gridFullSearch == '') {
                showFullSearch($FilterFullSearch + '&format=json');
                $('#grid_FullSearch').pqGrid('refreshView');
                /*contragentPerson.pqSelect("disable");*/
            }
        });
    });
});
