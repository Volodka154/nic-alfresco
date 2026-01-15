require(["jquery", "pqgrid", "combobox", "pqselect", "jquery-ui.datepicker-ru", "jquery.datepicker.extension.range", "dojo/domReady!"], function ($) {
    createMenuAndAndGridDiv();
    loadCounters();
    clickMainMenu();

    $(window).resize(function () {
        if (!$(".mask").is(":visible")) {
            if (refreshTimeout != null) {
                clearTimeout(refreshTimeout);
            }
            //таймауты чтобы процом помещение не обограевать
            refreshTimeout = setTimeout(function () {
                getActiveGrid().pqGrid("refreshView");
            }, 500);
        }
    });
});
var refreshTimeout = null;
var services = {};

/***
 * После отрисовки всей фигни кликнет на мейн меню
 */
function clickMainMenu() {
    whenElementIsReady("#" + sessionStorage.getItem("menuTasksAndDocsItem"), function (element) {
        $(element).click();
    });
}

/***
 * Выполнит функцию, когда элемент будет отрисован
 * @param s {string} - CSS  селектор элемента
 * @param f {function} - функция для вызова, когда элемент убдет готов, принимает элемент f(element)
 * @param n {number|undefined} - номер итерации, при вызове не указывается, используется чтобы код не ушел в бесконечный цикл,
 *      максимум 25 итераций, 2500 милисекунд
 */
function whenElementIsReady(s, f, n) {
    if (n == null || n < 25) {
        setTimeout(function () {
            var $e = $(s);
            if ($e.length > 0) {
                $e.each(function (k, v) {
                    f(v);
                });
            } else {
                whenElementIsReady(s, f, (n || 0) + 1);
            }
        }, 100);
    }
}

/***
 * Загрузит счетчики для меню
 */
function loadCounters() {
    Object.keys(services).forEach(function (menuId) {
        var url = services[menuId].url;
        if (url != null && services[menuId].count === true) {
            Alfresco.util.Ajax.jsonGet({
                url: "/share/proxy/alfresco/" + url + "?count=true",
                successCallback: {
                    fn: function (response) {
                        var count;
                        if (response.json.func === "mail_input" && response.json.noReadCount != null) {
                            count = response.json.noReadCount;
                        } else if (response.json.cnt_whole != null) {
                            count = response.json.cnt_whole;
                        } else {
                            count = response.json.count;
                        }
                        setMenuItemCounterValue(menuId, count);
                    }
                }
            });
        }
    })
}

/***
 * Создание меню и элементов грида из файла конфигурации Репозиторий> btlRepo> Configs
 * (если у пользователя уникальный, то он будет в папке Users)
 */
function createMenuAndAndGridDiv() {
    var settingTaskAndDocument = window.BTL["settingTaskAndDocument"];
    Object.keys(settingTaskAndDocument).forEach(function (key) {
        var menuGroup = settingTaskAndDocument[key];
        var $menuGroup = $('<div id="' + menuGroup.id + '"></div>');

        Object.keys(menuGroup.submenu).forEach(function (smk) {
            var submenu = menuGroup.submenu[smk];
            var submenuItems = submenu.value.filter(function (v) {
                return v.visible;
            });

            if (submenuItems.length > 0) {
                var $submenu = $('<div id="' + submenu.id + '"></div>');
                if (submenu.name != null) {
                    $submenu.append($('<div class="title"><h3>' + submenu.name + '</h3></div>'))
                } else {
                    $menuGroup.append($('<div class="title"><h3>' + menuGroup.name + '</h3></div>'));
                }
                submenuItems.sort(function (a, b) {
                    return a.position - b.position;
                }).forEach(function (smi) {
                    if (smi.isMain) {
                        sessionStorage.setItem('menuTasksAndDocsItem', smi.id);
                    }
                    services[smi.id] = smi;

                    var menuItemEl = '<div id="' + smi.id + '" class="item-menu">' +
                        '<span>' + (smi.aliasName || smi.name) + '</span>';
                    if (smi.count === true) {
                        menuItemEl += '&nbsp;<span class="count">(<img height="10" width="10" src="/share/res/components/images/lightbox/loading.gif"/>)</span>';
                    }
                    menuItemEl += '</div>';

                    $submenu.append($(menuItemEl));
                    createGridDiv(smi.id);
                });
                $menuGroup.append($submenu);
            }
        });

        if ($menuGroup.find("div").length > 1) {
            $("#left-column-tasks-and-documents_dashlet").append($menuGroup);
        }
    });
}

/***
 * Вернет иденгтификатор контейнера для грида
 * @param menuItemId
 * @return {string}
 */
function getGridContainerId(menuItemId) {
    return menuItemId + "_gridContainer";
}

/***
 * Вернет идентификатор для грида
 * @param menuItemId
 * @return {string}
 */
function getGridId(menuItemId) {
    return menuItemId + "_grid";
}

/***
 * Вернет идентификатор для кнопки "Группировка по документу"
 * @param gridId
 * @return {string}
 */
function getGroupToggleId(gridId) {
    return gridId + "_group-toggle";
}

/***
 * Вернет идентификатор для кнопки "Группировка по документу"
 * @param gridId
 * @return {string}
 */
function geUpdateButtonId(gridId) {
    return gridId + "_update-btn";
}

function geDeleteButtonId(gridId) {
    return gridId + "_delete-btn";
}

/***
 * Вернет идентификатор для фильтра "Особый контроль"
 * @param gridId
 * @return {string}
 */
function getSpecialControlToggleId(gridId) {
    return gridId + "_special-toggle";
}

/***
 * Вернет идентификатор для фильтра "Срочные документы"
 * @param gridId
 * @return {string}
 */
function getUrgentlyToggleId(gridId) {
    return gridId + "_urgently-toggle";
}

/***
 * Вернет идентификатор для фильтра "Все"
 * @param gridId
 * @return {string}
 */
function getFilterAllId(gridId) {
    return gridId + "_filterAll";
}

/***
 * Вернет идентификатор для фильтра "Неделя"
 * @param gridId
 * @return {string}
 */
function getFilterWeekId(gridId) {
    return gridId + "_filterWeek";
}

/***
 * Вернет идентификатор для фильтра "Месяц"
 * @param gridId
 * @return {string}
 */
function getFilterMonthId(gridId) {
    return gridId + "_filterMonth";
}

/***
 * Вернет идентификатор для фильтра "Год"
 * @param gridId
 * @return {string}
 */
function getFilterYearId(gridId) {
    return gridId + "_filterYear";
}

/***
 * Вернет идентификатор для фильтра "Просроченные"
 * @param gridId
 * @return {string}
 */
function getFilterOverdueId(gridId) {
    return gridId + "_filterOverdue";
}

/***
 * Вернет день начала недели, понедельник
 * @param date {Date|null}
 * @return {Date}
 */
function getWeekStartDate(date) {
    if (date == null) {
        date = new Date();
    }
    date.setHours(0, 0, 0, 0);
    var day = date.getDay(),
        diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(date.setDate(diff));
}

/***
 * Вернет день конца недели, воскресенье
 * @param date {Date|null}
 * @return {Date}
 */
function getWeekEndDate(date) {
    if (date == null) {
        date = new Date();
    }
    date.setHours(0, 0, 0, 0);
    var day = date.getDay(),
        diff = date.getDate() - day + (day === 0 ? 0 : 7); // adjust when day is sunday
    return new Date(date.setDate(diff));
}

/***
 * Вернет первый день месяца
 * @param date {Date|null}
 * @return {Date}
 */
function getMonthStartDate(date) {
    if (date == null) {
        date = new Date();
    }
    date.setHours(0, 0, 0, 0);
    return new Date(date.setDate(1));
}

/***
 * Вернет последний день месяца
 * @param date {Date|null}
 */
function getMonthEndDate(date) {
    if (date == null) {
        date = new Date();
    }
    date.setHours(0, 0, 0, 0);
    return new Date(date.setDate(daysInMonth(date)));
}

/***
 * Вернет дату начала года
 * @param date {Date|null}
 */
function getYearStartDate(date) {
    if (date == null) {
        date = new Date();
    }
    return new Date(date.getFullYear(), 0, 1);
}

/***
 * Вернет дату конца года
 * @param date {Date|null}
 */
function getYearEndDate(date) {
    if (date == null) {
        date = new Date();
    }
    return new Date(date.getFullYear(), 11, 31);
}

/***
 * Вернет вчера, от даты
 * @param date {Date|null}
 */
function getYesterday(date) {
    if (date == null) {
        date = new Date();
    }
    date.setHours(0, 0, 0, 0);
    return new Date(date.setDate(date.getDate() - 1));
}

/***
 * Вернет строку dd.MM.yyy
 * @param date {Date} - not null
 */
