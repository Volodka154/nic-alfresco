define([
    "dojo/_base/declare",
    "./_AlfMenuBarItem",
    "./_mixinIsReadOnly",
    "dojo/topic",
     "dojo/_base/lang"
], function(declare, MenuBarItem, _mixinIsReadOnly, topic, lang) {

    return declare([MenuBarItem, _mixinIsReadOnly], {
        label: "Удалить",
        iconClass: "dijitCommonIcon icon-delete btl-icon-16",

        postMixInProperties: function () {
            this.alfSubscribe("SELECT_ROW_LINKS_GRID", lang.hitch(this, this.changeSelectedLink), true);
            this.inherited(arguments);
        },

        isReadOnly: function (payload) {
        	this.setVisibly(false);
        },

        onClick: function(e){
            this.alfPublish("DATAGRID_DELETE_WIDGET_LINK", null, true, true);
        },

        changeSelectedLink: function(dataRow){
            this.setVisibly(dataRow.isEditable == "true");
        }
    });
});