/**
 * Created by nabokov on 05.12.2016.
 */
define(["dojo/_base/declare",
    "../../../menuBarItems/_MenuBarItem",
    "dojo/_base/lang"
], function (declare, MenuBarItem, lang) {
    return declare([MenuBarItem], {
        label: "Изменить протокол",
        publishTopic: "ALF_EDIT_PROTOCOL",
        publishPayloadType: "PROCESS",
        publishGlobal: true
    });
});