
(function()
{
    var Dom = YAHOO.util.Dom,
    Event = YAHOO.util.Event;
    var RegExNumber=/^([0-9]+)$/; //только цифры

    Alfresco.WindowChoiceContactor = function BTL_WindowChoiceContactor(htmlId){
        Alfresco.WindowChoiceContactor.superclass.constructor.call(this, htmlId, []);
        // Re-register with our own name
        this.name = "Alfresco.WindowChoiceContactor";
        Alfresco.util.ComponentManager.reregister(this);
        return this;
    };
    YAHOO.extend(Alfresco.WindowChoiceContactor, Alfresco.WindowChoiceItem,
    {
        inputINN:null,
        inputKPP:null,
        extra:{},
        onReady: function ObjectWindowChoiceContactor_onReady()
        {
            Alfresco.WindowChoiceContactor.superclass.dialogCreate.call(this);
            this.editForm();
            this.setEvents();
            this.options.dataUrl.classes = "body_table_choice_contractor";
            this.options.dataUrl.type = "btl-contr:contractor-folder";
            this.options.dataUrl.field = "name,inn,kpp";
            this.options.dataUrl.extra = "";
        },
        inputEvent: function inputEvent(){
             Event.on(this.input,"input",function(e,obj){
                 this.options.dataUrl.q_word = encodeURI(this.input.value);
                 this.cleanData();
                 if(this.input.value.length > 2 || this.input.value.length == 0){
                    this.getPageData();
                 }else{
                    this.tBodyLeft.innerHTML = "Введите не менее 3-х символов.";
                 }

             },this,true);
        },
        setEvents: function ObjectWindowChoiceContactor_setEvents(){
             Alfresco.WindowChoiceContactor.superclass.setEvents.call(this);
             Event.on(this.inputINN,"input",function(e,obj){
                 if(this.inputINN.value.length == 0 || RegExNumber.test(this.input.value)){
                     if("inn" in this.extra)
                     {
                        if(this.inputINN.value !=""){
                            this.extra.inn = this.inputINN.value;
                        }else{
                            delete this.extra.inn;
                        }
                     }else{
                        if(this.inputINN.value !="")
                            this.extra["inn"] = this.inputINN.value;
                     }

                     this.options.dataUrl.extra = "";

                     if("inn" in this.extra && this.extra.inn!="")
                        this.options.dataUrl.extra = " @btl\\-contr:inn:" + this.extra.inn+"*";
                     if("kpp" in this.extra && this.extra.kpp!="")
                        this.options.dataUrl.extra += (this.options.dataUrl.extra)? " AND @btl\\-contr:kpp:" + this.extra.kpp+"*" : "@btl\\-contr:kpp:" + this.extra.kpp+"*";


                     this.cleanData();
                     this.getPageData();
                 }else{

                 }
             },this,true);

             Event.on(this.inputKPP,"input",function(e,obj){
                  if("kpp" in this.extra)
                  {
                     if(this.inputKPP.value !=""){
                         this.extra.kpp = this.inputKPP.value;
                     }else{
                         delete this.extra.kpp;
                     }
                  }else{
                     if(this.inputKPP.value !="")
                         this.extra["kpp"] = this.inputKPP.value;
                  }

                  this.options.dataUrl.extra = "";

                  if("inn" in this.extra && this.extra.inn!="")
                     this.options.dataUrl.extra = " @btl\\-contr:inn:" + this.extra.inn+"*";
                  if("kpp" in this.extra && this.extra.kpp!="")
                     this.options.dataUrl.extra += (this.options.dataUrl.extra)? " AND @btl\\-contr:kpp:" + this.extra.kpp+"*" : "@btl\\-contr:kpp:" + this.extra.kpp+"*";

                 this.cleanData();
                 this.getPageData();
             },this,true);

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

             var onlyNum  = function(e) {
                 e = e || event;
                 if (e.ctrlKey || e.altKey || e.metaKey) return;
                 var chr = getChar(e);
                 if (chr == null) return;
                 if (chr < '0' || chr > '9') {
                   return false;
                 }
             };
             this.inputKPP.onkeypress = onlyNum;
             this.inputINN.onkeypress = onlyNum;
        },
        editForm: function ObjectWindowChoiceContactor_editForm(){
            var inputINN = document.createElement('input');
            inputINN.style.width = "250px";
            inputINN.setAttribute("placeholder", "ИНН");
            var inputKPP = document.createElement('input');
            inputKPP.style.width = "250px";
            inputKPP.setAttribute("placeholder", "КПП");
            this.input.style.width = "320px";
            this.input.setAttribute("placeholder", "Название");
            var parentDiv = this.input.parentNode;
            parentDiv.insertBefore(inputINN, this.input.nextSibling);
            parentDiv.insertBefore(inputKPP, inputINN.nextSibling);
            this.inputINN = inputINN;
            this.inputKPP = inputKPP;

            var leftTHead = document.createElement('div');
            var leftTHeadTdName = document.createElement('span');
            leftTHeadTdName.innerHTML = "Название";
            leftTHeadTdName.className  = "head_table_choice_contractor";
            leftTHeadTdName.setAttribute("style","margin-left:15px;");
            var leftTHeadTdInn = document.createElement('span');
            leftTHeadTdInn.innerHTML = "ИНН";
            leftTHeadTdInn.className  = "head_table_choice_contractor";
            var leftTHeadTdKpp = document.createElement('span');
            leftTHeadTdKpp.innerHTML = "КПП";
            leftTHeadTdKpp.className  = "head_table_choice_contractor";
            leftTHead.appendChild(leftTHeadTdName);
            leftTHead.appendChild(leftTHeadTdInn);
            leftTHead.appendChild(leftTHeadTdKpp);
            var parentLeftTable = this.tBodyLeft.parentNode;
            parentLeftTable.insertBefore(leftTHead, this.tBodyLeft);
            var parentRightTable = this.tBodyRight.parentNode;
            var rightTHead = leftTHead.cloneNode(true);
            parentRightTable.insertBefore(rightTHead, this.tBodyRight);
        }
    });
    })();