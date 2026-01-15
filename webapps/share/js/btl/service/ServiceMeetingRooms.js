define(["dojo/_base/declare",
        "alfresco/core/Core",
        "dojo/_base/lang",
        "alfresco/core/CoreXhr",
        "service/constants/Default"],
        function(declare, Core, lang, CoreXhr, AlfConstants) {

  return declare([Core, CoreXhr], {
	  
    newmeetingRooms: {}, 

    constructor: function btl_meetingRoomsService__constructor(args) {
      lang.mixin(this, args);
      this.alfSubscribe("BTL_CREATE_meetingRooms", lang.hitch(this, this.createmeetingRooms));
      this.alfSubscribe("BTL_EDIT_meetingRooms", lang.hitch(this, this.editmeetingRooms));
      this.alfSubscribe("BTL_CREATE_FORM_meetingRooms", lang.hitch(this, this.onCreateFormmeetingRooms));
     
            
    },
    
    
    
    
    createmeetingRooms: function btl_meetingRoomsService__createmeetingRooms(payload) {
    	
    	
    	
    	this.alfLog("log", "btl_meetingRoomsService__createmeetingRooms", payload);
    	
    	this.newmeetingRooms.number = payload["prop_btl-meetingRooms_number"]; 
    	 	
    	this.newmeetingRooms.responsible = payload["assoc_btl-meetingRooms_responsible_val"];
    	this.newmeetingRooms.responsible_ref = payload["assoc_btl-meetingRooms_responsible_added"];
    	
    	var confirmationRequired = "";
    	if (payload["prop_btl-meetingRooms_confirmationRequired"] == true)
    		confirmationRequired = "&#9745;";
    	else
    		confirmationRequired = "&#9937;";
    	
    	
    	this.newmeetingRooms.confirmationRequired = confirmationRequired;   

    	this.serviceXhr({
    	    url: "/share/proxy/alfresco/api/type/btl-meetingRooms%3ameetingRoomsData/formprocessor",
    	    method: "POST",
    	    data: {
    	         "alf_destination": payload.alf_destination,
    	         "prop_btl-meetingRooms_number": payload["prop_btl-meetingRooms_number"],
        		 "prop_btl-meetingRooms_confirmationRequired": payload["prop_btl-meetingRooms_confirmationRequired"],
        		 "assoc_btl-meetingRooms_responsible_added": payload["assoc_btl-meetingRooms_responsible_added"],
 		         "assoc_btl-meetingRooms_responsible_removed": payload["assoc_btl-meetingRooms_responsible_removed"]
    	      },
    	    successCallback: this.updatemeetingRoomsGrid,
    	    callbackScope: this
    	  });
    	},
    	
    updatemeetingRoomsGrid: function btl_meetingRoomsService__updatemeetingRoomsGrid(response, originalRequestConfig){
    	this.newmeetingRooms.nodeRef = response.persistedObject;
    	
    	
    	
    	this.alfPublish("DATAGRID_ADD_ROW",{
    		nodeRef: this.newmeetingRooms.nodeRef,
    		number: this.newmeetingRooms.number,
    		confirmationRequired_img: this.newmeetingRooms.confirmationRequired,
    		responsible: this.newmeetingRooms.responsible,	
    		responsible_ref: this.newmeetingRooms.responsible_ref	
    	});
    	
 	    	    	    	
    },
    
    
    
    editmeetingRooms: function btl_meetingRoomsService__editmeetingRooms(payload) {
    	
    	this.alfLog("log", "btl_meetingRoomsService__editmeetingRooms", payload);
    	
    	// console.log(payload);
    	
    	this.newmeetingRooms.rowId = payload["rowId"];
    	this.newmeetingRooms.number = payload["prop_btl-meetingRooms_number"];  
    	this.newmeetingRooms.confirmationRequired = payload["prop_btl-meetingRooms_confirmationRequired"];
    	this.newmeetingRooms.responsible = payload["assoc_btl-meetingRooms_responsible_val"]; 
    	this.newmeetingRooms.responsible_ref = payload["assoc_btl-meetingRooms_responsible"]; 
    	
    	var confirmationRequired = "";
    	if (payload["prop_btl-meetingRooms_confirmationRequired"] == true)
    		confirmationRequired = "&#9745;"
    	else
    		confirmationRequired = "&#9937;"
    	
    	
    	this.newmeetingRooms.confirmationRequired_img = confirmationRequired;   
  	    	    	
    	
    	this.serviceXhr({
    	    url: "/share/proxy/alfresco/api/node/"+ payload.nodeRef.replace("://", "/") +"/formprocessor",
    	    method: "POST",
    	    data: {
    	    	"prop_btl-meetingRooms_number": payload["prop_btl-meetingRooms_number"],
    	    	"prop_btl-meetingRooms_confirmationRequired": payload["prop_btl-meetingRooms_confirmationRequired"],
		    	"assoc_btl-meetingRooms_responsible_added": payload["assoc_btl-meetingRooms_responsible_added"],
		        "assoc_btl-meetingRooms_responsible_removed": payload["assoc_btl-meetingRooms_responsible_removed"]
    		
   	      },
    	    successCallback: this.alfPublish("DATAGRID_EDIT_ROW", this.newmeetingRooms),
    	    callbackScope: this
    	  });
    },
    
       
	   onCreateFormmeetingRooms: function alfresco_formmeetingRooms__onCreateFormmeetingRooms(data){
		   	  this.alfLog("log", "alfresco_formmeetingRooms__onCreateFormmeetingRooms", data);
		   
		   	  this.data = data.data;
		   	 
		   	  this.rootNodeRef = data.rootNodeRef;
		   	  var payload = {};    	  
	    	  payload.dialogTitle = data.config.dialogTitle;
	    	  payload.dialogConfirmationButtonTitle = data.config.dialogConfirmationButtonTitle;
	    	  payload.dialogCancellationButtonTitle = data.config.dialogCancellationButtonTitle;
	    	  payload.formSubmissionTopic = data.config.formSubmissionTopic;
	    	  payload.widgets = this.getWidgets();
	    	  payload.contentHeight = "200px";
	    	  this.alfLog("log", "alfresco_formmeetingRooms__onCreateFormmeetingRooms", payload);
	    	  this.alfPublish("ALF_CREATE_FORM_DIALOG_REQUEST", payload);
	   },
	   
	   getWidgets: function alfresco_formmeetingRooms__getWidgets(){
		   
		 
		   
		   var widgets = [			
				 {
		       	    name: "btl/widgets/base/TextBox",
		    	    id:"btl-meetingRooms_number",
		    	    config: {
		    	       label: "№ комнаты",
		    	       name: "prop_btl-meetingRooms_number",
		    	       value: (this.data !== null) ? this.data.number : "" , 
		    	       requirementConfig: {
		    	          initialValue: true
		    	       }
		    	    }
		    	 },
				 {
		    		 name:"btl/widgets/base/btlChoice",
		               id: "meetingRooms_responsible_id",
		               config:{
		                     name: "assoc_btl-meetingRooms_responsible",
		                     header: "Выбрать ответственного",
		                     value:  "",
		                     value: (this.data !== null) ? this.data.responsible_ref : "",
		                     labelText: "Ответственный",
		                     labelButton: "...",
		                     urlList: "/share/proxy/alfresco/filters/association",
		                     dataUrl:{
		                         "type":"btl-emp:employee-content",
		                         "s_field":"btl-people:fio",
		                         "field":"btl-people:fio"
		                     },
		                     itemUrl:"/share/proxy/alfresco/picker/associationItem",
		                     dataItemUrl:{
		                         "type":"btl-emp:employee-content",
		                         "field":"btl-people:fio"
		                     },
		                     requirementConfig: {
				    	          initialValue: true
				    	       }
		               }
			     },
				 {
			    	 	name: "alfresco/forms/controls/CheckBox",
			            config: {
	                        label:  "Требуется подтверждение",
	                        name: "prop_btl-meetingRooms_confirmationRequired",
	                        value: (this.data !== null) ? this.data.confirmationRequired : false

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