var windowSettingTasksAndDocs;
require(["jquery", "jqueryui" , "dojo/domReady!"], function($){

    var bodyDialog = document.createElement('div');
    var masSortable = [];
    var dialogId = "windowSettingTasksAndDocs-dlgSetting";
    var eventEl = new Event('moveEl');
    var setting = null;

    var doc_w = $(document).width();
    var doc_h = $(document).height();

    var dialog_w = 600;

    var dialog = new YAHOO.widget.SimpleDialog(dialogId, {
        width: dialog_w + "px",
        fixedcenter: false,
        x: doc_w/2 - dialog_w/2,
        y: 150,
        modal: true,
        visible: false,
        draggable: true
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
    dialog.setHeader('Настройки дашлета "Мои задачи и документы"');

    dialog.setBody('Загрузка конфигурации...');
    dialog.render(document.body);
    dialog.cancelEvent.subscribe(function(){

    });
    var _this = this;
    dialog.showEvent.subscribe(function (){
        getConfigFromServer();
    });

    windowSettingTasksAndDocs = dialog;

    function getConfigFromServer(){
        var xhr = new XMLHttpRequest();
        xhr.open('GET', "/share/proxy/alfresco/user-setting", true);
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
                renderSettingTasksAndDocsWindowBody(result);
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

    function renderSettingTasksAndDocsWindowBody(data){

        dialog.setBody("");
        bodyDialog.innerHTML = "";
        setting = JSON.parse(data.setting);
        //window["btlSetting"] = setting;
        for (menu in setting) {
            var menuEl = document.createElement('div');
            menuEl.setAttribute("name", setting[menu].id);
            menuEl.classList.add("sortable-task-and-docs");
            var divHeader = document.createElement('div');
            divHeader.classList.add("sortable-task-and-docs-head");
            var h3Header = document.createElement('span');
            var h3HeaderAlias = document.createElement('span');
            h3Header.textContent = setting[menu].name;
            h3HeaderAlias.textContent = "Отображаемое название";
            divHeader.appendChild(h3Header);
            divHeader.appendChild(h3HeaderAlias);
            menuEl.appendChild(divHeader);
            if(setting[menu].submenu.main){
                var mainSubmenu = setting[menu].submenu.main;
                var mainSubmenuEl = document.createElement('ul');
                mainSubmenuEl.setAttribute("name", mainSubmenu.id);
                masSortable.push(mainSubmenu.id);
                if(mainSubmenu.value.length > 1)
                    mainSubmenu.value.sort(sortByPosition);
                for (item in mainSubmenu.value) {
                    var itemEl = document.createElement('li');
                    var blockEl = document.createElement('div');
                    blockEl.classList.add("item-block");
                    itemEl.setAttribute("name", mainSubmenu.value[item].id);
                    blockEl.textContent = mainSubmenu.value[item].name;
                    itemEl.classList.add("sortable-task-and-docs-item");
                    var isVisibleEl = document.createElement('span');
                    isVisibleEl.setAttribute("name", "isVisible");
                    var isMainCategory = document.createElement('span');
                    isMainCategory.setAttribute("name", "isMain");
                    var aliasName = document.createElement('input');
                    aliasName.setAttribute("name", "aliasName");
                    aliasName.classList.add("item-input");
                    if(mainSubmenu.value[item].aliasName){
                        aliasName.value =  mainSubmenu.value[item].aliasName
                    }
                    if(mainSubmenu.value[item].visible){
                        isVisibleEl.classList.add("icon-visible","btl-icon-16");
                    }else{
                        isVisibleEl.classList.add("icon-not-visible","btl-icon-16");
                    }
                    if(mainSubmenu.value[item].isMain){
                        isMainCategory.classList.add("icon-on-check","btl-icon-16");
                    }else{
                        isMainCategory.classList.add("icon-off-check","btl-icon-16");
                    }
                    isVisibleEl.addEventListener("click", setVisibleState.bind(this,mainSubmenu.value[item]));
                    isMainCategory.addEventListener("click", setMainCategory.bind(this,mainSubmenu.value[item]));
                    aliasName.addEventListener("change", setAliasName.bind(this, mainSubmenu.value[item]));
                    itemEl.addEventListener("moveEl", setPosition.bind(this,mainSubmenu.value[item]));
                    blockEl.appendChild(isMainCategory);
                    blockEl.appendChild(isVisibleEl);
                    itemEl.appendChild(blockEl);
                    itemEl.appendChild(aliasName);
                    mainSubmenuEl.appendChild(itemEl);
                }
                menuEl.appendChild(mainSubmenuEl);
            }
            for (submenu in setting[menu].submenu) {
                if(submenu == "main")
                    continue;
                var valSubmenu = setting[menu].submenu[submenu];
                var submenuEl = document.createElement('ul');
                submenuEl.setAttribute("name", valSubmenu.id);
                masSortable.push(valSubmenu.id);
                var divHeaderSubmenu = document.createElement('div');
                divHeaderSubmenu.classList.add("sortable-task-and-docs-head-submenu");
                var h4HeaderSubmenu = document.createElement('h4');
                h4HeaderSubmenu.textContent = valSubmenu.name;
                divHeaderSubmenu.appendChild(h4HeaderSubmenu);
                //submenuEl.appendChild(divHeaderSubmenu);
                if(valSubmenu.value.length > 1)
                    valSubmenu.value.sort(sortByPosition);
                for (item in valSubmenu.value) {
                    var itemEl = document.createElement('li');
                    var blockEl = document.createElement('div');
                    blockEl.classList.add("item-block");
                    itemEl.setAttribute("name", valSubmenu.value[item].id);
                    blockEl.textContent = valSubmenu.value[item].name;
                    itemEl.classList.add("sortable-task-and-docs-item");
                    var isVisibleEl = document.createElement('span');
                    isVisibleEl.setAttribute("name", "isVisible");
                    var isMainCategory = document.createElement('span');
                    isMainCategory.setAttribute("name", "isMain");
                    var aliasName = document.createElement('input');
                    aliasName.setAttribute("name", "aliasName");
                    aliasName.classList.add("item-input");
                    if(valSubmenu.value[item].aliasName){
                        aliasName.value =  valSubmenu.value[item].aliasName
                    }
                    if(valSubmenu.value[item].visible){
                        isVisibleEl.classList.add("icon-visible","btl-icon-16");
                    }else{
                        isVisibleEl.classList.add("icon-not-visible","btl-icon-16");
                    }
                    if(valSubmenu.value[item].isMain){
                        isMainCategory.classList.add("icon-on-check","btl-icon-16");
                    }else{
                        isMainCategory.classList.add("icon-off-check","btl-icon-16");
                    }
                    isVisibleEl.addEventListener("click", setVisibleState.bind(this,valSubmenu.value[item]));
                    isMainCategory.addEventListener("click", setMainCategory.bind(this,valSubmenu.value[item]));
                    aliasName.addEventListener("change", setAliasName.bind(this, mainSubmenu.value[item]));
                    itemEl.addEventListener("moveEl", setPosition.bind(this,valSubmenu.value[item]));
                    blockEl.appendChild(isMainCategory);
                    blockEl.appendChild(isVisibleEl);
                    itemEl.appendChild(blockEl);
                    itemEl.appendChild(aliasName);
                    submenuEl.appendChild(itemEl);
                }
                menuEl.appendChild(divHeaderSubmenu);
                menuEl.appendChild(submenuEl);
            }
            bodyDialog.appendChild(menuEl);
        }
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
        if( event.currentTarget.parentNode.children.isMain.classList.contains("icon-off-check")) {
            event.currentTarget.classList.toggle("icon-visible");
            event.currentTarget.classList.toggle("icon-not-visible");
            (item.visible) ? item.visible = false : item.visible = true;
        }
    }

    function setAliasName(item, event) {
        item["aliasName"] = event.target.value;
    }

    function setMainCategory(item, event) {
        if( event.currentTarget.parentNode.children.isVisible.classList.contains("icon-not-visible")) {
            $(event.currentTarget.parentNode.children.isVisible).trigger( "click" );
        }
        $("#" + dialogId  + " span.icon-on-check").removeClass(["icon-on-check"]).addClass( "icon-off-check" );
        event.currentTarget.classList.remove("icon-off-check");
        event.currentTarget.classList.add("icon-on-check");
        cleanOldMainCategory();
        item["isMain"] = true;

    }

    function cleanOldMainCategory() {
        if(setting){
            for (menu in setting) {
                for (submenu in setting[menu].submenu) {
                    var valSubmenu = setting[menu].submenu[submenu];
                    for (var i = 0; valSubmenu.value[i]; i++) {
                        if(valSubmenu.value[i].isMain) {
                            delete valSubmenu.value[i].isMain;
                            //return;
                        }
                    }
                }
            }
        }
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
            url: "/share/proxy/alfresco/set-user-setting",
            dataObj: {config: param},
            successCallback:{
                fn: callback,
                scope: this
            }
        });
    }
});

function callback(data){
    location.reload();
    require(["dojo/topic"], function(topic){
        topic.publish("ALF_DISPLAY_NOTIFICATION", {  message: "Применение настроек."});
    });
}

function sortByPosition(a, b){
    return a.position - b.position;
}