/**
 * Created by nabokov on 25.11.2016.
 */
define(["dojo/_base/declare",
    "meeting/forms/_DynamicForm",
    "dojo/_base/lang",
    "meeting/utils/base",
    "../buttons/Create",
    "../buttons/Update",
    "../buttons/UpdateAndClose"

], function (declare, DynamicForm, lang, utilBase) {

    return declare([DynamicForm], {
        state: "",
        path: "meeting/forms/controlMainForm/",
        postCreate: function () {
            this.inherited(arguments);
            this.alfSubscribe("CHANGE_STATE_MEETING_DOCUMENT", lang.hitch(this, this.setState), true);
            if(!this.state && this.storeId) {
                var store = utilBase.getStoreById(this.storeId);
                if (store.document) {
                    this.state = store.state;
                }
            }
            this.setState({state: this.state});
        },
        setState: function (payload) {
            if(payload.state){
            	var buttons = [
                               {"name": this.path + "buttons/Update"}                               
                               ]
            	
            	buttons.push({"name": this.path + "buttons/UpdateAndClose"});
            	buttons.push({"name": this.path + "buttons/Cancel"});
        		
            	
                this.onDynamicFormUpdate({value: JSON.stringify(buttons)});
            }else{
            	
            	var buttons = [
                               {"name": this.path + "buttons/Create"}                           
                               ]
            	
            	
        		buttons.push({"name": this.path + "buttons/Cancel"});
        		
            	
                this.onDynamicFormUpdate({value: JSON.stringify(buttons)});
            }
        }
    });
});