function toFormattedStr(date) {
    date.setHours(-(date.getTimezoneOffset() / 60)); //на случай если часы не установлены или меньше таймзоны
    return date.toISOString()
        .substr(0, 10)
        .split("-")
        .reverse()
        .join(".");
}

/***
 * Создание элементов для отрисовки таблиц
 * @param menuItemId
 */
function createGridDiv(menuItemId) {
    var gridId = getGridId(menuItemId);
    var el =
        '<div id="' + getGridContainerId(menuItemId) + '" style="display: none">';
    if (services[menuItemId].gridType === "task-local") {
        el += '<div>' +
            '    <div class="first-filters">' +
            '      <div class="item-first-filters active" id="' + getFilterAllId(gridId) + '">Все задачи</div>' +
            '      <div class="item-first-filters" id="' + getFilterWeekId(gridId) + '">Задачи на неделю <span class="count">(<img height="10" width="10" src="/share/res/components/images/lightbox/loading.gif"/>)</span></div>' +
            '      <div class="item-first-filters" id="' + getFilterMonthId(gridId) + '">Задачи на месяц <span class="count">(<img height="10" width="10" src="/share/res/components/images/lightbox/loading.gif"/>)</span></div>' +
            '      <div class="item-first-filters" id="' + getFilterYearId(gridId) + '">Задачи на год <span class="count">(<img height="10" width="10" src="/share/res/components/images/lightbox/loading.gif"/>)</span></div>' +
            '      <div class="item-first-filters background-red color-white" id="' + getFilterOverdueId(gridId) + '">Просроченные <span class="count">(<img height="10" width="10" src="/share/res/components/images/lightbox/loading.gif"/>)</span></div>' +
            '      <div class="clean"></div>' +
            '    </div>' +
            '  </div>';
    }
    el += ' <div id="' + gridId + '"></div></div>';

    $("#right-column-tasks-and-documents_dashlet").append($(el));
}

/***
 * Вернет кол-во дней в месяце
 * @param date
 * @return {number}
 */
function daysInMonth(date) {
    return 33 - new Date(date.getFullYear(), date.getMonth(), 33).getDate();
}

/***
 * Обновит данные с сервера
 * @param gridId
 */
function refreshLocalGridDataAndView(gridId) {
    var $grid = $("#" + gridId);
    clearHeaderFilters($grid);

    switchActiveTabFilter($grid, "#" + getFilterAllId(gridId));
    $grid.pqGrid("option", "dataModel.location", "remote");
    $grid.pqGrid("refreshDataAndView");
}

/***
 *
 * Обновит данные с сервера
 * @param gridId
 */
function refreshRemoteGridDataAndView(gridId) {
    var $grid = $("#" + gridId);
    if ($grid.pqGrid("option", "groupModel") !== null && $grid.pqGrid("option", "groupToggleId") != null) {
        $("#" + $grid.pqGrid("option", "groupToggleId")).click();
    } else {
        clearHeaderFilters($grid);
        $grid.pqGrid("refreshDataAndView");
    }
}

/***
 * Вкл/выкл группировку
 * @param gridId

 */
function toggleGrouping(gridId) {
    var $grid = $("#" + gridId);
    var groupToggleId = $grid.pqGrid("option", "groupToggleId");
    var checked = $("#" + groupToggleId).prop("checked");
    var groupModel = null;
    if (checked) {
        groupModel = {
            dataIndx: ["doc_a"],
            title: ["<b style='font-weight:bold;'>{0}</b>"],
            dir: ["up"]
        };
    }
    $grid.pqGrid("option", "groupModel", groupModel);
    setTimeout(function () {
        $grid.pqGrid("refreshView");
    }, 100);
}

/***
 * Заполнит опции фильтрации для колонки, исходя из переданных данных
 * @param $grid
 * @param items
 * @param key
 */
function fillLocalFilter($grid, items, key) {
    var filter = $grid.pqGrid("getColumn", {dataIndx: key}).filter;
    filter.cache = null;
    filter.options = items.reduce(function (acc, item) {
        var v = item[key];
        if (acc.indexOf(v) === -1) {
            acc.push(v);
        }
        return acc;
    }, []).map(function (v) {
        var o = {};
        o[key] = v;
        return o;
    });
}

var loaderImageHtml = '<img height="10" width="10" src="/share/res/components/images/lightbox/loading.gif"/>';

/***
 * Покажет гиф загрузки счетчика для меню
 * @param menuItemId
 */
function showMenuItemCounterLoader(menuItemId) {
    $("#" + menuItemId).find(".count").html("(" + loaderImageHtml + ")")
}

/***
 * Добавит кол-во в счетчик меню
 * @param menuItemId
 * @param count
 */
function setMenuItemCounterValue(menuItemId, count) {
    $("#" + menuItemId).find(".count").html("(" + count + ")");
}

/***
 * Очистка фильров хедера таблицы, без обновления даты и вью
 * @param $grid
 */
function clearHeaderFilters($grid) {
    var reset = false;
    $grid.pqGrid("getColModel").forEach(function (cm) {
        var filter = cm.filter;
        if (filter != null) {
            if (!reset) {
                reset = (filter.value || "").length !== 0 || (filter.value2 || "").length !== 0;
            }
            filter.value = null;
            filter.value2 = null;
            filter.cache = null;
        }
    });
    if (reset) {
        $grid.pqGrid("filter", {
            oper: "replace",
            data: []
        });
    }
}

/***
 * Установит значения в фильтр дат
 * @param $grid
 * @param dataIndx
 * @param value1
 * @param value2
 * @param showV1 (nullable) - показать значение 1 в селекте
 * @param showV2 (nullable) - показать значение 2 в селекте
 */
function setFilterDateRange($grid, dataIndx, value1, value2, showV1, showV2) {
    $grid.pqGrid("filter", {
        oper: "replace",
        data: [{
            dataIndx: dataIndx,
            condition: "between",
            value: value1,
            value2: value2
        }]
    });
    if (showV1 === undefined || showV1 === true) {
        $grid.find('input[name="duration"].pq-from').val(value1);
    }
    if (showV2 === undefined || showV2 === true) {
        $grid.find('input[name="duration"].pq-to').val(value2);
    }
}

/***
 * Подсчитает пол-во записей в диапазоне дат
 * @param items - записи
 * @param date1 {Date} - начала диапазона
 * @param date2 {Date} - конец диапазона
 * @param key - какой ключ в объектах сравнивать, строка которую отпарсит метод Date.parse()
 * @return {number} - кол-во записей
 */
function contItemsBetweenDates(items, date1, date2, key) {
    return items.reduce(function (acc, item) {
        var d = item[key];
        if (d != null && d.length > 0) {
            d = new Date(item[key].split("\.").reverse());
            if (d != null && date1 <= d && d <= date2) {
                acc++;
            }
        }
        return acc;
    }, 0);
}

/***
 * Сбросить группировку для таблицы
 * @params $grid
 */
function clearGrouping($grid) {
    if ($grid.pqGrid("option", "groupModel") !== null && $grid.pqGrid("option", "groupToggleId") != null) {
        $("#" + $grid.pqGrid("option", "groupToggleId")).click();
    }
}

/***
 * Заполнить счетчики таб фильтра
 * @param $grid
 * @param items
 */
function countForTabFilters($grid, items) {
    var gridId = $grid.pqGrid("option", "gridId");
    var $containerGrid = $("#" + $grid.pqGrid("option", "containerGridId"));

    //за неделю
    var wCount = contItemsBetweenDates(items, getWeekStartDate(), getWeekEndDate(), "duration");
    $containerGrid.find("#" + getFilterWeekId(gridId)).find(".count").html("(" + wCount + ")");
    //за месяц
    var mCount = contItemsBetweenDates(items, getMonthStartDate(), getMonthEndDate(), "duration");
    $containerGrid.find("#" + getFilterMonthId(gridId)).find(".count").html("(" + mCount + ")");
    //за год
    var yCount = contItemsBetweenDates(items, getYearStartDate(), getYearEndDate(), "duration");
    $containerGrid.find("#" + getFilterYearId(gridId)).find(".count").html("(" + yCount + ")");
    //просроченные
    var oCount = contItemsBetweenDates(items, new Date(0), getYesterday(), "duration");
    $containerGrid.find("#" + getFilterOverdueId(gridId)).find(".count").html("(" + oCount + ")");
}

/***
 * Высота грида
 * @param gridId
 * @return {number}
 */
function getGridHeight(gridId) {
    if ($("#" + getFilterAllId(gridId)).length > 0) {
        return 842;
    } else {
        return 879;
    }
}

/***
 * Вернет id активной таблицы
 * @return {string|null}
 */
function getActiveGridId() {
    var $activeMenu = $('.item-menu.active');
    if ($activeMenu.length > 0) {
        return getGridId($activeMenu[0].id);
    } else {
        return null;
    }
}

