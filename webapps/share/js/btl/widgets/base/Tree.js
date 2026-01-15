
/**
 * @module btl/widgets/Tree
 * @extends dijit/_WidgetBase
 * @mixes dijit/_TemplatedMixin
 * @mixes module:alfresco/core/Core
 * @author Dave Draper
 */
define(["dojo/_base/declare",
        "dijit/_WidgetBase", 
        "dijit/_TemplatedMixin",
        "dojo/text!./templates/Tree.html",
        "alfresco/core/Core",
        "service/constants/Default",
        "alfresco/documentlibrary/_AlfDocumentListTopicMixin",
        "alfresco/services/_NavigationServiceTopicMixin",
        "dojo/dom-construct",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dijit/tree/ObjectStoreModel",
        "dojo/store/Memory",
        "dojo/store/Cache",
        "dojo/store/Observable",
        "dijit/Tree",
        "alfresco/core/CoreXhr",
        "dojo/aspect",
        "dojo/when"], 
        function(declare, _Widget, _Templated, template, AlfCore, AlfConstants, _AlfDocumentListTopicMixin, _NavigationServiceTopicMixin, domConstruct, 
                 lang, array, ObjectStoreModel, Memory, Cache, Observable, Tree, CoreXhr, aspect, when) {
   
   return declare([_Widget, _Templated, AlfCore, _AlfDocumentListTopicMixin, _NavigationServiceTopicMixin, CoreXhr], {
      
      /**
       * An array of the i18n files to use with this widget.
       * 
       * @instance
       * @type {object[]}
       * @default [{i18nFile: "./i18n/Tree.properties"}]
       */
      i18nRequirements: [{i18nFile: "./i18n/Tree.properties"}],
      
      /**
       * An array of the CSS files to use with this widget.
       * 
       * @instance
       * @type {object[]}
       * @default [{cssFile:"./css/Tree.css"}]
       */
      cssRequirements: [{cssFile:"./css/Tree.css"}],
      
      /**
       * Additional space separated CSS classes to be applied to the root DOM node of the widget.
       * 
       * @instance
       * @type {string}
       * @default ""
       */
      customCssClasses: "",
      
      /**
       * The HTML template to use for the widget.
       * @instance
       * @type {string}
       */
      templateString: template,
      
      /**
       * @instance
       * @type {string}
       * @default null
       */
      siteId: null,
       
      /**
       * This should be set when the current context is a site, typically this will be set to "documentlibrary"
       * 
       * @instance
       * @type {string}
       * @default null
       */
      containerId: null,
      
      /**
       * This should be set if "siteId" is not set.
       * 
       * @instance
       * @type {string}
       * @default null
       */
      rootNode: null,
      
      /**
       * @instance
       * @type {string}
       * @default "documentlibrary.root.label"
       */
      rootLabel: "documentlibrary.root.label",
      
      /**
       * This is the value that should be given to the root node. This node is not actually requested
       * but is simply generated on instantiation. The value assigned to it is important because it will
       * be included as the filter data when it is clicked.
       * 
       * @instance
       * @type {string}
       * @default ""
       */
      rootValue: "",
      
      /**
       * @instance
       * @type {string}
       * @default "docListTreePref"
       */
      filterPrefsName: "docListTreePref",

      /**
       * Indicates whether or not the root node of the tree should be displayed or not.
       *
       * @instance
       * @type {boolean}
       * @default true
       */
      showRoot: true,
      
      rootNode: null,
                 
      Store: null,
      
      type: "",
      
      q_params:{},
            
      postMixInProperties: function alfresco_navigation_Treet__postMixInProperties() {
          this.inherited(arguments);
          this.alfSubscribe("TREE_ADD_NEW_NODE", lang.hitch(this, this.addNewNode), true);
          this.alfSubscribe("TREE_EDIT_NODE_ATTRIBUTE", lang.hitch(this, this.editNodeAttribute), true);
          this.alfSubscribe("TREE_DELETE_NODE_FROM_STORE_SUCCESS", lang.hitch(this, this.deleteNodeFromStore),true);
       },
      
      /**
       * Creates the a dijit/Tree widget.
       * 
       * @instance
       */
      postCreate: function alfresco_navigation_Tree__postCreate() {

         // Ensure that showRoot is set (default to true)...
         this.showRoot = this.showRoot != null ? this.showRoot : true;

        var MemoryStore = new Memory({ data: [],
        		getChildren: function(object)
        		{
        			return this.query({parent: object.id});
        		}
        });
         
        this.Store = new Observable(MemoryStore);
        		 
         // Create the object store...
         // It is important that we set a root object. This should reflect correct location and label of the
         // document library location...
         this.treeModel = new ObjectStoreModel({
            root: {
               id: this.rootNode ,
               name: this.encodeHTML(this.message(this.rootLabel)),
               value: this.rootValue,
               root: true,
               path: "/"
            },
            store: this.Store,
            query: {}
         });
         
         // Create the tree and add it to our widget...
         this.tree = new Tree({
            model: this.treeModel,
            showRoot: this.showRoot,
            onClick: lang.hitch(this, "onClick"),
            onDblClick: lang.hitch(this, "onDblClick"),
            onOpen: lang.hitch(this, "onNodeExpand"),
            onClose: lang.hitch(this, "onNodeCollapse"),
            onMouseDown: lang.hitch(this, "onMouseDown"),
            getIconClass: lang.hitch(this, "getIconClass"),
         });
         this.tree.placeAt(this.domNode);
         this.tree.startup();
         
         this.getTreeNodeChildren(this.rootNode);
      },
      
     
      
      /**
       * This is the topic that is published when a node on the tree is clicked. The data applied
       * to the filter is the the value of the node clicked. By default it is expected that the
       * tree represents a location so the default id is "ALF_DOCUMENTLIST_PATH_CHANGED". 
       * 
       * @instance
       * @type {string}
       * @default "ALF_DOCUMENTLIST_PATH_CHANGED"
       */
      onClickTopic: "ALF_DOCUMENTLIST_PATH_CHANGED",

      publishTopic: "",

      /**
       * @instance
       * @param {object} item The store item represented by the clicked node
       * @param {object} node The node on the tree that was clicked
       * @param {object} evt The click event
       */
      onClick: function alfresco_navigation_Tree__onClick(item, node, evt) {
    	  
         this.alfLog("log", "Tree Node clicked", item, node, evt);

         this.alfPublish(this.onClickTopic, {
            path: 		item.path,
            id: 		item.id,
            nodeRef: 	item.id,
            name: 		item.name,
            value: 		item.value,
            hasChildren:item.hasChildren,
            root:		(!!item.root) ? item.root : false,
            treeType:	this.type
         });
         this.alfPublish(this.publishTopic, {
                     path: 		item.path,
                     type: 		(item.path == "/" ? "root" : (item.id == "all" ? item.id : item.id == "" ? "free" : ""))
                  });
         
      },
      
      onDblClick: function alfresco_navigation_Tree__onDblClick(item, node, evt) {
    	      	  
    	  if (!item.root && item.id)
    		  this.getInfo();   	      	                       
       },
      
      
      
      /**
       * @instance
       * @param {object} item The store item represented by the opened node
       * @param {object} node The node on the tree that was opened
       */
      onNodeExpand: function alfresco_navigation_Tree__onNodeExpand(item, node) {
    	  if(item.id && item.id != this.rootNode)
    		  this.getTreeNodeChildren(item.id);
    	  
         if (node != null && node._loadDeferred != null)
         {
            this.alfLog("log", "Wait for node expand before rezize", node._loadDeferred);
            node._loadDeferred.then(lang.hitch(this, "requestSidebarResize"));
         }
      },
      
      /**
       * @instance
       * @param {object} item The store item represented by the collapsed node
       * @param {object} node The node on the tree that was collapsed
       */
      onNodeCollapse: function alfresco_navigation_Tree__onNodeExpand(item, node) {
         if (node != null && node._collapseDeferred != null)
         {
            this.alfLog("log", "Wait for node collapse before rezize", node._collapseDeferred);
            node._loadDeferred.then(lang.hitch(this, "requestSidebarResize"));
         }
      },
      
      /**
       * Publishes a request to resize the side bar (if the tree is not in a side bar then this will
       * have no effect).
       * 
       * @instance
       */
      requestSidebarResize: function alfresco_navigation_Tree__requestSidebarResize() {
         this.alfPublish("ALF_RESIZE_SIDEBAR", {});
      },
      
      getTreeNodeChildren: function alfresco_navigation_Tree__getTreeNodeChildren(nodeRef){
    	  var p_query ;
    	  
    	  if(this.q_params !== null){
				this.q_params["notActual"] = false;
				p_query = '&params=' + encodeURI(encodeURIComponent(JSON.stringify(this.q_params)));
			}
          var config = {
                  url: AlfConstants.PROXY_URI + this.Url,
                  query: "nodeRef=" + nodeRef + "&type=" + this.type + p_query,
                  method: "GET",
                  nodeRef: nodeRef,
                  successCallback: this.loadBaseTree,
                  callbackScope: this
               };
          this.serviceXhr(config);
      },
      
      loadBaseTree: function alfresco_navigation_Tree__loadBaseTree(response, originalRequestConfig){
    	  this.alfLog("log", "Tree DATA", response.items);

    	  document.getElementById(this.tree.id).style.height = "600px";
    	  
    	  //Устанавливаем root ветку дерева открытой по умолчанию при загрузке страницы
          if(originalRequestConfig.nodeRef.toString() === this.rootNode.toString()){
              var item = this.tree.model.root;
              this.tree.set('path',['/']);
              this.tree.set("selectedItem", item);
              this.tree.onClick(item);
          }

    	  array.forEach(response.items, lang.hitch(this,"addTreeElements"));
      },
      
      addTreeElements: function alfresco_navigation_Tree__addTreeElements(parent, child, index){
          try{
    	      this.Store.add({id: index[child].nodeRef, name: index[child].name, parent: index[child].parentNodeRef, hasChildren: index[child].hasChildren});
          }catch(e){
              this.alfLog("log", "alfresco_navigation_Tree__addTreeElements error", e);
          }
    	  this.alfLog("log", "alfresco_navigation_Tree__addTreeElements", this.Store);
      },
      
      addNewNode: function alfresco_navigation_Tree__addNewNode(item) {   	  
    	  this.alfLog("log", "Tree loadDataList do", item);
    	  try{
    	      this.Store.add({id: item.id, name: item.name, parent: item.parent, hasChildren: false});
          }catch(e){
              this.alfLog("log", "Tree loadDataList error", e);
          }
      },
      
      deleteNodeFromStore: function alfresco_navigation_Tree__deleteNodeFromStore(payload) {
    	  var selectedObject = this.tree.get("selectedItems")[0];
    	  this.Store.remove(selectedObject.id);
      },
      
      editNodeAttribute: function alfresco_navigation_Tree__editNodeAttribute(data) {
    	  var selectedObject = this.tree.get("selectedItems")[0];
    	  var name = data.attribute.name;
    	  var value = data.attribute.value;
    	  selectedObject[name] = value;
    	  this.Store.put(selectedObject);
      },

      getIconClass: function(/*dojo.store.Item*/ item, /*Boolean*/ opened){
          return ((item.root || item.hasChildren) ? (opened ? "dijitFolderOpened" : "dijitFolderClosed") : "dijitLeaf");
      },

      onMouseDown: function ( e ) {
      },
   });
});