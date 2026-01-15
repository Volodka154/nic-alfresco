/**
 * Created by nabokov on 13.12.2016.
 */
define(["dojo/_base/declare",
        "./_AlfCreateContentMenuBarItem",
        "./_mixinIsReadOnly"
    ],
    function(declare, AlfCreateContentMenuBarItem, _mixinIsReadOnly) {

        return declare([AlfCreateContentMenuBarItem, _mixinIsReadOnly], {
            label: "Загрузить новую версию",
            currentNode:{
                node:{
                    nodeRef: null,
                },
                parent:{
                    nodeRef: null,
                }
            },

            postMixInProperties: function () {
                this.inherited(arguments);
            },

            metaSelectDocument: function (payload) {
                if(payload.item.status != ""){
                    this.setVisibly(false);
                }else {
                    this.setVisibly(true);
                }
            },

            onClick: function (evt) {
                if(this.selectedRowNode.nodeRef) {
                    this.currentNode.node.nodeRef = this.selectedRowNode.nodeRef;
                    this.inherited(arguments);
                }
            }
        });

    });