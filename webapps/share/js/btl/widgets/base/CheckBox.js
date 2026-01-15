/**
 * Created by nabokov on 12.01.2017.
 */
define(["dojo/_base/declare",
        "alfresco/forms/controls/CheckBox",
        "./_validationMixin"],
    function(declare, Select, _validationMixin) {

        return declare([Select, _validationMixin], {});
    });