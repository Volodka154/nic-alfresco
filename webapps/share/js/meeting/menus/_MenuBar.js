/**
 * Created by nabokov on 24.11.2016.
 */
define(["dojo/_base/declare",
    "alfresco/menus/AlfMenuBar"
], function (declare, AlfMenuBar) {
    return declare([AlfMenuBar], {
        cssRequirements: [{cssFile:"./css/_MenuBar.css"}],
    });
});