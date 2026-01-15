/**
 * Created by nabokov on 08.12.2016.
 */
define(["dojo/_base/declare",
        "./_BaseUploadService",
        "alfresco/services/UploadService",
    ],
    function(declare, CrudService, UploadService) {

        return declare([CrudService, UploadService], {

        });
    });