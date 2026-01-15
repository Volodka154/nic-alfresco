define([], function () {
    return {
        getShotFIO: function (longFIO) {
            var arr = longFIO.split(' ');
            var shotFIO = "";
            try {
                if (arr[0]) {
                    shotFIO = arr[0] + ' '
                }
                if (arr[1]) {
                    {
                        shotFIO += arr[1].charAt(0) + '.'
                    }
                }
                if (arr[2]) {
                    shotFIO += arr[2].charAt(0) + '.'
                }
            } catch (e) {
                logger.log("ошибка - " + e.name);
            }
            return shotFIO;
        },

/**
 *       Создание cookie
 *       Аргументы:
 *       @param name - название cookie
 *       @param  value - значение cookie (строка)
 *       @param options - Объект с дополнительными свойствами для установки cookie:
 *          expires:
 *              Время истечения cookie. Интерпретируется по-разному, в зависимости от типа:
 *              Число – количество секунд до истечения. Например, expires: 3600 – кука на час.
 *              Объект типа Date – дата истечения.
 *              Если expires в прошлом, то cookie будет удалено.
 *              Если expires отсутствует или 0, то cookie будет установлено как сессионное и исчезнет при закрытии браузера.
 *          path - Путь для cookie.
 *          domain - Домен для cookie.
 *          secure - Если true, то пересылать cookie только по защищенному соединению.
 */
        setCookie: function (name, value, options) {
            options = options || {};

            var expires = options.expires;

            if (typeof expires == "number" && expires) {
                var d = new Date();
                d.setTime(d.getTime() + expires * 1000);
                expires = options.expires = d;
            }
            if (expires && expires.toUTCString) {
                options.expires = expires.toUTCString();
            }

            value = encodeURIComponent(value);

            var updatedCookie = name + "=" + value;

            for (var propName in options) {
                updatedCookie += "; " + propName;
                var propValue = options[propName];
                if (propValue !== true) {
                    updatedCookie += "=" + propValue;
                }
            }
            document.cookie = updatedCookie;
        },

        /**
         * Получить cookie с именем name
         * @param name - название cookie
         * @returns {cookie} || undefined
         */
        getCookie: function (name) {
            var matches = document.cookie.match(new RegExp(
                "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
            ));
            return matches ? decodeURIComponent(matches[1]) : undefined;
        },

        /**
         * Удаление cookie с именем name
         * @param name - название cookie
         */
        deleteCookie: function (name) {
            setCookie(name, "", {
                expires: -1
            })
        }
    }
});