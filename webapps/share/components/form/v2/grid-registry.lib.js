/***
 * Локальная группировка отображенных записей
 * @param group - по чем группируем
 * @param $grid- jquery таблица
 * @param pq - данные пагинации
 */
function localGroup(group, $grid, pq) {
    var groupModel = null;
    if (group != null) {
        $grid.pqGrid("option", "isGrouping", true);
        clearHeaderFilters($grid);
        $grid.pqGrid("option", "dataModel.location", "local");
        var data = [];
        pq.data.forEach(function (d) {
            if (d[group] == null || d[group].length === 0) {
                var row = Object.assign({}, d);
                row[group] = "Нет";
                data.push(row);
            } else {
                d[group].split(";,").forEach(function (s) {
                    var row = Object.assign({}, d);
                    row[group] = s;
                    data.push(row);
                })
            }
        });
        var sorted = data.sort(function (a, b) {
            if (a[group] > b[group]) return 1;
            if (a[group] < b[group]) return -1;
            return 0;
        });
        $grid.pqGrid("option", "dataModel.data", sorted);
        groupModel = {
            dataIndx: [group],
            collapsed: [true],
            title: ["<b style='font-weight:bold;'>{0} ({1})</b>", "{0} - {1}"],
            dir: ["up", "down"]
        };
        $grid.find("div.pq-vscroll").pqScrollBar({cur_pos: 0});
    } else {
        $grid.pqGrid("option", "isGrouping", false);
        $grid.pqGrid("option", "isResetData", true);
        $grid.pqGrid("option", "dataModel.location", "remote");
    }
    $grid.pqGrid("option", "groupModel", groupModel);
    $grid.pqGrid("refreshDataAndView");
}

/***
 * Обновит данные с
 * @param $grid
 */
function refreshDataAndView($grid){
    $grid.pqGrid("option", "isResetData", true);
    $grid.pqGrid("refreshDataAndView");
}

/***
 * Добавляем информациб о пагинации
 * @param $grid - таблица
 */
function addPaginationBlock($grid) {
    $grid.find(".pq-grid-footer")
        .html('<span class="pq-pager-msg" style="margin-left: 7px">Отображено </span>' +
            '<span id="' + $grid.pqGrid("option", "currentCountId") + '"></span> из <span id="' + $grid.pqGrid("option", "totalCountId") + '"></span>');
}

/***
 * Функция клика ПКМ
 * @param event - событие
 * @param ui -
 * @param fn - функция которая должна быть вызвана
 * @return {boolean}
 */
function rowRightClick2(event, ui, fn) {
    var menu = document.getElementById("contextmenu");
    menu.style.display = "block";
    menu.style.left = event.pageX + "px";
    menu.style.top = event.pageY + "px";
    var menuItemCreate = document.getElementById("menuItemCreateCopy");
    menuItemCreate.nodeRef = ui.rowData.nodeRef;
    menuItemCreate.onclick = function () {
        var menu = document.getElementById("contextmenu");
        menu.style.display = "";
        fn(this.nodeRef);
    };

    return false;
}

/***
 * Ошибка получения данных для таблицы
 * @param jqXHR
 * @param textStatus
 * @param errorThrown
 */
function error2(jqXHR, textStatus, errorThrown) {
    console.error(textStatus, errorThrown)
}

/***
 * Получение данных  с бека
 * @param $grid
 * @param response
 * @param pq
 */
function getData2($grid, response, pq) {
    if (pq.requestPage === 1) {
        $grid.find("div.pq-vscroll").pqScrollBar({cur_pos: 0});
        var url = $grid.pqGrid("option", "dataUrl") + "?" +
            getGridParamsStr($grid, {count: true, timestamp: $grid.pqGrid("option", "countTimestamp")});
        Alfresco.util.Ajax.jsonGet({
            url: url,
            successCallback: {
                fn: function (response) {
                    if ($grid.pqGrid("option", "countTimestamp") == response.json.timestamp) {
                        if (response.json.count === 10000) {
                            response.json.count += "+";
                        }
                        $("#" + $grid.pqGrid("option", "totalCountId")).html(response.json.count + "");
                    }
                }
            }
        });
    }

    var pq_data = getTableData(response, pq);
    $("#" + $grid.pqGrid("option", "currentCountId")).html(pq_data.length + "");

    return {data: pq_data}
}

