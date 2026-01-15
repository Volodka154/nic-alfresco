/**
 * Created by nabokov on 23.11.2016.
 */
define(["dojo/_base/declare",
        "meeting/choices/_Choice"],
    function (declare, Choice) {
        return declare([Choice], {
            name: "assoc_btl-meeting_project",
            header: "Выбрать проект",
            value: "",
            labelText: "Проект",
            labelButton: "Выбрать",
            urlList: "/share/proxy/alfresco/filters/association",
            dataUrl:{
                "type":"btl-project:projectDataType",
                "s_field":"shortName",
                "field":"shortName"
            },
            itemUrl:"/share/proxy/alfresco/picker/associationItem",
            dataItemUrl:{
                "type":"btl-project:projectDataType",
                "field":"shortName"
            },
            postCreate: function () {
                this.inherited(arguments);
                //this.setVisible(false);
            }
        });
    });