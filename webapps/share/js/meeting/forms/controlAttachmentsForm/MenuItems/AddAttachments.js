/**
 * Created by nabokov on 13.12.2016.
 */
define(["dojo/_base/declare",
        "./_AlfCreateContentMenuBarItem",
        "./_mixinIsReadOnly",
    ],
    function(declare, AlfCreateContentMenuBarItem, _mixinIsReadOnly) {

        return declare([AlfCreateContentMenuBarItem, _mixinIsReadOnly], {
            label: "Загрузить",

        });
    });