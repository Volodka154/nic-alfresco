/**
 * Created by nabokov on 21.11.2016.
 */
define(["dojo/_base/declare",
    "alfresco/forms/DynamicForm",
    "dojo/_base/lang"

], function (declare, DynamicForm, lang) {

    return declare([DynamicForm], {
        displayButtons: false, //не отображать кнопки на форме
        isValidFormValuesPublishTopic: "",
        isValidFormValuesPublishGlobal: true,

        publishFormValidity: function alfresco_forms_Form__publishFormValidity() {
            var isValid = this.invalidFormControls.length === 0,
                autoSavePayload;

            this.alfPublish("ALF_FORM_VALIDITY", {
                valid: isValid,
                invalidFormControls: this.invalidFormControls
            });

            if(this.isValidFormValuesPublishTopic) {
                this.alfPublish(this.isValidFormValuesPublishTopic, {
                    valid: isValid
                }, this.isValidFormValuesPublishGlobal);
            }

            if(this._formSetupComplete === true &&
                this._readyToAutoSave === true &&
                this.autoSavePublishTopic &&
                typeof this.autoSavePublishTopic === "string" &&
                (isValid || this.autoSaveOnInvalid)) {

                autoSavePayload = lang.mixin(this.autoSavePublishPayload || {}, {
                    alfValidForm: isValid
                });

                $.extend(true, autoSavePayload, this.getValue());

                this.alfPublish(this.autoSavePublishTopic, autoSavePayload, this.autoSavePublishGlobal);
            }
        },
    });
});