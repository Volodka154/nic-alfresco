/**
 * Created by nabokov on 23.11.2016.
 */
define(["dojo/_base/declare",
        "dijit/layout/AccordionPane",
        "alfresco/core/Core",
        "alfresco/core/CoreWidgetProcessing",
        "dojo/_base/array",
    ],
    function(declare, AccordionPane, AlfCore, CoreWidgetProcessing, array) {

        return declare([AccordionPane,  AlfCore, CoreWidgetProcessing], {
            onShowTopic: null,
            postCreate: function () {
                if (this.widgets)
                {
                    this.processWidgets(this.widgets, this.containerNode);
                }
            },
            getChildren: function(){
                var Children = this.inherited(arguments);
                Children = Children.filter(function (item) {
                    return (item.srcNodeRef)? true : false ;
                });
                // Overrides _Container.getChildren() to return content panes rather than internal AccordionInnerContainer panes
                return array.map(Children, function(child){
                    return child.declaredClass == "dijit.layout._AccordionInnerContainer" ? child.contentWidget : child;
                }, this);
            },
            _onShow: function () {
                this.inherited(arguments);
                if(this.onShowTopic) {
                    this.alfPublish(this.onShowTopic, {}, true);
                }
            },
        });
    });