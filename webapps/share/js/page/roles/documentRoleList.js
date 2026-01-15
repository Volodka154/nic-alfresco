if (typeof BTLAB == "undefined") {
    BTLAB = {}
}

BTLAB.form = BTLAB.form || {};
BTLAB.form.controls = BTLAB.form.controls || {};
BTLAB.form.controls.roles = BTLAB.form.controls.roles || {};


BTLAB.form.controls.roles.documentRoleList = function (nodeRef, documentPermissionListId, documentAlfrescoPermissionListId, sourceListDivId, targetListDivId) {

    this.options = {
        nodeRef: nodeRef,
        dataUrl: "permission/role/getInfo",
        documentPermissionListId: documentPermissionListId,
        documentAlfrescoPermissionListId: documentAlfrescoPermissionListId,
        sourceListDivId: sourceListDivId,
        targetListDivId: targetListDivId
    };
    this.init = function () {

        YAHOO.Bubbling.on("documentRoleListReload", this.load, this);
        this.load();

    };

    this.load = function () {

        var _this = this;
        Alfresco.util.Ajax.jsonGet({
            url: Alfresco.constants.PROXY_URI + this.options.dataUrl + "?nodeRef=" + this.options.nodeRef,
            successCallback: {
                fn: function (response) {
                    var data = response.json;

                    var uuidToNodeRef = function (uuid) {
                        var url = "/share/page/btl-edit-metadata?nodeRef=workspace://SpacesStore/" + uuid;
                        return '<a href="' + url + '">' + uuid + '</a>'
                    };

                    var removeRole = function (roleId) {
                        var div = $('<div>');
                        div.addClass('button-icon-flex');

                        var deleteSpan = $('<span>');
                        deleteSpan.addClass('dijitInline');
                        deleteSpan.addClass('dijitIcon');
                        deleteSpan.addClass('dijitMenuItemIcon');
                        deleteSpan.addClass('dijitCommonIcon');
                        deleteSpan.addClass('icon-delete');
                        deleteSpan.addClass('btl-icon-16_2');
                        div.append(deleteSpan);

                        div.click(function () {

                            var ans = window.confirm("Вы действительно хотите удалить роль?");
                            if (!ans) {
                                return;
                            }

                            require(["loading"], function (loading) {
                                $.LoadingOverlay("show");
                            });

                            Alfresco.util.Ajax.jsonPost({
                                url: Alfresco.constants.PROXY_URI + "permission/role/remove",
                                dataObj: {
                                    "roleId": roleId
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


                        });
                        return div[0];
                    };

                    _this.renderTable({
                        containerId: _this.options.sourceListDivId,
                        columns: [
                            {name: "authority", title: "authority"},
                            {name: "roleName", title: "roleName"},
                            {name: "id", title: "action", format: removeRole}
                        ],
                        rows: data.roles
                    });

                    _this.renderTable({
                        containerId: _this.options.documentAlfrescoPermissionListId,
                        columns: [
                            {name: "authority", title: "authority"},
                            {name: "permission", title: "permission"},
                            {name: "access", title: "access"}
                        ],
                        rows: data.alfrescoPermissions
                    });

                    _this.renderTable({
                        containerId: _this.options.documentPermissionListId,
                        columns: [
                            {name: "authority", title: "authority"},
                            {name: "roleName", title: "roleName"},
                            {name: "permission", title: "permission"},
                            {name: "sourceDocType", title: "sourceDocType"},
                            {name: "sourceDoc", title: "sourceDoc", format: uuidToNodeRef}
                        ],
                        rows: data.permission
                    });

                    _this.renderTable({
                        containerId: _this.options.targetListDivId,
                        columns: [
                            {name: "authority", title: "authority"},
                            {name: "roleName", title: "roleName"},
                            {name: "permissionName", title: "permission"},
                            {name: "targetDocRef", title: "targetDocRef"},
                            {name: "uuid", title: "uuid", format: uuidToNodeRef}
                        ],
                        rows: data.targetPermission
                    });


                }
            }
        });
    };


    this.renderTable = function (data) {

        var container = $('#' + data.containerId);
        container.html('');

        var table = $('<table>');
        table.addClass('roleListTable');

        var header = $('<tr>');
        data.columns.forEach(function (column) {
            var columnTitle = $('<th>');
            columnTitle.text(column.title);
            header.append(columnTitle);
        });
        table.append(header);

        data.rows.forEach(function (rowData) {
            var row = $('<tr>');
            data.columns.forEach(function (column) {
                var rowHtml = $('<td>');

                var html = rowData[column.name];
                if (column.format) {
                    html = column.format(html);
                }

                rowHtml.html(html);
                row.append(rowHtml);
            });
            table.append(row);
        });
        container.append(table);
    };

    this.init();
};