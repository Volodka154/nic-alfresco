/**
 * Created by nabokov on 21.11.2016.
 */
define(["dojo/_base/declare",
    "btl/widgets/base/TextBox",
    "dojo/dom-class",
    "dojo/dom-style",
    "meeting/utils/base"
], function (declare, TextBox, domClass, domStyle, utilBase) {
    return declare([TextBox], {
        style:{
            width: "300px"
        },
        postCreate: function () {
            if(!this.value && this.storeId) {
                var store = utilBase.getStoreById(this.storeId);
                if (store.document) {
                    this.setValue(store.document.properties[this.name]);
                }
            }
            this.inherited(arguments);
        },
        showValidationFailure: function () {
            if (this.showValidationErrorsImmediately || (this._hadFocus || this._hadUserUpdate))
            {
                domClass.add(this.domNode, "alfresco-forms-controls-BaseFormControl--invalid");
                this.domNode.style.background = "";
            }
            else
            {
                this._pendingValidationFailureDisplay = true;
            }
        }
    });
});