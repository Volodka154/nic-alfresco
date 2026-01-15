/**
 * Created by nabokov on 23.11.2016.
 */
define(["dojo/_base/declare",
        "meeting/choices/_Choice"],
    function (declare, Choice) {
        return declare([Choice], {
            name: "assoc_btl-meeting_docType",
            header: "Вид документа",
            value: "",
            labelText: "Вид документа",
            labelButton: "Выбрать",
            urlList: "/share/proxy/alfresco/filters/association",
            dataUrl:{
                "type":"btl-docType:docTypeData",
                "s_field":"name",
                "field":"name",
                "filter":"type:'\\u041c\\u0435\\u0440\\u043e\\u043f\\u0440\\u0438\\u044f\\u0442\\u0438\\u0435'"
            },
            itemUrl:"/share/proxy/alfresco/picker/associationItem",
            dataItemUrl:{
                "type":"btl-docType:docTypeData",
                "field":"name"
            }
        });
    });