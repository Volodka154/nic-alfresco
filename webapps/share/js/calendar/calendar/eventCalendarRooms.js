/**
 * Created by nabokov on 23.11.2016.
 */
define(["dojo/_base/declare",
        "alfresco/core/Core",
        "dojox/calendar/Calendar",
        "dojo/_base/lang",
        "alfresco/core/CoreXhr",
        "meeting/utils/base",
        "dojo/store/Memory",
        "dojo/store/Cache",
        "dojo/store/Observable",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dojo/text!./templates/EventCalendar.html"],
    function (declare, Core, Calendar, lang, CoreXhr, utilBase, Memory, Cache, Observable, base, template, templateHTML) {
        return declare([base, template, Core, CoreXhr], {
        	
        	templateString: templateHTML,
            room : null,
            roomObject : null,
            roomContent : "",
        	style: "position: relative; width: 99vw; height: calc(100vh - 110px);",
        	startTime: null,
        	endTime: null,
        	inputData:null,
        	selectDate:null,
        	
        	cssRequirements: [{cssFile:"./css/eventCalendarRooms.css"}],
        	
        	            
            postMixInProperties: function () {
                this.inherited(arguments);
            	//this.alfSubscribe("LOAD_CALENDAR_ROOM", lang.hitch(this, this.loadCalendar), true);   
            	//this.alfSubscribe("UPDATE_NEW_MEETING_CALENDAR_ROOM", lang.hitch(this, this.updateNewMeeting), true);   
            },
            
        
        	itemDoubleClick:function(e){     
        		
        		this.alfPublish("ITEM_MEETING_CKICK", {nodeRef:e.item.id}, true);
        	},
          
        	gridClick:function(date)
        	{
        		
        		this.alfPublish("BTL_CREATE_FORM_MEETINGS_SELECT_ROOMS", {date:date.date}, true);
        		// console.log(date);
        	},
        	
        
        	checkIntersectionTime: function(item){        		
        		return false;
        	},
        	        	
        	checkMinimalTime:function(item){        		        		
        		return false;
        	},
        	
        	itemEdit:function(item, rendererKind){          				
      		   		return false;      		   
        	},
        	
            load:function(someData){
            	
            	this.domNode.innerHTML = "";
            	if (!someData)
            		someData = [];
            	
            	
            	var startDate = new Date();
            	
            	if (this.selectDate)
        		{
            		startDate = new Date(this.selectDate);
            		if (isNaN( startDate.getTime()))
            			startDate = new Date();
        		}
            	
            	
            	
            	this.calendar = new Calendar({            	  
					date: startDate,
					store: new Observable(new Memory({data: someData})),              	   
					dateInterval: (this.calendar)?this.calendar.dateInterval:"month",
					columnViewProps:{
						minHours:8,
						maxHours:22,
						timeSlotDuration :30,
						hourSize:37
              	   	},
              	   	style: this.style,
              	   	isItemMoveEnabled: this.itemEdit.bind(this),              		  
              	   	isItemResizeEnabled: this.itemEdit.bind(this),
              	   	onItemDoubleClick:this.itemDoubleClick.bind(this),
          	       
              	   	onGridDoubleClick:this.gridClick.bind(this),
          		   
              	   	formatItemTimeFunc: function(d, rd, view, item){
          			    return rd.dateLocaleModule.format(item.startTime, {
            			      selector: 'time',
              			      timePattern: "HH':'mm"
              			    }) + ' - ' + rd.dateLocaleModule.format(item.endTime, {
                			      selector: 'time',
                  			      timePattern: "HH':'mm"
                  			    })
          			  }
          			  
          			
              	   
              	   
              	 });
            	
            	___this = this;
            	 
            	
            	
            	this.calendar.dateLocaleModule.isWeekend = this.isWeekend.bind(this);
            	 
                this.calendar.placeAt(this.domNode);
                this.calendar.startup();
            },
            
            isWeekend:function(d){
        		
        		var dStr = d.getFullYear() + "-" + (d.getMonth() +1) + "-" + d.getDate();
       		    
        		if (this.weekendDays.indexOf(dStr) > -1)
    			{
        			return true;
    			}
        		
        		if (this.workDays.indexOf(dStr) > -1)
    			{
        			return false;
    			}
        		
        		if (d.getDay() == 6 || d.getDay() == 0)
    			{
        			return true;
    			}
        		
  				return false;
  			},
  			
            postCreate: function() {
            	this.loadCalendar(null);
             },
            
            loadCalendar: function(payload){          	            	            	
            	
        		this.serviceXhr({
            	    url: "/share/proxy/alfresco/meeting/get-my-meeting",
            	    method: "GET",
            	    successCallback: this.successLoadData,
            	    callbackScope: this
            	  });
        		
            },     
            
            successLoadData:function(payload){            	
            	
            	var data = [];
            	
            	if (payload.meetings)
        		{
            		for (var i=0; i<payload.meetings.length; i++)
        			{            			
            			var meeting = payload.meetings[i];
            			if (meeting.startDate && meeting.endDate)
        				{
	            			data.push({
	            				id: meeting.nodeRef,
		                	    summary: meeting.theme,
		                	    room:meeting.room,
		                	    startTime:  new Date(meeting.startDate),
		                	    endTime: new Date(meeting.endDate)
	            			});
        				}
        			}
        		}
            	this.load(data);
            	
            }
            
            
             
             
             
            
        });
    });