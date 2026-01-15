/**
 * Created by nabokov on 23.11.2016.
 */
define(["dojo/_base/declare",
    "meeting/forms/_DynamicForm"

], function (declare, DynamicForm) {

    return declare([DynamicForm], {

    	routeConfigEnable:false,
    	
        postCreate: function () {
        	
            this.widgets = [
                            {
								name: "meeting/forms/controlApprovalForm/tabApproval",
								config:{
									routeConfigEnable : this.routeConfigEnable
								}
                            }                           
                           ];
            //Добаляем виджеты до вызова конструктора
            this.inherited(arguments);
        },

    });
});