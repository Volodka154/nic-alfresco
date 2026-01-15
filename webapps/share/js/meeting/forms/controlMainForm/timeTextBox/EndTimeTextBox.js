/**
 * Created by nabokov on 26.12.2016.
 */
define(["dojo/_base/declare",
    "../../../dateTextBox/_TimeTextBox",
    "dojo/_base/lang",
    "./mixinSubDateChange",
    "meeting/utils/base"
], function (declare, _TimeTextBox, lang, mixinSubDateChange, utilBase) {
    return declare([_TimeTextBox, mixinSubDateChange], {
        label: "Окончание",
        name: "prop_btl-meeting_endDate",
        
        
        _disabled : true,
        value:"",
        
        postMixInProperties: function () {
            this.inherited(arguments);
        	this.alfSubscribe("CHANGE_MEETING_END_DATE", lang.hitch(this, this.updateValue), true);   
        	document.a = this;
        },
        
        updateValue:function(data){
        	this.setValue(data);
        },
        
        getValue:function(){        	
        	return this.value;
        }
        
    });
});