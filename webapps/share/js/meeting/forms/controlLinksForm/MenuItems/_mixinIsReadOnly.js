define([
    "dojo/_base/declare",
    "dojo/topic",
    "dojo/_base/lang"
], function (declare, topic, lang) {

    return declare(null, {

        postMixInProperties: function () {
            this.alfSubscribe(this.pubSubScope + "IS_READ_ONLY_ATTACHMENTS", lang.hitch(this, this.isReadOnly), true);
            this.inherited(arguments);
        },
        isReadOnly: function (payload) {
            this.setVisibly(false);
        }
    });
});