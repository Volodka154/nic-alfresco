define(["dojo/_base/declare",
        "alfresco/core/Core",
        "alfresco/core/CoreXhr",
    "meeting/tableView/tableView",
    "meeting/utils/base",
    "dijit/_WidgetBase",
    "dojo/_base/lang"
    ],
    function (declare, Core, CoreXhr, tableView, utilBase, base, lang) {
        return declare([tableView], {
        	
        	idStoreMeeting: "MEETING_STORE",
        	
        	postCreate: function() {
        		this.inherited(arguments);
        		this.getNegotiationTableData();
            },
             
            getNegotiationTableData:function (){
            	
            	 var store = utilBase.getStoreById(this.idStoreMeeting);
            	 _this = this;
            		Alfresco.util.Ajax.jsonGet({
            		 	method:"GET",
            		 	url: "/share/proxy/alfresco/negotiation/get-negotiation-result-data?documentNodeRef=" + store.nodeRef,	 		
            		 	successCallback:{
            					fn: function getNegotiatorDetails(complete){       				
            	       			if(complete.serverResponse.status == 200){            	       				
            	                     _this.setTableBody(_this.getNegotiationTableBody(complete.json.negotiationResults)); 
            	       			}else{
            	       				console.log("Error getting negotiation list");
            	       			}
            	       		},
            			 		scope: this
            		 		}
            		 	});	
            },
        	
            getNegotiationTableBody: function (results) {
                var result = "";
                for (i = 0; i < results.length; i++) {
                    if (results[i].state == 'Согласован' || results[i].state == 'Подписан' || results[i].state == 'На регистрации' || results[i].state == 'Согласован с замечаниями') {
                        result += "<tr style='background-color: #d6e9c6'>";
					} else if (results[i].state == 'Отклонен') {
                        result += "<tr style='background-color: #FFA9A9'>";
					} else if (results[i].state == 'На согласование' || results[i].state == 'На подписание') {
						result += "<tr style='background-color: #FCECD3'>";
					} else if (results[i].state == 'Отменен') {
						result += "<tr style='background-color: #C6C6C6'>";
					} else if (results[i].state == 'Не визирован') {
						result += "<tr style='background-color: #FFFFFF'>";
                    } else {
						result += "<tr>";
					}

					result += "<td>" + results[i].levelName + "</td>";
                    result += "<td>" + results[i].fullName + "</td>";
                    result += "<td style='width:70px;'>" + results[i].levelEndDate + "</td>";
                    result += "<td style='width:70px;'>" + results[i].actualNegotiationDate + "</td>";
                    result += "<td>" + results[i].state + "</td>";
                    result += "<td>" + results[i].cycle + "</td>";
                    result += "<td>" + results[i].file + "</td>";
                    result += "<td>" + results[i].negotiatorComment + "</td>";
                    result += "</tr>";
                }
                return result;
            },
            
        	headData:[
						{
							  style:"width:170px",
							  label:"Этап"
						},
						{
							  style:"width:250px",
							  label:"ФИО"
						},
						{
							  style:"width:100px",
							  label:"До"
						},
						{
							  style:"width:100px",
							  label:"Дата"
						},
						{
							  style:"width:100px",
							  label:"Статус"
						},
						{
							  style:"width:60px",
							  label:"Круг"
						},
						{
							  style:"width:60px",
							  label:"Файл"
						},
						{
							  style:"width:150px",
							  label:"Комментарий"
						}
        	          ]
           
        		
        
        });
    });