/**
 * Created by nabokov on 24.11.2016.
 */
define(["dojo/_base/declare",
    "../../../menus/_MenuBar",
    "../menuBarItems/AddUsers"

], function (declare, MenuBar) {

    return declare([MenuBar], {

        postCreate: function () {
        	if (!this._disabled)
    		{
		        this.widgets = [
		            {
		                name:"meeting/forms/controlMainForm/menuBarItems/AddUsers"
		            },
		            {
		            	name:"meeting/forms/controlMainForm/menuBarItems/RefreshUsers"
		            },
		            {
		            	name:"meeting/forms/controlMainForm/menuBarItems/ClearInviteUsers"
		            }
		        ];
    		}
            //Добаляем виджеты до вызова конструктора
            this.inherited(arguments);
        },

    });
});