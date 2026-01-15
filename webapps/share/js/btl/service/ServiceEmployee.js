define(["dojo/_base/declare",
        "alfresco/core/Core",
        "dojo/_base/lang",
        "alfresco/core/CoreXhr",
        "service/constants/Default"],
        function(declare, Core, lang, CoreXhr, AlfConstants) {

  return declare([Core, CoreXhr], {
	  
    newEmlpoyee: {}, 

    constructor: function btl_EmployeeService__constructor(args) {
      lang.mixin(this, args);
      this.alfSubscribe("BTL_CREATE_EMPLOYEE", lang.hitch(this, this.createEmployee));
      this.alfSubscribe("BTL_EDIT_EMPLOYEE", lang.hitch(this, this.editEmployee));
      this.alfSubscribe("BTL_CREATE_FORM_EMPLOYEE", lang.hitch(this, this.onCreateFormEmployee));
      this.alfSubscribe("BTL_SING_REMOVE_EMPLOYEE", lang.hitch(this, this.signRemoveEmployee));
    },
    
    createEmployee: function btl_EmployeeService__createEmployee(payload) {
    	this.alfLog("log", "btl_EmployeeService__createEmployee", payload);
    	
    	this.newEmlpoyee.firstname = payload["prop_btl-people_firstname"];
    	this.newEmlpoyee.middlename = payload["prop_btl-people_middlename"];
    	this.newEmlpoyee.surname = payload["prop_btl-people_surname"];
    	//this.newEmlpoyee.position = payload["prop_btl-emp_position"];
    	this.newEmlpoyee.position_val = payload["assoc_btl-emp_position_val"];
    	this.newEmlpoyee.position_ref = payload["assoc_btl-emp_position"];
    	this.newEmlpoyee.department_val = payload["assoc_btl-emp_department_val"];
    	this.newEmlpoyee.department_ref = payload["assoc_btl-emp_department"];
    	this.newEmlpoyee.director_val = payload["assoc_btl-emp_director_val"];
    	this.newEmlpoyee.director_ref = payload["assoc_btl-emp_director"];
    	this.newEmlpoyee.user_alfresco_val = payload["assoc_btl-people_user_alfresco_val"];
    	this.newEmlpoyee.user_alfresco_ref = payload["assoc_btl-people_user_alfresco"];
    	this.newEmlpoyee.phone = payload["prop_btl-people_phone"];
    	this.newEmlpoyee.fax = payload["prop_btl-people_fax"];
    	this.newEmlpoyee.tabnum = payload["prop_btl-emp_tabnum"];
    	this.newEmlpoyee.information = payload["prop_btl-people_information"];
    	this.newEmlpoyee.not_email_notify = payload["prop_btl-people_not_email_notify"];
    	this.newEmlpoyee.notActual = payload["prop_btl-people_notActual"];
    	this.newEmlpoyee.nextTaskAutoOpen = payload["prop_btl-people_nextTaskAutoOpen"];
    	this.newEmlpoyee.email = payload["prop_btl-people_email"];
    	this.newEmlpoyee.sex = payload["prop_btl-people_sex"];
    	this.newEmlpoyee.mobile = payload["prop_btl-people_mobile"];
    	this.newEmlpoyee.user_alfresco = payload["prop_btl-people_user_alfresco"];
    	this.newEmlpoyee.delegates_val = payload["assoc_btl-emp_delegates_val"];
        this.newEmlpoyee.delegates_ref = payload["assoc_btl-emp_delegates"];

    	this.serviceXhr({
    	    url: "/share/proxy/alfresco/api/type/btl-emp%3aemployee-content/formprocessor",
    	    method: "POST",
    	    data: {
    	         "alf_destination": payload.alf_destination,
    	         "prop_btl-people_firstname": payload["prop_btl-people_firstname"],
    	         "prop_btl-people_middlename": payload["prop_btl-people_middlename"],
    	         "prop_btl-people_surname": payload["prop_btl-people_surname"],
    	         "prop_btl-people_sex": payload["prop_btl-people_sex"],
    	         "prop_btl-people_birthdate": payload["prop_btl-people_birthdate"],
    	         //"prop_btl-emp_position": payload["prop_btl-emp_position"],
    	         "assoc_btl-emp_position_added": payload["assoc_btl-emp_position_added"],
       	         "assoc_btl-emp_position_removed": payload["assoc_btl-emp_position_removed"],
       	         "assoc_btl-emp_department_added": payload["assoc_btl-emp_department_added"],
    	         "assoc_btl-emp_department_removed": payload["assoc_btl-emp_department_removed"],
    	         "assoc_btl-emp_director_added": payload["assoc_btl-emp_director_added"],
    	         "assoc_btl-emp_director_removed": payload["assoc_btl-emp_director_removed"],
    	         "assoc_btl-people_user_alfresco_added": payload["assoc_btl-people_user_alfresco_added"],
    	         "assoc_btl-people_user_alfresco_removed": payload["assoc_btl-people_user_alfresco_removed"],
    	         "prop_btl-people_phone": payload["prop_btl-people_phone"],
    	         "prop_btl-people_mobile": payload["prop_btl-people_mobile"],
    	         "prop_btl-people_fax": payload["prop_btl-people_fax"],
    	         "prop_btl-people_email": payload["prop_btl-people_email"],
    	         "prop_btl-emp_tabnum": payload["prop_btl-emp_tabnum"],
    	         "prop_btl-people_information": payload["prop_btl-people_information"],
    	         "prop_btl-people_not_email_notify": payload["prop_btl-people_not_email_notify"],
    	         "prop_btl-people_notActual": payload["prop_btl-people_notActual"],
    	         "prop_btl-people_nextTaskAutoOpen": payload["prop_btl-people_nextTaskAutoOpen"],
    	         "assoc_btl-emp_delegates_added": payload["assoc_btl-emp_delegates_added"],
                 "assoc_btl-emp_delegates_removed": payload["assoc_btl-emp_delegates_removed"]
    	      },
    	    successCallback: this.updateEmployeeGrid,
    	    callbackScope: this
    	  });
    	},
    	
    updateEmployeeGrid: function btl_EmployeeService__updateEmployeeGrid(response, originalRequestConfig){
    	this.newEmlpoyee.nodeRef = response.persistedObject;
    	
    	this.alfPublish("DATAGRID_ADD_ROW",{
    		nodeRef: this.newEmlpoyee.nodeRef,
    		firstname: this.newEmlpoyee.firstname,
    		middlename:	 this.newEmlpoyee.middlename,
    		surname: this.newEmlpoyee.surname,
    		//position: this.newEmlpoyee.position,
    		position_val: this.newEmlpoyee.position_val,
    		position_ref: this.newEmlpoyee.position_ref,
    		department_val: this.newEmlpoyee.department_val,
    		department_ref: this.newEmlpoyee.department_ref,
    		director_val: this.newEmlpoyee.director_val,
    		director_ref: this.newEmlpoyee.director_ref,
    		user_alfresco_val: this.newEmlpoyee.user_alfresco_val,
    		user_alfresco_ref: this.newEmlpoyee.user_alfresco_ref,
    		phone: this.newEmlpoyee.phone,
    		fax: this.newEmlpoyee.fax,
    		email: this.newEmlpoyee.email,
    		tabnum: this.newEmlpoyee.tabnum,
    		information: this.newEmlpoyee.information,
    		close_choice: this.newEmlpoyee.close_choice,
    		dataIndx: this.newEmlpoyee.dataIndx,
    		user_alfresco: this.newEmlpoyee.user_alfresco,
    		sex: this.newEmlpoyee.sex,
    		mobile: this.newEmlpoyee.mobile,
    		notActual: this.newEmlpoyee.notActual,
    		not_email_notify: this.newEmlpoyee.not_email_notify,
    		delegates_val: this.newEmlpoyee.delegates_val,
            delegates_ref: this.newEmlpoyee.delegates_ref
    	});
    },
    
    editEmployee: function btl_EmployeeService__editEmployee(payload) {
    	
    	this.alfLog("log", "btl_EmployeeService__editEmployee", payload);
    	
    	this.newEmlpoyee.rowId = payload["rowId"];
    	this.newEmlpoyee.firstname = payload["prop_btl-people_firstname"];
    	this.newEmlpoyee.middlename = payload["prop_btl-people_middlename"];
    	this.newEmlpoyee.surname = payload["prop_btl-people_surname"];
    	//this.newEmlpoyee.position = payload["prop_btl-emp_position"];
    	this.newEmlpoyee.position_val = payload["assoc_btl-emp_position_val"];
    	this.newEmlpoyee.position_ref = payload["assoc_btl-emp_position"];
    	this.newEmlpoyee.department_val = payload["assoc_btl-emp_department_val"];
    	this.newEmlpoyee.department_ref = payload["assoc_btl-emp_department"];
    	this.newEmlpoyee.director_val = payload["assoc_btl-emp_director_val"];
    	this.newEmlpoyee.director_ref = payload["assoc_btl-emp_director"];
    	this.newEmlpoyee.user_alfresco_val = payload["assoc_btl-people_user_alfresco_val"];
    	this.newEmlpoyee.user_alfresco_ref = payload["assoc_btl-people_user_alfresco"];
    	this.newEmlpoyee.phone = payload["prop_btl-people_phone"];
    	this.newEmlpoyee.fax = payload["prop_btl-people_fax"];
    	this.newEmlpoyee.tabnum = payload["prop_btl-emp_tabnum"];
    	this.newEmlpoyee.information = payload["prop_btl-people_information"];
    	this.newEmlpoyee.close_choice = payload["prop_btl-emp_close_choice"];
    	this.newEmlpoyee.email = payload["prop_btl-people_email"];
    	this.newEmlpoyee.sex = payload["prop_btl-people_sex"]
    	this.newEmlpoyee.mobile = payload["prop_btl-people_mobile"]
    	this.newEmlpoyee.user_alfresco = payload["prop_btl-people_user_alfresco"];
    	this.newEmlpoyee.do_not_show_in_the_selection = payload["prop_btl-emp_do_not_show_in_the_selection"];
        this.newEmlpoyee.notActual = payload["prop_btl-people_notActual"];
        this.newEmlpoyee.nextTaskAutoOpen = payload["prop_btl-people_nextTaskAutoOpen"];
    	this.newEmlpoyee.not_email_notify = payload["prop_btl-people_not_email_notify"];
    	this.newEmlpoyee.delegates_val = payload["assoc_btl-emp_delegates_val"];
        this.newEmlpoyee.delegates_ref = payload["assoc_btl-emp_delegates"];
    	
    	this.serviceXhr({
    	    url: "/share/proxy/alfresco/api/node/"+ payload.nodeRef.replace("://", "/") +"/formprocessor",
    	    method: "POST",
    	    data: {
   	         "prop_btl-people_firstname": payload["prop_btl-people_firstname"],
   	         "prop_btl-people_middlename": payload["prop_btl-people_middlename"],
   	         "prop_btl-people_surname": payload["prop_btl-people_surname"],
   	          //"prop_btl-emp_position": payload["prop_btl-emp_position"],
   	         "assoc_btl-emp_position_added": payload["assoc_btl-emp_position_added"],
   	         "assoc_btl-emp_position_removed": payload["assoc_btl-emp_position_removed"],
   	         "assoc_btl-emp_department_added": payload["assoc_btl-emp_department_added"],
	         "assoc_btl-emp_department_removed": payload["assoc_btl-emp_department_removed"],
	         "assoc_btl-emp_director_added": payload["assoc_btl-emp_director_added"],
	         "assoc_btl-emp_director_removed": payload["assoc_btl-emp_director_removed"],
	         "assoc_btl-people_user_alfresco_added": payload["assoc_btl-people_user_alfresco_added"],
	         "assoc_btl-people_user_alfresco_removed": payload["assoc_btl-people_user_alfresco_removed"],
   	         "prop_btl-people_phone": payload["prop_btl-people_phone"],
   	         "prop_btl-people_fax": payload["prop_btl-people_fax"],
   	         "prop_btl-emp_tabnum": payload["prop_btl-emp_tabnum"],
   	         "prop_btl-people_information": payload["prop_btl-people_information"],
   	         "prop_btl-emp_close_choice": payload["prop_btl-emp_close_choice"],
   	         "prop_btl-people_email": payload["prop_btl-people_email"],	
   	         "prop_btl-people_sex": payload["prop_btl-people_sex"],
   	         "prop_btl-people_mobile": payload["prop_btl-people_mobile"],   	         
   	         "prop_btl-people_user_alfresco": payload["prop_btl-people_user_alfresco"],
             "prop_btl-emp_close_choice": payload["prop_btl-close_choice"],
             "prop_btl-people_notActual": payload["prop_btl-people_notActual"],
             "prop_btl-people_nextTaskAutoOpen": payload["prop_btl-people_nextTaskAutoOpen"],
             "prop_btl-people_not_email_notify": payload["prop_btl-people_not_email_notify"],
             "assoc_btl-emp_delegates_added": payload["assoc_btl-emp_delegates_added"],
             "assoc_btl-emp_delegates_removed": payload["assoc_btl-emp_delegates_removed"]
   	      },
    	    successCallback: this.alfPublish("DATAGRID_EDIT_ROW", this.newEmlpoyee),
    	    callbackScope: this
    	  });
    },
    
	   onCreateFormEmployee: function alfresco_formEmployee__onCreateFormEmployee(data){
		   	  this.alfLog("log", "alfresco_formEmployee__onCreateFormEmployee", data);
		   
		   	  this.data = data.data;
		   	 
		   	  this.rootNodeRef = data.rootNodeRef;
		   	  var payload = {};    	  
	    	  
	    	  payload.dialogTitle = data.config.dialogTitle;
	    	  payload.dialogConfirmationButtonTitle = data.config.dialogConfirmationButtonTitle;
	    	  payload.dialogCancellationButtonTitle = data.config.dialogCancellationButtonTitle;
	    	  payload.formSubmissionTopic = data.config.formSubmissionTopic;
	    	  payload.contentWidth = "1250px";
		      payload.contentHeight = "650px";
	    	  payload.dialogId = "FORM_EMPLOYEE";
	    	  payload.widgets = this.getWidgets();
	    	  
	    	  this.alfLog("log", "alfresco_formEmployee__onCreateFormEmployee", payload);
	    	  this.alfPublish("ALF_CREATE_FORM_DIALOG_REQUEST", payload);
	   },
	   
	   getWidgets: function alfresco_formEmployee__getWidgets(){
		   
		   var optionsSex = [{value:"Мужской", label:"Мужской"},{value:"Женский", label:"Женский"}];
		   
		   var widgets = [ ];		   
		   
		   var firstname = {
		       	    name: "alfresco/forms/controls/DojoValidationTextBox",
		    	    id:"btl-people_firstname",
		    	    config: {
		    	       label: "btl-people_firstname.title",
		    	       name: "prop_btl-people_firstname",
		    	       value: (this.data !== null) ? this.data.firstname : "" , 
		    	       requirementConfig: {
		    	          initialValue: true
		    	       },
		    	       validationConfig: [
                                {
                                   validation: "minLength",
                                   errorMessage: "Поле обязательно для заполнения",
                                   length: 1
                                }
                             ]
		    	    }
		    	 };
		   
		   var middlename = {
		    	    name: "alfresco/forms/controls/DojoValidationTextBox",
		    	    id:"btl-people_middlename",
		    	    config: {
		    	       label:  "btl-people_middlename.title",
		    	       name: "prop_btl-people_middlename",
		    	       value: (this.data !== null) ? this.data.middlename : ""
		    	    }
		    	 };
		   
		   var surname = {
		    		name: "alfresco/forms/controls/DojoValidationTextBox",
		    	    config: {
		    	       label:  "btl-people_surname.title",
		    	       name: "prop_btl-people_surname",
		    	       value: (this.data !== null) ? this.data.surname : "",
                           requirementConfig: {
                                  initialValue: true
                               },
                           validationConfig: [
                                      {
                                         validation: "minLength",
                                         errorMessage: "Поле обязательно для заполнения",
                                         length: 1
                                      }
                                   ]
		    	    }
		    	 };
		   
		   var position = {
		    		 name: "alfresco/forms/controls/DojoValidationTextBox",
		    		 config: {
		    		    label:  "btl-emp_position.title",
		    		    name: "prop_btl-emp_position",
		    		    value: (this.data !== null) ? this.data.position : "",
			    		requirementConfig: {
		    		          initialValue: true
		    		       }		
		    		    }
		    		 };

          var refToPosition = {
                  name: "btl/widgets/base/btlChoice",
                  id: "ASSOC_BTL_EMP_POSITION",
                  config:{
                      name: "assoc_btl-emp_position",
                      value: (this.data !== null) ? this.data.position_ref : "",
                      header: "Выбрать должность",
                      labelText: "Должность",
                      labelButton: "...",
                      urlList: "/share/proxy/alfresco/filters/association",
                      dataUrl:{
                        "type":"btl-pos:employee-position",
                        "s_field":"name",
                        "field":"name"
                      },
                      itemUrl:"/share/proxy/alfresco/picker/associationItem",
                      dataItemUrl:{
                        "type":"btl-pos:employee-position",
                        "field":"name"
                      }
                  }
          };
		   
		  /*var refToPosition = {
				   name:"btl/widgets/base/ItemPicker",
				   config:{
					   name: "assoc_btl-emp_department",
					   value: (this.data !== null) ? this.data.department_ref : "",
					   labelText: "btl-person_department.title",
					   labelButton: "...",
					   labelPicker: "Выбрать",
					   pickedItemsLabel: "Текущая",
					   availableItemsLabel:"Доступные",
					   propertyToRender:"name",
					   itemsProperty: "result",
					   url: "filters/association?type=btl-depart:department-folder&s_field=name&field=name&per_page=500",
					   itemUrl: "/share/proxy/alfresco/picker/associationItem?type=btl-depart:department-folder&field=name&nodeRef="
					}
		  };*/

		  var refToDepartment = {
                name:"btl/widgets/base/btlChoice",
                id: "ASSOC_BTL_EMP_DEPARTMENT",
                config:{
                      name: "assoc_btl-emp_department",
                      header: "Выбрать подразделение",
                      value: (this.data !== null) ? this.data.department_ref : "",
                      labelText: "btl-person_department.title",
                      labelButton: "...",
                      urlList: "/share/proxy/alfresco/filters/association",
                      dataUrl:{
                          "type":"btl-depart:department-folder",
                          "s_field":"name",
                          "field":"name"
                      },
                      itemUrl:"/share/proxy/alfresco/picker/associationItem",
                      dataItemUrl:{
                          "type":"btl-depart:department-folder",
                          "field":"name"
                      }
                }
          };

		  var refToDirector = {
               name:"btl/widgets/base/btlChoice",
               id: "ASSOC_BTL_EMP_DIRECTOR",
               config:{
                     name: "assoc_btl-emp_director",
                     header: "Выбрать руководителя",
                     value: (this.data !== null) ? this.data.director_ref : "",
                     labelText: "btl-person_director.title",
                     labelButton: "...",
                     urlList: "/share/proxy/alfresco/filters/association",
                     dataUrl:{
                         "type":"btl-emp:employee-content",
                         "s_field":"btl-people:fio",
                         "field":"btl-people:fio"
                     },
                     itemUrl:"/share/proxy/alfresco/picker/associationItem",
                     dataItemUrl:{
                         "type":"btl-emp:employee-content",
                         "field":"btl-people:fio"
                     }
               }
          };

		   /*var refToDirector = {
				   name:"btl/widgets/base/ItemPicker",
				   config:{
					   name: "assoc_btl-emp_director",
					   value: (this.data !== null) ? this.data.director_ref : "",
					   labelText: "btl-person_director.title",
					   labelButton: "...",
					   labelPicker: "Выбрать",
					   pickedItemsLabel: "Текущая",
					   availableItemsLabel:"Доступные",
					   propertyToRender:"name",
					   itemsProperty: "result",
					   url: "filters/association?type=btl-emp:employee-content&s_field=surname&field=surname,firstname,middlename&per_page=500",
					   itemUrl: "/share/proxy/alfresco/picker/associationItem?type=btl-emp:employee-content&field=surname,firstname,middlename&nodeRef="
					}
		   };*/

           var refToAlfrescoUser = {
               name:"btl/widgets/base/btlChoice",
               id: "ASSOC_BTL_EMP_USER_ALFRESCO",
               config:{
                    name: "assoc_btl-people_user_alfresco",
                    header: "Выбрать аккаунт пользователя Alfresco",
                    value: (this.data !== null) ? this.data.user_alfresco_ref : "",
                    labelText: "Пользователь Alfresco",
                    labelButton: "Выбрать",
                    urlList: "/share/proxy/alfresco/filters/association",
                    dataUrl:{
                         "type":"cm:person",
                         "s_field":"userName",
                         "field":"userName",
                         "userAlfresco":true
                    },
                    itemUrl:"/share/proxy/alfresco/picker/associationItem",
                    dataItemUrl:{
                        "type":"cm:person",
                        "field":"userName"
                    }
               }
           };

           var refToDelegates = {
                  name:"btl/widgets/base/btlChoice",
                  id: "ASSOC_BTL_EMP_DELEGATES",
                  config:{
                        name: "assoc_btl-emp_delegates",
                        header: "Выбрать заместителей",
                        value: (this.data !== null) ? this.data.delegates_ref : "",
                        labelText: "",
                        single: false,
                        height: "255",
                        labelButton: "Выбрать",
                        urlList: "/share/proxy/alfresco/filters/association",
                        dataUrl:{
                            "type":"btl-emp:employee-content",
                            "s_field":"btl-people:fio",
                            "field":"btl-people:fio"
                        },
                        itemUrl:"/share/proxy/alfresco/picker/associationItems",
                        dataItemUrl:{
                            "type":"btl-emp:employee-content",
                            "field":"btl-people:fio"
                        },
                        excluded:(this.data !== null) ? [this.data.nodeRef.toString()] : []
                  }
           };
		   
		   /*var refToAlfrescoUser = {
				   name:"btl/widgets/base/ItemPicker",
				   config:{
					   name: "assoc_btl-emp_user_alfresco",
					   value: (this.data !== null) ? this.data.user_alfresco_ref : "",
					   labelText: "Пользователь Alfresco",
					   labelButton: "...",
					   labelPicker: "Выбрать",
					   pickedItemsLabel: "Текущий",
					   availableItemsLabel:"Доступные",
					   propertyToRender:"name",
					   itemsProperty: "result",
					   url: "filters/alf-user",
					   itemUrl: "/share/proxy/alfresco/picker/associationItem?type=cm:person&field=userName&nodeRef="
					}
			};*/
		   
		   var phone = {
		    		 name: "btl/widgets/base/TextBox",
		    		 config: {
		    		    label:  "btl-people_phone.title",
		    		    name: "prop_btl-people_phone",
		    		    style:{width: "300px"},
		    		    value: (this.data !== null) ? this.data.phone : "" 
		    		    }
		    	 };
		   
		   var mobile = {
		    		 name: "btl/widgets/base/TextBox",
		    		 config: {
		    		    label:  "btl-people_mobile.title",
		    		    name: "prop_btl-people_mobile",
		    		    style:{width: "300px"},
		    		    value: (this.data !== null) ? this.data.mobile : "" 
		    		    }
		    	 };
		   
		   var fax = {
		    		 name: "btl/widgets/base/TextBox",
		    		 config: {
		    		    label:  "btl-people_fax.title",
		    		    name: "prop_btl-people_fax",
		    		    style:{width: "300px"},
		    		    value:  (this.data !== null) ? this.data.fax : ""  
		    		    }
		    	 };
		   
		   var email = {
		    		 name: "btl/widgets/base/TextBox",
		    		 config: {
		    		    label:  "btl-people_email.title",
		    		    name: "prop_btl-people_email",
		    		    style:{width: "300px"},
		    		    value: (this.data !== null) ? this.data.email : "" 
		    		    }
		    	 };
		   
		   var tabnum = {
		    		 name: "btl/widgets/base/TextBox",
		    		 config: {
		    		    label:  "btl-emp_tabnum.title",
		    		    name: "prop_btl-emp_tabnum",
		    		    style:{width: "250px"},
		    		    value: (this.data !== null) ? this.data.tabnum : "" 
		    		    }
		    	 };
		   
		   var information = {
		    		 name: "alfresco/forms/controls/DojoTextarea",
		    		 config: {
		    		    label:  "btl-people_information.title",
		    		    name: "prop_btl-people_information",
		    		    value: (this.data !== null) ? this.data.information : "" 
		    		    }
		    	 };
		   
		   var close_choice = {
		    		 name: "alfresco/forms/controls/DojoCheckBox",
		    		 config: {
		    		    label:  "btl-emp_close_choice.title",
		    		    name: "prop_btl-emp_close_choice",
		    		    value: (this.data !== null) ? this.data.close_choice : ""  
		    		    }
		    	 };
		   
		   var sex = {
	    		   name: "alfresco/forms/controls/Select",
	    		   config: {
	    			  label:  "btl-people_sex.title",
	    		      name: "prop_btl-people_sex",
	    		      value: (this.data !== null) ? this.data.sex : "",
	    		      optionsConfig: {
	    		    	  fixed: optionsSex
	    		    	}
	    		   }
	    		};
		   var notActual = {
		            name: "alfresco/forms/controls/CheckBox",
		            config: {
                        label:  "Отключен",
                        name: "prop_btl-people_notActual",
                        value: (this.data !== null) ? this.data.notActual : false

                    }
		   };

		   var nextTaskAutoOpen = {
		            name: "alfresco/forms/controls/CheckBox",
		            config: {
                        label:  "Отключен",
                        name: "prop_btl-people_nextTaskAutoOpen",
                        value: (this.data !== null) ? this.data.nextTaskAutoOpen : false

                    }
		   };

		   var not_email_notify = {
                    name: "alfresco/forms/controls/CheckBox",
                    config: {
                           label:  "Не уведомлять по почте",
                           name: "prop_btl-people_not_email_notify",
                           value: (this.data !== null) ? this.data.not_email_notify : false

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
		   
		   var winContactInfo = {
				   name: "btl/widgets/base/ClassicWindow",
				   config: {
				     title: "Контактная информация",
				     widgets:[ ]
				   }
			   };

            var winDelegates = {
                   name: "btl/widgets/base/ClassicWindow",
                   id: "WIN_DELEGATES",
                   config: {
                     title: "Заместители",
                     style: "width: 383px;",
                     widgets:[ ]
                   }
               };
		   
		   var winPersonInfo = {
				    name: "btl/widgets/base/ClassicWindow",
				    config: {
				      title: "",
				      widgets:[ ]
				    }
			   };
		   
		   var winAdditionalInfo = {
	        	   name: "btl/widgets/base/ClassicWindow",
	        	   config: {
	        		 widthPc: "37",
	        	     title: "Дополнительная информация",
	        	     widgets:[ ]
	        	   }
			   };
		   
		   var colPhone = { name: "alfresco/forms/ControlColumn",
		 			 config: {
		 				 widgets: [ ]
		 			}
		   };
		   
		   var colSite = { name: "alfresco/forms/ControlColumn",
		 			 config: {
		 				 widgets: [ ]
		 			}
		   };
		   
		   var rowInfo = { name: "alfresco/forms/ControlRow",
					 config: {
	                     widgets: [ ]
					}
		   };
		   
		   var rowContactInfo = { name: "alfresco/forms/ControlRow",
					 config: {
	                     widgets: [ ]
					}
		   };
		   
		   var rowPersonInfo = { name: "alfresco/forms/ControlRow",
					 config: {
	                     widgets: [ ]
					}
		   };
		   var rowPersonInfo2 = { name: "alfresco/forms/ControlRow",
					 config: {
	                     widgets: [ ]
					}
		   };
		   
		   var colPersonInfo = { name: "alfresco/forms/ControlColumn",
					 			 config: {
					 				 widgets: [ ]
					 			}
		   };
		   
		   
		   var mainWidget = { name: "alfresco/forms/ControlColumn",
					 config: {
					        widgets: [ ]
					 }};
		   
		   winAdditionalInfo.config.widgets.push(sex, tabnum, refToAlfrescoUser, notActual, nextTaskAutoOpen, not_email_notify ); // ,information
		   rowPersonInfo.config.widgets.push(surname, firstname, middlename);
		   rowPersonInfo2.config.widgets.push(refToPosition, refToDepartment, refToDirector);
		   colPersonInfo.config.widgets.push(rowPersonInfo, rowPersonInfo2); 
		   //colSite.config.widgets.push(email, fax);
		   //colPhone.config.widgets.push(phone, mobile);
		   //rowContactInfo.config.widgets.push(colPhone, colSite);
		   winPersonInfo.config.widgets.push(colPersonInfo);
		   //winContactInfo.config.widgets.push(rowContactInfo);
		   winContactInfo.config.widgets.push(phone, mobile, email, fax);
		   winDelegates.config.widgets.push(refToDelegates);
		   rowInfo.config.widgets.push(winContactInfo, winAdditionalInfo, winDelegates);
		   mainWidget.config.widgets.push(winPersonInfo, rowInfo);
		   widgets.push(mainWidget);
		   
		   return widgets;
	   },
	   
	   signRemoveEmployee: function btl_EmployeeService__signRemoveEmployee(payload){
	    	this.alfLog("log", "btl_EmployeeService__signRemoveEmployee", payload);
	    	this.serviceXhr({
	    	    url: "/share/proxy/alfresco/api/node/" + payload.nodeRef.replace("://", "/") + "/formprocessor",
	    	    method: "POST",
	    	    sync: true,
	    	    data: {
	    	    	"prop_btl-people_notActual": "true"
	   	      },
	    	    successCallback: this.alfPublish("DATAGRID_REFRESH_DATA"),
	    	    callbackScope: this
	    	  });
	    },
	   
    
  });
});