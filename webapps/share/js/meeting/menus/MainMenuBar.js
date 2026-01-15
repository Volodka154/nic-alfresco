/**
 * Created by nabokov on 18.11.2016.
 */
define(["dojo/_base/declare",
    "meeting/forms/_DynamicForm",
    "dojo/_base/lang",
    "meeting/utils/base",
    "meeting/menus/_MenuBar",
    "meeting/menuBarItems/SendRoute",
    "meeting/menuBarItems/ToRegister",
    "meeting/menuBarItems/CreateMeeting",
    "meeting/menuBarItems/RegisterAndSendToExecute",
    "meeting/menuBarItems/SendInvitation",
    "meeting/menuBarItems/ToArchive"

], function (declare, DynamicForm, lang, utilBase) {

    return declare([DynamicForm], {
        access: "",
        state: "",
        model: [],
        subscriptionTopic: "CHANGE_STATE_MEETING_DOCUMENT",

        postCreate: function () {
            this.inherited(arguments);
            this.alfSubscribe(this.subscriptionTopic, lang.hitch(this, this.setState), true);
            this.alfSubscribe("VALID_BASE_FORM_MEETING", lang.hitch(this, this.disableMenu), true);
            this.model = {
                name: "meeting/menus/_MenuBar",
                config: {
                    widgets: []
                }
            };
            if(!this.state && this.storeId) {
                var store = utilBase.getStoreById(this.storeId);
                if (store.document) {
                    this.state = store.state;
                }
            }
            this.setState({state: this.state, access: this.access});
            this.disableMenu({valid: false});
        },

        setStateSendRoute: function () {

            this.applyModel();
        },

        setState: function (payload) {
        	
        	var isSecretary = false;
        	var isClerk = false;
        	var isAdmin = false;
        	var isDisableState = false;
        	
        	if(this.storeId) {
                var store = utilBase.getStoreById(this.storeId);
                
                isSecretary = store.isSecretary;
                isClerk = store.isClerk;
                isAdmin = store.isAdmin;                
            }
        	
            this.state = payload.state;
            this.alfPublish("CHANGE_MEETING_STATE_CONTROL", this.state, true);
            switch (this.state) {
                case "":
                    this.model.config.widgets = [
                       // {name: "meeting/menuBarItems/CreateMeeting"},
                        //{name: "meeting/menuBarItems/SelectRooms"}
                    ];
                    break;
                case "Черновик":
                case "Переговорная подтверждена":
                	if (isSecretary || isClerk || isAdmin)
            		{
	                    this.model.config.widgets = [
	                                                 /*
	                        {name: "meeting/menuBarItems/SendRoute"},
	                        {name: "meeting/menuBarItems/ToRegister"},
	                        
	                        {name: "meeting/menuBarItems/SendInvitation"},
	                        {name: "meeting/menuBarItems/ToArchive"},
	                        */
	                        {name: "meeting/menuBarItems/CompleteCreate"},
	                        {name: "meeting/menuBarItems/SelectRooms"}
	                        
	                    ];
            		}
                    break;
                case "Подтверждение переговорной":
                	if (isSecretary || isClerk || isAdmin)
            		{
                		this.model.config.widgets = [                                                 
                	                             {name: "meeting/menuBarItems/CancelConfirmRoom"}                    
                	                         ];
            		}
                    break;
                case "Подготовлен":
                	if (isSecretary || isClerk || isAdmin)
            		{
	                	this.model.config.widgets = [  
	                	    
	                        {name: "meeting/menuBarItems/ToNegotiation"},                        
	                        {name: "meeting/menuBarItems/SendInvitation"},
	                        {name: "meeting/menuBarItems/ToRegister"},
	                        {name: "meeting/menuBarItems/RegisterAndSendToExecute"},
	                        {name: "meeting/menuBarItems/CreateProtocol"},
	                        //{name: "meeting/menuBarItems/SelectRooms"},
	                        {name: "meeting/menuBarItems/ToArchive"}
	                    ];
            		}
                    break;
                case "На согласовании":
                	if (isSecretary || isClerk || isAdmin)
            		{
	                	this.model.config.widgets = [ 	                	    
	                        {name: "meeting/menuBarItems/CancelNegotiation"}
	                    ];
            		}
                	
                    break;
                case "На доработке":
                	if (isSecretary || isClerk || isAdmin)
            		{
	                	this.model.config.widgets = [ 	                	    
	                        // {name: "meeting/menuBarItems/ToNegotiation"}
	                    ];
            		}
                    break;
                case "Согласован":
                	if (isSecretary || isClerk || isAdmin)
            		{
	                	this.model.config.widgets = [ 	                	    
	                        {name: "meeting/menuBarItems/ToRegister"},
	                        {name: "meeting/menuBarItems/RegisterAndSendToExecute"}
	                    ];
            		}
                    break;
                case "На подписании":
                	if (isSecretary || isClerk || isAdmin)
            		{
	                	this.model.config.widgets = [ 	                	    
	                        {name: "meeting/menuBarItems/CancelSigner"}
	                    ];
            		}
                    break;
                case "На регистрации":
                	if (isSecretary || isClerk || isAdmin)
            		{
	                	this.model.config.widgets = [                	                     	    
		                     {name: "meeting/menuBarItems/ToRegister"},
		                     {name: "meeting/menuBarItems/RegisterAndSendToExecute"}
		                 ];
            		}
                    break;
                case "Зарегистрирован":
                	if (isSecretary || isClerk || isAdmin)
            		{
	                    this.model.config.widgets = [						
							{name: "meeting/menuBarItems/ToExecute"},
							{name: "meeting/menuBarItems/ToArchive"}
	                    ];
            		}
                    break;
                case "На исполнении":
                	if (isSecretary || isClerk || isAdmin)
            		{
	                    this.model.config.widgets = [					
							{name: "meeting/menuBarItems/ToArchive"}
	                    ];
            		}
                    break;
                case "В архиве":
                	this.model.config.widgets = [					
                	 							
                	 	                    ];
                    break;
            }
            this.applyModel();
        },

        applyModel: function () {
            this.onDynamicFormUpdate({value: JSON.stringify([this.model])});
        },
        //Проверка валидации формы TAB_MEETING
        disableMenu: function(payload){
            var isFormValid = payload.valid;
            var menuBar = this._processingWidgets[0]; //AlfMenuBar
            menuBar._processingWidgets.forEach(function (item) {
               item.setDisabled( (isFormValid) ? false : true) ;
            });
        }
    });
});
