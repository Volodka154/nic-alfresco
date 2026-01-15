/**
 * Created by nabokov on 24.11.2016.
 */
define(["dijit/registry"], function (registry) {
    return {
        getFormValuesById: function (id) {
            var form = registry.byId(id);
            return (form)? form.getValue() : null;
        },
        getFormWidgetByNode: function (formNode) {
            return registry.findWidgets(formNode);
        },
        editURL: function (newURL) {
            window.history.replaceState({}, null, newURL);
        },
        getStoreById: function (id) {
            return registry.byId(id).store;
        },
        getById: function (id) {
            return registry.byId(id);
        }
    }
});