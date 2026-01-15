/**
 * Created by nabokov on 21.11.2016.
 */
define(["dojo/_base/declare",
    "../../../dateTextBox/_TimeTextBox"
], function (declare, DateTextBox) {
    return declare([DateTextBox], {
        label: "Начало",
        name: "prop_btl-meeting_startDate",
        requirementConfig: {
            initialValue: false
        }
    });
});