/***
 * Вернет активную таблицу обернутую жквери
 * @return {Object}
 */
function getActiveGrid() {
    return $("#" + getActiveGridId());
}

/***
 * Функция обновит активную таблицу, нужна чтобы все не сломалось т.к. легаси кода там тьма :(
 * @private
 */
function _refreshGrid() {
    $('.item-menu.active').click();
}

/***
 * Без понятия нафиг оно использщуется гдето в недрах открытия формы
 * @return {boolean}
 */
function isCompleteMe() {
    var $activeMenu = $('.item-menu.active');
    if ($activeMenu.length > 0) {
        return $activeMenu[0].id.indexOf("delegateMe") >= 0;
    } else {
        return false;
    }
}

/***
 * Установит активным выбранный фильтр, только отображение
 * @param $grid
 * @param target
 */
function switchActiveTabFilter($grid, target) {
    var containerGridId = $grid.pqGrid("option", "containerGridId");
    $("#" + containerGridId).find(".item-first-filters.active").removeClass("active");
    $(target).addClass("active");
}

/***
 * Изменить значения фильтра
 * @param gridId
 * @param filterName
 * @param filterValue
 */
function changeSimpleFilter(gridId, filterName, filterValue) {
    var $grid = $("#" + gridId);
    var filters = $grid.pqGrid("option", "colModel").filter(function (cm) {
        return cm.filter != null && cm.dataIndx !== filterName;
    }).map(function (cm) {
        return {
            dataIndx: cm.dataIndx,
            condition: cm.filter.condition,
            value: cm.filter.value,
            value2: cm.filter.value2,
        }
    });
    filters.push({
        dataIndx: filterName,
        condition: "equal",
        value: filterValue
    });
    $grid.pqGrid("filter", {oper: 'replace', data: filters});
    $grid.pqGrid("refreshView", {header: false});
}

/***
 * Лиснер на кнопку "Выделить все"
 * @param el
 * @param gridId
 */
function selectAllChange(el, gridId) {
    var checked = $(el).prop("checked");
    $("#" + gridId).pqGrid("selection", {
        type: "row",
        all: "all",
        method: checked ? "selectAll" : "removeAll"
    });
}

/**
 * Откроет страницу создания письма-ответа
 * @param gridId
 */
function replyMails(gridId) {

    var $grid = $("#" + gridId);
    var selected = $grid.pqGrid("option", "dataModel.data")
        .filter(function (item) {
            return item["sel"] === true;
        }).map(function (item) {
            return item["nodeRef"];
        });

    if (selected.length > 0) {

        var url = "/share/page/arm/mailMessage?formId=mailMessage&reply=" + selected.toString();

        var iframeDialog = createFormIFrame(url);

        document.frameCancel  = function() {
            iframeDialog.hide()
        };

        document.frameSave  = function() {
            iframeDialog.hide()
        };

        iframeDialog.show();


    } else {
        Alfresco.util.PopupManager.displayMessage(
            {
                text: "Нет выбранных элементов",
                displayTime: 1
            });
    }
}

/***
 * Удалит выбранные письма
 * @param gridId
 */
function deleteSelectedMails(gridId) {
    var $grid = $("#" + gridId);
    $grid.pqGrid("showLoading");
    var selected = $grid.pqGrid("option", "dataModel.data")
        .filter(function (item) {
            return item["sel"] === true;
        }).map(function (item) {
            return item["nodeRef"];
        });
    if (selected.length > 0) {
        var ans = window.confirm("Вы действительно хотите удалить выбранные письма?");
        if (ans) {
            Alfresco.util.Ajax.jsonPost({
                url: "/share/proxy/alfresco/mailMessage/delete",
                dataObj: {
                    "nodes": selected,
                    "gridId": gridId
                },
                successCallback: {
                    fn: function (response) {
                        Alfresco.util.PopupManager.displayMessage(
                            {
                                text: "Письма удалены",
                                displayTime: 1
                            });
                        $grid.pqGrid("hideLoading");
                        refreshLocalGridDataAndView(gridId);
                    }
                }
            });
        }
    } else {
        Alfresco.util.PopupManager.displayMessage(
            {
                text: "Нет выбранных элементов",
                displayTime: 1
            });
        $grid.pqGrid("hideLoading");
    }
}

/***
 * Удалит выбранные поручения или документы
 * @param gridId
 */
function deleteSelected(gridId) {
    var $grid = $("#" + gridId);
    var selected = $grid.pqGrid("option", "dataModel.data")
        .filter(function (item) {
            return item["sel"] === true;
        }).map(function (item) {
            return item["nodeRef"];
        });
    if (selected.length > 0) {
        var ans = window.confirm("Вы действительно хотите удалить выбранные документы?");
        if (ans) {
            var data = $grid.pqGrid("option", "dataModel.data");
            $grid.pqGrid("showLoading");
            var toDelete = [];
            var toDelteIds = [];
            $.each(data, function (key, value) {
                if (value["sel"] == true) {
                    toDelteIds.push(key);
                    toDelete.push(value["nodeRef"]);
                }
            });

            $grid.pqGrid("selection", {
                type: 'row',
                all: 'all',
                method: 'removeAll'
            });

            toDelteIds.forEach(function(k){
                $grid.pqGrid( "deleteRow", { rowIndx: k } );
            });

            if (toDelete.length == 0){
                refreshTable($grid);
            } else {
                $grid.pqGrid( "option", "isResetData", true);
                Alfresco.util.Ajax.jsonPost({
                    url: "/share/proxy/alfresco/slingshot/doclib/action/files?alf_method=delete",
                    dataObj: {
                        "nodeRefs": toDelete
                    },
                    successCallback: { fn: function (response) {
                            refreshTable($grid);
                        }
                    },
                    failureCallback: { fn: function (response) {
                            refreshTable($grid);
                            Alfresco.util.PopupManager.displayPrompt({
                                title: "Ошибка удаления",
                                text: getFormattedDateTime(new Date()) + "\nОдин или несколько документов удалить не удалось"
                            });
                        }
                    }
                });
            }
        }
    } else {
        Alfresco.util.PopupManager.displayMessage(
            {
                text: "Нет выбранных элементов",
                displayTime: 1
            });
        $grid.pqGrid("hideLoading");
    }
}

function refreshTable(table){
    table.pqGrid("hideLoading");
    table.pqGrid("refreshDataAndView");
}


/***
 * Иницаилизация таблицы
 * @param containerGridId
 * @param gridId
 * @param menuItemId
 */
