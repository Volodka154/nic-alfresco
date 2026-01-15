define(["dojo/_base/declare",
        "alfresco/core/Core",
        "dojo/_base/lang","jquery"
        ],
        function(declare, Core, lang,$ ) {

   return declare([Core], {
	   
	   constructor: function alfresco_main__registerSubscriptions(args) {
		   lang.mixin(this, args);
		   this.alfSubscribe("DICTIONARIES_LOAD_DATA_LIST", lang.hitch(this, this.loadDataList));
		   this.alfSubscribe("NAV_HOME", lang.hitch(this, this.navHome));
	   },
	   
	   
	   loadDataList: function main_DataList__loadDataList(payload) {
		   
    	   this.alfLog("log", "main_DataList__loadDataList", payload);
    	   var json = {value: payload.model};
    	   this.alfPublish("BTL_DYNAMIC_FORM_UPDATE", json);
       },
       navHome:  function main_navHome(payload) {
           window.location.href = "/share";
       }
        
   });
});