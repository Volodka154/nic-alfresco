define([
    "dojo/_base/declare",
    "dojo/dom",
    "dijit/Dialog",
    "dijit/registry",
    "dojo/text!./templates/AddAttachmentsDialog.html",
    "dojo/topic"
], function (declare, dom, Dialog, registry, template, topic) {

    return declare([Dialog], {
        templateString: template,
        parentNodeRef: null,
        contentType: "btl-tasksAttachments:tasksAttachmentsDataType",
        title: "Добавить вложение",
        style: "width: 400px;",
        nodeRefCurrentDocument: "",
        attachments_load_file_name: null,
        attachment_category_container: null,
        attachment_category_select: null,
        attachments_content: null,
        idAttachmentsGrid: "",
        formId: "",
        selectedFileName: "",




        postMixInProperties: function () {
            this.inherited(arguments);
            this.uid = registry.getUniqueId(this.declaredClass.replace(/\./g, "_"));
        },

        show: function (formId) {
            this.formId = formId;
            this.cleanForm();
            var elem = document.getElementById(this.uid + '_attachments_load_file_name');
            elem.parentElement.style.marginLeft = "5%";
            elem.parentElement.style.paddingTop = "10px";
            elem.parentElement.style.width = "90%";
            elem.style.marginTop = "25px";
            this.inherited(arguments);
        },

        postCreate: function () {
            this.inherited(arguments);
            this.domNode.classList.add("alfresco-dialog-AlfDialog");
            this.fileUpload = Alfresco.getFileUploadInstance();

            this.attachments_load_file_name = document.getElementById(this.uid + '_attachments_load_file_name');
            this.attachment_category_select = document.getElementById(this.uid + '_attachment_category_select');
            this.attachment_category_container = document.getElementById(this.uid + '_attachment_category_container');
            this.attachments_content = document.getElementById(this.uid + '_attachments_content');

            this.uploadConfig = {
                mode: this.fileUpload.MODE_SINGLE_UPLOAD,
                destination: this.parentNodeRef+"&"+this.contentType,
                contentType: this.contentType,
                onFileUploadComplete: {
                    fn: function (complete) {

                        var success = complete.successful.length;
                        if (success != 0) {

                            this.nodeRefCurrentDocument = complete.successful[0].nodeRef;
                            /*var data = {"type": "btl-tasksAttachments:tasksAttachmentsDataType"};
                            Alfresco.util.Ajax.jsonPost({
                                url: Alfresco.constants.PROXY_URI + "slingshot/doclib/type/node/" + this.nodeRefCurrentDocument.replace("://", "/"),
                                dataObj: data,
                            });*/
                            var txt = "Документ: " + complete.successful[0].fileName;

                            this.attachments_load_file_name.innerHTML = txt;


                            //для projectEditWF-form.ftl
                            if(this.projectEditCrutch)
                            {
                                document.getElementById(this.projectEditCrutch.displayFieldName).innerHTML = txt;
                                document.getElementById(this.projectEditCrutch.refFieldName).innerHTML = this.nodeRefCurrentDocument;
                                this.projectEditCrutch.blockField();
                                this.onSubmit();
                            }

                            this.selectedFileName = complete.successful[0].fileName;
                        }
                    },
                    scope: this
                }
            };

            var $act = $(this.attachment_category_select);
            var $cc = $(this.attachment_category_container);
            Alfresco.util.Ajax.jsonGet({
                url: Alfresco.constants.PROXY_URI + "attachments/get-categories?docRef="+this.parentNodeRef,
                responseType: 'json',
                successCallback: {
                    scope: this,
                    fn: function (response) {
                        $act.append($('<option/>', {
                            value: "",
                            text : "Без категории"
                        }));
                       if(response.json.length > 0){
                           response.json.forEach(function (c) {
                               $act.append($('<option/>', {
                                   value: c.nodeRef,
                                   text : c.categoryName
                               }));
                           });
                           $act.find("option:nth-child(2)").attr("selected", "true")
                           $cc.show();
                       }
                    }
                }
            });
        },
        fileUploadPress: function () {
            //this.fileUpload.defaultShowConfig.contentType = this.contentType;
            //console.log(this.fileUpload);
            if (this.parentNodeRef) {
                if (this.fileUpload.uploader === null) {
                    this.fileUpload.show(this.uploadConfig);
                    this.fileUpload.uploader.panel.cancel();
                    YAHOO.util.Dom.addClass(this.fileUpload.uploader.panel.element, "dijitPopup");
                }
                //this.uploadConfig.onFileUploadComplete.scope = this;
                this.fileUpload.show(this.uploadConfig);
                this.fileUpload.uploader.suppliedConfig.contentType = this.contentType;
                this.fileUpload.uploader.panel.mask.style.zIndex = 999;
                this.fileUpload.uploader.panel.element.style.zIndex = 1001;
            } else {
                console.error("Не указан корневой елемент для загрузки вложений");
            }
        },

        onSubmit: function () {
            this.hide();
            this.addPropetries();

            if(typeof addedFiles !== 'undefined' && addedFiles){
                addedFiles.push(this.selectedFileName);
            }


            var addedLinksList = $("#" + this.formId + "_addedLinksList");
            text = addedLinksList.html();
            if(text!=''){
                text = '<br>' + text;
            }

            addedLinksList.html(this.selectedFileName + text);
            addedLinksList.removeAttr("hidden");
        },

        onCancel: function () {
            this.containerAttachmentsDialogClose();
            this.hide();
            this.cleanForm();
        },

        containerAttachmentsDialogClose: function () {
            if (this.nodeRefCurrentDocument) {
                this.deleteFileAttachment(this.nodeRefCurrentDocument, null);
            }
        },

        deleteFileAttachment: function (nodeRef, callback) {
            var data = {"type": "${type}"};
            Alfresco.util.Ajax.jsonPost({
                method: "POST",
                url: "/share/proxy/alfresco/slingshot/doclib/action/files?alf_method=delete",
                dataObj: {nodeRefs: [nodeRef]},
                successCallback: {
                    fn: callback,
                    scope: this
                }
            });
        },

        addPropetries: function () {
            var desc = this.attachments_content.value;
            data = {
                "nodeRef": this.nodeRefCurrentDocument,
                "description": desc,
                "parentNodeRef": this.parentNodeRef,
                "categoryRef": (this.attachment_category_select.value || "")
            };
            Alfresco.util.Ajax.request({
                method: "GET",
                url: Alfresco.constants.PROXY_URI + "events/add-properties",
                dataObj: data,
                successCallback: {
                    fn: this.refreshAttachmentsGrid,
                    scope: this
                }
            });
        },

        refreshAttachmentsGrid: function () {
            this.cleanForm();
            topic.publish("refreshAttachmentsGrid");
        },

        cleanForm: function () {
            this.attachments_load_file_name.innerHTML = "Документ: ";
            this.attachments_content.value = "";
            this.nodeRefCurrentDocument = "";
        }
    });
});