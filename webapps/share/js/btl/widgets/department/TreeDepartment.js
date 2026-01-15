define(["dojo/_base/declare",
        "btl/widgets/base/Tree",
        "alfresco/documentlibrary/_AlfDocumentListTopicMixin",
        "dojo/_base/lang",
        "alfresco/core/CoreXhr",
        "dojo/store/Observable",
        "service/constants/Default",
        "btl/service/FormContactor"], 
        function(declare, Tree, _AlfDocumentListTopicMixin, lang, CoreXhr, Observable, AlfConstants, FormContactor) {
   
   return declare([Tree, _AlfDocumentListTopicMixin, CoreXhr], {
	   
	  i18nRequirements: [{i18nFile: "./i18n/Contactor.properties"}],
      onClickTopic: "DATAGRID_LOAD_DATA",
      rootLabel: "departmentTreeRootLabel.label",
      Url: "/tree/departmentTree",
      query: "",
      publishTopic: "TREE_DEPART_CLICK",
      type: "btl-depart:department-folder",
      
      getInfoUrl: "search/department",
      
      postMixInProperties: function alfresco__TreeDepartment__postMixInProperties() {
          this.inherited(arguments);
          this.alfSubscribe("TREE_GET_INFO_DEPARTAMENT", lang.hitch(this, this.getInfo), true);
          this.alfSubscribe("TREE_DELETE_DEPARTAMENT", lang.hitch(this, this.deleteNode), true);
          this.alfSubscribe("TREE_CREATE_DEPARTAMENT", lang.hitch(this, this.createDepartment), true);
       },

       
      getInfo: function alfresco_TreeDepartment__getInfo() {
    	  var selectedObject = this.tree.get("selectedItems")[0];
    	  
    	  this.serviceXhr({
    		  url: "/share/proxy/alfresco/"+ this.getInfoUrl +"?nodeRef=" + selectedObject.id ,
      	    method: "GET",

      	    successCallback: this.edit,
      	    callbackScope: this
      	  });
      },
      
      edit: function alfresco_TreeDepartment__edit(response, originalRequestConfig) {
    	  this.alfLog("log", "alfresco_TreeDepartment__edit response", response);
    	  this.alfLog("log", "alfresco_TreeDepartment__edit originalRequestConfig", originalRequestConfig);
    	  
      	  var item = {};
      	  item.config = {};
      	  item.data = response;
      	  item.config.dialogTitle = "formEditDepartment.title.label";
      	  item.config.dialogConfirmationButtonTitle = "edit.title";
      	  item.config.dialogCancellationButtonTitle = "cancel.title";
      	  item.config.formSubmissionTopic = "BTL_EDIT_DEPARTAMENT";

    	  this.alfPublish("BTL_CREATE_FORM_DEPARTAMENT", item, true);
      },
    
      deleteNode: function alfresco_TreeDepartment__deleteNode() {
    	  var selectedObject = this.tree.get("selectedItems")[0];
    	  var payload = {};

    	  payload.requiresConfirmation = true;
    	  payload.confirmationTitle = "deleteDepartment.title.label";
    	  payload.confirmationPrompt = "Вы действительно хотите удалить: " + selectedObject.name + "?";
    	  payload.nodeRef = selectedObject.id;
    	  payload.responseTopic = "BTL_SING_REMOVE_DEPARTAMENT",   	   	  
    	  
    	  this.alfPublish("BTL_MSG_DELETE_DIALOG", payload, true);  
      },
      
      createDepartment: function alfresco_TreeDepartment__deleteNode(payload) {
    	  var selectedObject = this.tree.get("selectedItems")[0];
    	  payload.rootNodeRef = selectedObject.id;
    	  this.alfPublish("BTL_CREATE_FORM_DEPARTAMENT", payload, true);
      }
   });
});