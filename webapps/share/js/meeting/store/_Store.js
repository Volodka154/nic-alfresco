/**
 * Created by nabokov on 30.11.2016.
 */
define(["dojo/_base/declare",
        "dijit/_WidgetBase",
        "alfresco/core/Core",
        "dijit/_TemplatedMixin",
        "dojo/text!./templates/_store.html"],
    function(declare, _WidgetBase, Core, _TemplatedMixin, template){
        return declare([_WidgetBase, Core, _TemplatedMixin], {
            templateString: template,
            store: {}
        });
    });