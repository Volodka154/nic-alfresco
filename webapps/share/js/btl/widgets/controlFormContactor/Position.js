/**
 * Created by nabokov on 28.12.2016.
 */
define(["dojo/_base/declare",
    "alfresco/forms/controls/TextBox",
    "dojo/_base/lang",
    "alfresco/core/CoreXhr",

], function (declare, TextBox, lang, CoreXhr) {
    return declare([TextBox, CoreXhr], {
        label: "Должность",
        name: "prop_btl-contr_position",
        disablementConfig: {
            initialValue: true,
        },

        postMixInProperties: function () {
            this.alfSubscribe(this.pubSubScope + "_valueChangeOf_CONTR_DIRECTOR", lang.hitch(this, this.changeDirector), true, true);
            this.inherited(arguments);
        },

        changeDirector: function (payload) {
            // console.log("изменился руководитель" + payload.value.nodeRef);
            if(payload.value && payload.value.nodeRef) {
                this.serviceXhr({
                    url: "/share/proxy/alfresco/get-node-properties-by-nodeRef",
                    method: "GET",
                    query: "nodeRef=" + payload.value.nodeRef,
                    successCallback: this.changePosition,
                    callbackScope: this
                });
            }else{
                this.setValue("");
            }
        },
        changePosition: function (response, originalRequestConfig) {
            var properties = response.properties;
            this.setValue(properties["prop_btl-person_position"]);
        }
    });
});