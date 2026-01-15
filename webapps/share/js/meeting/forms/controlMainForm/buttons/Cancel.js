/**
 * Created by nabokov on 25.11.2016.
 */
define(["dojo/_base/declare",
    "../../../buttons/_Button",
    "dojo/_base/lang",
], function (declare, DateTextBox, lang) {
    return declare([DateTextBox], {
        label: "Отмена",
        publishTopic: "CANCEL_MEETING_EVENT",
        publishGlobal: true
    });
});