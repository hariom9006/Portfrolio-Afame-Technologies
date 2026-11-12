// =========================
// ELEMENTS
// =========================

const display = document.getElementById("display");
const previousExpression = document.getElementById("previousExpression");
const historyList = document.getElementById("historyList");
const clearHistoryButton = document.getElementById("clearHistory");

let expression = "";
let history = [];
let justCalculated = false;


// =========================
// DISPLAY
// =========================

function updateDisplay() {

    display.value = expression || "0";

}


// =========================
// FORMAT RESULT
// =========================

function formatResult(number) {

    if (!Number.isFinite(number)) {
        throw new Error("Invalid calculation");
    }

    if (Object.is(number, -0)) {
        number = 0;
    }

    return Number(number.toPrecision(12)).toString();

}


// =========================
// SAFE CALCULATION PARSER
// =========================

function calculateExpression(input) {

    const tokens = input.match(
        /(?:\d+\.?\d*|\.\d+)|[+\-*/%]/g
    );

    if (!tokens || tokens.join("") !== input.replace(/\s/g, "")) {
        throw new Error("Invalid expression");
    }

    let position = 0;

    function parseExpression() {

        let value = parseTerm();

        while (position < tokens.length) {

            const operator = tokens[position];

            if (operator !== "+" && operator !== "-") {
                break;
            }

            position++;

            const right = parseTerm();

            if (operator === "+") {
                value += right;
            } else {
                value -= right;
            }
        }

        return value;
    }


    function parseTerm() {

        let value = parseUnary();

        while (position < tokens.length) {

            const operator = tokens[position];

            if (operator !== "*" && operator !== "/") {
                break;
            }

            position++;

            const right = parseUnary();

            if (operator === "*") {
                value *= right;
            } else {

                if (right === 0) {
                    throw new Error("Cannot divide by zero");
                }

                value /= right;
            }
        }

        return value;
    }


    function parseUnary() {

        const operator = tokens[position];

        if (operator === "+" || operator === "-") {

            position++;

            const value = parseUnary();

            return operator === "-" ? -value : value;
        }

        return parseNumber();
    }


    function parseNumber() {

        const token = tokens[position];

        if (!token || !/^(?:\d+\.?\d*|\.\d+)$/.test(token)) {
            throw new Error("Invalid number");
        }

        position++;

        let value = Number(token);

        if (tokens[position] === "%") {
            value /= 100;
            position++;
        }

        return value;
    }


    const result = parseExpression();

    if (position !== tokens.length) {
        throw new Error("Invalid expression");
    }

    return result;
}


// =========================
// ADD NUMBER OR OPERATOR
// =========================

function addValue(value) {

    if (justCalculated && /[0-9.]/.test(value)) {

        expression = "";

    }

    justCalculated = false;

    const lastCharacter = expression.slice(-1);

    // Prevent multiple decimal points in one number
    if (value === ".") {

        const currentNumber = expression.split(/[+\-*/%]/).pop();

        if (currentNumber.includes(".")) {
            return;
        }

        if (!currentNumber) {
            expression += "0";
        }

        expression += ".";

        updateDisplay();
        return;
    }


    // Prevent two operators in a row
    if (/[+\-*/]/.test(value)) {

        if (!expression && value !== "-") {
            return;
        }

        if (/[+\-*/]$/.test(expression)) {

            expression = expression.slice(0, -1);

        }

    } else if (lastCharacter === "%") {

        // A new number after % needs an operator first
        return;

    }

    expression += value;

    updateDisplay();
}


// =========================
// CLEAR DISPLAY
// =========================

function clearCalculator() {

    expression = "";
    justCalculated = false;

    previousExpression.textContent = "Ready to calculate";

    updateDisplay();

}


// =========================
// DELETE LAST CHARACTER
// =========================

function deleteLast() {

    if (justCalculated) {
        clearCalculator();
        return;
    }

    expression = expression.slice(0, -1);

    updateDisplay();

}


