define(["dojo/_base/declare",
        "btl/widgets/base/DataGrid",
        "dojo/_base/lang",
        "alfresco/core/CoreXhr",
        "dojo/topic",
        "dijit/Dialog",
        "dojox/widget/Standby",
        "loading"],
        function(declare, DataGrid, lang, CoreXhr,topic,Dialog,Standby,loading) {
   return declare([DataGrid, CoreXhr], {

	   title: "Список сотрудников",
	   Url: "search/employee",
	   colModel: [ ],
       filterModel: { on: true, mode: "AND", header: true },
       pageModel: { type: "local", rPP: 500, strRpp: "{0}" , rPPOptions:[100, 250, 500] },
       notActual: null, // отобразить всех сотрудников
	   type: "employee",
       toolbar: {
          /* items: [
               { type: 'button', icon: 'ui-icon-refresh', label: 'Очистить', listeners: [
                   { "click": function (evt, ui) {
                       $("input[name='surname']").val("");
                   }
                   }
               ]
               }
           ]*/
       },
       standby:null,

       setEventsDataGrid: function alfresco_DataGrid__setEventsDataGrid(){
            var _this = this;
            this.grid.pqGrid({
                rowDblClick: function( event, ui ) {
                    _this.getEmployeeData();
                }
            });
            //window.employeeDG = this.grid;
       },

	   postMixInProperties: function alfresco_ContactPersonDataGrid__postMixInProperties() {
		      this.inherited(arguments);

		      /*if (!this._standby) {
                  this._standby = new Standby({
                    target: this.domNode
                  });
                  dojo.body().appendChild(this._standby.domNode);
              }*/

		      this.alfSubscribe("DATAGRID_DELETE_EMLPOYEE", lang.hitch(this, this.deleteEmployee), true);
		      this.alfSubscribe("DATAGRID_GET_EMLPOYEE_DATA", lang.hitch(this, this.getEmployeeData), true);
		      this.alfSubscribe("SINC_EMLPOYEE_DATA", lang.hitch(this, this.sincEmployeeData), true);
	   },

	   deleteEmployee: function alfresco_EmployeeDataGrid__deleteEmployee(){
        	 var arr = this.grid.pqGrid("selection", { type: 'row', method: 'getSelection' });
        	 if (arr && arr.length > 0) {
        		 var row = arr[0].rowData;
        		 var payload = {};

        		 payload.requiresConfirmation = true;
        		 payload.confirmationTitle = "Удаление сотрудника";
        		 payload.confirmationPrompt = "Вы действительно хотите удалить: " + row.surname +" " + row.firstname +" ?";
        		 payload.nodeRef = row.nodeRef;
        		 payload.responseTopic = "BTL_SING_REMOVE_EMPLOYEE";

        		 this.alfPublish("BTL_MSG_DELETE_DIALOG", payload, true);

        		 this.alfLog("log", "alfresco_EmployeeDataGrid__deleteEmployee", row);
        	 }
		 },

	   getEmployeeData: function alfresco_EmployeeDataGrid__getEmployeeData(){
				var arr = this.grid.pqGrid("selection", { type: 'row', method: 'getSelection' });
	            if (arr && arr.length > 0) {
	            	var row = arr[0].rowData;
	            	var item = {};
	            	item.config = {};
	            	item.data = row;
	            	item.data.rowId = arr[0].rowIndx;
	            	item.config.dialogTitle = "formEmployee.title";
	            	item.config.dialogConfirmationButtonTitle = "edit.title";
	            	item.config.dialogCancellationButtonTitle = "cancel.title";
	            	item.config.formSubmissionTopic = "BTL_EDIT_EMPLOYEE";
	            	this.alfPublish("BTL_CREATE_FORM_EMPLOYEE", item, true);
	            }
	   },
	   sincEmployeeData: function alfresco_EmployeeDataGrid__sincEmployeeData(){

                $.LoadingOverlay("show");
	            this.serviceXhr({
                    url: "/share/proxy/alfresco/events/synchronization-employees" ,
                    method: "GET",
                    successCallback: this.sincEmployeeDataSuccess,
                    failureCallback: this.sincEmployeeDataFailure,
                    callbackScope: this
                });
	   },
       /*
       addToResourceSincEmployee : function alfresco_EmployeeDataGrid__addToResourceSincEmployee(response, originalRequestConfig) {
                if(response.status == 200){
                    this.serviceXhr({
                        url: "/share/proxy/alfresco/projects/create-main-resources" ,
                        method: "GET",
                        successCallback: this.sincEmployeeDataSuccess,
                        failureCallback: this.sincEmployeeDataFailure,
                        callbackScope: this
                    });
                }
       },
       */
	   sincEmployeeDataSuccess: function alfresco_EmployeeDataGrid__sincEmployeeDataSuccess(response, originalRequestConfig) {

	            $.LoadingOverlay("hide");
	            if (response.employeeNoFam.length > 0)
            	{
	            	employeeNoFam = "";
	            	for (var i=0; i< response.employeeNoFam.length; i++)
            		{
	            		employeeNoFam += "<p>"+response.employeeNoFam[i] + "<\/p>";
            		}

					require(["dojo/_base/xhr", "btlUI/Dialog/UserNotFamDialog", "dojo/domReady!"], function (xhr, notificationDialog) {

						var dialog = new notificationDialog();


						dialog.addNotificationToForm({
							"content":   "<p><strong>Синхронизация успешно завершилась. Есть пользователи, у которых не указана фамилия:<\/strong><\/p>" +employeeNoFam
						}, 1);

						dialog.show();




					})


	            /*	topic.publish("ALF_DISPLAY_PROMPT", {  message: "<p>dslkfjklds;fjk<\/p><p>dslkfjklds;fjk<\/p>"});*/
            	}
	            else
            	{
	            	topic.publish("ALF_DISPLAY_NOTIFICATION", {  message: "Синхронизация успешно завершилась"});
            	}
	            this.loadDataDataGrid({nodeRef: this.rootNodeRef});



	   },

	   sincEmployeeDataFailure: function alfresco_EmployeeDataGrid__sincEmployeeDataFailure(response, originalRequestConfig) {
               $.LoadingOverlay("hide");

               var response = response;
                        failureDialog = new Dialog({
                                title: "Ошибка синхронизации",
                                content: response.message,
                                style: "width: 300px"
                            });
                        failureDialog.show();
	   }

   });
});