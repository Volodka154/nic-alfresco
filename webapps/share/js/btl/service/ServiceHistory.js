define(["dojo/_base/declare",
        "alfresco/core/Core",
        "dojo/_base/lang",
        "alfresco/core/CoreXhr",
        "service/constants/Default"],
        function(declare, Core, lang, CoreXhr, AlfConstants) {

  return declare([Core, CoreXhr], {
	  
    newhistory: {}, 

    constructor: function btl_historyService__constructor(args) {
      lang.mixin(this, args);     
            
    }
    
    
    
  });
});