/**
 * Created by nabokov on 25.11.2016.
 */
define(["dojo/_base/declare",
    "meeting/buttons/_Button",
    "dojo/_base/lang"

], function (declare, AlfButton, lang) {

    return declare([AlfButton], {
        
    	disableSubscribeTopic : "DISABLE_NAVIGATE_BUTTON",
    	
    	postMixInProperties: function () {
            this.inherited(arguments);
        	this.alfSubscribe(this.disableSubscribeTopic, lang.hitch(this, this.disableButton), true);    
        },
        disableButton:function(payload){
        	if (payload.all)
    		{
        		this.setDisabled(payload.disabled);
    		}
        	else if (payload.id && payload.id == this.id)
    		{
        		this.setDisabled(payload.disabled);
    		}        		
        }
    	
    });
});