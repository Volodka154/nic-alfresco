/**
 * Created by nabokov on 21.11.2016.
 */
define(["dojo/_base/declare",
        "alfresco/services/BaseService",
        "dojo/_base/lang",
        "meeting/utils/base",
        "alfresco/core/CoreXhr",
        "alfresco/dialogs/AlfDialog",
        "alfresco/core/topics",
    ],
    function (declare, BaseService, lang, utilBase, CoreXhr, AlfDialog, topics) {
        return declare([BaseService, CoreXhr], {
            idFormTabMeeting: "TAB_MEETING",
            idGridUsersTabMeeting: "USERS_GRID_MAIN_FORM_MEETING",
            idGridProgrammeTabMeeting: "PROGRAMME_GRID_MAIN_FORM_MEETING",
            idGridProtocolTabMeeting: "PROTOCOL_GRID_MAIN_FORM_MEETING",
            idStoreMeeting: "MEETING_STORE",
            idRoomControl: "MEETING_ROOM_CONTROL",
            confirmationRequired: false,


            constructor: function (args) {
                lang.mixin(this, args);

                this.alfSubscribe("CANCEL_MEETING_EVENT", lang.hitch(this, this.cancelMeeting));
                this.alfSubscribe("CREATE_MEETING_EVENT", lang.hitch(this, this.createMeeting));
                this.alfSubscribe("UPDATE_MEETING_EVENT", lang.hitch(this, this.updateMeeting));
                this.alfSubscribe("UPDATE_AND_CLOSE_MEETING_EVENT", lang.hitch(this, this.updateAndCloseMeeting));

                this.alfSubscribe("MEETING_CREATE_PROTOCOL", lang.hitch(this, this.createProtocol));


                this.alfSubscribe("MEETING_CANCEL_NEGOTIATION", lang.hitch(this, this.cancelNegotiation));
                this.alfSubscribe("MEETING_CANCEL_SIGNER", lang.hitch(this, this.cancelSigner));

                this.alfSubscribe("MEETING_TO_NEGOTIATION", lang.hitch(this, this.toNegotiation));
                this.alfSubscribe("MEETING_SEND_TO_EXECUTE_EVENT", lang.hitch(this, this.toExecute));
                this.alfSubscribe("MEETING_SEND_ROUTE_EVENT", lang.hitch(this, this.sendRoutEvent));
                this.alfSubscribe("MEETING_TO_REGISTER_EVENT", lang.hitch(this, this.toRegisterEvent));
                this.alfSubscribe("MEETING_REGISTER_AND_SEND_TO_EXECUTE", lang.hitch(this, this.toRegisterAndExecuteEvent));
                this.alfSubscribe("MEETING_TO_ARCHIVE", lang.hitch(this, this.toArchive));
                this.alfSubscribe("MEETING_SEND_INVITATION", lang.hitch(this, this.sendInvitation));
                this.alfSubscribe("MEETING_COMPLETE_CREATE", lang.hitch(this, this.completeCreate));
                this.alfSubscribe("MEETING_SELECT_ROOM", lang.hitch(this, this.selectRoom), true);
                this.alfSubscribe("MEETING_CANCEL_CONFIRM_ROOM", lang.hitch(this, this.cancelConfirmRoom), true);

                ___this = this;

            },


            createProtocol: function () {

                var store = utilBase.getStoreById(this.idStoreMeeting);
                this.serviceXhr({
                    url: "/share/proxy/alfresco/meeting/createProtocol?documentNodeRef=" + store.nodeRef,
                    method: "GET",
                    successCallback: this.createProtocolSus,
                    callbackScope: this
                });

            },

            createProtocolSus: function (payload) {
                // console.log(payload);
                if (payload.result == "successful") {
                    this.alfPublish("ALF_DISPLAY_NOTIFICATION", {message: "Протокол сформирован. Обновите список вложений"}, true);
                } else if (payload.result) {
                    this.alfPublish("ALF_DISPLAY_NOTIFICATION", {message: payload.result}, true);
                }

            },


            cancelConfirmRoom: function () {

                var store = utilBase.getStoreById(this.idStoreMeeting);
                this.serviceXhr({
                    url: "/share/proxy/alfresco/workflow/cancel-workflow?processName=activiti$meetingSelectRoom&packageNodeRef=" + store.nodeRef,
                    method: "GET",
                    successCallback: this.cancelConfirmRoomSussess,
                    callbackScope: this
                });

            },

            cancelConfirmRoomSussess: function () {
                this.alfPublish("CHANGE_MEETING_LOCATION", {name: "", nodeRef: ""}, true);
                this.setState("Черновик");
            },

            toArchive: function () {
                this.setState("В архиве");
            },

            setState: function (stateName, callBack, noUpdate) {

                this.alfPublish("CHANGE_MEETING_STATE_CONTROL", stateName);


                var valueMeeting = utilBase.getFormValuesById(this.idFormTabMeeting);
                __this = this;
                __valueMeeting = valueMeeting;
                __valueMeeting["prop_btl-meeting_state"] = stateName;
                __setSate = function () {

                    __this.alfPublish("UPDATE_SORE", {
                        nodeRef: __this.documentNodeRef,
                        Callback: function () {
                            __this.alfPublish("CHANGE_STATE_MEETING_DOCUMENT", {state: stateName});
                        }
                    }, true);


                }


                if (!noUpdate) {
                    this.updateMeeting({stateName: stateName, callBack: __setSate});
                } else {
                    __setSate();
                }
            },
            selectRoom: function (payload) {
                if (payload["prop_calendar"]) {
                    this.alfPublish("CHANGE_MEETING_START_DATE", payload["prop_calendar"].startTime, true);
                    this.alfPublish("CHANGE_MEETING_END_DATE", payload["prop_calendar"].endTime, true);
                    this.alfPublish("CHANGE_MEETING_LOCATION", {
                        name: payload["prop_calendar"].roomContent,
                        nodeRef: payload["prop_calendar"].room
                    }, true);

                    this.clearInviteUsers();

                    if (payload["prop_calendar"].roomObject.confirmationRequired) {

                        _payload = payload;

                        this.updateMeeting({callBack: this.createTaskSelectRoom});


                    }


                }
            },

            createTaskSelectRoom: function () {
                _this = this;
                this.selectRoomPropCalendar = _payload["prop_calendar"];
                var store = utilBase.getStoreById(this.idStoreMeeting);
                this.serviceXhr({
                    url: "/share/proxy/alfresco/api/workflow/activiti%24meetingSelectRoom/formprocessor",
                    method: "POST",
                    data: {
                        "assoc_packageItems_added": store.nodeRef,
                        "assoc_btl-meetingWF_room_added": _payload["prop_calendar"].room
                    },
                    successCallback: this.sendmeetingSelectRoomSussess,
                    failureCallback: function () {
                        _this.alfPublish("ALF_DISPLAY_PROMPT", {message: "При формировании задания подтверждения переговорной произошла ошибка. Повторите запрос позже или обратитесь к администратору. Без подтверждения данной переговорной нельзя завершить подготовку мероприятия."}, true)
                    },
                    callbackScope: this
                });
            },


            clearInviteUsers: function () {
                var programms = utilBase.getFormValuesById(this.idGridProgrammeTabMeeting);

                isquery = false;
                for (var i = 0; i < programms.length; i++) {
                    var programme = programms[i];
                    var invite = programme["prop_btl-meetingParticipant_invite"];
                    if (invite && invite != "Ожидает повторную отправку" && invite != "Ожидает решения") {
                        isquery = true;
                        break;
                    }

                }

                if (isquery) {
                    var payloadForm = {};
                    payloadForm.dialogTitle = "Сбросить результаты приглашений?";
                    payloadForm.dialogConfirmationButtonTitle = "Да";
                    payloadForm.dialogCancellationButtonTitle = "Нет";
                    payloadForm.formSubmissionTopic = "PRESS_MEETING_CLEAR_USERS_INVITE_ALL";
                    payloadForm.widgets = [];

                    this.alfPublish("ALF_CREATE_FORM_DIALOG_REQUEST", payloadForm, true);
                }
            },

            sendmeetingSelectRoomSussess: function () {

                this.setState("Подтверждение переговорной");
                this.alfPublish("ALF_DISPLAY_PROMPT", {message: "Задание на подтверждение переговорной отправлено"}, true);

            },


            createMeetingRequest: function (valueMeeting) {
                var requestData = {};
                requestData["type"] = "btl-meeting:meetingDataType";
                requestData["alf_destination"] = valueMeeting["alf_destination"];
                requestData["data"] = valueMeeting;

                this.serviceXhr({
                    url: "/share/proxy/alfresco/createNode",
                    method: "POST",
                    data: requestData,
                    successCallback: this.addMetaMeeting,
                    //successMessage: 'Документ "Мероприятие" успешно создан.',
                    callbackScope: this
                });
            },

            //Действие создание документа Мероприятие
            createMeeting: function (payload) {
                var valueMeeting = utilBase.getFormValuesById(this.idFormTabMeeting);
                if (!valueMeeting) {
                    return false;
                }


                this.alfPublish("CREATE_MEETING_BUTTON_DISABLE", null, true);


                if (!valueMeeting["prop_btl-meeting_regDate"])
                    valueMeeting["prop_btl-meeting_regDate"] = "";

                if (!valueMeeting["prop_btl-meeting_endDate"])
                    valueMeeting["prop_btl-meeting_endDate"] = "";

                if (!valueMeeting["prop_btl-meeting_startDate"])
                    valueMeeting["prop_btl-meeting_startDate"] = "";

                if (valueMeeting["assoc_btl-meeting_room"]) {
                    valueMeeting["assoc_btl-meeting_room_added"] = valueMeeting["assoc_btl-meeting_room"];

                    _valueMeeting = valueMeeting;
                    this.serviceXhr({
                        url: "/share/proxy/alfresco/meeting/meeting-room-info?nodeRef=" + valueMeeting["assoc_btl-meeting_room"],
                        method: "GET",
                        successCallback: this.romInfoSus,
                        callbackScope: this
                    });

                } else {
                    this.createMeetingRequest(valueMeeting);
                }
            },


            romInfoSus: function (payload) {
                if (payload.confirmationRequired) {
                    this.confirmationRequired = true;
                    _valueMeeting["prop_btl-meeting_state"] = "Подтверждение переговорной";
                }

                this.createMeetingRequest(_valueMeeting);

            },

            //После создания документа Мероприятие добавляем в него участников
            addMetaMeeting: function (response, originalRequestConfig) {
                //this.alfPublish("CHANGE_STATE_MEETING_DOCUMENT", {nodeRef: response.persistedObject, state: "Черновик"});
                //console.log(response);
                this.documentNodeRef = response.result;

                var stateObj = {foo: "bar"};
                history.pushState(stateObj, document.title, "meeting-rooms?nodeRef=" + this.documentNodeRef);

                /*
                var users = utilBase.getFormValuesById(this.idGridUsersTabMeeting);                                
                var usersPayload = [];  
                usersPayload.documentRef = response.persistedObject;
                usersPayload.users = [];
                for(var i=0; i<users.length; i++)
            	{
                	var user = users[i];
                	usersPayload.users.push({
                		"name" : user["prop_btl-meetingParticipant_emp-content"],
                		"nodeRef" : user["prop_btl-meetingParticipant_emp-ref"]
                	});         	
            	}
                if (usersPayload.users.length > 0)
                	this.alfPublish("MEETING_GET_USERS",usersPayload, true); 
                
                var programms = utilBase.getFormValuesById(this.idGridProgrammeTabMeeting); 
                
               
                var programmePayload = {};
                programmePayload.programme = [];
            	programmePayload.documentRef = response.persistedObject;  
                
                for(var i=0; i<programms.length; i++)
            	{
                	var programme = programms[i]; 
                	 programmePayload.programme.push({
	                	 "prop_btl-meetingProgramm_employees-ref" : programme["prop_btl-meetingProgramm_employees-ref"],
	                	 "prop_btl-meetingProgramm_employees-content": programme["prop_btl-meetingProgramm_employees-content"],
	                	 "prop_btl-meetingProgramm_question": programme["prop_btl-meetingProgramm_question"]
                	 });                		                	             	
            	}
                
                if (programmePayload.programme.length > 0)
                	this.alfPublish("ADD_QUESTION_MEETING_PROGRAMM_TOPIC",programmePayload, true);   
                
                            
                
                
                //добавляем протоколы
                var protocols = utilBase.getFormValuesById(this.idGridProtocolTabMeeting);                                
                for(var i=0; i<protocols.length; i++)
            	{
                	var protocol = protocols[i];
                	protocol.documentNodeRef = response.persistedObject;
                	protocol.rowId = i;
                	this.alfPublish("ADD_PROTOCOL_MEETING_PROGRAMM_TOPIC",protocol, true);                	
            	}
                */

                var valueMeeting = utilBase.getFormValuesById(this.idFormTabMeeting);
                if (valueMeeting["assoc_btl-meeting_room"]) {
                    this.addMetaMeetingRoomSus();

                } else {
                    __this = this;
                    __valueMeeting = valueMeeting;
                    this.alfPublish("UPDATE_SORE", {
                        nodeRef: this.documentNodeRef,
                        Callback: function () {
                            __this.setState(__valueMeeting["prop_btl-meeting_state"], null, true)
                        }
                    }, true);

                }


            },

            addMetaMeetingRoomSus: function () {

                var valueMeeting = utilBase.getFormValuesById(this.idFormTabMeeting);
                __this = this;
                __valueMeeting = valueMeeting;

                if (this.confirmationRequired) {
                    this.serviceXhr({
                        url: "/share/proxy/alfresco/api/workflow/activiti%24meetingSelectRoom/formprocessor",
                        method: "POST",
                        data: {
                            "assoc_packageItems_added": this.documentNodeRef,
                            "assoc_btl-meetingWF_room_added": valueMeeting["assoc_btl-meeting_room"]
                        },
                        successCallback: this.sendmeetingSelectRoomSussessAfterCreate,
                        callbackScope: this
                    });
                } else {

                    this.alfPublish("UPDATE_SORE", {
                        nodeRef: this.documentNodeRef,
                        Callback: function () {
                            __this.setState(__valueMeeting["prop_btl-meeting_state"])
                        }
                    }, true);
                }
            },


            sendmeetingSelectRoomSussessAfterCreate: function () {
                //this.setState("Подтверждение переговорной");
                this.alfPublish("ALF_DISPLAY_PROMPT", {message: "Задание на подтверждение переговорной отправлено"}, true);


                this.alfPublish("UPDATE_SORE", {
                    nodeRef: this.documentNodeRef,
                    Callback: function () {
                        __this.setState(__valueMeeting["prop_btl-meeting_state"])
                    }
                }, true);

            },


            updateAndCloseMeeting: function () {
                this._close = true;
                this.updateMeeting();
            },


            cancelMeeting: function () {

                // console.log("222222222");
                var store = utilBase.getStoreById("MEETING_STORE");
                if (store.redirect) {
                    window.location.replace(store.redirect);
                } else {
                    if (window.parent.document != document) {
                        if (typeof window.parent.document.frameCancel == "function") {
                            window.parent.document.frameCancel();
                            return;
                        }
                    }
                    window.location.replace("/share");
                }


            },

            updateMeeting: function (state) {
                var valueMeeting = utilBase.getFormValuesById(this.idFormTabMeeting);

                if (!valueMeeting["prop_btl-meeting_regDate"])
                    valueMeeting["prop_btl-meeting_regDate"] = "";

                if (!valueMeeting["prop_btl-meeting_endDate"])
                    valueMeeting["prop_btl-meeting_endDate"] = "";

                if (!valueMeeting["prop_btl-meeting_startDate"])
                    valueMeeting["prop_btl-meeting_startDate"] = "";

                if (state && state.stateName) {
                    valueMeeting["prop_btl-meeting_state"] = state.stateName;
                }

                var store = utilBase.getStoreById(this.idStoreMeeting);

                if (store.nodeRef)
                    this.documentNodeRef = store.nodeRef;

                if (this.documentNodeRef) {

                    var requestData = {};
                    requestData["nodeRef"] = this.documentNodeRef
                    requestData["data"] = valueMeeting;

                    this.serviceXhr({
                        url: "/share/proxy/alfresco/updateNode",
                        method: "POST",
                        data: requestData,
                        successCallback: (state && state.callBack) ? state.callBack : this.updateForm,
                        successMessage: 'Документ успешно сохранен.',
                        callbackScope: this
                    });
                } else {
                    console.error("Не найден nodeRef документа для обновления");
                }
            },

            updateForm: function (response, originalRequestConfig) {


                this.alfServicePublish(topics.DISPLAY_NOTIFICATION, {
                    message: originalRequestConfig.successMessage
                });

                if (this._close) {
                    if (window.parent.document != document) {
                        if (typeof window.parent.document.frameSave == "function") {
                            window.parent.document.frameSave();
                        }
                    } else {
                        window.location.replace("/share");
                    }
                } else {
                    this.alfPublish("PRESS_MEETING_REFRESH_USERS", null, true);

                }

            },

            // Действие отправить по маршруту
            sendRoutEvent: function (payload) {
                this.alfPublish("CHANGE_STATE_MEETING_DOCUMENT", {state: "На исполнении"});
                var value = utilBase.getFormValuesById(this.idFormTabMeeting);
            },

            isHasProtokol: function (CallBack) {

                var store = utilBase.getStoreById(this.idStoreMeeting);

                this.serviceXhr({
                    url: "/share/proxy/alfresco/get-children-protocol?nodeRef=" + store.nodeRef + "&type=btl-meetingProtocol:meetingProtocolDataType",
                    method: "GET",
                    successCallback: this.isHasProtokolSus,
                    hasProtocolCallBack: CallBack,
                    _this: this,
                    callbackScope: this
                });

                return false;

            },

            isHasProtokolSus: function (data, request) {
                if (data.items.length > 0) {
                    request.hasProtocolCallBack(request._this);
                } else {
                    request._this.alfPublish("ALF_DISPLAY_NOTIFICATION", {message: "Не заполнен протокол"}, true);
                }
            },

            //Действие зарегистрировать
            toRegisterEvent: function (payload) {

                this.isHasProtokol(this.registrte);

            },

            registrte: function (_this) {

                _this.serviceXhr({
                    url: "/share/proxy/alfresco/filters/association?type=btl-regJournal:regJournalData&s_field=name&field=name&filter=doctype:5",
                    method: "GET",
                    successCallback: _this.registerJoyrnalGet,
                    callbackScope: _this
                });
            },

            registerJoyrnalGet: function (payload) {
                if (payload.result && payload.result.length > 0) {
                    var store = utilBase.getStoreById(this.idStoreMeeting);
                    this.serviceXhr({
                        url: "/share/proxy/alfresco/action/registrateDoc?nodeRef=" + store.nodeRef + "&regJournalRef=" + payload.result[0].nodeRef + "&prop_btl-documentwf_shtamp=false",
                        method: "GET",
                        successCallback: this.registrateSusses,
                        callbackScope: this
                    });
                } else {
                    this.alfPublish("ALF_DISPLAY_NOTIFICATION", {message: "Не найден журнал регистрации"}, true);
                }
            },

            registrateSusses: function (payload) {
                // console.log(payload.number);
                if (this.runToExecute) {
                    if (payload.number) {
                        this.alfPublish("CHANGE_STATE_MEETING_DOCUMENT", {state: "Зарегистрирован"});
                        this.alfPublish("CHANGE_MEETING_REGNUMBER_CONTROL", payload.number, true);
                        this.execute(this);
                    }
                } else {
                    this.alfPublish("CHANGE_MEETING_REGNUMBER_CONTROL", payload.number, true);
                    this.setState("Зарегистрирован");
                }

            },

            toRegisterAndExecuteEvent: function () {
                console.log("click registerAndExecute sending=" + ___this.getSendingToExecute());
                if (!___this.getSendingToExecute()) {
                    ___this.setSendingToExecute(true);
                    console.log("set sending=" + ___this.getSendingToExecute());
                    ___this.toRegisterAndExecute(___this);
                }
            },

            toRegisterAndExecute: function (_this) {
                var store = utilBase.getStoreById(_this.idStoreMeeting);
                Alfresco.util.Ajax.request({
                    url: "/share/proxy/alfresco/get-children-protocol?nodeRef=" + store.nodeRef + "&type=btl-meetingProtocol:meetingProtocolDataType",
                    successCallback: {
                        fn: function (__res) {
                            console.log("protocol.len=" + __res.json.items.length);
                            if (__res.json.items.length > 0) {
                                Alfresco.util.Ajax.request({
                                    url: "/share/proxy/alfresco/filters/association?type=btl-regJournal:regJournalData&s_field=name&field=name&filter=doctype:5",
                                    successCallback: {
                                        fn: function (res) {
                                            console.log("regJournal " + Boolean(res.json.result) + " len=" + res.json.result.length);
                                            if (res.json.result && res.json.result.length > 0) {
                                                Alfresco.util.Ajax.request({
                                                    url: "/share/proxy/alfresco/action/registrateAndExecuteDoc?nodeRef=" + store.nodeRef + "&regJournalRef=" + res.json.result[0].nodeRef + "&prop_btl-documentwf_shtamp=false",
                                                    successCallback: {
                                                        fn: function (_res) {
                                                            _this.setState("На исполнении");

                                                            console.log("registrateAndExecuteDoc completed");
                                                            var thisSetSendingToExecute = _this.setSendingToExecute;
                                                            setTimeout(function () {
                                                                thisSetSendingToExecute(false);
                                                            }, 1000);
                                                        }
                                                    },
                                                    failureCallback: {
                                                        fn: function (_res) {
                                                            console.log("registrateAndExecuteDoc failure");
                                                            if (_res.serverResponse.status === 500) {
                                                                var json = Alfresco.util.parseJSON(_res.serverResponse.responseText);
                                                                Alfresco.util.PopupManager.displayPrompt({
                                                                    title: "Ошибка!",
                                                                    text: json.message
                                                                });
                                                            }

                                                            var thisSetSendingToExecute = _this.setSendingToExecute;
                                                            setTimeout(function () {
                                                                thisSetSendingToExecute(false);
                                                            }, 1000);
                                                        },
                                                        scope: _this
                                                    },
                                                    scope: _this,
                                                    execScripts: true
                                                });
                                            } else {
                                                _this.alfPublish("ALF_DISPLAY_NOTIFICATION", {message: "Не найден журнал регистрации"}, true);

                                                var thisSetSendingToExecute = _this.setSendingToExecute;
                                                setTimeout(function () {
                                                    thisSetSendingToExecute(false);
                                                }, 1000);
                                            }
                                        }
                                    },
                                    failureCallback: {
                                        fn: function (res) {
                                            console.log("failureCallback2 " + res.serverResponse.status);
                                            if (res.serverResponse.status === 500) {
                                                var json = Alfresco.util.parseJSON(res.serverResponse.responseText);
                                                Alfresco.util.PopupManager.displayPrompt({
                                                    title: "Ошибка!",
                                                    text: json.message
                                                });
                                            }

                                            var thisSetSendingToExecute = _this.setSendingToExecute;
                                            setTimeout(function () {
                                                thisSetSendingToExecute(false);
                                            }, 1000);
                                        },
                                        scope: _this
                                    },
                                    scope: _this,
                                    execScripts: true
                                });
                            } else {
                                _this.alfPublish("ALF_DISPLAY_NOTIFICATION", {message: "Не заполнен протокол"}, true);

                                var thisSetSendingToExecute = _this.setSendingToExecute;
                                setTimeout(function () {
                                    thisSetSendingToExecute(false);
                                }, 1000);
                            }
                        }
                    },
                    failureCallback: {
                        fn: function (_res) {
                            console.log("failureCallback1 " + _res.serverResponse.status);
                            if (_res.serverResponse.status === 500) {
                                var json = Alfresco.util.parseJSON(_res.serverResponse.responseText);
                                Alfresco.util.PopupManager.displayPrompt({
                                    title: "Ошибка!",
                                    text: json.message
                                });
                            }

                            var thisSetSendingToExecute = _this.setSendingToExecute;
                            setTimeout(function () {
                                thisSetSendingToExecute(false);
                            }, 1000);
                        },
                        scope: _this
                    },
                    scope: _this,
                    execScripts: true
                });

            },
            sendingToExecute: false,
            setSendingToExecute: function (value) {
                ___this.sendingToExecute = value;
            },
            getSendingToExecute: function () {
                return ___this.sendingToExecute;
            },
            toExecute: function () {
                if (!___this.getSendingToExecute()) {
                    ___this.isHasProtokol(___this.execute);
                }
            },
            execute: function (_this) {
                _this.setSendingToExecute(true);
                var store = utilBase.getStoreById(_this.idStoreMeeting);
                _this.serviceXhr({
                    url: "/share/proxy/alfresco/meeting/meeting-create-task",
                    method: "POST",
                    data: {
                        "nodeRef": store.nodeRef
                    },
                    successCallback: _this.toExecuteSusses,
                    callbackScope: _this
                });
            },

            toExecuteSusses: function () {
                this.setState("На исполнении");
                var thisSetSendingToExecute = this.setSendingToExecute;
                setTimeout(function () {
                    thisSetSendingToExecute(false);
                }, 1000);
            },
            sendingInvitation: false,
            setSendingInvitation: function (value) {
                this.sendingInvitation = value;
            },
            getSendingInvitation: function () {
                return this.sendingInvitation;
            },
            //Действие отправить приглашение
            sendInvitation: function (payload) {

                var store = utilBase.getStoreById(this.idStoreMeeting);

                if (payload.items) {
                    if (payload.items.length == 0) {
                        this.alfServicePublish(topics.DISPLAY_NOTIFICATION, {message: 'Не заполнен раздел "Программа". Приглашения не разосланы'});
                        return;
                    }
                } else {
                    var programms = utilBase.getFormValuesById(this.idGridProgrammeTabMeeting);

                    if (programms.length == 0) {
                        this.serviceXhr({
                            url: "/share/proxy/alfresco/get-children?nodeRef=" + store.nodeRef + "&type=btl-meetingProgramm:meetingProgrammDataType",
                            method: "GET",
                            successCallback: this.sendInvitation,
                            callbackScope: this
                        });
                        return;
                    }
                }

                if(!this.getSendingInvitation()) {
                    Alfresco.util.Ajax.jsonGet({
                        url: Alfresco.constants.PROXY_URI + "getting/get-meeting-participants?nodeRef=" + store.nodeRef,
                        successCallback:{
                            fn: function(res){
                                var users;
                                if (res.json != null) {
                                    users = res.json.participants;
                                } else {
                                    var respText = JSON.parse(res.serverResponse.responseText);
                                    users = respText.participants;
                                }
                                if (users && users.length > 0) {
                                    var hasReadyUser = false;
                                    for (var i = 0; i < users.length; i++) {
                                        var user = users[i];
                                        if (!user["prop_btl-meetingParticipant_invite"] || user["prop_btl-meetingParticipant_invite"] == "Ожидает повторную отправку") {
                                            hasReadyUser = true;
                                            break;
                                        }
                                    }

                                    if (hasReadyUser && !this.getSendingInvitation()) {
                                        this.setSendingInvitation(true);
                                        this.serviceXhr({
                                            url: "/share/proxy/alfresco/api/workflow/activiti%24meetingInvite/formprocessor",
                                            method: "POST",
                                            data: {
                                                "assoc_packageItems_added": store.nodeRef
                                            },
                                            successCallback: this.sendInvitationSuccess,
                                            callbackScope: this
                                        });
                                    } else {
                                        this.alfServicePublish(topics.DISPLAY_NOTIFICATION, {message: "Всем участникам уже отправлены приглашения"});
                                    }
                                } else {
                                    this.alfServicePublish(topics.DISPLAY_NOTIFICATION, {message: "Не указаны участники"});
                                }
                            },
                            scope: this
                        }
                    });
                }
            },
            sendInvitationSuccess: function () {
                this.alfServicePublish(topics.DISPLAY_NOTIFICATION, {message: "Приглашения разосланы"});

                var thisAlfPublish = this.alfPublish;
                var thisSetSendingInvitation = this.setSendingInvitation;

                setTimeout(function () {
                    thisAlfPublish("PRESS_MEETING_REFRESH_USERS", true, true);
                    thisSetSendingInvitation(false);
                }, 3000);
            },


            completeCreate: function () {


                var store = utilBase.getStoreById(this.idStoreMeeting);
                if (store.nodeRef) {

                    var valueMeeting = utilBase.getFormValuesById(this.idFormTabMeeting);
                    if (!valueMeeting["assoc_btl-meeting_room"] && !valueMeeting["assoc_btl-meeting_room_added"]) {
                        this.alfPublish("ALF_DISPLAY_NOTIFICATION", {message: "Не указано место проведения"}, true);
                        return;
                    }

                    if (!valueMeeting["assoc_btl-meeting_secretary"] && !valueMeeting["assoc_btl-meeting_secretary_added"]) {
                        this.alfPublish("ALF_DISPLAY_NOTIFICATION", {message: "Не указан секретарь"}, true);
                        return;
                    }

                    if (!valueMeeting["assoc_btl-meeting_chairman"] && !valueMeeting["assoc_btl-meeting_chairman"]) {
                        this.alfPublish("ALF_DISPLAY_NOTIFICATION", {message: "Не указан председатель"}, true);
                        return;
                    }
                    _state = store.state
                    this.serviceXhr({
                        url: "/share/proxy/alfresco/meeting/meeting-room-info?nodeRef=" + valueMeeting["assoc_btl-meeting_room"],
                        method: "GET",
                        successCallback: this.roomInfoCompleteSus,
                        callbackScope: this
                    });

                } else {
                    console.error("Не найден nodeRef документа для обновления");
                }
            },

            roomInfoCompleteSus: function (payload) {

                if (payload.confirmationRequired && _state != "Переговорная подтверждена") {
                    this.alfPublish("ALF_DISPLAY_NOTIFICATION", {message: "Не получено подтверждение переговорной"}, true);
                } else {
                    this.toPreparedGetUsers();
                }


            },

            toPreparedGetUsers: function () {

                var store = utilBase.getStoreById(this.idStoreMeeting);

                this.serviceXhr({
                    url: "/share/proxy/alfresco/get-children-user?nodeRef=" + store.nodeRef + "&type=btl-meetingParticipant:meetingParticipantDataType",
                    method: "GET",
                    successCallback: this.toPrepared,
                    callbackScope: this
                });


            },

            toPrepared: function (payload) {
                var valueMeeting = utilBase.getFormValuesById(this.idFormTabMeeting);

                var users = utilBase.getFormValuesById(this.idGridUsersTabMeeting);
                var usersPayload = [];
                for (var i = 0; i < payload.items.length; i++) {
                    var user = payload.items[i];
                    if (valueMeeting["assoc_btl-meeting_chairman"] != user["prop_btl-meetingParticipant_emp-ref"])
                        usersPayload.push(user["prop_btl-meetingParticipant_emp-ref"]);
                }


                if (usersPayload.length > 0) {
                    var store = utilBase.getStoreById(this.idStoreMeeting);

                    _this = this;

                    this.serviceXhr({
                        url: "/share/proxy/alfresco/negotiation/set-negotiation-list-info",
                        method: "POST",
                        data: {
                            documentNodeRef: store.nodeRef,
                            duration: 2,
                            levelName: "Согласование",
                            negotiationLevelNodeRef: "",
                            negotiators: usersPayload,
                            processType: "0",
                            type: "0",
                            signer: valueMeeting["assoc_btl-meeting_chairman"],
                            useDocSigner: true
                        },
                        successCallback: function () {
                            _this.setState("Подготовлен")
                        },
                        callbackScope: this
                    });
                } else {
                    this.setState("Подготовлен");
                }
            },

            toNegotiation: function () {

                this.isHasProtokol(this.negotiation);
            },

            negotiation: function (_this) {

                var store = utilBase.getStoreById(_this.idStoreMeeting);
                __this = _this
                Alfresco.util.Ajax.request(
                    {
                        url: "/share/proxy/alfresco/workflow/start-workflow?processName=activiti$Negotiation&packageNodeRef=" + store.nodeRef,
                        successCallback: {
                            fn: function (res) {
                                __this.cancelMeeting();
                            }
                        },

                        successMessage: "Согласование запущено",
                        failureCallback: {
                            fn: function (res) {
                                if (res.serverResponse.status === 500) {
                                    var json = Alfresco.util.parseJSON(res.serverResponse.responseText);
                                    Alfresco.util.PopupManager.displayPrompt({
                                        title: "Ошибка!",
                                        text: json.message
                                    });
                                }
                            },
                            scope: _this
                        },
                        scope: _this,
                        execScripts: true
                    });
            },

            cancelNegotiation: function () {
                var store = utilBase.getStoreById(this.idStoreMeeting);
                _this = this;
                Alfresco.util.Ajax.request(
                    {
                        url: "/share/proxy/alfresco/workflow/cancel-workflow?processName=activiti$Negotiation&packageNodeRef=" + store.nodeRef,
                        successCallback: {
                            fn: function (res) {
                                _this.setState("На доработке");
                            }
                        },
                        successMessage: "Согласование прервано",
                        failureCallback: {
                            fn: function (res) {
                                if (res.serverResponse.status === 500) {
                                    var json = Alfresco.util.parseJSON(res.serverResponse.responseText);
                                    Alfresco.util.PopupManager.displayPrompt({
                                        title: "Ошибка!",
                                        text: json.message
                                    });
                                }
                            },
                            scope: this
                        },
                        scope: this,
                        execScripts: true
                    });
            },

            cancelSigner: function () {
                var store = utilBase.getStoreById(this.idStoreMeeting);
                _this = this;
                Alfresco.util.Ajax.request(
                    {
                        url: "/share/proxy/alfresco/workflow/cancel-workflow?processName=activiti$Signing&packageNodeRef=" + store.nodeRef,
                        successCallback: {
                            fn: function (res) {
                                _this.setState("На доработке");
                            }
                        },
                        successMessage: "Подписание прервано",
                        failureCallback: {
                            fn: function (res) {
                                if (res.serverResponse.status === 500) {
                                    var json = Alfresco.util.parseJSON(res.serverResponse.responseText);
                                    Alfresco.util.PopupManager.displayPrompt({
                                        title: "Ошибка!",
                                        text: json.message
                                    });
                                }
                            },
                            scope: this
                        },
                        scope: this,
                        execScripts: true
                    });
            }


        });
    });