/**
 * Created by nabokov on 21.11.2016.
 */
define(["dojo/_base/declare",
        "dijit/_TemplatedMixin",
        "dojo/text!./templates/ClassicWindow.html",
        "alfresco/layout/ClassicWindow",
        "alfresco/forms/LayoutMixin"],
    function(declare, _TemplatedMixin, template, ClassicWindow, LayoutMixin){
        return declare([_TemplatedMixin, ClassicWindow, LayoutMixin], {
            templateString: template,
            type: "classic", //classic - серый, primary - темно-синий, success - светло-зеленый, info - светло-синий
        });
    });