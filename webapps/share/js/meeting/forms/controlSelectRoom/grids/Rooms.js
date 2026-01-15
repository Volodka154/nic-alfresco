/**
 * Created by nabokov on 23.11.2016.
 */
define(["dojo/_base/declare",
        "alfresco/core/Core",
        "../../../grids/_Grid",
        "dojo/_base/lang",
        "alfresco/core/CoreXhr",
        "meeting/utils/base"],
    function (declare, Core, DataGrid, lang, CoreXhr, utilBase) {
        return declare([DataGrid], {
        	
        	Url: "/search/meetingRooms",    
        	flexHeight: true,
            height: 430,
        	loadData: true,
        	resizable: false,
            colModel: [
                {title: "nodeRef", width: 100, dataType: "string", dataIndx: "nodeRef", hidden: true},
                {title: "Номер", width: 50, dataType: "string", dataIndx: "number"},
                {title: "Ответственный", width: 240, dataType: "string", dataIndx: "responsible"},
                {title: "responsible_ref", width: 50, dataType: "string", dataIndx: "responsible_ref", hidden: true},
                {title: "confirmationRequired", width: 50, dataType: "string", dataIndx: "confirmationRequired", hidden: true},
                {title: "*", width: 20, dataType: "string", dataIndx: "_confirmationRequired"}
            ],
            
            loadDataToDataGrid: function (response, originalRequestConfig){	
    		    
      		   response.items.forEach(function(item, i, arr) {     			   
      			   if (item["confirmationRequired"] == true){response.items[i]["_confirmationRequired"] = "*"}      			         			   			   
      			 });
      		    this.setDataDataGrid(response.items);
      		},
           
            postMixInProperties: function () {
                this.inherited(arguments);
            	//this.alfSubscribe("ADD_PROTOCOL_MEETING_PROGRAMM_TOPIC", lang.hitch(this, this.addProtocol), true);                              
            },
               
       
            rowClick:function(event, ui ){
            	
            	
            	if (ui.rowData.confirmationRequired && (typeof selectedRoomId == "undefined" || (ui.rowData.nodeRef != selectedRoomId)))
            		this.alfPublish("ALF_DISPLAY_PROMPT", {message: "Для данной переговорной требуется подтверждение ответственного", title:"Внимание"}, true);
            	
            	selectedRoomId = ui.rowData.nodeRef;
            	
            	this.alfPublish("LOAD_CALENDAR_ROOM", {room: ui.rowData.nodeRef, roomContent: ui.rowData.number, roomObject:ui.rowData}, true);
            	
            	this.alfPublish("ENABLE_DATE_CONTROL", null, true);
            	
            	
            },
            
            setEventsDataGrid: function(){
                var _this = this;
                this.grid.pqGrid({
                    rowClick: this.rowClick.bind(this)
                });               
           }
            
            
        });
    });