/**
 * Created by nabokov on 05.12.2016.
 */
define(["dojo/_base/declare",
    "../../../menuBarItems/_MenuBarItem",
    "dojo/_base/lang"
], function (declare, MenuBarItem, lang) {
    return declare([MenuBarItem], {                 
    
	    label: "Добавить вопрос",
	    publishTopic: "BTL_CREATE_FORM_PROGRAMM",
	    publishGlobal: true,        
	    publishPayloadType: "PROCESS",
	    
	    publishPayload: {
	        	config:{
	        		dialogTitle: "Добавление вопроса",
	        		dialogConfirmationButtonTitle: "Создать",
	                dialogCancellationButtonTitle: "Закрыть",
	                formSubmissionTopic: "ADD_QUESTION_MEETING_PROGRAMM_TOPIC"
	     	   },
	     	data:null
	    }

    });
});