define(["dojo/_base/declare",
        "alfresco/forms/ControlColumn",
        "dojo/_base/lang",
        "dojo/request/xhr",
        "btlExtension/windowChoiceItem/window_choice_item",
        "dijit/Dialog",
        "dojo/_base/array",
        "btl/widgets/base/TextBox",
        "btl/widgets/base/SearchBox",
        "alfresco/forms/ControlRow",
        "alfresco/lists/AlfList",
        "alfresco/lists/views/AlfListView",
        "alfresco/lists/views/layouts/Row",
        "alfresco/lists/views/layouts/Cell",
        "alfresco/renderers/PropertyLink",
        "alfresco/buttons/AlfButton",
        "alfresco/forms/controls/DojoValidationTextBox",
        "alfresco/forms/controls/TextBox",
        "btl/widgets/base/button/ChoiceButton",
        "btl/widgets/base/button/DeleteButton"
    ],
    function (declare, ControlColumn, lang, CoreXhr, choiceItem, Dialog, array) {

        return declare([ControlColumn], {

            value: null,
            item: null,
            name: "",
            single: true,
            placeHolder: "Поиск",
            header: "Выбрать",
            dataUrl: {},
            dataItemUrl: {},
            renderData: "result",
            propertyToRender: "name",
            search: true,
            widgets: [],
            oldValue: null,
            inputStyle: {width: "290px"},
            height: null,
            width: null,
            excluded: [],
            currentValues: null,
            publishTopic:null,
            title: "",
            labelText: "",
            labelButton:"...",
            requirementConfig: {initialValue: false},
            //Используется только для установки предварительного значения если, если текущего значения не существует. Например при создании нового документа, как значение по умолчанию.
            defaultValue: null,
            _isDefaultValue: false,
            loadData: false,

            cssRequirements: [{cssFile: "/share/res/extension/css/icon.css"}],

            postMixInProperties: function alfresco_forms_ItemPicker__postMixInProperties() {
                this.id = this.generateUuid();
                this.inherited(arguments);
                this.alfSubscribe(this.id + "_BTL_CHOICE_OPEN_DIALOG", lang.hitch(this, this.showChoiceDialog), true);
                this.alfSubscribe(this.id + "_BTL_BTN_CLEAN_VALUE", lang.hitch(this, this.clickBtnCleanValue), true);
                this.alfSubscribe(this.id + "_BTL_CLICK_HINT", lang.hitch(this, this.clickHint), true);
                
                this.alfSubscribe(this.id + "_BTL_CLEAN_ITEM", lang.hitch(this, this.clickClearItem), true);
                
                
                if (this.single) {
                    this.width = (this.width) ? this.width : "300";
                    this.height = (this.height) ? this.height : "22";
                } else {
                    this.width = (this.width) ? this.width : "300";
                    this.height = (this.height) ? this.height : "100";
                }
            },

            clickClearItem:function(payload){
            	
            	payload.nodeRef
            	
            	var items = [];
            	
            	for (var i = 0; i < this.widgetTextBox.currentData.items.length; i++)
        		{
            		if (this.widgetTextBox.currentData.items[i].nodeRef != payload.nodeRef)
            			items.push(this.widgetTextBox.currentData.items[i]);
        		}
            	
            	this.widgetTextBox.onDataLoadSuccess({"items":items});            	
            	this.setDelValue(payload.nodeRef);            	
            	this.widgetTextBox_values.setValue(this.getResponseContentNames(this.widgetTextBox.currentData.items, "name"));            	
            	this.currentValues = this.widgetTextBox_values.getValue();
            	this.value = this.deleteValue(this.value, payload.nodeRef);            	
            	this.nodeRefTextBox.setValue(this.value);
            	
            },
            
            deleteValue:function(value, delValue){
            	
            	var addValue = value;
            	if (addValue.indexOf(delValue) >= 0 )
        		{
            		addValue = addValue.replace("," + delValue, "");
            		addValue = addValue.replace(delValue + ",", "");
            		addValue = addValue.replace(delValue, "");            		
        		}
            	
            	return addValue;
            },
            
            setDelValue: function(delRef){
            	var delValue = this.widgetTextBox_del.getValue();
            	
            	if (delValue.indexOf(delRef) < 0)
        		{
            		if (delValue.length > 0)
            			delValue += ",";
            		
            		delValue += delRef;
        		}
            	
            	this.widgetTextBox_del.setValue(delValue);            	
            	var addValue = this.widgetTextBox_add.getValue();            	
            	this.widgetTextBox_add.setValue( this.deleteValue(addValue, delRef));
            	
            	
            },
            
            postCreate: function () {
                this.oldValue = this.value;
                 if(!this.value && this.defaultValue){
                     this.value = this.defaultValue;
                     this._isDefaultValue = true;
                }

                var _this = this;

                if (this.single) {
                    var widgetTextBox = {
                        name: "btl/widgets/base/SearchBox",
                        widthPx: (this.width) ? this.width : "300",
                        id: this.id + "_val",
                        config: {
                            style: this.inputStyle,
                            parentID: this.id,
                            name: this.name + "_val",
                            label: this.labelText,
                            url: this.urlList,
                            dataUrl: this.dataUrl,
                            requirementConfig: this.requirementConfig
                            /*disablementConfig: {
                                initialValue: true
                            }*/
                        }
                    };
                    var buttonOpenDialog = {
                        name:"btl/widgets/base/button/ChoiceButton",
                        style: "margin-left: 0px; margin-right: 0px; margin-top: 23px; margin-left: -12px;",
                        widthPx: "20",
                        config:{
                            onClick: function () {
                                _this.alfPublish(_this.id + "_BTL_CHOICE_OPEN_DIALOG", {}, true);
                            }
                        }
                    };
                } else {
                    var widgetTextBox = {
                        name: "alfresco/lists/AlfList",
                        id: this.id + "_val",
                        config: {
                        	noDataMessage:"",
                            label: this.labelText,
                            name: this.name + "_val",
                            currentData: {"items": []},
                            style: "width: " + this.width + "px; height:" + this.height + "px; border: 1px solid #d3d3d3; border-radius: 3px; overflow-y: auto; margin-bottom:10px;",
                            widgets: [{
                                name: "alfresco/lists/views/AlfListView",
                                config: {
                                    widgets: [
                                        {
                                            name: "alfresco/lists/views/layouts/Row",
                                            config: {
                                                widgets: [
                                                    {
                                                        name: "alfresco/lists/views/layouts/Cell",
                                                        config: {
                                                            widgets: [{
                                                                name: "alfresco/renderers/Property",
                                                                config: {
	                                                                    propertyToRender: "name"
	                                                                }
	                                                            },
	                                                            {
	                                                            	 name: "alfresco/renderers/PublishAction",
	                                                            	 config:{
	                                                            		 style:"float: right;",
	                                                            		 altText:"Удалить",
	                                                            		 iconClass :"delete-16",
	                                                            		 
	                                                            		 publishPayloadType: "PROCESS",
	                                                            		 publishPayloadModifiers: ["processCurrentItemTokens"],
	                                                            		 
	                                                            		 publishTopic: this.id + "_BTL_CLEAN_ITEM",
	                                                            		 publishGlobal:true,
	                                                            		 publishPayload:{nodeRef: "{nodeRef}"},
	                                                            		 
	                                                            		 
	                                                            		 
	                                                            		 
	                                                            	 }
	                                                            	 
	                                                            }
                                                            
                                                            ]
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    ]
                                }
                            }]
                        }
                    };
                    var widgetTextBox_values = {
                        name: "alfresco/forms/controls/TextBox",
                        id: this.id + "_values",
                        config: {
                            name: this.name + "_values",
                            visibilityConfig: {
                                initialValue: false
                            }
                        }
                    };
                    var buttonCleanValue = {
                        name: "alfresco/buttons/AlfButton",
                        //label: "Очистить",
                        //widthPx: "20",
                        id: this.id + "_btn_clean_value",
                        config: {
                            //iconClass: "cursor-pointer icon-delete btl-icon-16",
                            //cssRequirements: null,
                            title: "Удалить всех заместителей",
                            label: "Очистить",
                            //style: "margin-top: 21px; border: 0px; margin-left: 0px; background: transparent;margin-right: 0px",
                            style: "margin-bottom:10px;",
                            publishGlobal: true,
                            publishTopic: this.id + "_BTL_BTN_CLEAN_VALUE",
                            visibilityConfig: {
                                //initialValue: (this.value) ? true : false
                            	initialValue: false
                            }
                        }
                    };
                    var buttonOpenDialog = {
                     name: "alfresco/buttons/AlfButton",
                     id: this.id + "_btn",
                     config: {
                         label: this.labelButton,
                         style: "margin-bottom:10px;",
                         publishGlobal: true,
                         publishTopic: this.id + "_BTL_CHOICE_OPEN_DIALOG"
                     }
                     };
                }

                var widgetTextBox_add = {
                    name: "alfresco/forms/controls/TextBox",
                    id: this.id + "_added",
                    config: {
                        name: this.name + "_added",
                        visibilityConfig: {
                            initialValue: false
                        }
                    }
                };

                var widgetTextBox_del = {
                    name: "alfresco/forms/controls/TextBox",
                    id: this.id + "_removed",
                    config: {
                        name: this.name + "_removed",
                        visibilityConfig: {
                            initialValue: false
                        }
                    }
                };

                var nodeRefTextBox = {
                    name: "alfresco/forms/controls/DojoValidationTextBox",
                    id: this.id + "_",
                    config: {
                        name: this.name,
                        value: this.value,
                        requirementConfig: this.requirementConfig,
                        visibilityConfig: {
                            initialValue: false
                        }
                    }
                };





                if (this.single) {
                   /* var buttonCleanValue = {
                        name: "alfresco/buttons/AlfButton",
                        widthPx: "20",
                        id: this.id + "_btn_clean_value",
                        config: {
                            iconClass: "cursor-pointer icon-delete btl-icon-16",
                            cssRequirements: null,
                            title: "Очистить поле",
                            style: "margin-top: 21px; border: 0px; margin-left: 0px; background: transparent;margin-right: 0px",
                            publishGlobal: true,
                            publishTopic: this.id + "_BTL_BTN_CLEAN_VALUE",
                            visibilityConfig: {
                                initialValue: (this.value) ? true : false
                            }
                        }
                    };*/
                    var buttonCleanValue = {
                        name: "btl/widgets/base/button/DeleteButton",
                        widthPx: "20",
                        id: this.id + "_btn_clean_value",
                        config:{
                            onClick: function () {
                                _this.alfPublish(_this.id + "_BTL_BTN_CLEAN_VALUE", {}, true);
                            }
                        }
                    };

                    var row = {
                        name: "alfresco/forms/ControlRow",
                        config: {
                            style: "width:370px",
                            widgetMarginRight: 0,
                            widgets: [widgetTextBox, buttonOpenDialog, buttonCleanValue]
                        }
                    };
                    this.widgets = [row, nodeRefTextBox, widgetTextBox_add, widgetTextBox_del ];
                } else {
                    this.widgets = [widgetTextBox, nodeRefTextBox, widgetTextBox_add, widgetTextBox_del, buttonOpenDialog, buttonCleanValue, widgetTextBox_values];
                }

                this.inherited(arguments);

                if (this.single) {
                    this.row = this._processingWidgets[0];
                    this.widgetTextBox = this.row._processingWidgets[0];
                    this.btnCleanValue = this.row._processingWidgets[2];
                    this.btnCleanValue.setDisabled((this.value) ? false : true);
                } else {
                    this.widgetTextBox = this._processingWidgets[0];
                    this.widgetTextBox_values = this._processingWidgets[6];
                }

                this.nodeRefTextBox = this._processingWidgets[1];
                this.widgetTextBox_add = this._processingWidgets[2];
                this.widgetTextBox_del = this._processingWidgets[3];
                this.nodeRefTextBox.setValue(this.value);
                this.widgetTextBox_add.setValue(  (this._isDefaultValue) ? this.value : "");
                this.widgetTextBox_del.setValue("");

                if (this.single) {
                    this.widgetTextBox.objNodeRefTextBox = this.nodeRefTextBox;
                    this.widgetTextBox.objBtnCleanValue = this.btnCleanValue;
                }

                this.choiceItem = new Alfresco.WindowChoiceItem(this.id).setOptions({
                    header: this.header,
                    search: this.search,
                    single: this.single,
                    url: this.urlList,
                    renderData: this.renderData,
                    renderName: this.propertyToRender,
                    placeHolder: this.placeHolder,
                    dataUrl: this.dataUrl,
                    excluded: this.excluded,
                    loadData:this.loadData,
                    requirementConfig: this.requirementConfig
                });

                this.choiceItem.dialogCreate();
                this.choiceItem.setEvents();
                var _this = this;
                this.choiceItem.onOk.subscribe(function getValues() {
                    if (_this.single) {
                        if (this.getValue() == null || _this.value != this.getValue().nodeRef) {
                            _this.widgetTextBox.setValue((this.getValue() != null) ? this.getValue().name : "");
                            _this.nodeRefTextBox.setValue((this.getValue() != null) ? this.getValue().nodeRef : "");
                            _this.widgetTextBox_add.setValue((this.getValue() != null) ? this.getValue().nodeRef : "");
                            _this.widgetTextBox_del.setValue(_this.value);
                            _this.value = (this.getValue() != null) ? this.getValue().nodeRef : "";
                            if (this.getValue() == null) {
                                _this.btnCleanValue.setDisabled(true);
                                if(_this.fieldId) {                                	
	                                _this.alfPublish((_this.publishTopic)?_this.publishTopic:"_valueChangeOf_" + _this.fieldId, {
	                                    fieldId: _this.fieldId,
	                                    name: _this.name,
	                                    value: {}
	                                }, (_this.publishTopic)?true:false);
                                }
                            } else {
                                _this.btnCleanValue.setDisabled(false);
                                if(_this.fieldId){
                                	 _this.alfPublish((_this.publishTopic)?_this.publishTopic:"_valueChangeOf_" + _this.fieldId, {
                                        fieldId: _this.fieldId,
                                        name: _this.name,
                                        value: this.getValue()
                                	 }, (_this.publishTopic)?true:false);
                                }
                            }
                        }
                    } else {
                        var curVal = (this.getValuesNodeRef() != null) ? this.getValuesNodeRef().join(",") : "";
                        _this.widgetTextBox_add.setValue(curVal);
                        _this.nodeRefTextBox.setValue(curVal);
                        _this.widgetTextBox_del.setValue(_this.cleanOldValue(curVal));
                        _this.widgetTextBox.onDataLoadSuccess(_this.addManyValues(this.getValues()));
                        _this.currentValues = this.getValues();
                        _this.widgetTextBox_values.setValue((this.getValuesName() != null) ? this.getValuesName().join(","): "");
                        if(_this.fieldId) {
                        	 _this.alfPublish((_this.publishTopic)?_this.publishTopic:"_valueChangeOf_" + _this.fieldId, {
                                fieldId: _this.fieldId,
                                name: _this.name,
                                value: this.getValues()
                        	 }, (_this.publishTopic)?true:false);
                        }
                    }
                });

                this.Dialog = new Dialog({
                    content: document.getElementById(_this.id + "-dlgWinChoice"),
                    style: "width: 1000px; height: 600px"
                });

                this.setBaseValueXhr();
            },
            showChoiceDialog: function showChoiceDialog() {
            	
            	
            	if (this.disabled)
            		return;
            	
                if (this.single) {
                    if (this.widgetTextBox.getValue() && this.value) {
                        this.choiceItem.setValue(this.nodeRefTextBox.getValue(), this.widgetTextBox.getValue());
                    }else{
                        this.widgetTextBox.setValue("");
                    }
                } else {
                    if (this.widgetTextBox.currentData.items.length > 0) {
                        this.choiceItem.setValues(this.widgetTextBox.currentData.items);
                    }
                    else
                	{
                    	this.choiceItem.values = [];
                	}
                }
                this.choiceItem.dialog.show();
            },
            setBaseValueXhr: function setBaseValueXhr() {

                if (this.value) {
                    this.dataItemUrl["nodeRef"] = this.value;
                    var _this = this;
                    dojo.xhrGet({
                        url: this.itemUrl,
                        content: this.dataItemUrl,
                        handleAs: "json",
                        load: function (response) {
                            _this.setBaseValue(response);
                        }
                    });
                }
            },
            setBaseValue: function setBaseValue(response) {            
                var _this = this;
                if (this.single) {
                    this.widgetTextBox.setValue(response.item);
                } else {
                    this.widgetTextBox.onDataLoadSuccess(this.addManyValues(response.items)); //{"items":[{"nameyName": "Ссылки"},{"name": "Ссылки"}]});
                    this.choiceItem.setValues(response.items);
                    
                    this.widgetTextBox_values.setValue(this.getResponseContentNames(response.items, "name"))
                }
            },
            
            getResponseContentNames:function(data, name){
            	
            	var contentName = "";
            	for(var i=0; i<data.length; i++)
        		{
            		if (contentName.length > 0)
            			contentName += ",";
            		
            		contentName += data[i][name]
        		}
            	return contentName;
            	
            },
            
            addManyValues: function addManyValues(items) {
                if (items != null) {
                    var _this = this;
                    var data = [];
                    items.forEach(function (item) {
                        data.push({
                        			"name": item.name,
                        			"nodeRef" : item.nodeRef
                        			
                        			});
                    });
                    return {"items": data};
                }
                return {"items": []};
            },
            cleanOldValue: function cleanOldValue(currValues) {
                var toDelete = [];

                if (!currValues || currValues.length == 0)
                    return (this.value)? this.value.split(',') : [];

                // console.log(currValues);
                // console.log(this.value);
                    
                if (this.value) {
                    var oldValue = this.value.split(',');
                    if (oldValue.length > 0) {
                        oldValue.forEach(function (item) {    
                        	
                        	if (currValues.indexOf(item) < 0){
                        		toDelete.push(item);
                        	}
                        	/*
                            if (array.indexOf(currValues, item) < 0) {
                                toDelete.push(item);
                            }
                            */
                        });
                    }
                }
                // console.log(toDelete);
                
                return toDelete;
            },

            setValue: function(data){
                this.widgetTextBox.setValue((data) ? data.name : "");
                this.nodeRefTextBox.setValue((data) ? data.nodeRef : "");
                this.widgetTextBox_add.setValue((data) ? data.nodeRef : "");
                if (this.value!='') {
                    this.widgetTextBox_del.setValue(this.value);
                }
                this.value = (data) ? data.nodeRef : "";
                if (this.value == "") {
                    this.btnCleanValue.setDisabled(true);
                } else {
                    this.btnCleanValue.setDisabled(false);
                }
                if(this.fieldId) {
                	this.alfPublish((this.publishTopic)?this.publishTopic:"_valueChangeOf_" + this.fieldId, {
                        fieldId: this.fieldId,
                        name: this.name,
                        value: data
                	}, (this.publishTopic)?true:false);
                }
            },

            clickHint: function (data) {
                this.setValue(data);
            },

            setDefaultValue: function (value) {
                this.value = value;
                this.nodeRefTextBox.setValue(this.value);
                this.widgetTextBox_add.setValue(this.value);
                this.setBaseValueXhr();
            },
            clickBtnCleanValue: function clickBtnCleanValue() {

                if (this.single) {

                    this.widgetTextBox_del.setValue(this.nodeRefTextBox.getValue());

                    this.widgetTextBox.setValue("");
                    this.nodeRefTextBox.setValue("");
                    this.widgetTextBox_add.setValue("");
                    this.choiceItem.curItem = {};
                    this.choiceItem.value = {};
                    this.value = '';
                    this.btnCleanValue.setDisabled(true);
                }else{                    
                    this.nodeRefTextBox.setValue("");
                    this.widgetTextBox_add.setValue("");
                    this.widgetTextBox_values.setValue("");
                    var oldValMass = (this.oldValue) ? this.oldValue.split(',') : [] ;
                    var curValMass = (this.currentValues) ? this.currentValues.split(',') : [] ;
                    var toDeleteValue = oldValMass.concat(curValMass);
                    this.widgetTextBox_del.setValue(toDeleteValue.join(','));
                    this.currentValues = null;
                    this.choiceItem.values = {};
                    this.choiceItem.curItems = {};
                    this.widgetTextBox.onDataLoadSuccess(this.addManyValues(null));
                    this.value = '';
                }
                if(this.fieldId) {
                	 this.alfPublish((this.publishTopic)?this.publishTopic:"_valueChangeOf_" + this.fieldId, {
                        fieldId: this.fieldId,
                        name: this.name,
                        value: {}
                	 }, (this.publishTopic)?true:false);
                }
            },

            setVisible: function (isVisible) {
                this.domNode.style.display = (isVisible)? "block" : "none";
            },
            setDisable:function(isDisable){
            	this.disabled = isDisable;
            	this.btnCleanValue.setDisabled(isDisable);
            	this.widgetTextBox.textBox.setDisabled(true);
            	
            }
        });
    });