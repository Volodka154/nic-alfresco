var windowSettingAction;
require(["jquery", "jqueryui" , "dojo/domReady!"], function($){

    var bodyDialog = document.createElement('div');
    var masSortable = [];
    var dialogId = "windowSettingAction-dlgSetting";
    var eventEl = new Event('moveEl');
    var setting = null;

    var doc_w = $(document).width();
    var doc_h = $(document).height();

    var dialog_w = 530;

    var dialog = new YAHOO.widget.SimpleDialog(dialogId, {
        width: dialog_w + "px",
        fixedcenter: false,
        x: doc_w/2 - dialog_w/2,
        y: 150,
        modal: true,
        visible: false,
        draggable: true,
		zIndex:10
    });

    var handleYes = function(e,obj) {
        try{
            if(setting) {
                setNewConfigToServer();
            }
        }catch(e){

        }
        sessionStorage.removeItem("menuTasksAndDocsItem");
        dialog.hide();
    };

    var handleNo = function(e,obj) {
        this.hide();
        setting = null;
    };

    var Buttons = [
        { text: "Да", handler: handleYes },
        { text:"Нет", handler: handleNo, isDefault:true}
    ];

    dialog.cfg.queueProperty("buttons", Buttons);
    dialog.setHeader('Настройки дашлета "Действия"');

    dialog.setBody('Загрузка конфигурации...');
    dialog.render(document.body);
    dialog.cancelEvent.subscribe(function(){

    });
    var _this = this;
    dialog.showEvent.subscribe(function (){
        getConfigFromServer();
    });

    windowSettingAction = dialog;

    function getConfigFromServer(){
        var xhr = new XMLHttpRequest();
        xhr.open('GET', "/share/proxy/alfresco/user-settingAction", true);
        xhr.send();
        xhr.onreadystatechange = function() {
            if (xhr.readyState != 4) return;

            switch(Number(xhr.status)){
            case 200:
                try {
                     var result = JSON.parse(xhr.responseText);
                } catch (e) {
                     alert( "Некорректный ответ " + e.message );
                }
                masSortable = [];
                renderSettingActionsWindowBody(result);
            break;
            case 0:
                // отмена загразку
            break;
            default:
                // обработать ошибку
                alert( xhr.status + ': ' + xhr.statusText );
            break;
            }
        };
    }

    function renderSettingActionsWindowBody(data){

        dialog.setBody("");
        bodyDialog.innerHTML = "";
        setting = data.setting;
        //window["btlSetting"] = setting;
		
		/*
            var menuEl = document.createElement('div');
            menuEl.setAttribute("name", "");
            menuEl.classList.add("sortable-action");
            var divHeader = document.createElement('div');
            divHeader.classList.add("sortable-action-head");
            var h3Header = document.createElement('h3');
            h3Header.textContent = "";
            divHeader.appendChild(h3Header);
            menuEl.appendChild(divHeader);
          */  
			
			var submenuEl = document.createElement('ul');
			submenuEl.setAttribute("name", "action_settings");
			masSortable.push("action_settings");
			var divHeaderSubmenu = document.createElement('div');
			divHeaderSubmenu.classList.add("sortable-action-head");
			var h4HeaderSubmenu = document.createElement('h4');
			h4HeaderSubmenu.textContent = "Действия";
			divHeaderSubmenu.appendChild(h4HeaderSubmenu);
			
			
			if (setting.length > 1)
				setting.sort(sortByPosition);
				
			
			
            for (var index = 0; index<setting.length; index++) {                                				
				var itemEl = document.createElement('li');
				itemEl.setAttribute("name", setting[index].id);
				itemEl.textContent = setting[index].name;
				itemEl.classList.add("sortable-action-item");
				var isVisibleEl = document.createElement('span');
				isVisibleEl.setAttribute("name", "isVisible");
				if(setting[index].visible){
					isVisibleEl.classList.add("icon-visible","btl-icon-16");
				}else{
					isVisibleEl.classList.add("icon-not-visible","btl-icon-16");
				}
				
				isVisibleEl.addEventListener("click", setVisibleState.bind(this,setting[index]));
				itemEl.addEventListener("moveEl", setPosition.bind(this,setting[index]));
				itemEl.appendChild(isVisibleEl);
				submenuEl.appendChild(itemEl);                                
            }
			bodyDialog.appendChild(divHeaderSubmenu);
                bodyDialog.appendChild(submenuEl);
            //bodyDialog.appendChild(menuEl);
        
        var clean = document.createElement('div');
        clean.style = "clear: both;";
        bodyDialog.appendChild(clean);
        dialog.setBody(bodyDialog);
        setSortable();
    }

    function setSortable(){
        masSortable.forEach(function(item){
             var $menuElement = $( "#" + dialogId + " ul[name='" + item + "']");
             $menuElement.sortable({
                cursor: "move",
                stop: function( event, ui ) {
                    var allElem = ui.item[0].parentNode.children;
                    for(var i = 0, j = allElem.length; i < j ; i++){
                        allElem[i].dispatchEvent(eventEl);
                    }
                }
             });
             $menuElement.disableSelection();
        });
    }

    function setVisibleState(item,event){
        
		event.currentTarget.classList.toggle("icon-visible");
		event.currentTarget.classList.toggle("icon-not-visible");
		(item.visible) ? item.visible = false : item.visible = true;        

    }

  
    function getElementPosition(element){
        var b = element.parentNode;
            if (element.nodeName.toLowerCase() == "li" && b.nodeName.toLowerCase() == "ul") {
                for (var c = 0, element = element.previousSibling; element && element != b;)
                element.nodeName.toLowerCase() == "li" && c++, element = element.previousSibling;
                return c + 1;
            }

    }

    function setPosition(item, event){
        var new_pos = getElementPosition(event.currentTarget);
        item.position = new_pos;
    }

    function setNewConfigToServer(){
        var param = JSON.stringify(setting);
        Alfresco.util.Ajax.jsonPost({
            method:"POST",
            url: "/share/proxy/alfresco/set-user-settingAction",
            dataObj: {config: param},
            successCallback:{
                fn: callback,
                scope: this
            }
        });
    }
});

function callback(data){
    // console.log(data.json.message);
    location.reload();
    require(["dojo/topic"], function(topic){
        topic.publish("ALF_DISPLAY_NOTIFICATION", {  message: "Применение настроек."});
    });
}

function sortByPosition(a, b){
    return a.position - b.position;
}