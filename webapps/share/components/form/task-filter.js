/*
 //календари
 (function () {
 new Alfresco.DatePicker("outgoingDate-cntrl", "outgoingDate").setOptions(
 {
 currentValue: "",
 showTime: false,
 submitTime: false,
 mandatory: false
 }).setMessages({
 "form.control.date-picker.choose": "Выберите дату:",
 "form.control.date-picker.entry.date.format": "dd.MM.yyyy"
 /!*   ,
 "form.control.object-picker.current.failure": "Неверынй формат",
 "form.control.date-picker.entry.time.format": "HH:mm",
 "form.control.date-picker.display.date.format": "dd.MM.yyyy",
 "form.control.date-picker.view.time.format": "dd.MM.yyyy",

 "form.control.date-picker.entry.datetime.format.nojs": "dd.MM.yyyy",
 "form.control.date-picker.display.time.format": "HH:MM",
 "form.control.date-picker.entry.date.format": "dd.MM.yyyy"*!/
 }
 );
 })();
 (function () {
 new Alfresco.DatePicker("outgoingDateTo-cntrl", "outgoingDateTo").setOptions(
 {
 currentValue: "",
 showTime: false,
 submitTime: false,
 mandatory: false
 }).setMessages({
 "form.control.date-picker.choose": "Выберите дату:",
 "form.control.date-picker.entry.date.format": "dd.MM.yyyy"
 }
 );
 })();
 */

/*(function () {
    new Alfresco.DatePicker("DateTask-cntrl", "DateTask").setOptions(
        {
            currentValue: "",
            showTime: false,
            submitTime: false,
            mandatory: false
        }).setMessages({
            "form.control.date-picker.choose": "Выберите дату:",
            "form.control.date-picker.entry.date.format": "dd.MM.yyyy"
        }
    );
})();
(function () {
    new Alfresco.DatePicker("DateTaskTo-cntrl", "DateTaskTo").setOptions(
        {
            currentValue: "",
            showTime: false,
            submitTime: false,
            mandatory: false
        }).setMessages({
            "form.control.date-picker.choose": "Выберите дату:",
            "form.control.date-picker.entry.date.format": "dd.MM.yyyy"
        }
    );
})()*/


function clearTaskFilter() {
    clearDocFilter($gridTask)

    require(["jquery"], function ($) {

      /*  $('#executorTask-cntrl').val('');
        $('#executorTaskActual-cntrl').val('');
        $('#DateTask-cntrl-date').val('');
        $('#DateTaskTo-cntrl-date').val('');*/
        var groupModel = {
            dataIndx: [groupTask],
            collapsed: [false, false],
            title: ["<b style='font-weight:bold;'>{0} ({1})</b>", "{0} - {1}"],
            dir: ["up", "down"]
        };
        $gridTask.pqGrid("option", "groupModel", groupModel);
        $FilterTask = "/share/proxy/alfresco/documents/doc-task?q_state=" + encodeURI(encodeURI('Активные'));
        exeFilter($FilterTask+"&format=json",groupTask,$gridTask);
        /*showTask($FilterTask + "&format=json", groupTask);
        $("#grid_task").pqGrid("refreshDataAndView");*/
    });

}

function filterTask(sCountRec, sScipRec) {
    require(["jquery"], function ($) {
        var paramSearch ="/share/proxy/alfresco/documents/doc-task?q_state=" + encodeURI(encodeURI($("#state_task").val()));
        //номер
        /*var fieldVal = $("#regNumber").val();*/
        /*paramSearch = paramSearch + '?q_regNumber=*' + encodeURI(encodeURI(fieldVal)) + '*';
         //содержание
         fieldVal = $("#content").val();
         if (fieldVal !== '') {
         paramSearch = paramSearch + '&q_content=' + encodeURI(encodeURI(fieldVal));
         }*/
        //  датат от
        fieldVal = $("#DateTask").val();

        if (fieldVal !== '') {
            paramSearch = paramSearch + '&q_dateFrom=' + fieldVal;
        }
        else {
            paramSearch = paramSearch + '&q_dateFrom=MIN';
        }

        //дата до
        fieldVal = $("#DateTaskTo").val();
        if (fieldVal !== '') {
            paramSearch = paramSearch + '&q_dateTo=' + fieldVal;
        }
        else {
            paramSearch = paramSearch + '&q_dateTo=MAX';
        }

        //текущий исполнитель
        fieldVal = $("#executorTask-cntrl").attr("sub_info");

        if (fieldVal) {
            var obj = eval("(" + fieldVal + ')');
            paramSearch = paramSearch + '&q_executor=' + obj.nodeRef;
        }
        //актуальный исполнитель
        fieldVal = $("#executorTaskActual-cntrl").attr("sub_info");
        if (fieldVal) {
            var obj = eval("(" + fieldVal + ')');
            paramSearch = paramSearch + '&q_actualexecutor=' + obj.nodeRef;
        }


        // console.log("ЗапросЗадача " + paramSearch);
        $FilterTask = paramSearch;

        /*   paramSearch += "&format=json";*/
        //alert(sCountRec);
        /*  if (sCountRec!=0){paramSearch += "&q_maxItems="+sCountRec+"&q_scipItems="+sScipRec +"&q_totalRecords="+totalRecordsInc}*/
        //if (sCountRec!=0){paramSearch += "&q_maxItems="+sCountRec+"&q_scipItems="+sScipRec }
       /* showTask(paramSearch, groupTask);*/
        exeFilter(paramSearch,groupTask,$gridTask);
        // $("#grid_incomming").pqGrid("refreshDataAndView");
    })
}


/*combobox*/


require(["jquery", "combobox", "pqgrid"], function ($) {
    //Исполнитель
    var type = "btl-emp:employee-content";
    // поле по которому производится поиск
    var s_field = "surname";
    // значения какого поля ворзвращать
    var field = "surname,firstname,middlename";

    var filter = "";
    var listUrl = "/share/proxy/alfresco/filters/association?type=" + type + "&s_field=" + s_field + "&field=" + field + filter;
    $('#executorTask-cntrl').ajaxComboBox(
        listUrl,
        {
            db_table: 'nation',
            lang: 'en',
            button_img: '/share/res/js/lib/combobox/btn.png',
            bind_to: 'foo',
            sub_info: true,
            instance: true
        });
    $('#executorTaskActual-cntrl').ajaxComboBox(
        listUrl,
        {
            db_table: 'nation',
            lang: 'en',
            button_img: '/share/res/js/lib/combobox/btn.png',
            bind_to: 'foo',
            sub_info: true,
            instance: true
        });
    $(".ac_subinfo").css("display", "none");

});