/***
 * Получнеие ссылки и данных фильтрации и сортировки
 * @param $grid
 * @param pq
 * @return {{data: *, url: string}}
 */
function getUrl2($grid, pq) {
    if ($grid.pqGrid("option", "isResetData") === true) {
        $grid.pqGrid("option", "isResetData", false);
        pq.data = [];
        pq.requestPage = 1;
    }
    if (pq.requestPage === 1) {
        $grid.pqGrid("option", "countTimestamp", new Date().getTime());
    }
    var ccId = $grid.pqGrid("option", "currentCountId");
    var tcId = $grid.pqGrid("option", "totalCountId");
    showPaginationLoader(pq.requestPage, ccId, tcId);
    return {
        url: $grid.pqGrid("option", "dataUrl"),
        data: getDataForUrl($grid, pq)
    }
}

/***
 * Вызываем перед сортировкой
 * @param $grid
 */
function beforeSort2($grid) {
    $grid.pqGrid("option", "isResetData", true);
    $grid.pqGrid("option", "groupModel", null);
    $grid.pqGrid("option", "isGrouping", false);
    $grid.pqGrid("option", "dataModel.location", "remote");
    var gss = $grid.pqGrid("option", "groupSelectSelector");
    var $groupSelector = $(gss);
    $groupSelector.val([]);
    $groupSelector.pqSelect("refreshData");
}

/***
 * Вызываем перед фильтрацией
 * @param $grid
 */
function beforeFilter2($grid) {
    $grid.pqGrid("option", "isResetData", true);
}

/***
 * Функция увеличивающая номера страницы при прокрутке
 * @param ui -
 * @param pq - информация о
 * @param $grid
 */
function beforeTableView2(ui, pq, $grid) {
    if (ui.initV == null) return;

    if (!pq.pending && ui.finalV >= pq.data.length - 1 && pq.data.length < pq.totalRecords) {
        pq.requestPage++;
        pq.pending = true;
        $grid.pqGrid('refreshDataAndView');
    }

    if ($grid.pqGrid("option", "isGrouping") === true) {
        $grid.find("tr.pq-grid-header-search").find("input").prop("disabled", true);
        $grid.find("tr.pq-grid-header-search").find("select.pq-select").pqSelect("disable");
        $($grid.pqGrid("option", "additionalFiltersSelector")).pqSelect("disable");
        $grid.find("button.registry-refresh-btn").prop("disabled", true);
        $grid.find("button.registry-refresh-btn").css("opacity", "0.5");
    } else {
        $($grid.pqGrid("option", "additionalFiltersSelector")).pqSelect("enable");
        $grid.find("button.registry-refresh-btn").prop("disabled", false);
        $grid.find("button.registry-refresh-btn").css("opacity", "1");
    }
}

/***
 * Получение данных для таблицы из ответа сервера
 * @param response - ответ сервера
 * @param pq - данные по пагинации
 * @return {*}
 */
function getTableData(response, pq) {
    var data = response.items,
        len = data.length,
        curPage = response.curPage,
        pq_data = pq.data,
        init = (curPage - 1) * pq.rpp;
    pq.pending = false;
    pq.totalRecords = response.totalRecords;
    for (var i = 0; i < len; i++) {
        pq_data[i + init] = data[i];
    }

    return pq_data;
}

/***
 * Вернет данны по пагшинации, начальные
 * @return {{totalRecords: number, rpp: number, requestPage: number, data: [], pending: boolean}}
 */
function getDefaultPq() {
    return {
        totalRecords: 0,
        requestPage: 1,
        pending: true,
        rpp: 50,
        data: []
    };
}

/***
 * Вернет данные для построения url
 * @param $grid - таблица как объект
 * @param pq - данные по пагинации
 */
function getDataForUrl($grid, pq) {
    var data = {
        pq_curpage: pq.requestPage,
        pq_rpp: pq.rpp,
        pq_sort: JSON.stringify(getSort($grid.pqGrid("option", "dataModel")))
    };

    var filtersData = getFiltersData($grid.pqGrid("option", "colModel"));
    if (filtersData.length > 0) {
        data.pq_filter = JSON.stringify({mode: "AND", data: filtersData});
    }
    return data;
}

var loaderImageHtml = '<img height="10" width="10" src="/share/res/components/images/lightbox/loading.gif"/>';

