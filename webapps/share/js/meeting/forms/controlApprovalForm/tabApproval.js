
define(["dojo/_base/declare",
    "meeting/forms/_DynamicForm",
    "dojo/_base/lang"

], function (declare, DynamicForm, lang) {

    return declare([DynamicForm], {

    	routeConfigEnable:false,
    	
        postCreate: function () {
        	
        	var navigateButtonTree = [];
        	if (this.routeConfigEnable)  
    		{
        		navigateButtonTree.push({
		            	name: "alfresco/layout/HorizontalWidgets",
						config: {
						    widgets: [
						              {
						            	  name: "meeting/forms/controlApprovalForm/panels/navigateButtonTree"
						              }
						             ]
						}
	              });
    		}
        	
        	navigateButtonTree.push({
	            	name: "alfresco/forms/ControlRow",
					config: {
					    widgets: [
					              
									{
										  name: "meeting/forms/controlApprovalForm/tree/treeApproval"
									}																																														
									
					             ]
					}
	          });
        	
        	
        	var route = {
							name: "meeting/layout/ClassicWindow",
							widthPx: 370,
							config: {
								style:"width: 370px;",
							    title: "Маршрут:",
							    type: "primary",
							    widgets: navigateButtonTree							              
							}
						};
        		
        	
        	var routeConfig = {};
        	
        	if (this.routeConfigEnable)  
    		{
				routeConfig = {
									name: "meeting/layout/ClassicWindow",
									widthPx: 690,
									config: {
										style:"width: 690px;",
									    title: "Формирование маршрута3:",
									    type: "info",
									    widgets: [
									              {
									            	  name:"meeting/forms/controlApprovalForm/constructorRoute"
									              }
									             ]
									}
								};
    		}
        	
            this.widgets = [
                            {
								name: "alfresco/forms/ControlRow",
								config: {
								    widgets: [ route, routeConfig ]
								}
                            },
                            
                            {
                            	name: "alfresco/forms/ControlRow",
								config: {
								    widgets: [
												{
													name: "meeting/layout/ClassicWindow",
													widthPx:1090,								
													config: {
														style:"width: 1090px;",
													    title: "Итоги согласования:",
													    type: "info",
													    widgets: [
																	{
																		name:"meeting/menuBarItems/PrintNegotiationResult"
																	},
														            {
														            	name:"meeting/forms/controlApprovalForm/negotiationResultList/negotiationResultList"
														            }
													             ]
													}
												}
								              ]
								}
                            }
                            
                        	
                            
                            
                            
                            
                            ];
            //Добаляем виджеты до вызова конструктора
            this.inherited(arguments);
        },

    });
});