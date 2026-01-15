/**
 * Created by nabokov on 26.08.2016.
 */
define([
    "dojo/_base/declare",
    "./_AlfMenuBarItem",
    "dojo/topic",
    "./_mixinIsReadOnly",
     "dojo/_base/lang"

], function(declare, MenuBarItem, topic, _mixinIsReadOnly, lang) {

    return declare([MenuBarItem, _mixinIsReadOnly], {
        label: "Редактировать",
        iconClass: "dijitCommonIcon icon-edit-for-attach btl-icon-16",

        postMixInProperties: function () {
            this.alfSubscribe("SELECT_ROW_LINKS_GRID", lang.hitch(this, this.changeSelectedLink), true);
            this.inherited(arguments);
            this.actions = new Alfresco.module.DoclibActions();
        },

        isReadOnly: function (payload) {
        	this.setVisibly(false);
        },

        onClick: function(e){
            this.alfPublish("DATAGRID_GET_WIDGET_LINK_DATA", null, true, true);
        },

        changeSelectedLink: function(dataRow){
            this.setVisibly(dataRow.isEditable == "true");
        }
    });
});