// DOM Element References
const display = document.getElementById('display');
const buttons = document.querySelector('.buttons');
const historyList = document.getElementById('historyList');
const historyDisplay = document.getElementById('historyDisplay');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const containerWrapper = document.querySelector('.container-wrapper'); // Added reference to the container wrapper

// State Variables
let currentInput = '0';
let previousInput = '';
let operator = null;
let awaitingNextInput = false;
let history = [];

// Initialize the display
updateDisplay();

// --- Core Calculator Logic ---

/**
 * Updates the display with the current input value.
 */
function updateDisplay() {
    // Limit display length to avoid overflow, adjust as needed
    if (currentInput.length > 15) {
        display.value = parseFloat(currentInput).toPrecision(10);
    } else {
        display.value = currentInput;
    }
}

/**
 * Handles number button presses (0-9, .).
 * @param {string} number - The number or decimal point pressed.
 */
function inputNumber(number) {
    if (awaitingNextInput) {
        currentInput = number;
        awaitingNextInput = false;
    } else {
        if (currentInput === '0' && number !== '.') {
            currentInput = number;
        } else if (number === '.' && currentInput.includes('.')) {
            return;
        } else {
            currentInput += number;
        }
    }
    updateDisplay();
}

/**
 * Handles operator button presses (+, -, *, /).
 * @param {string} nextOperator - The operator pressed.
 */
function inputOperator(nextOperator) {
    const inputValue = parseFloat(currentInput);

    if (operator && awaitingNextInput) {
        operator = nextOperator;
        return;
    }

    if (previousInput === '') {
        previousInput = inputValue;
    } else if (operator) {
        const result = calculate(parseFloat(previousInput), inputValue, operator);
        
        if (result === 'Error') {
            display.value = 'Error';
            resetState();
            return;
        }

        addToHistory(previousInput, inputValue, operator, result);

        previousInput = result;
        currentInput = String(result);
    }
    
    operator = nextOperator;
    awaitingNextInput = true;
    updateDisplay();
}

/**
 * Performs the calculation based on the operator.
 * @param {number} num1 - The first number.
 * @param {number} num2 - The second number.
 * @param {string} op - The operator.
 * @returns {number|string} The result or 'Error' for division by zero.
 */
function calculate(num1, num2, op) {
    switch (op) {
        case '+':
            return num1 + num2;
        case '-':
            return num1 - num2;
        case '*':
            return num1 * num2;
        case '/':
            if (num2 === 0) return 'Error';
            return num1 / num2;
        default:
            return num2;
    }
}

/**
 * Handles the 'equals' button press.
 */
function handleEquals() {
    if (operator === null || awaitingNextInput) {
        return;
    }

    const num1 = parseFloat(previousInput);
    const num2 = parseFloat(currentInput);
    const op = operator;

    const result = calculate(num1, num2, op);

    if (result === 'Error') {
        display.value = 'Error';
        resetState();
        return;
    }

    addToHistory(num1, num2, op, result);

    currentInput = String(result);
    previousInput = '';
    operator = null;
    awaitingNextInput = true;
    updateDisplay();
}

// --- Special Functionality ---

/**
 * Clears the display and resets all state variables (AC).
 */
function clearAll() {
    resetState();
    updateDisplay();
}

/**
 * Resets the calculator state variables.
 */
function resetState() {
    currentInput = '0';
    previousInput = '';
    operator = null;
    awaitingNextInput = false;
}

/**
 * Handles the 'DEL' (backspace) functionality.
 */
function backspace() {
    if (awaitingNextInput) {
        return;
    }

    currentInput = currentInput.slice(0, -1);
    if (currentInput === '') {
        currentInput = '0';
    }
    updateDisplay();
}

/**
 * Toggles the sign of the current input (+/-).
 */
function toggleSign() {
    if (currentInput !== '0') {
        currentInput = (parseFloat(currentInput) * -1).toString();
        updateDisplay();
    }
}

/**
 * Handles the percentage calculation (%).
 */
function calculatePercentage() {
    const value = parseFloat(currentInput);
    currentInput = (value / 100).toString();
    updateDisplay();
}

// --- History Management ---

/**
 * Adds a calculation entry to the history and updates the display.
 */
function addToHistory(num1, num2, op, result) {
    // Ensure history entries are formatted correctly and potentially rounded for readability
    const formattedResult = parseFloat(result).toFixed(4);
    const calculation = `${num1} ${op} ${num2} = ${formattedResult}`;
    history.push(calculation);
    updateHistoryDisplay();
}

/**
 * Renders the history list in the UI.
 */
function updateHistoryDisplay() {
    historyList.innerHTML = '';
    
    // Display newest history entries first
    const reversedHistory = [...history].reverse(); 

    reversedHistory.forEach((item, index) => {
        const li = document.createElement('li');
        const originalIndex = history.length - 1 - index;
        
        li.textContent = item;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'x';
        deleteButton.classList.add('delete-history-item');
        deleteButton.onclick = () => deleteHistoryItem(originalIndex);
        
        li.appendChild(deleteButton);
        historyList.appendChild(li);
    });
}

/**
 * Clears all entries from the history.
 */
function clearAllHistory() {
    history = [];
    updateHistoryDisplay();
}

/**
 * Deletes a specific history item by index.
 */
function deleteHistoryItem(index) {
    history.splice(index, 1);
    updateHistoryDisplay();
}

// --- RGB Background Effect ---

/**
 * Generates a smooth transition between RGB colors based on mouse position.
 * The colors change based on the mouse's X and Y coordinates relative to the viewport.
 * * @param {number} x - Mouse X coordinate
 * @param {number} y - Mouse Y coordinate
 */
function updateBackgroundRGB(x, y) {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Map X and Y coordinates to RGB values (0-255)
    // Red and Green values are based on X and Y position
    const r = Math.floor((x / width) * 255);
    const g = Math.floor((y / height) * 255);
    
    // Blue value is based on the inverse of the mouse distance from the center
    const centerX = width / 2;
    const centerY = height / 2;
    const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
    const maxDistance = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2));
    const b = Math.floor((1 - (distance / maxDistance)) * 255);

    // Apply the RGB color to the body
    document.body.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
}

// Add event listener to the entire document for mouse movement
document.addEventListener('mousemove', (e) => {
    updateBackgroundRGB(e.clientX, e.clientY);
});

// --- Event Listeners ---

// Attach event listener to the button container
buttons.addEventListener('click', (event) => {
    const target = event.target;
    
    if (target.tagName !== 'BUTTON') {
        return;
    }

    // Determine the action based on the button class
    if (target.classList.contains('number') || target.classList.contains('zero') || target.classList.contains('decimal')) {
        inputNumber(target.textContent);
    } else if (target.classList.contains('operator')) {
        const buttonText = target.textContent;
        if (buttonText === '+/-') {
            toggleSign();
        } else if (buttonText === '%') {
            calculatePercentage();
        } else {
            inputOperator(buttonText);
        }
    } else if (target.classList.contains('equals')) {
        handleEquals();
    } else if (target.classList.contains('clear')) {
        clearAll();
    } else if (target.classList.contains('backspace')) {
        backspace();
    }
});