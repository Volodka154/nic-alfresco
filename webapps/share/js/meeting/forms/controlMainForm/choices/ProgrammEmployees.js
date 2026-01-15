/**
 * Created by nabokov on 23.11.2016.
 */
define(["dojo/_base/declare",
        "meeting/choices/_Choice",
        "meeting/utils/base"],
    function (declare, Choice, utilBase) {
        return declare([Choice], {
                        
            name: "assoc_btl-meetingProgramm_employees",
            header: "Выбрать докладчика",
            value: "", 
            //renderData:"items",
            loadData: true,
            labelText: "Докладчик",
            labelButton: "Выбрать",
            urlList: "/share/proxy/alfresco/get-children-user-control",
            dataUrl:{
            	"nodeRef": this.documentNodeRef,
            	"type":"btl-emp:employee-content",
                "s_field":"btl-people:fio",
                "field":"btl-people:fio"
            },
            itemUrl:"/share/proxy/alfresco/picker/associationItem",
            dataItemUrl:{
                "type":"btl-emp:employee-content",
                "field":"btl-people:fio"
            },
            
            postMixInProperties: function () {
                this.inherited(arguments);
                var store = utilBase.getStoreById("MEETING_STORE");
               
                if (store.nodeRef) {
                    this.documentNodeRef = store.nodeRef;
                    this.dataUrl = {
                    			"nodeRef": this.documentNodeRef,
                    			"type":"btl-emp:employee-content",
                                "s_field":"btl-people:fio",
                                "field":"btl-people:fio"
                    			}
                }
                
            },
            
        	
        });
    });