define(["dojo/_base/declare",
        "alfresco/core/Core",
        "dojo/_base/lang",
        "btl/widgets/base/ClassicWindow"
        ],
        function(declare, Core, lang ) {

   return declare([Core], {

	   contactor: null,


       cssRequirements: [{cssFile: "./css/validate.css"}],
       /**
        * An array of the i18n files to use with this widget.
        *
        * @instance
        * @type {object[]}
        * @default [{i18nFile: "./i18n/DialogService.properties"}]
        */
       i18nRequirements: [{i18nFile: "./i18n/FormContactor.properties"}],

	   nodeRefContactor:null,

	   constructor: function alfresco_formContactor__registerSubscriptions(args) {
		   lang.mixin(this, args);
		   this.alfSubscribe("BTL_CREATE_FORM_CONTACTOR", lang.hitch(this, this.onCreateFormContactor));
	   },

	   onCreateFormContactor: function alfresco_formContactor__onCreateFormContactor(data){
		   this.alfLog("log", "alfresco_formContactPerson__onCreateFormContactor", data);
		   	  this.contactor = data.contactor;
		   	 // this.nodeRefContactor = (typeof data.formSubmissionPayloadMixin == "undefined") ? null : data.formSubmissionPayloadMixin.alf_destination;
		   	  this.nodeRefContactor = data.alf_destination;
	    	  var payload = {};

	    	  payload.dialogTitle = data.config.dialogTitle;
	    	  payload.dialogConfirmationButtonTitle = data.config.dialogConfirmationButtonTitle;
	    	  payload.dialogCancellationButtonTitle = data.config.dialogCancellationButtonTitle;
	    	  payload.formSubmissionTopic = data.config.formSubmissionTopic;
	    	  payload.contentWidth = "1050px";
	    	  payload.contentHeight = "820px";
	    	  payload.pubSubScope = "_FORM_CONTACTOR";
	    	  payload.dialogId = "FORM_CONTACTOR";
	    	  payload.widgets = this.getWidgets();

	    	  this.alfLog("log", "alfresco_formContactPerson__onCreateFormContactor", payload);
	    	  this.alfPublish("ALF_CREATE_FORM_DIALOG_REQUEST", payload);
	   },

	   getWidgets: function alfresco_formContactor__getWidgets(){

		   this.alfLog("log", "alfresco_formContactor__getWidgets", this);
		   var nodeRef = (this.contactor) ? this.contactor.nodeRef : "";

		   var optionsType = [	 {value:"ООО", label:"ООО"},
	    	                     {value:"АО", label:"АО"},
	    	                     {value:"ЗАО", label:"ЗАО"},
	    	                     {value:"ОФО", label:"ОФО"},
	    	                     {value:"ГУП", label:"ГУП"},
	    	                     {value:"ФГУП", label:"ФГУП"},
	    	                     {value:"Физ. лицо", label:"Физ. лицо"}];

		   var widgets =[];

		   var nodeRefContactor = {
					name: "btl/widgets/base/TextBox",
				      config: {
				         name: "nodeRef",
				         value: (this.contactor) ? this.contactor.nodeRef : "",
				         visibilityConfig: {
				            initialValue: false
				         }
				      }
				};

		   var alf_destination = {
				 name: "btl/widgets/base/TextBox",
				 config: {
				    name: "alf_destination",
				    value: this.nodeRefContactor,
				    visibilityConfig: {
			            initialValue: false
			         }
				    }
			 };

		   var fullnameContactor = {
				   	 name: "btl/widgets/base/TextBox",
					 config: {
						 label: "btl-dic_fullname.title",
						 name: "prop_btl-contr_fullname",
						 style:{width: "950px"},
						 value: (this.contactor) ? this.contactor.fullname : ""
					    }
				 };
		   var addressContactor = {
	      			 name: "alfresco/forms/controls/DojoTextarea",
	      			 config: {
	      				 label: "btl-dic_address.title",
	      				 name: "prop_btl-contr_address",
	      				 value: (this.contactor) ? this.contactor.address : ""
	      			    }
	      		 };
//Район область город
           var cityContactor = {
               name: "btl/widgets/base/TextBox",
               config: {
                   label: "Город",
                   name: "prop_btl-contr_city",
                   value: (this.contactor) ? this.contactor.city : ""
               }
           };

           var regionContactor = {
               name: "btl/widgets/base/TextBox",
               config: {
                   label: "Район",
                   name: "prop_btl-contr_region",
                   value: (this.contactor) ? this.contactor.region : ""
               }
           };
           var oblastContactor = {
               name: "btl/widgets/base/TextBox",
               config: {
                   label: "Область (край, республика)",
                   name: "prop_btl-contr_oblast",
                   value: (this.contactor) ?
                       this.contactor.oblast : ""
               }
           };

		   var phoneContactor = {
      			    name: "btl/widgets/base/TextBox",
      			    config: {
      			       label: "btl-dic_phone.title",
      			       name: "prop_btl-contr_phone",
      			       value: (this.contactor) ? this.contactor.phone : "",
      			       requirementConfig: {
      				          initialValue: true
      				       }
      			    }
      		 };

		   var faxContactor = {
	      			 name: "btl/widgets/base/TextBox",
	      			 config: {
	      				 label: "btl-dic_fax.title",
	      				 name: "prop_btl-contr_fax",
	      				 value: (this.contactor) ? this.contactor.fax : ""
	      			    }
	      		 };

		   var emailContactor = {
	      			 name: "btl/widgets/base/TextBox",
	      			 config: {
	      				 label: "btl-dic_email.title",
	      				 name: "prop_btl-contr_email",
	      				 value: (this.contactor) ? this.contactor.email : ""
	      			    }
	      		 };

		   var siteContactor = {
	      			 name: "btl/widgets/base/TextBox",
	      			 config: {
	      				 label: "btl-dic_site.title",
	      				 name: "prop_btl-contr_site",
	      				 value: (this.contactor) ? this.contactor.site : ""
	      			    }
	      		 };

		   var directorContactor = {
	     		    name: "btl/widgets/base/TextBox",
	     		    config: {
	     		       label: "ФИО руководителя",
	     		       name: "prop_btl-contr_director",
	     		       value: (this.contactor) ? this.contactor.director : ""
	     		    }
	     		 };

		   var positionContactor = {
	     		    name: "btl/widgets/base/TextBox",
	     		    config: {
	     		       label: "Должность",
	     		       name: "prop_btl-contr_position",
	     		       value: (this.contactor) ? this.contactor.position : ""
	     		    }
	     		 };

		   var innContactor = {
					 name: "btl/widgets/base/TextBox",
					 config: {
						 label: "btl-dic_inn.title",
						 name: "prop_btl-contr_inn",
						 value: (this.contactor) ? this.contactor.inn : "",
						 style: { width: "160px" },
						 validationConfig: [
										     {
										    	 validation: "regex",
										    	 regex: "(^$|(\\d{1,20}))",
										         errorMessage: "btl-dic_inn.error"
										      }]
					    },


				};

		   var kppContactor = {
			     name: "btl/widgets/base/TextBox",
				 config: {
					 label: "btl-dic_kpp.title",
					 name: "prop_btl-contr_kpp",
					 value: (this.contactor) ? this.contactor.kpp : "",
					 style: { width: "160px" },
					 validationConfig: [
									     {
									    	 validation: "regex",
									         regex: "(^$|(\\d{1,20}))",
									         errorMessage: "btl-dic_kpp.error"
									      }]
				    },


			};

		   var shotnameContactor = {
				    name: "btl/widgets/base/TextBox",
				    config: {
				       label: "Краткое название",
				       name: "prop_btl-contr_name",
				       value: (this.contactor) ? this.contactor.name : "",
				       requirementConfig: {
				          initialValue: true
				       }
				    }
				 };

		   var inPerpetuityContactor =  {
					 name: "alfresco/forms/controls/DojoCheckBox",
					 config: {
						fieldId: "SHOW_OTHER_FIELDS",
					    label:  "Имеется соглащение о конфидециальности",
					    name: "prop_btl-contr_in_perpetuity",
					    onClickTopic:"SHOW_OTHER_FIELDS",
					    value: (this.contactor) ? this.contactor.in_perpetuity : ""
					 }
				 };

		   var dateConfidentialityContactor =  {
					 name: "btl/widgets/base/Datepicker",
					 id: "VALID_DATE_CONFIDENTIALITY",
					 config: {
						 additionalCssClasses: "datefield",
						 label:  "btl-person_date_confidentiality.title",
						 name: "prop_btl-contr_date_confidentiality",
						 value: (this.contactor) ? this.contactor.date_confidentiality : "",
						 disablementConfig: {
				             initialValue: true,
						        rules: [
						           {
						              targetId: "SHOW_OTHER_FIELDS",
						              is: [false]
						           }
						        ]
						     }
						    }
				 };
//--------требуется для коректного отображения модуля btl/widgets/base/ItemPicker---------------------------------		   
		   /*var buf = {
				   name: "alfresco/buttons/AlfButton",
				   config: {

				         widgets: [
				            {
		                        name: "alfresco/forms/controls/SimplePicker"
		                 }
				         ]
				      }
				   };*/

//-----------------------------------------------------------------------------------------------------------------

		   /*var refToPosition = {
				   name:"btl/widgets/base/ItemPicker",
				   config:{
					   name: "prop_btl-contr_position",
					   value: (this.contactor) ? this.contactor.position : "",
					   labelText: "Должность",
					   labelButton: "Добавить",
					   labelPicker: "Выбрать",
					   pickedItemsLabel: "Текущая",
					   availableItemsLabel:"Доступные",
					   propertyToRender:"name",
					   url: "search/position",
					   itemUrl: "/share/proxy/alfresco/picker/positionItem?nodeRef="
				   }
           };*/

           var refToPosition = {
			   name: "btl/widgets/controlFormContactor/Position",
			   config:{
				   value: (this.contactor) ? this.contactor.position : "",
			   }
                 /*id: "PROP_BTL_CONTR_POSITION",
                 config:{
                     name: "prop_btl-contr_position",
                     value: (this.contactor) ? this.contactor.position : "",
                     header: "Выбрать должность",
                     labelText: "Должность",
                     labelButton: "Выбрать",
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
                 }*/
           };

           var refToDirector = {
                name:"btl/widgets/base/btlChoice",
                id: "PROP_BTL_CONTR_DIRECTOR",
                config:{
                    name: "prop_btl-contr_director",
					fieldId: "CONTR_DIRECTOR",
                    header: "Выбрать руководителя",
                    value: (this.contactor) ? this.contactor.director : "",
                    labelText: "ФИО руководителя",
                    labelButton: "Выбрать",
                    urlList: "/share/proxy/alfresco/filters/association",
                    dataUrl:{
                        "type":"btl-person:person-content",
                        "s_field":"btl-people:fio",
                        "extra":"PARENT:'" + nodeRef +"'",
						"data":"position",
                        "field":"btl-people:fio"
                    },
                    itemUrl:"/share/proxy/alfresco/picker/associationItem",
                    dataItemUrl:{
                        "type":"btl-person:person-content",
                        "field":"btl-people:fio"
                    }
                }
           };

		   /*var refToDirector = {
				   name:"btl/widgets/base/ItemPicker",
				   config:{
					   name: "prop_btl-contr_director",
	     		       value: (this.contactor) ? this.contactor.director : "",
					   labelText: "ФИО руководителя",
					   labelButton: "Добавить",
					   labelPicker: "Выбрать руководителя",
					   pickedItemsLabel: "Текущий",
					   availableItemsLabel:"Доступные",
					   url: "picker/contactPerson?nodeRef=" + nodeRef,
					   itemUrl: "/share/proxy/alfresco/picker/contactPersonItem?nodeRef="
					}
		   };*/

		   var subWidget = { name: "alfresco/forms/ControlRow",
					 config: {
	                     widgets: [ ]
					 }
		   };

		   var columnWidget = { name: "alfresco/forms/ControlColumn",
					 config: {
	                     widgets: [ ]
					 }
		   };

		   var inn_kppWidget = { name: "alfresco/forms/ControlRow",
					 config: {
					        widgets: [ ]
					 }};

		   var winContactPerson =  {
				    name: "btl/widgets/base/ClassicWindow",
				    config: {
				      title: "Контактное лицо",
				      widgets:[ ]
				    }
		   };

		   var winContactInfo =  {
				    name: "btl/widgets/base/ClassicWindow",
				    config: {
				      title: "Контактная информация",
				      widgets:[ ]
				    }
		   };

		   var winAdditionalInfo =  {
				    name: "btl/widgets/base/ClassicWindow",
				    config: {
				      title: "Дополнительная информация",
				      widgets:[ ]
				    }
		   };


		   var mainWidget = { name: "alfresco/forms/ControlColumn",
					 config: {
					        widgets: [ ]
					 }};

		   inn_kppWidget.config.widgets.push(innContactor, kppContactor);
		   winContactPerson.config.widgets.push(refToDirector, refToPosition);
		   winContactInfo.config.widgets.push(addressContactor,cityContactor, regionContactor, oblastContactor, phoneContactor, faxContactor, emailContactor, siteContactor);
		   winAdditionalInfo.config.widgets.push(inn_kppWidget, shotnameContactor, inPerpetuityContactor, dateConfidentialityContactor);
           (this.contactor) ? columnWidget.config.widgets.push(winContactPerson, winAdditionalInfo) : columnWidget.config.widgets.push(winAdditionalInfo);
		   subWidget.config.widgets.push(winContactInfo, columnWidget);
		   mainWidget.config.widgets.push(nodeRefContactor, alf_destination, fullnameContactor);
		   mainWidget.config.widgets.push(subWidget);
		   widgets.push(mainWidget);

		   return widgets;

	   }

   });
});
