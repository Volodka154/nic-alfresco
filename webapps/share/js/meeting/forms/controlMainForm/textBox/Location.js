/**
 * Created by nabokov on 22.11.2016.
 */
define(["dojo/_base/declare",
    "../../../textBox/_TextBox"
], function (declare, TextBox) {
    return declare([TextBox], {
        name: "prop_btl-meeting_room-content",
        label: "Место проведения",
        value: "",
        requirementConfig: {
            initialValue: true
        }
    });
});