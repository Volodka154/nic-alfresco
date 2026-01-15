/**
 * Created by nabokov on 27.12.2016.
 */
define([
    "dojo/_base/declare",
    "dojo/topic",
    "dojo/_base/lang",
    "dojo/date/stamp",
], function (declare, topic, lang, stamp) {

    return declare(null, {

        postMixInProperties: function () {
            this.alfSubscribe(this.pubSubScope + "_valueChangeOf_RESERVATION_DATE_CHANGE", lang.hitch(this, this.changeDate), true, true);
            this.inherited(arguments);
        },
        changeDate: function (payload) {
            if(payload.value) {
                var buf = payload.value.split('-');
                var newDate = new Date(Number(buf[0]), Number(buf[1]) - 1, Number(buf[2]));
                this.dateValue = newDate;
            }
        }
    });
});