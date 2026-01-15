/**
 * Created by nabokov on 08.12.2016.
 */
define(["dojo/_base/declare",
        "alfresco/services/_BaseUploadService"
    ],
    function(declare, _BaseUploadService) {

        return declare([_BaseUploadService], {
            constructUploadData: function alfresco_services__BaseUploadService__constructUploadData(file, fileName, targetData) {

                // This is to work around the fact that pickers always return an array, even in
                // single item mode - that needs to be better resolved at some point
                var destination = targetData.destination;
                if (destination.constructor === Array) {
                    destination = destination[0];
                }
                this.updateUploadHistory(destination);

                // Create object using information defined in payload
                return {
                    filedata: file,
                    filename: fileName,
                    destination: destination,
                    siteId: targetData.siteId,
                    containerId: targetData.containerId,
                    uploaddirectory: targetData.uploadDirectory || file.relativePath || null,
                    majorVersion: targetData.majorVersion ? targetData.majorVersion : "true",
                    updateNodeRef: targetData.updateNodeRef,
                    description: targetData.description,
                    overwrite: targetData.overwrite,
                    thumbnails: targetData.thumbnails,
                    username: targetData.username
                };
            },
        });
    });