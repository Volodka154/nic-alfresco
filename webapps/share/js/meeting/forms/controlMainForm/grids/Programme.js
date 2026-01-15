/**
 * Created by nabokov on 23.11.2016.
 */
define(["dojo/_base/declare",
        "../../../grids/_Grid",
        "dojo/_base/lang",
        "meeting/utils/base",
        "alfresco/core/topics",
        "jquery",
        "dojo/domReady!"],
    function (declare, DataGrid, lang, utilBase, topics, $) {
        return declare([DataGrid], {
            Url: "get-children",
            type: "btl-meetingProgramm:meetingProgrammDataType",

            pageModel: {location : "remote", rPP: 10, strRpp: "{0}", rPPOptions: [10, 25, 50]},
            
            colModel: [
                {title: "nodeRef", width: 100, dataType: "string", dataIndx: "nodeRef", hidden: true},
                {title: "Вопрос", width: 400, dataType: "string", dataIndx: "prop_btl-meetingProgramm_question"},
                {
                    title: "Докладчик",
                    width: 300,
                    dataType: "string",
                    dataIndx: "prop_btl-meetingProgramm_employees-content"
                },
                {
                    title: "Докладчик nodeRefs",
                    width: 100,
                    dataType: "string",
                    dataIndx: "prop_btl-meetingProgramm_employees-ref",
                    hidden: true
                },
                {
                    title: "", width: 50,
                    render: function (ui) {
                        return '<div style="margin: 0 auto; width: 24px;">' +
                            '<button type="button" title="Удалить" class="delete-btn" role="button">'
                            + '<span class="delete-btn-icon"></span>'
                            + '</button></div>';
                    }
                },
                {title: "", width: 1, dataType: "string"}
            ],

            postMixInProperties: function () {
                this.inherited(arguments);
                
                
                var store = utilBase.getStoreById("MEETING_STORE");	                
                handleAlfSubscribe = store.handleAlfSubscribe;   
                
                handleAlfSubscribe.push(this.alfSubscribe("ADD_QUESTION_MEETING_PROGRAMM_TOPIC", lang.hitch(this, this.addQuestion), true));
                handleAlfSubscribe.push(this.alfSubscribe("EDIT_PROGRAMME_MEETING_PROGRAMM_TOPIC", lang.hitch(this, this.editProgramme), true));
                handleAlfSubscribe.push(this.alfSubscribe("PROGRAMME_PANE_MAIN_FORM_MEETING_SHOW", lang.hitch(this, this.showData), true));
                handleAlfSubscribe.push(this.alfSubscribe("PRESS_MEETING_REFRESH_PROGRAMME", lang.hitch(this, this.refreshProgramme), true));                
                handleAlfSubscribe.push(this.alfSubscribe("ALF_EDIT_PROGRAMM", lang.hitch(this, this.editFormProgramme), true));                                                              
                handleAlfSubscribe.push(this.alfSubscribe("BTL_CREATE_FORM_PROGRAMM", lang.hitch(this, this.onCreateFormProgramme), true));
                
                handleAlfSubscribe.push(this.alfSubscribe(this.id + "DELETE_ROW__SUCCESS", lang.hitch(this, this.deleteRowSuccess),true));
                
                
                if (!this.state && this.storeId) {
                    var store = utilBase.getStoreById(this.storeId);
                    if (store.document) {
                        this.documentNodeRef = store.nodeRef;
                        this.rootNodeRef = this.documentNodeRef;
                    }
                }
            },

            refreshProgramme:function()
            {
            	this.loadDataDataGrid({nodeRef: this.documentNodeRef});
            },
            postCreate: function () {                 
                
                
                var _this = this;
                this.inherited(arguments);

                //use refresh & refreshRow events to display jQueryUI buttons and bind events.
                this.grid.on('pqgridrefresh pqgridrefreshrow', function () {
                    var $grid = $(this);
                    var deleteButtons = $grid.find("button.delete-btn");
                    
                    if (!_this.documentNodeRef || _this._disabled) {
                    	deleteButtons.css("display", "none");
                    }
                    
                    deleteButtons.unbind("click")
                        .bind("click", function (evt) {
                            var $tr = $(this).closest("tr"),
                                rowIndx = $grid.pqGrid("getRowIndx", {$tr: $tr}).rowIndx;
                            //console.log("rowIndx = " + rowIndx);
                            _this.deleteRow(rowIndx, $grid);
                        });
                });
            },
            
            
            setEventsDataGrid: function(){
                var _this = this;
                if (!_this._disabled) {
	                this.grid.pqGrid({
	                    rowDblClick: function( event, ui ) {
	                        _this.editFormProgramme();
	                    }
	                });
                }
                //window.employeeDG = this.grid;
           },
           
           
           editFormProgramme: function(){
           	var arr = this.grid.pqGrid("selection", { type: 'row', method: 'getSelection' });
	            if (arr && arr.length > 0) {
	            	var row = arr[0].rowData; 
	            	var data = {};	            	
	            	data.config = {};
	            	data.data = row;
	            	data.data.rowId = arr[0].rowIndx;
	            	data.config.dialogTitle = "Редактировать вопрос";
	            	data.config.dialogConfirmationButtonTitle = "Сохранить";
	            	data.config.dialogCancellationButtonTitle = "Отмена";
	            	
	            	data.config.formSubmissionTopic = "EDIT_PROGRAMME_MEETING_PROGRAMM_TOPIC";
	            	this.alfPublish("BTL_CREATE_FORM_PROGRAMM", data, true);
	            }
           },
           
           editProgramme: function(payload) {
        	   
	           	var updateRow = {};	           		           	
	           	           		
	           	
	           	updateRow["rowId"] = payload["rowId"];
	           	updateRow["nodeRef"] = payload["nodeRef"];
	           	updateRow["prop_btl-meetingProgramm_employees-ref"] = payload["assoc_btl-meetingProgramm_employees"];
	           	updateRow["prop_btl-meetingProgramm_employees-content"] = payload["assoc_btl-meetingProgramm_employees_val"];
	           	
	           	updateRow["assoc_btl-meetingProgramm_employees_added"] = payload["assoc_btl-meetingProgramm_employees_added"];
	           	updateRow["assoc_btl-meetingProgramm_employees_removed"] = payload["assoc_btl-meetingProgramm_employees_removed"];
	           	
	           	updateRow["prop_btl-meetingProgramm_question"] = payload["prop_btl-meetingProgramm_question"];

	           	
	           	
                   
	            if (payload.nodeRef)
	           	{
		            	this.serviceXhr({
		            	    url: "/share/proxy/alfresco/api/node/"+ payload.nodeRef.replace("://", "/") +"/formprocessor",
		            	    method: "POST",
		            	    data: updateRow,
		            	    successCallback: this.grid.pqGrid( "updateRow", { rowIndx: updateRow.rowId , row: updateRow } ),
		            	    callbackScope: this
		            	  });
	           	}
               else
	           	{
	               	this.grid.pqGrid( "updateRow", { rowIndx: updateRow.rowId , row: updateRow } );
	           	}
           	
           },

            addQuestion: function (payload) {
            	
            	var _this = this;
            	 
            	var rows = [];
            	if (payload.programme) 
            	{
            		rows = payload.programme;
            	}
                else
            	{
                	rows.push( {
	                    "nodeRef": "",
	                    "prop_btl-meetingProgramm_employees-ref": payload["assoc_btl-meetingProgramm_employees"],
	                    "prop_btl-meetingProgramm_employees-content": payload["assoc_btl-meetingProgramm_employees_val"],
	                    "prop_btl-meetingProgramm_question": payload["prop_btl-meetingProgramm_question"]
	                    	});
            	}
                
                
                //Если документ существует, то сразу добавляем новых пользователей в документ
                if (this.documentNodeRef || payload.documentRef) 
                {
                    this.serviceXhr({
                        url: "/share/proxy/alfresco/meeting/create-meta",
                        method: "POST",
                        data: {
                        	nodeRef: (this.documentNodeRef)?this.documentNodeRef:payload.documentRef, 
                        	programme: rows
                        },
                        successMessage: 'Вопрос успешно добален.',
                        successCallback: this.successCallback,
                        callbackScope: this
                    });
                } else {
                	rows.forEach(function (item) {
                        _this.grid.pqGrid("addRow", {rowData: item});
                    });
                	
                }
                
                if (payload.documentRef)
            	{
                	setTimeout(this.alfPublish("PRESS_MEETING_REFRESH_PROGRAMME", true, true), 3000);
            	}
                else                	
                	this.grid.pqGrid("refreshDataAndView");

            },

            successCallback: function (response, originalRequestConfig) {  	
                if (response.items && response.items.programme) {
                    var _this = this;
                    response.items.programme.forEach(function (item) {
                        _this.grid.pqGrid("addRow", {rowData: item});
                    });
                    this.alfServicePublish(topics.DISPLAY_NOTIFICATION, {
                        message: originalRequestConfig.successMessage
                    });
                }
            },

            deleteRowSuccess: function (payload) {
                this.grid.pqGrid( "deleteRow", { rowIndx: payload.data.data.item.rowIndx } );
            },

            deleteRow: function (rowIndx, $grid) {
                
            	_rowIndx = rowIndx;
            	_grid = $grid
            	_this = this;
            	
                if (this.documentNodeRef) {
                	
                	this.serviceXhr({
                        url: "/share/proxy/alfresco/get-children-protocol?nodeRef=" + this.documentNodeRef + "&type=btl-meetingProtocol:meetingProtocolDataType",
                        method: "GET",
                        successCallback: this.deleteProgRow,
                        callbackScope: this
                    }); 
                	
                	
                    
                } else {
                    this.grid.pqGrid("deleteRow", {rowIndx: rowIndx});
                }
            },
            
            deleteProgRow: function(payload){
            	
            	var rowData = _grid.pqGrid("getRowData", {rowIndx: _rowIndx});
            	
            	for(var i = 0; i < payload.items.length; i++)
        		{
            		if (payload.items[i]["assoc_btl-meetingProtocol_question_added"].indexOf(rowData["nodeRef"]) > -1)
        			{
            			_this.alfPublish("ALF_DISPLAY_NOTIFICATION", {message: "Нельзя удалить вопрос т.к. он используется в протоколе"}, true);
            			return;
        			}
        		}
            	
            	
            	_this.alfPublish("ALF_CRUD_DELETE", {
                    requiresConfirmation: true,
                    url: "slingshot/datalists/list/node/" + rowData["nodeRef"].replace("://", "/"),
                    confirmationTitle: "Удаление вопроса",
                    responseTopic: _this.id + "DELETE_ROW",
                    noRefresh: true,
                    item: {rowIndx: _rowIndx},
                    confirmationPrompt: "Вы уверены что хотите удалить вопрос " + rowData["prop_btl-meetingProgramm_question"] + "?",
                    successMessage: "Вопрос " + rowData["prop_btl-meetingProgramm_question"] + " успешно удален."
                }, true);
                
            },
            
            onCreateFormProgramme: function (data){   
            	
            	            	
    	    	this.data = data.data;	
    	    	this.rootNodeRef = data.rootNodeRef;
    	   	    var payload = {};
        	    payload.dialogTitle = data.config.dialogTitle;
        	    //payload.contentWidth = "900px";
        	    payload.contentHeight = "320px";
        	    payload.dialogConfirmationButtonTitle = data.config.dialogConfirmationButtonTitle;
        	    payload.dialogCancellationButtonTitle = data.config.dialogCancellationButtonTitle;
        	    payload.formSubmissionTopic = data.config.formSubmissionTopic;
        	    payload.widgets = this.getWidgets();
        	  
        	  this.alfPublish("ALF_CREATE_FORM_DIALOG_REQUEST", payload, true);
    	   },
            
            getWidgets: function(){
  			   
  			   var widgets = [
  			                  {
				                    name: "btl/widgets/base/TextBox",
				                    config: {
				                        name: "prop_btl-meetingProgramm_question",
				                        value: (this.data !== null) ? this.data["prop_btl-meetingProgramm_question"] : "",
				                        label: "Вопрос",
				                        style:{
				                        },
				                        labelStyle: {
											width: "unset"
				                        }

				                    }
				                },/*
				                {
				                    name: "alfresco/html/Label",
				                    config: {
				                        label: "Докладчики:"
				                    }
				                },*/
				                {
				                    name:"meeting/forms/controlMainForm/choices/ProgrammEmployees",
				                    id: "ASSOC_BTL_MEETING_PROGRAMM_EMPLOYEES",
				                    config:{
				                    	value: (this.data !== null) ? this.data["prop_btl-meetingProgramm_employees-ref"] : "",
				                        storeId: this.storeId
				                    }
				                    
				                }
			                ];
  			   
  			 if(this.data !== null){
   			   widgets.push( {
   					name: "alfresco/forms/controls/DojoValidationTextBox",
   				      config: {
   				         name: "nodeRef",
   				         value: this.data.nodeRef,
   				         visibilityConfig: {
   				            initialValue: false
   				         }
   				      }
   				},
   				{
   					name: "alfresco/forms/controls/DojoValidationTextBox",
   				      config: {
   				         name: "rowId",
   				         value: this.data.rowId,
   				         visibilityConfig: {
   				            initialValue: false
   				         }
   				      }
   				});
   		   }
   		   else{
   			   widgets.push( {
   					name: "alfresco/forms/controls/DojoValidationTextBox",
   				      config: {
   				         name: "alf_destination",
   				         value: this.rootNodeRef,
   				         visibilityConfig: {
   				            initialValue: false
   				         }
   				      }
   				});
   		   }
   			   
   			   return widgets;
  			   
            },


        });
    });