class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement) {
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
        this.isRadian = false;
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
    }

    delete() {
        if (this.currentOperand === '0') return;
        if (this.currentOperand.length === 1 || (this.currentOperand.length === 2 && this.currentOperand.startsWith('-'))) {
            this.currentOperand = '0';
            return;
        }
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
    }

    appendNumber(number) {
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
    }

    chooseOperation(operation) {
        if (this.currentOperand === '0' && this.previousOperand === '') return;
        
        // Handle Percentage Request
        if (operation === '%') {
             this.currentOperand = (parseFloat(this.currentOperand) / 100).toString();
             return;
        }
        
        if (this.previousOperand !== '') {
            this.compute();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '0';
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        if (isNaN(prev) || isNaN(current)) return;
        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '×':
            case '*':
                computation = prev * current;
                break;
            case '÷':
            case '/':
                if (current === 0) {
                    alert("Cannot divide by zero");
                    this.clear();
                    return;
                }
                computation = prev / current;
                break;
            case '^':
                computation = Math.pow(prev, current);
                break;
            default:
                return;
        }
        
        // Handle floating point precision issues nicely
        this.currentOperand = Math.round(computation * 100000000) / 100000000;
        this.operation = undefined;
        this.previousOperand = '';
    }

    getDisplayNumber(number) {
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        }
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    computeUnary(operation) {
        let current = parseFloat(this.currentOperand);
        if (isNaN(current)) return;
        
        let result;
        switch (operation) {
            case 'sin':
                if (!this.isRadian) current = current * Math.PI / 180;
                result = Math.sin(current);
                break;
            case 'cos':
                if (!this.isRadian) current = current * Math.PI / 180;
                result = Math.cos(current);
                break;
            case 'tan':
                if (!this.isRadian) current = current * Math.PI / 180;
                result = Math.tan(current);
                // Tan 90 degrees is undefined but JS might return a very large number, we limit it
                if (!this.isRadian && current % 180 === 90) {
                    alert("Invalid input for tan");
                    return;
                }
                break;
            case 'log':
                if (current <= 0) {
                    alert("Invalid input for log");
                    return;
                }
                result = Math.log10(current);
                break;
            case 'ln':
                if (current <= 0) {
                    alert("Invalid input for ln");
                    return;
                }
                result = Math.log(current);
                break;
            case 'sqrt':
                if (current < 0) {
                    alert("Invalid input for square root");
                    return;
                }
                result = Math.sqrt(current);
                break;
            case 'square':
                result = Math.pow(current, 2);
                break;
            default:
                return;
        }
        
        // Format to avoid floating point anomalies
        this.currentOperand = (Math.round(result * 10000000000) / 10000000000).toString();
    }

    appendConstant(constant) {
        if (constant === 'pi') {
            this.currentOperand = Math.PI.toString();
        } else if (constant === 'e') {
            this.currentOperand = Math.E.toString();
        }
    }

    updateDisplay() {
        this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand);
        if (this.operation != null) {
            this.previousOperandTextElement.innerText =
                `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.previousOperandTextElement.innerText = '';
        }
    }
}

const numberButtons = document.querySelectorAll('[data-number]');
const operationButtons = document.querySelectorAll('[data-operation]');
const sciButtons = document.querySelectorAll('[data-sci-op]');
const constantButtons = document.querySelectorAll('[data-constant]');
const equalsButton = document.querySelector('[data-equals]');
const deleteButton = document.querySelector('[data-delete]');
const allClearButton = document.querySelector('[data-all-clear]');
const previousOperandTextElement = document.querySelector('[data-previous-operand]');
const currentOperandTextElement = document.querySelector('[data-current-operand]');
const degBtn = document.getElementById('deg-btn');
const radBtn = document.getElementById('rad-btn');

const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);

numberButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendNumber(button.innerText);
        calculator.updateDisplay();
    });
});

operationButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.chooseOperation(button.innerText);
        calculator.updateDisplay();
    });
});

sciButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.computeUnary(button.dataset.sciOp);
        calculator.updateDisplay();
    });
});

constantButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendConstant(button.dataset.constant);
        calculator.updateDisplay();
    });
});

degBtn.addEventListener('click', () => {
    calculator.isRadian = false;
    degBtn.classList.add('active');
    radBtn.classList.remove('active');
});

radBtn.addEventListener('click', () => {
    calculator.isRadian = true;
    radBtn.classList.add('active');
    degBtn.classList.remove('active');
});

equalsButton.addEventListener('click', button => {
    calculator.compute();
    calculator.updateDisplay();
});

allClearButton.addEventListener('click', button => {
    calculator.clear();
    calculator.updateDisplay();
});

deleteButton.addEventListener('click', button => {
    calculator.delete();
    calculator.updateDisplay();
});

// Keyboard support
document.addEventListener('keydown', event => {
    if (event.key >= 0 && event.key <= 9 || event.key === '.') {
        calculator.appendNumber(event.key);
        calculator.updateDisplay();
    }
    if (event.key === '=' || event.key === 'Enter') {
        calculator.compute();
        calculator.updateDisplay();
    }
    if (event.key === 'Backspace') {
        calculator.delete();
        calculator.updateDisplay();
    }
    if (event.key === 'Escape') {
        calculator.clear();
        calculator.updateDisplay();
    }
    if (event.key === '+' || event.key === '-') {
        calculator.chooseOperation(event.key);
        calculator.updateDisplay();
    }
    if (event.key === '*') {
        calculator.chooseOperation('×');
        calculator.updateDisplay();
    }
    if (event.key === '/') {
        calculator.chooseOperation('÷');
        calculator.updateDisplay();
    }
    if (event.key === '^') {
        calculator.chooseOperation('^');
        calculator.updateDisplay();
    }
    if (event.key === '%') {
        calculator.chooseOperation('%');
        calculator.updateDisplay();
    }
});
