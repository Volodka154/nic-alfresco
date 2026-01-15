/**
 * Created by nabokov on 13.12.2016.
 */
define([
    "dojo/_base/declare",
    "dojo/topic",
    "dojo/_base/lang"
], function (declare, topic, lang) {

    return declare(null, {
        isVisible: true,

        selectedRowNode: {},
        postCreate: function () {
            topic.subscribe("SELECT_ROW_LINKS_GRID", this.selectRowEvent.bind(this));
            this.alfSubscribe(this.pubSubScope + "META_SELECT_DOCUMENT", lang.hitch(this, this.metaSelectDocument), true);
            this.inherited(arguments);
            if(!this.isVisible){
                this.setVisibly(false);
            }
        },
        selectRowEvent: function (data) {
            this.selectedRowNode = lang.clone(data);
        },

        metaSelectDocument: function (payload) {

        },

        setVisibly: function (isVisibly) {
            if (isVisibly) {
                this.domNode.style.display = "inline-block";
            } else {
                this.domNode.style.display = "none";
            }
        },
    });
});