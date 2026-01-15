function CertificateAdjuster() {
}

CertificateAdjuster.prototype.Print2Digit = function (digit) {
    return (digit < 10) ? "0" + digit : digit;
};

CertificateAdjuster.prototype.extract = function (from, what) {
    var certName = "";
    from = " " + from;
    var begin = from.indexOf(" " + what) + 1;
    var end;
    if (begin >= 0) {
        if (from[begin + what.length] === '"') {
            end = from.indexOf('", ', begin) + 1;
        } else {
            end = from.indexOf(', ', begin);
        }

        certName = (end < 0) ? from.substr(begin) : from.substr(begin, end - begin);
    }
    return certName;
};

CertificateAdjuster.prototype.ClearOfKey = function (key, value) {
    return value.replace(key, '');
};

CertificateAdjuster.prototype.GetCertInfoString = function (certSubjectName, certFromDate) {
    return this.extract(certSubjectName, 'CN=') + "; Выдан: " + this.GetCertDate(certFromDate);
};

CertificateAdjuster.prototype.GetCertDate = function (paramDate) {
    var certDate = new Date(paramDate);
    return this.Print2Digit(certDate.getUTCDate()) + "." + this.Print2Digit(certDate.getMonth() + 1) + "." + certDate.getFullYear();
};

CertificateAdjuster.prototype.GetPropertiesKey = function (certSubjectName) {
    var regexp = /(^|, )([\wА-Я]*?=)/ig;
    var result;
    var arrayResult = [];
    while (result = regexp.exec(certSubjectName)) {
        arrayResult.push(result[2]);
    }
    return arrayResult;
};

CertificateAdjuster.prototype.getJsonCertSubjectName = function (certSubjectName) {
    var result = {};
    var keys = this.GetPropertiesKey(certSubjectName);
    var _this = this;
    keys.forEach(function (key) {
        result[key] = _this.ClearOfKey(key, _this.extract(certSubjectName, key));
    });
    return JSON.stringify(result);
};

function BTLEcp() {

}

BTLEcp.prototype.CAPICOM_CURRENT_USER_STORE = 2;
BTLEcp.prototype.CAPICOM_MY_STORE = "My";
BTLEcp.prototype.CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED = 2;

BTLEcp.prototype.getListCertificates = function (elementList) {

    cadesplugin.async_spawn(function *(args) {
        try {
            var oStore = yield cadesplugin.CreateObjectAsync("CAPICOM.Store");
            yield oStore.Open(args[0].CAPICOM_CURRENT_USER_STORE, args[0].CAPICOM_MY_STORE, args[0].CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED);
            var CertificatesObj = yield oStore.Certificates;

            var Count = yield CertificatesObj.Count;
            // console.log("Колличество сертификатов:" + Count);

            if (Count > 0) {
                for (var i = 1; i <= Count; i++) {
                    var cert;
                    try {
                        cert = yield CertificatesObj.Item(i);
                    }
                    catch (ex) {
                        alert("Ошибка при перечислении сертификатов: " + args[0].GetErrorMessage(ex));
                        return;
                    }
                    var oOpt = document.createElement("OPTION");
                    try {
                        var ValidToDate = new Date((yield cert.ValidToDate));
                        var ValidFromDate = new Date((yield cert.ValidFromDate));
                        var Validator = yield cert.IsValid();
                        var IsValid = yield Validator.Result;
                        var dateObj = new Date();
                        if (dateObj < ValidToDate && (yield cert.HasPrivateKey()) && IsValid) {
                            var name = yield cert.SubjectName;
                            var newText = new CertificateAdjuster().GetCertInfoString(name, ValidFromDate);
                            oOpt.text = newText;
                        } else {
                            continue;
                        }

                    }
                    catch (ex) {
                        alert("Ошибка при получении свойства SubjectName: " + args[0].GetErrorMessage(ex));
                    }
                    try {
                        oOpt.value = yield cert.Thumbprint;
                    }
                    catch (ex) {
                        alert("Ошибка при получении свойства Thumbprint: " + args[0].GetErrorMessage(ex));
                    }

                    elementList.options.add(oOpt);
                }
            } else {
                // document.getElementById(BTL.formId + "-signature-text").innerHTML = "Не удалось найти действующие сертификаты.";
                document.querySelector("#" + BTL.formId + "-block-certificates .title").textContent = "Не удалось найти действующие сертификаты.";
            }

            yield oStore.Close();
        }
        catch (e) {
            alert("Failed to create signature. Error: " + args[0].GetErrorMessage(e));
            console.error(e);
        }
    }, this);
};

