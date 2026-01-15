define(["dojo/_base/declare",
    "./_MenuBarItem"
], function (declare, MenuBarItem) {
    return declare([MenuBarItem], {
        label: "Отменить подписание",
        publishTopic: "MEETING_CANCEL_SIGNER",
    });
});