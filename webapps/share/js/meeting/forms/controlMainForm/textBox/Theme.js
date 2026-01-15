/**
 * Created by nabokov on 28.11.2016.
 */
define(["dojo/_base/declare",
    "../../../textBox/_TextBox"
], function (declare, TextBox) {
    return declare([TextBox], {
        name: "prop_btl-meeting_theme",
        label: "Тема",
        value: ""
    });
});