BTLEcp.prototype.viewCertificateInfo = function (blockCertificateInfo, thumbprint) {

    cadesplugin.async_spawn(function*(arg) {
            try {
                var oStore = yield cadesplugin.CreateObjectAsync("CAdESCOM.Store");
                yield oStore.Open();

                //Возвращает сертификаты соответствующие указанному хэшу SHA1.
                var CAPICOM_CERTIFICATE_FIND_SHA1_HASH = 0;
                var all_certs = yield oStore.Certificates;
                var oCerts = yield all_certs.Find(CAPICOM_CERTIFICATE_FIND_SHA1_HASH, thumbprint);
                var certificate = yield oCerts.Item(1);

                //var blockCertificateInfo = elementBlockInfo;
                blockCertificateInfo.innerHTML = "";
                var blockCertificateInfoHeader = document.createElement("h2");
                blockCertificateInfoHeader.textContent = "Информация о сертификате";
                blockCertificateInfo.appendChild(blockCertificateInfoHeader);
                var SubjectName = yield certificate.SubjectName;
                var IssuerName = yield certificate.IssuerName;
                var ValidFromDate = yield certificate.ValidFromDate;
                var ValidToDate = yield certificate.ValidToDate;
                var objCertificateAdjuster = new CertificateAdjuster();

                // console.log("Свойства SubjectName: " + SubjectName);
                // console.log("Json: " + objCertificateAdjuster.getJsonCertSubjectName(SubjectName));
//-------------- Владелец : --------------------------------------------------------------------------------------------
                var ownerCertificate = objCertificateAdjuster.extract(SubjectName, 'CN=');
                var ownerCertificateElem = document.createElement("p");
                ownerCertificateElem.classList.add('info_field');
                ownerCertificateElem.innerHTML = "Владелец: <b>" + ownerCertificate + "</b>";
                blockCertificateInfo.appendChild(ownerCertificateElem);
//-------------- Номер : --------------------------------------------------------------------------------------------
                var serialNumber = yield certificate.SerialNumber;
                var serialNumberElem = document.createElement("p");
                serialNumberElem.classList.add('info_field');
                serialNumberElem.innerHTML = "Номер: <b>" + serialNumber + "</b>";
                blockCertificateInfo.appendChild(serialNumberElem);
//-------------- Издатель : --------------------------------------------------------------------------------------------
                var IssuerCertificate = objCertificateAdjuster.extract(IssuerName, 'CN=');
                var IssuerCertificateElem = document.createElement("p");
                IssuerCertificateElem.classList.add('info_field');
                IssuerCertificateElem.innerHTML = "Издатель: <b>" + IssuerCertificate + "</b>";
                blockCertificateInfo.appendChild(IssuerCertificateElem);
//-------------- Выдан : -----------------------------------------------------------------------------------------------
                var ValidFromDateCertificate = objCertificateAdjuster.GetCertDate(ValidFromDate);
                var ValidFromDateCertificateElem = document.createElement("p");
                ValidFromDateCertificateElem.classList.add('info_field');
                ValidFromDateCertificateElem.innerHTML = "Выдан: <b>" + ValidFromDateCertificate + "</b>";
                blockCertificateInfo.appendChild(ValidFromDateCertificateElem);
//-------------- Действителен до : -------------------------------------------------------------------------------------
                var ValidToDateCertificate = objCertificateAdjuster.GetCertDate(ValidToDate);
                var ValidToDateCertificateElem = document.createElement("p");
                ValidToDateCertificateElem.classList.add('info_field');
                ValidToDateCertificateElem.innerHTML = "Действителен до: <b>" + ValidToDateCertificate + "</b>";
                blockCertificateInfo.appendChild(ValidToDateCertificateElem);
//-------------- Алгоритм ключа : --------------------------------------------------------------------------------------
                var pubKey = yield certificate.PublicKey();
                var algo = yield pubKey.Algorithm;
                var fAlgoName = yield algo.FriendlyName;
                var fAlgoNameCertificateElem = document.createElement("p");
                fAlgoNameCertificateElem.classList.add('info_field');
                fAlgoNameCertificateElem.innerHTML = "Алгоритм ключа: <b>" + fAlgoName + "</b>";
                blockCertificateInfo.appendChild(fAlgoNameCertificateElem);
//-------------- Криптопровайдер : -------------------------------------------------------------------------------------
                try {
                    var oPrivateKey = yield certificate.PrivateKey;
                    var sProviderName = yield oPrivateKey.ProviderName;
                } catch (e) {
                    console.error(e);
                }
                var sProviderNameCertificateElem = document.createElement("p");
                sProviderNameCertificateElem.classList.add('info_field');
                sProviderNameCertificateElem.innerHTML = "Криптопровайдер: <b>" + ((sProviderName) ? sProviderName : "Не удалось определить" ) + "</b>";
                blockCertificateInfo.appendChild(sProviderNameCertificateElem);

                blockCertificateInfo.classList.remove('visible_none');
            } catch (err) {
                alert('Не удалось получить информацию о сертификате');
                console.error(err);
                return;
            }
        }
    );
};

