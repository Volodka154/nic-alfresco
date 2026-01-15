/**
 * Created by nabokov on 23.11.2016.
 */
define(["dojo/_base/declare",
        "alfresco/core/Core",
        "dojo/_base/lang",
        "alfresco/core/CoreXhr",
        "meeting/utils/base",
        "dojo/store/Memory",
        "dojo/store/Cache",
        "dojo/store/Observable",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dojo/text!./templates/tree.html"],
    function (declare, Core, lang, CoreXhr, utilBase, Memory, Cache, Observable, base, template, templateHTML) {
        return declare([base, template, Core, CoreXhr], {
        	
        	templateString: templateHTML,
           
        	style:"border: 1px solid #ccc; min-height: 54px;width: 273px;",
        	
        	isLoad:false,
        	
        	getValue:function(){        		
        		return null;
        	},
            
        	cssRequirements: [{cssFile:"./css/tree.css"}],
        	
            postMixInProperties: function () {
            	
            	
            	var store = utilBase.getStoreById("MEETING_STORE");	                
                handleAlfSubscribe = store.handleAlfSubscribe;  
                
                
                handleAlfSubscribe.push(this.alfSubscribe("MOVE_UP_APPROVAL", lang.hitch(this, this.moveUp), true)); 
                handleAlfSubscribe.push(this.alfSubscribe("MOVE_DOWN_APPROVAL", lang.hitch(this, this.moveDown), true));
                handleAlfSubscribe.push(this.alfSubscribe("DELETE_APPROVAL", lang.hitch(this, this.deleteCurrentNode), true));            	
                handleAlfSubscribe.push(this.alfSubscribe("REFRESH_APPROVAL", lang.hitch(this, this.refreshNegotiationList), true));     
            	
            },
            
            
        
            load:function(){            	            	
            	
            	if (this.isLoad)
            		return;
            	
            	loadLevelNegotiators = function(levelNode, negotiators){
            		for (var i = 0; i < negotiators.length; i++) {
            	            var negotiator = negotiators[i];
            	            var tmpNode = new YAHOO.widget.TextNode({
            	                id: negotiator.nodeRef,
            	                label: negotiator.fullName,
            	                labelStyle: "icon-emp",
            	                expanded: false,
            	                isLeaf : true
            	            }, levelNode);
            	        }
            	        _listTree.render();
            	}
        		
        		loadDataForNode = function(node, onCompleteCallback) {
            	    if (node.depth == 0){
            	    	levelNodeRef = node.data.id;
            	    	Alfresco.util.Ajax.jsonGet({
            	    	url: Alfresco.constants.PROXY_URI + "negotiation/get-negotiators-for-level?negotiationLevelNodeRef="+ levelNodeRef,
            	       	successCallback:{
            	       		fn: function getNegotiation(complete){       				
            	       			if(complete.serverResponse.status == 200){
            	                     loadLevelNegotiators(node, complete.json.negotiators);     
            	       			}else{
            	       				console.log("Error getting negotiation list");
            	       			}
            	       		},
            	       		scope: this
            	       		}
            	       	});
            	    }            	 
            	    onCompleteCallback();
            	}
        		
        		
            	
            	 _listTree = new YAHOO.widget.TreeView(this.domNode.getElementsByTagName("div")[0]);
            	 _listTree.setDynamicLoad(loadDataForNode);            	 
            	 _listTree.subscribe("focusChanged", this.onNegotiationListFocusChanged.bind(this));
            	 
            	 this.listTree = _listTree;
            	 this.refreshNegotiationList();
            	 
            	 this.isLoad = true;
            	            	 
            },
            
            
            
            
            refreshNegotiationList:function(){
            	
            	var store = utilBase.getStoreById("MEETING_STORE");
            	
            	this.getNegotiationList(store.nodeRef)
            },
            
            moveUp: function(){
            	if (currentNode){
            		var nodeRef = currentNode.data.id;
            		this.changePosition(nodeRef, -1, this.refreshNegotiationList);
            	}
            },

            moveDown: function(){
            	if (currentNode){
            		var nodeRef = currentNode.data.id;
            		this.changePosition(nodeRef, 1, this.refreshNegotiationList);
            	}
            },
            
            deleteCurrentNode: function(){
            	if (currentNode) {
            		  var nodeRef = currentNode.data.id;
            		  this.deleteNode(nodeRef, this.refreshNegotiationList);
            	}
            },
            
            
            
            deleteNode: function(nodeRef, callback){	
            	var data = {"type": "cm:folder"};
            	 	Alfresco.util.Ajax.jsonPost({
            	 		method:"POST",
            	 		url: "/share/proxy/alfresco/slingshot/doclib/action/files?alf_method=delete",
            	 		dataObj: {nodeRefs:[nodeRef]},
            	 		successCallback:{
            		 		fn: callback,
            		 		scope: this
            	 		}
            	 	});
            },
            
            changePosition: function(nodeRef, increment, callback){
            	Alfresco.util.Ajax.jsonGet({
            	 		method:"GET",
            	 		url: "/share/proxy/alfresco/negotiation/change-position-in-negotiation-list?nodeRef="+nodeRef+"&increment="+increment,	 		
            	 		successCallback:{
            		 		fn: callback,
            		 		scope: this
            	 		}
            	 	});
            },
            
            onNegotiationListFocusChanged : function(e){
    			
    			if (e.newNode != null){
    				currentNode = e.newNode;
    				this.alfPublish("DISABLE_NAVIGATE_BUTTON", { disabled:false , all : true}, true);
    				if (currentNode.depth > 0){
    					this.alfPublish("DISABLE_NAVIGATE_BUTTON", { disabled:true, id:"editNavigateButton" }, true);
    				}    				
    			}
    			
    		},
        	
        	getNegotiationList : function(documentNodeRef){   
        		
        		_listTree = this.listTree;
        		
        		loadLevelsInfo = function(levels){
            		var root = _listTree.getRoot();
            		for (var i = 0; i<levels.length;i++){
            			var level = levels[i];
            			var postfix = ' (Параллельно)';
            			if (level.levelType == 1){
            				postfix = ' (Последовательно)';
            			}
						var label = level.levelName+postfix;
						if (level.negotiationType == 0){
							if (label.indexOf("Согласование") == -1){
								label = "Согласование. " + label;
							}
						} else if (level.negotiationType == 1){
							if (label.indexOf("Подписание") == -1){
								label = "Подписание. " + label;
							}
						}
						var tmpNode = new YAHOO.widget.TextNode({
							id: level.nodeRef,
							label: label,
							expanded: true
						}, root);

            	    } 
            	    _listTree.render();
            	}
        		
        		
        		
        		_listTree.removeChildren(_listTree.getRoot());	 
        		Alfresco.util.Ajax.jsonGet({
        	    	url: Alfresco.constants.PROXY_URI + "negotiation/get-negotiation-list?documentNodeRef="+ documentNodeRef,
        	       	successCallback:{
        	       		fn: function getNegotiation(complete){       				
        	       			if(complete.serverResponse.status == 200){
        	                     loadLevelsInfo(complete.json.levels);     
        	       			}else{
        	       				console.log("Error getting negotiation list");
        	       			}
        	       		},
        	       		scope: this
        	       		}
        	       	});
        		
        	},
           
        	         
            
            postCreate: function() {
            	this.load();
            	this.inherited(arguments);
             },
             
             validate:function()
             {
             	if (this.getValue() == null)
             	{
             		this.alfPublish("ALF_INVALID_CONTROL", {
                         name: this.name,
                         fieldId: this.fieldId
                     });

                     this.showValidationFailure();
             	}
             	else
             	{            		                    
                     this.alfPublish("ALF_VALID_CONTROL", {
                         name: this.name,
                         fieldId: this.fieldId
                     });
                     this.hideValidationFailure();
             	}
             }
             
             
             
            
        });
    });