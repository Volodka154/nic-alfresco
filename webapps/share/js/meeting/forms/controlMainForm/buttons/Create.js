/**
 * Created by nabokov on 25.11.2016.
 */
define(["dojo/_base/declare",
    "../../../buttons/_Button",
    "dojo/_base/lang",
], function (declare, DateTextBox, lang) {
    return declare([DateTextBox], {
        label: "Создать",
        publishTopic: "CREATE_MEETING_EVENT",
        publishGlobal: true,
        disabled: true,
        postCreate: function () {
            this.alfSubscribe("VALID_BASE_FORM_MEETING", lang.hitch(this, this.disableButton), true);
            this.alfSubscribe("CREATE_MEETING_BUTTON_DISABLE", lang.hitch(this, this.disableButtonTrue), true);   
            this.inherited(arguments);
            this.setDisabled(true);
        },
        disableButton: function (payload) {
            this.setDisabled( (payload.valid) ? false : true) ;
        },
        
        disableButtonTrue:function(){
        	 this.setDisabled(true) ;
        }
        
        
    });
});