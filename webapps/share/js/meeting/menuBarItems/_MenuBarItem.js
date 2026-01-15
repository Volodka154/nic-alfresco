/**
 * Created by nabokov on 18.11.2016.
 */
define(["dojo/_base/declare",
    "alfresco/menus/AlfMenuBarItem"
], function (declare, AlfMenuBarItem) {
    return declare([AlfMenuBarItem], {
        publishGlobal: true,
        cssRequirements: [{cssFile:"./css/_MenuBarItem.css"}],
        postCreate: function () {
            this.title = this.label;
            this.inherited(arguments);
        },
    });
});