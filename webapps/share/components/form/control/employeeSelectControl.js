if (typeof BTLAB == "undefined") {
    BTLAB = {}
}

BTLAB.form = BTLAB.form || {};
BTLAB.form.controls = BTLAB.form.controls || {};

BTLAB.form.controls.select = BTLAB.form.controls.select || {};

BTLAB.form.controls.select.Employee = function (htmlId) {
    this.options = {
        htmlId: htmlId,
        listUrl: "/share/proxy/alfresco/filters/resource-association?projectNodeRef="
    };
    this.oldValue = "";

    this.init = function () {
        var arr_instance = $('#' + this.options.htmlId + '-val').ajaxComboBox(
            this.options.listUrl,
            {
                lang: 'en',
                button_img: '/share/res/js/lib/combobox/btn.png',
                bind_to: 'foo',
                sub_info: true,
                instance: true
            }
        );

        $(".ac_subinfo").css("display", "none");

        var _this = this;

        arr_instance["this"].bind('foo', function () {

            var json = $('#' + _this.options.htmlId + '-val').attr('sub_info');
            var obj = eval('(' + json + ')');
            if (obj.nodeRef != _this.oldValue) {
                $('#' + _this.options.htmlId + "-added").val(obj.nodeRef);
                $('#' + _this.options.htmlId + "-removed").val(_this.oldValue);
                $('#' + _this.options.htmlId).val(obj.nodeRef);
            } else {
                $('#' + _this.options.htmlId + "-added").val('');
                $('#' + _this.options.htmlId + "-removed").val('');
            }
        });

        $('#field-links-type-' + this.options.htmlId + ' div.ac_btn_out').mousedown(function (eventObject) {
            arr_instance.op[0].option.source = listUrl + "&linkType=" + document.getElementById(_this.options.htmlId + '-link-type').value;
            $('[for="' + _this.options.htmlId + '"] span')[0].innerHTML = "";
        });

        if ($("#" + this.options.htmlId).val() !== "") {
            this.oldValue = $('#' + this.options.htmlId).val();
            $.ajax({
                url: "/share/proxy/alfresco/picker/associationItem?nodeRef=" + this.oldValue + "type=btl-people:employee-content&field=surname,firstname,middlename",
                success: function (data) {
                    $("#" + _this.options.htmlId + "-val").val(data.item);
                }
            });
        }
    };

};
