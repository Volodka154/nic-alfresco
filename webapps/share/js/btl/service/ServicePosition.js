define(["dojo/_base/declare",
        "alfresco/core/Core",
        "dojo/_base/lang",
        "alfresco/core/CoreXhr",
        "service/constants/Default"],
        function(declare, Core, lang, CoreXhr, AlfConstants) {

  return declare([Core, CoreXhr], {
	  
    newPosition: {}, 

    constructor: function btl_PositionService__constructor(args) {
      lang.mixin(this, args);
      this.alfSubscribe("BTL_CREATE_POSITION", lang.hitch(this, this.createPosition));
      this.alfSubscribe("BTL_EDIT_POSITION", lang.hitch(this, this.editPosition));
      this.alfSubscribe("BTL_CREATE_FORM_POSITION", lang.hitch(this, this.onCreateFormPosition));
            
    },
    
    
    
    createPosition: function btl_PositionService__createPosition(payload) {

    	this.alfLog("log", "btl_PositionService__createPosition", payload);
    	
    	this.newPosition.name = payload["prop_btl-pos_name"];
        this.newPosition.rang = payload["prop_btl-pos_rang"];

    	this.serviceXhr({
    	    url: "/share/proxy/alfresco/api/type/btl-pos%3aemployee-position/formprocessor",
    	    method: "POST",
    	    data: {
    	         "alf_destination": payload.alf_destination,
    	         "prop_btl-pos_name": payload["prop_btl-pos_name"],
    	         "prop_btl-pos_rang": payload["prop_btl-pos_rang"]
    	      },
    	    successCallback: this.updatePositionGrid,
    	    callbackScope: this
    	  });
    	},
    	
    updatePositionGrid: function btl_PositionService__updatePositionGrid(response, originalRequestConfig){
    	this.newPosition.nodeRef = response.persistedObject;
    	
    	this.alfPublish("DATAGRID_ADD_ROW",{
    		nodeRef: this.newPosition.nodeRef,
    		name: this.newPosition.name,
            rang: this.newPosition.rang
    	});
    	
 	    	    	    	
    },
    
    
    
    editPosition: function btl_PositionService__editPosition(payload) {
    	
    	this.alfLog("log", "btl_PositionService__editPosition", payload);
    	
    	this.newPosition.rowId = payload["rowId"];
    	this.newPosition.name = payload["prop_btl-pos_name"];
        this.newPosition.rang = payload["prop_btl-pos_rang"];
    	
    	this.serviceXhr({
    	    url: "/share/proxy/alfresco/api/node/"+ payload.nodeRef.replace("://", "/") +"/formprocessor",
    	    method: "POST",
    	    data: {
   	         "prop_btl-pos_name": payload["prop_btl-pos_name"],
             "prop_btl-pos_rang": payload["prop_btl-pos_rang"]
   	      },
    	    successCallback: this.alfPublish("DATAGRID_EDIT_ROW", this.newPosition),
    	    callbackScope: this
    	  });
    },
    
       
	   onCreateFormPosition: function alfresco_formPosition__onCreateFormPosition(data){
		   	  this.alfLog("log", "alfresco_formPosition__onCreateFormPosition", data);
		   
		   	  this.data = data.data;
		   	 
		   	  this.rootNodeRef = data.rootNodeRef;
		   	  var payload = {};    	  
	    	  
	    	  payload.dialogTitle = data.config.dialogTitle;
	    	  payload.dialogConfirmationButtonTitle = data.config.dialogConfirmationButtonTitle;
	    	  payload.dialogCancellationButtonTitle = data.config.dialogCancellationButtonTitle;
	    	  payload.formSubmissionTopic = data.config.formSubmissionTopic;
	    	  payload.widgets = this.getWidgets();
	    	  
	    	  this.alfLog("log", "alfresco_formPosition__onCreateFormPosition", payload);
	    	  this.alfPublish("ALF_CREATE_FORM_DIALOG_REQUEST", payload);
	   },
	   
	   getWidgets: function alfresco_formPosition__getWidgets(){
		   
	   		   
       var widgets = [{
       	    name: "alfresco/forms/controls/DojoValidationTextBox",
    	    id:"btl-pos_name",
    	    config: {
    	       label: "btl-pos_name.title",
    	       name: "prop_btl-pos_name",
    	       value: (this.data !== null) ? this.data.name : "" , 
    	       requirementConfig: {
    	          initialValue: true
    	       }
    	    }
         },
    	 {
            name: "alfresco/forms/controls/DojoValidationTextBox",
            id:"btl-pos_rang",
            config: {
               label: "btl-pos_rang.title",
               name: "prop_btl-pos_rang",
               value: (this.data !== null) ? this.data.rang : ""
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