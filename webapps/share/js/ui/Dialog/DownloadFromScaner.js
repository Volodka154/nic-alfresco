define([
    "dojo/_base/declare",
    "dojo/dom",
    "dijit/Dialog",
    "dijit/registry",
    "dojo/text!./templates/DowloadFromScaner.html",
    "dojo/topic",
    "dojo/on",
    "jquery"
], function (declare, dom, Dialog, registry, template, topic, on, $) {

    return declare([Dialog], {
        templateString: template,
        parentNodeRef: null,        //обязательно заполнение при создании
        title: "Добавить вложение",
        style: "width: 400px;",
        attachments_load_file_name: null,
        attachments_content: null,
        idAttachmentsGrid: "",
        isLoadingConfig: false,
        isDevice: true,
        clientIP: "",
        port: 80,

        postMixInProperties: function () {
            this.inherited(arguments);
            this.uid = registry.getUniqueId(this.declaredClass.replace(/\./g, "_"));
            this.port = (localStorage.getItem('btlScanSettingPort')) ? localStorage.getItem('btlScanSettingPort'): "80";
        },
        //отключение обработки нажатия клавиш
        _onKey : function() {

        },

        postCreate: function () {
            this.inherited(arguments);
            this.domNode.classList.add("alfresco-dialog-AlfDialog");
            this.attachments_name = document.getElementById(this.uid + '_name_content');
            this.attachments_content = document.getElementById(this.uid + '_attachments_content');
            this.inputPort = document.getElementById(this.uid + '_input-port');
            this.inputIP = document.getElementById(this.uid + '_input-ip');
            this.selectDPI = document.getElementById(this.uid + '_select-dpi');
            this.selectColorMode = document.getElementById(this.uid + '_select-color-mode');
            this.selectFormatList = document.getElementById(this.uid + '_select-format-list');
            this.submit = document.getElementById(this.uid + '_attachments_dialog_load_btn');
            this.inputPort.value = (localStorage.getItem('btlScanSettingPort')) ? localStorage.getItem('btlScanSettingPort'): "80";
            this.inputIP.value = (localStorage.getItem('btlScanSettingClientIp')) ? localStorage.getItem('btlScanSettingClientIp'): "";
            on(this.selectDPI, 'change', function (evt) {
                localStorage.setItem('btlScanSettingDPI', this.value);
            });
            on(this.selectColorMode, 'change', function (evt) {
                localStorage.setItem('btlScanSettingColorMode', this.value);
            });
            on(this.selectFormatList, 'change', function (evt) {
                localStorage.setItem('btlScanSettingFormatList', this.value);
            });
            this.submit.disabled = true;
        },

        show: function () {
            this.inherited(arguments);
        },

        openDialog: function () {
            this.inputPort.value = (localStorage.getItem('btlScanSettingPort')) ? localStorage.getItem('btlScanSettingPort'): "80";
            this.inputIP.value = (localStorage.getItem('btlScanSettingClientIp')) ? localStorage.getItem('btlScanSettingClientIp'): "";
            if (!this.isLoadingConfig) {
                this.getScanInfo("");
            }
            if (this.isDevice) {
                this.show();
            }
        },

        fileUploadPress: function () {
            var _this = this;
            require(["loading"], function (loading) {
                $("#" + _this.id).LoadingOverlay("show");
            });

            var url = "http://127.0.0.1:" + _this.inputPort.value + "/TWAIN@Web/";
            var dpi = this.selectDPI.options[this.selectDPI.selectedIndex].value;
            var colorMode = this.selectColorMode.options[this.selectColorMode.selectedIndex].value;
            var formatList = this.selectFormatList.options[this.selectFormatList.selectedIndex].value;
            var data = {};
            data = {
                "method": "Scan",
                "Form.Source": "0",
                "Form.FileName": "scan",
                "Form.FileCounter": "",
                "Form.Dpi": dpi,
                "Form.ScanFeed": "null",
                "Form.ColorMode": colorMode,
                "Form.CompressionFormat": "100*jpg",
                "Form.Format": formatList,
                "Form.SaveAs": "1",   //0-jpg; 1-pdf
                "isPackage": "true"
            };
            $.ajax({
                async: true,
                url: url,
                crossDomain: true,
                type: 'POST',
                dataType: 'json',
                data: data,
                success: function (responce) {
                    // console.log(responce);
                    var url = "http://" + _this.clientIP + ":" + _this.inputPort.value + "/TWAIN@Web/download?fileId0=" + responce.temp + '&fileName0=' + responce.file + "&saveAs=1";
                    _this.saveScanOnServer(encodeURIComponent(url));
                },
                error: function (xhr, msdfsg) {
                    var msg = xhr.responseText;
                    if (msg == undefined || msg == "") {
                        msg = "Возникла неизвестная ошибка";
                    }
                    require(["loading"], function (loading) {
                        $.LoadingOverlay("hide");
                    });
                    alert(msg);
                },
                complete: function (resp) {

                }
            });
        },

        onSubmit: function () {
            this.hide();
        },

        updatePort: function () {
            this.port = this.inputPort.value;
            this.clientIP = this.inputIP.value;
            localStorage.setItem('btlScanSettingPort', this.port);
            localStorage.setItem('btlScanSettingClientIp', this.clientIP);
            this.getScanInfo("Настройки успешно обновленны");
        },

        getScanInfo: function (messageSuccess) {
            if(this.xhr){
                this.xhr.abort();
            }
            var url = "http://127.0.0.1:" + this.port + "/TWAIN@Web/";
            var method = "GetScannerParameters";
            var data = "sourceIndex:0";
            var _this = this;
            data = {method: "GetScannerParameters", sourceIndex: 0};
            try {
                this.xhr = $.ajax({
                    async: true,
                    url: url,
                    crossDomain: true,
                    type: 'POST',
                    dataType: 'json',
                    data: data,
                    success: function (responce) {
                        // console.log(responce);
                        if (responce.sources) {
                            $.ajax({
                                async: true,
                                url: url,
                                crossDomain: true,
                                type: 'POST',
                                dataType: 'json',
                                data: {method: "GetIp"},
                                success: function (responce) {
                                    _this.clientIP = responce.ip;
                                    _this.inputIP.value = _this.clientIP;
                                    _this.submit.disabled = false;
                                    if (messageSuccess) {
                                        require(["dojo/topic"], function (topic) {
                                            topic.publish("ALF_DISPLAY_NOTIFICATION", {message: messageSuccess});
                                        });
                                    }
                                    _this.isLoadingConfig = true;
                                },
                                error: function (xhr, msdfsg) {
                                    var msg = xhr.responseText;
                                    if (msg == undefined || msg == "") {
                                        msg = "Возникла неизвестная ошибка";
                                    }
                                    _this.submit.disabled = true;
                                    alert(msg);
                                }
                            }); //получение ip адреса клиентской машины
                            var i = 0;
                            var saveDPIValue = (localStorage.getItem('btlScanSettingDPI'))? localStorage.getItem('btlScanSettingDPI') : null;
                            _this.removeOptions(_this.selectDPI);
                            var DPI = responce.flatbedResolutions;
                            if (DPI && DPI.length > 0) {
                                DPI.forEach(function (item) {

                                    var option = document.createElement("option");
                                    option.value = item.key;
                                    option.text = item.value;
                                    _this.selectDPI.add(option);
                                    if(saveDPIValue && saveDPIValue == item.key){
                                        _this.selectDPI.selectedIndex = i;
                                    }
                                    ++i;
                                });
                            }
                            i = 0;
                            var saveColorTypeValue = (localStorage.getItem('btlScanSettingColorMode'))? localStorage.getItem('btlScanSettingColorMode') : null;
                            _this.removeOptions(_this.selectColorMode);
                            var colorType = responce.pixelTypes;
                            if (colorType && colorType.length > 0) {
                                colorType.forEach(function (item) {
                                    var option = document.createElement("option");
                                    option.value = item.key;
                                    option.text = item.value;
                                    _this.selectColorMode.add(option);
                                    if(saveColorTypeValue && saveColorTypeValue == item.key){
                                        _this.selectColorMode.selectedIndex = i;
                                    }
                                    ++i;
                                });
                            }
                            i = 0;
                            var saveFormatListValue = (localStorage.getItem('btlScanSettingFormatList'))? localStorage.getItem('btlScanSettingFormatList') : null;
                            _this.removeOptions(_this.selectFormatList);
                            var formatList = responce.allowedFormats;
                            if (formatList && formatList.length > 0) {
                                formatList.forEach(function (item) {
                                    var option = document.createElement("option");
                                    option.value = item.key;
                                    option.text = item.value;
                                    _this.selectFormatList.add(option);
                                    if(saveFormatListValue && saveFormatListValue == item.key){
                                        _this.selectFormatList.selectedIndex = i;
                                    }
                                    ++i;
                                });
                            }
                            _this.selectDPI.disabled = false;
                            _this.selectFormatList.disabled = false;
                            _this.selectColorMode.disabled = false;
                            _this.attachments_content.disabled = false;
                            _this.attachments_name.disabled = false;
                            _this.submit.disabled = false;
                        } else {
                            _this.submit.disabled = true;
                            _this.isDevice = false;
                            alert("Устройство не определено");
                        }
                    },
                    error: function (xhr, msdfsg) {
                        var msg = xhr.responseText;
                        if (msg == undefined || msg == "") {
                            msg = "Не удалось подключиться к ScanService(TWAIN@Web).";
                        }
                        _this.submit.disabled = true;
                        alert(msg);
                    }
                }); //получение параметров сканера

            } catch (e) {

            }
        },

        saveScanOnServer: function (urlFile) {
            var _this = this;
            var name = encodeURIComponent(this.attachments_name.value);
            var desc = encodeURIComponent(this.attachments_content.value);
            var nodeRef = this.parentNodeRef;
            var data = {"name": name, "nodeRef": nodeRef, "url": urlFile, "desc": desc};
            $.ajax({
                async: true,
                url: "/share/proxy/alfresco/common/save-file-from-scan",
                crossDomain: true,
                type: 'GET',
                data: data,
                success: function (responce) {
                    // console.log(responce);
                    topic.publish("refreshAttachmentsGrid");
                    require(["loading", "dojo/topic"], function (loading, topic) {
                        $("#" + _this.id).LoadingOverlay("hide");
                        topic.publish("ALF_DISPLAY_NOTIFICATION", {message: "Файл успешно загружен"});
                    });
                },
                error: function (xhr, msdfsg) {
                    var msg = xhr.responseText;
                    if (msg == undefined || msg == "") {
                        msg = "Не удалось подключиться к ScanService(TWAIN@Web).";
                    }
                    require(["loading"], function (loading) {
                        $("#" + _this.id).LoadingOverlay("hide");
                    });
                    alert(msg);
                }
            });
        },

        onCancel: function () {
            this.hide();
            this.cleanForm();
        },

        cleanForm: function () {
            this.attachments_name.value = '';
            this.attachments_content.value = '';
            this.inputPort.value = '';
            this.inputIP.value = '';
        },

        removeOptions: function (selectbox) {
            var i;
            for (i = selectbox.options.length - 1; i >= 0; i--) {
                selectbox.remove(i);
            }
        }
    });
});