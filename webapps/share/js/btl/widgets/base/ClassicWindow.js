define(["dojo/_base/declare",
        "dijit/_WidgetBase", 
        "dijit/_TemplatedMixin",
        "alfresco/forms/LayoutMixin",
        "dojo/text!./templates/ClassicWindow.html",
        "alfresco/core/Core",
        "alfresco/core/CoreWidgetProcessing",
        "dojo/dom-class",
        "dojo/dom-construct"], 
        function(declare, _WidgetBase, _TemplatedMixin, LayoutMixin, template, AlfCore, CoreWidgetProcessing, domClass, domConstruct) {
   
   return declare([_WidgetBase, _TemplatedMixin, AlfCore, LayoutMixin, CoreWidgetProcessing], {
      
      /**
       * An array of the CSS files to use with this widget.
       * 
       * @instance
       * @type {object[]}
       * @default [{cssFile:"./css/ClassicWindow"}]
       */
      cssRequirements: [{cssFile:"./css/ClassicWindow.css"}],
      
      /**
       * The HTML template to use for the widget.
       * @instance
       * @type {string}
       */
      templateString: template,
      
      /**
       * The title to be rendered
       * 
       * @instance
       * @type {string}
       * @default
       */
      title: "",

      /**
       * Hide the title?
       * 
       * @instance
       * @type {boolean}
       * @default
       * @since 1.0.39
       */
      hideTitle: false,

      /**
       * Ensures that the title is converted from key to localised message.
       * 
       * @instance
       */
      postMixInProperties: function alfresco_layout_ClassicWindow__postMixInProperties() {
         if (this.title !== "")
         {
            this.title = this.message(this.title);
         }
      },
      
      /**
       * Processes the widgets into the content node.
       * 
       * @instance
       */
      postCreate: function alfresco_layout_ClassicWindow__postCreate() {
         if (this.widgets)
         {
            this.processWidgets(this.widgets, this.contentNode);
         }
         if (this.hideTitle)
         {
            domConstruct.destroy(this.titleBarNode);
         }
      }
   });
});