BTLEcp.prototype.signFile = function (dataToSign, thumbprint, docNodeRef) {
    var _this = this;
    var Signature = ""; //текст подписи
    return new Promise(function (resolve, reject) {
        cadesplugin.async_spawn(function*(arg) {
            try {
                try {
                    var oStore = yield cadesplugin.CreateObjectAsync("CAdESCOM.Store");
                    yield oStore.Open();
                } catch (err) {
                    console.log('Failed to create CAdESCOM.Store: ' + err);
                    reject(err);
                }

                var all_certs = yield oStore.Certificates;
                var oCerts = yield all_certs.Find(cadesplugin.CAPICOM_CERTIFICATE_FIND_SHA1_HASH, thumbprint);

                if ((yield oCerts.Count) == 0) {
                    alert("Сертификаты не найдены");
                    reject("Сертификаты не найдены");
                }
                //Получили выбранный в списке сертификат
                var certificate = yield oCerts.Item(1);

                var errormes = "";
                try {
                    //Получаем объект подписи
                    var oSigner = yield cadesplugin.CreateObjectAsync("CAdESCOM.CPSigner");
                } catch (err) {
                    console.log('Failed to create CAdESCOM.Store: ' + err);
                    reject(err);
                }
                if (oSigner) {
                    //Добавляем данные о сертификате в подпись
                    yield oSigner.propset_Certificate(certificate);
                }
                else {
                    errormes = "Failed to create CAdESCOM.CPSigner";
                    reject(errormes);
                }
                // Получаем объект данных для подписи
                var oSignedData = yield cadesplugin.CreateObjectAsync("CAdESCOM.CadesSignedData");

                if (dataToSign) { // Данные на подпись ввели

                    //yield oSigner.propset_Options(cadesplugin.CAPICOM_CERTIFICATE_INCLUDE_WHOLE_CHAIN);

                    //Указываем что передаём данные в формате BASE64
                    yield oSignedData.propset_ContentEncoding(cadesplugin.CADESCOM_BASE64_TO_BINARY); //
                    // Передаём данные на подпись
                    yield oSignedData.propset_Content(dataToSign);
                    try {
                        //Создание подписи
                        Signature = yield oSignedData.SignCades(oSigner, cadesplugin.CADESCOM_CADES_BES, true);
                    }
                    catch (err) {
                        console.log("saveSignOnServer err...");
                        errormes = "Не удалось создать подпись из-за ошибки: " + _this.GetErrorMessage(err);
                        reject(err);
                        throw errormes;
                    }
                }

                _this.saveSignOnServer(Signature, docNodeRef).then(results => {
                    // console.log("saveSignOnServer ok...");
                    resolve(results);
                }, error => {
                    console.log("saveSignOnServer error...");
                    reject(error);
                });
            }
            catch (err) {
                console.log("saveSignOnServer err...");
                console.log(err);
                reject(err);
            }
        });
    });
};

BTLEcp.prototype.saveSignOnServer = function (signData, docNodeRef, ownerCertificate, ValidFromDate, ValidToDate, serialNumber) {
    return new Promise(function (resolve, reject) {
        Alfresco.util.Ajax.jsonPost({
            method: "POST",
            url: "/share/proxy/alfresco/sign-file",
            dataObj: {
                "signDoc": signData,
                "docNodeRef": docNodeRef,
                "ownerCertificate": ownerCertificate,
                "ValidFromDate": ValidFromDate,
                "ValidToDate": ValidToDate,
                "serialNumber": serialNumber
            },
            successCallback: {
                fn: function (data) {
                    if (data.json.code == 500) {
                        console.log("saveSignOnServer 500...");
                        reject(data.json.message);
                    }
                    if (data.json.code == 200) {
                        console.log("saveSignOnServer 200...");
                        resolve(data);
                    } else {
                        reject("Неизвестная ошибка при сохранении подписи");
                    }
                },
                scope: this
            },
            failureCallback: {
                fn: function (data) {
                    console.log("saveSignOnServer failureCallback...");
                    reject(data.json.message);
                },
                scope: this
            }
        });
    });
};

