/**
 * Created by nabokov on 21.11.2016.
 */
define(["dojo/_base/declare",
        "alfresco/services/BaseService",
        "dojo/_base/lang",
        "meeting/utils/base",
        "alfresco/core/CoreXhr",
        "alfresco/dialogs/AlfDialog",
        "alfresco/core/topics",
    ],
    function (declare, BaseService, lang, utilBase, CoreXhr, AlfDialog, topics) {
        return declare([BaseService, CoreXhr], {
       
            

            constructor: function (args) {
                lang.mixin(this, args);
                
                this.alfSubscribe("MEETING_SELECT_ROOM", lang.hitch(this, this.createMeeting), true);
                
                this.alfSubscribe("ITEM_MEETING_CKICK", lang.hitch(this, this.meetingItemClick), true);
                              
                
            },
            
            setCloseModalFunction:function(){
            	document.frameCancel  = function(o) {	                
               	 var modal = document.getElementById('editShadowDiv');
               	 modal.style.display = 'none';		                	 
	        	}
	        	
	        	document.frameSave  = function(o) {	                
               	 var modal = document.getElementById('editShadowDiv');
               	 modal.style.display = 'none';		                	 
	        	}
            },
            
            openModal:function(src)
            {
            	var modal = document.getElementById('editShadowDiv');		
                var formEl = Dom.get("editModalWindow");
                
                this.setCloseModalFunction();
	                
				formEl.innerHTML = '<div style="height: 100%;"><iframe id="viewDocFrame" style="border-radius: 4px;" width="100%" height="100%" src="' + src + '"></div>';
				modal.src = this.href;
     			modal.style.display = 'block';	
            },
            
            meetingItemClick:function(data){            	            	
            	if (data.nodeRef)
            		this.openModal('/share/page/dp/ws/meeting-rooms?nodeRef=' + data.nodeRef);
            },
            
            createMeeting:function(data){            	
            	this.openModal('/share/page/dp/ws/meeting-rooms?room=' + data.prop_calendar.room + '&startDate=' + this.DateToString(data.prop_calendar.startTime) + '&endDate=' + this.DateToString(data.prop_calendar.endTime));
            },
            
            DateToString:function(d)
            {
            	return d.getFullYear() + "-" + this.addZero(d.getMonth() + 1 ) + "-" + this.addZero(d.getDate()) + " " + d.getHours() + ":" + d.getMinutes();	
            },
            
            addZero:function(s)
            {
            	
            	if (s.toString().length == 1)
            		return '0' + s;
            	else
            		return s; 

            }
            
           
                       
        });
    });