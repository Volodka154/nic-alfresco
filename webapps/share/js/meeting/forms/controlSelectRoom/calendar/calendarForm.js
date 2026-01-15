
define(["dojo/_base/declare",
        "alfresco/forms/controls/BaseFormControl",
        "dojo/_base/lang",
        "meeting/forms/controlSelectRoom/calendar/calendarRooms",
        "dojo/dom-class",
        "dojo/dom-style"],
    function(declare, BaseFormControl, lang, CalendarRooms, domClass, domStyle) {
        return declare([BaseFormControl], {

        	name:"prop_calendar",
        	requirementConfig: {
                initialValue: true
            },
            
            inputData:null,
        	
        
            postMixInProperties: function(){     
                this.inherited(arguments); // Must 'clean' the empty strings before calling this
            },

           
            getValue: function () {
                //var value = this.inherited(arguments);
                return this.calendarRooms.getValue();
            },

            completeWidgetSetup: function () {
                this.inherited(arguments);
                if (this.style && document.getElementById("widget_" + this.calendarRooms.id)){
                    domStyle.set("widget_" + this.calendarRooms.id, this.style);
                }
            },

         
            createFormControl: function (config) {
            	
                domClass.add(this.domNode, "alfresco-forms-controls-CalendarRooms");
                if (this.inputData)
            	{
                	config.inputData = this.inputData;
            	}
                var calendarRooms = new CalendarRooms(config);
                this.calendarRooms = calendarRooms;
                calendarRooms.validate = lang.hitch(this, function(){
                    setTimeout(lang.hitch(this, this.validate), 0);
                    return true;
                });
                return calendarRooms;
                
            },

            validate:function()
            {
            	if (this.getValue() == null)
            	{
            		this.alfPublish("ALF_INVALID_CONTROL", {
                        name: this.name,
                        fieldId: this.fieldId
                    });

                    this.showValidationFailure();
            	}
            	else
            	{            		                    
                    this.alfPublish("ALF_VALID_CONTROL", {
                        name: this.name,
                        fieldId: this.fieldId
                    });
                    this.hideValidationFailure();
            	}
            }
           
        });
    });
