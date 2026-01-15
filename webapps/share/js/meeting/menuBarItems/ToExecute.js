/**
 * Created by nabokov on 18.11.2016.
 */
define(["dojo/_base/declare",
    "./_MenuBarItem"
], function (declare, MenuBarItem) {
    return declare([MenuBarItem], {
        label: "На исполнение",
        publishTopic: "MEETING_SEND_TO_EXECUTE_EVENT",
    });
});