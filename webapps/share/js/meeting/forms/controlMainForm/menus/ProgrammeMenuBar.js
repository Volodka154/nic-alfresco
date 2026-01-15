/**
 * Created by nabokov on 05.12.2016.
 */
define(["dojo/_base/declare",
    "../../../menus/_MenuBar",
    "../menuBarItems/AddQuestion"

], function (declare, MenuBar) {

    return declare([MenuBar], {

    	storeId:null,
        postCreate: function () {
        	if (!this._disabled)
    		{
	            this.widgets = [
	                {
	                    name:"meeting/forms/controlMainForm/menuBarItems/AddQuestion",
	                    config:{
	                        storeId: this.storeId
	                    }
	                }
	            ];
    		}
            //Добаляем виджеты до вызова конструктора
            this.inherited(arguments);
        },

    });
});