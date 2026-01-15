define([
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_Container",
    "dijit/_TemplatedMixin",
    "dojo/dom-construct",
    "dojo/text!./templates/MenuBar.html",
], function(declare, _WidgetBase, _Container, _TemplatedMixin, domConstruct, template) {

    return declare([_WidgetBase, _TemplatedMixin, _Container], {
        templateString: template,

        postCreate: function(){
            var domNode = this.domNode;
            this.addButtons();

        },
        addButtons: function () {

        },
    });

});