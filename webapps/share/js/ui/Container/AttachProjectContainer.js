/**
 * Created by nabokov on 07.09.2016.
 */
define(["dojo/_base/declare",
    "./AttachContainer",
    "jquery", "jqueryui", "btl/ext/jquery.multiselect.min"
], function (declare, AttachContainer, $) {
    return declare([AttachContainer], {    	    	
    	contentType:"btl-projectsAttachments:projectsAttachmentsDataType",
        render: function () {
            this.attachTreeGrid.loadonce = true;
            this.attachTreeGrid.contentType = this.contentType;
            this.attachTreeGrid.colModel.splice(-1, 0, {
                    "name": "stagePR",
                    //"sorttype":"string",
                    "label": "Стадия проекта",
                    "width": 120,
                    "fixed": true,
                    "stype": "select",
                    formatter: 'stagePRFmatter',
                    searchoptions: {
                        //multiple:true,
                        style: "width: 100%;",
                        clearSearch: false,

                        /*dataInit : function (elem) {
                         var options = {
                         height: "150",
                         minWidth : 'auto',
                         width: "100",
                         position: {
                         my: 'center',
                         at: 'left bottom'
                         }
                         };
                         $elem = $(elem);
                         $elem.multiselect(options);
                         $elem.siblings('button.ui-multiselect').css({
                         width: "100%",
                         marginTop: "1px",
                         marginBottom: "1px",
                         paddingTop: "3px"
                         });
                         },*/
                        value: ":Все;0:Заявка;1:НТС;2:Утверждение;3:Реализация;4:Завершение"
                    }
                }
            );

            $.extend($.fn.fmatter , {
                stagePRFmatter : function(cellvalue, options, rowdata) {
                    switch(cellvalue){
                        case "0":
                            return "Заявка";
                        case "1":
                            return "НТС";
                        case "2":
                            return "Утверждение";
                        case "3":
                            return "Реализация";
                        case "4":
                            return "Завершение";
                        default:
                            return "";
                    }
                }
            });

            this.inherited(arguments);
            this.attachTreeGrid.grid.jqGrid('filterToolbar', {
                stringResult: true,
            });
        },
        refreshAttachmentsGrid: function (data) {
            this.attachTreeGrid.setDataFromServer();
        },
    });
});