BTLEcp.prototype.signECP = function (docUrl, docNodeRef, cert) {
    var _this = this;
    return new Promise(function (resolve, reject) {
        if (docUrl && cert) {
            try {
                _this.getCertificateInfo(cert).then(certInfo => {
                    var jsonSubjectName = certInfo.jsonSubjectName;
                    var objSubjectName = JSON.parse(jsonSubjectName);
                    var propsToStamp = null;
                    // Если есть поле "G="(имя отчество), то это сертификат "Юридического должностного лица"
                    if (objSubjectName["G="]) {
                        propsToStamp = {props: []};
                        propsToStamp.props.push({"Сертификат: ": certInfo.serialNumber});
                        propsToStamp.props.push({"Кому выдан: ": ""});
                        propsToStamp.props.push({"CN=": objSubjectName["CN="] || ""});
                        propsToStamp.props.push({"SN=": objSubjectName["SN="] || ""});
                        propsToStamp.props.push({"G=": objSubjectName["G="] || ""});
                        propsToStamp.props.push({"Действителен: ": "с " + certInfo.ValidFromDate + " по " + certInfo.ValidToDate});
                    }

                    _this.httpGet("/share/proxy/alfresco/ecp/add-stamp?" +
                        "docNodeRef=" + docNodeRef +
                        "&ownerCertificate=" + encodeURIComponent(encodeURI(certInfo.ownerCertificate)) +
                        (propsToStamp ? "&propsToStamp=" + encodeURIComponent(encodeURI(JSON.stringify(propsToStamp))) : "") +
                        "&ValidFromDate=" + certInfo.ValidFromDate +
                        "&ValidToDate=" + certInfo.ValidToDate +
                        "&serialNumber=" + certInfo.serialNumber).then(result => {
                        if (JSON.parse(result).code == 200) {
                            if (JSON.parse(result).docUrl != '') {
                                docUrl = JSON.parse(result).docUrl;
                            }
                            xhr = new XMLHttpRequest();
                            xhr.open('GET', docUrl);
                            xhr.responseType = 'blob';
                            xhr.onreadystatechange = function () {
                                if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                                    var blob = this.response;
                                    var fileReader = new window.FileReader();
                                    fileReader.readAsDataURL(blob);
                                    var strToDel = "data:" + blob.type + ";base64,";
                                    fileReader.onloadend = function () {
                                        var data = fileReader.result.replace(strToDel, '');
                                        _this.signFile(data, cert, docNodeRef).then(result => {
                                            // console.log("signECP ok...");
                                            resolve("");
                                        }, error => {
                                            console.log("signECP error...");
                                            reject(error);
                                        });
                                    }
                                }
                            };
                            xhr.send();
                        } else {
                            reject("Ошибка при создании штампа");
                        }
                    }, error => {
                        console.log("create stamp error...");
                        reject(error);
                    });
                }, error => {
                    console.log("getCertificateInfo error...");
                    reject(error);
                });
            } catch (e) {
                console.log("signECP catch...");
                reject(e);
            }
        } else {
            console.log("signECP else...");
            reject("Ошибка при создании подписи");
        }
    });
};

BTLEcp.prototype.Reverse = function (docNodeRef) {
    var _this = this;
    return new Promise(function (resolve, reject) {
        _this.httpGet('/share/proxy/alfresco/ecp/reverse?nodeRef=' + docNodeRef)
            .then(response => {
                    resolve(true);
                },
                error => {
                    console.error(error.message);
                    reject(error.message);
                });
    });
};

