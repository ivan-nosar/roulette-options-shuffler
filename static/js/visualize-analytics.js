const predefinedBackgroundChartColors = [
    "rgba(33, 150, 243, 0.2)",
    "rgba(76, 175, 80, 0.2)",
    "rgba(179, 0, 0, 0.2)",
    "rgba(156, 39, 176, 0.2)",
    "rgba(255, 217, 25, 0.2)",
    "rgba(192, 202, 51, 0.2)",
    "rgba(255, 235, 59, 0.2)",
    "rgba(96, 125, 139, 0.2)",
    "rgba(0, 188, 212, 0.2)",
    "rgba(255, 193, 7, 0.2)",
    "rgba(158, 158, 158, 0.2)",
    "rgba(244, 67, 54, 0.2)"
];
const predefinedBorderChartColors = [
    "rgba(33, 150, 243, 1)",
    "rgba(76, 175, 80, 1)",
    "rgba(179, 0, 0, 1)",
    "rgba(156, 39, 176, 1)",
    "rgba(255, 217, 25, 1)",
    "rgba(192, 202, 51, 1)",
    "rgba(255, 235, 59, 1)",
    "rgba(96, 125, 139, 1)",
    "rgba(0, 188, 212, 1)",
    "rgba(255, 193, 7, 1)",
    "rgba(158, 158, 158, 1)",
    "rgba(244, 67, 54, 1)"
];

const maxTopCount = 5;

const charts = [];

function recalculateAnalytics(settings) {
    selectShuffles(shuffles => {
        // Free canvas resources
        if (charts.length) {
            // `charts.splice` will clear up the `charts` array and return the array of the deleted objects
            for (const chart of charts.splice(0)) {
                chart.destroy();
            }
        }

        // Cleanup all the complex charts' areas created previously
        $("div[id^='chart-area-']").remove();

        const chartsContainer = $("#charts-container");

        // Hide charts' canvases and show spinners
        $(".spinner-border").show();
        $(".chart-canvas").hide();

        // Start asynchronous calculation of the predefined charts
        calculatePredefinedChartsData(shuffles)
            .then(([topFirst, topLast, topRemaining]) => {
                [
                    {chartId: "topFirstChart", chartTitle: "Top 5 first shuffled options", data: topFirst},
                    {chartId: "topLastChart", chartTitle: "Top 5 last shuffled options", data: topLast},
                    {chartId: "topRemainingChart", chartTitle: "Top 5 remaining shuffled options", data: topRemaining}
                ].forEach(chartData => {
                    // Hide spinner and show chart
                    const spinnerId = chartData.chartId.substr(0, chartData.chartId.indexOf("Chart")) + "Spinner";
                    $(`#${spinnerId}`).hide();
                    $(`#${chartData.chartId}`).show();

                    // Draw chart
                    drawChart(chartData, settings.chartsColorScheme);
                });
            });

        // An entry point to calculate and draw the complex or user-defined charts
        const complexChartsCalculators = [
            calculateTopMaxRemainingSubsequences(shuffles)
        ];

        // Construct and add the spinners for the complex charts
        for (let i = 0; i < complexChartsCalculators.length; i++) {
            const complexChartAreaMarkup = constructChartArea(i);
            chartsContainer.append(complexChartAreaMarkup);
        }

        // Start asynchronous calculation of the complex charts
        complexChartsCalculators.map((promise, index) => promise
            .then(
                chartData => {
                    // Validate result
                    const validationError = validateComplexChartData(chartData);
                    if (validationError) {
                        console.error(validationError.message);
                        console.error(validationError.dataItem);
                        return;
                    }

                    // The chart's canvases will be generated dynamically
                    const newChartMarkup = counstructNewChartMarkup(chartData.chartId);
                    $(`#chart-area-${index}`).prepend(newChartMarkup);

                    // Hide spinner
                    $(`#complexChartSpinner-${index}`).hide();

                    // Draw the chart
                    drawChart(chartData, settings.chartsColorScheme);
                },
                error => {
                    console.error("Unable to calculate the complex charts data. The reason is as follows:");
                    console.error(error);
                }
            )
        );
    });
}

function drawChart({chartId, chartTitle, data}, colorScheme) {
    const chartContext = document.getElementById(chartId).getContext("2d");
    const backgroundColor = getBackgroundColorForScheme(colorScheme, data);
    const borderColor = getBorderColorForScheme(colorScheme, data);
    charts.push(new Chart(chartContext, {
        type: "bar",
        data: {
            labels: data.map(optionStatistics => optionStatistics.title),
            datasets: [{
                data: data.map(optionStatistics => optionStatistics.value),
                backgroundColor,
                borderColor,
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: chartTitle,
                    font: {
                        size: 18
                    }
                },
            }
        }
    }));
}

function getBackgroundColorForScheme(colorScheme, data) {
    switch (colorScheme) {
        case "predefined": return predefinedBackgroundChartColors;
        case "dynamic": return data.map(item => colorHash(item.title, 0.2));
        default: throw new Error(`Unknow color scheme: ${colorScheme}`);
    }
}

function getBorderColorForScheme(colorScheme, data) {
    switch (colorScheme) {
        case "predefined": return predefinedBorderChartColors;
        case "dynamic": return data.map(item => colorHash(item.title));
        default: throw new Error(`Unknow color scheme: ${colorScheme}`);
    }
}

