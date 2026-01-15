/**
 * Created by nabokov on 06.09.2016.
 */
define([
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_Container",
    "dijit/_TemplatedMixin",
    "dojo/text!./templates/DocECPMenuContainer.html",
    "../MenuBar/ECPAllMenuBar"
],function(declare, _WidgetBase, _Container, _TemplatedMixin, template, ECPAllMenuBar) {

    return declare([_WidgetBase, _Container, _TemplatedMixin], {
        templateString: template,
        header:"ЭЦП",
        parentNodeRef:"",

        postCreate: function(){
            this.ECPAllMenu = new ECPAllMenuBar({
                parentNodeRef: this.parentNodeRef
            });
            this.addChild(this.ECPAllMenu);
        },
        setVisibly: function (isVisibly) {
            if(isVisibly){
                this.domNode.style.display = "block";
            }else{
                this.domNode.style.display = "none";
            }
        }
    });
});