BTLEcp.prototype.Verify = function (docNodeRef, docUrl) {
    var _this = this;
    return new Promise(function (resolve, reject) {

        Promise.all([
            _this.httpGet('/share/proxy/alfresco/get-sign-file?nodeRef=' + docNodeRef),
            _this.docGet(docUrl).then(response => _this.blobToBase64(response).then(data => {
                return data;
            }))
        ]).then(results => {
                var sign = JSON.parse(results[0]).sign;
                var dataToVerify = results[1];
                cadesplugin.async_spawn(function*(arg) {
                    var oSignedData = yield cadesplugin.CreateObjectAsync("CAdESCOM.CadesSignedData");
                    try {
                        yield oSignedData.propset_ContentEncoding(cadesplugin.CADESCOM_BASE64_TO_BINARY);
                        yield oSignedData.propset_Content(arg[0]);
                        yield oSignedData.VerifyCades(arg[1], cadesplugin.CADESCOM_CADES_BES, true);
                    } catch (err) {
                        console.error("Подпись не валидна. Ошибка:" + err);
                        //console.log("Failed to verify signature. Error: " + _this.GetErrorMessage(err));
                        resolve(false);
                    }
                    // console.log("Подпись подлинная");
                    resolve(true);
                }, dataToVerify, sign);
            },
            error => {
                alert("Ошибка: Проверки подписи документа");
                console.error(error.message);
                reject(error.message);
            });
    });
};

BTLEcp.prototype.docGet = function (docUrl) {
    return new Promise(function (resolve, reject) {
        xhr = new XMLHttpRequest();
        xhr.open('GET', docUrl);
        xhr.responseType = 'blob';
        xhr.onload = function () {
            if (this.status == 200) {
                resolve(this.response);
            } else {
                var error = new Error(this.statusText);
                error.code = this.status;
                reject(error);
            }
        };
        xhr.send();
    });
};

BTLEcp.prototype.blobToBase64 = function (blob) {
    return new Promise(function (resolve, reject) {
        var fileReader = new window.FileReader();
        var data = '';
        fileReader.readAsDataURL(blob);
        var strToDel = "data:" + blob.type + ";base64,";
        fileReader.onloadend = function () {
            data = fileReader.result.replace(strToDel, '');
            resolve(data);
        }
    });
};

BTLEcp.prototype.httpGet = function (url) {

    return new Promise(function (resolve, reject) {

        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);

        xhr.onload = function () {
            if (this.status == 200) {
                resolve(this.response);
            } else {
                var error = new Error(this.statusText);
                error.code = this.status;
                reject(error);
            }
        };

        xhr.onerror = function () {
            reject(new Error("Network Error"));
        };

        xhr.send();
    });

};

BTLEcp.prototype.GetErrorMessage = function (e) {
    var err = e.message;
    if (!err) {
        err = e;
    } else if (e.number) {
        err += " (" + e.number + ")";
    }
    return err;
};

BTLEcp.prototype.getCertificateInfo = function (thumbprint) {
    return new Promise(function (resolve, reject) {

        cadesplugin.async_spawn(function*(arg) {

            try {
                var oStore = yield cadesplugin.CreateObjectAsync("CAdESCOM.Store");
                yield oStore.Open();
            } catch (err) {
                console.log('Failed to create CAdESCOM.Store: ' + err);
                reject(err);
                //alert('Failed to create CAdESCOM.Store: ' + err.number);
                //return;
            }

            var all_certs = yield oStore.Certificates;
            var oCerts = yield all_certs.Find(cadesplugin.CAPICOM_CERTIFICATE_FIND_SHA1_HASH, thumbprint);

            if ((yield oCerts.Count) == 0) {
                alert("Сертификаты не найдены");
                reject("Сертификаты не найдены");
            }
            //Получили выбранный в списке сертификат
            var certificate = yield oCerts.Item(1);

            var objCertificateAdjuster = new CertificateAdjuster();
            var SubjectName = yield certificate.SubjectName;

            var ownerCertificate = objCertificateAdjuster.extract(SubjectName, 'CN=');
            ownerCertificate = ownerCertificate.replace('CN=', '');

            var ValidFromDate = yield certificate.ValidFromDate;
            ValidFromDate = objCertificateAdjuster.GetCertDate(ValidFromDate);

            var ValidToDate = yield certificate.ValidToDate;
            ValidToDate = objCertificateAdjuster.GetCertDate(ValidToDate);

            var serialNumber = yield certificate.SerialNumber;

            resolve({
                "ownerCertificate": ownerCertificate,
                "ValidFromDate": ValidFromDate,
                "ValidToDate": ValidToDate,
                "serialNumber": serialNumber,
                "jsonSubjectName": objCertificateAdjuster.getJsonCertSubjectName(SubjectName)
            });
        });
    });

};