define(["dojo/_base/declare",
        "alfresco/core/Core",
        "dojo/_base/lang",
        "alfresco/core/CoreXhr",
        "service/constants/Default",
        "alfresco/dialogs/AlfDialog",
        "alfresco/core/topics"],
    function (declare, Core, lang, CoreXhr, AlfConstants, AlfDialog, topics) {

        return declare([Core, CoreXhr], {

            constructor: function btl_ContractorService__constructor(args) {
                lang.mixin(this, args);
                this.alfSubscribe("BTL_CREATE_CONTACTOR", lang.hitch(this, this.createContractor));
                this.alfSubscribe("BTL_EDIT_CONTACTOR", lang.hitch(this, this.editContractor));
                this.alfSubscribe("BTL_CREATE_CONTACT_PERSON", lang.hitch(this, this.createContactPerson));
                this.alfSubscribe("BTL_EDIT_CONTACT_PERSON", lang.hitch(this, this.editContactPerson));
                this.alfSubscribe("BTL_UPDATE_GRID_DATA", lang.hitch(this, this.updateGridData));
                this.alfSubscribe("BTL_DELETE_PERSON", lang.hitch(this, this.deletePerson));
                this.alfSubscribe("BTL_MSG_DELETE_DIALOG", lang.hitch(this, this.requestDeleteConfirmation));
                this.alfSubscribe("BTL_SING_REMOVE_CONTACTOR", lang.hitch(this, this.signRemoveContactor));
                this.alfSubscribe("BTL_SING_REMOVE_CONTACT_PERSON", lang.hitch(this, this.signRemoveContactPerson));
            },

            currentNodeRef: null,
            currentPubSubScope: null,
            newContactPerson: {},

            createContractor: function btl_ContractorService__createContractor(payload) {
                this.alfLog("log", "btl_ContractorService__createContractor", payload);
                this.serviceXhr({
                    url: "/share/proxy/alfresco/api/type/btl-contr%3acontractor-folder/formprocessor",
                    method: "POST",
                    data: {
                        "alf_destination": payload.alf_destination,
                        //"prop_cm_name": payload["prop_btl-contr_name"] ,
                        "prop_btl-contr_name": payload["prop_btl-contr_name"],
                        "prop_btl-contr_director": payload["prop_btl-contr_director"],
                        "prop_btl-contr_phone": payload["prop_btl-contr_phone"],
                        "prop_btl-contr_fax": payload["prop_btl-contr_fax"],
                        "prop_btl-contr_email": payload["prop_btl-contr_email"],
                        "prop_btl-contr_inn": payload["prop_btl-contr_inn"],
                        "prop_btl-contr_kpp": payload["prop_btl-contr_kpp"],
                        "prop_btl-contr_information": payload["prop_btl-contr_information"],
                        "prop_btl-contr_fullname": payload["prop_btl-contr_fullname"],
                        "prop_btl-contr_type": payload["prop_btl-contr_type"],
                        "prop_btl-contr_site": payload["prop_btl-contr_site"],
                        "prop_btl-contr_address": payload["prop_btl-contr_address"],

                        "prop_btl-contr_city": payload["prop_btl-contr_city"],
                        "prop_btl-contr_region": payload["prop_btl-contr_region"],
                        "prop_btl-contr_oblast": payload["prop_btl-contr_oblast"],

                        "prop_btl-contr_notActual": payload["prop_btl-contr_notActual"],
                        "prop_btl-contr_position": payload["prop_btl-contr_position"],
                        "prop_btl-contr_date_confidentiality": (payload["prop_btl-contr_date_confidentiality"] !== null) ? payload["prop_btl-contr_date_confidentiality"] : "",
                        "prop_btl-contr_in_perpetuity": payload["prop_btl-contr_in_perpetuity"]

                    },
                    failureCallback: function (response, requestConfig) {
                        this.alfPublish(topics.DISPLAY_NOTIFICATION, {
                            message: "Ошибка при создании контрагента"
                        });
                    },
                    successCallback: payload.callbackTopic || this.updateContractorTree,
                    callbackScope: this
                });
            },

            createContactPerson: function btl_ContractorService__createContactPerson(payload) {
                this.alfLog("log", "btl_ContractorService__createContactPerson", payload);
                this.currentNodeRef = payload.alf_destination;
                this.newContactPerson.firstname = payload["prop_btl-people_firstname"];
                this.newContactPerson.middlename = payload["prop_btl-people_middlename"];
                this.newContactPerson.surname = payload["prop_btl-people_surname"];
                this.newContactPerson.position = payload["prop_btl-person_position"];
                this.newContactPerson.phone = payload["prop_btl-people_phone"];
                this.newContactPerson.fax = payload["prop_btl-people_fax"];
                this.newContactPerson.alfrescoUser_val = payload["assoc_btl-people_user_alfresco_val"];
                this.newContactPerson.alfrescoUser_ref = payload["assoc_btl-people_user_alfresco"];
                this.newContactPerson.information = payload["prop_btl-people_information"];
                this.newContactPerson.do_not_show_in_the_selection = payload["do_not_show_in_the_selection"];
                this.newContactPerson.email = payload["prop_btl-people_email"];
                this.newContactPerson.sex = payload["prop_btl-people_sex"];
                this.newContactPerson.site = payload["prop_btl-people_site"];
                this.newContactPerson.mobile = payload["prop_btl-people_mobile"];
                this.newContactPerson.birthdate = (payload["prop_btl-people_birthdate"] !== null) ? payload["prop_btl-people_birthdate"] : "";
                //this.newContactPerson.people_user_alfresco = payload["prop_btl-people_user_alfresco"];
                this.newContactPerson.date_confidentiality = (payload["prop_btl-people_date_confidentiality"] !== null) ? payload["prop_btl-people_date_confidentiality"] : "";
                this.newContactPerson.in_perpetuity = payload["prop_btl-people_in_perpetuity"];
                this.newContactPerson.address = (payload["prop_btl-person_address"]) ? payload["prop_btl-person_address"] : "";
                this.newContactPerson.city = (payload["prop_btl-person_city"]) ? payload["prop_btl-person_city"] : "";
                this.newContactPerson.region = (payload["prop_btl-person_region"]) ? payload["prop_btl-person_region"] : "";
                this.newContactPerson.oblast = (payload["prop_btl-person_oblast"]) ? payload["prop_btl-person_oblast"] : "";
                this.serviceXhr({
                    url: "/share/proxy/alfresco/api/type/btl-person%3aperson-content/formprocessor",
                    method: "POST",
                    sync: true,
                    data: {
                        "alf_destination": payload.alf_destination,
                        "prop_btl-people_firstname": payload["prop_btl-people_firstname"],
                        "prop_btl-people_middlename": payload["prop_btl-people_middlename"],
                        "prop_btl-people_surname": payload["prop_btl-people_surname"],
                        "prop_btl-person_position": payload["prop_btl-person_position"],
                        "prop_btl-people_phone": payload["prop_btl-people_phone"],
                        "prop_btl-people_fax": payload["prop_btl-people_fax"],
                        "assoc_btl-people_user_alfresco_added": payload["assoc_btl-people_user_alfresco_added"],
                        "assoc_btl-people_user_alfresco_removed": payload["assoc_btl-people_user_alfresco_removed"],
                        "prop_btl-people_information": payload["prop_btl-people_information"],
                        "prop_btl-person_close_choice": payload["prop_btl-person_close_choice"],
                        "prop_btl-people_email": payload["prop_btl-people_email"],
                        "prop_btl-people_sex": payload["prop_btl-people_sex"],
                        "prop_btl-person_site": payload["prop_btl-person_site"],
                        "prop_btl-people_mobile": payload["prop_btl-people_mobile"],
                        "prop_btl-people_birthdate": (payload["prop_btl-people_birthdate"] !== null) ? payload["prop_btl-people_birthdate"] : "",
                        //"prop_btl-people_user_alfresco": payload["prop_btl-people_user_alfresco"],
                        "prop_btl-person_date_confidentiality": (payload["prop_btl-person_date_confidentiality"] !== null) ? payload["prop_btl-person_date_confidentiality"] : "",
                        "prop_btl-person_in_perpetuity": payload["prop_btl-person_in_perpetuity"],
                        "prop_btl-person_address": payload["prop_btl-person_address"],
                        "prop_btl-person_city": payload["prop_btl-person_city"],
                        "prop_btl-person_region": payload["prop_btl-person_region"],
                        "prop_btl-person_oblast": payload["prop_btl-person_oblast"],
                    },
                    successCallback: payload.callbackTopic || this.updatePersonGrid,
                    callbackScope: this
                });
            },

            editContactPerson: function btl_ContractorService__editContactPerson(payload) {

                this.alfLog("log", "btl_ContractorService__editContactPerson", payload);
                //this.newContactPerson.rowId = payload["rowId"];
                //this.newContactPerson.position_refValue = payload["prop_btl-person_position_refValue"];
                this.newContactPerson.firstname = payload["prop_btl-people_firstname"];
                this.newContactPerson.middlename = payload["prop_btl-people_middlename"];
                this.newContactPerson.surname = payload["prop_btl-people_surname"];
                this.newContactPerson.position = payload["prop_btl-person_position"];
                this.newContactPerson.phone = payload["prop_btl-people_phone"];
                this.newContactPerson.fax = payload["prop_btl-people_fax"];
                this.newContactPerson.alfrescoUser_val = payload["assoc_btl-people_user_alfresco_val"];
                this.newContactPerson.alfrescoUser_ref = payload["assoc_btl-people_user_alfresco"];
                this.newContactPerson.information = payload["prop_btl-people_information"];
                this.newContactPerson.close_choice = payload["prop_btl-person_close_choice"];
                this.newContactPerson.email = payload["prop_btl-people_email"];
                this.newContactPerson.sex = payload["prop_btl-people_sex"];
                this.newContactPerson.mobile = payload["prop_btl-people_mobile"];
                this.newContactPerson.site = payload["prop_btl-person_site"];
                this.newContactPerson.birthdate = (payload["prop_btl-people_birthdate"] !== null) ? payload["prop_btl-people_birthdate"] : "";
                this.newContactPerson.address = (payload["prop_btl-person_address"] !== null) ? payload["prop_btl-person_address"] : "";

                this.newContactPerson.city = (payload["prop_btl-person_city"] !== null) ? payload["prop_btl-person_city"] : "";
                this.newContactPerson.region = (payload["prop_btl-person_region"] !== null) ? payload["prop_btl-person_region"] : "";
                this.newContactPerson.oblast = (payload["prop_btl-person_oblast"] !== null) ? payload["prop_btl-person_oblast"] : "";

                //this.newContactPerson.people_user_alfresco = payload["prop_btl-people_user_alfresco"];
                this.newContactPerson.date_confidentiality = (payload["prop_btl-person_date_confidentiality"] !== null) ? payload["prop_btl-person_date_confidentiality"] : "";
                this.newContactPerson.in_perpetuity = payload["prop_btl-person_in_perpetuity"];

                this.serviceXhr({
                    url: "/share/proxy/alfresco/api/node/" + payload.nodeRef.replace("://", "/") + "/formprocessor",
                    method: "POST",
                    data: {
                        "prop_btl-people_firstname": payload["prop_btl-people_firstname"],
                        "prop_btl-people_middlename": payload["prop_btl-people_middlename"],
                        "prop_btl-people_surname": payload["prop_btl-people_surname"],
                        "prop_btl-person_position": payload["prop_btl-person_position"],
                        "prop_btl-people_phone": payload["prop_btl-people_phone"],
                        "prop_btl-people_fax": payload["prop_btl-people_fax"],
                        "assoc_btl-people_user_alfresco_added": payload["assoc_btl-people_user_alfresco_added"],
                        "assoc_btl-people_user_alfresco_removed": payload["assoc_btl-people_user_alfresco_removed"],
                        "prop_btl-people_information": payload["prop_btl-people_information"],
                        "prop_btl-person_close_choice": payload["prop_btl-person_close_choice"],
                        "prop_btl-people_email": payload["prop_btl-people_email"],
                        "prop_btl-people_sex": payload["prop_btl-people_sex"],
                        "prop_btl-people_mobile": payload["prop_btl-people_mobile"],
                        "prop_btl-person_site": payload["prop_btl-person_site"],
                        "prop_btl-people_birthdate": (payload["prop_btl-people_birthdate"] !== null) ? payload["prop_btl-people_birthdate"] : "",
                        //"prop_btl-people_user_alfresco": payload["prop_btl-people_user_alfresco"],
                        "prop_btl-person_date_confidentiality": (payload["prop_btl-person_date_confidentiality"] !== null) ? payload["prop_btl-person_date_confidentiality"] : "",
                        "prop_btl-person_in_perpetuity": payload["prop_btl-person_in_perpetuity"],
                        "prop_btl-person_address": payload["prop_btl-person_address"],
                        "prop_btl-person_city": payload["prop_btl-person_city"],
                        "prop_btl-person_region": payload["prop_btl-person_region"],
                        "prop_btl-person_oblast": payload["prop_btl-person_oblast"],
                    },
                    successCallback: payload.callbackTopic || this.alfPublish("DATAGRID_EDIT_ROW_CONTACT_PERSON", this.newContactPerson),
                    callbackScope: this
                });
            },

            addContactPersonToContractor: function btl_ContractorService__addContactPersonToContractor(response, originalRequestConfig) {
                this.alfLog("log", "btl_ContractorService__addContactPersonToContractor", response);
                this.newContactPerson.nodeRef = response.persistedObject;
                this.serviceXhr({
                    url: "/share/proxy/alfresco/api/node/" + this.currentNodeRef.replace("://", "/") + "/formprocessor",
                    method: "POST",
                    sync: true,
                    data: {
                        "assoc_btl-contr_persons_added": response.persistedObject
                    },
                    successCallback: this.updatePersonGrid,
                    callbackScope: this
                });
            },

            signRemoveContactor: function btl_ContractorService__signRemoveContactor(payload) {
                this.alfLog("log", "btl_ContractorService__signRemoveContactor", payload);
                this.serviceXhr({
                    url: "/share/proxy/alfresco/api/node/" + payload.nodeRef.replace("://", "/") + "/formprocessor",
                    method: "POST",
                    sync: true,
                    data: {
                        "prop_btl-contr_notActual": "true"
                    },
                    successCallback: this.alfPublish("DATAGRID_DELETE_ROW_CONTACTOR_SUCCESS"),
                    callbackScope: this
                });
            },

            signRemoveContactPerson: function btl_ContractorService__signRemoveContactPerson(payload) {
                this.alfLog("log", "btl_ContractorService__signRemoveContactPerson", payload);
                this.serviceXhr({
                    url: "/share/proxy/alfresco/api/node/" + payload.nodeRef.replace("://", "/") + "/formprocessor",
                    method: "POST",
                    sync: true,
                    data: {
                        "prop_btl-people_notActual": "true"
                    },
                    successCallback: this.alfPublish("DATAGRID_DELETE_ROW_CONTACT_PERSON_SUCCESS"),
                    callbackScope: this
                });
            },

            deletePerson: function btl_ContractorService__deletePerson(payload) {
                this.alfLog("log", "btl_ContractorService__deletePerson", payload);
                this.serviceXhr({
                    url: "/share/proxy/alfresco/slingshot/doclib/action/files?alf_method=delete",
                    method: "POST",
                    data: {
                        nodeRefs: payload.nodeRefs
                    },
                    successCallback: this.alfPublish("DATAGRID_REFRESH_DATA"),
                    callbackScope: this
                });
            },

            updatePersonGrid: function btl_ContractorService__updatePersonGrid(response, originalRequestConfig) {

                this.alfPublish("DATAGRID_ADD_ROW_CONTACT_PERSON", {
                    nodeRef: this.newContactPerson.nodeRef,
                    firstname: this.newContactPerson.firstname,
                    middlename: this.newContactPerson.middlename,
                    surname: this.newContactPerson.surname,
                    position: this.newContactPerson.position,
                    phone: this.newContactPerson.phone,
                    fax: this.newContactPerson.fax,
                    people_user_alfresco_val: this.newContactPerson.people_user_alfresco_val,
                    people_user_alfresco_ref: this.newContactPerson.people_user_alfresco_ref,
                    email: this.newContactPerson.email,
                    information: this.newContactPerson.information,
                    close_choice: this.newContactPerson.close_choice,
                    site: this.newContactPerson.site,
                    dataIndx: this.newContactPerson.dataIndx,
                    birthdate: this.newContactPerson.birthdate,
                    //user_alfresco: this.newContactPerson.user_alfresco,
                    date_confidentiality: this.newContactPerson.date_confidentiality,
                    in_perpetuity: this.newContactPerson.in_perpetuity,
                    sex: this.newContactPerson.sex,
                    mobile: this.newContactPerson.mobile
                });
            },

            updateContractorTree: function btl_ContractorService__updateContractorTree(response, originalRequestConfig) {
                var newItem = {};
                newItem.nodeRef = response.persistedObject;
                newItem.name = originalRequestConfig.data["prop_btl-contr_name"];
                this.alfPublish("DATAGRID_ADD_ROW_CONTACTOR", newItem);
            },

            editContractor: function btl_ContractorService__editContractor(payload) {
                this.alfLog("log", "btl_ContractorService__editContractor", payload);

                this.serviceXhr({
                    url: "/share/proxy/alfresco/api/node/" + payload.nodeRef.replace("://", "/") + "/formprocessor",
                    method: "POST",
                    data: {
                        //"prop_cm_name": payload["prop_btl-contr_name"],
                        "prop_btl-contr_name": payload["prop_btl-contr_name"],
                        "prop_btl-contr_director": payload["prop_btl-contr_director"],
                        "prop_btl-contr_phone": payload["prop_btl-contr_phone"],
                        "prop_btl-contr_fax": payload["prop_btl-contr_fax"],
                        "prop_btl-contr_email": payload["prop_btl-contr_email"],
                        "prop_btl-contr_inn": payload["prop_btl-contr_inn"].replace(/\s+/g, ''),
                        "prop_btl-contr_kpp": payload["prop_btl-contr_kpp"].replace(/\s+/g, ''),
                        "prop_btl-contr_information": payload["prop_btl-contr_information"],
                        "prop_btl-contr_fullname": payload["prop_btl-contr_fullname"],
                        "prop_btl-contr_type": payload["prop_btl-contr_type"],
                        "prop_btl-contr_site": payload["prop_btl-contr_site"],
                        "prop_btl-contr_address": payload["prop_btl-contr_address"],

                        "prop_btl-contr_city": payload["prop_btl-contr_city"],
                        "prop_btl-contr_region": payload["prop_btl-contr_region"],
                        "prop_btl-contr_oblast": payload["prop_btl-contr_oblast"],

                        "prop_btl-contr_notActual": payload["prop_btl-contr_notActual"],
                        "prop_btl-contr_position": payload["prop_btl-contr_position"],
                        "prop_btl-contr_date_confidentiality": (payload["prop_btl-contr_date_confidentiality"] !== null) ? payload["prop_btl-contr_date_confidentiality"] : "",
                        "prop_btl-contr_in_perpetuity": payload["prop_btl-contr_in_perpetuity"]
                    },
                    successCallback: payload.callbackTopic || this.alfPublish("DATAGRID_EDIT_ROW_CONTACTOR", {"name": payload["prop_btl-contr_name"]}),
                    callbackScope: this
                });
            },

            requestDeleteConfirmation: function alfresco_services_CrudService__requestDeleteConfirmation(payload) {


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
                                publishTopic: payload.responseTopic,
                                publishPayload: {
                                    nodeRef: payload.nodeRef
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
            }

        });
    });