// https://github.com/RolandR/ColorHash
function colorHash(inputString, alpha = 1){
    let sum = 0;

    for(let i in inputString){
        sum += inputString.charCodeAt(i);
    }

    r = ~~(('0.' + Math.sin(sum + 1).toString().substr(6)) * 256);
    g = ~~(('0.' + Math.sin(sum + 2).toString().substr(6)) * 256);
    b = ~~(('0.' + Math.sin(sum + 3).toString().substr(6)) * 256);

    return `rgba(${r},${g},${b},${alpha})`;
}

function validateComplexChartData(chartData) {
    if (chartData.chartId === undefined) {
        return {message: "The chart data doesn't contain the `chartId` property", dataItem: chartData};
    }
    if (chartData.chartTitle === undefined) {
        return {message: "The chart data doesn't contain the `chartTitle` property", dataItem: chartData};
    }
    if (!Array.isArray(chartData.data)) {
        return {message: "The chart data doesn't contain the `data` property that is Array", dataItem: chartData};
    }
    for (const dataItem of chartData.data) {
        if (dataItem.title === undefined) {
            return {
                message: "The chart data has incorrect `data` property content: `title` property is required",
                dataItem
            };
        }
        if (dataItem.value === undefined) {
            return {
                message: "The chart data has incorrect `data` property content: `value` property is required",
                dataItem
            };
        }
    }
}

function counstructNewChartMarkup(chartId) {
    return `<canvas id="${chartId}" class="chart-canvas"></canvas>`;
}

function constructChartArea(index) {
    return `<div class="col chart-base" id="chart-area-${index}">
        <div id="complexChartSpinner-${index}" class="container h-100">
            <div class="row align-items-center h-100">
                <div class="col text-center">
                    <div class="spinner-border spinner-big text-primary" role="status">
                        <span class="sr-only">Loading...</span>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
}

function calculatePredefinedChartsData(shuffles) {
    return new Promise(async (resolve) => {
        const optionsFirst = {};
        const optionsLast = {};
        const optionsRemaining = {};

        for (const {original, shuffled} of shuffles) {
            const firstShuffledOption = shuffled[0];
            if (optionsFirst[firstShuffledOption]) {
                optionsFirst[firstShuffledOption]++;
            } else {
                optionsFirst[firstShuffledOption] = 1;
            }

            const lastShuffledOption = shuffled[shuffled.length - 1];
            if (optionsLast[lastShuffledOption]) {
                optionsLast[lastShuffledOption]++;
            } else {
                optionsLast[lastShuffledOption] = 1;
            }

            for (const originalIndex in original) {
                if (original[originalIndex] === shuffled[originalIndex]) {
                    const optionRemaining = shuffled[originalIndex];
                    if (optionsRemaining[optionRemaining]) {
                        optionsRemaining[optionRemaining]++;
                    } else {
                        optionsRemaining[optionRemaining] = 1;
                    }
                }
            }
        }

        const topFirst = Object.keys(optionsFirst)
            .map((optionName) => ({title: optionName, value: optionsFirst[optionName]}))
            .sort((a, b) => b.value - a.value)
            .slice(0, maxTopCount);
        const topLast = Object.keys(optionsLast)
            .map((optionName) => ({title: optionName, value: optionsLast[optionName]}))
            .sort((a, b) => b.value - a.value)
            .slice(0, maxTopCount);
        const topRemaining = Object.keys(optionsRemaining)
            .map((optionName) => ({title: optionName, value: optionsRemaining[optionName]}))
            .sort((a, b) => b.value - a.value)
            .slice(0, maxTopCount);

        resolve([topFirst, topLast, topRemaining]);
    });
}

async function calculateTopMaxRemainingSubsequences(shuffles) {
    return new Promise(async (resolve) => {
        const foundSubsequences = {};

        for (const {original, shuffled} of shuffles) {
            // Pre-calculation optimization:
            // Find the first and the last common options in both arrays in order to decrease the search area
            const firstCommonIndex = original.findIndex((option, index) => shuffled[index] === option);
            let lastCommonIndex = original.length - 1;
            for (; lastCommonIndex >= 0; lastCommonIndex--) {
                if (original[lastCommonIndex] === shuffled[lastCommonIndex]) {
                    break;
                }
            }

            if (lastCommonIndex <= firstCommonIndex || firstCommonIndex === -1 || lastCommonIndex === -1) {
                // No common subsequence found
                // (every item of the `shuffled` array has been rearranged from the `original`)
                // or the common subsequence consists of a single element
                continue;
            }

            // Calculate the longest common continuous subsequence
            let maxLength = 1;
            let currentLength = 1;
            let maxSubsequence = original[firstCommonIndex];
            for (let i = firstCommonIndex + 1; i <= lastCommonIndex; i++) {
                if (original[i] === shuffled[i]) {
                    currentLength++;
                    if (currentLength > maxLength) {
                        maxSubsequence += currentLength === 1 ? `${original[i]}` : `-${original[i]}`;
                        maxLength = currentLength;
                    }
                } else {
                    currentLength = 0;
                }
            }

            if (maxLength > 1) {
                // Only subsequences that contain two or more options will be shown
                if (foundSubsequences[maxSubsequence]) {
                    foundSubsequences[maxSubsequence]++;
                } else {
                    foundSubsequences[maxSubsequence] = 1;
                }
            }
        }

        const data = Object.keys(foundSubsequences)
            .map((subsequenceName) => ({title: subsequenceName, value: foundSubsequences[subsequenceName]}))
            .sort((a, b) => b.value - a.value)
            .slice(0, maxTopCount);

        resolve({
            chartId: "topMaxRemainingSubsequences",
            chartTitle: "Top 5 maximum remaining subsequences",
            data
        });
    });
}
