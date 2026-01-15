define(["dojo/_base/declare",
        "btl/widgets/base/DataGrid",
        "alfresco/core/CoreXhr",
        "alfresco/core/Core",
        "dojo/_base/lang",
        "service/constants/Default",
        "dijit/registry"],
        function(declare, DataGrid, CoreXhr, Core, lang, AlfConstants, registry) {

    var getHoverTreeNode = function( event ) {
        var curElement = document.elementFromPoint(event.clientX, event.clientY);
        if (curElement == null)
            return null;

        var curHoverNode = curElement.closest('.dijitTreeNodeHover');
        if (curHoverNode == null || !curHoverNode.hasAttributes)
            return null;

        if (curHoverNode.parentNode != null){
            var parentClass = curHoverNode.parentNode.getAttribute("class");
            if (parentClass != null && !isClassTreeBranch(parentClass))
                return null;
        }

        var nodeId = curHoverNode.getAttribute("id");
        if (nodeId != null)
            return registry.byId(nodeId);

        return null;
    };

    var getSelectedTreeNode = function(){
       var tree = document.getElementById("ID_TREE_GROUP");
       var selectedNode = tree.getElementsByClassName('dijitTreeRowSelected');
       if (selectedNode.length == 0)
           return null;
       var nodeId = selectedNode[0].parentNode.getAttribute("id");
       if (nodeId == null)
           return null;
       return registry.byId(nodeId);
    }

    var transferEmployee = function( _this, employeeId, startGroupId, endGroupId ){
        var success = false;
        if (endGroupId == null)
            return success;
        if (startGroupId == endGroupId)
            return success;

        var sendData = new Object();
        if (startGroupId != null && endGroupId == "all")
            sendData["assoc_btl-emp_group_removed"] = startGroupId;
        if (endGroupId != "")
            sendData["assoc_btl-emp_group_added"] = endGroupId;

        var employee = {};
        employee.nodeRef = employeeId;

        _this.alfLog("log", "btl_DataGridGroup__transferEmployee", employee);
        _this.serviceXhr({
            url: "/share/proxy/alfresco/api/node/" + employeeId.replace("://", "/") + "/formprocessor",
            method: "POST",
            sync: true,
            data: sendData,
            successCallback: success = true,
            callbackScope: this
          });

        if (success){
            _this.alfPublish("DATAGRID_EDIT_ROW", employee);
            if (endGroupId == "all") // Удаляется только при переносе во "Все сотрудники"
                _this.deleteRowFromStore();
        }

        return success;
    }

    var isClassTreeBranch = function( classString ) {
        return classString.indexOf("dijitTreeNodeContainer") != -1;
    }

   return declare([DataGrid, CoreXhr, Core], {
	   title: "",
	   Url: "search/employee",
	   colModel: [ ],
       filterModel: { on: true, mode: "AND", header: true },
	   //selectionModel: { type: 'null ', mode: 'block' },
	   allChild: false,
	   type: "group_employee",
	   parentTreeType: "btl-group:group-folder",
	   toolbar : {
           cls: 'pq-toolbar-crud',
           items: [
                   { type: '<span><input id="checkboxAllChild" type="checkbox" onchange="window.employeeGrid.allChild = this.checked; window.employeeGrid.loadDataDataGrid(window.employeeGrid.dataEmployee);" >Отображать все дочерние</span>'}
           ]
       },
	   
	   postMixInProperties: function alfresco_DataGridGroup__postMixInProperties() {
		      this.inherited(arguments);
		      this.alfSubscribe("BTL_EDIT_GROUP_EMPLOYEE", lang.hitch(this, this.editGroupEmployee), true);
		      this.alfSubscribe("DATAGRID_DELETE_EMLPOYEE", lang.hitch(this, this.deleteEmployee), true);
		      this.alfSubscribe("DATAGRID_GET_EMLPOYEE_DATA", lang.hitch(this, this.getEmployeeData), true);
	   },

	   gridAutoSize: function gridAutoSize(){
		   var height = document.documentElement.offsetHeight ;
		   height -= document.getElementById('SHARE_HEADER').offsetHeight;
		   height -= 50;

		   var width = document.documentElement.offsetWidth - document.getElementById('MAIN_LIST_MENU').offsetWidth - document.getElementById('ID_TREE_GROUP').offsetWidth;
		   width -= 30;
		   return { "height": height, "width": width};
	   },
		   
	   loadDataToDataGrid: function alfresco_DataGrid__loadDataToDataGrid(response, originalRequestConfig){
		    this.setDataDataGrid(response.items);
		    window.employeeGrid = this;
		},
		
	   editGroupEmployee: function alfresco_DataGrid__editGroupEmployee(payload) {
	    	this.alfLog("log", "btl_GroupService__editGroupEmployee", payload);
	    	
	    	this.employee = payload;
	    	this.serviceXhr({
	    	    url: "/share/proxy/alfresco/api/node/"+ payload.nodeRef.replace("://", "/") +"/formprocessor",
	    	    method: "POST",
	    	    data: this.employee,
	    	    successCallback: function(){ this.loadDataDataGrid(this.data); },
	    	    callbackScope: this
	    	  });
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
	            //window.employeeGrid.edit(arr[0].rowData.nodeRef);
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

	   edit: function alfresco_DataGrid__editDataGrid(id){
			this.serviceXhr({
	    		url: "/share/proxy/alfresco/search/employee?nodeRef=" + id + "&&oneInfo=true",
	      	    method: "GET",

	      	    successCallback: function (response)
					      	    {					            	
					            	this.employee = response.items[0];
						      	   	var payload = {};
						          	  
						          	payload.dialogTitle = "Редактирование РК сотрудника";
						          	payload.dialogConfirmationButtonTitle ="Сохранить";
						          	payload.dialogCancellationButtonTitle = "Отмена";
						          	payload.formSubmissionTopic = "BTL_EDIT_GROUP_EMPLOYEE";
						          	payload.widgets = this.getWidgets();
						          	payload.dialogId = "FORM_GROUP_EMPLOYEE";
						          	payload.contentWidth = "1250px";
						          	this.alfPublish("ALF_CREATE_FORM_DIALOG_REQUEST", payload, true);
					      	    },
	      	    callbackScope: this
	      	  });
	   },
		 
	   getWidgets: function alfresco_formEmployee__getWidgets(){
			   var optionsSex = [{value:"Мужской", label:"Мужской"},{value:"Женский", label:"Женский"}];
			   
			   var widgets = [ ];		   
			   
			   var firstname = {
			       	    name: "alfresco/forms/controls/DojoValidationTextBox",
			    	    id:"btl-emp_firstname",
			    	    config: {
			    	       label: "btl-emp_firstname.title",
			    	       name: "prop_btl-emp_firstname",
			    	       value: (this.employee !== null) ? this.employee.firstname : "" , 
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
			    	    id:"btl-emp_middlename",
			    	    config: {
			    	       label:  "btl-emp_middlename.title",
			    	       name: "prop_btl-emp_middlename",
			    	       value: (this.employee !== null) ? this.employee.middlename : ""
			    	    }
			    	 };
			   
			   var surname = {
			    		name: "alfresco/forms/controls/DojoValidationTextBox",
			    	    config: {
			    	       label:  "btl-emp_surname.title",
			    	       name: "prop_btl-emp_surname",
			    	       value: (this.employee !== null) ? this.employee.surname : "",
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
			    		    value: (this.employee !== null) ? this.employee.position : "",
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
	                      value: (this.employee !== null) ? this.employee.position_ref : "",
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

			  var refToDepartment = {
	                name:"btl/widgets/base/btlChoice",
	                id: "ASSOC_BTL_EMP_DEPARTMENT",
	                config:{
	                      name: "assoc_btl-emp_department",
	                      header: "Выбрать подразделение",
	                      value: (this.employee !== null) ? this.employee.department_ref : "",
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
	                     value: (this.employee !== null) ? this.employee.director_ref : "",
	                     labelText: "btl-person_director.title",
	                     labelButton: "...",
	                     urlList: "/share/proxy/alfresco/filters/association",
	                     dataUrl:{
	                         "type":"btl-emp:employee-content",
	                         "s_field":"surname",
	                         "field":"surname,firstname,middlename"
	                     },
	                     itemUrl:"/share/proxy/alfresco/picker/associationItem",
	                     dataItemUrl:{
	                         "type":"btl-emp:employee-content",
	                         "field":"surname,firstname,middlename"
	                     }
	               }
	          };

	           var refToAlfrescoUser = {
	               name:"btl/widgets/base/btlChoice",
	               id: "ASSOC_BTL_EMP_USER_ALFRESCO",
	               config:{
	                    name: "assoc_btl-emp_user_alfresco",
	                    header: "Выбрать аккаунт пользователя Alfresco",
	                    value: (this.employee !== null) ? this.employee.user_alfresco_ref : "",
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
	                        value: (this.employee !== null) ? this.employee.delegates_ref : "",
	                        labelText: "",
	                        single: false,
	                        height: "255px",
	                        labelButton: "Выбрать",
	                        urlList: "/share/proxy/alfresco/filters/association",
	                        dataUrl:{
	                            "type":"btl-emp:employee-content",
	                            "s_field":"surname",
	                            "field":"surname,firstname,middlename"
	                        },
	                        itemUrl:"/share/proxy/alfresco/picker/associationItems",
	                        dataItemUrl:{
	                            "type":"btl-emp:employee-content",
	                            "field":"surname,firstname,middlename"
	                        },
	                        excluded:(this.employee !== null) ? [this.employee.nodeRef.toString()] : []
	                  }
	           };			   			
			   
			   var phone = {
			    		 name: "btl/widgets/base/TextBox",
			    		 config: {
			    		    label:  "btl-emp_phone.title",
			    		    name: "prop_btl-emp_phone",
			    		    style:{width: "300px"},
			    		    value: (this.employee !== null) ? this.employee.phone : "" 
			    		    }
			    	 };
			   
			   var mobile = {
			    		 name: "btl/widgets/base/TextBox",
			    		 config: {
			    		    label:  "btl-emp_mobile.title",
			    		    name: "prop_btl-emp_mobile",
			    		    style:{width: "300px"},
			    		    value: (this.employee !== null) ? this.employee.mobile : "" 
			    		    }
			    	 };
			   
			   var fax = {
			    		 name: "btl/widgets/base/TextBox",
			    		 config: {
			    		    label:  "btl-emp_fax.title",
			    		    name: "prop_btl-emp_fax",
			    		    style:{width: "300px"},
			    		    value:  (this.employee !== null) ? this.employee.fax : ""  
			    		    }
			    	 };
			   
			   var email = {
			    		 name: "btl/widgets/base/TextBox",
			    		 config: {
			    		    label:  "btl-emp_email.title",
			    		    name: "prop_btl-emp_email",
			    		    style:{width: "300px"},
			    		    value: (this.employee !== null) ? this.employee.email : "" 
			    		    }
			    	 };
			   
			   var tabnum = {
			    		 name: "btl/widgets/base/TextBox",
			    		 config: {
			    		    label:  "btl-emp_tabnum.title",
			    		    name: "prop_btl-emp_tabnum",
			    		    style:{width: "250px"},
			    		    value: (this.employee !== null) ? this.employee.tabnum : "" 
			    		    }
			    	 };
			   
			   var information = {
			    		 name: "alfresco/forms/controls/DojoTextarea",
			    		 config: {
			    		    label:  "btl-emp_information.title",
			    		    name: "prop_btl-emp_information",
			    		    value: (this.employee !== null) ? this.employee.information : "" 
			    		    }
			    	 };
			   
			   var close_choice = {
			    		 name: "alfresco/forms/controls/DojoCheckBox",
			    		 config: {
			    		    label:  "btl-emp_close_choice.title",
			    		    name: "prop_btl-emp_close_choice",
			    		    value: (this.employee !== null) ? this.employee.close_choice : ""  
			    		    }
			    	 };
			   
			   var sex = {
		    		   name: "alfresco/forms/controls/Select",
		    		   config: {
		    			  label:  "btl-emp_sex.title",
		    		      name: "prop_btl-emp_sex",
		    		      value: (this.employee !== null) ? this.employee.sex : "",
		    		      optionsConfig: {
		    		    	  fixed: optionsSex
		    		    	}
		    		   }
		    		};

			   var notActual = {
			            name: "alfresco/forms/controls/CheckBox",
			            config: {
	                        label:  "Отключен",
	                        name: "prop_btl-emp_notActual",
	                        value: (this.employee !== null) ? this.employee.notActual : false

	                    }
			        };

			   var not_email_notify = {
	                    name: "alfresco/forms/controls/CheckBox",
	                    config: {
	                           label:  "Не уведомлять по почте",
	                           name: "prop_btl-emp_not_email_notify",
	                           value: (this.employee !== null) ? this.employee.not_email_notify : false

	                       }
	                };
			   
			   if(this.employee !== null){
				   widgets.push( {
						name: "alfresco/forms/controls/DojoValidationTextBox",
					      config: {
					         name: "nodeRef",
					         value: this.employee.nodeRef,
					         visibilityConfig: {
					            initialValue: false
					         }
					      }
					},
					{
						name: "alfresco/forms/controls/DojoValidationTextBox",
					      config: {
					         name: "rowId",
					         value: this.employee.rowId,
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
			   
			   winAdditionalInfo.config.widgets.push(sex, tabnum, refToAlfrescoUser, notActual, not_email_notify ); // ,information
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

	   setEventsDataGrid: function alfresco_DataGrid__setEventsDataGrid(){
	        _this = this;
	    	this.grid.pqGrid({
	    	    rowDblClick: function( event, ui ) {	    	    	
	    	    	window.employeeGrid.getEmployeeData();
	    	    	//window.employeeGrid.edit(ui.rowData.nodeRef);
	    	    },
	    	    rowMouseDown: function( event, ui ) {
	    	        var downX = event.pageX;
                    var downY = event.pageY;
                    var dragIcon = null;
                    var hoverNode = null;

                    var rowData = _this.grid.pqGrid("getRowData", {rowIndx: ui.rowIndx});
                    var employeeId = rowData.nodeRef;
                    //_this.style.cursor= 'move';

                    event.preventDefault();

                    window.onmousemove = function( event ) {
                        var moveX = event.pageX - downX;
                        var moveY = event.pageY - downY;
                        if ( Math.abs(moveX) < 3 && Math.abs(moveY) < 3 )
                              return; // ничего не делать, мышь не передвинулась достаточно далеко

                        var shiftX = 0;
                        var shiftY = 0;

                        var iconSource = "/share/res/js/btl/widgets/base/css/images/";
                        hoverNode = getHoverTreeNode(event);
                        iconSource += (hoverNode != null) ? "IconUserGreen.png" : "IconUserGrey.png";

                        if (dragIcon == null){
                            dragIcon = new Image();
                            dragIcon.src = iconSource;
                            if (dragIcon.parentNode != document.body)
                                document.body.appendChild(dragIcon);
                            dragIcon.style.zIndex = 9999; // сделать, чтобы элемент был над другими
                            dragIcon.style.position = 'absolute';

                            if (!dragIcon)
                                  return;

                            //var coords = getCoords(dragIcon);
                            shiftX = downX; //- coords.left;
                            shiftY = downY; //- coords.top;
                        }
                        else
                            dragIcon.src = iconSource;

                        dragIcon.style.left = event.pageX - shiftX + 10 + 'px';
                        dragIcon.style.top = event.pageY - shiftY + 10 + 'px';

                        return false;
                    }

                    window.onmouseup = function(event) {
                        window.onmouseup = null;
                        window.onmousemove = null;

                        if (dragIcon != null)
                            dragIcon.hidden = true;

                        var selectedNode = getSelectedTreeNode();

                        var success = transferEmployee(_this, employeeId, selectedNode != null ? selectedNode.item.id : null, hoverNode != null ? hoverNode.item.id : null);
                    };
                },
	    	    showTitle: false
	    	});
	   },
   });
});