define(["dojo/_base/declare",
        "btl/widgets/base/DataGrid",
        "dojo/_base/lang"],
        function(declare, DataGrid, lang) {
   return declare([DataGrid], {
	   
	   Url: "search/meetingRooms",
	   colModel: [ ],
  	  		             
	   postMixInProperties: function alfresco_meetingRoomsDataGrid__postMixInProperties() {
		      this.inherited(arguments);
		      this.alfSubscribe("DATAGRID_DELETE_meetingRooms", lang.hitch(this, this.deletemeetingRooms), true);
		      this.alfSubscribe("DATAGRID_GET_meetingRooms_DATA", lang.hitch(this, this.getmeetingRoomsData), true);
		      this.alfSubscribe("ALF_CLOSE_DIALOG", lang.hitch(this, this.closeDialog));
	   },
	   
	   closeDialog: function btl_meetingRoomsService__closeDialog(payload) {
	    	alert("123");
	    },
	   
	   setEventsDataGrid: function alfresco_DataGrid__setEventsDataGrid(){
           var _this = this;
           this.grid.pqGrid({
               rowDblClick: function( event, ui ) {
            	   _this.focusElement = document.activeElement;
                   _this.getmeetingRoomsData();
               }
           });
      },
	   	   
	   
		             
	   deletemeetingRooms: function alfresco_meetingRoomsDataGrid__deletemeetingRooms(){		   		  
		   
        	 var arr = this.grid.pqGrid("selection", { type: 'row', method: 'getSelection' });
        	 if (arr && arr.length > 0) {
        		 var row = arr[0].rowData;          
        		 var payload = {};

        		 _row = row;
        		 
        		 this.serviceXhr({
    	    	    url: "/share/proxy/alfresco/meeting/get-meeting-by-room?room=" + row.nodeRef,
    	    	    method: "GET",
    	    	    successCallback: this.returnMeetingRequestDelete,
    	    	    callbackScope: this
    	    	  });
        		 
        		   
        		
        		 
        	 }      	  
        	 
        	 
		 },
		 
		 returnMeetingRequestDelete: function(payload){
			 
			 // console.log("returnMeetingRequestDelete");
			 
			 if (payload.meetings && payload.meetings.length > 0)
			 {
				 this.alfPublish("ALF_DISPLAY_PROMPT", {message: "Переговорная используется в " + payload.meetings.length + " РК мероприятий. Удаление невозможно."}, true);
			 }
			 else
			 {
		 
				 payload.requiresConfirmation = true;
	    		 payload.confirmationTitle = "Удаление";
	    		 payload.confirmationPrompt = "Вы действительно хотите удалить: " + _row.number +" ?";
	    		 payload.url = "slingshot/datalists/list/node/" + _row.nodeRef.replace("://", "/");
	    		 payload.responseTopic = "DATAGRID_DELETE_ROW_FROM_STORE",   	   	  
	
	    		 this.alfPublish("ALF_CRUD_DELETE", payload, true );   
			 }
  		         		        		 
		 },
		 
		 		 
		 getmeetingRoomsData: function alfresco_meetingRoomsDataGrid__getmeetingRoomsData(){
				var arr = this.grid.pqGrid("selection", { type: 'row', method: 'getSelection' });											
	            if (arr && arr.length > 0) {
	            	var row = arr[0].rowData; 
	            	var item = {};
	            	item.config = {};
	            	item.data = row;
	            	item.data.rowId = arr[0].rowIndx;
	            	item.config.dialogTitle = "Редактировать";
	            	item.config.dialogConfirmationButtonTitle = "edit.title";
	            	item.config.dialogCancellationButtonTitle = "cancel.title";
	            	item.config.formSubmissionTopic = "BTL_EDIT_meetingRooms";
	            	item.config.contentHeight = "300px";
	            	this.alfPublish("BTL_CREATE_FORM_meetingRooms", item, true);
	            	this.alfLog("log", "alfresco_meetingRoomsDataGrid__getmeetingRoomsData", row);
	            }	            
	   },
	   loadDataToDataGrid: function alfresco_DataGrid__loadDataToDataGrid(response, originalRequestConfig){	
		    
		   response.items.forEach(function(item, i, arr) {
			   if (item.confirmationRequired == true){
				   response.items[i].confirmationRequired_img = "&#9745;"
			   }
			   else {
				   response.items[i].confirmationRequired_img = "&#9937;"
			   }
			   

	   			   			   
			 });
		    this.setDataDataGrid(response.items);
		},
		
   });
});






