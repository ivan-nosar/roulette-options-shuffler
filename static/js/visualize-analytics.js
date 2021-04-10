const backgroundChartColors = [
    'rgba(255, 152, 0, 0.2)',
    'rgba(76, 175, 80, 0.2)',
    'rgba(33, 150, 243, 0.2)',
    'rgba(156, 39, 176, 0.2)',
    'rgba(158, 158, 158, 0.2)',
    'rgba(192, 202, 51, 0.2)',
    'rgba(255, 235, 59, 0.2)',
    'rgba(96, 125, 139, 0.2)',
    'rgba(0, 188, 212, 0.2)',
    'rgba(255, 193, 7, 0.2)',
    'rgba(156, 39, 176, 0.2)',
    'rgba(244, 67, 54, 0.2)'
];
const borderChartColors = [
    'rgba(255, 152, 0, 1)',
    'rgba(76, 175, 80, 1)',
    'rgba(33, 150, 243, 1)',
    'rgba(156, 39, 176, 1)',
    'rgba(158, 158, 158, 1)',
    'rgba(192, 202, 51, 1)',
    'rgba(255, 235, 59, 1)',
    'rgba(96, 125, 139, 1)',
    'rgba(0, 188, 212, 1)',
    'rgba(255, 193, 7, 1)',
    'rgba(156, 39, 176, 1)',
    'rgba(244, 67, 54, 1)'
];

const maxTopCount = 5;

const charts = [];

function recalculateAnalytics() {
    selectShuffles(shuffles => {
        if (charts.length) {
            // `charts.splice` will clear up the `charts` array and return the array of the deleted objects
            for (const chart of charts.splice(0)) {
                chart.destroy();
            }
        }

        const [topFirst, topLast, topRemaining] = calculatePredefinedChartsData(shuffles);
        [
            {chartId: "topFirstChart", chartTitle: 'Top 5 first shuffled options', data: topFirst},
            {chartId: "topLastChart", chartTitle: 'Top 5 last shuffled options', data: topLast},
            {chartId: "topRemainingChart", chartTitle: 'Top 5 remaining shuffled options', data: topRemaining}
        ].forEach(({chartId, chartTitle, data}) => {
            var chartContext = document.getElementById(chartId).getContext("2d");
            charts.push(new Chart(chartContext, {
                type: 'bar',
                data: {
                    labels: data.map(optionStatistics => optionStatistics.title),
                    datasets: [{
                        data: data.map(optionStatistics => optionStatistics.value),
                        backgroundColor: backgroundChartColors,
                        borderColor: borderChartColors,
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
        })
    })
}

function calculatePredefinedChartsData(shuffles) {
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

    return [topFirst, topLast, topRemaining];
}
