
define(["dojo/_base/declare",
        "meeting/choices/_Choice",
        "dojo/_base/lang"],
    function (declare, Choice, lang) {
        return declare([Choice], {
            name: "assoc_btl-meetingProtocol_controller",
            header: "Выбрать контролера",
            labelButton: "Выбрать",
            labelText: "Контролер",
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
	             initialValue: false,	             
	             rules: [
	                     {
	                       targetId: "PROTOCOL_ON_CONTROL_CHECK",
	                       is: [true]
	                     }	                     
	                   ]
	         },
            
            postMixInProperties: function () {   
                this.alfSubscribe(this.pubSubScope + "_valueChangeOf_PROTOCOL_ON_CONTROL_CHECK", lang.hitch(this, this.controlCheck), true, true);  
                this.inherited(arguments);
            },
            
            controlCheck: function (payload) {
            	this.setVisible(payload.value);            	   	         
            }
            
            
        });
    });