// =========================
// PERCENTAGE
// =========================

function addPercentage() {

    if (!expression || justCalculated) {
        return;
    }

    if (/[+\-*/.]$/.test(expression)) {
        return;
    }

    const lastNumber = expression.split(/[+\-*/]/).pop();

    if (!lastNumber || lastNumber.includes("%")) {
        return;
    }

    expression += "%";

    updateDisplay();

}


// =========================
// CALCULATE RESULT
// =========================

function calculate() {

    if (!expression) {
        return;
    }

    try {

        if (/[+\-*/.]$/.test(expression)) {
            throw new Error("Incomplete expression");
        }

        const originalExpression = expression;

        const result = calculateExpression(expression);

        const formattedResult = formatResult(result);

        addToHistory(originalExpression, formattedResult);

        previousExpression.textContent =
            originalExpression.replaceAll("*", "×")
                              .replaceAll("/", "÷")
                              + " =";

        expression = formattedResult;

        justCalculated = true;

        updateDisplay();

    } catch (error) {

        previousExpression.textContent = error.message;

        display.value = "Error";

        expression = "";

        justCalculated = false;

    }

}


// =========================
// CALCULATION HISTORY
// =========================

function addToHistory(original, result) {

    history.unshift({
        expression: original,
        result: result
    });

    renderHistory();

}


function renderHistory() {

    historyList.innerHTML = "";

    if (history.length === 0) {

        historyList.innerHTML = `
            <div class="empty-history">
                <div class="history-icon">◷</div>
                <p>No calculations yet</p>
                <span>Your results will appear here.</span>
            </div>
        `;

        return;
    }


    history.forEach(function (item) {

        const historyItem = document.createElement("div");

        historyItem.className = "history-item";

        const expressionElement = document.createElement("div");

        expressionElement.className = "history-expression";

        expressionElement.textContent =
            item.expression.replaceAll("*", "×")
                           .replaceAll("/", "÷");

        const resultElement = document.createElement("div");

        resultElement.className = "history-result";

        resultElement.textContent = "= " + item.result;

        historyItem.appendChild(expressionElement);
        historyItem.appendChild(resultElement);

        historyItem.addEventListener("click", function () {

            expression = item.result;

            justCalculated = true;

            previousExpression.textContent = "History result selected";

            updateDisplay();

        });

        historyList.appendChild(historyItem);

    });

}


// =========================
// CLEAR HISTORY
// =========================

clearHistoryButton.addEventListener("click", function () {

    history = [];

    renderHistory();

});


// =========================
// BUTTON EVENTS
// =========================

document.querySelectorAll(".btn").forEach(function (button) {

    button.addEventListener("click", function () {

        const value = button.dataset.value;
        const action = button.dataset.action;

        if (value !== undefined) {

            addValue(value);

        } else if (action === "clear") {

            clearCalculator();

        } else if (action === "delete") {

            deleteLast();

        } else if (action === "percent") {

            addPercentage();

        } else if (action === "calculate") {

            calculate();

        }

    });

});


// =========================
// KEYBOARD SUPPORT
// =========================

document.addEventListener("keydown", function (event) {

    const key = event.key;

    if (/^[0-9]$/.test(key)) {

        addValue(key);

    } else if (["+", "-", "*", "/"].includes(key)) {

        addValue(key);

    } else if (key === ".") {

        addValue(".");

    } else if (key === "%") {

        addPercentage();

    } else if (key === "Enter" || key === "=") {

        event.preventDefault();

        calculate();

    } else if (key === "Backspace") {

        deleteLast();

    } else if (key === "Escape") {

        clearCalculator();

    }

});


// =========================
// COPYRIGHT YEAR
// =========================

document.getElementById("year").textContent =
    new Date().getFullYear();


// INITIAL DISPLAY

updateDisplay();
renderHistory();