define(["dojo/_base/declare",
        "alfresco/forms/ControlColumn",
        "dojo/_base/lang",
        "alfresco/core/CoreXhr"
    ],
    function (declare, ControlColumn, lang, CoreXhr) {

        return declare([ControlColumn, CoreXhr], {

            value: null,
            item: null,
            name: "",
            textBoxValue: "",
            labelText: "",
            labelButton: "",
            labelPicker: "",
            descriptionPicker: "",
            url: "",
            itemUrl: "",
            itemsProperty: "items",
            itemKey: "nodeRef",
            propertyToRender: "item",
            availableItemsLabel: "",
            pickedItemsLabel: "",
            dialogConfirmationButtonTitle: "Выбрать",
            dialogCancellationButtonTitle: "Отменить",
            loadDataPublishTopic: "ALF_CRUD_GET_ALL",
            widgets: [],
            uid: "",
            oldValue: null,

            postMixInProperties: function alfresco_forms_ItemPicker__postMixInProperties() {
                this.inherited(arguments);
                this.uid = this.generateUuid();
                this._processingWidgets = [];

                if (this.value && lang.trim(this.value) !== "") {
                    this.value = this.message(this.value);
                }
                this.uid = this.generateUuid();

                if (this.uid && lang.trim(this.uid) !== "") {
                    this.uid = this.message(this.uid);
                }
                if (this.labelText && lang.trim(this.labelText) !== "") {
                    this.labelText = this.message(this.labelText);
                }
                if (this.labelButton && lang.trim(this.labelButton) !== "") {
                    this.labelButton = this.message(this.labelButton);
                }
                if (this.labelPicker && lang.trim(this.labelPicker) !== "") {
                    this.labelPicker = this.message(this.labelPicker);
                }
                if (this.descriptionPicker && lang.trim(this.descriptionPicker) !== "") {
                    this.descriptionPicker = this.message(this.descriptionPicker);
                }
                if (this.loadDataPublishTopic && lang.trim(this.loadDataPublishTopic) !== "") {
                    this.loadDataPublishTopic = this.message(this.loadDataPublishTopic);
                }
                if (this.url && lang.trim(this.url) !== "") {
                    this.url = this.message(this.url);
                }
                if (this.name && lang.trim(this.name) !== "") {
                    this.name = this.message(this.name);
                }
                if (this.itemUrl && lang.trim(this.itemUrl) !== "") {
                    this.itemUrl = this.message(this.itemUrl);
                }
                if (this.itemsProperty && lang.trim(this.itemsProperty) !== "") {
                    this.itemsProperty = this.message(this.itemsProperty);
                }
                if (this.itemKey && lang.trim(this.itemKey) !== "") {
                    this.itemKey = this.message(this.itemKey);
                }
                if (this.propertyToRender && lang.trim(this.propertyToRender) !== "") {
                    this.propertyToRender = this.message(this.propertyToRender);
                }
                if (this.availableItemsLabel && lang.trim(this.availableItemsLabel) !== "") {
                    this.availableItemsLabel = this.message(this.availableItemsLabel);
                }
                if (this.pickedItemsLabel && lang.trim(this.pickedItemsLabel) !== "") {
                    this.pickedItemsLabel = this.message(this.pickedItemsLabel);
                }
                if (this.dialogConfirmationButtonTitle && lang.trim(this.dialogConfirmationButtonTitle) !== "") {
                    this.dialogConfirmationButtonTitle = this.message(this.dialogConfirmationButtonTitle);
                }
                if (this.dialogCancellationButtonTitle && lang.trim(this.dialogCancellationButtonTitle) !== "") {
                    this.dialogCancellationButtonTitle = this.message(this.dialogCancellationButtonTitle);
                }


                this.alfSubscribe(this.uid + "ITEM_PICKER_SET_VALUE", lang.hitch(this, this.itemPickerSetValue), true);
                this.alfSubscribe(this.uid + "GET_VALUE_FROM_ITEM", lang.hitch(this, this.sendItemValue), true);
                this.alfLog("log", "alfresco_itemPickerSetValue____postMixInProperties", this);
            },

            postCreate: function alfresco_forms_ItemPicker__postCreate() {
                this.oldValue = this.value;

                var widgetTextBox = {
                    name: "alfresco/forms/controls/TextBox",
                    config: {
                        valueSubscriptionTopic: this.uid + "ITEM_SET_VALUE",
                        name: this.name + "_val",
                        label: this.labelText
                    }
                };

                var widgetTextBox_add = {
                    name: "alfresco/forms/controls/TextBox",
                    config: {
                        valueSubscriptionTopic: this.uid + "ITEM_SET_VALUE_ADD",
                        name: this.name + "_added",
                        visibilityConfig: {
                            initialValue: false
                        }
                    }
                };

                var widgetTextBox_del = {
                    name: "alfresco/forms/controls/TextBox",
                    config: {
                        valueSubscriptionTopic: this.uid + "ITEM_SET_VALUE_DEL",
                        name: this.name + "_removed",
                        visibilityConfig: {
                            initialValue: false
                        }
                    }
                };

                var nodeRefTextBox = {
                    name: "alfresco/forms/controls/DojoValidationTextBox",
                    config: {
                        valueSubscriptionTopic: this.pubSubScope + this.uid + "ITEM_SET_VALUE",
                        name: this.name,
                        value: this.value,
                        visibilityConfig: {
                            initialValue: false
                        }
                    }
                };

                var widgetPicker = {
                    name: "alfresco/buttons/AlfButton",
                    id: "SimplePicker",
                    config: {
                        label: this.labelButton,
                        publishTopic: "ALF_CREATE_FORM_DIALOG_REQUEST",
                        publishGlobal: true,
                        publishPayload: {
                            pubSubScope: "GROUP_USERS_",
                            cancelPublishScope: "",
                            cancelPublishTopic: "DIALOG_CANCELLED",
                            dialogId: this.pubSubScope + "PICKER_DIALOG",
                            dialogTitle: this.labelText,
                            dialogConfirmationButtonTitle: this.dialogConfirmationButtonTitle,
                            dialogCancellationButtonTitle: this.dialogCancellationButtonTitle,
                            formSubmissionTopic: this.uid + "ITEM_PICKER_SET_VALUE",
                            widgets: [
                                {
                                    name: "btl/widgets/base/btlSinglePicker",
                                    config: {
                                        pubSubScope: "",
                                        label: this.labelPicker,
                                        description: this.descriptionPicker,
                                        name: "groups",
                                        singleItemMode: true,
                                        value: [this.value],
                                        uid: this.uid,
                                        loadDataPublishTopic: this.loadDataPublishTopic,
                                        loadDataPublishPayload: {
                                            alfResponseTopic: "TEST_TOPIC",
                                            alfResponseScope: "TEST_SCOPE",
                                            url: this.url,
                                            pageSize: 0,
                                            page: false,
                                            startIndex: false
                                        },
                                        itemsProperty: this.itemsProperty,
                                        itemKey: this.itemKey,
                                        propertyToRender: this.propertyToRender,
                                        availableItemsLabel: this.availableItemsLabel,
                                        pickedItemsLabel: this.pickedItemsLabel
                                    }
                                }
                            ]
                        }
                    }
                };
                this.widgets = [widgetTextBox, widgetPicker, nodeRefTextBox, widgetTextBox_add, widgetTextBox_del];

                this.inherited(arguments);

                this.alfLog("log", "alfresco_itemPickerSetValue____postCreate", this);
                this.completeWidgetSetup();
            },

            completeWidgetSetup: function alfresco_forms_controls_ItemPicker__completeWidgetSetup() {
                this.inherited(arguments);
                this.alfLog("log", "alfresco_forms_controls_ItemPicker__completeWidgetSetup", this);
                if (this.value) {
                    this.itemPickerSetBaseValue();
                }
                else {
                    this.alfPublish(this.pubSubScope + this.uid + "ITEM_SET_VALUE", {"value": ""}, true);
                }

            },

            itemPickerSetBaseValue: function alfresco_ItemPicker__itemPickerSetBaseValue() {
                this.serviceXhr({
                    url: this.itemUrl + this.value,
                    method: "GET",
                    successCallback: this.setBaseValueItemPicker,
                    callbackScope: this
                });
            },

            setBaseValueItemPicker: function alfresco_ItemPicker__setBaseValueItemPicker(response, requestConfig) {
                this.alfLog("log", "alfresco_ItemPicker__setBaseValueItemPicker", response);
                this.alfPublish(this.pubSubScope + this.uid + "ITEM_SET_VALUE", {"value": response.item}, true);
                this.item = {};
                this.item[this.propertyToRender] = response.item;
                this.item[this.itemKey] = this.value;

            },

            itemPickerSetValue: function alfresco_ItemPicker__itemPickerSetValue(data) {
                this.alfLog("log", "alfresco_itemPickerSetValue__postMixInProperties", data);
                if (data.groups.length > 0) {
                    data.value = data.groups[0][this.propertyToRender];
                    this.alfPublish(this.pubSubScope + this.uid + "ITEM_SET_VALUE", data, true); //val
                    data.value = data.groups[0][this.itemKey];
                    this.alfPublish(this.pubSubScope + this.pubSubScope + this.uid + "ITEM_SET_VALUE", data, true);	//ref
                    if (this.oldValue != data.value) {
                        this.alfPublish(this.pubSubScope + this.uid + "ITEM_SET_VALUE_ADD", data, true);	//ref_add
                        data.value = this.oldValue;
                        this.alfPublish(this.pubSubScope + this.uid + "ITEM_SET_VALUE_DEL", data, true);//ref_del
                    }
                    this.item = {};
                    this.item[this.propertyToRender] = data.groups[0][this.propertyToRender];
                    this.item[this.itemKey] = data.groups[0][this.itemKey];
                }
                else {
                    this.alfPublish(this.pubSubScope + this.uid + "ITEM_SET_VALUE", {"value": ""}, true);
                    this.alfPublish(this.pubSubScope + this.pubSubScope + this.uid + "ITEM_SET_VALUE", {"value": ""}, true);
                    data.value = this.oldValue;
                    this.alfPublish(this.pubSubScope + this.uid + "ITEM_SET_VALUE_DEL", data, true);//ref_del
                    this.item = null;
                }

            },

            sendItemValue: function alfresco_ItemPicker_sendItemValue() {
                if (this.item !== null) {
                    this.alfPublish(this.uid + "SET_ITEM", {"item": this.item}, true);
                }
            }

        });
    });