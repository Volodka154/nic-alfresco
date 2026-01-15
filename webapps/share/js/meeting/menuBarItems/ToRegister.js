/**
 * Created by nabokov on 18.11.2016.
 */
define(["dojo/_base/declare",
    "./_MenuBarItem"
], function (declare, MenuBarItem) {
    return declare([MenuBarItem], {
        label: "Зарегистрировать",
        publishTopic: "MEETING_TO_REGISTER_EVENT",
    });
});