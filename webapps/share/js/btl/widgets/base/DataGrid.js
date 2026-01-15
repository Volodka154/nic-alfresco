define(["dojo/_base/declare",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dojo/text!./templates/DataGrid.html",
        "service/constants/Default",
        "alfresco/core/Core",
        "alfresco/core/CoreWidgetProcessing",
        "alfresco/documentlibrary/_AlfDocumentListTopicMixin",
        "alfresco/services/_NavigationServiceTopicMixin",
        "dojo/dom-construct",
        "dojo/_base/lang",
        "alfresco/core/CoreXhr",
        "btl/service/FormContactPerson",
        "jquery",
        "pqgrid"
        ],
       function(declare, _WidgetBase, _TemplatedMixin, template, AlfConstants, AlfCore, CoreWidgetProcessing, _AlfDocumentListTopicMixin,
    		   _NavigationServiceTopicMixin, domConstruct, lang, CoreXhr, FormContactPerson,  $ ) {   
	
	return declare([_WidgetBase, _TemplatedMixin, AlfCore, CoreWidgetProcessing, _AlfDocumentListTopicMixin, _NavigationServiceTopicMixin, CoreXhr], {
	
		templateString: template,
		
		customCssClasses: "",
		
		postMixInProperties: function alfresco_DataGrid__postMixInProperties() {
	          this.inherited(arguments);
	          this.alfSubscribe("DATAGRID_LOAD_DATA", lang.hitch(this, this.loadDataDataGrid));
	          this.alfSubscribe("DATAGRID_SET_DATA", lang.hitch(this, this.setDataDataGrid));
	          this.alfSubscribe("DATAGRID_ADD_ROW", lang.hitch(this, this.addNewRow), true);
	          this.alfSubscribe("DATAGRID_EDIT_ROW", lang.hitch(this, this.editRow), true);
	          this.alfSubscribe("DATAGRID_REFRESH_DATA", lang.hitch(this, this.refreshDataDataGrid), true);
	          this.alfSubscribe("DATAGRID_DELETE_ROW_FROM_STORE_SUCCESS", lang.hitch(this, this.deleteRowFromStore), true);
	    },
	    
	    
	    Url: "search/search",
		
		title: "",
		
		type: null,

		parentTreeType: null,

		collapsible: false,
		
		colModel: null,

		pageModel: { type: "local", rPP: 25, strRpp: "{0}" , rPPOptions:[25, 50, 100] },
		
		selectionModel:  { type: 'row' , mode: 'range', all: null, cbAll: null, cbHeader: null },

		filterModel: { on: false, mode: "AND", header: true },

		toolbar: {},
		
		detailModel: { },
		
		resizable: true,
		
		showBottom: true,
		
		flexWidth: false,
		
		editable: false,
		
		width: 1325,
		
		loadData: false,
		
		rootNodeRef: null,
		
		height: 600,
		
		data: [],

		editor: null,

		editModel:{ cellBorderWidth: 1, clicksToEdit: 1, filterKeys: true, keyUpDown: true, saveKey: '' },
		
		q_params: null,

        quitEditMode: null,

		extra:"",

        isDataLoad: false,

            notActual: false,

            sizeAuto: true,

            cssRequirements: [{cssFile: "./css/pqgrid.css"}, {cssFile: "./css/themes/Office/pqgrid.css"},{cssFile: "./css/themes/Office/jquery-ui.css"}],

            postCreate: function alfresco_DataGrid__postCreate() {
                if (this.sizeAuto) {
                    var size = this.gridAutoSize();
                    this.height = size.height;
                    this.width = size.width;
                }
                this.gridModel = {
                    width: this.width,
                    height: this.height,
                    collapsible: this.collapsible,
                    title: this.title,
                    flexWidth: true,
                    resizable: true,
                    numberCell: {resizable: false, title: "#"},
                    editable: this.editable,
                    flexWidth: this.flexWidth,
                    showBottom: this.showBottom,
                    resizable: this.resizable,
                    pageModel: this.pageModel,
                    detailModel: this.detailModel,
                    filterModel: this.filterModel,
                    toolbar: this.toolbar,
                    editor: this.editor,
                    editModel: this.editModel,
                    quitEditMode: this.quitEditMode
                };

                this.gridModel.colModel = this.colModel;

                this.gridModel.selectionModel = this.selectionModel;

                this.alfLog("log", "alfresco_DataGrid__postCreate data", this.data);

                this.gridModel.dataModel = {data: this.data};
                
                this.gridModel._disabled = this._disabled;

                this.grid = $(this.domNode).pqGrid(this.gridModel);

                if (this.loadData) {
                    this.grid.pqGrid("showLoading");
                    this.loadDataDataGrid({nodeRef: this.rootNodeRef});
                }
                this.alfLog("log", "alfresco_DataGrid__postCreate this", this);
                this.alfLog("log", "alfresco_DataGrid__postCreate dataModel", this.gridModel.dataModel);
                this.setEventsDataGrid();
                this.eventAfterInit();

            },

            eventAfterInit: function () {
                var _this = this;
                $(window).resize(function(){
                    // console.log("resize");
                    var size = _this.gridAutoSize();
                    _this.grid.pqGrid( "option", "width", size.width );
                    _this.grid.pqGrid( "option", "height", size.height );
                    _this.grid.pqGrid("refreshView", {header: false});
                });
            },

            gridAutoSize: function gridAutoSize(){
                var height = document.documentElement.offsetHeight ;
                height -= document.getElementById('SHARE_HEADER').offsetHeight;
                height -= 50;

                var width = document.documentElement.offsetWidth - document.getElementById('MAIN_LIST_MENU').offsetWidth;
                width -= 30;
                return { "height": height, "width": width};
            },

            setEventsDataGrid: function alfresco_DataGrid__setEventsDataGrid() {

            },

            loadDataDataGrid: function alfresco_DataGrid__loadDataDataGrid(data) {
                if (this.parentTreeType != data.treeType)
                    return;
                    
                var query = "nodeRef=" + data.nodeRef;

                this.dataEmployee = data;
                
                if (this.allChild) {
                    query += "&allChild=" + this.allChild;
                }

                if (this.type !== null) {
                    query += "&type=" + this.type;
                }
                if (this.q_params !== null) {
                    if (this.notActual === true || this.notActual === false) {
                        this.q_params["notActual"] = this.notActual;
                    }

            	query += '&params=' + encodeURI(encodeURIComponent(JSON.stringify(this.q_params)));
			}
			query+= this.extra;
			var config = {
	                  url: AlfConstants.PROXY_URI + this.Url,
	                  query: query,
	                  method: "GET",
	                  successCallback: this.loadDataToDataGrid,
	                  failureCallback: this.failureLoadDataToDataGrid,
	                  callbackScope: this
	               };
	          this.serviceXhr(config);
		},

		failureLoadDataToDataGrid: function failureLoadDataToDataGrid(response, originalRequestConfig){
		    this.grid.pqGrid( "hideLoading" );
		    var responseObj = JSON.parse(response.response.text);
            if (responseObj.message){
                alert(responseObj.message);
            }
		},

		setDataDataGrid:function alfresco_DataGrid__setDataToDataGrid(data){	
			this.grid.pqGrid("option", "dataModel.data", data );
			this.grid.pqGrid("refreshDataAndView");
			this.grid.pqGrid( "hideLoading" );
			this.alfLog("log", "alfresco_DataGrid__setDataToDataGrid", this.grid);
            this.isDataLoad = true;
		},
		
		loadDataToDataGrid: function alfresco_DataGrid__loadDataToDataGrid(response, originalRequestConfig){	
			this.setDataDataGrid(response.items);
		},
		
		addNewRow: function alfresco_DataGrid__addNewRow(data){
			this.alfLog("log", "alfresco_DataGrid__addNewRow", data);
			
			this.grid.pqGrid( "addRow", { rowData: data });
			
			this.grid.pqGrid("refreshDataAndView");
		},
		
		refreshDataDataGrid: function alfresco_DataGrid__refreshDataDataGrid(){
			this.grid.pqGrid("refreshDataAndView");
		},
		
		deleteRowFromStore: function alfresco_DataGrid__deleteRowFromStore(){
			var arr = this.grid.pqGrid("selection", { type: 'row', method: 'getSelection' });
            if (arr && arr.length > 0) {
                
            	this.grid.pqGrid("deleteRow", { rowIndx: arr[0].rowIndx });
            	this.grid.pqGrid("setSelection", { rowIndx: arr[0].rowIndx });
            }
		},
		
		editRow: function alfresco_DataGrid__editRow(data){
            	this.alfLog("log", "alfresco_DataGrid__editRow", data);
            	this.grid.pqGrid( "updateRow", { rowIndx: data.rowId , row: data } );
            	this.grid.pqGrid("refreshDataAndView");
		}
	});
});