define(["dojo/_base/declare",
    "./_MenuBarItem"
], function (declare, MenuBarItem) {
    return declare([MenuBarItem], {
        label: "Отменить согласование",
        publishTopic: "MEETING_CANCEL_NEGOTIATION",
    });
});