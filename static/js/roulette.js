const optionsDivIdPrefix = "option-div";

function addNewOption(optionTitle) {
    const optionsList = $("#options-list");
    const newIndex = optionsList[0].childElementCount;

    const optionDivId = `${optionsDivIdPrefix}-${newIndex}`;
    const optionDivMarkup = `
        <li class="input-group my-1" id="${optionDivId}">
            <input class="form-control" type="text" placeholder="Set your option" value="${optionTitle}">
            <div class="input-group-append">
                <button class="btn btn-outline-primary" type="button" onclick="deleteOption('${optionDivId}')">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        </li>`;

    optionsList.append(optionDivMarkup);
}

function deleteOption(optionId) {
    $(`#${optionId}`).remove();
}

function onAddOptionClick() {
    addNewOption("New option")
}

function onSpinClick() {
    // Find all `li` tags which ids starts with `option-div` and get the values of the underlying inputs
    const options = [...$(`li[id^="${optionsDivIdPrefix}"] input`)].map(x => x.value);

    // Clear slots-root contatiner
    const slotsRoot = $("#slots-root")
    slotsRoot.empty();

    // Prepare markup
    const optionsListTemplate =
        "<ul>" +
        options
            .map(option => `<li>${option}</li>`)
            .join("") +
        "</ul>";

    const optionSpinnerMarkups = [];
    for (const optionIndex in options) {
        optionSpinnerMarkups.push(`
            <div id="slots-${optionIndex}" class="slotwrapper">
                ${optionsListTemplate}
            </div>
        `);
    }

    // Insert markups in DOM
    optionSpinnerMarkups.forEach(markup => slotsRoot.append(markup));

    // Determine final sequence of options
    const finalOptionsSequence = shuffleSchedule(1, options.length);

    // Save shuffle result if the original options list is not empty
    if (finalOptionsSequence.length) {
        const shuffled = finalOptionsSequence.map(index => options[index - 1]);
        saveShuffle({original: options, shuffled});
    }

    // Run spinners
    const startSpinTime = Number(query.spinTime) > 0 ? Number(query.spinTime) : 600; // ms
    const spinTimeStep = 150; // ms
    let spinTime = startSpinTime;
    for (const optionIndex in finalOptionsSequence) {
        $(`#slots-${optionIndex} ul`).playSpin({
            time: spinTime,
            endNum: [finalOptionsSequence[optionIndex]],
            easing: "easeOutElastic"
        });
        spinTime += spinTimeStep;
    }
}

// Generates shuffle of integer indexes between `a` and `b` (including both)
// using the Fisher–Yates shuffle algorithm:
// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
function shuffleSchedule(a, b) {
    const result = [];
    // Initiate schedule
    for (let i = a; i <= b; i++) {
        result.push(i);
    }

    for (let i = b - 1; i >= a; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = result[j];
        result[j] = result[i];
        result[i] = temp;
    }

    return result;
}

const predefinedOptions = query.options ?
    Array.isArray(query.options) ?
        query.options : [query.options] :
        [
            "Apple",
            "Pineapple",
            "Banana",
            "Pear",
            "Kiwi",
            "Mango",
            "Orange"
        ];

$(document).ready(() => {
    for (const option of predefinedOptions) {
        addNewOption(option);
    }
});