function initLocalReviewGrid(containerGridId, gridId, menuItemId) {
    var colModel = [
        {
            title: "Вид документа",
            minWidth: 100,
            width: 150,
            dataType: "string",
            dataIndx: "type",
            filter: {
                type: "select",
                condition: "equal",
                valueIndx: "type",
                labelIndx: "type",
                prepend: {'': ''},
                value: "",
                listeners: ['change'],
                init: function () {
                    $(this).pqSelect({
                        singlePlaceholder: 'Все',
                        searchRule: "contain",
                        width: '100%'
                    });
                }
            }
        },
        {
            title: "Тип",
            minWidth: 100,
            width: 150,
            dataType: "string",
            align: "center",
            dataIndx: "level",
            filter: {
                type: "select",
                condition: "equal",
                valueIndx: "level",
                labelIndx: "level",
                prepend: {'': ''},
                value: "",
                listeners: ['change'],
                init: function () {
                    $(this).pqSelect({
                        singlePlaceholder: 'Все',
                        searchRule: "contain",
                        width: '100%'
                    });
                }
            }
        },
        {
            title: "Наименование",
            minWidth: 150,
            width: 350,
            dataType: "string",
            dataIndx: "name",
            filter: {
                type: 'textbox',
                condition: 'contain',
                listeners: ['keyup']
            }
        },
        {
            title: "Дата регистрации",
            minWidth: 160,
            width: 160,
            dataType: "date",
            dataIndx: "regDate",
            filter: {
                type: 'textbox',
                condition: "between",
                init: function () {
                    $(this).css({zIndex: 3, position: "relative"})
                        .datepicker({
                            dateFormat: 'dd-mm-yy',
                            yearRange: "-20:+20",
                            changeYear: true,
                            changeMonth: true
                        });
                },
                listeners: ['change']
            }
        },
        {
            title: "Рег. Номер",
            minWidth: 80,
            width: 160,
            dataType: "string",
            dataIndx: "regNum",
            filter: {
                type: 'textbox',
                condition: 'contain',
                listeners: ['keyup']
            }
        },
        {
            title: "Инициатор/Контрагент",
            minWidth: 100,
            width: 350,
            dataType: "string",
            dataIndx: "author",
            filter: {
                type: 'textbox',
                condition: 'contain',
                listeners: ['keyup']
            }
        },
        {
            title: "",
            minWidth: 1,
            maxWidth: 1,
            width: 1,
            dataType: "",
            dataIndx: ""
        }
    ];

    var dataModel = {
        location: "local",
        sorting: "local",
        dataType: "JSON",
        method: "GET",
        url: "/share/proxy/alfresco/" + services[menuItemId].url,
        getUrl: function (ui) {
            showMenuItemCounterLoader(menuItemId);
            return {
                url: $(this).pqGrid("option", "dataModel.url")
            }
        },
        getData: function (response) {
            if (response.items.length === 0) {
               clearGrouping($(this));
            }
            var $grid = $(this);
            setMenuItemCounterValue(menuItemId, response.items.length);
            fillLocalFilter($grid, response.items, "type");
            fillLocalFilter($grid, response.items, "level");
            return {data: response.items};

        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error(textStatus, errorThrown)
        }
    };

    var obj = {
        width: "100%",
        height: getGridHeight(gridId),
        colModel: colModel,
        dataModel: dataModel,
        gridId: gridId,
        containerGridId: containerGridId,
        menuItemId: menuItemId,
        pageModel: {
            type: "local",
            rPP: 50,
            strRpp: "{0}",
            rPPOptions: [50, 250, 500]
        },
        filterModel: {on: true, mode: "AND", header: true},
        showTitle: false,
        toolbar: {
            cls: 'pq-toolbar-crud',
            items: []
        },
        editable: false,
        collapsible: false,
        showBottom: true,
        beforeFilter: function (event, ui) {
            clearGrouping($(this));
        },
        rowDblClick: function (event, ui) {
            var changedForm = false;
            var formId = null;
            var href = "";
            if (ui.rowData && ui.rowData.type === "Договор") {
                href = "/share/page/arm/contract?nodeRef=" + ui.rowData.nodeRef;
            } else {
                href = "/share/page/btl-review?nodeRef=" + ui.rowData.nodeRef;
                changedForm = true;
                formId = "reviewForm";
            }
            if (changedForm) {
                createAndShowForm(ui.rowData.nodeRef, {formId: formId});
            } else {
                window.location.href = href;
            }
            require(["dojo/topic"], function (topic) {
                topic.publish("ALF_DISPLAY_NOTIFICATION", {message: "Перенаправление на документ."});
            });
        },
        beforeTableView: function (evt, ui) {
            if ($(this).pqGrid("option", "dataModel.location") !== "local") {
                $(this).pqGrid("option", "dataModel.location", "local");
            }
        }
    };

    obj.updateButtonId = geUpdateButtonId(gridId);
    obj.toolbar.items.push(
        {type: '<button id="' + obj.updateButtonId + '" type="button" title="Обновить " class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-icon-primary" role="button"><span class="ui-button-icon-primary ui-icon ui-icon-refresh"></span><span class="ui-button-text">Обновить</span></button>'}
    );

    if (services[menuItemId].deletable){
        obj.colModel.unshift({
            title: '<input type="checkbox" onclick="selectAllChange(this, \'' + gridId + '\')">',
            dataIndx: "sel",
            minWidth: 30,
            width: 30,
            align: "center",
            type: 'checkBoxSelection',
            cls: 'ui-state-default',
            resizable: false,
            sortable: false
        });

        obj.deleteButtonId = geDeleteButtonId(gridId);
        obj.toolbar.items.push(
            {type: '<button id="' + obj.deleteButtonId + '" type="button"' +
                    ' onclick="deleteSelected(\'' + gridId + '\')"' +
                    ' title="Удалить выбранные"' +
                    ' class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-icon-primary"' +
                    ' role="button">' +
                    '    <span class="ui-button-icon-primary ui-icon ui-icon-cancel"></span>' +
                    '    <span class="ui-button-text">Удалить выбранные</span>' +
                    '</button>'}
        );
    }

    $("#" + gridId).pqGrid(obj);
    $("#" + containerGridId).addClass("initialized");


    if (obj.updateButtonId != null) {
        $("#" + obj.updateButtonId).click(function () {
            refreshLocalGridDataAndView(gridId);
        });
    }

}

/***
 * Иницаилизация таблицы
 * @param containerGridId
 * @param gridId
 * @param menuItemId
 */
