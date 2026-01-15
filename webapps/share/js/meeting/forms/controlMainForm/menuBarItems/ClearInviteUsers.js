/**
 * Created by nabokov on 24.11.2016.
 */
define(["dojo/_base/declare",
    "../../../menuBarItems/_MenuBarItem",
    "meeting/dialogs/GetEmployees",
    "meeting/utils/base",
    "dojo/_base/lang"
], function (declare, MenuBarItem, GetEmployees, utilBase, lang) {
    return declare([MenuBarItem], {
        label: "Сбросить результат приглашения",
        publishTopic: "PRESS_MEETING_CLEAR_USERS_INVITE"
        
    });
});