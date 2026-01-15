define(["dojo/_base/declare",
        "alfresco/core/Core",
        "dojo/_base/lang",
        "alfresco/core/CoreXhr",
        "service/constants/Default"],
        function(declare, Core, lang, CoreXhr, AlfConstants) {

  return declare([Core, CoreXhr], {
	  
    data: {},
    rootNodeRef: null,
    type: "btl-periodOfExecution%3aperiodOfExecutionDataType",
    
    
    
    constructor: function btl_EmployeeService__constructor(args) {
      lang.mixin(this, args);
      this.alfSubscribe("BTL_CREATE_periodOfExecution", lang.hitch(this, this.createperiodOfExecution));
      this.alfSubscribe("BTL_CREATE_FORM_periodOfExecution", lang.hitch(this, this.onCreateFormlinkType));
      this.alfSubscribe("BTL_EDIT_periodOfExecution", lang.hitch(this, this.editperiodOfExecution));
    },
    
    createperiodOfExecution: function btl_createperiodOfExecutionService__createperiodOfExecution(payload) {
    	this.alfLog("log", "btl_createperiodOfExecutionService__createperiodOfExecution", payload);
    	this.data = payload;
    	this.data.name = payload["prop_btl-periodOfExecution_name"];
    	this.data.time = payload["prop_btl-periodOfExecution_time"];
    	this.data.dayType = payload["prop_btl-periodOfExecution_dayType"];
    	this.data.taskType = payload["prop_btl-periodOfExecution_taskType"];
    	this.data.arm = payload["prop_btl-periodOfExecution_star"];
    	
    	this.serviceXhr({
    	    url: "/share/proxy/alfresco/api/type/"+ this.type +"/formprocessor",
    	    method: "POST",
    	    data: this.data,
    	    successCallback: this.updateperiodOfExecutionGrid,
    	    callbackScope: this
    	  });
    	},
    	
    updateperiodOfExecutionGrid: function btl_periodOfExecutionService__updateperiodOfExecutionGrid(response, originalRequestConfig){
    	this.alfLog("log", "btl_periodOfExecutionService__updateperiodOfExecutionGrid", originalRequestConfig);
    	
    
    	var dayType = "";
    	if (originalRequestConfig.data["prop_btl-periodOfExecution_dayType"] == "0"){dayType = "Рабочий"}
		if (originalRequestConfig.data["prop_btl-periodOfExecution_dayType"] == "1"){dayType = "Календарный"}
		
		var taskType = "";
		if (originalRequestConfig.data["prop_btl-periodOfExecution_taskType"] == "0"){taskType = "Резолюция по Входящему"}
		if (originalRequestConfig.data["prop_btl-periodOfExecution_taskType"] == "1"){taskType = "Резолюция по Исходящему"}
		if (originalRequestConfig.data["prop_btl-periodOfExecution_taskType"] == "2"){taskType = "Резолюция по Внутреннему"}
		if (originalRequestConfig.data["prop_btl-periodOfExecution_taskType"] == "3"){taskType = "Резолюция по Проекту"}
		if (originalRequestConfig.data["prop_btl-periodOfExecution_taskType"] == "4"){taskType = "Инициативное задание"}
		if (originalRequestConfig.data["prop_btl-periodOfExecution_taskType"] == "5"){taskType = "Задание по НТД"}
		if (originalRequestConfig.data["prop_btl-periodOfExecution_taskType"] == "8"){taskType = "Задание по ОРД"}

		var star = "&#9734;";		
		if (originalRequestConfig.data["prop_btl-periodOfExecution_star"] == true){star = "&#9733"}
		
    	this.alfPublish("DATAGRID_ADD_ROW", {"nodeRef": response.persistedObject,    										 
    											"name": originalRequestConfig.data["prop_btl-periodOfExecution_name"],
    											"time": originalRequestConfig.data["prop_btl-periodOfExecution_time"],
    											"dayType": originalRequestConfig.data["prop_btl-periodOfExecution_dayType"],
												"dayTypeName": dayType,
    											"taskType": originalRequestConfig.data["prop_btl-periodOfExecution_taskType"],
    											"taskTypeName": taskType,
    											"arm": originalRequestConfig.data["prop_btl-periodOfExecution_star"],
    											"star": star
    	
    	
    										 });
    },
    
    editperiodOfExecution: function btl_periodOfExecutionService__editperiodOfExecution(payload) {
    	
    	this.alfLog("log", "btl_periodOfExecutionService__editperiodOfExecution", payload);
    	
    	
    	var dayType = "";
    	if (payload["prop_btl-periodOfExecution_dayType"] == "0"){dayType = "Рабочий"}
		if (payload["prop_btl-periodOfExecution_dayType"] == "1"){dayType = "Календарный"}
		
		var taskType = "";
		if (payload["prop_btl-periodOfExecution_taskType"] == "0"){taskType = "Резолюция по Входящему"}
		if (payload["prop_btl-periodOfExecution_taskType"] == "1"){taskType = "Задание по Исходящему"}
		if (payload["prop_btl-periodOfExecution_taskType"] == "2"){taskType = "Резолюция по Внутреннему"}
		if (payload["prop_btl-periodOfExecution_taskType"] == "3"){taskType = "Задание по Проекту"}
		if (payload["prop_btl-periodOfExecution_taskType"] == "4"){taskType = "Инициативное задание"}
		if (payload["prop_btl-periodOfExecution_taskType"] == "4"){taskType = "Задание по НТД"}
		if (payload["prop_btl-periodOfExecution_taskType"] == "8"){taskType = "Задание по ОРД"}

		var star = "&#9734;";		
		if (payload["prop_btl-periodOfExecution_star"] == true){star = "&#9733"}
    	
    	this.serviceXhr({
    	    url: "/share/proxy/alfresco/api/node/"+ payload.nodeRef.replace("://", "/") +"/formprocessor",
    	    method: "POST",
    	    data: payload,
    	    successCallback: this.alfPublish("DATAGRID_EDIT_ROW", {"rowId": payload["rowId"],
    	    														"name": payload["prop_btl-periodOfExecution_name"],
    	    														"time": payload["prop_btl-periodOfExecution_time"],
    	    														"dayType": payload["prop_btl-periodOfExecution_dayType"],
    	    														"dayTypeName": dayType,
    	    		    											"taskType": payload["prop_btl-periodOfExecution_taskType"],
    	    		    											"taskTypeName": taskType,
    	    		    											"arm": payload["prop_btl-periodOfExecution_star"],
    	    		    											"star": star
    	    
    	    													   
    	    }),
    	    callbackScope: this
    	  });
    },
    
	   onCreateFormlinkType: function alfresco_formperiodOfExecution__onCreateFormlinkType(data){
		    this.alfLog("log", "alfresco_formperiodOfExecution__onCreateFormperiodOfExecution", data);
		   	
	    	this.data = data.data;	
	    	this.rootNodeRef = data.rootNodeRef;
	   	    var payload = {};
    	    
    	    
    	    payload.dialogTitle = data.config.dialogTitle;
    	    payload.dialogConfirmationButtonTitle = data.config.dialogConfirmationButtonTitle;
    	    payload.dialogCancellationButtonTitle = data.config.dialogCancellationButtonTitle;
    	    payload.formSubmissionTopic = data.config.formSubmissionTopic;
    	    payload.widgets = this.getWidgets();
    	  
    	  this.alfLog("log", "alfresco_formperiodOfExecution__onCreateFormperiodOfExecution", payload);
    	  this.alfPublish("ALF_CREATE_FORM_DIALOG_REQUEST", payload);
	   },
	   
	   dayTypeOptions: [{value:0, label:"Рабочий"},
	                     {value:1, label:"Календарный"}
	                     ], 
	   taskTypeOptions: [{value:0, label:"Резолюция по Входящему"},
                        {value:1, label:"Задание по Исходящему"},
                        {value:2, label:"Резолюция по Внутреннему"},
                        {value:3, label:"Задание по Проекту"},
                        {value:4, label:"Инициативное задание"},
                        {value:5, label:"Задание по НТД"},
                        {value:8, label:"Задание по ОРД"}
                       ],
	   
	   getWidgets: function alfresco_formperiodOfExecution__getWidgets(){
		   
		   var widgets = [		 
			{
	  		   name: "alfresco/forms/controls/DojoValidationTextBox",
	  		   config: {
	  			  label:  "Название",
	  		      name: "prop_btl-periodOfExecution_name",
	  		      value: (this.data !== null) ? this.data.name : ""
	  		     
	  		}
	  		},
	  		{
		  		   name: "alfresco/forms/controls/DojoValidationTextBox",
		  		   config: {
		  			  label:  "Количество дней",
		  		      name: "prop_btl-periodOfExecution_time",
		  		      value: (this.data !== null) ? this.data.time : ""
		  		     
		  		   }
		  	},
	  		{
		  		name: "alfresco/forms/controls/Select",
		  		config: {
		  			label:  "Тип дня",
		  		    name: "prop_btl-periodOfExecution_dayType",
		  		    value: (this.data !== null) ? this.data.dayType : "",
		  		    optionsConfig: {
		  	  		    	  fixed: this.dayTypeOptions
		  	  		    	}
		  		     
		  		   }
		  	},
	  		{
		  		name: "alfresco/forms/controls/Select",
		  		config: {
		  			label:  "Тип задачи",
		  		    name: "prop_btl-periodOfExecution_taskType",
		  		    value: (this.data !== null) ? this.data.taskType : "",
		  		    optionsConfig: {
		  	  		    	  fixed: this.taskTypeOptions
		  	  		    	}
		  		     
		  		   }
		  	},
	  		{
		  		name: "alfresco/forms/controls/DojoCheckBox",
		  		config: {
		  			label:  "Отображать в арме",
		  		    name: "prop_btl-periodOfExecution_star",
		  		    value: (this.data !== null) ? this.data.arm : "",
		  		    
		  		     
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