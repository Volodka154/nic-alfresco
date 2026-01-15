define([
    "dojo/_base/declare",
    "dojo/dom-construct",
    "dojo/text!./templates/MenuItemLink.html",
    "dijit/MenuBarItem"
], function(declare, domConstruct, template,  MenuBarItem) {

    return declare([MenuBarItem], {
        templateString: template,
        hrefLink: "",
        classLink: "",
        label: "",
        iconUrl: "",

        postCreate: function(){
            var domNode = this.domNode;
            this.link = domConstruct.toDom("<a></a>");
            this.link.href = this.hrefLink;
            domConstruct.place(this.link, domNode);
            this.endPostCreate();
        },

        setVisibly: function (isVisibly) {
            if(isVisibly){
                this.domNode.style.display = "inline-block";
            }else{
                this.domNode.style.display = "none";
            }
        },

        endPostCreate: function () {

        },

        onClick: function(e){
            if(this.disabled){
                e.stopPropagation();
                e.preventDefault();
                return false;
            }
            return true;
        },
    });
});