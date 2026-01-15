/**
 * Created by nabokov on 21.11.2016.
 */
define(["dojo/_base/declare",
    "../../../dateTextBox/_DateTextBox"
], function (declare, DateTextBox) {
    return declare([DateTextBox], {
        label: "Дата регистрации",
        name: "prop_btl-meeting_regDate",
        disablementConfig : {
            initialValue: true
        }
    });
});