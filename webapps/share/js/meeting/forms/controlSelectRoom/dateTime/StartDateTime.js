/**
 * Created by nabokov on 23.11.2016.
 */
define(["dojo/_base/declare",
        "alfresco/core/Core",
        "dojo/_base/lang",
        "alfresco/core/CoreXhr",
        "meeting/utils/base",
        "dojo/date/stamp",
        "meeting/dateTextBox/_DateTimeTextBox"],
    function (declare, Core, lang, CoreXhr, utilBase, stamp, DateTimeTextBox) {
        return declare([DateTimeTextBox], {
        	
        	name:"prop_start_date_time",
        	/*
        	requirementConfig: {
                initialValue: true
            },
            */
        	noEdit:false,
        	
        	_validationInProgress : true,
        	
        	postMixInProperties: function () {
                this.inherited(arguments);
            	this.alfSubscribe("MEETING_START_DATE_TIME_UPDATE", lang.hitch(this, this.update), true);   
            	 this.alfSubscribe("ENABLE_DATE_CONTROL", lang.hitch(this, this.enableControl), true); 
            	
            },
        	
            update: function(data){           	            	
            	if (data.data)
        		{
            		this.noEdit = true;
		        	this.dateTextBox.set("value", data.data);
		        	this.timeTextBox.set("value", data.data);
		        	this.noEdit = false;
        		}
            	
            },
            
            enableControl:function(){
            	this.dateTextBox.setDisabled(false);
            	this.timeTextBox.setDisabled(false);
            },
            
            updateTextDateTime: function () {
            	this.inherited(arguments);
            	if (!this.noEdit)
            		this.alfPublish("UPDATE_NEW_MEETING_CALENDAR_ROOM", {startTime: this.getCurrentValue()}, true);
            	else
            		this.noEdit=false;
               
            },
            
            
        	postCreate: function () {
                this.inherited(arguments);                                
           	 	this.dateTextBox.setDisabled(true);
            	this.timeTextBox.setDisabled(true);
            }           
            
        });
    });