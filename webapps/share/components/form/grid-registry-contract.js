/*Исходящие*/
var $gridContract = '';
var $FilterContract = '/share/proxy/alfresco/documents/search-contract?q_state=' +
    encodeURI(encodeURI('Активные'));
var groupContract = null;

function showContract() {
    require(["jquery", "pqgrid", "pqselect", "jquery-ui.datepicker-ru"], function ($) {
        Alfresco.util.Ajax.request({
            method: "GET",
            url: Alfresco.constants.PROXY_URI + "groupPermision?user=" + Alfresco.constants.USERNAME + "&group=ALFRESCO_ADMINISTRATORS",
            successCallback: {
                fn: function addPropetries(complete) {
                    if (complete.json.result == "true") {
                        createContract(1);
                    } else {
                        createContract(0);
                    }
                },
                scope: this
            }
        });
    })
}

function createContract($isAdmin) {
    var typeContract = [

        {'Договор': 'Договор'},
        {'ДС': 'ДС'},

    ];
    var stateContract = [

        {'Проект': 'Проект'},
        {'На согласовании': 'На согласовании'},
        {'На доработке': 'На доработке'},
        {'Согласован': 'Согласован'},
        {'На регистрации': 'На регистрации'},
        {'Отозван': 'Отозван'},
        {'Отменен': 'Отменен'},
        {'Зарегистрирован': 'Зарегистрирован'},
        {'Действует': 'Действует'}

    ];
    var colContract = [];
    if ($isAdmin)
        colContract.push(
            {
                title: "<input type='checkbox' id='selAllContracts' onclick='selAllContracts()'>",
                dataIndx: "sel",
                width: 30,
                align: "center",
                type: 'checkBoxSelection',
                cls: 'ui-state-default',
                resizable: false,
                sortable: false
            });
    colContract.push(
        {
            title: 'nodeRef',
            width: 100,
            dataType: 'string',
            dataIndx: 'nodeRef',
            hidden: true,
        },
        {
            title: 'Файл',
            /*  minWidth: 100,*/
            dataType: 'string', dataIndx: 'fileExists',
        },

        {
            title: 'Дата создания', minWidth: 160, width: 160,
            dataType: dateType, dataIndx: 'cm:created',
            filter: {type: 'textbox', condition: 'between', init: pqDatePicker, listeners: ['change']},

        },
        {
            title: 'Тип', minWidth: 200, dataType: 'string', dataIndx: 'btl-contract:type',
            filter: {
                type: 'select', condition: 'equal', options: typeContract,
                prepend: {'': ''},
                listeners: ['change'],
                init: function() {
                    $(this).
                        pqSelect(
                            {singlePlaceholder: 'Все', searchRule: 'contain', width: '100%'});
                },
            },

            /*  filter: {type: 'textbox', condition: 'contain', listeners: ['change']}*/
        },
        {

            title: 'Вид договора', minWidth: 160, width: 160, dataType: 'string', dataIndx: 'btl-document:docType-ref', cls: 'just',
            filter: {
                type: 'select', condition: 'contain', options: {}, prepend: {'': ''},

                listeners: ['change'],
                init: function() {

                    $(this).
                        pqSelect(
                            {singlePlaceholder: 'Все', searchRule: 'begin', width: '100%',
                                url: encodeURI(encodeURI('/share/proxy/alfresco/filters/association?type=btl-docType:docTypeData&s_field=name&field=name&filter=type:"Договор"'))
                              /*  url: '/share/proxy/alfresco/filters/association?type=btl-docType:docTypeData&s_field=name&field=name&filter="'+encodeURI(encodeURI("Договор"))+'"'*/
                                });
                },
            },
        },
        {title: 'docTypes', dataIndx: 'docTypes', hidden: true},
        {
            title: 'Номер', minWidth: 100, dataType: 'string', dataIndx: 'btl-document:regNumber',
            filter: {type: 'textbox', condition: 'contain', listeners: ['change']},
        },
        {

            title: 'Дата регистрации', minWidth: 160, width: 160,
            dataType: dateType, dataIndx: 'btl-document:regDate',
            filter: {type: 'textbox', condition: 'between', init: pqDatePicker, listeners: ['change']},
        },
        {
            title: 'Контрагент(ы)', minWidth: 160, width: 160, dataType: 'string', dataIndx: 'btl-contract:contractors-ref', cls: 'just',
            filter: {
                type: 'select', condition: 'contain', options: document.organizations, prepend: {'': ''},
                //listeners: ["change", {change: get2ContragentPerson}],
                listeners: ['change'],
                init: function() {

                    $(this).
                        pqSelect(
                            {singlePlaceholder: 'Все', searchRule: 'begin', width: '100%', url: '/share/proxy/alfresco/filters/association?type=btl-contr:contractor-folder&s_field=name&field=name'});
                },
            },
        },
        {title: 'contragents', dataIndx: 'contragents', hidden: true},
        {
            title: 'Номер контрагента', minWidth: 120, dataType: 'string', dataIndx: 'btl-contract:numberContractor',
            filter: {type: 'textbox', condition: 'contain', listeners: ['change']},
        },
        {
            title: 'Состояние', minWidth: 120, dataType: 'string', dataIndx: 'btl-document:state',
            filter: {
                type: 'select', condition: 'equal', options: stateContract,
                prepend: {'': ''},
                listeners: ['change'],
                init: function() { 
                    $(this).
                        pqSelect(
                            {singlePlaceholder: 'Все', searchRule: 'contain', width: '100%'});
                },
            },
        },
        {
            title: 'Предмет', minWidth: 180, dataType: 'string', dataIndx: 'btl-contract:summaryContract',
            filter: {type: 'textbox', condition: 'contain', listeners: ['change']},
        }
       
    );

    var dataModelContract = {
        location: 'remote', sorting: 'local', dataType: 'JSON', method: 'GET', url: $FilterContract +
        '&format=json',
        getData: function(dataJSON) {
            $gridContract.pqGrid('showLoading');
            var data = dataJSON.items;
            return {curPage: dataJSON.curPage, totalRecords: dataJSON.totalRecords, data: data};
        },
    };
    var newObjContract = {
        selectionModel: {type: 'none', subtype: 'incr', cbHeader: false, cbAll: true},
        showTop: true,
        showHeader: true,
        showTitle: true,
        flexHeight: true,
        flexWidth: true,
        dataModel: dataModelContract,
        collapsible: false,
        pageModel: {
            type: 'remote', rPP: 100, strRpp: '{0}', rPPOptions: [
                25,
                50,
                100],
        },
        colModel: colContract,
        filterModel: {on: true, mode: 'AND', header: true},
        editable: false,
        columnBorders: true,
        width: '100%',
        height: 600,
        beforeFilter: function(evt, ui) {
            $gridContract.pqGrid('option', 'pageModel.curPage', 1);
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
    newObjContract.title = "<button type='button' onclick='backHome()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'";
    newObjContract.title += "role='button'><span class='ui-button-icon-primary ui-icon ui-icon-home'></span><span class='ui-button-text'>Домой</span></button>";
    newObjContract.title += "<span style='margin-left: 10px ; margin-bottom: -5px' class='pq-separator '></span>";
    newObjContract.title += '<span style=\'margin-left: 10px ; margin-bottom: -5px\' class=\'pq-separator \'></span>';
    newObjContract.title += "<button type='button'  style='margin-left: 10px' onclick='addContract()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'";
    newObjContract.title += "role='button'><span class='ui-button-icon-primary ui-icon ui-icon-plus'></span><span class='ui-button-text'>Создать</span></button>";
    if ($isAdmin == 1){
        newObjContract.title += "<button type='button'  style='margin-left: 5px'  onclick='deleteContract()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'";
        newObjContract.title += "role='button'><span class='ui-button-icon-primary ui-icon ui-icon-cancel'></span><span class='ui-button-text'>Удалить</span></button>";
    }
    newObjContract.title += "<button type='button'  style='margin-left: 10px' onclick='prnContract()' class='ui-corner-all  ui-button ui-widget ui-state-default ui-button-text-icon-primary'";
    newObjContract.title += "role='button'><span class='ui-button-icon-primary ui-icon ui-icon-print'></span><span class='ui-button-text'>Печать</span></button>";
    newObjContract.toolbar = {
        items: [
            {type: '<span>Группировка: </span>'},
            {
                type: 'select', cls: 'combo-pg fGroupContract', prepend: {'': ''},
                options: [
                    'Тип',
                    'Вид договора',
                ],
                listeners: [
                    {
                        change: function(evt) {
                            if ($gridContract.pqGrid('option', 'groupModel') !=
                                null) {
                                $gridContract.pqGrid('option',
                                    'groupModel.collapsed', [
                                        false,
                                        false,
                                        false]);
                                $gridContract.pqGrid('refreshView');
                            }
                            switch ($(this).val()) {
                                case 'Тип':
                                    groupContract = 'btl-contract:type';
                                    break;
                                case 'Вид договора':
                                    groupContract = 'btl-document:docType-ref';
                                    break;

                                default:
                                    groupContract = null;
                            }
                            var groupModel = null;
                            /* if (response.items.length != 0) {*/
                            if (groupContract != null) {
                                groupModel = {
                                    dataIndx: [groupContract],
                                    collapsed: [true],
                                    title: [
                                        '<b style=\'font-weight:bold;\'>{0} ({1})</b>',
                                        '{0} - {1}'],
                                    dir: ['up', 'down'],
                                };
                            }
                            //  }
                            $gridContract.pqGrid('option', 'groupModel',
                                groupModel);
                            $gridContract.pqGrid('refreshDataAndView');
                        },
                    },
                ],
            },
            {type: '<span style="margin-left: 7px"></span>'},
            {
                type: 'button', label: 'Очистить',
                listeners: [
                    {
                        click: function(evt) {
                            clearDocFilter($gridContract);
                        },
                    }],
                icon: 'ui-icon-cancel',
            },
            /*,
             {type: 'separator'},
             {type: 'button', label: 'Печать', listeners: [{click: prn}], icon: 'ui-icon-print'}*/
        ],
    };
    $gridContract = $('#grid_contract').pqGrid(newObjContract);

    $gridContract.pqGrid({
        rowDblClick: function(event, ui) {

            openModalEditContract(ui.rowData.nodeRef, $gridContract);
        },
    });

    $gridContract.one('pqgridload', function(evt, ui) {
        $('#tabs').tabs('option', 'disabled', -1);
        $gridContract.pqGrid('refreshHeader');
    });
    $('.fGroupContract').pqSelect({
        singlePlaceholder: 'Нет', width: '150px', search: 'false',
    });
}
document.onclick = function() {
    document.getElementById('contextmenu').style.display = '';
};
//--------------------------метод очистки фильтров--------------------------------------------------------------------
function clearOutDocFilter() {
    $FilterContract = '/share/proxy/alfresco/documents/search-contract?q_state=' +
        encodeURI(encodeURI('Активные'));
    $gridContract.pqGrid('destroy');
    showContract();

}
function openModalEditContract(nodeRef, grid)
{
    document.activeGrid = grid;

    document.frameSave = function () {
        document.getElementById(modalWindowShadow).style.display = "none";
        document.body.style.overflow = "";
        $gridContract.pqGrid('refreshDataAndView');
    }
    document.frameCancel = function () {
        document.getElementById(modalWindowShadow).style.display = "none";
        document.body.style.overflow = "";
        $gridContract.pqGrid('refreshDataAndView');
    }
    var modal = document.getElementById(modalWindowShadow);
    modal.style.display = "block";
    var frameShadowBack = document.getElementById(frameBackground);
    frameShadowBack.innerHTML = '<iframe id="viewDocFrame" style="border-radius: 4px;" width="100%" height="100%" src="/share/page/arm/contract?nodeRef=' + nodeRef + '&frame=true">';
}
function addContract(id)
{
    setSaveCancelFunction($gridContract);


    var modal = document.getElementById(modalWindowShadow);
    modal.style.display = "block";

    var frameShadowBack = document.getElementById(frameBackground);

    frameShadowBack.innerHTML = '<iframe id="viewDocFrame" style="border-radius: 4px;" width="100%" height="100%" src="/share/page/arm/contract">';
    document.body.style.overflow = "hidden";
}
//------------------------------на печать ----------------------------------------------
function prnContract() {
    window.open($FilterContract + '&format=html&q_viewType=1' +
        prepareLocalFilter($gridContract), '_blank');

}

//--------------------------выбрать все--------------------------------------------------------------------
function selAllContract() {
    require(["jquery"], function ($) {
        if ($("#selAllContract").prop("checked")) {
            $("#selAllContract").prop("checked", false);
            $gridContract.pqGrid("selection",
                {
                    type: 'row',
                    all: 'all',
                    method: 'removeAll'
                }
            );
        } else {
            $("#selAllContract").attr("checked", "checked");
            $("#selAllContract").prop("checked", true);
            $gridContract.pqGrid("selection",
                {
                    type: 'row',
                    all: 'all',
                    method: 'selectAll'
                }
            );
        }
    })
}

//--------------------------удалить--------------------------------------------------------------------
function deleteContract() {
    deleteSelected($gridContract, "Вы действительно хотите удалить выбранные договоры?");
}

//--------------------------клик по табу--------------------------------------------------------------------
require(['jquery'], function($) {
    $(document).ready(function() {
        $('#li_tab15').click(function() {
            if ($gridContract == '') {
                showContract($FilterContract + '&format=json');
                //$('#grid_contract').pqGrid('refreshView');
                /*contragentPerson.pqSelect("disable");*/
            }
        });
    });
});
