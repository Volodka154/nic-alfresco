/**
 * Created by nabokov on 02.12.2016.
 */
define(["dojo/_base/declare",
    "./_MenuBarItem"
], function (declare, MenuBarItem) {
    return declare([MenuBarItem], {
        label: "Зарегистрировать и отправить на исполнение",
        publishTopic: "MEETING_REGISTER_AND_SEND_TO_EXECUTE",
    });
});