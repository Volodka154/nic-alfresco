/**
 * Created by nabokov on 24.01.2017.
 */
define(["dojo/_base/declare",
    "alfresco/forms/controls/TextArea",
    "dojo/_base/lang",
    "dojo/dom-style"

], function (declare, TextArea, lang, domStyle) {
    return declare([TextArea], {
        label: "Адрес",
        name: "prop_btl-person_address",
        nodeStyle:{
            width: "280px",
            height: "145px"
        },

        completeWidgetSetup: function () {
            this.inherited(arguments);
            var textarea = this._controlNode.querySelector('textarea');
            if (this.nodeStyle && textarea){
                domStyle.set(textarea, this.nodeStyle);
            }
        },
    });
});