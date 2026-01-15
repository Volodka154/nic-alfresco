
define(["dojo/_base/declare",
    "meeting/forms/_DynamicForm",
    "dojo/_base/lang"

], function (declare, DynamicForm, lang) {

    return declare([DynamicForm], {
    	
        postCreate: function () {
        	
        	this.widgets = [
        	                
{
    name: "alfresco/forms/ControlColumn",
    config: {
        widgets: [
					{
					    name: "alfresco/forms/ControlColumn",
					    config: {
					        widgets: [
								{
									  name: "meeting/forms/controlApprovalForm/choices/NegotiatorsList"																										  
								},
								{
								    name: "alfresco/layout/HorizontalWidgets",
								    config: {
								        widgets: [
								                  
													{
													  name: "meeting/forms/controlApprovalForm/treeSelect/treeSelectApproval",
													  id:"APPROVAL_NEGOTIATORS_TREE_LIST",
													  widthPx: 500,
													},
													{
													  name: "alfresco/forms/ControlColumn",
													  widthPx: 100,
													  config: {
														  style:"margin-left: 10px;",
													      widgets: [
																	{
																	  name: "alfresco/layout/HorizontalWidgets",
																	  config: {
																		  onResize:function(){
																			  
																		  },
																		  
																		  style:"",
																	      widgets: [
																					{																																		
																						name: "meeting/forms/controlApprovalForm/buttons/_Button",
																						widthPx: 37,
																						config:{
																							style:"width: 37; margin: 0;",
																							label: "&#9650;",
																					        publishTopic: "UP_NEGOTIATOR",
																					        publishGlobal: true,
																					        disabled:true,
																					        disableSubscribeTopic:"NEGOTIATOR_CONTROL_NAVIGATE_DISABLE"
																						}
																					},
																					{
																						name: "meeting/forms/controlApprovalForm/buttons/_Button",
																						widthPx: 37,
																						config:{
																							style:"width: 37; margin: 0; margin-left: 2px;",
																							label: "&#9660;",
																					        publishTopic: "DOWN_NEGOTIATOR",
																					        publishGlobal: true,
																					        disabled:true,
																					        disableSubscribeTopic:"NEGOTIATOR_CONTROL_NAVIGATE_DISABLE"
																						}
																					}
																	                ]
																	  }
																	},
																	{
																		name: "meeting/forms/controlApprovalForm/buttons/_Button",
																		widthPx: 80,
																		config:{
																			style:"width: 80px; margin-top: 2px",
																			label: "Удалить",
																	        publishTopic: "DELETE_NEGOTIATOR",
																	        publishGlobal: true,
																	        disabled:true,
																	        disableSubscribeTopic:"NEGOTIATOR_CONTROL_NAVIGATE_DISABLE"
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
					},
					
					{
					    name: "alfresco/forms/ControlColumn",
					    config: {
					        widgets: [																											
										{
											  name: "alfresco/html/Label",
											     config: {
											         label: "Тип маршрутизации:"
											     }  
										}
					        ]
					    }
					},
					{
					    name: "alfresco/forms/ControlColumn",
					    config: {
					        widgets: [
										{
											  name:"dijit/form/Select",
											  id:"SELECT_TTPE_APPROVAL",
											  config:{
												  style:"width:300px",
												  options: [
												            { label: "Параллельное", value: "0", selected: true  },
												            { label: "Последовательное", value: "1"}
												        ]
											  }
										}
					        ]
					    }
					},
					{
					    name: "alfresco/forms/ControlColumn",
					    config: {
					        widgets: [																											
										{
											  name: "alfresco/html/Label",
											     config: {
											         label: "Срок согласования:"
											     }  
										}
					        ]
					    }
					},
					{
					    name: "alfresco/forms/ControlColumn",
					    config: {
					        widgets: [																											
										{
											  name:"dijit/form/NumberTextBox",
											  id:"DURATION",
											  config:{
												  style:"width:300px"
											  }
										}
					        ]
					    }
					},
					{
					    name: "alfresco/forms/ControlColumn",
					    config: {
					        widgets: [																											
										{
											  name: "alfresco/html/Label",
											     config: {
											         label: "Тип задачи:"
											     }  
										}
					        ]
					    }
					},
					{
					    name: "alfresco/forms/ControlColumn",
					    config: {
					        widgets: [
										{
											  name:"dijit/form/Select",
											  id:"TYPE_TASK_APPROVAL",
											  config:{
												  style:"width:300px",
												  options: [
												            { label: "Согласование", value: "0", selected: true  },
												            { label: "Подписание", value: "1"}
												        ]
											  }
										}
					        ]
					    }
					},
					{
					    name: "alfresco/forms/ControlColumn",
					    config: {
					        widgets: [																											
										{
											  name: "alfresco/html/Label",
											     config: {
											         label: "Название этапа:"
											     }  
										}
					        ]
					    }
					},
					{
					    name: "alfresco/forms/ControlColumn",
					    config: {
					        widgets: [																											
										{
											  name:"dijit/form/TextBox",
											  id:"APPROVAL_NAME",
											  config:{
												  style:"width:300px"
											  }
										}
					        ]
					    }
					},
					{
					    name: "alfresco/forms/ControlColumn",
					    config: {
					        widgets: [																											
										{
											  name:"dijit/form/CheckBox",
											  id: "USER_DOC_SIGNER",
											  config:{
												  checked: true
											  }
										},
										{
											  name: "alfresco/html/Label",
											     config: {
											         label: "Перенести подписанта из основной информации документа"
											     }  
										}
					        ]
					    }
					},
					{
					    name: "alfresco/forms/ControlColumn",
					    config: {
					        widgets: [																											
										{
											name: "meeting/forms/controlApprovalForm/buttons/_Button",
											config:{
												style:"margin-top: 15px;",
												label: "Добавить",
										        publishTopic: "ADD_LEVEL",
										        publishGlobal: true,
										        pubSubScope:"",
										        visibilityConfig: {
										            initialValue: true,
										            rules: [
										               {
										            	  topic: "ADD_LEVEL_VISIBLE",
										            	  attribute: "visible",
										                  is: [true]
										               }
										            ]
										         }
											}
										},
										{
											name: "meeting/forms/controlApprovalForm/buttons/_Button",
											config:{
												style:"margin-top: 15px;",
												label: "Сохранить",
										        publishTopic: "EDIT_LEVEL",
										        publishGlobal: true,
										        pubSubScope:"",
										        visibilityConfig: {
										            initialValue: false,
										            rules: [
										               {
										            	   
										            	  topic: "ADD_LEVEL_VISIBLE",
										            	  attribute: "visible",
										                  is: [false]
										               }
										            ]
										         }
											}
										}
					        ]
					    }
					}
                  
	              
            ]
    }
}
							  
        	];
        	
            this.inherited(arguments);
            
        }
        
    });
});