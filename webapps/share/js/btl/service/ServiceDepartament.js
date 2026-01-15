define(["dojo/_base/declare",
        "alfresco/core/Core",
        "dojo/_base/lang",
        "alfresco/core/CoreXhr",
        "service/constants/Default"],
        function(declare, Core, lang, CoreXhr, AlfConstants) {

  return declare([Core, CoreXhr], {
	  
    data: {}, 

    constructor: function btl_DepartmentService__constructor(args) {
      lang.mixin(this, args);
      this.alfSubscribe("BTL_CREATE_DEPARTAMENT", lang.hitch(this, this.createDepartment));
      this.alfSubscribe("BTL_EDIT_DEPARTAMENT", lang.hitch(this, this.editDepartment));
      this.alfSubscribe("BTL_CREATE_FORM_DEPARTAMENT", lang.hitch(this, this.onCreateFormDepartment));
      this.alfSubscribe("BTL_SING_REMOVE_DEPARTAMENT", lang.hitch(this, this.signRemoveDepartment));
    },
       
    createDepartment: function btl_DepartmentService__createDepartment(payload) {
    	this.alfLog("log", "btl_DepartmentService__createDepartment", payload);
    	
    	this.data = payload;
    	this.data["prop_cm_name"] = payload["prop_btl-depart_name"];
    	this.serviceXhr({
    	    url: "/share/proxy/alfresco/api/type/btl-depart%3adepartment-folder/formprocessor",
    	    method: "POST",
    	    data: this.data,
    	    successCallback: this.updataDepartment,
    	    callbackScope: this
    	  });
    	},
    
    editDepartment: function btl_DepartmentService__editDepartment(payload) {
    	
    	this.alfLog("log", "btl_DepartmentService__editDepartment", payload);
    	
    	this.data = payload;
    	this.data["prop_cm_name"] = payload["prop_btl-depart_name"];
    	this.serviceXhr({
    	    url: "/share/proxy/alfresco/api/node/"+ payload.nodeRef.replace("://", "/") +"/formprocessor",
    	    method: "POST",
    	    data: this.data,
    	    successCallback: this.alfPublish("TREE_EDIT_NODE_ATTRIBUTE",{ attribute: {name: "name", value: payload["prop_btl-depart_name"]}}),
    	    callbackScope: this
    	  });
    },
    
    updataDepartment: function btl_DepartmentService__updataDepartment(response, originalRequestConfig) {
    	this.alfLog("log", "btl_DepartmentService__updataDepartment response", response);
    	this.alfLog("log", "btl_DepartmentService__updataDepartment originalRequestConfig", originalRequestConfig);
    	
    	var newItem = {};
    	newItem.id = response.persistedObject;
    	newItem.parent = originalRequestConfig.data.alf_destination;
    	newItem.name = originalRequestConfig.data.prop_cm_name;
    	
    	originalRequestConfig.data.nodeRef = originalRequestConfig.data.alf_destination;
    	
   	   	this.alfPublish("TREE_ADD_NEW_NODE", newItem);
    	this.alfPublish("DATAGRID_ADD_ROW", originalRequestConfig.data);
    },
    
   onCreateFormDepartment: function alfresco_formDepartment__onCreateFormDepartment(data){
	   	  this.alfLog("log", "alfresco_formDepartment__onCreateFormDepartment", data);
	   
	   	  this.data = data.data;
	   	 
	   	  this.rootNodeRef = data.rootNodeRef;
	   	  var payload = {};    	  
    	  
    	  payload.dialogTitle = data.config.dialogTitle;
    	  payload.dialogConfirmationButtonTitle = data.config.dialogConfirmationButtonTitle;
    	  payload.dialogCancellationButtonTitle = data.config.dialogCancellationButtonTitle;
    	  payload.formSubmissionTopic = data.config.formSubmissionTopic;
    	  payload.widgets = this.getWidgets();
    	  payload.dialogId = "FORM_DEPARTAMENT";
    	  payload.contentWidth = "450px";
    	  this.alfLog("log", "alfresco_formDepartment__onCreateFormDepartment", payload);
    	  this.alfPublish("ALF_CREATE_FORM_DIALOG_REQUEST", payload);
   },
	   
	   getWidgets: function alfresco_formDepartment__getWidgets(){		
		   
		   var optionsType = [{value:"Организация", label:"Организация"},{value:"Подразделение", label:"Подразделение"}];
		   
		   var widgets = [];
           var departName = {
                name: "alfresco/forms/controls/DojoValidationTextBox",
                id:"btl-depart_name",
                config: {
                   label: "btl-depart_name.title",
                   name: "prop_btl-depart_name",
                   value: (this.data !== null) ? this.data["prop_btl-depart_name"] : "" ,
                   requirementConfig: {
                      initialValue: true
                   }
                }
           };
           var departFullName = {
                name: "alfresco/forms/controls/DojoValidationTextBox",
                id:"btl-depart_fullname",
                config: {
                   label:  "btl-depart_fullname.title",
                   name: "prop_btl-depart_fullname",
                   value: (this.data !== null) ? this.data["prop_btl-depart_fullname"] : ""
                }
           };
           var departIndex = {
               name: "alfresco/forms/controls/DojoValidationTextBox",
               id:"btl-depart_index",
               config: {
                   label:  "btl-depart_index.title",
                   name: "prop_btl-depart_index",
                   value: (this.data !== null) ? this.data["prop_btl-depart_index"] : ""
               }
           };
           var departAddress = {
               name: "alfresco/forms/controls/TextArea",
               id:"btl-depart_address",
               config: {
                   label:  "Адрес",
                   /*style:{height: "30px"},*/
                   name: "prop_btl-depart_address",
                   value: (this.data !== null) ? this.data["prop_btl-depart_address"] : ""
               }
           };


           var departCity = {
               name: "btl/widgets/base/TextBox",
               config: {
                   label:  "Город",
                   name: "prop_btl-depart_city",
                 /*  style:{width: "300px"},*/
                   value: (this.data !== null) ? this.data["prop_btl-depart_city"] : ""
               }
           };

           var departRegion = {
               name: "btl/widgets/base/TextBox",
               config: {
                   label:  "Район",
                   name: "prop_btl-depart_region",
                 /*  style:{width: "300px"},*/
                   value: (this.data !== null) ? this.data["prop_btl-depart_region"] : ""
               }
           };

           var departOblast = {
               name: "btl/widgets/base/TextBox",
               config: {
                   label:  "Область (край, республика) ",
                   name: "prop_btl-depart_oblast",
                   /*style:{width: "300px"},*/
                   value: (this.data !== null) ? this.data["prop_btl-depart_oblast"] : ""
               }
           };









           var departPhone = {
               name: "alfresco/forms/controls/DojoValidationTextBox",
               id:"btl-depart_phone",
               config: {
                   label:  "Телефон",
                   name: "prop_btl-depart_phone",
                   value: (this.data !== null) ? this.data["prop_btl-depart_phone"] : ""
               }
           };
    	   var departType = {
               name: "alfresco/forms/controls/Select",
               config: {
                  label:  "btl-depart_type.title",
                  name: "prop_btl-depart_type",
                  value: (this.data !== null) ? this.data["prop_btl-depart_type"] : "",
                  optionsConfig: {
                      fixed: optionsType
                    }
               }
  		   };
    	   
    	   var departIsDirection = {
                   name: "alfresco/forms/controls/DojoCheckBox",
                   config: {
                      label:  "Направление",
                      name: "prop_btl-depart_isDirection",
                      value: (this.data !== null) ? this.data["prop_btl-depart_isDirection"] : ""
                      }
   	   	   };
    	   
	   	   var departActual = {
                name: "alfresco/forms/controls/DojoCheckBox",
                config: {
                   label:  "btl-depart_actual.title",
                   name: "prop_btl-depart_actual",
                   value: (this.data !== null) ? this.data["prop_btl-depart_actual"] : ""
                   }
	   	   };
	   	   var departDirector = {
                name:"btl/widgets/base/ItemPicker",
                config:{
                   name: "assoc_btl-depart_director",
                   value: (this.data) ? this.data["assoc_btl-depart_director"] : "",
                   labelText: "btl-depart_director.title",
                   labelButton: "...",
                   labelPicker: "Выбрать",
                   pickedItemsLabel: "Текущая",
                   availableItemsLabel:"Доступные",
                   propertyToRender:"name",
                   itemsProperty: "result",
                   url: "filters/association?type=btl-emp:employee-content&s_field=btl-people:surname&field=btl-people:fio&per_page=500",
                   itemUrl: "/share/proxy/alfresco/picker/associationItem?type=btl-emp:employee-content&field=btl-people:fio&nodeRef="
                }
           };

           var refToDirector = {
               name:"btl/widgets/base/btlChoice",
               config:{
                   name: "assoc_btl-depart_director",
                   header: "Выбрать руководителя",
                   value: (this.data) ? this.data["assoc_btl-depart_director"] : "",
                   labelText: "btl-depart_director.title",
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

  		/*{
    		 name: "alfresco/forms/controls/DojoValidationTextBox",
    		 config: {
    		    label:  "btl-depart_director.title",
    		    name: "assoc_btl-depart_director",
    		    value: (this.data !== null) ? this.data["assoc_btl-depart_director"] : "" 
    		    }
    	 },*/
    	 /*{
    		 name: "alfresco/forms/controls/DojoValidationTextBox",
    		 config: {
    		    label:  "btl-depart_parent.title",
    		    name: "assoc_btl-depart_parent",
    		    value: (this.data !== null) ? this.data["assoc_btl-depart_parent"] : "" 
    		    }
    	 }*/

		   
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
           var row = { name: "alfresco/forms/ControlRow",

                       config: {
                       widgetMarginLeft: 100,
                                widgets: [ ]
                       }};
           
           var subWidgetTypeAndIsDirection = { name: "alfresco/forms/ControlRow",
					 config: {
						 widgetMarginRight:150,
	                     widgets: [ departType, departIsDirection ]
					 }
		   };
           
           row.config.widgets.push(departName, departFullName, departIndex, departPhone, departAddress, departCity,departRegion, departOblast, subWidgetTypeAndIsDirection, refToDirector, departActual);
		   widgets.push(row);

		   return widgets;
	   },
	   
	   signRemoveDepartment: function btl_DepartmentService__signRemoveDepartment(payload){
	    	this.alfLog("log", "btl_DepartmentService__signRemoveDepartment", payload);
	    	this.serviceXhr({
	    	    url: "/share/proxy/alfresco/api/node/" + payload.nodeRef.replace("://", "/") + "/formprocessor",
	    	    method: "POST",
	    	    sync: true,
	    	    data: {
	    	    	"prop_btl-depart_notActual": "true"
	   	      },
	    	    successCallback: this.alfPublish("TREE_DELETE_NODE_FROM_STORE_SUCCESS"), 
	    	    callbackScope: this
	    	  });
	    },
    
  });
});