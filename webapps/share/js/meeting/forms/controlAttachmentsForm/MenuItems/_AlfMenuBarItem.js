/**
 * Created by nabokov on 13.12.2016.
 */
define(["dojo/_base/declare",
        "alfresco/menus/AlfMenuBarItem",
        "./_mixinExtensionBarItem"
    ],
    function(declare, AlfMenuBarItem, _mixinSubscribeBarItem) {
        return declare([AlfMenuBarItem, _mixinSubscribeBarItem], {

        });
    });