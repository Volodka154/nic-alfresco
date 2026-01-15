if (typeof BTLAB == "undefined") {
    BTLAB = {}
}

BTLAB.form = BTLAB.form || {};
BTLAB.form.controls = BTLAB.form.controls || {};
BTLAB.form.controls.roles = BTLAB.form.controls.roles || {};


BTLAB.form.controls.roles.grantRole = function (nodeRef, roleEmployeeId, roleNameId, roleAddButtonId) {

    this.options = {
        nodeRef: nodeRef,
        roleEmployeeId: roleEmployeeId,
        roleNameId: roleNameId,
        roleAddButtonId: roleAddButtonId,

        urlEmployee: Alfresco.constants.PROXY_URI + "filters/association?type=btl-emp:employee-content&s_field=btl-people:fio&field=btl-people:fio",
        urlRole: Alfresco.constants.PROXY_URI + "permission/role/getRoles",

        param: {
            lang: 'en',
            button_img: '/share/res/js/lib/combobox/btn.png',
            sub_info: true,
            instance: true
        }
    };

    this.init = function () {

        $('#' + this.options.roleEmployeeId).ajaxComboBox(this.options.urlEmployee, this.options.param);
        $('#' + this.options.roleNameId).ajaxComboBox(this.options.urlRole, this.options.param);

        $(".ac_subinfo").css("display", "none");

        var _this = this;
        $('#' + this.options.roleAddButtonId).click(function () {
            _this.sendData();
        });

    };

    this.sendData = function () {
        if (!this.verify()) {
            require(["dojo/topic"], function (topic) {
                topic.publish("ALF_DISPLAY_NOTIFICATION", {message: "Заполните поля"});
            });
            return;
        }

        require(["loading"], function (loading) {
            $.LoadingOverlay("show");
        });

        Alfresco.util.Ajax.jsonPost({
            url: Alfresco.constants.PROXY_URI + "permission/role/grant",
            dataObj: {
                "nodeRef": this.options.nodeRef,
                "employee": this.getEmployeeValue(),
                "role": this.getRoleNameValue(),
                "prop_transitions": this.getEmployeeValue()
            },
            successCallback: {
                fn: function (response) {
                    require(["loading"], function (loading) {
                        $.LoadingOverlay("hide");
                    });
                    YAHOO.Bubbling.fire("documentRoleListReload");
                }
            }
        });


    };

    this.verify = function () {
        return this.getEmployeeValue() && this.getRoleNameValue();
    };

    this.getEmployeeValue = function () {
        var data = this.getSubInfoData($('#' + this.options.roleEmployeeId).attr('sub_info'));
        return data.nodeRef;
    };
    this.getRoleNameValue = function () {
        var data = this.getSubInfoData($('#' + this.options.roleNameId).attr('sub_info'));
        return data.value;
    };

    this.getSubInfoData = function (subInfo) {
        if (subInfo) {
            return JSON.parse(subInfo.replace(/'/g, '"'));
        }
        return {};
    };


    this.init();


};