define(["dojo/_base/declare",
        "btl/widgets/base/Tree",
        "alfresco/documentlibrary/_AlfDocumentListTopicMixin",
        "dojo/_base/lang",
        "alfresco/core/CoreXhr",
        "dojo/store/Observable",
        "service/constants/Default",
        "btl/service/FormContactor",
        "dijit/registry"],
        function(declare, Tree, _AlfDocumentListTopicMixin, lang, CoreXhr, Observable, AlfConstants, FormContactor, registry) {

      getSelectedNode = function (){
          return this.tree.get("selectedItems")[0];
      };

    var getHoverTreeNode = function( event, focus ) {
        var curElement = document.elementFromPoint(event.clientX, event.clientY);
        if (curElement == null)
            return null;

        var curHoverNode = focus ? curElement.closest('.dijitTreeNodeFocused') : curElement.closest('.dijitTreeNodeHover');
        if (curHoverNode == null || !curHoverNode.hasAttributes)
            return null;

        var nodeId = curHoverNode.getAttribute("id");
        if (nodeId != null)
            return registry.byId(nodeId);

        return null;
    };

    var getSelectedTreeNode = function(){
       var tree = document.getElementById("ID_TREE_GROUP");
       var selectedNode = tree.getElementsByClassName('dijitTreeRowSelected');
       if (selectedNode.length == 0)
           return null;
       var nodeId = selectedNode[0].parentNode.getAttribute("id");
       if (nodeId == null)
           return null;
       return registry.byId(nodeId);
    }

    var transferGroup = function( _this, groupId, parentGroupId ){
        var success = false;

        var sendData = new Object();
        sendData["nodeRefs"] = [ groupId ];

        var group = {};
        group.nodeRef = groupId;

        _this.alfLog("log", "btl_TreeGroup__transferGroup", group);
        _this.serviceXhr({
            url: "/share/proxy/alfresco/slingshot/doclib/action/move-to/node/" + parentGroupId.replace("://", "/"),
            method: "POST",
            sync: true,
            data: sendData,
            successCallback: success = true,
            callbackScope: this
          });

        //if (success)
        //    _this.alfPublish("BTL_EDIT_GROUP", department); // TODO: обновление дерева

        return success;
    }

   return declare([Tree, _AlfDocumentListTopicMixin, CoreXhr], {
	  i18nRequirements: [{i18nFile: "./i18n/Contactor.properties"}], 
      
      onClickTopic: "DATAGRID_LOAD_DATA",
      
      rootLabel: "groupTreeRootLabel.label",
      
      Url: "/tree/groupTree",
      
      query: "",
      publishTopic: "TREE_GROUP_CLICK",
      type: "btl-group:group-folder",//"cm:group",
      
      getInfoUrl: "search/group",
      // http://127.0.0.1:8080/share/proxy/alfresco/api/groups?sortBy=displayName&zone=APP.DEFAULT&maxItems=50&skipCount=0
      // http://127.0.0.1:8080/share/proxy/alfresco//api/groups/USER_GROUPS/children?sortBy=displayName&maxItems=50&skipCount=0
      
      postMixInProperties: function alfresco__TreeGroup__postMixInProperties() {
          this.inherited(arguments);
          this.alfSubscribe("TREE_GET_INFO_GROUP", lang.hitch(this, this.getInfo), true);
          this.alfSubscribe("TREE_DELETE_GROUP", lang.hitch(this, this.deleteNode), true);
          this.alfSubscribe("TREE_CREATE_GROUP", lang.hitch(this, this.createGroup), true);
       },

       
      getInfo: function alfresco_TreeGroup__getInfo() {
    	  var selectedObject = this.tree.get("selectedItems")[0];
    	  
    	  this.serviceXhr({
    		  url: "/share/proxy/alfresco/"+ this.getInfoUrl +"?nodeRef=" + selectedObject.id ,
      	    method: "GET",

      	    successCallback: this.edit,
      	    callbackScope: this
      	  });
      },

      edit: function alfresco_TreeGroup__edit(response, originalRequestConfig) {
    	  this.alfLog("log", "alfresco_TreeGroup__edit response", response);
    	  this.alfLog("log", "alfresco_TreeGroup__edit originalRequestConfig", originalRequestConfig);
    	  
      	  var item = {};
      	  item.config = {};
      	  item.data = response;
      	  item.config.dialogTitle = "formEditGroup.title.label";
      	  item.config.dialogConfirmationButtonTitle = "edit.title";
      	  item.config.dialogCancellationButtonTitle = "cancel.title";
      	  item.config.formSubmissionTopic = "BTL_EDIT_GROUP";

    	  this.alfPublish("BTL_CREATE_FORM_GROUP", item, true);
      },
    
      deleteNode: function alfresco_TreeGroup__deleteNode() {
    	  var selectedObject = this.tree.get("selectedItems")[0];
    	  var payload = {};

    	  payload.requiresConfirmation = true;
    	  payload.confirmationTitle = "deleteGroup.title.label";
    	  payload.confirmationPrompt = "Вы действительно хотите удалить: " + selectedObject.name + "?";
    	  payload.nodeRef = selectedObject.id;
    	  payload.responseTopic = "BTL_SING_REMOVE_GROUP",
    	  
    	  this.alfPublish("BTL_MSG_DELETE_DIALOG", payload, true);  
      },
      
      createGroup: function alfresco_TreeGroup__createGroup(payload) {
    	  var selectedObject = this.tree.get("selectedItems")[0];
    	  payload.rootNodeRef = selectedObject.id;
    	  this.alfPublish("BTL_CREATE_FORM_GROUP", payload, true);
    	  // проверить http://127.0.0.1:8080/share/proxy/alfresco/api/groups/test_group1/parents?level=ALL&maxSize=10
    	  // создать http://127.0.0.1:8080/share/proxy/alfresco/api/groups/USER_GROUPS/children/GROUP_test_group1
    	  // добавить параметры http://127.0.0.1:8080/share/proxy/alfresco/api/groups/test_group1    displayName : "Тестовая группа 1"
      },

      getIconClass: function(/*dojo.store.Item*/ item, /*Boolean*/ opened){
          if (!item.root && !item.hasChildren)
              return "dijitIconUsers";
          else
              return opened ? "dijitFolderOpened" : "dijitFolderClosed";
      },

      onMouseDown: function alfresco_TreeGroup__onMouseDown( e ) {
          var _this = this;
    	  var downX = event.pageX;
          var downY = event.pageY;
          var dragIcon = null;
          var hoverNode = getHoverTreeNode(event, true);;
          var selectedNode = getSelectedTreeNode(e);

          if (selectedNode == null || selectedNode != hoverNode)
              return;

          var isRoot = selectedNode.domNode.className.indexOf("dijitTreeIsRoot") != -1;
          var isGroup = selectedNode.item.id != "";
          if (isRoot || !isGroup)
              return;

          var groupId = selectedNode.item.id;
          e.preventDefault();

          window.onmousemove = function( event ) {
              if (event.buttons != 1){
                  if (dragIcon != null)
                      dragIcon.hidden = true;

                  window.onmouseup = null;
                  window.onmousemove = null;

                  return;
              }

              var moveX = event.pageX - downX;
              var moveY = event.pageY - downY;
              if ( Math.abs(moveX) < 3 && Math.abs(moveY) < 3 )
                    return; // ничего не делать, мышь не передвинулась достаточно далеко

              var shiftX = 0;
              var shiftY = 0;

              var iconSource = "/share/res/js/btl/widgets/base/css/images/";
              hoverNode = getHoverTreeNode(event, false);
              iconSource += (hoverNode != null && hoverNode.item.id != "" && hoverNode != selectedNode) ? "folder-closed-yellow-16.png" : "folder-closed-16.png";

              if (dragIcon == null){
                  dragIcon = new Image();
                  dragIcon.src = iconSource;
                  if (dragIcon.parentNode != document.body)
                      document.body.appendChild(dragIcon);
                  dragIcon.style.zIndex = 9999; // чтобы элемент был над другими
                  dragIcon.style.position = 'absolute';

                  if (!dragIcon)
                        return;

                  shiftX = downX;
                  shiftY = downY;
              } else
                  dragIcon.src = iconSource;

              dragIcon.style.left = event.pageX - shiftX + 10 + 'px';
              dragIcon.style.top = event.pageY - shiftY + 10 + 'px';

              return false;
          }

          window.onmouseup = function(event) {
              window.onmouseup = null;
              window.onmousemove = null;

              if (dragIcon != null)
                  dragIcon.hidden = true;

              if (hoverNode != null && hoverNode.item.id != "" && hoverNode != selectedNode)
                  transferGroup(_this, selectedNode.item.id, hoverNode.item.id);
          };
      },
   });
});