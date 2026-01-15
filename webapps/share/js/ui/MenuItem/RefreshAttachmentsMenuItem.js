/**
 * Created by nabokov on 01.09.2016.
 */
define([
    "dojo/_base/declare",
    "./_MenuItem",
    "dojo/topic"
], function(declare, MenuBarItem, topic) {

    return declare([MenuBarItem], {
        label: "Обновить",
        iconClass: "dijitCommonIcon icon-refresh btl-icon-16",

        onClick: function(e){
            topic.publish("refreshAttachmentsGrid");
        },
    });
});