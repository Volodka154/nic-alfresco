define(["dojo/_base/declare",
    "./_MenuBarItem"
], function (declare, MenuBarItem) {
    return declare([MenuBarItem], {
        label: "На согласование",
        publishTopic: "MEETING_TO_NEGOTIATION",
    });
});