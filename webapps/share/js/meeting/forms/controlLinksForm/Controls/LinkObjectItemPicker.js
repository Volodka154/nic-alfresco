define(["dojo/_base/declare",
        "meeting/choices/_Choice",//"btl/widgets/base/ItemPicker",//
        "meeting/utils/base",
        "alfresco/core/CoreXhr",
        "dojo/_base/lang"],
        function(declare, ItemPicker, utilBase,CoreXhr,lang){

    return declare([ItemPicker, CoreXhr], {
        name: "assoc_btl-link_linkObject",
        header: "Выбрать объект",
        labelText: "Объект",
        labelButton: "Выбрать",
        urlList: "/share/proxy/alfresco/filters/association",
        dataUrl:{
            "type":"",
            "s_field":"",
            "field":""
        },
        itemUrl:"/share/proxy/alfresco/picker/associationItem",
        dataItemUrl:{
            "type":"",
            "field":""
        },

        postMixInProperties: function () {
            this.alfSubscribe("BTL_LINK_OBJECT_TYPE_CHANGED", lang.hitch(this, this.changeSource, true), true);
            if (this.objectType != "")
                this.changeSource(false, this.objectType);
            
            this.inherited(arguments);
        },

        postCreate: function(){
            this.inherited(arguments);
            /*
            if (this.objectType != "")
                this.changeSource(false, this.objectType);
                */
            this.setDisable(true);
        },

        changeSource: function btl_LinkObjectItemPicker__changeSource(clean, newObjectType){
        	
            if (clean){
                this.alfPublish(this.id + "_BTL_BTN_CLEAN_VALUE", this, true);
                this.setDisable(false);
            }

            if (this.choiceItem){
            	
        		this.choiceItem.widgets.dialog.header.textContent = this.getHeaderText(newObjectType);
                this.choiceItem.options.dataUrl.type = this.getDataType(newObjectType);
                this.choiceItem.options.dataUrl.field = this.getField(newObjectType);
                this.choiceItem.options.dataUrl.s_field = this.getSField(newObjectType);
                this.choiceItem.options.dataUrl.extra = this.getExtra(newObjectType);
                this.choiceItem.options.dataUrl.data = this.getData(newObjectType);
    		
            
                this.setValue(this.value);
            }


            this.dataUrl.type = this.getDataType(newObjectType);                
            this.dataUrl.field = this.getField(newObjectType);               
            this.dataUrl.s_field = this.getSField(newObjectType);
            
            this.dataItemUrl.type = this.getDataType(newObjectType);          
            this.dataItemUrl.field = this.getField(newObjectType); 
            
           
        },

        getHeaderText: function btl_LinkObjectItemPicker__getHeaderText(newObjectType){
            var header = "Выберите ";
            switch (newObjectType){
                case "btl-project:projectDataType": header += "проект"; break;
                case "btl-incomming:documentDataType": header += "входящий документ"; break;
                case "btl-outgoing:documentDataType": header += "исходящий документ"; break;
                case "btl-internal:documentDataType": header += "внутренний документ"; break;
                case "btl-meeting:meetingDataType": header += "мероприятие"; break;
                case "0": header += "резолюцию по входящему документу"; break;
                case "1": header += "задание по исходящему документу"; break;
                case "2": header += "резолюцию по внутреннему документу"; break;
                case "3": header += "задание по проекту"; break;
                case "4": header += "инициативное задание"; break;
                case "5": header += "НТД"; break;
                case "6": header += "дело проекта"; break;
                default: header +="объект"; break;
            }
            return header;
        },

        getDataType: function btl_LinkObjectItemPicker__getDataType(newObjectType){
        	
        	
            switch (newObjectType){
                case "btl-project:projectDataType":
                case "btl-meeting:meetingDataType":
                    return newObjectType;
                case "btl-incomming:documentDataType":
                case "btl-outgoing:documentDataType":
                case "btl-internal:documentDataType":
                    return "btl-document:documentDataType";
                case "0":
                case "1":
                case "2":
                case "3":
                case "4":
                    return "btl-task:taskDataType";
                case "5":
                    return "btl-ntd:ntdDataType";
                case "6":
                    return "btl-projectCase:projectCaseDataType";
                default:
                    return "";
            }
        },

        getField: function btl_LinkObjectItemPicker__getField(newObjectType){
            switch (newObjectType){
                case "btl-project:projectDataType":
                    return "shortName";
                case "btl-meeting:meetingDataType":
                    return "theme";
                case "btl-incomming:documentDataType":
                case "btl-outgoing:documentDataType":
                case "btl-internal:documentDataType":
                    return "regNumber,regDate,content";
                case "0":
                case "1":
                case "2":
                case "3":
                case "4":
                    return "name";
                case "5":
                    return "btl-document:regNumber,btl-document:regDate,btl-document:name";
                case "6":
                    return "btl-document:regNumber,btl-document:regDate,btl-document:project-content";
                default:
                    return "";
            }
        },

        getSField: function btl_LinkObjectItemPicker__getSField(newObjectType){
            switch (newObjectType){
                case "btl-project:projectDataType":
                    return "shortName";
                case "btl-meeting:meetingDataType":
                    return "theme";
                case "btl-incomming:documentDataType":
                case "btl-outgoing:documentDataType":
                case "btl-internal:documentDataType":
                    return "regNumber";
                case "0":
                case "1":
                case "2":
                case "3":
                case "4":
                    return "name";
                case "5":
                    return "btl-document:regNumber";
                case "6":
                    return "btl-document:regNumber";
                default:
                    return "";
            }
        },

        getExtra: function btl_LinkObjectItemPicker__getExtra(newObjectType){
            switch (newObjectType){
                case "0":
                case "1":
                case "2":
                case "3":
                case "4":
                    return 'btl\\-task\\:taskType:"' + newObjectType + '"';
                case "btl-incomming:documentDataType":
                case "btl-outgoing:documentDataType":
                case "btl-internal:documentDataType":
                    return 'CLASS:"' + newObjectType +'"';
                default:
                    return "";
            }
        },

        getData: function btl_LinkObjectItemPicker__getData(newObjectType){
            if (newObjectType == "btl-project:projectDataType")
                return "btl-project:stage";
            else
                return "";
        }
    });
});