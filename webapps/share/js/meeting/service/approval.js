
define(["dojo/_base/declare",
        "alfresco/services/BaseService",
        "dojo/_base/lang",
        "meeting/utils/base",
        "alfresco/core/CoreXhr",
        "alfresco/dialogs/AlfDialog",
        "alfresco/core/topics"
    ],
    function (declare, BaseService, lang, utilBase, CoreXhr, AlfDialog, topics) {
        return declare([BaseService, CoreXhr], {
                        

        	idStoreMeeting: "MEETING_STORE",
        	
        	negData:null,
        	
        	constructor: function (args) {
        		lang.mixin(this, args);
        		this.alfSubscribe("ADD_LEVEL", lang.hitch(this, this.addLevel), true); 
        		this.alfSubscribe("EDIT_LEVEL", lang.hitch(this, this.editLevel), true); 
        		this.alfSubscribe("EDIT_APPROVAL", lang.hitch(this, this.editCurrentNode), true);
        		
           		
           		
            },
            
           
            
            veryfy:function(){
            	var negotiatorsList = utilBase.getById("APPROVAL_NEGOTIATORS_TREE_LIST");
            	var negotiatorsListValue = negotiatorsList.getValue();
            	
            	
            	var selectTypeApproval = utilBase.getById("SELECT_TTPE_APPROVAL");
            	var duration = utilBase.getById("DURATION");
            	var typeTask = utilBase.getById("TYPE_TASK_APPROVAL");
            	var approvalName = utilBase.getById("APPROVAL_NAME");
            	var useDocSigner = utilBase.getById("USER_DOC_SIGNER");
            	
            	
            		
            	if (negotiatorsListValue == null || !duration.getValue() || !approvalName.getValue())
        		{
            		this.alfPublish("ALF_DISPLAY_NOTIFICATION", {message: "Введены не все данные!"}, true);
            		return false;            		
        		}
            	
            	var store = utilBase.getStoreById(this.idStoreMeeting);
            	if (useDocSigner.getValue() == "on")
            		useDocSigner = true;
            	else
            		useDocSigner = false;
            	
            	var levelNodeRef = "";
            	if (typeof currentNode != "undefined" && currentNode)
            	{
            		levelNodeRef = currentNode.data.id;
            	}
            	
            	this.negData = {
            			documentNodeRef: store.nodeRef,
            			negotiationLevelNodeRef: levelNodeRef,
            			negotiators : negotiatorsListValue,
            			type : selectTypeApproval.getValue(),
            			duration : duration.getValue(),
            			levelName : approvalName.getValue(),
            			useDocSigner : useDocSigner,
            			processType : typeTask.getValue()
            		}
            	
            	
            	return true;
            },

            editLevel:function(){
            	if (typeof editNode != "undefined" && editNode)
        		{
            		currentNode = editNode;
            		if (!this.veryfy())
                		return;
            		
            		if (this.negData)
        			{
            			this.sendNegotiationListData(this.negData, this.refreshApproval);
            			this.alfPublish("ADD_LEVEL_VISIBLE",{ visible:true }, true);  
        			}
                	else
            		{
                		this.alfPublish("ALF_DISPLAY_NOTIFICATION", {message: "Не удалось получить данные из формы ввода. Перезагрузите страницу и повторите попытку."}, true);
            		}
            		
            		
            		
        		}
            },
            
            addLevel:function(){
            	
            	currentNode = null;
            	
            	if (!this.veryfy())
            		return;
            	
            	if (this.negData)
            		this.sendNegotiationListData(this.negData, this.refreshApproval);
            	else
        		{
            		this.alfPublish("ALF_DISPLAY_NOTIFICATION", {message: "Не удалось получить данные из формы ввода. Перезагрузите страницу и повторите попытку."}, true);
        		}
            	
            	
            },
            
            clearForm:function(){
            	var negotiatorsList = utilBase.getById("APPROVAL_NEGOTIATORS_TREE_LIST");
            	var selectTypeApproval = utilBase.getById("SELECT_TTPE_APPROVAL");
            	var duration = utilBase.getById("DURATION");
            	var typeTask = utilBase.getById("TYPE_TASK_APPROVAL");
            	var approvalName = utilBase.getById("APPROVAL_NAME");
            	
            	negotiatorsList.setValue(null);
            	selectTypeApproval.setValue(0);
            	duration.setValue(null);
            	typeTask.setValue(0);
            	approvalName.setValue("");
            	
            },
            
            refreshApproval:function(){
            	this.alfPublish("REFRESH_APPROVAL", null, true);            	
            	this.clearForm();
            },
            
            sendNegotiationListData: function(negotiationListData, successCallback){
            	Alfresco.util.Ajax.jsonPost({
            	 		method:"POST",
            	 		url: "/share/proxy/alfresco/negotiation/set-negotiation-list-info",
            	 		dataObj: negotiationListData,
            	 		successCallback:{
            		 		fn: successCallback,
            		 		scope: this
            	 		}	 		
            	 	});	
            },
            
            
            editCurrentNode:function(){
            	
            	if (typeof currentNode != "undefined" && currentNode)
            	{
            		_this = this;
            		setNegotiationLevelDetails = function (levelObjectInfo){
            			// console.log(levelObjectInfo);
            			_this.clearForm();
            			
            			var negotiatorsList = utilBase.getById("APPROVAL_NEGOTIATORS_TREE_LIST");
                    	var selectTypeApproval = utilBase.getById("SELECT_TTPE_APPROVAL");
                    	var duration = utilBase.getById("DURATION");
                    	var typeTask = utilBase.getById("TYPE_TASK_APPROVAL");
                    	var approvalName = utilBase.getById("APPROVAL_NAME");
                    	
                    	duration.setValue(levelObjectInfo.duration);
                    	selectTypeApproval.setValue(levelObjectInfo.type);
                    	typeTask.setValue(levelObjectInfo.processType);
                    	approvalName.setValue(levelObjectInfo.levelName);                    	
            			
            			var negotiators = levelObjectInfo.negotiators;
            			for(i = 0; i < negotiators.length; i++){
            				
            				_this.alfPublish("ADD_NEGOTIATORS_TO_LIST", {
            																value:	{
		            																	nodeRef:negotiators[i].nodeRef,
		            																	name:negotiators[i].fullName
            																		}
            															}, true);            				
            			}
            			
            			_this.alfPublish("ADD_LEVEL_VISIBLE",{ visible:false }, true);  
            			
            			
            		}
            		
            		editNode = currentNode;
            		
            		Alfresco.util.Ajax.jsonGet({
            	 		method:"GET",
            	 		url: "/share/proxy/alfresco/negotiation/get-negotiation-level-info?levelNodeRef="+currentNode.data.id,	 		
            	 		successCallback:{
            		 		fn: function getNegotiatorDetails(complete){       				
                   			if(complete.serverResponse.status == 200){
                                 setNegotiationLevelDetails(complete.json);     
                   			}else{
                   				console.log("Error getting negotiation list");
                   			}
                   		},
            		 		scope: this
            	 		}
            	 	});
            	}
            	else
        		{
            		this.alfPublish("ALF_DISPLAY_NOTIFICATION", {message: "Не выбран этап согласования"}, true);
        		}
            }
            
            
            
        });
    });