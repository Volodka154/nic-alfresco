define(["dojo/_base/declare",
    "meeting/forms/_DynamicForm",
    "meeting/utils/base",
    "dojo/_base/lang",
    "jquery", "jqgrid-locale-ru", "jqgrid",
   

], function (declare, DynamicForm, utilBase, lang) {

    return declare([DynamicForm], {
    	
    	room:null,
		startDate:"",
		endDate:"",
		state:"",
		isSecretary : false,
    	isAdmin : false,
    	isClerk : false,
   	    	
        getMainWidget:function(state){
        	return [
        	        {
        			    id: "TAB_MEETING",
        			    name: "meeting/forms/MainForm",
        			    title: "Мероприятие",
        			    config: {
        			        validFormValuesPublishTopic:"TAB_MEETING_IS_VALID",
        			        storeId: this.storeId,
        			        user: this.userInfo,
        			        alf_destination: this.alf_destination,
        			        room:this.room,
        			        startDate: this.startDate,
        			        endDate: this.endDate,					   				
        					isClerk:this.isClerk,
        			        isAdmin:this.isAdmin,
        			        isSecretary:this.isSecretary,
        			        isDisableState: !(["Подготовлен","На доработке","","Черновик","Подтверждение переговорной","Переговорная подтверждена"]).includes(state),
        			        state:state          
        			    }
        			}  
        	        ]                      
                
        },
        
        getWidgets:function(state){
        	
        	var widgetsTabs = this.getMainWidget(state);
        	if (state != "")
     	   {
     		   	widgetsTabs.push( 
		   			{
				       id: "TAB_ATTACHMENTS",				       
				       name: "meeting/forms/Attachments",
				       title: "Вложения",
				       delayProcessing:false,
				       config: {
				           storeId: this.storeId,
				           isClerk:this.isClerk,
				           isAdmin:this.isAdmin,
				           isSecretary:this.isSecretary,
				           isChairman:this.isChairman
				       }
		   			},
		   			
		   			{ 
                       id: "TAB_LINKS",
                       name: "meeting/forms/Links",
                       title: "Ссылки",
                       delayProcessing:false,
                       config: {
                           storeId: this.storeId,
                       }
                   }
                   
		   			
     		   	);
     		   	
     		   	if ((["На согласовании","Согласован","На подписании",
     		         "На регистрации","Зарегистрирован","На исполнении",
     		         "В архиве","Подготовлен","На доработке"]).includes(this.state))
     			{
     		   		widgetsTabs.push( 
		   				{
		   					id: "TAB_APPROVAL",
		   					name: "meeting/forms/Approval",
		   					title: "Согласование",
		   					delayProcessing:false,
		   					config: {
					           storeId: this.storeId,
					           routeConfigEnable: ((state == "Подготовлен" || state == "На доработке") && (this.isClerk || this.isAdmin || this.isSecretary))
		   					}
		   				});
     			}
     		   	
     		   	
     		   	if ((["Зарегистрирован","На исполнении","В архиве"]).includes(state))
      			{
      		   		widgetsTabs.push( 
  		   			{
					       id: "TAB_TASKS",
					       name: "meeting/forms/Tasks",
					       title: "Резолюции",
					       delayProcessing:false,
					       config: {
					           storeId: this.storeId,
					       }
					   });
      			}
     		   	
     		   	
     	   }
        	return widgetsTabs;
        	
        },
        
        
        
        getModelWidget:function(state){ 
        	
        	return [
	        	    {
			    		name: "alfresco/layout/AlfTabContainer",			    		
			            config: {
			                widgets: this.getWidgets(state),
			                
			                _tabChanged: function(name, oldTab, newTab) {
			                	
			                	if (newTab)
		                		{
			                		switch(newTab.title)
			                		{
				                		case "Вложения":
				                			this.alfPublish("selectTabAttachments", {}, true);
				                			break;
                                        case "Ссылки":
                                            this.alfPublish("selectTabLinks", {}, true);
                                            break;
			                		}
		                		}
			                   
			                }
			                
			               
			            }
					}
	        	   ]
        },
        
        
        postCreate: function () {        	
            this.alfSubscribe("CHANGE_STATE_MEETING_DOCUMENT", lang.hitch(this, this.setState), true);                       
            this.widgets = this.getModelWidget(this.state);                       
            this.inherited(arguments);
        },
        
        
        setState: function(payload){       	        	
        	this.state = payload.state;    
        	
        	var store = utilBase.getStoreById("MEETING_STORE");            
            handleAlfSubscribe = store.handleAlfSubscribe;            
            for (var i in handleAlfSubscribe)
        	{
            	this.alfUnsubscribe(handleAlfSubscribe[i])
        	}
            
        	
        	var widgetsTabs = this.getModelWidget(this.state);        	   
        	this.widgets = widgetsTabs;         	     	           	
        	this.applyModel();
        },
        
        applyModel: function () {
            this.onDynamicFormUpdate({value: JSON.stringify([this.widgets[0]])});
        },
        
        

    });
});