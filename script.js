let currentInput = '';
let display = document.getElementById('display');
let isResult = false; 
let history = []; 
let historyList = document.getElementById('historyList');

function loadHistory() {
    const storedHistory = localStorage.getItem('calculatorHistory');
    if (storedHistory) {
        history = JSON.parse(storedHistory);
    }
    updateHistoryDisplay();
}

function saveHistory() {
    localStorage.setItem('calculatorHistory', JSON.stringify(history));
}

function updateHistoryDisplay() {
    historyList.innerHTML = '';
    
    history.forEach((item, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = item;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'x';
        deleteButton.className = 'delete-history-item';
        deleteButton.addEventListener('click', (event) => {
            event.stopPropagation(); 
            deleteHistoryItem(index);
        });

        listItem.appendChild(deleteButton);
        historyList.appendChild(listItem);
    });
}

function deleteHistoryItem(index) {
    history.splice(index, 1);
    saveHistory();
    updateHistoryDisplay();
}

function clearAllHistory() {
    history = [];
    localStorage.removeItem('calculatorHistory');
    updateHistoryDisplay();
}

function buttonClick(value) {

    if (isResult) {
        if (value >= '0' && value <= '9' || value === '.') {
            currentInput = '';
            isResult = false;
        } 
        else if (['+', '-', '*', '/'].includes(value)) {
            isResult = false;
        }
    }

    if (value === 'AC') {
        currentInput = '';
        isResult = false; 
    } else if (value === '=') {
        try {
            if (currentInput !== '' && !isResult) {
                const expression = currentInput;
                let result = eval(currentInput);
                currentInput = result.toString();
                
                history.push(`${expression} = ${currentInput}`);
                saveHistory(); 
                updateHistoryDisplay();
                
                isResult = true;
            }
        } catch {
            currentInput = 'Error';
            isResult = true; 
        }
    } else if (value === '+/-') {
        if (currentInput !== '' && !isNaN(currentInput)) {
            currentInput = (parseFloat(currentInput) * -1).toString();
        }
    } else if (value === '%') {
        if (currentInput !== '' && !isNaN(currentInput)) {
            currentInput = (parseFloat(currentInput) / 100).toString();
        }
    } else if (value === 'DEL') {
        if (!isResult) {
            currentInput = currentInput.slice(0, -1);
        }
    } else {
        currentInput += value;
    }
    
    updateDisplay();
}

function updateDisplay() {
    if (currentInput === '') {
        display.value = '0';
    } else {
        display.value = currentInput;
    }
}

document.querySelectorAll('.buttons button').forEach(button => {
    button.addEventListener('click', () => {
        buttonClick(button.textContent);
    });
});

loadHistory(); 
updateDisplay();