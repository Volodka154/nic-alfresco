/**
 * Created by nabokov on 23.11.2016.
 */
define(["dojo/_base/declare",
        "meeting/choices/_Choice"],

    function (declare, Choice) {
        return declare([Choice], {
            id: "assoc_btl-meeting_chairman",
            name: "assoc_btl-meeting_chairman",
            header: "Выбрать председателя",
            value: "",
            labelText: "Председатель",
            labelButton: "Выбрать",
            urlList: "/share/proxy/alfresco/filters/association",
            dataUrl:{
                "type":"btl-emp:employee-content",
                "s_field":"btl-people:fio",
                "field":"btl-people:fio"
            },
            itemUrl:"/share/proxy/alfresco/picker/associationItem",
            dataItemUrl:{
                "type":"btl-emp:employee-content",
                "field":"btl-people:fio"
            },
            requirementConfig: {initialValue: false},
        });
    });