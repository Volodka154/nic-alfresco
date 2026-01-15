<style>
    .container {
        margin: 0 auto;
        width: 1400px;
        height: 1000px;
        margin-top: 20px;
    }

    .btn {
        display: inline-block;
        padding: 6px 12px;
        margin: 5px;
        font-size: 14px;
        font-weight: normal;
        line-height: 1.42857143;
        text-align: center;
        white-space: nowrap;
        vertical-align: middle;
        -ms-touch-action: manipulation;
        touch-action: manipulation;
        cursor: pointer;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        color: #fff;
        background-color: #337ab7;
        border: 1px solid transparent;
        border-radius: 4px;
    }

    table {
        border-collapse: collapse;
        width: 100%;
    }

    table td, th {
        border: 1px solid #ddd;
        margin: 5px;
        padding: 5px;
        font-family: sans-serif;
        font-size: 13px;

    }

    @media print {
        /*скрыть кнопки для печати*/
        .btn {
            display: none;
        }

    }

    .panel-heading {
        padding: 5px 5px;
        border-bottom: 1px solid transparent;
        border-top-left-radius: 3px;
        border-top-right-radius: 3px;
        text-align: center;
    }

    .panel-body {
        padding: 8px;
    }

    .form-container fieldset {
        border: 1px solid #aaaaaa;
        padding: 1.2em 0 0.5em 1.5em;
        margin-bottom: 1em;
    }

    .panel {
        border: 1px solid transparent;
        border-radius: 4px;
        background-color: #fff;
        border: 1px solid transparent;
        border-radius: 4px;
        box-shadow: 0 1px 1px rgba(0, 0, 0, .05);
        margin-bottom: 5px;
    }

    .panel-default {
        border-color: #ddd;
    }

    .panel-default > .panel-heading {
        color: #333;
        background-color: #f5f5f5;
        border-color: #ddd;
    }

    .panel-primary > .panel-heading {
        color: #fff;
        background-color: #337ab7;
        border-color: #337ab7;
    }

    .panel-success > .panel-heading {
        color: #3c763d;
        background-color: #dff0d8;
        border-color: #d6e9c6;
    }

    .panel-info > .panel-heading {
        color: #31708f;
        background-color: #d9edf7;
        border-color: #bce8f1;
    }

</style>


<div class="container">
    <div class="panel panel-default">
        <div class="panel-heading">${msg("Head.label")}</div>
        <div class="panel-body">
            <button id="print" class="btn" onclick="javaScript:window.print();">${msg("Button.print.label")}</button>
            <button id="exportExcel" class="btn" onclick="toExcel()">${msg("Button.download.label")}</button>
            <table  border="1" id="grid_project" >
                <th>${msg("Table.head.cod")}</th>
                <th>${msg("Table.head.manager")}</th>
                <th>${msg("Table.head.path")}</th>
                <th>${msg("Table.head.type")}</th>
                <th>${msg("Table.head.stage")}</th>
                <th>${msg("Table.head.org")}</th>
                <th>${msg("Table.head.state")}</th>

            <#list data.items as item>
                <tr>
                    <td>${item['btl-project:shortName']!""}</td>
                    <td>${item['btl-project:projectManager-login']!""}</td>
                    <td>${item['btl-project:directionDepartment-ref']!""}</td>
                    <td>${item['btl-project:projectType']!""}</td>
                    <td>${item['btl-project:stage']!""}</td>
                    <td>${item['btl-project:executionOrganization-ref']!""}</td>
                    <td>${item['btl-project:state']!""}</td>
                </tr>
                <#if item_has_next></#if>
            </#list>
            </table>
        </div>
    </div>
</div>

<script>
    function printTo() {
        window.print();
    }
    function toExcel() {
        var table = document.getElementById("grid_degree");
        var html =  table.outerHTML;
        var a = document.createElement('a');
        var data_type = 'data:application/vnd.ms-excel';
        a.href = data_type + ', \uFEFF' +  encodeURIComponent(html);
        a.download = '${msg("File.name")}.xls';
        a.click();
    }
</script>
