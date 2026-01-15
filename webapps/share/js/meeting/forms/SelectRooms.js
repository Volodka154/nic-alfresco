define(["dojo/_base/declare",
        "alfresco/core/Core",
        "dojo/_base/lang",
        "btl/widgets/base/ClassicWindow",
        "meeting/forms/controlSelectRoom/calendar/calendarForm"
        ],
        function(declare, Core, lang ) {

   return declare([Core], {
  
	   cssRequirements: [{cssFile:"dojox/calendar/themes/claro/Calendar.css"}],
     	   
	   constructor: function (args) {
		   lang.mixin(this, args);
		   this.alfSubscribe("BTL_CREATE_FORM_MEETINGS_SELECT_ROOMS", lang.hitch(this, this.onCreateFormSelectRooms));
	   },
	   
	   onCreateFormSelectRooms: function (data){
		   
	    	  var payload = {};
	    	  this.inputData = data;
	    	  payload.dialogTitle = "Выбор переговорной";
	    	  payload.dialogConfirmationButtonTitle = "Применить";
	    	  payload.dialogCancellationButtonTitle = "Отмена";
	    	  payload.formSubmissionTopic = "MEETING_SELECT_ROOM";
	    	  payload.contentWidth = "1450px";
	    	  payload.contentHeight = "775px";
	    	  payload.pubSubScope = "_FORM_SELECT_ROOM";
	    	  payload.dialogId = "FORM_SELECT_ROOM";
	    	  payload.widgets = this.getWidgets();
	    	  this.alfPublish("ALF_CREATE_FORM_DIALOG_REQUEST", payload);
	   },
	   
	   getWidgets: function (){
		   
		  
		   var widgets = [];
		   
		 
		   var winContactInfo =
		   {
                   name:"alfresco/forms/ControlRow",
                   config:{
                       widgets:[
                           {
                        	   
                               name: "alfresco/forms/ControlColumn",
                               widthPx: "430",
                               config: 
                               {
                                   widgets: [
                                             {
                                            		name: "btl/widgets/base/ClassicWindow",
                                            		widthPx: "430",
                    	               				config: 
                    	               				{
                    	               					style: "height: 507px;",
                    	               					title: "Список переговорных",
                    		               				widgets:
                    		               				[				               
                    		               					{
                    		               						name: "meeting/forms/controlSelectRoom/grids/Rooms"                                   
                    		               					}
                    		               				           
                    		               				]
                    	               				}
                                             },
                                             {
                                         		name: "btl/widgets/base/ClassicWindow",
                 	               				widthPx: "430",
                 	               				config: 
                 	               				{
                 	               					title: "Время проведения мероприятия",
                 		               				widgets:
                 		               				[	
                 		               				 	{
															name: "alfresco/forms/ControlColumn",
															config: 
															{
																 widgets: [
																           
																			{
																				name: "meeting/forms/controlSelectRoom/dateTime/StartDateTime"                                   
																			},
																			{
																				name: "meeting/forms/controlSelectRoom/dateTime/EndDateTime"                                   
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
                       	   	name: "btl/widgets/base/ClassicWindow",
	               				config: 
	               				{
	               					title: "Календарь",
		               				widgets:
		               				[	
		               				 
		               				 
		               				      {
		               				    	name: "meeting/forms/controlSelectRoom/calendar/calendarForm",	
		               				    	id:"selectRoomCalendar",
		               				    	config:{
		               				    		inputData:(this.inputData)?this.inputData:null
		               				    	}
		               				      }    
		               				      
		               				]
	               				}
                          }
                   ]}
		   };
			;		   
		 
		 		   
	   
		   widgets.push(winContactInfo);
		   
		   return widgets; 
		   
	   }
	   
   });
});