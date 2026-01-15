(function () {
    if (typeof BTLAB == "undefined") {
        BTLAB = {}
    }
    var createTaskIsProcessing = false;

    var changeDocState = function (docRef, stateName, successCallback) {
        Alfresco.util.Ajax.jsonPost({
            url: Alfresco.constants.PROXY_URI + "updateNode",
            dataObj: {
                nodeRef: docRef,
                data: {
                    "prop_btl-document_state": stateName
                }
            },
            successCallback: {
                fn: successCallback
            }
        });
    };

    var createTask = function (dataObj, callback) {
        Alfresco.util.Ajax.jsonPost({
            url: Alfresco.constants.PROXY_URI + "api/workflow/activiti%24docCreateTask/formprocessor",
            dataObj: dataObj,
            successCallback: {
                fn: function (response) {
                    require(["loading"], function () {
                        createTaskIsProcessing = false;
                        $.LoadingOverlay("hide");

                        if (typeof callback == "function") {
                            callback(response);
                        }
                    });
                },
                scope: this
            },
            successMessage: "Поручения созданы и разосланы исполнителям",
            //failureMessage: "Ошибка",
            failureCallback: {
                fn: function (response) {
                    require(["loading"], function () {

                        createTaskIsProcessing = false;
                        $.LoadingOverlay("hide");

                        var message = response && response.json && response.json.message || false;
                        if (message) {
                            if (message.indexOf("Current user is not user SED") != -1){
                                message = 'Только участники группы "Пользователи СЭД" могут создавать задачи';
                            }

                            require(["dojo/topic"], function (topic) {
                                topic.publish("ALF_DISPLAY_PROMPT", {title:"Сбой", message: message});
                            });

                        }


                    });
                },
                scope: this
            }
        });
    };

    BTLAB.createTask = function (dataObj, callback, docRef, docToState) {

        if (createTaskIsProcessing) {
            require(["dojo/topic"], function (topic) {
                topic.publish("ALF_DISPLAY_NOTIFICATION", {message: "Создание задач уже запущено"});
            });
            return;
        }
        createTaskIsProcessing = true;

        require(["loading"], function () {
            $.LoadingOverlay("show");

            if (docToState) {
                changeDocState(docRef, docToState, function () {
                    $.LoadingOverlay("hide");
                    createTaskIsProcessing = false;
                    BTLAB.createTask(dataObj, callback);
                });
                return;
            }

            createTask(dataObj, callback)

        });


    }

})();