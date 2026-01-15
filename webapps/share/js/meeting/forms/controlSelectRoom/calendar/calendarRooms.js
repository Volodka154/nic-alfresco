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
        "dojo/text!./templates/Calendar.html"],
    function (declare, Core, Calendar, lang, CoreXhr, utilBase, Memory, Cache, Observable, base, template, templateHTML) {
        return declare([base, template, Core, CoreXhr], {
        	
        	templateString: templateHTML,
            room : null,
            roomObject : null,
            roomContent : "",
        	style: "position:relative;width:850px;height:635px",
        	startTime: null,
        	endTime: null,
        	inputData:null,
        	cssRequirements: [{cssFile:"./css/calendarRooms.css"}],
        	
        	getValue:function(){
        		if (this.room && this.startTime && this.endTime)
	        		return {
        				"roomObject":this.roomObject,
	        			"room":this.room,
	        			"roomContent":this.roomContent,
	        			"startTime":this.startTime,
	        			"endTime":this.endTime
	        		}
        		else
        			return null
        	},
            
            postMixInProperties: function () {
                //this.inherited(arguments);
            	this.alfSubscribe("LOAD_CALENDAR_ROOM", lang.hitch(this, this.loadCalendar), true);   
            	this.alfSubscribe("UPDATE_NEW_MEETING_CALENDAR_ROOM", lang.hitch(this, this.updateNewMeeting), true);   
            },
            
        
        	itemDoubleClick:function(e){        	
        		this.alfPublish("ALF_DISPLAY_PROMPT", {message: ("0" + e.item.startTime.getHours()).slice(-2)   + ":" +
        														("0" + e.item.startTime.getMinutes()).slice(-2) + " - " +
        														("0" + e.item.endTime.getHours()).slice(-2)   + ":" +
        														("0" + e.item.endTime.getMinutes()).slice(-2) + " " +
        														e.item.summary, title:"Информация"}, true);
        	},
          
        	updateNewMeeting:function(data){
        		
        		
        		this.calendar.store.remove("new_meeting");  
        		
        		var sTime = (data.startTime)?data.startTime:this.startTime;
        		var eTime = (data.endTime)?data.endTime:this.endTime;
        		
        		if (sTime.getHours() == 0)
    			{
        			sTime = this.startTime;
        			this.alfPublish("MEETING_START_DATE_TIME_UPDATE", {data:this.startTime}, true);
    			}
        		
        		if (eTime.getHours() == 0)
    			{
        			eTime = this.endTime;
        			this.alfPublish("MEETING_END_DATE_TIME_UPDATE", {data:this.endTime}, true);
    			}
        		
        		
        		
        		if (eTime.getTime() < sTime.getTime())
    			{        			
        			this.updateNewMeeting({
	   					startTime: eTime,
	   					endTime:sTime
	   				});
        			
        			this.alfPublish("MEETING_START_DATE_TIME_UPDATE", {data:this.startTime}, true);
        			this.alfPublish("MEETING_END_DATE_TIME_UPDATE", {data:this.endTime}, true);
        			
        			return;
        			
    			}
        		
        		var nowDate = new Date();
        		nowDate.setTime(nowDate.getTime() - (10*60*1000));
        		if (sTime.getTime() < nowDate.getTime())
    			{
        			
        			nowDate = new Date();
        			var addHour = new Date(nowDate);
		   			addHour.setTime(addHour.getTime() + (60*60*1000));
		   			
		   			this.updateNewMeeting({
	   					startTime: nowDate,
	   					endTime:addHour
	   				});
	   				return;
    			}
        		
        		
        		if (sTime.getHours() < 8)
    			{
        			sTime.setHours(8);
        			sTime.setMinutes(0)
    			}
        		
        		if (sTime.getHours() >= 21)
    			{
        			var addDay = new Date(sTime);
  		   			
  		   			addDay.setTime(addDay.getTime() + (24*60*60*1000));
	  		   		addDay.setHours(8);
	  		   		addDay.setMinutes(0);
	  		   		addDay.setMilliseconds(0);
	  		   		
	  		   		var addHour = new Date(addDay);
		   			addHour.setTime(addHour.getTime() + (60*60*1000));
            	
	   				this.updateNewMeeting({
	   					startTime: addDay,
	   					endTime:addHour
	   				});
	   				return;
    			}
        		
        		if (this.checkIntersectionTime({startTime:sTime, endTime:eTime}))
	   				return;
        		
        		if (this.checkMinimalTime({startTime:sTime, endTime:eTime}))
  		   			return true;
        		
        		this.startTime = sTime;
        		this.endTime = eTime;
        		
        		this.calendar.store.remove("new_meeting");  
        		
        		this.alfPublish("MEETING_START_DATE_TIME_UPDATE", {data:this.startTime}, true);
    			this.alfPublish("MEETING_END_DATE_TIME_UPDATE", {data:this.endTime}, true);
        		
        		this.calendar.store.add({
    				id: "new_meeting",
            	    summary: "Выберите время",
            	    startTime:  sTime,
            	    endTime: eTime
    			})        		
    			
        	},
        	
        	checkIntersectionTime: function(item){
        		for (var i = 0; i < this.calendar.items.length; i++)
	   			{
		   			var checkItem = this.calendar.items[i];
		   			if (checkItem.id == "new_meeting")
		   				continue;
	  				   				   			
		   			if( (checkItem.startTime.getTime() < item.startTime.getTime() && checkItem.endTime.getTime() > item.startTime.getTime() ) ||
		   				(checkItem.startTime.getTime() < item.endTime.getTime() && checkItem.endTime.getTime() > item.endTime.getTime() ) ||
		   				
	  		   			(item.startTime.getTime() < checkItem.startTime.getTime() && item.endTime.getTime() > checkItem.startTime.getTime() ) ||
		   				(item.startTime.getTime() < checkItem.endTime.getTime() && item.endTime.getTime() > checkItem.endTime.getTime() )  ||
		   				(item.startTime.getTime() == checkItem.startTime.getTime() && item.endTime.getTime() == checkItem.endTime.getTime()	) 
		   				)
		   				{
		   				
		  		   			var addHour = new Date(checkItem.endTime);
		  		   			addHour.setTime(addHour.getTime() + (60*60*1000));
		            	
			   				this.updateNewMeeting({
			   					startTime: new Date(checkItem.endTime),
			   					endTime:addHour
			   				});
			   				
			   				return true;
		   				}
	   			}
        		return false;
        	},
        	        	
        	checkMinimalTime:function(item){
        		if ((item.endTime.getTime() - item.startTime.getTime()) < (30*60*1000))
    			{
        			var addHalfHour = new Date(item.startTime);
        			addHalfHour.setTime(addHalfHour.getTime() + (30*60*1000));
  		   			
        			this.updateNewMeeting({
	   					startTime: item.startTime,
	   					endTime:addHalfHour
	   				});
        			return true;
    			}
        		
        		return false;
        	},
        	
        	itemEdit:function(item, rendererKind){
        		if (item.id != "new_meeting")	          				
      		   		return false;
      		   	else
  		   		{
      		   		if (this.startTime  && this.startTime.getTime() == item.startTime.getTime() && this.endTime && this.endTime.getTime() == item.endTime.getTime())
      		   			return true;      		   		
      		   		
      		   		if (this.checkIntersectionTime(item))
		   				return true;
      		   		
      		   		if (this.checkMinimalTime(item))
      		   			return true;
      		   		
	      		   	if (!this.startTime || this.startTime.getTime() != item.startTime.getTime())
	      		   	{
	      		   		this.startTime = item.startTime;
		      		   	this.alfPublish("MEETING_START_DATE_TIME_UPDATE", {data:item.startTime}, true);
	      		   	}
	      		   	
	      		   	if (!this.endTime || this.endTime.getTime() != item.endTime.getTime())
	      		   	{
	      		   		this.endTime = item.endTime;
	      		   		this.alfPublish("MEETING_END_DATE_TIME_UPDATE", {data:item.endTime}, true);
	      		   	}
	      		   	
	      		   	
      		   		return true;
  		   		}
        	},
        	
            load:function(someData){
            	
            	this.domNode.innerHTML = "";
            	if (!someData)
            		someData = [];
            	
            	var startDate = new Date();
            	
            	if (this.inputData && this.inputData.date && this.inputData.date.getTime() > startDate.getTime())
            		startDate = this.inputData.date;
            	
            	
            	var addHour = new Date(startDate);
            	addHour.setTime(startDate.getTime() + (60*60*1000));
            	
            	if (this.startTime && this.endTime)
        		{
            		startDate = this.startTime;
            		addHour = this.endTime;
        		}
            	
            	someData.push({
            		id: "new_meeting",
            	    summary: "Выберите время",
            	    startTime:  startDate,
            	    endTime: addHour
            	});
            	
            	 this.calendar = new Calendar({            	  
              	   date: startDate,
              	   store: new Observable(new Memory({data: someData})),
              	   
	              	 cssClassFunc: function(item){
	              		 if (item.id == "new_meeting")
	              			 return "selectCalendar"
	              		 else
	              			 return "";
	              	  },
              	   
              	   dateInterval: (this.calendar)?this.calendar.dateInterval:"week",
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
            	 
            	 for(var i=0; i < this.calendar.items.length; i++)
        		 {
            		 var item = this.calendar.items[i];
            		 if (item.id == "new_meeting")
        			 {
            			 this.itemEdit(item);
            			 break;
        			 }
        		 }
            	 
                 this.calendar.placeAt(this.domNode);
                 this.calendar.startup();
                 this.validate()
            },
            
            successLoadData:function(payload){            	
            	
            	var data = [];
            	
            	if (payload.meetings)
        		{
            		for (var i=0; i<payload.meetings.length; i++)
        			{
            			var meeting = payload.meetings[i];
            			data.push({
            				id: meeting.nodeRef,
	                	    summary: meeting.theme,
	                	    startTime:  new Date(meeting.startTime),
	                	    endTime: new Date(meeting.endTime)
            			});
        			}
        		}
            	
            	this.load(data);
            	
            },
            
            loadCalendar: function(payload){            	
            	var someData = [];
            	
            	if (payload != null)
        		{
            		this.roomObject = payload.roomObject;
            		this.room = payload.room;
            		this.roomContent = payload.roomContent;
            		this.serviceXhr({
	            	    url: "/share/proxy/alfresco/meeting/get-meeting-by-room?room=" + payload.room,
	            	    method: "GET",
	            	    successCallback: this.successLoadData,
	            	    callbackScope: this
	            	  });
        		}
            	/*
            	else
        		{
            		this.load(null);
        		}
        		*/
            },            
            
            postCreate: function() {
            	this.loadCalendar(null);
             },
             
             
             
            
        });
    });