function initLocalTasksGrid(containerGridId, gridId, menuItemId) {
    var colModel = [
        {
            title: "",
            dataType: "string",
            dataIndx: "nodeRef",
            hidden: true
        },
        {
            title: "",
            dataType: "string",
            dataIndx: "specControl",
            hidden: true,
        },
        {
            title: "",
            dataType: "string",
            dataIndx: "urgently",
            hidden: true,
        },
        //Видимые поля
        {
            title: "Тип задачи",
            minWidth: 100,
            width: 150,
            dataType: "string",
            dataIndx: "type",
            filter: {
                type: "select",
                condition: 'equal',
                prepend: {'': ''},
                valueIndx: "type",
                labelIndx: "type",
                listeners: ['change'],
                init: function () {
                    $(this).pqSelect({
                        singlePlaceholder: 'Все',
                        searchRule: "contain",
                        width: '100%'
                    });
                }
            }
        },
        {
            title: "Файл",
            minWidth: 40,
            width: 40,
            dataType: "string",
            dataIndx: "existFile"
        },
        {
            title: "Наименование задачи",
            minWidth: 160,
            width: 200,
            dataType: "string",
            dataIndx: "name_a",
            filter: {
                type: 'textbox',
                condition: 'contain',
                listeners: ['keyup']
            }
        },
        {
            title: "Документ/Проект",
            minWidth: 120,
            width: 200,
            dataType: "string",
            dataIndx: "doc_a",
            filter: {
                type: 'textbox',
                condition: 'contain',
                listeners: ['keyup']
            }
        },
        {
            title: "Дата регистрации",
            minWidth: 160,
            width: 160,
            dataType: "date",
            dataIndx: "regDate",
            filter: {
                type: 'textbox',
                condition: "between",
                init: function () {
                    $(this).css({zIndex: 3, position: "relative"})
                        .datepicker({
                            dateFormat: 'dd-mm-yy',
                            yearRange: "-20:+20",
                            changeYear: true,
                            changeMonth: true
                        });
                },
                listeners: ['change']
            }
        },
        {
            title: "Инициатор",
            minWidth: 110,
            width: 110,
            dataType: "string",
            dataIndx: "author",
            filter: {
                type: 'textbox',
                condition: 'contain',
                listeners: ['keyup']
            }
        },
        {
            title: "Исполнитель",
            minWidth: 110,
            width: 110,
            dataType: "string",
            dataIndx: "executor",
            filter: {
                type: 'textbox',
                condition: 'contain',
                listeners: ['keyup']
            }
        },
        {
            title: "ШИФР",
            minWidth: 70,
            width: 70,
            dataType: "string",
            dataIndx: "cipher",
            filter: {
                type: 'textbox',
                condition: 'contain',
                listeners: ['keyup']
            }
        },
        {
            title: "Срок исполнения",
            minWidth: 160,
            width: 160,
            dataType: "date",
            dataIndx: "duration",
            filter: {
                type: 'textbox',
                condition: "between",
                init: function () {
                    $(this).css({zIndex: 3, position: "relative"})
                        .datepicker({
                            dateFormat: 'dd-mm-yy',
                            yearRange: "-20:+20",
                            changeYear: true,
                            changeMonth: true
                        });
                },
                listeners: ['change']
            }
        },
        {
            title: "Контрагент",
            minWidth: 100,
            width: 150,
            dataType: "string",
            dataIndx: "contractor",
            filter: {
                type: "select",
                condition: 'equal',
                prepend: {'': ''},
                valueIndx: "contractor",
                labelIndx: "contractor",
                listeners: ['change'],
                init: function () {
                    $(this).pqSelect({
                        singlePlaceholder: 'Все',
                        searchRule: "contain",
                        width: '100%'
                    });
                }
            }
        },
        {
            title: "Статус",
            minWidth: 100,
            width: 200,
            dataType: "string",
            dataIndx: "status",
            filter: {
                type: "select",
                condition: 'equal',
                prepend: {'': ''},
                valueIndx: "status",
                labelIndx: "status",
                listeners: ['change'],
                init: function () {
                    $(this).pqSelect({
                        singlePlaceholder: 'Все',
                        searchRule: "contain",
                        width: '100%'
                    });
                }
            }
        },
        {
            title: "",
            minWidth: 1,
            maxWidth: 1,
            width: 1,
            dataType: "",
            dataIndx: ""
        }
    ];

    var dataModel = {
        location: "local",
        sorting: "local",
        dataType: "JSON",
        method: "GET",
        url: "/share/proxy/alfresco/" + services[menuItemId].url,
        getUrl: function (ui) {
            showMenuItemCounterLoader(menuItemId);
            return {
                url: $(this).pqGrid("option", "dataModel.url")
            }
        },
        getData: function (response) {
            if (response.items.length === 0) {
                clearGrouping($(this));
            }
            var $grid = $(this);
            setMenuItemCounterValue(menuItemId, response.items.length);
            fillLocalFilter($grid, response.items, "status");
            fillLocalFilter($grid, response.items, "type");
            fillLocalFilter($grid, response.items, "contractor");
            countForTabFilters($grid, response.items);
            return {data: response.items};
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error(textStatus, errorThrown)
        }
    };

    var obj = {
        width: "100%",
        height: getGridHeight(gridId),
        colModel: colModel,
        dataModel: dataModel,
        gridId: gridId,
        containerGridId: containerGridId,
        menuItemId: menuItemId,
        pageModel: {
            type: "local",
            rPP: 50,
            strRpp: "{0}",
            rPPOptions: [50, 250, 500]
        },
        groupModel: {
            dataIndx: ["doc_a"],
            title: ["<b style='font-weight:bold;'>{0}</b>"],
            dir: ["up"]
        },
        selectionModel: {type: 'none', cbHeader: false, cbAll: true},
        filterModel: {on: true, mode: "AND", header: true},
        showTitle: false,
        toolbar: {
            cls: 'pq-toolbar-crud',
            items: []
        },
        editable: false,
        collapsible: false,
        showBottom: true,
        beforeFilter: function (event, ui) {
            clearGrouping($(this));
        },
        rowDblClick: function (event, ui) {
            ui.rowData.rowIndx = ui.rowIndx;
            taskAndDocumentOpenModalRowData(ui.rowData, {isCompleteMe: isCompleteMe()});
            require(["dojo/topic"], function (topic) {
                topic.publish("ALF_DISPLAY_NOTIFICATION", {message: "Перенаправление на задачу."});
            });
        },
        cellClick: function (event, ui) {
            ui.rowData.rowIndx = ui.rowIndx;
            if (ui.dataIndx === "name_a") {
                taskAndDocumentOpenModalRowData(ui.rowData, {isCompleteMe: isCompleteMe()});
            }
        },
        beforeTableView: function (evt, ui) {
            if ($(this).pqGrid("option", "dataModel.location") !== "local") {
                $(this).pqGrid("option", "dataModel.location", "local");
            }
        }
    };

    if (services[menuItemId].toolbar.docGroup === true) {
        obj.groupToggleId = getGroupToggleId(gridId);
        obj.toolbar.items.push(
            {type: '<label style="font-weight: 600;color: #333;"><input type="checkbox" id="' + obj.groupToggleId + '" checked>Группировка по документу</label>'}
            , {type: '<span class="pq-separator"></span>'}
        );
    }

    if (services[menuItemId].toolbar.urgently === true) {
        obj.urgentlyToggleId = getUrgentlyToggleId(gridId);
        obj.toolbar.items.push(
            {type: '<label style="font-weight: 600;color:#fb3838"><input type="checkbox" id="' + obj.urgentlyToggleId + '"><u>Срочные документы</u></input></label>'}
            , {type: '<span class="pq-separator"></span>'}
        );
    }

    if (services[menuItemId].toolbar.specialControl === true) {
        obj.specialControlToggleId = getSpecialControlToggleId(gridId);
        obj.toolbar.items.push(
            {type: '<label style="font-weight: 600;color:#fb3838"><input type="checkbox" id="' + obj.specialControlToggleId + '"><u>Особый контроль</u></input></label>'}
            , {type: '<span class="pq-separator"></span>'}
        );
    }

    obj.updateButtonId = geUpdateButtonId(gridId);
    obj.toolbar.items.push(
        {type: '<button id="' + obj.updateButtonId + '" type="button" title="Обновить " class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-icon-primary" role="button"><span class="ui-button-icon-primary ui-icon ui-icon-refresh"></span><span class="ui-button-text">Обновить</span></button>'}
    );


    if (services[menuItemId].deletable){
        obj.colModel.unshift({
            title: '<input type="checkbox" onclick="selectAllChange(this, \'' + gridId + '\')">',
            dataIndx: "sel",
            minWidth: 30,
            width: 30,
            align: "center",
            type: 'checkBoxSelection',
            cls: 'ui-state-default',
            resizable: false,
            sortable: false
        });

        obj.deleteButtonId = geDeleteButtonId(gridId);
        obj.toolbar.items.push(
            {type: '<button id="' + obj.deleteButtonId + '" type="button"' +
                    ' onclick="deleteSelected(\'' + gridId + '\')"' +
                    ' title="Удалить выбранные"' +
                    ' class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-icon-primary"' +
                    ' role="button">' +
                    '    <span class="ui-button-icon-primary ui-icon ui-icon-cancel"></span>' +
                    '    <span class="ui-button-text">Удалить выбранные</span>' +
                    '</button>'}
        );
    }

    $("#" + gridId).pqGrid(obj);
    $("#" + containerGridId).addClass("initialized");

    if (obj.groupToggleId != null) {
        $("#" + obj.groupToggleId).change(function () {
            toggleGrouping(gridId);
        });
    }

    if (obj.updateButtonId != null) {
        $("#" + obj.updateButtonId).click(function () {
            refreshLocalGridDataAndView(gridId);
        });
    }

    if (obj.urgentlyToggleId != null) {
        $("#" + obj.urgentlyToggleId).change(function () {
            changeSimpleFilter(gridId, "urgently", this.checked ? "true" : "");
        });
    }

    if (obj.specialControlToggleId != null) {
        $("#" + obj.specialControlToggleId).change(function () {
            changeSimpleFilter(gridId, "specControl", this.checked ? "true" : "");
        });
    }

    $("#" + getFilterAllId(gridId)).click(function (event) {
        var $grid = $("#" + gridId);
        $grid.find('select.pq-select').val([]).pqSelect("refreshData");
        switchActiveTabFilter($grid, this);
        setFilterDateRange($grid, "duration", "", "");
    });

    $("#" + getFilterWeekId(gridId)).click(function (event) {
        var $grid = $("#" + gridId);
        $grid.find('select.pq-select').val([]).pqSelect("refreshData");
        switchActiveTabFilter($grid, this);
        var value1 = toFormattedStr(getWeekStartDate(new Date()));
        var value2 = toFormattedStr(getWeekEndDate(new Date()));
        setFilterDateRange($grid, "duration", value1, value2);
    });

    $("#" + getFilterMonthId(gridId)).click(function (event) {
        var $grid = $("#" + gridId);
        $grid.find('select.pq-select').val([]).pqSelect("refreshData");
        switchActiveTabFilter($grid, this);
        var value1 = toFormattedStr(getMonthStartDate(new Date()));
        var value2 = toFormattedStr(getMonthEndDate(new Date()));
        setFilterDateRange($grid, "duration", value1, value2);
    });

    $("#" + getFilterYearId(gridId)).click(function (event) {
        var $grid = $("#" + gridId);
        $grid.find('select.pq-select').val([]).pqSelect("refreshData");
        switchActiveTabFilter($grid, this);
        var value1 = toFormattedStr(getYearStartDate(new Date()));
        var value2 = toFormattedStr(getYearEndDate(new Date()));
        setFilterDateRange($grid, "duration", value1, value2);
    });

    $("#" + getFilterOverdueId(gridId)).click(function (event) {
        var $grid = $("#" + gridId);
        $grid.find('select.pq-select').val([]).pqSelect("refreshData");
        switchActiveTabFilter($grid, this);
        var value1 = toFormattedStr(new Date(0));
        var value2 = toFormattedStr(getYesterday(new Date()));
        setFilterDateRange($grid, "duration", value1, value2, false, true);
    });
}

/***
 * Иницаилизация таблицы
 * @param containerGridId
 * @param gridId
 * @param menuItemId
 */
