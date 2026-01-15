define(["dojo/_base/declare",
        "alfresco/core/Core",
        "dojo/_base/lang",
        "btlExtension/windowChoiceItem/window_choice_item",
        "alfresco/core/CoreXhr",
        "service/constants/Default",
        "dojo/topic",
        "dijit/Dialog",
        "dojox/timing/_base"],
        function(declare, Core, lang, ChoiceItem, CoreXhr, AlfConstants,topic,Dialog,timing) {

  return declare([Core, CoreXhr], {

    constructor: function btl_FirstExecutorsService__constructor(args) {
      lang.mixin(this, args);
      //this.alfSubscribe("BTL_CREATE_FIRST_EXECUTORS", lang.hitch(this, this.createFirstExecutors));
      //this.alfSubscribe("BTL_CREATE_FORM_FIRST_EXECUTORS", lang.hitch(this, this.onCreateFormFirstExecutors));
    },
    createFirstExecutors: function alfresco_createFirstExecutors__getWidgets(payload){
        this.alfLog("log", "alfresco_createFirstExecutors__getWidgets", payload);

       this.serviceXhr({
            url: "/share/proxy/alfresco/api/node/"+ payload.newFirstExecutor.replace("://", "/") +"/formprocessor",
            method: "POST",
            data: {"prop_btl-people_rank": payload["prop_btl-people_rank"]},
            successCallback: this.successAddFirstExecutor,
            failureCallback: this.failureAddFirstExecutor,
            callbackScope: this
       });
    },

    successAddFirstExecutor: function alfresco_successAddFirstExecutor(response, originalRequestConfig){
                topic.publish("ALF_DISPLAY_NOTIFICATION", {  message: "Добавлен новый первый исполнитель."});
                timer = new timing.Timer(5000); // interval in ms
                timer.onTick = function () {
                    timer.stop(); // stop the timer.
                    require(["dojo/topic"], function(topic){
                        topic.publish("DATAGRID_REFRESH_DATA");
                    });
                }

               timer.start();
    },

    failureAddFirstExecutor: function alfresco_successAddFirstExecutor(response, originalRequestConfig){
                    var response = response;
                    failureDialog = new Dialog({
                            title: "Ошибка при добавление первого исполнителя!",
                            content: response.message,
                            style: "width: 300px"
                        });
                    failureDialog.show();

    },

    onCreateFormFirstExecutors: function alfresco_onCreateFormFirstExecutors(data){
    		   	  this.alfLog("log", "alfresco_onCreateFormFirstExecutors", data);

    		   	/*  this.data = data.data;

    		   	  var payload = {};

    	    	  payload.dialogTitle = data.config.dialogTitle;
    	    	  payload.dialogConfirmationButtonTitle = data.config.dialogConfirmationButtonTitle;
    	    	  payload.dialogCancellationButtonTitle = data.config.dialogCancellationButtonTitle;
    	    	  payload.formSubmissionTopic = data.config.formSubmissionTopic;
    	    	  payload.contentWidth = "550px";
    	    	  payload.dialogId = "FORM_FIRST_EXECUTOR";
    	    	  payload.widgets = this.getWidgets();

    	    	  this.alfLog("log", "alfresco_onCreateFormFirstExecutors", payload);
    	    	  this.alfPublish("ALF_CREATE_FORM_DIALOG_REQUEST", payload);*/
    	   },

    getWidgets: function alfresco_formFirstExecutors__getWidgets(){
     var widgets = [ ];

    var rank = {
         name: "btl/widgets/base/TextBox",
         config: {
            label:  "Ранг",
            name: "prop_btl-people_rank",
            style:{width: "250px"},
            value: (this.data !== null) ? this.data.rank : "",
            validationConfig: [
                 {
                     validation: "regex",
                     regex: "(^$|(\\d{1,5}))",
                     errorMessage: "Только цифры"
                 }
            ]
         }
     };

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

     var refToEmployee = {
     				   name:"btl/widgets/base/ItemPicker",
     				   config:{
     					   name: "newFirstExecutor",
     					   value: "",
     					   labelText: "Справочник сотрудников",
     					   labelButton: "...",
     					   labelPicker: "Выбрать",
     					   pickedItemsLabel: "Текущая",
     					   availableItemsLabel:"Доступные",
     					   propertyToRender:"name",
     					   itemsProperty: "items",
     					   url: "filters/resource-executor?extra=!ASPECT:\"btl-people:firstExecutor\"",
     					   itemUrl: "/share/proxy/alfresco/picker/associationItem?type=btl-emp:employee-content&field=btl-people:fio&nodeRef="
     					}
     			};
     var mainWidget = { name: "alfresco/forms/ControlColumn",
     					 config: {
     					        widgets: [ ]
     					 }};
     mainWidget.config.widgets.push(refToEmployee, rank);
     widgets.push(mainWidget);
     return widgets;
    }
  });
});