
(function()
{
    var Dom = YAHOO.util.Dom,
    Event = YAHOO.util.Event;
    var RegEx=/^([a-zа-яё0-9/ //\//\.\/\\/-]+)$/i; //только цифры буквы символы "/" "." "-" "\"

    Alfresco.WindowChoiceItem = function BTL_WindowChoiceItem(htmlId){
        Alfresco.WindowChoiceItem.superclass.constructor.call(this, "Alfresco.WindowChoiceItem", htmlId, []);
        this.onOk = new YAHOO.util.CustomEvent("ok" , this);
        this.selectedItems = null;
        this.dialog = null;
        return this;
    };

    YAHOO.extend(Alfresco.WindowChoiceItem, Alfresco.component.Base,
       {
            options:
                  {
                    dataUrl:{
                        page_num: 0,
                        per_page: 20,
                        q_word:"",
                        type:"cm:content",
                        extra:"",
                        data:"",
                        field:"name",
                        s_field:"name",
                        classes:""},
                    currentValue:"",
                    url:"/share/proxy/alfresco/filters/association",
                    header:"",
                    waitHeader:"Загрузка...",
                    emptyMessage:"Нет данных для отображения",
                    blockMessage:"*Для поиска введите значение и нажмите Enter",
                    renderName:"name",
                    renderData:"result",
                    placeHolder:"Поиск",
                    renderTotalRecords:"cnt_whole",
                    excluded:[],
                    search:true,
                    single:true,
                    loadData:false
                  },

            selectedItems: null,
            dialog: null,
            mainDiv:null,
            iconPlus: '<img  src="/share/res/components/form/images/plus-16.png" title="Добавить" tabindex="0">',
            iconDelete: '<img  src="/share/res/components/form/images/remove-icon-16.png" title="Удалить" tabindex="0">',
            curItem: {},
            value:null,
            values:{},
            input: null,
            errorMsgInput: null,
            tBodyLeft: null,
            tBodyRight: null,
            leftDiv: null,
            loadingDiv: null,
            loadedItems: 0,
            totalItems: 0,
            onOk: null,
            //data:null,
            oldValue: {},
            curItems: {},
            focused: null,
            Ajax: null,
            btnCancelLoad: null,
            specSymbolMas:['!','+','=','_','*','(',')','&','@','#','$','%','^','"','№','?',':','>','<',',',';','|','`','~','\'','[',']'],

            setOptions: function ObjectWindowChoiceItem_setOptions(obj)
                {
                    if('dataUrl' in obj){
                        this.options.dataUrl = YAHOO.lang.merge(this.options.dataUrl, obj.dataUrl);
                        delete obj.dataUrl;
                    }

                    Alfresco.WindowChoiceItem.superclass.setOptions.call(this, obj);

                    if(this.widgets.dialog){
                        this.widgets.dialog.setHeader(this.options.header);
                        this.widgets.dialog.setBody(this.formDialog());
                        this.widgets.dialog.render(document.body);
                        this.setEvents();
                    }
                  return this;
            },
            onReady: function ObjectWindowChoiceItem_onReady(){
                this.dialogCreate();
                this.setEvents();
            },
            scrollEvent: function scrollEvent(){
                 var _this = this;
                 Event.on(this.leftDiv, "scroll", function(e,obj) {
                     if (parseInt(_this.leftDiv.scrollHeight) - parseInt(_this.leftDiv.scrollTop) === parseInt(_this.leftDiv.clientHeight) ) {
                           _this.getPageData();
                        }
                 },this,true);
            },
            inputEvent: function inputEvent(){
                 /*Event.on(this.input,"input",function(e,obj){
                      if(this.input.value.length == 0 || RegEx.test(this.input.value)) {
                         this.errorMsgInput.classList.add("displayNone");
                         this.options.dataUrl.q_word = encodeURI(this.input.value);
                         this.cleanData();
                         this.getPageData();
                      }else{
                         this.errorMsgInput.classList.remove("displayNone");
                      }

                 },this,true);*/
            },
            onClickButtonCancelLoad : function onClickButtonCancelLoad(){
                var _this = this;
                Event.on(this.btnCancelLoad,"click",function(e,obj){
                    _this.Ajax.abort();
                });
            },
            onkeypressInputEvent: function onkeypressInputEvent(){
                  var thisItem = this;
                  function getChar(event) {
                        if (event.which == null) { // IE
                          if (event.keyCode < 32) return null; // спец. символ
                          return String.fromCharCode(event.keyCode)
                        }

                        if (event.which != 0 && event.charCode != 0) { // все кроме IE
                          if (event.which < 32) return null; // спец. символ
                          return String.fromCharCode(event.which); // остальные
                        }
                        return null; // спец. символ
                  };
                 this.input.onkeypress  = function(e) {
                        e = e || event;
                        if(e.keyCode == 13){
                            if(thisItem.input.value.length == 0 || RegEx.test(thisItem.input.value)) {
                                thisItem.errorMsgInput.classList.add("displayNone");
                                thisItem.options.dataUrl.q_word = encodeURI(thisItem.input.value);
                                thisItem.cleanData();
                                thisItem.getPageData();
                            }else{
                                thisItem.errorMsgInput.classList.remove("displayNone");
                            }
                            return;
                        }
                        if (e.ctrlKey || e.altKey || e.metaKey) return;
                        var chr = getChar(e);
                        if (chr == null || thisItem.specSymbolMas.indexOf(chr)>-1 ) return false;
                 }
            },
            setEvents: function ObjectWindowChoiceItem_dialogCreate(){
                    this.inputEvent();
                    this.scrollEvent();
                    this.onkeypressInputEvent();
                    this.onClickButtonCancelLoad();
                  },
            dialogCreate: function ObjectWindowChoiceItem_dialogCreate()
                   {
                        this.widgets.dialog = new YAHOO.widget.SimpleDialog(this.id+"-dlgWinChoice", {
                        	    width: "1000px",
                        	    fixedcenter: true,
                        	    modal: true,
                        	    visible: false,
                        	    draggable: false
                        });

                        var handleYes = function(e) {
                            if(this.callback.argument.curItem != null && !this.callback.argument.isEmpty(this.callback.argument.curItem))
                                this.callback.argument.value = {nodeRef:this.callback.argument.curItem.item.id, name:this.callback.argument.curItem.item.innerText.replace(/(^\s+|\s+$)/g,'')};
                            this.callback.argument.pressOk();
                            this.hide();
                        };

                        var handleNo = function(e,obj) {
                            this.callback.argument.cleanData();
                            this.callback.argument.curItem = {};
                            this.callback.argument.curItems = {};
                            this.callback.argument.input.value = '';
                            this.callback.argument.tBodyRight.innerHTML = '';
                            this.callback.argument.options.dataUrl.q_word = "";
                            this.hide();
                        };

                        var Buttons = [
                            { text: "Да", handler: handleYes },
                            { text:"Нет", handler: handleNo, isDefault:true}
                        ];

                        this.widgets.dialog.cfg.queueProperty("buttons", Buttons);
                        this.widgets.dialog.setHeader(this.options.header);
                        this.widgets.dialog.setBody(this.formDialog());
                        this.widgets.dialog.render(document.body);
                        this.widgets.dialog.callback.argument = this;
                        this.widgets.dialog.cancelEvent.subscribe(function(){
                            this.callback.argument.widgets.dialog.hide();
                            this.callback.argument.cleanData();
                            this.callback.argument.curItem = {};
                            this.callback.argument.curItems = {};
                            this.callback.argument.input.value = '';
                            this.callback.argument.options.dataUrl.q_word = "";
                            this.callback.argument.tBodyRight.innerHTML = '';
                        });
                        this.widgets.dialog.showEvent.subscribe(function loadData(){
                            this.callback.argument.cleanData();
                            this.callback.argument.curItem = {};
                            this.callback.argument.curItems = {};
                            this.callback.argument.options.dataUrl.q_word = "";
                            this.callback.argument.tBodyRight.innerHTML = '';
                            this.callback.argument.renderCurrentValue();
                            if(this.callback.argument.options.loadData)
                            	this.callback.argument.getPageData();

                        });
                        this.dialog = this.widgets.dialog;
                        Dom.addClass(this.dialog.element, "dijitPopup");

                        this.message = new YAHOO.widget.Panel(this.id+"message",
                                        { width:"100px",
                                          fixedcenter:true,
                                          close:true,
                                          draggable:false,
                                          zindex:999,
                                          modal:true,
                                          visible:false
                                        }
                                    );
                        this.message.setHeader("");
                        this.message.setBody("");
                        this.message.render(document.body);

                   },
            formDialog: function ObjectWindowChoiceItem_formDialog()
                   {
                        var mainDiv = document.createElement('div');
                        mainDiv.id = "window-choice-item";

                        var loadingDiv = document.createElement('div');
                        loadingDiv.className = "loading";
                        var loadingImg = document.createElement('img');
                        loadingImg.setAttribute("src", "/share/res/js/lib/loading/loading.gif");
                        loadingImg.setAttribute("style", "position: absolute; left: 17%; top: 45%;");
                        loadingDiv.appendChild(loadingImg);
                        var cancelLoad = document.createElement('button');
                        cancelLoad.textContent = "Отменить";
                        cancelLoad.setAttribute("style", "width: 100px;");
                        cancelLoad.className = "closeLoad";
                        this.btnCancelLoad = cancelLoad;
                        loadingDiv.appendChild(cancelLoad);

                        var topDiv = document.createElement('div');
                        topDiv.className = "topDiv";
                        var btnCleanInput = document.createElement('span');
                        var input = document.createElement('input');
                        input.setAttribute("placeholder", this.options.placeHolder);

                        var errorMsgBlock = document.createElement('div');
                        errorMsgBlock.className = "errorMsgBlock";
                        var errorMsgInput = document.createElement('span');
                        errorMsgInput.innerHTML = '<i style="color:red;">Введены недопустимые символы</i>';
                        errorMsgInput.className = "displayNone";
                        this.errorMsgInput = errorMsgInput;
                        errorMsgBlock.appendChild(errorMsgInput);

                        var msgBlock = document.createElement('div');
                        msgBlock.className = "msgBlock";
                        msgBlock.innerHTML = '<i style="color:blue;">' + this.options.blockMessage + '</i>';
                        topDiv.appendChild(msgBlock);

                        topDiv.appendChild(input);
                        topDiv.appendChild(errorMsgBlock);
                        topDiv.appendChild(btnCleanInput);
                        this.input = input;
                        if(!this.options.search){
                            topDiv.className = "displayNone";
                        }
                        var bottomDiv = document.createElement('div');
                        bottomDiv.className = "bottomDiv";
                        mainDiv.appendChild(topDiv);
                        mainDiv.appendChild(bottomDiv);
                        mainDiv.appendChild(loadingDiv);
                        var bottomLeftDiv = document.createElement('div');
                        bottomLeftDiv.className = "bottomLeftDiv";
                        var bottomRightDiv = document.createElement('div');
                        bottomRightDiv.className = "bottomRightDiv";
                        bottomDiv.appendChild(bottomLeftDiv);
                        bottomDiv.appendChild(bottomRightDiv);
                        var tableBottomLeftDiv = document.createElement('table');
                        var tableBottomRightDiv = document.createElement('table');
                        tableBottomLeftDiv.className = "table";
                        tableBottomRightDiv.className = "table";
                        bottomLeftDiv.appendChild(tableBottomLeftDiv);
                        bottomRightDiv.appendChild(tableBottomRightDiv);
                        var tbodyTableBottomLeftDiv = document.createElement('tbody');
                        var tbodyTableBottomRightDiv = document.createElement('tbody');
                        tableBottomLeftDiv.appendChild(tbodyTableBottomLeftDiv);
                        tableBottomRightDiv.appendChild(tbodyTableBottomRightDiv);
                        this.loadingDiv = loadingDiv;
                        this.tBodyLeft = tbodyTableBottomLeftDiv;
                        this.tBodyRight = tbodyTableBottomRightDiv;
                        this.leftDiv = bottomLeftDiv;
                        this.mainDiv = mainDiv;
                        return mainDiv;
                   },
            getPageData:function ObjectWindowChoiceItem_getPageData()
                   {
                        this.options.dataUrl.page_num++;
                        function ObjectWindowChoiceItem_getPageData_load_success(response){
                            var items = response[this.options.renderData],
                            item;

                            this.loadedItems += (items)? items.length : 0;
                            this.totalItems = response[this.options.renderTotalRecords];
                            //console.log(this.curItems);
                            for (var i = 0, il = items.length; i < il; i++)
                                {
                                    item = items[i];
                                    if(this.inArray(item.nodeRef,this.options.excluded)) continue;
                                    if(!this.isEmpty(this.curItem) && item.nodeRef == this.curItem.item.id) continue;
                                    if(item.nodeRef in this.curItems) continue;

                                    this.createPicker(item.nodeRef, item[this.options.renderName], item.data ,this.tBodyLeft ,this.iconPlus ,"plus");
                                }
                            this.loadMore();
                            if(this.tBodyLeft.childElementCount === 0){
                                this.tBodyLeft.innerHTML = this.options.emptyMessage;
                            }
                            this.hideLoading();
                            if(this.options.search){
                                if(this.focused){
                                    this.focused.focus();
                                }
                            }
                        };

                        var onFailure = function ObjectWindowChoiceItem_getPageData_load_Failure(response){
                            this.hideLoading();
                            this.message.setHeader("Ошибка");
                            this.message.setBody(response.json.message);
                            this.message.show();
                        };

                        /*var config = {
                            url: this.options.url,
                            dataObj: this.options.dataUrl,
                            successCallback:{
                                fn: onSuccess,
                                scope: this
                            },
                            failureCallback:{
                                fn: onFailure,
                                scope: this
                            }
                        };*/
                        if(this.options.search)
                            this.focused = document.querySelector("input:focus");
                       // this.showLoading();
                        //this.Ajax = Alfresco.util.Ajax.request(config);
                        if(this.Ajax == null){

                            var query = "?";
                            for (key in this.options.dataUrl) {
                                query += ( encodeURIComponent(this.options.dataUrl[key]) ) ? ( encodeURIComponent(key)+"="+encodeURIComponent(this.options.dataUrl[key])+"&") : "";
                            }

                            var xhr = new XMLHttpRequest();
                            xhr.open('GET', this.options.url + query, true);
                            xhr.send(query);
                            this.showLoading();
                            var _this = this;
                            this.Ajax = xhr;
                            xhr.onreadystatechange = function() {
                                if (xhr.readyState != 4) return;

                                switch(Number(xhr.status)){
                                case 200:
                                    try {
                                         var result = JSON.parse(xhr.responseText);
                                         ObjectWindowChoiceItem_getPageData_load_success.call(_this,result);
                                         _this.hideLoading();
                                         _this.Ajax = null;
                                    } catch (e) {
                                         _this.hideLoading();
                                         _this.Ajax = null;
                                         alert( "Некорректный ответ " + e.message );
                                    }
                                break;
                                case 0:
                                    _this.hideLoading();
                                    _this.Ajax = null;
                                break;
                                default:
                                    // обработать ошибку
                                    _this.hideLoading();
                                    _this.Ajax = null;
                                    alert( xhr.status + ': ' + xhr.statusText );
                                break;
                                }
                            };
                        }


                   },
           createPicker: function ObjectWindowChoiceItem_createPicker(id, val, data, place, icon, classItem)
                   {
                        var row = document.createElement('tr');
                        row.className = "row";
                        row.id = id;
                        row.itemData = data;
                        row.className = classItem;
                        place.appendChild(row);
                        var tdVal = document.createElement('td');
                        tdVal.innerHTML  = '<div class="winChoiceItem">' + val + '</div>';
                        row.appendChild(tdVal);
                        var tdIcon = document.createElement('td');
                        row.appendChild(tdIcon);
                        var elIcon = document.createElement('span');
                        elIcon.innerHTML = icon;
                        elIcon.id = this.id + "_" + id +"-icon";
                        tdIcon.appendChild(elIcon);
                        var click = function onClick(e){
                           this.clickPicker(e,{item:row,tdIcon:elIcon})
                        }

                        var handle = YAHOO.util.Event.addListener(elIcon.id, "click", click,this,true);
                        return {item:row, tdIcon:elIcon};
                   },
           plusClick: function ObjectWindowChoiceItem_plusClick(item, tdIcon){
                            tdIcon.innerHTML = this.iconDelete;
                        	this.tBodyRight.appendChild(item);
                            YAHOO.util.Dom.removeClass(item,"plus");
                        	if (!this.isEmpty(this.curItem)) {
                        		this.deleteClick(this.curItem.item, this.curItem.tdIcon)
                        	}
                        	if(this.options.single){
                        		this.setCurrentItem(item,tdIcon);
                        	}
                        	else{
                        		this.curItems[item.id] = {"item":item,"tdIcon":tdIcon};
                        	}
                   },
           deleteClick: function ObjectWindowChoiceItem_deleteClick(item, tdIcon){
                            if(this.tBodyLeft.childElementCount === 0){
                                this.tBodyLeft.innerHTML = '';
                            }
                            tdIcon.innerHTML = this.iconPlus;
                            YAHOO.util.Dom.addClass(item,"plus");
                            this.tBodyLeft.appendChild(item);
                            if(this.options.single){
                                this.curItem = {};
                                this.value = {};
                            }else{
                               delete this.curItems[item.id]
                            }
                            if(this.input.value){
                                this.cleanData();
                                this.getPageData();
                            }


                   },
           clickPicker: function ObjectWindowChoiceItem_deleteClick(layer, args){
                            if (YAHOO.util.Dom.hasClass(args.item,"plus")){
                                this.plusClick(args.item, args.tdIcon);
                            }else{
                                this.deleteClick(args.item, args.tdIcon);
                            }
                   },
           cleanData: function ObjectWindowChoiceItem_cleanData(layer, args){
                            this.tBodyLeft.innerHTML = '';
                            this.options.dataUrl.page_num = 0;
                            this.loadedItems = 0;
                            this.totalItems = 0;
                   },
           loadMore: function ObjectWindowChoiceItem_loadMore(){
                            if(this.loadedItems < this.totalItems){
                            		if (this.leftDiv.scrollHeight === this.leftDiv.clientHeight)
                            			this.getPageData();
                            	}
                   },
           /**
           * Returns object {nodeRef,name} selected element or null(false)
           *
           * @method getValue
           */
           getValue: function ObjectWindowChoiceItem_getValue(withStyle){
                            if(!this.isEmpty(this.curItem))
                                if(!withStyle){
                                    return this.value;
                                }else{
                                    return {"nodeRef":this.curItem.item.id,"name":this.curItem.item};
                                }
                            return null;
                   },
           getValues: function ObjectWindowChoiceItem_getValues(withStyle){
                            if(!this.isEmpty(this.curItems)){
                                var masGetValues = new Array();
                                for(key in this.curItems){
                                    if(withStyle){
                                        masGetValues.push({"nodeRef":this.curItems[key].item.id,"name":this.curItems[key].item.innerHTML});
                                    }else{
                                        masGetValues.push({"nodeRef":this.curItems[key].item.id,"name":this.curItems[key].item.textContent});
                                    }
                                }
                                return masGetValues;
                            }
                            return null;
                   },
           getValuesNodeRef: function getValuesNodeRef(){
                           if(!this.isEmpty(this.curItems)){
                               var masGetValues = new Array();
                               for(key in this.curItems){
                                   masGetValues.push(this.curItems[key].item.id);
                               }
                               return masGetValues;
                           }
                           return null;
                   },
           getValuesName: function getValuesName(){
                          if(!this.isEmpty(this.curItems)){
                              var masGetValues = new Array();
                              for(key in this.curItems){
                                  masGetValues.push(this.curItems[key].item.textContent);
                              }
                              return masGetValues;
                          }
                          return null;
                  },
           pressOk: function ObjectWindowChoiceItem_pressOk() {
                            this.onOk.fire();
                   },
           isEmpty: function ObjectWindowChoiceItem_isEmpty(obj) {
                            return Object.keys(obj).length === 0;
                   },
           //Функция проверяет находится ли value в массиве array
           inArray: function ObjectWindowChoiceItem_inArray(value, array){
                        for(var i = 0; i < array.length; i++)
                        {
                            if(array[i] == value) return true;
                        }
                           return false;
                   },
           setCurrentItem: function ObjectWindowChoiceItem_setCurrentItem(item, icon){
                        this.curItem.item = item;
                        this.curItem.tdIcon = icon;
                   },
           setValue: function ObjectWindowChoiceItem_setValue(nodeRef, name){
                        this.value = {nodeRef:nodeRef, name:name.replace(/(^\s+|\s+$)/g,'')};
                        this.oldValue = {nodeRef:nodeRef, name:name.replace(/(^\s+|\s+$)/g,'')};
                   },
           setValues: function ObjectWindowChoiceItem_setValue(items){
                        if(items!=null & items!=""){
                            this.values = {};
                            this.curItems = {};
                            for(i = 0, j = items.length; i < j; i++){
                                this.values[items[i].nodeRef] = items[i].name;
                            }
                        }
                   },
           renderCurrentValue: function ObjectWindowChoiceItem_renderCurrentValue(){
                        if(this.options.single){
                            if(this.value != null && !this.isEmpty(this.value))
                                this.curItem = this.createPicker(this.value.nodeRef,this.value.name,{},this.tBodyRight,this.iconDelete,"");
                        }else{
                            if(!this.isEmpty(this.values)){
                                for(key in this.values){
                                   this.curItems[key] = this.createPicker(key,this.values[key],{},this.tBodyRight,this.iconDelete,"");
                                }
                            }
                        }
                   },
           getOldValue: function ObjectWindowChoiceItem_getOldValue(){
                        if(this.value.nodeRef != this.oldValue.nodeRef)
                            return this.oldValue;
                        return null;
                   },
           getData: function ObjectWindowChoiceItem_getData(){
                        if(!this.isEmpty(this.curItem))
                            return this.curItem.item.itemData;
                        return null;
                   },
           showLoading: function showLoading(){
                Dom.setStyle(this.loadingDiv, 'display', 'block');
           },
           hideLoading: function hideLoading(){
                Dom.setStyle(this.loadingDiv, 'display', 'none');
           }

       });
})();