function initRemoteTasksGrid(containerGridId, gridId, menuItemId) {
    var pq = getDefaultPq();

    var typeAccess = [
        {"0": "Резолюция по Входящему"},
        {"1": "Задание по Исходящему"},
        {"2": "Резолюция по Внутреннему"},
        {"3": "Задание по Проекту"},
        {"4": "Инициативное задание"},
        {"5": "Задание по НТД"},
        {"7": "Задание по мероприятию"},
        {"8": "Задание по ОРД"},
        {"9": "Задание по договору"}
    ];

    var colModel = [
        {
            title: "nodeRef",
            dataType: "string",
            dataIndx: "nodeRef",
            hidden: true
        },
        {
            title: "Тип задачи",
            minWidth: 100,
            width: 150,
            dataType: "string",
            dataIndx: "btl-task:taskType",
            sortable: false,
            filter: {
                type: 'select',
                style: "height:32px;",
                condition: 'equal',
                options: typeAccess,
                prepend: {'': ''},
                listeners: ["change"],
                init: function () {
                    $(this).pqSelect({
                        singlePlaceholder: 'Все',
                        searchRule: "contain",
                        width: '100%'
                    });
                }
            }
        },
        {
            title: "Файл",
            minWidth: 40,
            width: 40,
            dataType: "string",
            dataIndx: "fileExists",
            sortable: false
        },
        {
            title: "Наименование задачи",
            minWidth: 160,
            width: 200,
            dataType: "string",
            dataIndx: "btl-task:name",
            filter: {
                type: 'textbox',
                condition: 'contain',
                listeners: ['change']
            }
        },
        {
            title: "Документ/Проект",
            minWidth: 120,
            width: 200,
            dataType: "string",
            dataIndx: "doc_a",
            sortable: false
        },
        {
            title: "Режим исполнения",
            minWidth: 80,
            wdth: 80,
            dataType: "string",
            dataIndx: "runtime",
            sortable: false
        },
        {
            title: "Инициатор",
            minWidth: 110,
            width: 110,
            dataType: "string",
            dataIndx: "btl-task:author-content",
            filter:
                {
                    type: 'textbox',
                    condition: 'contain',
                    listeners: ["change"]
                }
        },
        {
            title: "Исполнитель",
            minWidth: 110,
            width: 110,
            dataType: "string",
            dataIndx: "btl-task:actualExecutor-content",
            filter:
                {
                    type: 'textbox',
                    condition: 'contain',
                    listeners: ["change"]
                }
        },
        {
            title: "ШИФР",
            minWidth: 70,
            width: 70,
            dataType: "string",
            dataIndx: "btl-task:project-content",
            filter:
                {
                    type: 'textbox',
                    condition: 'contain',
                    listeners: ["change"]
                }
        },
        {
            title: "Срок исполнения",
            minWidth: 160,
            width: 160,
            dataType: "date",
            dataIndx: "btl-task:endDate",
            filter: {
                type: 'textbox',
                condition: "between",
                init: function () {
                    $(this).css({zIndex: 3, position: "relative"})
                        .datepicker({
                            dateFormat: 'dd-mm-yy',
                            yearRange: "-20:+20",
                            changeYear: true,
                            changeMonth: true
                        });
                },
                listeners: ['change']
            }
        },
        {
            title: "Фактическая дата завершения",
            minWidth: 160,
            width: 160,
            dataType: "date",
            dataIndx: "btl-task:actualEndDate",
            filter: {
                type: 'textbox',
                condition: "between",
                init: function () {
                    $(this).css({zIndex: 3, position: "relative"})
                        .datepicker({
                            dateFormat: 'dd-mm-yy',
                            yearRange: "-20:+20",
                            changeYear: true,
                            changeMonth: true
                        });
                },
                listeners: ['change']
            }
        },
        {
            title: "Контрагент",
            minWidth: 100,
            width: 150,
            dataType: "string",
            dataIndx: "btl-task:contractor",
            filter: {
                type: 'textbox',
                condition: 'contain',
                listeners: ["change"]
            }
        },
        {
            title: "Статус",
            minWidth: 100,
            width: 150,
            dataType: "string",
            dataIndx: "btl-task:state"
        },
        {
            title: "",
            minWidth: 1,
            maxWidth: 1,
            width: 1,
            dataType: "",
            dataIndx: ""
        }
    ];

    var dataModel = {
        location: "remote",
        sorting: "remote",
        dataType: "JSON",
        method: "GET",
        data: pq.dataCache,
        sortIndx: 'btl-task:actualEndDate',
        sortDir: 'down',
        getUrl: function (ui) {
            if ($(this).pqGrid("option", "isInit2") !== true) {
                $(this).pqGrid("option", "isInit2", true);
                $(this).pqGrid("option", "currentCountId", gridId + "CurrentCount");
                $(this).pqGrid("option", "totalCountId", gridId + "TotalCount");
                $(this).pqGrid("option", "dataUrl", "/share/proxy/alfresco/" + services[menuItemId].url);
                addPaginationBlock($(this));
            }
            return getUrl2($(this), pq);
        },
        getData: function (response) {
            return getData2($(this), response, pq);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            error2(jqXHR, textStatus, errorThrown);
        }
    };

    var obj = {
        width: "100%",
        height: getGridHeight(gridId),
        selectionModel: {type: 'none', subtype: 'incr', cbHeader: false, cbAll: true},
        dataModel: dataModel,
        collapsible: false,
        editable: false,
        showTitle: false,
        colModel: colModel,
        filterModel: {on: true, mode: "AND", header: true},
        gridId: gridId,
        containerGridId: containerGridId,
        toolbar: {
            cls: 'pq-toolbar-crud',
            items: []
        },
        beforeSort: function (evt, ui) {
            beforeSort2($(this));
        },
        beforeFilter: function (evt, ui) {
            beforeFilter2($(this));
        },
        beforeTableView: function (evt, ui) {
            beforeTableView2(ui, pq, $(this));
        },
        rowDblClick: function (event, ui) {
            openForm(ui.rowData);
            require(["dojo/topic"], function (topic) {
                topic.publish("ALF_DISPLAY_NOTIFICATION", {message: "Перенаправление на задачу."});
            });
        }
    };

    if (services[menuItemId].toolbar.docGroup === true) {
        obj.groupToggleId = getGroupToggleId(gridId);
        obj.toolbar.items.push(
            {type: '<label style="font-weight: 600;color: #333;"><input type="checkbox" id="' + obj.groupToggleId + '">Группировка по документу</label>'}
            , {type: '<span class="pq-separator"></span>'}
        );
    }

    obj.updateButtonId = geUpdateButtonId(gridId);
    obj.toolbar.items.push(
        {type: '<button id="' + obj.updateButtonId + '" type="button" title="Обновить " class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-icon-primary" role="button"><span class="ui-button-icon-primary ui-icon ui-icon-refresh"></span><span class="ui-button-text">Обновить</span></button>'}
    );

    $("#" + gridId).pqGrid(obj);
    $("#" + containerGridId).addClass("initialized");

    if (obj.groupToggleId != null) {
        $("#" + obj.groupToggleId).change(function () {
            localGroup(this.checked ? "doc_a" : null, $("#" + gridId), pq);
        });
    }

    if (obj.updateButtonId != null) {
        $("#" + obj.updateButtonId).click(function () {
            refreshRemoteGridDataAndView(gridId);
        });
    }
}

/***
 * Иницаилизация таблицы
 * @param containerGridId
 * @param gridId
 * @param menuItemId
 */
