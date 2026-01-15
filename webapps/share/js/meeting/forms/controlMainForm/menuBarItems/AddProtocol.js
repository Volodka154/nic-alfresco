define(["dojo/_base/declare",
    "../../../menuBarItems/_MenuBarItem",
    "dojo/_base/lang"
], function (declare, MenuBarItem, lang) {
    return declare([MenuBarItem], {
        label: "Добавить протокол",
        publishTopic: "BTL_CREATE_FORM_PROTOCOL",
        publishGlobal: true,        
        publishPayloadType: "PROCESS",
        
        publishPayload: {
	        	config:{
	         	   dialogTitle: "Добавить протокол",
	         	   dialogConfirmationButtonTitle: "Добавить",
	                dialogCancellationButtonTitle: "Отмена",
	                formSubmissionTopic: "ADD_PROTOCOL_MEETING_PROGRAMM_TOPIC"
	     	   },
	     	data:null
	    }
        
    	

    });
});