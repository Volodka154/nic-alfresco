/**
 * Created by nabokov on 24.11.2016.
 */
define(["dojo/_base/declare",
    "../../../menuBarItems/_MenuBarItem",
    "meeting/dialogs/GetEmployees",
    "meeting/utils/base",
    "dojo/_base/lang"
], function (declare, MenuBarItem, GetEmployees, utilBase, lang) {
    return declare([MenuBarItem], {
        label: "Добавить участников",
        publishTopic: "PRESS_MEETING_SHOW_DIALOG_ADD_USERS",

        postCreate: function () {
        	
        	
        	var store = utilBase.getStoreById("MEETING_STORE");	                
            handleAlfSubscribe = store.handleAlfSubscribe;   
            
            handleAlfSubscribe.push(this.alfSubscribe("PRESS_MEETING_SHOW_DIALOG_ADD_USERS", lang.hitch(this, this.showDialogUsers), true));
            
            this.inherited(arguments);

            var dialog = new GetEmployees({
                showDialogSubscribe: "ADD_USERS_MEETING_SHOW_DIALOG_ADD_USERS",
                dataTopic: "ADD_USERS_MEETING_GET_USERS"
            });
            
            
            handleAlfSubscribe.push(dialog.alfSubscriptions[0]);
            
        },

        showDialogUsers: function () {
            var valueUsers = utilBase.getFormValuesById("USERS_GRID_MAIN_FORM_MEETING");
            var usersNodeRefsExcluded = [];
            if(valueUsers){
                valueUsers.forEach(function (item) {
                    usersNodeRefsExcluded.push(item["prop_btl-meetingParticipant_emp-ref"]);
                });
            }

            this.alfPublish("ADD_USERS_MEETING_SHOW_DIALOG_ADD_USERS",{excluded: usersNodeRefsExcluded }, true);
        }
    });
});