function initRemoteDocsGrid(containerGridId, gridId, menuItemId, configFormId) {
    var pq = getDefaultPq();

    var colModel = [
        {
            title: "Вид документа",
            minWidth: 100,
            width: 150,
            dataType: "string",
            dataIndx: "type",
            sortable: false
        },
        {
            title: "Тип",
            minWidth: 100,
            width: 150,
            dataType: "string",
            align: "center",
            dataIndx: "btl-document:docType-content",
            filter: {
                type: 'textbox',
                condition: 'contain',
                listeners: ['change']
            }
        },
        {
            title: "Файл",
            minWidth: 40,
            width: 40,
            dataType: "string",
            dataIndx: "existFile",
            sortable: false
        },
        {
            title: "Наименование",
            minWidth: 150,
            width: 350,
            dataType: "string",
            dataIndx: "name",
            sortable: false
        },
        {
            title: "Дата регистрации",
            minWidth: 160,
            width: 160,
            dataType: "date",
            dataIndx: "btl-document:regDate",
            filter: {
                type: 'textbox',
                condition: "between",
                init: function () {
                    $(this).css({zIndex: 3, position: "relative"})
                        .datepicker({
                            dateFormat: 'dd-mm-yy',
                            yearRange: "-20:+20",
                            changeYear: true,
                            changeMonth: true
                        });
                },
                listeners: ['change']
            }
        },
        {
            title: "Рег. Номер",
            minWidth: 80,
            width: 150,
            dataType: "string",
            dataIndx: "btl-document:regNumber",
            filter: {
                type: 'textbox',
                condition: 'contain',
                listeners: ['change']
            }
        },
        {
            title: "Инициатор",
            minWidth: 110,
            width: 150,
            dataType: "string",
            dataIndx: "author",
            sortable: false
        },
        {
            title: "Статус",
            minWidth: 100,
            width: 150,
            dataType: "string",
            dataIndx: "btl-document:state",
            filter: {
                type: 'textbox',
                condition: 'contain',
                listeners: ['change']
            }
        },
        {
            title: "",
            minWidth: 1,
            maxWidth: 1,
            width: 1,
            dataType: "",
            dataIndx: ""
        }
    ];

    var dataModel = {
        location: "remote",
        sorting: "remote",
        dataType: "JSON",
        method: "GET",
        data: pq.dataCache,
        sortIndx: 'btl-document:regDate',
        sortDir: 'down',
        getUrl: function (ui) {
            if ($(this).pqGrid("option", "isInit2") !== true) {
                $(this).pqGrid("option", "isInit2", true);
                $(this).pqGrid("option", "currentCountId", gridId + "CurrentCount");
                $(this).pqGrid("option", "totalCountId", gridId + "TotalCount");
                $(this).pqGrid("option", "dataUrl", "/share/proxy/alfresco/" + services[menuItemId].url);
                addPaginationBlock($(this));
            }
            return getUrl2($(this), pq);
        },
        getData: function (response) {
            return getData2($(this), response, pq);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            error2(jqXHR, textStatus, errorThrown);
        }
    };

    var obj = {
        width: "100%",
        height: getGridHeight(gridId),
        selectionModel: {type: 'none', subtype: 'incr', cbHeader: false, cbAll: true},
        dataModel: dataModel,
        collapsible: false,
        editable: false,
        showTitle: false,
        colModel: colModel,
        filterModel: {on: true, mode: "AND", header: true},
        gridId: gridId,
        containerGridId: containerGridId,
        toolbar: {
            cls: 'pq-toolbar-crud',
            items: []
        },
        beforeSort: function (evt, ui) {
            beforeSort2($(this));
        },
        beforeFilter: function (evt, ui) {
            beforeFilter2($(this));
        },
        beforeTableView: function (evt, ui) {
            beforeTableView2(ui, pq, $(this));
        },
        rowDblClick: function (event, ui) {
            var changedForm = false;
            var formId = null;
            var href = "";
            if (ui.rowData && ui.rowData.type === "Договор") {
                href = "/share/page/arm/contract?nodeRef=" + ui.rowData.nodeRef;
            } else {
                href = "/share/page/btl-edit-metadata?nodeRef=" + ui.rowData.nodeRef;
                if (configFormId){
                    changedForm = true;
                    formId = configFormId;
                }
            }
            if (changedForm) {
                createAndShowForm(ui.rowData.nodeRef, {formId: formId});
            } else {
                window.location.href = href;
            }
            require(["dojo/topic"], function (topic) {
                topic.publish("ALF_DISPLAY_NOTIFICATION", {message: "Перенаправление на документ."});
            });
        }
    };

    obj.updateButtonId = geUpdateButtonId(gridId);
    obj.toolbar.items.push(
        {type: '<button id="' + obj.updateButtonId + '" type="button" title="Обновить " class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-icon-primary" role="button"><span class="ui-button-icon-primary ui-icon ui-icon-refresh"></span><span class="ui-button-text">Обновить</span></button>'}
    );

    if (services[menuItemId].deletable){
        obj.colModel.unshift({
            title: '<input type="checkbox" onclick="selectAllChange(this, \'' + gridId + '\')">',
            dataIndx: "sel",
            minWidth: 30,
            width: 30,
            align: "center",
            type: 'checkBoxSelection',
            cls: 'ui-state-default',
            resizable: false,
            sortable: false
        });

        obj.deleteButtonId = geDeleteButtonId(gridId);
        obj.toolbar.items.push(
            {type: '<button id="' + obj.deleteButtonId + '" type="button"' +
                    ' onclick="deleteSelected(\'' + gridId + '\')"' +
                    ' title="Удалить выбранные"' +
                    ' class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-icon-primary"' +
                    ' role="button">' +
                    '    <span class="ui-button-icon-primary ui-icon ui-icon-cancel"></span>' +
                    '    <span class="ui-button-text">Удалить выбранные</span>' +
                    '</button>'}
        );
    }

    $("#" + gridId).pqGrid(obj);
    $("#" + containerGridId).addClass("initialized");

    if (obj.updateButtonId != null) {
        $("#" + obj.updateButtonId).click(function () {
            refreshRemoteGridDataAndView(gridId);
        });
    }
}

/***
 * Иницаилизация таблицы
 * @param containerGridId
 * @param gridId
 * @param menuItemId
 */
function initLocalMailsGrid(containerGridId, gridId, menuItemId) {
    var colModel = [
        {
            title: '<input type="checkbox" onclick="selectAllChange(this, \'' + gridId + '\')">',
            dataIndx: "sel",
            minWidth: 30,
            width: 30,
            align: "center",
            type: 'checkBoxSelection',
            cls: 'ui-state-default',
            resizable: false,
            sortable: false
        },
        {
            title: "Файл",
            minWidth: 40,
            width: 40,
            dataType: "string",
            dataIndx: "fileExists",
            sortable: false,
            resizable: false
        },
        {
            title: "Тема",
            minWidth: 120,
            width: 400,
            dataType: "string", dataIndx: "theme",
            filter:
                {
                    type: 'textbox',
                    condition: 'contain',
                    listeners: ['change']
                }
        },
        {
            title: "Отправитель",
            minWidth: 150,
            width: 200,
            dataType: "string",
            dataIndx: "author-content",
            filter: {
                type: 'textbox',
                condition: 'contain',
                listeners: ['change']
            }
        },
        {
            title: "Получатель",
            minWidth: 150,
            width: 200,
            dataType: "string",
            dataIndx: "recipients-content",
            filter: {
                type: 'textbox',
                condition: 'contain',
                listeners: ['change']
            }
        },
        {
            title: "Дата отправки",
            minWidth: 160,
            width: 160,
            dataType: "date",
            dataIndx: "regDate",
            filter: {
                type: 'textbox',
                condition: "between",
                init: function () {
                    $(this).css({zIndex: 3, position: "relative"})
                        .datepicker({
                            dateFormat: 'dd-mm-yy',
                            yearRange: "-20:+20",
                            changeYear: true,
                            changeMonth: true
                        });
                },
                listeners: ['change']
            }
        },
        {
            title: "Время отправки",
            minWidth: 160,
            width: 160,
            dataType: "string",
            dataIndx: "regTime"
        },
        {
            title: "",
            minWidth: 1,
            maxWidth: 1,
            width: 1,
            dataType: "",
            dataIndx: ""
        }
    ];

    var dataModel = {
        location: "local",
        sorting: "local",
        dataType: "JSON",
        method: "GET",
        url: "/share/proxy/alfresco/" + services[menuItemId].url,
        sortIndx: "regDate",
        sortDir: "down",
        getUrl: function (ui) {
            showMenuItemCounterLoader(menuItemId);
            return {
                url: $(this).pqGrid("option", "dataModel.url")
            }
        },
        getData: function (response) {
            if (response.items.length === 0) {
                clearGrouping($(this));
            }
            if (response.func === "mail_input") {
                setMenuItemCounterValue(menuItemId, response.noReadCount);
            } else {
                setMenuItemCounterValue(menuItemId, response.cnt_whole);
            }

            response.items.forEach(function (item) {
                if (response.func && response.func == "mail_input") {
                    if (item.readRefs.indexOf(Alfresco.constants.USERNAME) < 0) {
                        item.pq_rowcls = "rowcls_bold";
                    }
                }
            });

            return {data: response.items};
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error(textStatus, errorThrown)
        }
    };

    var obj = {
        width: "100%",
        height: getGridHeight(gridId),
        colModel: colModel,
        dataModel: dataModel,
        gridId: gridId,
        containerGridId: containerGridId,
        menuItemId: menuItemId,
        pageModel: {
            type: "local",
            rPP: 50,
            strRpp: "{0}",
            rPPOptions: [50, 250, 500]
        },
        filterModel: {on: true, mode: "AND", header: true},
        selectionModel: {type: 'none', cbHeader: false, cbAll: true},
        showTitle: false,
        toolbar: {
            cls: 'pq-toolbar-crud',
            items: []
        },
        editable: false,
        collapsible: false,
        showBottom: true,
        rowDblClick: function (event, ui) {
            ui.rowData.rowIndx = ui.rowIndx;
            openModalTaskAndDocument(ui.rowData.nodeRef, "", "/share/page/arm/mailMessage?nodeRef=" + ui.rowData.nodeRef, ui.rowData);
        },
        beforeFilter: function (event, ui) {
            clearGrouping($(this));
        },
        beforeTableView: function (evt, ui) {
            if ($(this).pqGrid("option", "dataModel.location") !== "local") {
                $(this).pqGrid("option", "dataModel.location", "local");
            }
        }
    };

    obj.updateButtonId = geUpdateButtonId(gridId);
    obj.toolbar.items.push(
        {type: '<button id="' + obj.updateButtonId + '" type="button" ' +
                'title="Обновить " ' +
                'class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-icon-primary" ' +
                'role="button">' +
                '     <span class="ui-button-icon-primary ui-icon ui-icon-refresh"></span>' +
                '     <span class="ui-button-text">Обновить</span>' +
                '</button>'},
        {type: '<span class="pq-separator"></span>'},
        {
            type: '<button ' +
                ' onclick="deleteSelectedMails(\'' + gridId + '\')"' +
                ' type="button" ' +
                ' title="Удалить выбранные"' +
                ' class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-icon-primary"' +
                ' role="button">' +
                '      <span class="ui-button-icon-primary ui-icon ui-icon-cancel"></span>' +
                '      <span class="ui-button-text">Удалить выбранные</span>' +
                ' </button>'
        },
        {
            type: '<button ' +
                ' onclick="replyMails(\'' + gridId + '\')"' +
                ' type="button" ' +
                ' title="Ответить"' +
                ' class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-icon-primary"' +
                ' role="button">' +
                '      <span class="ui-button-icon-primary ui-icon ui-icon-arrowreturn-1-w"></span>' +
                '      <span class="ui-button-text">Ответить</span>' +
                ' </button>'
        }
    );

    $("#" + gridId).pqGrid(obj);
    $("#" + containerGridId).addClass("initialized");

    if (obj.updateButtonId != null) {
        $("#" + obj.updateButtonId).click(function () {
            refreshLocalGridDataAndView(gridId);
        });
    }
}