/***
 * Покажет картинку загрузки в переданных элементах
 * Если запрос не первой страницы, то лоадер отобразится только в кол-ве загруженных записей
 * @param requestPage - запрашиваемая страница
 * @param currentSelector - блок для оторбражения кол-ва загруженных записей
 * @param totalSelector - блок для отображения "всего" записей
 */
function showPaginationLoader(requestPage, currentSelector, totalSelector) {
    $("#" + currentSelector).html(loaderImageHtml);
    if (requestPage === 1) {
        $("#" + totalSelector).html(loaderImageHtml);
    }
}

/***
 * Сделает отображение "Дополнительно" в фильтре состояния невыделяемым
 */
function formatStateFilter() {
    disableInSelect(["Дополнительно"]);
}

/***
 * Забизейблит и перекрасит в синий элементы выбора в pq селекте
 * @param strings - массив с тектом который нужно дизейблить
 */
function disableInSelect(strings) {
    strings.forEach(function (s) {
        $(".pq-select-option-label.ui-state-enable+label:contains('" + s + "')")
            .prop('disabled', true)
            .removeClass("pq-select-option-label ui-state-enable pq-state-hover")
            .addClass("fd");
    })
}

/***
 * Очистит фильтры таблицы
 * @param $grid - таблица
 * @param additionalFilterSelectors {Array.of(String)} - массив селекторов для доп фильтров которые нужно сбросить
 */
function clearGridFilters($grid, additionalFilterSelectors) {
    clearHeaderFilters($grid);
    if (additionalFilterSelectors != null) {
        additionalFilterSelectors.forEach(function (s) {
            $(s).val([]);
            $(s).pqSelect("refreshData");
        })
    }
    if ($grid.pqGrid("option", "groupSelectSelector") != null) {
        var $groupSelect = $($grid.pqGrid("option", "groupSelectSelector"));
        $groupSelect.val([]);
        $groupSelect.pqSelect("refreshData");
        $groupSelect.trigger("change");
    } else {
        $grid.pqGrid("refreshDataAndView");
    }
    formatStateFilter();
}

/***
 * Очистка фильров хедера таблицы, без обновления даты и вью
 * @param $grid
 */
function clearHeaderFilters($grid) {
    $grid.pqGrid("getColModel").forEach(function (cm) {
        var filter = cm.filter;
        if (filter != null) {
            filter.value = null;
            filter.value2 = null;
            filter.cache = null;
        }
    });
    $($grid.pqGrid("option", "additionalFiltersSelector")).val([]).pqSelect("refreshData");
}

/***
 * Вернет данные по сортировке таблицы
 * @param dataModel
 * @return {[{dataIndx, dir}]}
 */
function getSort(dataModel) {
    if (dataModel == null || dataModel.sortIndx == null || dataModel.sortIndx.length === 0) return [];
    return [{dataIndx: dataModel.sortIndx, dir: dataModel.sortDir}];
}

/***
 * Выбрать все отображаемые строки
 * @param el
 * @param $grid
 */
function selectAllInGrid(el, $grid) {
    var checked = $(el).prop("checked");
    $grid.pqGrid("selection", {
        type: 'row',
        all: 'all',
        method: checked ? 'selectAll' : 'removeAll'
    });
}

/***
 * Вернет данные по заполненным фильтрам
 * @param colModel
 * @return {Array.of(Object)}
 */
function getFiltersData(colModel) {
    return colModel.filter(function (c) {
        return c.filter != null
            && (String(c.filter.value || "").length > 0 || String(c.filter.value2 || "").length > 0);
    }).map(function (c) {
        return {
            dataIndx: c.dataIndx,
            dataType: c.dataType,
            value: c.filter.value,
            value2: c.filter.value2,
            condition: c.filter.condition
        }
    });
}

/***
 * Вернет параметры запроса для данных
 * @param $grid {Object} - таблица
 * @param params {Object} - доп параметры
 */
function getGridParamsStr($grid, params) {
    var filtersData = getFiltersData($grid.pqGrid("option", "colModel"));
    var p = params || {};
    if (filtersData.length > 0) {
        p = $.extend(p, {
            pq_filter: JSON.stringify({
                mode: "AND",
                data: filtersData
            })
        });
    }
    return $.param(p);
}