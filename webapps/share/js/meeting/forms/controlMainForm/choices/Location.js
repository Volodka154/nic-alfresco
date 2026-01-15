/**
 * Created by nabokov on 23.11.2016.
 */
define(["dojo/_base/declare",
        "dojo/_base/lang",
        "meeting/choices/_Choice"],
    function (declare, lang, Choice) {
        return declare([Choice], {
            name: "assoc_btl-meeting_room",
            header: "Место проведения",
            value: "",
            labelText: "Место проведения",
            labelButton: "Выбрать",
                       
            
            urlList: "/share/proxy/alfresco/filters/association",
            dataUrl:{
                "type":"btl-meetingRooms:meetingRoomsData",
                "s_field":"btl-meetingRooms:number",
                "field":"btl-meetingRooms:number"
            },
            itemUrl:"/share/proxy/alfresco/picker/associationItem",
            dataItemUrl:{
                "type":"btl-meetingRooms:meetingRoomsData",
                "field":"btl-meetingRooms:number"
            },
            
            
            postMixInProperties: function () {
                this.inherited(arguments);                
            	this.alfSubscribe("CHANGE_MEETING_LOCATION", lang.hitch(this, this.updateValue), true);   
            },
            
            postCreate: function () {            	
                this.inherited(arguments);
                this.setDisable(true);
            },
            
            updateValue:function(data){
            	this.setValue(data);
            }
            
        });
    });