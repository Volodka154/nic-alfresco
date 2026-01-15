/**
 * Created by nabokov on 24.11.2016.
 */
define(["dojo/_base/declare",
    "dijit/form/Button",
    "dijit/_TemplatedMixin",
    "dojo/text!./templates/ChoiceButton.html",
    "alfresco/core/Core",
    "alfresco/core/CoreWidgetProcessing",

], function (declare, Button, _TemplatedMixin, template, Core, CoreWidgetProcessing) {

    return declare([Button, Core, CoreWidgetProcessing], {
        templateString: template,
        style: "margin-top: 26px; margin-left: -8px;",
        iconClass: 'dijitArrowButtonInner',
        showLabel: false,
    });
});