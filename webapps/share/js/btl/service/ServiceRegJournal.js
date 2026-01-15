define(["dojo/_base/declare",
        "alfresco/core/Core",
        "dojo/_base/lang",
        "alfresco/core/CoreXhr",
        "service/constants/Default"],
        function(declare, Core, lang, CoreXhr, AlfConstants) {

  return declare([Core, CoreXhr], {
	  
    newregJournal: {}, 

    constructor: function btl_regJournalService__constructor(args) {
      lang.mixin(this, args);
      this.alfSubscribe("BTL_CREATE_REG_JOURNAL", lang.hitch(this, this.createregJournal));
      this.alfSubscribe("BTL_EDIT_REG_JOURNAL", lang.hitch(this, this.editregJournal));
      this.alfSubscribe("BTL_CREATE_FORM_REG_JOURNAL", lang.hitch(this, this.onCreateFormregJournal));
            
    },
    
    
    
    createregJournal: function btl_regJournalService__createregJournal(payload) {
    	
    	
    	
    	this.alfLog("log", "btl_regJournalService__createregJournal", payload);
    	
    	this.newregJournal.name = payload["prop_btl-regJournal_name"]; 
    	this.newregJournal.type = payload["prop_btl-regJournal_doctype"]; 
    	this.newregJournal.format = payload["prop_btl-regJournal_format"]; 
    	this.newregJournal.counter = payload["prop_btl-regJournal_counter"]; 
    	this.newregJournal.isDraft = payload["prop_btl-regJournal_isDraft"]; 

    	if (payload["prop_btl-regJournal_doctype"] == "0") {this.newregJournal.typeName = "Входящий"}
    	if (payload["prop_btl-regJournal_doctype"] == "1") {this.newregJournal.typeName = "Исходящий"}
    	if (payload["prop_btl-regJournal_doctype"] == "2") {this.newregJournal.typeName = "Внутренний"}
    	if (payload["prop_btl-regJournal_doctype"] == "3") {this.newregJournal.typeName = "НТД"}
    	if (payload["prop_btl-regJournal_doctype"] == "4") {this.newregJournal.typeName = "Дело проекта"}
    	if (payload["prop_btl-regJournal_doctype"] == "5") {this.newregJournal.typeName = "Мероприятие"}
    	if (payload["prop_btl-regJournal_doctype"] == "6") {this.newregJournal.typeName = "ОРД"}
    	if (payload["prop_btl-regJournal_doctype"] == "7") {this.newregJournal.typeName = "Договор"}

    	this.serviceXhr({
    	    url: "/share/proxy/alfresco/api/type/btl-regJournal%3aregJournalData/formprocessor",
    	    method: "POST",
    	    data: {
    	         "alf_destination": payload.alf_destination,
    	         "prop_btl-regJournal_name": payload["prop_btl-regJournal_name"],
        		 "prop_btl-regJournal_doctype": payload["prop_btl-regJournal_doctype"],
        		 "prop_btl-regJournal_format": payload["prop_btl-regJournal_format"],
        		 "prop_btl-regJournal_counter": payload["prop_btl-regJournal_counter"],
        		 "prop_btl-regJournal_isDraft": payload["prop_btl-regJournal_isDraft"]
    	      },
    	    successCallback: this.updateregJournalGrid,
    	    callbackScope: this
    	  });
    	},
    	
    updateregJournalGrid: function btl_regJournalService__updateregJournalGrid(response, originalRequestConfig){
    	this.newregJournal.nodeRef = response.persistedObject;
    	
    	
    	
    	this.alfPublish("DATAGRID_ADD_ROW",{
    		nodeRef: this.newregJournal.nodeRef,
    		name: this.newregJournal.name,   	
    		doctype: this.newregJournal.doctype,  	
    		format: this.newregJournal.format, 	
    		counter: this.newregJournal.counter, 	
    		typeName: this.newregJournal.typeName,
    		isDraft: (this.newregJournal.isDraft)?'<input type="checkbox"  checked disabled">':'<input type="checkbox"  disabled>'
    	});
    	
 	    	    	    	
    },
    
    
    
    editregJournal: function btl_regJournalService__editregJournal(payload) {
    	
    	this.alfLog("log", "btl_regJournalService__editregJournal", payload);
    	
    	this.newregJournal.rowId = payload["rowId"];
    	this.newregJournal.name = payload["prop_btl-regJournal_name"];  
    	this.newregJournal.doctype = payload["prop_btl-regJournal_doctype"];
    	this.newregJournal.format = payload["prop_btl-regJournal_format"]; 
    	this.newregJournal.counter = payload["prop_btl-regJournal_counter"]; 
    	this.newregJournal.isDraft =  payload["prop_btl-regJournal_isDraft"]; 
    	
    	
    	
    	if (payload["prop_btl-regJournal_doctype"] == "0") {this.newregJournal.typeName = "Входящий"}
    	if (payload["prop_btl-regJournal_doctype"] == "1") {this.newregJournal.typeName = "Исходящий"}
    	if (payload["prop_btl-regJournal_doctype"] == "2") {this.newregJournal.typeName = "Внутренний"}
    	if (payload["prop_btl-regJournal_doctype"] == "3") {this.newregJournal.typeName = "НТД"}
    	if (payload["prop_btl-regJournal_doctype"] == "4") {this.newregJournal.typeName = "Дело проекта"}
    	if (payload["prop_btl-regJournal_doctype"] == "5") {this.newregJournal.typeName = "Мероприятие"}
    	if (payload["prop_btl-regJournal_doctype"] == "6") {this.newregJournal.typeName = "ОРД"}
    	if (payload["prop_btl-regJournal_doctype"] == "7") {this.newregJournal.typeName = "Договор"}
    	
    	this.serviceXhr({
    	    url: "/share/proxy/alfresco/api/node/"+ payload.nodeRef.replace("://", "/") +"/formprocessor",
    	    method: "POST",
    	    data: {
   	         "prop_btl-regJournal_name": payload["prop_btl-regJournal_name"],	       
   	         "prop_btl-regJournal_doctype": payload["prop_btl-regJournal_doctype"],
			 "prop_btl-regJournal_format": payload["prop_btl-regJournal_format"],
			 "prop_btl-regJournal_counter": payload["prop_btl-regJournal_counter"],
			 "prop_btl-regJournal_isDraft": payload["prop_btl-regJournal_isDraft"]

   	      },
    	    successCallback: this.alfPublish("DATAGRID_EDIT_ROW", this.newregJournal),
    	    callbackScope: this
    	  });
    },
    
       
	   onCreateFormregJournal: function alfresco_formregJournal__onCreateFormregJournal(data){
		   	  this.alfLog("log", "alfresco_formregJournal__onCreateFormregJournal", data);
		   
		   	  this.data = data.data;
		   	 
		   	  this.rootNodeRef = data.rootNodeRef;
		   	  var payload = {};    	  
	    	  
	    	  payload.dialogTitle = data.config.dialogTitle;
	    	  payload.dialogConfirmationButtonTitle = data.config.dialogConfirmationButtonTitle;
	    	  payload.dialogCancellationButtonTitle = data.config.dialogCancellationButtonTitle;
	    	  payload.formSubmissionTopic = data.config.formSubmissionTopic;
	    	  payload.widgets = this.getWidgets();
	    	  
	    	  // console.log(this.data);
	    	  
	    	  this.alfLog("log", "alfresco_formregJournal__onCreateFormregJournal", payload);
	    	  this.alfPublish("ALF_CREATE_FORM_DIALOG_REQUEST", payload);
	   },
	   
	   getWidgets: function alfresco_formregJournal__getWidgets(){
		   
		   var optionsType = [
		                     	{value:"0", label:"Входящий"},
		                     	{value:"1", label:"Исходящий"},
		                     	{value:"2", label:"Внутренний"},
		                     	{value:"3", label:"НТД"},
		                     	{value:"4", label:"Дело проекта"},
		                     	{value:"5", label:"Мероприятие"},
		                     	{value:"6", label:"ОРД"},
		                     	{value:"7", label:"Договор"}
		                     	
		                    ];
		   
		   var widgets = [
	{
	   name: "alfresco/forms/controls/Select",
	   config: {
		  label:  "Тип",
	      name: "prop_btl-regJournal_doctype",
	      value: (this.data !== null) ? this.data.doctype : "",
	      optionsConfig: {
	    	  fixed: optionsType
	    	}
	   }
	},
		                  {
       	    name: "alfresco/forms/controls/DojoValidationTextBox",
    	    id:"btl-regJournal_name",
    	    config: {
    	       label: "Название",
    	       name: "prop_btl-regJournal_name",
    	       value: (this.data !== null) ? this.data.name : "" , 
    	       requirementConfig: {
    	          initialValue: true
    	       }
    	    }
    	 },
    	 {
        	name: "alfresco/forms/controls/DojoValidationTextBox",
     	    id:"btl-regJournal_format",
     	    config: {
     	       label: "Формат",
     	       name: "prop_btl-regJournal_format",
     	       value: (this.data !== null) ? this.data.format : "" , 
     	       requirementConfig: {
     	          initialValue: true
     	       }
     	    }
     	 },
     	{
        	name: "alfresco/forms/controls/DojoValidationTextBox",
     	    id:"btl-regJournal_counter",
     	    config: {
     	       label: "Последний номер",
     	       name: "prop_btl-regJournal_counter",
     	       value: (this.data !== null) ? this.data.counter.toString().replace(/\s+/g, '') : "" , 
     	       requirementConfig: {
     	          initialValue: true
     	       }
     	    }
     	 },
     	{
			 name: "alfresco/forms/controls/DojoCheckBox",
			 config: {
				fieldId: "btl-regJournal_isDraft",
			    label:  "Проектный",
			    name: "prop_btl-regJournal_isDraft",
			    value: (this.data !== null) ? this.data.isDraftBool : "", 
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