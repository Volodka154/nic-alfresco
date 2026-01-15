/**
 * Created by nabokov on 23.11.2016.
 */
define(["dojo/_base/declare",
        "../../../grids/_Grid",
        "dojo/_base/lang",
        "meeting/utils/base",
        "alfresco/core/CoreXhr",
        "alfresco/core/topics",
        "jquery"
    ],
    function (declare, DataGrid, lang, utilBase, CoreXhr, topics, $) {
        return declare([DataGrid], {
            state: "",
            documentNodeRef: null,
            Url: "get-children-user",
            loadData: false,
            clearInvitatCount:0,
            type: "btl-meetingParticipant:meetingParticipantDataType",
            pageModel: {location : "remote", rPP: 10, strRpp: "{0}", rPPOptions: [10, 25, 50]},
            colModel: [
                {title: "nodeRef",
                    width: 100,
                    dataType: "string",
                    dataIndx: "nodeRef",
                    hidden: true},
                {
                    title: "nodeRefEmployee",
                    width: 100,
                    dataType: "string",
                    dataIndx: "prop_btl-meetingParticipant_emp-ref",
                    hidden: true
                },
                {
                    title: "Сотрудник",
                    width: 170,
                    dataType: "string",
                    dataIndx: "prop_btl-meetingParticipant_emp-content"
                },
                {title: "Приглашение",
                    width: 150,
                    dataType: "string",
                    dataIndx: "prop_btl-meetingParticipant_invite"},
                {
                    title: "Отсутствовал", width: 80, dataIndx: "prop_btl-meetingParticipant_absence",
                    render: function (ui) {
                        var checkboxId = ui.rowIndx + '_' + Math.random().toString(36).substr(2, 9) + '_checkbox';
                        var isChecked = (ui.cellData)? 'checked' : '';
                        return '<div class="checkbox">' +
                                '<input type="checkbox" id="' + checkboxId + '" '  + isChecked + ' >'+
                               '<label for="' + checkboxId + '"></label></div>';
                    }
                },
                {
                    title: "", width: 20,
                    render: function (ui) {
                        return '<div style="margin: 0 auto; width: 24px;">' +
                            '<button type="button" title="Удалить" class="delete-btn" role="button">'
                            + '<span class="delete-btn-icon"></span>'
                            + '</button></div>';
                    }
                }
            ],

            postMixInProperties: function () {
                this.inherited(arguments);
                
                
                var store = utilBase.getStoreById("MEETING_STORE");	                
                handleAlfSubscribe = store.handleAlfSubscribe;   
                
                handleAlfSubscribe.push(this.alfSubscribe("USERS_PANE_MAIN_FORM_MEETING_SHOW", lang.hitch(this, this.showData), true));
                handleAlfSubscribe.push(this.alfSubscribe("ADD_USERS_MEETING_GET_USERS", lang.hitch(this, this.addUsers), true));
                handleAlfSubscribe.push(this.alfSubscribe("CHANGE_STATE_MEETING_DOCUMENT", lang.hitch(this, this.setState), true));                
                handleAlfSubscribe.push(this.alfSubscribe("PRESS_MEETING_CLEAR_USERS_INVITE", lang.hitch(this, this.clearInvitatUsers), true));
                handleAlfSubscribe.push(this.alfSubscribe("PRESS_MEETING_CLEAR_USERS_INVITE_ALL", lang.hitch(this, this.clearInvitatAllUsers), true));                                                              
                handleAlfSubscribe.push(this.alfSubscribe("PRESS_MEETING_REFRESH_USERS", lang.hitch(this, this.refreshUsers), true));
                handleAlfSubscribe.push(this.alfSubscribe(this.id + "DELETE_ROW__SUCCESS", lang.hitch(this, this.deleteRowSuccess), true));
                
                if (!this.state && this.storeId) {
                    var store = utilBase.getStoreById(this.storeId);
                    if (store.document) {
                        this.documentNodeRef = store.nodeRef;
                        this.rootNodeRef = this.documentNodeRef;
                        this.loadData = true;
                    }
                }
            },

            refreshUsers: function(){
            	this.loadDataDataGrid({nodeRef: this.documentNodeRef});
            },
            
            postCreate: function () {
                                              
                
                var _this = this;
                this.inherited(arguments);

                //use refresh & refreshRow events to display jQueryUI buttons and bind events.
                this.grid.on('pqgridrefresh pqgridrefreshrow', function () {
                    var $grid = $(this);

                    //delete button
                    var deleteButtons = $grid.find("button.delete-btn");
                    
                    if (!_this.documentNodeRef || _this._disabled) {
                    	deleteButtons.css("display", "none");
                    }
                    
                    deleteButtons.unbind("click")
                        .bind("click", function (evt) {
                            var $tr = $(this).closest("tr"),
                                rowIndx = $grid.pqGrid("getRowIndx", {$tr: $tr}).rowIndx;
                            // console.log("rowIndx = " + rowIndx);
                           
                            	_this.deleteRow(rowIndx, $grid);
                        });

                    //absence checkbox
                    var absenceCheckboxes = $grid.find(".checkbox input[type=checkbox]");
                    //Если документ не существует, то блокируем
                    if (!_this.documentNodeRef || _this._disabled) {
                        //absenceCheckboxes.attr("disabled", true);
                    	
                    	absenceCheckboxes.change(function() {
                    		$(this)[0].checked = !$(this)[0].checked;              	            
                    	    });
                    	
                        
                    }
                    else
                	{
	                    absenceCheckboxes.unbind("click").bind("click",function (event) {
	                        var $tr = $(this).closest("tr"),
	                        rowIndx = $grid.pqGrid("getRowIndx", {$tr: $tr}).rowIndx;                        
	                        _this.editRow(rowIndx, $grid, this.checked);
	                        
	                        
	                        
	                    });
                	}
                });
            },
            
            clearInvitatAllUsers:function(){
            	var data = this.grid.pqGrid("getData", { dataIndx: ['nodeRef', 'prop_btl-meetingParticipant_invite', 'prop_btl-meetingParticipant_emp-content'] });
            	
            	this.clearInvitatCount = 0;
            	for (var i=0; i < data.length; i++)
        		{
            		var row = data[i];
            		this.clearInvitatRow(row);
        		}
            },
            
            clearInvitatRow:function(row){
            	var invite = row["prop_btl-meetingParticipant_invite"];
        		if (invite && invite != "Ожидает повторную отправку" && invite != "Ожидает решения" )
        		{	 
        			this.clearInvitatCount++;
        			 this.serviceXhr({
                         url: "/share/proxy/alfresco/api/node/" +  row.nodeRef.replace("://", "/") + "/formprocessor",
                         method: "POST",
                         data: {
                        	 "prop_btl-meetingParticipant_invite" : "Ожидает повторную отправку"
                         },
                         successCallback: this.successClearInvitatRow,
                         callbackScope: this
                     });	        			 
        		}
            },
            
            successClearInvitatRow: function(){
            	this.clearInvitatCount--;
            	if (this.clearInvitatCount == 0)
        		{
            		this.alfPublish("PRESS_MEETING_REFRESH_USERS", true, true)
        		}
            },
            
            clearInvitatUsers: function(){
            	var arr = this.grid.pqGrid("selection", { type: 'row', method: 'getSelection' });
            	this.clearInvitatCount = 0;
            	var refresh = false;
	            if (arr && arr.length > 0) {
	            	for(var i=0; i<arr.length; i++)
            		{
	            		var row = arr[i].rowData;	            		
	            		this.clearInvitatRow(row);            		
            		}
	            }
	            
	            
	            
            },

            deleteRow: function (rowIndx, $grid) {
                //Если документ существует, то сразу добавляем новых пользователей в документ
                if (this.documentNodeRef) {
                    var rowData = $grid.pqGrid("getRowData", {rowIndx: rowIndx}); 
                    
                    if (rowData["prop_btl-meetingParticipant_invite"] == "Ожидает решения")
                	{
                    	this.alfPublish("ALF_DISPLAY_NOTIFICATION", {message: "Данному участнику направлено задание приглашения. Удалить его нельзя."}, true);
                    	return;
                	}
                    
                    this.alfPublish("ALF_CRUD_DELETE", {
                        requiresConfirmation: true,
                        url: "slingshot/datalists/list/node/" + rowData["nodeRef"].replace("://", "/"),
                        confirmationTitle: "Удаление участника",
                        responseTopic: this.id + "DELETE_ROW",
                        noRefresh: true,
                        item: {rowIndx: rowIndx},
                        confirmationPrompt: "Вы уверены что хотите удалить участника " + rowData["prop_btl-meetingParticipant_emp-content"] + "?",
                        successMessage: "Участник " + rowData["prop_btl-meetingParticipant_emp-content"] + " успешно удален."
                    }, true);
                }else{
                    this.grid.pqGrid( "deleteRow", { rowIndx: rowIndx } );
                }
            },

            editRow: function (rowIndx, $grid, checked) {
            	if (this.documentNodeRef) {
            		var rowData = $grid.pqGrid("getRowData", {rowIndx: rowIndx});
            		
            		
            		this.serviceXhr({
                        url: "/share/proxy/alfresco/api/node/" +  rowData.nodeRef.replace("://", "/") + "/formprocessor",
                        method: "POST",
                        data: {
                       	 "prop_btl-meetingParticipant_absence" : checked
                        },
                        callbackScope: this
                    });
            		
            		
            	}
            },

            addUsers: function (payload) {
            	
            	
                if (payload.users) {
                    var _this = this;
                    var rows = [];
                    payload.users.forEach(function (item) {
                        rows.push({
                            "nodeRef": "",
                            "prop_btl-meetingParticipant_emp-ref": item["nodeRef"],
                            "prop_btl-meetingParticipant_emp-content": item["name"],
                            "prop_btl-meetingParticipant_invite": "",
                            "prop_btl-meetingParticipant_absence": false
                        })
                    });

                    //Если документ существует, то сразу добавляем новых пользователей в документ
                    if (this.documentNodeRef || payload.documentRef)
                    {
                        this.serviceXhr({
                            url: "/share/proxy/alfresco/meeting/create-meta",
                            method: "POST",
                            data: {
                            	nodeRef: (this.documentNodeRef)?this.documentNodeRef : payload.documentRef, 
                            	users: rows
                            },
                            successCallback: this.successCallback,
                            callbackScope: this
                        });
                    } else {
                        rows.forEach(function (item) {
                            _this.grid.pqGrid("addRow", {rowData: item});
                        });
                    }
                }   
                if (payload.documentRef)
            	{
                	setTimeout(this.alfPublish("PRESS_MEETING_REFRESH_USERS", true, true), 3000);
            	}
                else                	
                	this.grid.pqGrid("refreshDataAndView");
            },

            successCallback: function (response, originalRequestConfig) {
                if (response.items && response.items.users) {
                    var _this = this;
                    response.items.users.forEach(function (item) {
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

            setState: function (payload) {
                this.state = payload.state;
                if (payload.nodeRef) {
                    this.documentNodeRef = payload.nodeRef;
                }
                this.grid.pqGrid("refreshDataAndView");
            },

        });
    });