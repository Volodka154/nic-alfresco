define(["dojo/_base/declare",
        "alfresco/core/Core",
        "dojo/_base/lang",
        "alfresco/core/CoreXhr",
        "service/constants/Default"],
        function(declare, Core, lang, CoreXhr, AlfConstants) {

  return declare([Core, CoreXhr], {
	  
    data: {},
    rootNodeRef: null,
    type: "btl-taskResolution%3ataskResolutionDataType",
    
    
    
    constructor: function btl_EmployeeService__constructor(args) {
      lang.mixin(this, args);
      this.alfSubscribe("BTL_CREATE_taskResolution", lang.hitch(this, this.createtaskResolution));
      this.alfSubscribe("BTL_CREATE_FORM_taskResolution", lang.hitch(this, this.onCreateFormlinkType));
      this.alfSubscribe("BTL_EDIT_taskResolution", lang.hitch(this, this.edittaskResolution));
    },
    
    createtaskResolution: function btl_createtaskResolutionService__createtaskResolution(payload) {
    	this.alfLog("log", "btl_createtaskResolutionService__createtaskResolution", payload);
    	this.data = payload;
    	this.data.name = payload["prop_btl-taskResolution_name"];
    	this.data.time = payload["prop_btl-taskResolution_time"];
    	this.data.dayType = payload["prop_btl-taskResolution_dayType"];
    	this.data.taskType = payload["prop_btl-taskResolution_taskType"];
    	
    	this.serviceXhr({
    	    url: "/share/proxy/alfresco/api/type/"+ this.type +"/formprocessor",
    	    method: "POST",
    	    data: this.data,
    	    successCallback: this.updatetaskResolutionGrid,
    	    callbackScope: this
    	  });
    	},
    	
    updatetaskResolutionGrid: function btl_taskResolutionService__updatetaskResolutionGrid(response, originalRequestConfig){
    	this.alfLog("log", "btl_taskResolutionService__updatetaskResolutionGrid", originalRequestConfig);
    	
    	var dayType = "";
    	if (originalRequestConfig.data["prop_btl-taskResolution_dayType"] == "0"){dayType = "Рабочий"}
		if (originalRequestConfig.data["prop_btl-taskResolution_dayType"] == "1"){dayType = "Календарный"}
		
		var taskType = "";
		if (originalRequestConfig.data["prop_btl-taskResolution_taskType"] == "0"){taskType = "Резолюция по Входящему"}
		if (originalRequestConfig.data["prop_btl-taskResolution_taskType"] == "1"){taskType = "Резолюция по Исходящему"}
		if (originalRequestConfig.data["prop_btl-taskResolution_taskType"] == "2"){taskType = "Резолюция по Внутреннему"}
		if (originalRequestConfig.data["prop_btl-taskResolution_taskType"] == "3"){taskType = "Резолюция по Проекту"}
		if (originalRequestConfig.data["prop_btl-taskResolution_taskType"] == "4"){taskType = "Инициативное задание"}
		if (originalRequestConfig.data["prop_btl-taskResolution_taskType"] == "5"){taskType = "Задание по НТД"}
		if (originalRequestConfig.data["prop_btl-taskResolution_taskType"] == "6"){taskType = "Задание по делу проекта"}
		if (originalRequestConfig.data["prop_btl-taskResolution_taskType"] == "7"){taskType = "Задание по мероприятию"}
		if (originalRequestConfig.data["prop_btl-taskResolution_taskType"] == "8"){taskType = "Задание по ОРД"}		
		if (originalRequestConfig.data["prop_btl-taskResolution_taskType"] == "9"){taskType = "Задание по договору"}

		
    	this.alfPublish("DATAGRID_ADD_ROW", {"nodeRef": response.persistedObject,    										 
    											"name": originalRequestConfig.data["prop_btl-taskResolution_name"],
    											"time": originalRequestConfig.data["prop_btl-taskResolution_time"],    	
    											"dayType": originalRequestConfig.data["prop_btl-taskResolution_dayType"],
												"dayTypeName": dayType,
    											"taskType": originalRequestConfig.data["prop_btl-taskResolution_taskType"],
    											"taskTypeName": taskType
    	
    	
    										 });
    },
    
    edittaskResolution: function btl_taskResolutionService__edittaskResolution(payload) {
    	
    	this.alfLog("log", "btl_taskResolutionService__edittaskResolution", payload);
    	
    	var dayType = "";
    	if (payload["prop_btl-taskResolution_dayType"] == "0"){dayType = "Рабочий"}
		if (payload["prop_btl-taskResolution_dayType"] == "1"){dayType = "Календарный"}
    			
		var taskType = "";
		if (payload["prop_btl-taskResolution_taskType"] == "0"){taskType = "Резолюция по Входящему"}
		if (payload["prop_btl-taskResolution_taskType"] == "1"){taskType = "Задание по Исходящему"}
		if (payload["prop_btl-taskResolution_taskType"] == "2"){taskType = "Резолюция по Внутреннему"}
		if (payload["prop_btl-taskResolution_taskType"] == "3"){taskType = "Задание по Проекту"}
		if (payload["prop_btl-taskResolution_taskType"] == "4"){taskType = "Инициативное задание"}
		if (payload["prop_btl-taskResolution_taskType"] == "5"){taskType = "Задание по НТД"}		
		if (payload["prop_btl-taskResolution_taskType"] == "6"){taskType = "Задание по делу проекта"}
		if (payload["prop_btl-taskResolution_taskType"] == "7"){taskType = "Задание по мероприятию"}
		if (payload["prop_btl-taskResolution_taskType"] == "8"){taskType = "Задание по ОРД"}		
		if (payload["prop_btl-taskResolution_taskType"] == "9"){taskType = "Задание по договору"}

		    	
    	this.serviceXhr({
    	    url: "/share/proxy/alfresco/api/node/"+ payload.nodeRef.replace("://", "/") +"/formprocessor",
    	    method: "POST",
    	    data: payload,
    	    successCallback: this.alfPublish("DATAGRID_EDIT_ROW", {"rowId": payload["rowId"],
    	    														"name": payload["prop_btl-taskResolution_name"],
    	    														"time": payload["prop_btl-taskResolution_time"],  
    	    														"dayType": payload["prop_btl-taskResolution_dayType"],
    	    														"dayTypeName": dayType,
    	    		    											"taskType": payload["prop_btl-taskResolution_taskType"],
    	    		    											"taskTypeName": taskType
    	    
    	    													   
    	    }),
    	    callbackScope: this
    	  });
    },
    
	   onCreateFormlinkType: function alfresco_formtaskResolution__onCreateFormlinkType(data){
		    this.alfLog("log", "alfresco_formtaskResolution__onCreateFormtaskResolution", data);
		   	
	    	this.data = data.data;	
	    	this.rootNodeRef = data.rootNodeRef;
	   	    var payload = {};
    	    
    	    
    	    payload.dialogTitle = data.config.dialogTitle;
    	    payload.dialogConfirmationButtonTitle = data.config.dialogConfirmationButtonTitle;
    	    payload.dialogCancellationButtonTitle = data.config.dialogCancellationButtonTitle;
    	    payload.formSubmissionTopic = data.config.formSubmissionTopic;
    	    payload.widgets = this.getWidgets();
    	  
    	  this.alfLog("log", "alfresco_formtaskResolution__onCreateFormtaskResolution", payload);
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
                        {value:6, label:"Задание по делу проекта"},
	                	{value:7, label:"Задание по мероприятию"},
	                	{value:8, label:"Задание по ОРД"},                        
                        {value:9, label:"Задание по договору"}
                       ],
	   
	   getWidgets: function alfresco_formtaskResolution__getWidgets(){
		   
		   var widgets = [		 
			{
	  		   name: "alfresco/forms/controls/DojoValidationTextBox",
	  		   config: {
	  			  label:  "Название",
	  		      name: "prop_btl-taskResolution_name",
	  		      value: (this.data !== null) ? this.data.name : ""
	  		     
	  		}
	  		},
	  		{
		  		   name: "alfresco/forms/controls/DojoValidationTextBox",
		  		   config: {
		  			  label:  "Количество дней",
		  		      name: "prop_btl-taskResolution_time",
		  		      value: (this.data !== null) ? this.data.time : ""
		  		     
		  		   }
		  	},
		  	{
		  		name: "alfresco/forms/controls/Select",
		  		config: {
		  			label:  "Тип дня",
		  		    name: "prop_btl-taskResolution_dayType",
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
		  		    name: "prop_btl-taskResolution_taskType",
		  		    value: (this.data !== null) ? this.data.taskType : "",
		  		    optionsConfig: {
		  	  		    	  fixed: this.taskTypeOptions
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