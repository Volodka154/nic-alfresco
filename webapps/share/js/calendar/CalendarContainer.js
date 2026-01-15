define(["dojo/_base/declare",
    "alfresco/forms/DynamicForm",
    "dojo/_base/lang"   

], function (declare, DynamicForm, lang) {

    return declare([DynamicForm], {
 	   	         
    	displayButtons: false, 
    	weekendDays:"",
    	workDays:"",
    	selectDate: null,
    	
        postCreate: function () {  
            this.widgets = [
                            {
	                            name:"alfresco/forms/ControlRow",
	                            config:{
	                                widgets:[
		                                        {
													name:"calendar/calendar/eventCalendarRooms",
													config:{
														weekendDays:this.weekendDays,
										        		workDays:this.workDays,
										        		selectDate:this.selectDate
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