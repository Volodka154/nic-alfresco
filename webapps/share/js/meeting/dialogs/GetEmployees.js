/**
 * Created by nabokov on 25.11.2016.
 */
define([
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dojo/_base/lang",
    "alfresco/core/Core",
    "btlExtension/windowChoiceItem/window_choice_item",
], function (declare, _WidgetBase, lang, Core, ChoiceItem) {
    return declare([_WidgetBase, Core], {

        showDialogSubscribe: "", // Слушатель события, отображения диалога выбора. Обязательно использовать разные значения если на странице несколько виджетов
        dataTopic: "", //Генератор события, отдающие выбранные данные при нажании Ok. Обязательно использовать разные значения если на странице несколько виджетов

        postMixInProperties: function alfresco_forms_ItemPicker__postMixInProperties() {
            this.inherited(arguments);
            this.alfSubscribe(this.showDialogSubscribe, lang.hitch(this, this.showChoiceDialog), true);
        },

        postCreate: function () {
            this.inherited(arguments);
            this.choiceItem = new Alfresco.WindowChoiceItem(this.id + "-btn-add-link-users").setOptions({
                header: "Выбор из справочника сотрудников:",
                single: false,
                search: true,
                url: "/share/proxy/alfresco/filters/association",
                renderData: "result",
                placeHolder: "Поиск по фамилии",
                dataUrl: {
                    "type": "btl-emp:employee-content",
                    "s_field": "btl-people:fio",
                    "field": "btl-people:fio"
                },
            });
            this.choiceItem.dialogCreate();
            this.choiceItem.setEvents();
            var _this = this;
            this.choiceItem.onOk.subscribe(function () {
                var newUsers = this.getValues();
                _this.alfPublish(_this.dataTopic, {users: newUsers}, true);
                this.curItems = {};
            });
        },

        showChoiceDialog: function (payload) {
            this.choiceItem.setValues((payload.values) ? payload.values : []);
            this.choiceItem.options.excluded = (payload.excluded)? payload.excluded : [];
            this.choiceItem.dialog.show();
        },

    });
});