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
        "dojo/text!./templates/tableView.html"],
    function (declare, Core, lang, CoreXhr, utilBase, Memory, Cache, Observable, base, template, templateHTML) {
        return declare([base, template, Core, CoreXhr], {
        	
        	htmlId:"tableView",
        	
        	cssRequirements: [{cssFile:"./css/tableView.css"}],
        	
        	templateString: templateHTML,                       
            
            thead:null,
            tbody:null,
        
            headData:[],
            
            getTableHead:function()
            {
            	var head = "";
	           	 for(var i = 0; i < this.headData.length; i++)
	       		 {
	           		 var headItem = this.headData[i];        
	           		 var style =  (headItem.style)?"style='" + headItem.style + "'":"";
	           		 var label = (headItem.label)?headItem.label:"";
	           		 
	           		 head += "<th " + style + ">" + label + "</th>";            		 
	       		 }
	           	 return head;
            },
            
            setTableBody:function(data){
            	this.tbody.innerHTML = data;
            },
            
            load:function(){           	      	             	
            	 this.thead = this.domNode.getElementsByTagName("thead")[0];
            	 this.thead.innerHTML = this.getTableHead();
            	 
            	 this.tbody = this.domNode.getElementsByTagName("tbody")[0];
            },
            
            
            postCreate: function() {
            	
            	this.load();
            	this.inherited(arguments);
             },
             
            
             
             
            
        });
    });