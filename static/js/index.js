function parseQueryString(queryString) {
    const keyValueSubstrings = queryString
        .split("&")
        // Omit empty substrings
        .filter(string => !!string);

    const result = keyValueSubstrings.reduce((result, queryParam) => {
        const delimiterIndex = queryParam.indexOf("=");
        const key = decodeURIComponent(queryParam.slice(0, delimiterIndex));
        let value = decodeURIComponent(queryParam.slice(delimiterIndex + 1));
        if (value.includes("+")) {
            value = value.split("+");
        }

        if (result[key]) {
            const preparedValue = Array.isArray(value) ? value : [value];
            if (Array.isArray(result[key])) {
                result[key].push(...preparedValue);
            } else {
                result[key] = [result[key], ...preparedValue];
            }
        } else {
            result[key] = value;
        }
        return result;
    }, {});
    return result;
}

const queryString = window.location.search
    // Remove the `?` character
    .slice(1);
const query = parseQueryString(queryString);

$(document).ready(() => {
    listenOnDatabaseOpenedEvent(() => {
        getSettings(settings => {
            if (!isSettingsValid(settings)) {
                const defaultSettings = constructDefaultSettings();
                updateSettings(defaultSettings, updateChartCoorSchemeDropdownTitle);
            } else {
                updateChartCoorSchemeDropdownTitle(settings);
            }
        });
    });

    // Recalculate the analytics every time the each tab is shown
    $("#analytics-tab").on("shown.bs.tab", function () {
        getSettings(settings => {
            recalculateAnalytics(settings);
        });
    });
});
