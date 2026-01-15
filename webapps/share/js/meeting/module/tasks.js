/**
 * Created by nabokov on 24.01.2017.
 */
define(["dojo/_base/declare",
    "meeting/forms/_DynamicForm",
    "dijit/_TemplatedMixin",
    "dojo/text!./templates/tasks.html",
    "btlUI/TreeGrid/TaskFull",
    "meeting/utils/base",
], function (declare, DynamicForm, _TemplatedMixin, template, TaskFull, utilBase) {

    return declare([DynamicForm, _TemplatedMixin], {
        templateString: template,

        postCreate: function () {

            if (this.storeId) {
                var store = utilBase.getStoreById(this.storeId);
                if (store.document) {
                    this.documentNodeRef = store.nodeRef;
                    this.state = store.state;
                }
            }
            if (this.documentNodeRef) {
                var taskFull = new TaskFull({
                    nodeId: this.documentNodeRef,
                    formId: this.id
                });
                taskFull.placeAt(this.domNode);
                taskFull.startup();
            }
        }
    });
});