/**
 * Created by nabokov on 24.11.2016.
 */
define(["dojo/_base/declare",
    "./_MenuBarItem"
], function (declare, MenuBarItem) {
    return declare([MenuBarItem], {
        label: "Выбрать переговорную",
        publishTopic: "BTL_CREATE_FORM_MEETINGS_SELECT_ROOMS"
    });
});