/**
 * Created by nabokov on 01.09.2016.
 */
define([
    "dojo/_base/declare",
    "./BaseAttachMenuBar",
    "../MenuItem/EditOnlineAttachmentsMenuItem"
    ],function(declare, MenuBar, EditOnlineAttachmentsMenuItem) {

    return declare([MenuBar], {
        addButtons: function () {
            this.inherited(arguments);
            this.EditOnlineAttachments = new EditOnlineAttachmentsMenuItem({
                gridId: this.gridId
            });
            this.addChild(this.EditOnlineAttachments, 2);
        },
        setStageBase: function () {
            this.inherited(arguments);
            this.EditOnlineAttachments.setVisibly(false);
        },
        setStageRootNode: function () {
            this.inherited(arguments);
            this.EditOnlineAttachments.setVisibly(true);
        },
        setStageBlockingRootNode: function () {
            this.inherited(arguments);
            this.EditOnlineAttachments.setVisibly(false);
        },
        setStageVersionNode: function () {
            this.inherited(arguments);
            this.EditOnlineAttachments.setVisibly(false);
        },
        setStageNotVisible: function () {
            this.inherited(arguments);
            this.EditOnlineAttachments.setVisibly(false);
        },
        setStageSignedNode: function () {
            this.inherited(arguments);
            this.EditOnlineAttachments.setVisibly(false);
        }

    })
});