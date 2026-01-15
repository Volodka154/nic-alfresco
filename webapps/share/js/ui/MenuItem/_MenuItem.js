define([
    "dojo/_base/declare",
    "dojo/text!./templates/MenuItem.html",
    "dijit/MenuBarItem",
    "./_GetRowMixin"
], function(declare, template, MenuBarItem, _GetRowMixin) {

    return declare([MenuBarItem, _GetRowMixin], {
        templateString: template,
        iconClass: "dijitNoIcon",
        _setIconClassAttr: { node: "iconNode", type: "class" },
        onlyAdmin: false,
        isAdmin: false,

        postCreate: function(){
            if(this.onlyAdmin){
                this.isAdminFunc();
            }
            this.endPostCreate();
        },

        endPostCreate: function () {

        },

        setVisibly: function (isVisibly) {
            if(this.onlyAdmin){
                if(this.isAdmin){
                    if (isVisibly) {
                        this.domNode.style.display = "inline-block";
                    } else {
                        this.domNode.style.display = "none";
                    }
                }else {
                    this.domNode.style.display = "none";
                }
            }else {

                if (isVisibly) {
                    this.domNode.style.display = "inline-block";
                } else {
                    this.domNode.style.display = "none";
                }
            }
        },

        onClick: function(e){
            if(this.disabled){
                e.stopPropagation();
                e.preventDefault();
                return false;
            }
            return true;
        },

        isAdminFunc: function () {
            var _this = this;
            Alfresco.util.Ajax.request({
                method: "GET",
                url: Alfresco.constants.PROXY_URI + "groupPermision?user=" + Alfresco.constants.USERNAME + "&group=ALFRESCO_ADMINISTRATORS",
                successCallback: {
                    fn: function addPropetries(complete) {
                        if (complete.json.result == "true") {
                            _this.isAdmin = true;
                        }
                    },
                    scope: this
                }
            });
        }
    });
});