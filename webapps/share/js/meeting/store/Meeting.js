/**
 * Created by nabokov on 30.11.2016.
 */
define(["dojo/_base/declare",
        "./_Store",
        "dojo/_base/lang",
        "alfresco/core/CoreXhr",
    ],
    function(declare, Store, lang, CoreXhr){
        return declare([Store, CoreXhr], {
        	
        	
        	
            postMixInProperties: function () {
            	this.alfSubscribe("CHANGE_STATE_MEETING_DOCUMENT", lang.hitch(this, this.changeState), true);
            	this.alfSubscribe("UPDATE_SORE", lang.hitch(this, this.updateStore), true);
            	
            	this.store.handleAlfSubscribe = [];
            	
                this.inherited(arguments);
            },
            changeState: function (payload) {
                this.store.state = payload.state;
                if(payload.nodeRef){
                    this.store.nodeRef = payload.nodeRef;
                }
                this.store.document.properties["prop_btl-meeting_state"]  = payload.state;
            },
            
            
            updateStore:function(data){
            	
            	_Callback = data.Callback;
            	this.store.nodeRef = data.nodeRef;
            	
            	this.serviceXhr({
                    url: "/share/proxy/alfresco/get-node-properties-by-nodeRef?nodeRef=" + data.nodeRef,
                    method: "GET",
                    successCallback: this.setStore,
                    callbackScope: this
                });  
            	
            },
            
            setStore:function(data){        
            	this.store.document = data;
            	this.store.state = data.properties["prop_btl-meeting_state"];
            	if (_Callback != null && _Callback != undefined)
            		_Callback();
            }
            
            
            
        });
    });