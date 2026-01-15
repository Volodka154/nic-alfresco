/**
 * Created by pechenkin on 20.12.2016.
 */
define(["dojo/_base/declare",
    "../../../menus/_MenuBar",
    "../menuBarItems/AddProtocol"

], function (declare, MenuBar) {

    return declare([MenuBar], {

    	storeId : null,
        postCreate: function () {
        	if (!this._disabled)
    		{
	            this.widgets = [
	                {
	                    name:"meeting/forms/controlMainForm/menuBarItems/AddProtocol",
	                    config:{
	                        storeId: this.storeId
	                    }
	                },
	                {
	                    name:"meeting/forms/controlMainForm/menuBarItems/EditProtocol",
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