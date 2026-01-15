/**
 * Created by nabokov on 12.01.2017.
 */
define([
    "dojo/_base/declare",
    "alfresco/core/ObjectTypeUtils"

], function (declare, ObjectTypeUtils ) {

    return declare(null, {

        validate: function alfresco_forms_controls_BaseFormControl__validate() {
            if (this.deferValueAssigment)
            {
                // Do nothing until final value has been assigned
            }
            else if (this.validationConfig && ObjectTypeUtils.isArray(this.validationConfig))
            {
                if(this.domNode) {
                    this.startValidation();
                }
            }
            else
            {
                var isValid = this.processValidationRules();
                if (isValid)
                {
                    this.alfPublish("ALF_VALID_CONTROL", {
                        name: this.name,
                        fieldId: this.fieldId
                    });
                    this.hideValidationFailure();
                }
                else
                {
                    this.alfPublish("ALF_INVALID_CONTROL", {
                        name: this.name,
                        fieldId: this.fieldId
                    });

                    this.showValidationFailure();
                }
            }
        },
    });
});