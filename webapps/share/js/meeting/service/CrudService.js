/**
 * Created by nabokov on 02.12.2016.
 */
define(["dojo/_base/declare",
        "alfresco/services/CrudService",
        "dojo/_base/lang",
        "alfresco/core/topics",
       ],
    function(declare, CrudService, lang, topics) {

        return declare([CrudService], {

            refreshRequest: function alfresco_services_CrudService__refreshRequest(response, originalRequestConfig) {
                var responseTopic = lang.getObject("alfTopic", false, originalRequestConfig);
                if (responseTopic) {
                    //this.alfPublish(responseTopic + "_SUCCESS", response, true);
                    this.alfPublish(responseTopic + "__SUCCESS", originalRequestConfig, true);
                } else {
                    this.alfLog("warn", "It was not possible to publish requested CRUD data because the 'responseTopic' attribute was not set on the original request", response, originalRequestConfig);
                }

                var message = lang.getObject("successMessage", false, originalRequestConfig);
                if (!message) {
                    message = "crudservice.generic.success.message";
                }

                this.alfServicePublish(topics.DISPLAY_NOTIFICATION, {
                    message: this.message(message)
                });

                var noRefresh = lang.getObject("data.noRefresh", false, originalRequestConfig);
                if (noRefresh !== true)
                {
                    // See AKU-1020
                    // Check the original request for a "createdItemKey" attribute, this will be passed on in
                    // the reload data request to give the list an opportunity to select the created item...
                    var payload = null;
                    if (originalRequestConfig.createdItemKey)
                    {
                        var itemKey = lang.getObject(originalRequestConfig.createdItemKey, false, response);
                        if (itemKey)
                        {
                            payload = {
                                focusItemKey: itemKey
                            };
                        }
                    }
                   // this.alfPublish("ALF_DOCLIST_RELOAD_DATA", payload, false, false, originalRequestConfig.responseScope);
                }
            },
            requestDeleteConfirmation: function alfresco_services_CrudService__requestDeleteConfirmation(url, payload) {
                var responseTopic = this.generateUuid();
                this._deleteHandle = this.alfSubscribe(responseTopic, lang.hitch(this, this.onDeleteConfirmation), true);

                var title = payload.confirmationTitle || "crudservice.generic.delete.title";
                var prompt = payload.confirmationPrompt || "crudservice.generic.delete.prompt";
                var confirmButtonLabel = payload.confirmationButtonLabel || "crudservice.generic.delete.confirmationButtonLabel";
                var cancelButtonLabel = payload.cancellationButtonLabel || "crudservice.generic.delete.cancellationButtonLabel";

                this.alfServicePublish(topics.CREATE_DIALOG, {
                    dialogId: "ALF_CRUD_SERVICE_DELETE_CONFIRMATION_DIALOG",
                    dialogTitle: this.message(title),
                    textContent: this.message(prompt),
                    widgetsButtons: [
                        {
                            id: "ALF_CRUD_SERVICE_DELETE_CONFIRMATION_DIALOG_CONFIRM",
                            name: "alfresco/buttons/AlfButton",
                            config: {
                                label: this.message(confirmButtonLabel),
                                publishTopic: responseTopic,
                                publishPayload: {
                                    url: url,
                                    responseScope: payload.alfResponseScope,
                                    responseTopic: payload.responseTopic,
                                    data: payload,
                                    successMessage: this.message(payload.successMessage || "crudservice.generic.success.message"),
                                    failureMessage: this.message(payload.failureMessage || "crudservice.generic.failure.message")
                                }
                            }
                        },
                        {
                            id: "ALF_CRUD_SERVICE_DELETE_CONFIRMATION_DIALOG_CANCEL",
                            name: "alfresco/buttons/AlfButton",
                            config: {
                                label: this.message(cancelButtonLabel),
                                publishTopic: "close"
                            }
                        }
                    ]
                });
            },

        });
    });