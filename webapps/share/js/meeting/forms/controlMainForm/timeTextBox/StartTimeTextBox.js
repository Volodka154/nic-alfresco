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
        label: "Начало",
        name: "prop_btl-meeting_startDate",
        
        _disabled : true,
        value:"",
        
        postMixInProperties: function () {
            this.inherited(arguments);
        	this.alfSubscribe("CHANGE_MEETING_START_DATE", lang.hitch(this, this.updateValue), true);   
        },
        
        updateValue:function(data){
        	this.setValue(data);
        },
        
        getValue:function(){        	
        	return this.value;
        }
        
        
    });
});