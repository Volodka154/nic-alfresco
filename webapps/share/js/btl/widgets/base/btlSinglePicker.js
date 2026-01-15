define(["dojo/_base/declare",
        "alfresco/forms/controls/SimplePicker",
        "dojo/_base/lang"],
        function(declare, SimplePicker, lang) {
   return declare([SimplePicker], {
	   
	   uid: "",
	   
	   completeWidgetSetup: function alfresco_forms_controls_SimplePicker__completeWidgetSetup() {
	         this.inherited(arguments);
	         this.alfSubscribe(this.uid + "SET_ITEM", lang.hitch(this, this.setItem), true);
	         this.alfSubscribe(this.itemSelectionPubSubScope + "ALF_CRUD_GET_ALL_SUCCESS", lang.hitch(this, this.dataLoadSuccess));
	   },
	   
	   dataLoadSuccess: function dataLoadSuccess(payload){
		   this.alfLog("log", "dataLoadSuccess this", this);
		   this.alfLog("log", "dataLoadSuccess", payload);
		   this.alfPublish( this.uid + "GET_VALUE_FROM_ITEM", null , true);
	   },
	   
	   setItem: function setItem (payload){
		   this.alfLog("log", "setItem_btlSimplePicker", payload);
		   
		   
	       this.alfPublish(this.itemSelectionPubSubScope + "ALF_ITEM_SELECTED", payload.item, true);
	         
	   }
   });
});
	   