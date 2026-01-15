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
        "dojo/text!./templates/treeSelect.html"],
    function (declare, Core, lang, CoreXhr, utilBase, Memory, Cache, Observable, base, template, templateHTML) {
        return declare([base, template, Core, CoreXhr], {
        	
        	templateString: templateHTML,
           
        	style:"border: 1px solid #ccc; min-height: 54px; min-width: 500px;",
        	
        	
        	
        	
            
            postMixInProperties: function () {
            	this.alfSubscribe("ADD_NEGOTIATORS_TO_LIST", lang.hitch(this, this.addNegotiatorToList), true);            	
            	this.alfSubscribe("UP_NEGOTIATOR", lang.hitch(this, this.upNegotiator), true); 
            	this.alfSubscribe("DOWN_NEGOTIATOR", lang.hitch(this, this.downNegotiator), true); 
            	this.alfSubscribe("DELETE_NEGOTIATOR", lang.hitch(this, this.deleteNegotiator), true); 
            	
            },
            
        
            load:function(){           	            	            	
            	 _negotiatorsTree = new YAHOO.widget.TreeView(this.domNode);       	 
            	 _negotiatorsTree.subscribe("focusChanged", this.onNegotiatorFocusChanged.bind(this));
            	 
            	 this.negotiatorsTree = _negotiatorsTree;
            	 this.negotiatorsTree.render();          	 
            	            	 
            },
            
            getValue:function(){  
        		
        		if (this.negotiatorsTree.getNodeCount() == 0)
        			return null;
        		
        		var nodes = [];
        		var items = this.negotiatorsTree.getNodesBy(function(n){return true});
        		for(i=0; i < items.length; i++)
    			{
        			var item = items[i];
        			if (item.data && item.data.id)
    				{
        				nodes.push(item.data.id);
    				}
    			}
        		
        		return nodes;
        	},
        	
        	setValue:function(payload){
        		var items = this.negotiatorsTree.getNodesBy(function(n){return true});
        		if (items)
    			{
	        		for(i = items.length-1; i >= 0; i--)
	    			{
	        			var item = items[i];
	        			this.negotiatorsTree.removeNode(item);
	    			}
    			}
                // if (payload != null)
    			// {
        			// console.log("setValueNegotiatorsTree");
    			// }
        			
        		this.negotiatorsTree.render();
        		
        	},
            
            addNegotiatorToList: function(payload){
            	
            	if (payload.value.nodeRef && payload.value.name)
        		{        	
	            	var node = this.negotiatorsTree.getNodeByProperty('id', payload.value.nodeRef);
	            	if (node == null){
	            		var root = this.negotiatorsTree.getRoot();	
	            		var tmpNode = new YAHOO.widget.TextNode({
	            	        label: payload.value.name,
	            	        id: payload.value.nodeRef,
	            	        expanded: false
	            	    }, root);
	            		this.negotiatorsTree.render();
	                }
	            	
	            	this.alfPublish("UPDATE_NEGOTIATION_CONTROL", {name:"", nodeRef:""}, true);
	            	
        		}
            	
            	
            	
                
            },
            
            onNegotiatorFocusChanged : function(e){
            	if (e.newNode != null){
            		currentNegotiator = e.newNode;
            		this.alfPublish("NEGOTIATOR_CONTROL_NAVIGATE_DISABLE", { disabled:false , all : true}, true);		
            	}
    			
    		},
    		
    		deleteNegotiator:function(){
	    		if (currentNegotiator != null){
	    			this.negotiatorsTree.removeNode(currentNegotiator);
	    			currentNegotiator = null;
	    			this.negotiatorsTree.render();
	    			this.alfPublish("NEGOTIATOR_CONTROL_NAVIGATE_DISABLE", { disabled:true , all : true}, true);
	    		}
    		},
    		
    		upNegotiator:function(){
    			if (currentNegotiator)
				{
		    		var ind = currentNegotiator.index;
		    		var destNode = this.negotiatorsTree.getNodeByIndex(ind-1);
		    		if (destNode != null){
		    			this.replaceNodeData(currentNegotiator, destNode);
		    			currentNegotiator = destNode;
		    		}
		    		this.negotiatorsTree.render();
				}
    		},
    		
    		downNegotiator:function(){
    			if (currentNegotiator)
				{
    				var ind = currentNegotiator.index;
    				var destNode = this.negotiatorsTree.getNodeByIndex(ind+1);
    				if (destNode != null){
    					this.replaceNodeData(currentNegotiator, destNode);
    					currentNegotiator = destNode;
    				}		
    				this.negotiatorsTree.render();
				}
    		},
    		
    		replaceNodeData : function (sourceNode, destNode){
    			var tmplabel = sourceNode.label;
    			var tmpId = sourceNode.data.id;
    			
    			sourceNode.label = destNode.label;	
    			sourceNode.data.id = destNode.data.id;
    			destNode.label = tmplabel;
    			destNode.data.id = tmpId;
    		},
        	
           
            postCreate: function() {
            	this.load();
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