(function () {
    require(["jquery", "pqgrid", "combobox", "pqselect", "jquery-ui.datepicker-ru", "jquery.datepicker.extension.range", "dojo/domReady!"], function ($) {
        Object.keys(services).forEach(function (menuId) {
            $("#" + menuId).click(function () {
                var $activeMenu = $('.item-menu.active');
                if ($activeMenu.length > 0) {
                    $("#" + getGridContainerId($activeMenu[0].id)).hide();
                    $activeMenu.removeClass("active");
                }

                $(this).addClass("active");
                sessionStorage.setItem("menuTasksAndDocsItem", this.id);
                var activeGridContainerId = getGridContainerId(this.id);
                var $activeGridContainer = $("#" + activeGridContainerId);
                $activeGridContainer.show();

                var gridId = getGridId(this.id);
                switch (services[this.id].gridType) {
                    case "task-local":
                        if (!$activeGridContainer.hasClass("initialized")) {
                            initLocalTasksGrid(activeGridContainerId, gridId, this.id);
                        }
                        refreshLocalGridDataAndView(gridId);
                        break;
                    case "task-remote":
                        if (!$activeGridContainer.hasClass("initialized")) {
                            initRemoteTasksGrid(activeGridContainerId, gridId, this.id);
                        } else {
                            refreshRemoteGridDataAndView(gridId);
                        }
                        break;
                    case "review-local":
                        if (!$activeGridContainer.hasClass("initialized")) {
                            initLocalReviewGrid(activeGridContainerId, gridId, this.id);
                        }
                        refreshLocalGridDataAndView(gridId);
                        break;
                    case "docs-remote":
                        if (!$activeGridContainer.hasClass("initialized")) {
                            initRemoteDocsGrid(activeGridContainerId, gridId, this.id, services[this.id].formId);
                        } else {
                            refreshRemoteGridDataAndView(gridId);
                        }
                        break;
                    case "mails-local": {
                        if (!$activeGridContainer.hasClass("initialized")) {
                            initLocalMailsGrid(activeGridContainerId, gridId, this.id);
                        }
                        refreshLocalGridDataAndView(gridId);
                        break;
                    }
                    default:
                        console.error("TODO!#");
                }

                document.openRow = {};
            });
        })

    });
})();

//WARNING: Легаси код ниже
//Без него работать не будет ;)
function getUrlByType(type, nodeRef) {
    var urlLocation = "";
    switch (type) {
        case "Согласование":
            urlLocation = "/share/page/btl-negotiation-task?taskId=" + nodeRef;
            break;
        case "Подписание":
            urlLocation = "/share/page/btl-signing-task?taskId=" + nodeRef;
            break;
        case "Доработка":
            urlLocation = "/share/page/btl-revision-task?taskId=" + nodeRef;
            break;
        case "Ознакомление":
            urlLocation = "/share/page/btl-familiarized-task?taskId=" + nodeRef;
            break;
        default:
            urlLocation = "/share/page/task-edit?taskId=" + nodeRef;
    }
    return urlLocation;
}

function taskAndDocumentOpenModalRowData(rowData, args) {
    var urlLocation = "";
    if (document.openRow && document.openRow.viewMode && document.openRow.viewMode == "old") {
        urlLocation = "/share/page/btl-edit-metadata?nodeRef=" + rowData.nodeRef;
    } else {
        urlLocation = "/share/page/btl-execution?nodeRef=" + rowData.nodeRef;
    }

    if (rowData.nodeRef.indexOf("activiti") > -1) {
        urlLocation = getUrlByType(rowData.type, rowData.nodeRef);
    }

    openModalTaskAndDocument(rowData.nodeRef, rowData.status, urlLocation, rowData, args);
}

function openModalTaskAndDocument(nodeRef, status, urlLocation, rowData, args) {
    if (typeof simpleDialogFormStarting == "undefined") {
        simpleDialogFormStarting = false;
    }

    if (!simpleDialogFormStarting) {
        document.openRow = {};
        document.openRow.nodeRef = nodeRef;
        document.openRow.status = status;
        document.openRow.gridIndex = rowData.rowIndx;

        document.frameSave = function (o) {
            document.getElementById("modalWindowShadowTD").style.display = "none";
            document.body.style.overflow = "";

            if (document.modalSimpleDialogForm) {
                document.modalSimpleDialogForm.hide();
            }

            _refreshGrid();
        };

        document.frameCancel = function (o) {
            document.getElementById("modalWindowShadowTD").style.display = "none";
            document.body.style.overflow = "";

            if (document.modalSimpleDialogForm) {
                document.modalSimpleDialogForm.hide();
            }

            _refreshGrid();
        };

        createAndOpenForm(rowData, urlLocation, true, args);
    }
}

function openForm(rowData) {
    var urlLocation = "/share/page/btl-execution?nodeRef=" + rowData.nodeRef;
    if (rowData.nodeRef.indexOf("activiti") > -1) {
        var changedForm = false;
        switch (rowData.type) {
            case "Согласование":
                urlLocation = "/share/page/btl-negotiation-task?taskId=" + rowData.nodeRef;
                break;
            case "Подписание":
                urlLocation = "/share/page/btl-signing-task?taskId=" + rowData.nodeRef;
                break;
            case "Доработка":
                urlLocation = "/share/page/btl-revision-task?taskId=" + rowData.nodeRef;
                break;
            case "Ознакомление":
                urlLocation = "/share/page/btl-familiarized-task?taskId=" + rowData.nodeRef;
                changedForm = true;
                break;
            default:
                urlLocation = "/share/page/task-edit?taskId=" + rowData.nodeRef;
        }
    }

    var isExecutionTask = urlLocation.includes("btl-execution");

    if (changedForm || isExecutionTask) {
        var formId = null;

        if (isExecutionTask) {
            formId = "taskExecutionForm"
        } else {
            switch (rowData.type) {
                case "Ознакомление":
                    formId = "familiarizedForm";
                    break;
            }
        }

        createAndShowForm(rowData.nodeRef, {formId: formId});
    } else {
        window.location.href = urlLocation;
    }
}

function tasksAndDocumentsDashletSetSetting() {
    windowSettingTasksAndDocs.show();
}


function hasRow(number, isNext) {

    var isActiviti = false;
    var i = number;
    do {
        var row = getActiveGrid().pqGrid("getRowData", {rowIndxPage: i});

        if (row) {
            if (row.nodeRef) {
                isActiviti = row.nodeRef.includes("activiti");
                if (!isActiviti) {
                    return {result: true, index: i};
                }
            } else {
                return false;
            }
        } else {
            return false;
        }
        i = isNext ? i + 1 : i - 1;
    } while (isActiviti);

    return false;
}

document.hasNext = function () {
    if (document.openRow) {
        if (document.openRow.nodeRef.includes("activiti")) {
            return false;
        } else {
            return hasRow(document.openRow.gridIndex + 1, true);
        }
    } else {
        console.log("document.openRow is null");
    }
    return false;
};

document.openNextTask = function () {
    if (document.openRow) {
        console.log("log", "!row:[" + (document.openRow.gridIndex) + "], nodeRef:[" + document.openRow.nodeRef + "]");
        const hasNextVar = document.hasNext();
        if (hasNextVar) {

            var rowData = getActiveGrid().pqGrid("getRowData", {rowIndxPage: hasNextVar.index});
            //хз откуда rowIndx у rowData, но все завязано на нем, а он временами неправильный, так что ставим верный
            rowData.rowIndx = hasNextVar.index; //костыль
            taskAndDocumentOpenModalRowData(rowData, {isCompleteMe: isCompleteMe()});
        }
    } else {
        console.log("document.openRow is null");
    }
};

