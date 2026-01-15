define(["dojo/_base/declare",
        "alfresco/core/Core",
        "dojo/_base/lang",
        "alfresco/core/CoreXhr",
        "service/constants/Default"],
        function(declare, Core, lang, CoreXhr, AlfConstants) {

  return declare([Core, CoreXhr], {
	  
    newHoliday: {}, 

    constructor: function btl_HolidayService__constructor(args) {
      lang.mixin(this, args);
      this.alfSubscribe("BTL_CREATE_HOLIDAY", lang.hitch(this, this.createHoliday));
      this.alfSubscribe("BTL_EDIT_HOLIDAY", lang.hitch(this, this.editHoliday));
      this.alfSubscribe("BTL_CREATE_FORM_HOLIDAY", lang.hitch(this, this.onCreateFormHoliday));
            
    },
    
    
    
    createHoliday: function btl_HolidayService__createHoliday(payload) {
    	
    	
    	
    	this.alfLog("log", "btl_HolidayService__createHoliday", payload);
    	
    	this.newHoliday.dayDate = payload["prop_btl-utils_dayDate"];   
    	this.newHoliday.dayType = payload["prop_btl-utils_dayType"];   
    	

    	this.serviceXhr({
    	    url: "/share/proxy/alfresco/api/type/btl-utils%3aworkScheduleDictionary/formprocessor",
    	    method: "POST",
    	    data: {
    	         "alf_destination": payload.alf_destination,
    	         "prop_btl-utils_dayDate": (payload["prop_btl-utils_dayDate"] !== null) ? payload["prop_btl-utils_dayDate"] : "",    	         
    			 "prop_btl-utils_dayType": payload["prop_btl-utils_dayType"]
    	      },
    	    successCallback: this.updateHolidayGrid,
    	    callbackScope: this
    	  });
    	},
    	
    updateHolidayGrid: function btl_HolidayService__updateHolidayGrid(response, originalRequestConfig){
    	this.newHoliday.nodeRef = response.persistedObject;
    	
    	var dayType;
    	if (this.newHoliday.dayType == "1")	{
			dayType = "Выходной";
			}
		else{
			dayType = "Рабочий"	;
			}
    			
    	var date = this.newHoliday.dayDate;	    	
    	this.newHoliday.dayDate = date.substring(8) + '.' + date.substring(5,7) + '.' + date.substring(0,4);
    	
    	
    	this.alfPublish("DATAGRID_ADD_ROW",{
    		nodeRef: this.newHoliday.nodeRef,
    		dayDate: this.newHoliday.dayDate,
    		dayType: dayType
    		
    	});
    	
 	    	    	    	
    },
    
    
    
    editHoliday: function btl_HolidayService__editHoliday(payload) {
    	
    	this.alfLog("log", "btl_HolidayService__editHoliday", payload);
    	
    	this.newHoliday.rowId = payload["rowId"];
    	this.newHoliday.dayDate = payload["prop_btl-utils_dayDate"];  
    	this.newHoliday.dayType = payload["prop_btl-utils_dayType"];    
    	
    	if (this.newHoliday.dayType == "1")	{
    		this.newHoliday.dayType = "Выходной";
			}
		else{
			this.newHoliday.dayType = "Рабочий"	;
			}
    	
    	var date = this.newHoliday.dayDate;	    
    	this.newHoliday.dayDate = date.substring(8) + '.' + date.substring(5,7) + '.' + date.substring(0,4);
    	
		
    	
    	this.serviceXhr({
    	    url: "/share/proxy/alfresco/api/node/"+ payload.nodeRef.replace("://", "/") +"/formprocessor",
    	    method: "POST",
    	    data: {
    	    "prop_btl-utils_dayDate": (payload["prop_btl-utils_dayDate"] !== null) ? payload["prop_btl-utils_dayDate"] : "", 
	         "prop_btl-utils_dayType": payload["prop_btl-utils_dayType"]   	        

   	      },
    	    successCallback: this.alfPublish("DATAGRID_EDIT_ROW", this.newHoliday),
    	    callbackScope: this
    	  });
    },
    
       
	   onCreateFormHoliday: function alfresco_formHoliday__onCreateFormHoliday(data){
		   	  this.alfLog("log", "alfresco_formHoliday__onCreateFormHoliday", data);
		   
		   	  this.data = data.data;
		   	 
		   	  this.rootNodeRef = data.rootNodeRef;
		   	  var payload = {};    	  
	    	  
	    	  payload.dialogTitle = data.config.dialogTitle;
	    	  payload.dialogConfirmationButtonTitle = data.config.dialogConfirmationButtonTitle;
	    	  payload.dialogCancellationButtonTitle = data.config.dialogCancellationButtonTitle;
	    	  payload.formSubmissionTopic = data.config.formSubmissionTopic;
	    	  payload.widgets = this.getWidgets();
	    	  
	    	  this.alfLog("log", "alfresco_formHoliday__onCreateFormHoliday", payload);
	    	  this.alfPublish("ALF_CREATE_FORM_DIALOG_REQUEST", payload);
	   },
	   
	   getWidgets: function alfresco_formHoliday__getWidgets(){
		   
		   var optionsDay = [{value:"1", label:"Выходной"},{value:"0", label:"Рабочий"}];
		   
		   var dayDate1 = '';
		   var dayType = '';
		   
		   if (this.data != null)
		   {
			   var date = this.data.dayDate;			   
			   dayDate1 = date.substring(6) + '-' + date.substring(3,5) + '-' + date.substring(0,2);
		   
			   if (this.data.dayType == "Выходной")
				   dayType = "1";
			   else
				   dayType = "0";
		   }
		   
		   var widgets = [{     	    		   		   		   
		  // name: "btl/widgets/base/Datepicker",
			 name: "meeting/dateTextBox/_DateTextBox",
			 id: "btl-utils_dayDate",
			 config: {
				 additionalCssClasses: "datefield",
				 label:  "Дата",
				 name: "prop_btl-utils_dayDate",
				 value: dayDate1			 
				    }
		   
		   },
		   {
    		   name: "alfresco/forms/controls/Select",
    		   config: {
    			  label:  "Тип",
    		      name: "prop_btl-utils_dayType",
    		      value: dayType,
    		      optionsConfig: {
    		    	  fixed: optionsDay
    		    	}
    		   }
    		}
		   
    		 ];
		   
		   if(this.data !== null){
			   widgets.push( {
					name: "alfresco/forms/controls/DojoValidationTextBox",
				      config: {
				         name: "nodeRef",
				         value: this.data.nodeRef,
				         visibilityConfig: {
				            initialValue: false
				         }
				      }
				},
				{
					name: "alfresco/forms/controls/DojoValidationTextBox",
				      config: {
				         name: "rowId",
				         value: this.data.rowId,
				         visibilityConfig: {
				            initialValue: false
				         }
				      }
				});
		   }
		   else{
			   widgets.push( {
					name: "alfresco/forms/controls/DojoValidationTextBox",
				      config: {
				         name: "alf_destination",
				         value: this.rootNodeRef,
				         visibilityConfig: {
				            initialValue: false
				         }
				      }
				});
		   }
		   return widgets;
	   }
    
  });
});