define(["dojo/_base/declare",
        "alfresco/core/Core",
        "dojo/_base/lang",
        "btl/widgets/base/ClassicWindow"
        ],
        function(declare, Core, lang ) {

   return declare([Core], {

       i18nRequirements: [{i18nFile: "./i18n/FormContactPerson.properties"}],
	   
	   contactPerson: null,
	   
	   rootNodeRef: null,
	   
	   nodeRefContactor:null,
	   
	   constructor: function alfresco_formContactPerson__registerSubscriptions(args) {
		   lang.mixin(this, args);
		   this.alfSubscribe("BTL_CREATE_FORM_CONTACT_PERSON", lang.hitch(this, this.onCreateFormContactPerson));
	   },
	   
	   onCreateFormContactPerson: function alfresco_formContactPerson__onCreateFormContactPerson(data){
		   	  this.alfLog("log", "alfresco_formContactPerson__onCreateFormContactPerson", data);
		   
		   	  this.contactPerson = data.contactPerson;
		   	  this.nameOrganization = data.nameOrganization || "";
		   	  this.nodeRefContactor = (typeof data.formSubmissionPayloadMixin == "undefined") ? null : data.formSubmissionPayloadMixin.alf_destination;
		   	  this.rootNodeRef = data.rootNodeRef;
		   	  var payload = {};    	  
	    	  
	    	  payload.dialogTitle = data.config.dialogTitle;
	    	  payload.dialogConfirmationButtonTitle = data.config.dialogConfirmationButtonTitle;
	    	  payload.dialogCancellationButtonTitle = data.config.dialogCancellationButtonTitle;
	    	  payload.formSubmissionTopic = data.config.formSubmissionTopic;
	    	  payload.contentWidth = "1250px";
		      payload.contentHeight = "820px";
	    	  payload.dialogId = "FORM_CONTACT_PERSON";
	    	  payload.widgets = this.getWidgets();
	    	  
	    	  this.alfLog("log", "alfresco_formContactPerson__onCreateFormContactPerson", payload);
	    	  this.alfPublish("ALF_CREATE_FORM_DIALOG_REQUEST", payload);
	   },
	   
	   getWidgets: function alfresco_formContactPerson__getWidgets(){
		   
		   var optionsSex = [{value:"Мужской", label:"Мужской"},{value:"Женский", label:"Женский"}];
		   
		   var widgets = [];
		   
		   var fullNameOrganization= {
			    name: "btl/widgets/base/TextBox",
			    id:"btl-person_org",
			    config: {
			       label: "Полное название организации",
			       name: "prop_btl-person_org",
			       value: ((this.contactPerson) ? this.contactPerson.org : "" ) || this.nameOrganization || "",
			       disablementConfig: {
                        initialValue: true
                   }
			    }
			};
		   
		   
		   var surnameContactPerson = {
        		name: "btl/widgets/base/TextBox",
        	    config: {
        	       label:  "btl-people_surname.title",
        	       name: "prop_btl-people_surname",
        	       style:{width: "350px"},
        	       value: (this.contactPerson) ? this.contactPerson.surname : "" , 
        	       requirementConfig: {
        		          initialValue: true
        		       }
        	    }
        	 };
		   
		   var firstnameContactPerson = {
       	    name: "btl/widgets/base/TextBox",
       	    id:"btl-people_firstname",
       	    config: {
       	       label: "btl-people_firstname.title",
       	       name: "prop_btl-people_firstname",
       	       style:{width: "350px"},
       	       value: (this.contactPerson) ? this.contactPerson.firstname : "" , 
       	       requirementConfig: {
       	          initialValue: true
       	       		}
       	    	}
		   };
		   
		   var  middlenameContactPerson = {
	        	    name: "btl/widgets/base/TextBox",
	        	    id:"btl-people_middlename",
	        	    config: {
	        	       label:  "btl-people_middlename.title",
	        	       name: "prop_btl-people_middlename",
	        	       style:{width: "350px"},
	        	       value: (this.contactPerson) ? this.contactPerson.middlename : ""
	        	    }
    	   };
		   
		   /*var positionContactPerson = {
      		 name: "alfresco/forms/controls/DojoValidationTextBox",
      		 config: {
      		    label:  "btl-person_position.title",
      		    name: "prop_btl-person_position",
      		    value: (this.contactPerson) ? this.contactPerson.position : "" 
      		    }
      		};*/
		   
		   var phoneContactPerson = {
				 name: "btl/widgets/base/TextBox",
				 config: {
				    label:  "btl-people_phone.title",
				    name: "prop_btl-people_phone",
				    style:{width: "300px"},
				    value: (this.contactPerson) ? this.contactPerson.phone : "" 
				    }
			};
		   
		   var mobileContactPerson = {
				 name: "btl/widgets/base/TextBox",
				 config: {
				    label:  "btl-people_mobile.title",
				    name: "prop_btl-people_mobile",
				    style:{width: "300px"},
				    value: (this.contactPerson) ? this.contactPerson.mobile : ""
				    }
			};
		   
		   var emailContactPerson= {
	        		 name: "btl/widgets/base/TextBox",
	        		 config: {
	        		    label:  "btl-people_email.title",
	        		    name: "prop_btl-people_email",
	        		    style:{width: "300px"},
	        		    value: (this.contactPerson) ? this.contactPerson.email : "" 
	        		    }
	        };
		   
		   var siteContactPerson = {
	        		 name: "btl/widgets/base/TextBox",
	        		 config: {
	        		    label:  "Сайт компании",
	        		    name: "prop_btl-person_site",
	        		    style:{width: "300px"},
	        		    value:  (this.contactPerson) ? this.contactPerson.site : ""  
	        		    }
    	   };
		   
		   var sexContactPerson = {
	      		   name: "btl/widgets/base/Select",
	      		   config: {
	      			  label:  "btl-people_sex.title",
	      		      name: "prop_btl-people_sex",
	      		      value: (this.contactPerson) ? this.contactPerson.sex : "",
	      		      optionsConfig: {
	      		    	  fixed: optionsSex
	      		    	}
	      		   }
      		};
		   
		   var closeChoiceContactPerson = {
	       		 name: "btl/widgets/base/CheckBox",
	       		 config: {
	       		    label:  "btl-person_close_choice.title",
	       		    name: "prop_btl-person_close_choice",
	       		    value: (this.contactPerson) ? this.contactPerson.close_choice : ""  
	       		    }
	       	};
		   
		   var userAlfrescoContactPerson = {
                 name: "btl/widgets/base/CheckBox",
                 config: {
                    label:  "btl-people_user_alfresco.title",
                    name: "prop_btl-people_user_alfresco",
                    value: (this.contactPerson) ? this.contactPerson.user_alfresco : ""
                    }
  		   };
		   
		   var rootNodeRef = {
	    			  name: "btl/widgets/base/TextBox",
				      config: {
				         name: "rootNodeRef",
				         value: this.rootNodeRef,
				         visibilityConfig: {
				            initialValue: false
				         }
				      }
		   };

           var addressContactPerson = {
               name: "btl/widgets/controlFormContactPerson/Address",
               config: {

                   value: (this.contactPerson) ? this.contactPerson.address : ""
               }
           };


           var cityContactPerson = {
               name: "btl/widgets/base/TextBox",

               config: {
                   label:  "Город",
                   name: "prop_btl-person_city",
                   style:{width: "300px"},
                   value:  (this.contactPerson) ? this.contactPerson.city : ""
               }
           };

           var regionContactPerson = {
               name: "btl/widgets/base/TextBox",
               config: {
                   label:  "Район",
                   name: "prop_btl-person_region",
                   style:{width: "300px"},
                   value:  (this.contactPerson) ? this.contactPerson.region : ""
               }
           };

           var oblastContactPerson = {
               name: "btl/widgets/base/TextBox",
               config: {
                   label:  "Область (край, республика)",
                   name: "prop_btl-person_oblast",
                   style:{width: "300px"},
                   value:  (this.contactPerson) ? this.contactPerson.oblast : ""
               }
           };


		   var refToPosition = {
			   name: "btl/widgets/base/TextBox",
        		 config: {
        		    label:  "Должность",
        		    name: "prop_btl-person_position",
        		    style:{width: "300px"},
        		    value:  (this.contactPerson) ? this.contactPerson.position : ""  
        		    }				   
                 
           };

		  /* var refToAlfrescoUser = {
				   name:"btl/widgets/base/ItemPicker",
				   config:{
					   name: "assoc_btl-person_alfrescoUser",
					   value: (this.contactPerson) ? this.contactPerson.alfrescoUser_ref : "",
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

		   var refToAlfrescoUser = {
                  name:"btl/widgets/base/btlChoice",
                  id: "ASSOC_BTL_PERSON_ALFRESCO_USER",
                  config:{
                       name: "assoc_btl-people_user_alfresco",
                       header: "Выбрать аккаунт пользователя Alfresco",
                       value: (this.contactPerson) ? this.contactPerson.alfrescoUser_ref : "",
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


		   var colPhone = { name: "alfresco/forms/ControlColumn",
		 			 config: {
		 				 widgets: [ ]
		 			}
		   };
		   
		   var colAddress = { name: "alfresco/forms/ControlColumn",
		 			 config: {
		   				style:{
		   					"margin-left":"25px"
						},
		 				 widgets: [ ]
		 			}
		   };

          /* var colCity = { name: "alfresco/forms/ControlColumn",
               config: {
                   widgets: [ ]
               }
           };

           var colRegion = { name: "alfresco/forms/ControlColumn",
               config: {
                   widgets: [ ]
               }
           };

           var colOblast = { name: "alfresco/forms/ControlColumn",
               config: {
                   widgets: [ ]
               }
           };*/

		   
		   var rowPersonInfo = { name: "alfresco/forms/ControlRow",
					 config: {
	                     widgets: [ ]
					}
		   };
		   
		   var colPersonInfo = { name: "alfresco/forms/ControlColumn",
					 			 config: {
					 				 widgets: [ ]
					 			}
		   };
		   
		   var rowContactInfo = { name: "alfresco/forms/ControlRow",
								 config: {
				                     widgets: [ ]
								}
		   };
		   
		   var rowInfo = { name: "alfresco/forms/ControlRow",
					 config: {
	                     widgets: [ ]
					}
		   };
		   
		   var winPersonInfo = {
			    name: "btl/widgets/base/ClassicWindow",
			    config: {
			      title: "",
			      style: "width:1125px",
			      widgets:[ ]
			    }
		   };
		   
		   var winContactInfo = {
			   name: "btl/widgets/base/ClassicWindow",
			   config: {
			     title: "Контактная информация",
			     widgets:[ ]
			   }
		   };
		   
		   var winAdditionalInfo = {
        	   name: "btl/widgets/base/ClassicWindow",
        	   config: {
        		 widthPc: "40",
        	     title: "Дополнительная информация",
        	     widgets:[ ]
        	   }
		   };
		   
		   var mainWidget = { name: "alfresco/forms/ControlColumn",
					 config: {
					        widgets: [ ]
					 }};
		   
		   if(this.contactPerson){
			   mainWidget.config.widgets.push( {
					name: "btl/widgets/base/TextBox",
				      config: {
				         name: "nodeRef",
				         value: this.contactPerson.nodeRef,
				         visibilityConfig: {
				            initialValue: false
				         }
				      }
				},
				{
					name: "btl/widgets/base/TextBox",
				      config: {
				         name: "rowId",
				         value: this.contactPerson.rowId,
				         visibilityConfig: {
				            initialValue: false
				         }
				      }
				});
		   }
		   else{
			   mainWidget.config.widgets.push( {
					name: "btl/widgets/base/TextBox",
				      config: {
				         name: "alf_destination",
				         value: this.nodeRefContactor,
				         visibilityConfig: {
				            initialValue: false
				         }
				      }
				});
		   }
			
		   
		   winAdditionalInfo.config.widgets.push(refToAlfrescoUser, sexContactPerson, closeChoiceContactPerson);
           colAddress.config.widgets.push(addressContactPerson ,  cityContactPerson,  regionContactPerson, oblastContactPerson);

		   colPhone.config.widgets.push(phoneContactPerson, mobileContactPerson, emailContactPerson);
		   rowContactInfo.config.widgets.push(colPhone, colAddress);
		   winContactInfo.config.widgets.push(rowContactInfo);
		   rowPersonInfo.config.widgets.push(surnameContactPerson, firstnameContactPerson, middlenameContactPerson);
		   colPersonInfo.config.widgets.push(rowPersonInfo, refToPosition);
		   winPersonInfo.config.widgets.push(colPersonInfo);
		   rowInfo.config.widgets.push(winContactInfo, winAdditionalInfo);
		   mainWidget.config.widgets.push(rootNodeRef, fullNameOrganization, winPersonInfo, rowInfo);
		   widgets.push(mainWidget);
		   
		   return widgets;
	   }
	   
	   
   });
});