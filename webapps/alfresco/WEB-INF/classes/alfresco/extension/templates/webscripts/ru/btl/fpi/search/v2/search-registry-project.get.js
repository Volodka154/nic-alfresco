<import resource="classpath:alfresco/extension/templates/webscripts/ru/btl/fpi/search/v2/search-registry.lib.js">;

    var statuses = [
    "Черновик",
    "В работе",
    "Закрыт"
    ];


    (function () {
        var searchRegistry = SearchRegistry.constructor(args,
        '(TYPE:"btl-project:projectDataType")',
        [],
        function (n, now, in3days) {
        return {
        "nodeRef": n.nodeRef + "",
        "btl-project:shortName": n.properties["btl-project:shortName"],
        "btl-project:projectManager-login": n.properties["btl-project:projectManager-content"],

        "btl-project-aspect:author-login": n.properties["btl-project-aspect:author-content"],
        "btl-project-aspect:chiefDesigner-login": n.properties["btl-project-aspect:chiefDesigner-content"],
        "btl-project-aspect:systemArchitect-login": n.properties["btl-project-aspect:systemArchitect-content"],
        "btl-project-aspect:systemsAnalyst-login": n.properties["btl-project-aspect:systemsAnalyst-content"],

        "btl-project:state": statuses[n.properties["btl-project:state"]],
        "cm:created": dateToString(n.properties["cm:created"], "dd-MM-yyyy"),
    };
    }, {
        "btl-project:projectManager-login":"btl-project:projectManager-content",
        "btl-project-aspect:author-login":"btl-project-aspect:author-content",
        "btl-project-aspect:chiefDesigner-login":"btl-project-aspect:chiefDesigner-content",
        "btl-project-aspect:systemArchitect-login":"btl-project-aspect:systemArchitect-content",
        "btl-project-aspect:systemsAnalyst-login":"btl-project-aspect:systemsAnalyst-content",
    }, "btl-project:projectDataType");

        model.data = searchRegistry.getData();
    })();