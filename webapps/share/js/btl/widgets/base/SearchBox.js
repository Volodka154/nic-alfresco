define(["dojo/_base/declare",
        "btl/widgets/base/TextBox",
        "dojo/text!./templates/SearchBox.html",
        "dojo/on",
        "dojo",
        ], function (declare, TextBox, template, on, dojo) {
    return declare([TextBox ], {
        templateString: template,
        per_page: 5,          //колличество подсказок
        page_num: 1,
        countSymbolBiforeHint: 2, // после какого колличества введеных символов появиться подсказка
        dataUrl:"",
        url: "",
        objNodeRefTextBox: null,
        objBtnCleanValue: null,
        style:{ width: "290px" },

        postCreate: function () {
            this.inherited(arguments);
            this.inputField = this.domNode.querySelector('input[name="' + this.name + '"]');
            this.inputField.addEventListener("keydown", this.eventKeyDown.bind(this), true);
            this._listValue.addEventListener("mouseover", this.eventMouseOver.bind(this));
            var handleInput = on(this.domNode, "input", this.eventInput.bind(this));
            var handleBlur = on(this.inputField, "blur", this.eventBlur.bind(this));
           // var handleFocus = on(this.inputField, "focus", this.eventFocus.bind(this));
            var handleListValueClick = on(this._listValue, "mousedown", this.eventListValueClick.bind(this));
        },
        eventMouseOver: function (event) {
            var target = event.target;
            if(!target.classList.contains('selected')){
                var node = this._listValue.querySelector('.selected');
                if(node){
                    node.classList.remove('selected');
                }
                target.classList.add('selected');
            }
        },
        eventKeyDown: function (event) {
            //key Down
            if(event.keyCode == 40){
                var node = this.getSelectedHint();
                if(node) {
                    node.classList.remove('selected');
                    if(node.nextElementSibling) {
                        node.nextElementSibling.classList.add('selected');
                    }else{
                        this._listValue.firstChild.classList.add('selected');
                    }
                }else{
                	if (this._listValue.firstChild)
                	{
                		this._listValue.firstChild.classList.add('selected');
                	}
                	else
            		{
                		this.getHints("");
            		}
                	
                }
                event.preventDefault();
            }
            //key Up
            if(event.keyCode == 38){
                var node = this.getSelectedHint();
                if(node) {
                    node.classList.remove('selected');
                    if(node.previousElementSibling) {
                        node.previousElementSibling.classList.add('selected');
                    }else{
                        this._listValue.lastChild.classList.add('selected');
                    }
                }else {
                    this._listValue.lastChild.classList.add('selected');
                }
                event.preventDefault();
            }
            //key Enter
            if(event.keyCode == 13){
                var node = this.getSelectedHint();
                if(node) {
                    this.setValueSearchBox(node.getAttribute("name"), node.getAttribute("nodeRef"));
                }
                event.preventDefault();
            }

        },
        getSelectedHint: function () {
            var selected = this._listValue.querySelector('.selected');
            if(selected){
                return selected;
            }
            return null;
        },
        eventFocus: function () {
            if(this._listValue.innerHTML != "" && this.inputField.length >= this.countSymbolBiforeHint) {
                this._listValue.style.display = "block";
            }
        },
        eventBlur: function (event) {
            if(!this.objNodeRefTextBox.getValue()){
                this.inputField.value = "";
                this.objBtnCleanValue.setDisabled(true);
                /*
                if (this.getParent() && this.getParent().getParent() && typeof this.getParent().getParent().validateFormControlValue == "function")
                	this.getParent().getParent().validateFormControlValue();
               */
            }
            this._listValue.style.display = "none";
        },
        eventInput: function (event) {
            this._listValue.innerHTML = "";
            this.objNodeRefTextBox.setValue("");
            if(event.target.value.length >= this.countSymbolBiforeHint){
                this.getHints(encodeURI(event.target.value));
            }
        },
        eventListValueClick: function (event) {
            this.setValueSearchBox(event.target.getAttribute("name"), event.target.getAttribute("nodeRef"));
        },
        setValueSearchBox: function (name, nodeRef) {
            this.alfPublish(this.parentID + "_BTL_CLICK_HINT",{
                "name": name,
                "nodeRef": nodeRef
            },true);
            this._listValue.innerHTML = "";
            this._listValue.style.display = "none";
        },
        getHints: function (q_word) {
            var _this = this;
            var xhrArgs = {
                url: this.url,
                handleAs: "json",
                content: {
                    per_page: this.per_page,
                    page_num: this.page_num,
                    type: this.dataUrl.type,
                    field: this.dataUrl.field,
                    s_field: this.dataUrl.s_field,
                    extra: this.dataUrl.extra,
                    filter:this.dataUrl.filter,
                    nodeRef:this.dataUrl.nodeRef,
                    q_word: q_word
                },
                load: function(data){
                    _this.showHints(data.result);
                },
                error: function(error){

                }
            };
            if(!this.dataUrl.type || !this.dataUrl.field || !this.dataUrl.s_field){
                alert("Не верные параметры поика");
            }else {
                var deferred = dojo.xhrGet(xhrArgs);
            }
        },
        showHints: function (hints) {
        	this.cleanList();
            var list = this._listValue;
            list.style.display = "block";
            hints.forEach(function(hint) {
                var li = list.appendChild(document.createElement('li'));
                li.setAttribute("nodeRef", hint.nodeRef);
                li.setAttribute("name", hint.name);
                li.setAttribute("title", hint.name);
                li.innerHTML = hint.name;
            });
        },
        cleanList: function () {
            this._listValue.innerHTML = '';
        }

    });

});