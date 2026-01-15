/**
 * Created by nabokov on 22.11.2016.
 */
define(["dojo/_base/declare",
    "../../../dateTextBox/_DateTimeTextBox"
], function (declare, DateTextBox) {
    return declare([DateTextBox], {
        label: "Окончание",
        name: "prop_btl-meeting_endDate",
        //position: "vertical",
        requirementConfig: {
            initialValue: false
        }
    });
});