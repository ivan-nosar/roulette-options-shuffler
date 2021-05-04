const acceptableChartsColorSchemes = [
    "predefined",
    "dynamic"
];
const sampleColoredChartId = "sampleColoredChartCanvas";

function isSettingsValid(settings) {
    if (typeof settings !== "object") {
        return false;
    }

    const colorScheme = settings.chartsColorScheme;
    if (!acceptableChartsColorSchemes.includes(colorScheme)) {
        return false;
    }

    return true;
}

function constructDefaultSettings() {
    return {
        chartsColorScheme: acceptableChartsColorSchemes[0] // "predefined"
    };
}

function selectChartsColorScheme(chartsColorScheme) {
    if (!acceptableChartsColorSchemes.includes(chartsColorScheme)) {
        colorScheme = acceptableChartsColorSchemes[0]; // "predefined"
    }

    updateSettings({chartsColorScheme}, updateChartCoorSchemeDropdownTitle);
}

function updateChartCoorSchemeDropdownTitle(settings) {
    const selectedColorScheme = settings.chartsColorScheme;

    // Update title of the dropdown
    const title = selectedColorScheme[0].toUpperCase() + selectedColorScheme.substr(1);
    const markup = `<b>Charts color scheme:</b> ${title}`;
    $("#chartsColorSchemeDropdown").html(markup);

    // Make all the options in the dropdown inactive
    $("[id$=ChartColorSchemeButton]").removeClass("active");

    // Activate an appropriate option in dropdown
    $(`#${selectedColorScheme}ChartColorSchemeButton`).addClass("active");

    // If the "Analytics" tab is shown - recalculate and redraw the charts
    const analyticsTabClasses = [...$("#analytics-tab").get()[0].classList];
    if (analyticsTabClasses.includes("active")) {
        recalculateAnalytics(settings);
    }
}

function constructColorSchemeInfoButtonMarkup() {
    return `
        <a class="text-decoration-none">
            <img src="static/icons/question-circle.svg"></img>
        </a>
    `;
}
