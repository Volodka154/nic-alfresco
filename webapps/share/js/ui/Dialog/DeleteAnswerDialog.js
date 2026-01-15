/**
 * Created by nabokov on 31.08.2016.
 */
define([
    "dojo/_base/declare",
    "dijit/Dialog",
    "dojo/text!./templates/DeleteAnswerDialog.html"
], function(declare, Dialog, template) {

    return declare([Dialog], {
        templateString: template,
        title: "",
        context: "",
        callback: null,
        style: "width: 400px",

        postCreate: function () {
            this.inherited(arguments);
            this.domNode.classList.add("alfresco-dialog-AlfDialog");
            this.set('content', this.context);
        },

        onSubmit: function () {
            this.callback();
        },

        onCancel: function () {
            this.hide();
        }
    });

});