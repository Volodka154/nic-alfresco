/**
 * Created by nabokov on 02.12.2016.
 */
define(["dojo/_base/declare",
    "./_MenuBarItem"
], function (declare, MenuBarItem) {
    return declare([MenuBarItem], {
        label: "Отменить подтверждение",
        publishTopic: "MEETING_CANCEL_CONFIRM_ROOM",
    });
});