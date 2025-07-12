const display = document.getElementById('display');
const buttons = document.querySelector('.buttons');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const containerWrapper = document.querySelector('.container-wrapper'); 

let currentInput = '0';
let previousInput = '';
let operator = null;
let awaitingNextInput = false;
let lastCalculatedResult = null; 

let history = JSON.parse(localStorage.getItem('calculatorHistory')) || [];

updateDisplay();
updateHistoryDisplay();

function updateDisplay() {
    if (currentInput.length > 15) {
        display.value = parseFloat(currentInput).toPrecision(10);
    } else {
        display.value = currentInput;
    }
}

function inputNumber(number) {
    if (awaitingNextInput) {
        // If an operator was pressed, we are now typing the second number.
        // We append the new number to the existing input string.
        
        // Handle the case where we start typing after a calculation result
        if (operator === null && lastCalculatedResult !== null) {
            currentInput = number;
            lastCalculatedResult = null;
        } else if (operator) {
            // Check if the currentInput ends with the operator (e.g., "5+")
            const lastChar = currentInput.slice(-1);
            if (['+', '-', '*', '/'].includes(lastChar)) {
                currentInput += number;
            } else {
                // If we are continuing to type the second number (e.g., typing '1' after '5+1')
                currentInput += number;
            }
        } else {
            // Handle standard input if awaitingNextInput is true but operator is null (e.g. after AC or initial load)
            if (currentInput === '0' && number !== '.') {
                currentInput = number;
            } else if (number === '.' && currentInput.includes('.')) {
                return;
            } else {
                currentInput += number;
            }
        }
        awaitingNextInput = false;

    } else {
        // Standard number input (before operator)
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

function inputOperator(nextOperator) {
    
    if (previousInput === '') {
        // First operation: store the current display value as the first operand.
        previousInput = parseFloat(currentInput);
        currentInput += nextOperator;
    } else if (awaitingNextInput) {
        // If an operator is already set and we press another one (e.g., changing from + to *).
        operator = nextOperator;
        // Replace the existing operator symbol in the display
        currentInput = currentInput.slice(0, -1) + nextOperator;
    } else {
        // Subsequent operation: We have Num1, Operator, and Num2 entered.
        
        // 1. Find the second operand (Num2) from the currentInput string.
        // We assume currentInput contains 'previousInput' + 'operator' + 'Num2'
        const opIndex = currentInput.lastIndexOf(operator);
        const num2String = currentInput.substring(opIndex + 1);
        const inputValue = parseFloat(num2String);

        if (isNaN(inputValue)) {
             // Handle cases where no second number was entered yet (e.g., '5+')
             operator = nextOperator;
             currentInput = currentInput.slice(0, -1) + nextOperator;
             updateDisplay();
             return;
        }

        // 2. Perform the calculation.
        const result = calculate(parseFloat(previousInput), inputValue, operator);
        
        if (result === 'Error') {
            display.value = 'Error';
            resetState();
            return;
        }

        addToHistory(previousInput, inputValue, operator, result);

        // 3. Update state for the next operation.
        previousInput = result;
        currentInput = String(result) + nextOperator; 
    }
    
    // Set the new operator and prepare for the next input
    operator = nextOperator;
    awaitingNextInput = true;
    updateDisplay();
}

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

function handleEquals() {
    if (operator === null || awaitingNextInput) {
        return;
    }

    // Extract Num1 and Num2 for the final calculation.
    let num1 = parseFloat(previousInput);
    
    // Extract Num2 by finding the substring after the operator.
    const opIndex = currentInput.lastIndexOf(operator);
    let num2 = parseFloat(currentInput.substring(opIndex + 1));
    
    // Handle cases where '=' is pressed right after an operator without a second number.
    if (isNaN(num2)) {
        num2 = parseFloat(currentInput);
    }

    let op = operator;

    const result = calculate(num1, num2, op);

    if (result === 'Error') {
        display.value = 'Error';
        resetState();
        return;
    }

    addToHistory(num1, num2, op, result);

    currentInput = String(result);
    previousInput = ''; // Reset for a new calculation
    operator = null; 
    awaitingNextInput = true;
    lastCalculatedResult = result;
    updateDisplay();
}

// --- Special Functionality ---

function clearAll() {
    resetState();
    updateDisplay();
}

function resetState() {
    currentInput = '0';
    previousInput = '';
    operator = null;
    awaitingNextInput = false;
    lastCalculatedResult = null;
}

function backspace() {
    if (awaitingNextInput) {
        // If the user hasn't started typing the next number yet, just return.
        return;
    }

    currentInput = currentInput.slice(0, -1);
    if (currentInput === '') {
        currentInput = '0';
    }
    updateDisplay();
}

function toggleSign() {
    if (currentInput !== '0') {
        currentInput = (parseFloat(currentInput) * -1).toString();
        updateDisplay();
    }
}

function calculatePercentage() {
    const value = parseFloat(currentInput);
    currentInput = (value / 100).toString();
    updateDisplay();
}

// --- History Management (Uses localStorage) ---

function saveHistory() {
    localStorage.setItem('calculatorHistory', JSON.stringify(history));
}

function addToHistory(num1, num2, op, result) {
    const formattedResult = parseFloat(result).toFixed(4);
    const calculation = `${num1} ${op} ${num2} = ${formattedResult}`;
    history.push(calculation);
    saveHistory(); 
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    historyList.innerHTML = '';
    
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

function clearAllHistory() {
    history = [];
    saveHistory(); 
    updateHistoryDisplay();
}

function deleteHistoryItem(index) {
    history.splice(index, 1);
    saveHistory(); 
    updateHistoryDisplay();
}

// --- RGB Background Effect ---

function updateBackgroundRGB(x, y) {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const r = Math.floor((x / width) * 255);
    const g = Math.floor((y / height) * 255);
    
    const centerX = width / 2;
    const centerY = height / 2;
    const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
    const maxDistance = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2));
    const b = Math.floor((1 - (distance / maxDistance)) * 255);

    document.body.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
}

document.addEventListener('mousemove', (e) => {
    updateBackgroundRGB(e.clientX, e.clientY);
});

// --- Event Listeners ---

buttons.addEventListener('click', (event) => {
    const target = event.target;
    
    if (target.tagName !== 'BUTTON') {
        return;
    }

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