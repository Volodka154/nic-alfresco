/**
 * Created by nabokov on 23.11.2016.
 */
define(["dojo/_base/declare",
    "meeting/forms/_DynamicForm"

], function (declare, DynamicForm) {

    return declare([DynamicForm], {

        postCreate: function () {
            this.widgets = [
                {
                    name: "meeting/module/tasks",
                    config: {
                        storeId: this.storeId,
                        gridId: this.uidGrid
                    }
                },
            ];
            //Добаляем виджеты до вызова конструктора
            this.inherited(arguments);
        },

    });
});