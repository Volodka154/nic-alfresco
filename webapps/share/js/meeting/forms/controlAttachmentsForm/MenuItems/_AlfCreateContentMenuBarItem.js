/**
 * Created by nabokov on 13.12.2016.
 */
define(["dojo/_base/declare",
        "alfresco/documentlibrary/AlfCreateContentMenuBarItem",
        "./_mixinExtensionBarItem"
    ],
    function(declare, AlfCreateContentMenuBarItem, _mixinSubscribeBarItem) {

        return declare([AlfCreateContentMenuBarItem, _mixinSubscribeBarItem], {
            iconClass: "alf-upload-icon",
            publishTopic: "ALF_SHOW_UPLOADER",
            currentNode:{
                parent:{
                    nodeRef: null,
                }
            },

            postCreate: function alfresco_documentlibrary_UploadButton__postCreate() {
                this.currentNode.parent.nodeRef = (this.documentNodeRef)? this.documentNodeRef : null;
                this.inherited(arguments);
            },

            onClick: function alfresco_documentlibrary_UploadButton__onClick(evt) {
                this.alfPublish(this.publishTopic, this.currentNode, this.publishGlobal, this.publishToParent);
            }
        });

    });