/*
 * Professional Calculator Implementation
 * A feature-rich calculator with comprehensive validation,
 * error handling, and modern JavaScript practices.
 * 
 * Features:
 * - Mathematical expression evaluation
 * - Keyboard and mouse input support
 * - Theme switching with persistence
 * - Comprehensive input validation
 * - Error handling and recovery
 * - Memory management
 * 
 * @version 4.0.0
 * @author Priyanshu Sahoo #PS98Tech
 */

class Calculator {
    constructor() {
        // Prevent multiple instances (Singleton pattern)
        if (Calculator.instance) {
            return Calculator.instance;
        }
        Calculator.instance = this;

        // DOM element references
        this.display = document.querySelector('#display');
        this.buttons = document.querySelectorAll('button');
        this.themeToggleBtn = document.querySelector('.theme-toggler');
        this.calculator = document.querySelector('.calculator');
        this.toggleIcon = document.querySelector('.toggler-icon');
        
        // Calculator state
        this.currentExpression = "";
        this.lastResult = null;
        this.isDark = true;
        this.isInitialized = false;
        
        // Configuration constants
        this.MAX_DISPLAY_LENGTH = 25;
        this.MAX_DECIMAL_PLACES = 10;
        this.SCIENTIFIC_NOTATION_THRESHOLD = 1e10;
        this.MINIMUM_VALUE_THRESHOLD = 1e-15;
        
        // Initialize only if required elements exist
        if (this.validateElements()) {
            this.init();
        }
    }
    
    /**
     * Validate that required DOM elements exist
     * @returns {boolean} True if all required elements are present
     */
    validateElements() {
        const validationResults = [
            { element: this.display, name: 'Calculator display (#display)', required: true },
            { element: this.buttons, name: 'Calculator buttons', required: true, checkLength: true },
            { element: this.themeToggleBtn, name: 'Theme toggle (.theme-toggler)', required: false },
            { element: this.calculator, name: 'Calculator container (.calculator)', required: false }
        ];

        let isValid = true;

        validationResults.forEach(({ element, name, required, checkLength }) => {
            if (required) {
                if (!element || (checkLength && element.length === 0)) {
                    console.error(`${name} not found`);
                    isValid = false;
                }
            }
        });

        return isValid;
    }
    
    /**
     * Initialize the calculator
     */
    init() {
        if (this.isInitialized) return;
        
        try {
            this.setupEventListeners();
            this.loadThemePreference();
            this.updateDisplay();
            this.isInitialized = true;
            console.log('Calculator initialized successfully');
        } catch (error) {
            console.error('Calculator initialization failed:', error);
        }
    }
    
    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // Button click events with error handling
        if (this.buttons.length > 0) {
            this.buttons.forEach((button) => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleInput(button.id);
                });
            });
        }
        
        // Keyboard events
        document.addEventListener('keydown', (event) => {
            this.handleKeyboard(event);
        });
        
        // Theme toggle (only if elements exist)
        if (this.themeToggleBtn && this.calculator) {
            this.themeToggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleTheme();
            });
        }

        // Window beforeunload to save state
        window.addEventListener('beforeunload', () => {
            this.saveCalculatorState();
        });
    }
    
    /**
     * Handle keyboard input with comprehensive key validation
     * @param {KeyboardEvent} event - The keyboard event
     */
    handleKeyboard(event) {
        const key = event.key;
        
        // Prevent default for calculator keys to avoid browser shortcuts
        if (this.isCalculatorKey(key)) {
            event.preventDefault();
        }
        
        // Route keyboard input to appropriate handler
        if (this.isNumericKey(key) || this.isOperatorKey(key) || this.isSpecialCharKey(key)) {
            this.handleInput(key);
        } else if (key === 'Enter' || key === '=') {
            this.handleInput('equal');
        } else if (key === 'Backspace') {
            this.handleInput('backspace');
        } else if (key === 'Escape' || key === 'Delete') {
            this.handleInput('clear');
        } else if (key.toLowerCase() === 'c') {
            this.handleInput('clear');
        }
    }
    
    /**
     * Check if key is a numeric key (0-9)
     * @param {string} key - The key to check
     * @returns {boolean} True if numeric key
     */
    isNumericKey(key) {
        return key >= '0' && key <= '9';
    }
    
    /**
     * Check if key is an operator key
     * @param {string} key - The key to check
     * @returns {boolean} True if operator key
     */
    isOperatorKey(key) {
        return ['+', '-', '*', '/', '×', '÷'].includes(key);
    }
    
    /**
     * Check if key is a special character key
     * @param {string} key - The key to check
     * @returns {boolean} True if special character key
     */
    isSpecialCharKey(key) {
        return ['.', '(', ')'].includes(key);
    }
    
    /**
     * Check if key is a calculator-related key
     * @param {string} key - The key to check
     * @returns {boolean} True if calculator key
     */
    isCalculatorKey(key) {
        return this.isNumericKey(key) || this.isOperatorKey(key) || 
               this.isSpecialCharKey(key) || 
               ['Enter', '=', 'Backspace', 'Escape', 'Delete', 'c', 'C'].includes(key);
    }
    
    /**
     * Update display with proper formatting and validation
     */
    updateDisplay() {
        if (!this.display) return;
        
        let displayText = this.currentExpression || "0";
        
        // Handle very long expressions
        if (displayText.length > this.MAX_DISPLAY_LENGTH) {
            displayText = '...' + displayText.slice(-(this.MAX_DISPLAY_LENGTH - 3));
        }
        
        // Format numbers for better readability
        if (this.isNumericResult(displayText)) {
            displayText = this.formatNumber(displayText);
        }
        
        // Update display with error handling
        try {
            this.display.textContent = displayText;
        } catch (error) {
            console.error('Display update failed:', error);
        }
    }
    
    /**
     * Check if the display shows a pure numeric result
     * @param {string} text - Text to check
     * @returns {boolean} True if numeric result
     */
    isNumericResult(text) {
        if (text === "Error" || text === "" || text === "0") return text === "0";
        
        // Parse as number and check validity
        const num = parseFloat(text);
        if (isNaN(num) || !isFinite(num)) return false;
        
        // Remove leading minus for validation
        const cleanText = text.replace(/^-/, '');
        
        // Should not contain operators or parentheses after removing leading minus
        return !/[+\-*/()]/.test(cleanText);
    }
    
    /**
     * Format numbers for optimal display
     * @param {string} numStr - Number string to format
     * @returns {string} Formatted number string
     */
    formatNumber(numStr) {
        const num = parseFloat(numStr);
        
        if (isNaN(num) || !isFinite(num)) return "Error";
        
        // Handle very large or very small numbers
        if (Math.abs(num) >= this.SCIENTIFIC_NOTATION_THRESHOLD || 
            (Math.abs(num) < 1e-6 && num !== 0)) {
            return num.toExponential(6);
        }
        
        // Handle decimal places
        if (num % 1 !== 0) {
            return parseFloat(num.toFixed(this.MAX_DECIMAL_PLACES)).toString();
        }
        
        return num.toString();
    }
    
    /**
     * Check if character is a mathematical operator
     * @param {string} char - Character to check
     * @returns {boolean} True if operator
     */
    isOperator(char) {
        return ["+", "-", "*", "/", "×", "÷"].includes(char);
    }
    
    /**
     * Validate if a decimal point can be added to current number
     * @returns {boolean} True if decimal can be added
     */
    canAddDecimal() {
        // Split expression by operators and parentheses to get current number
        const parts = this.currentExpression.split(/[+\-*/()]/);
        const lastPart = parts[parts.length - 1];
        
        // Check if current number already has a decimal point
        return !lastPart.includes('.');
    }
    
    /**
     * Comprehensive expression validation
     * @param {string} expression - Expression to validate
     * @returns {boolean} True if expression is valid
     */
    isValidExpression(expression) {
        if (!expression || expression === "") return false;
        
        // Check for valid characters only
        if (!/^[0-9+\-*/().\s]+$/.test(expression)) return false;
        
        // Check for invalid operator sequences
        if (/[+*/]{2,}/.test(expression) || /-{2,}/.test(expression)) return false;
        
        // Check if expression starts with invalid operator
        if (/^[+*/]/.test(expression)) return false;
        
        // Check if expression ends with operator
        if (/[+\-*/]$/.test(expression)) return false;
        
        // Validate parentheses balance and structure
        if (!this.validateParentheses(expression)) return false;
        
        // Check for invalid decimal usage
        if (/\.{2,}/.test(expression)) return false;
        
        // Check for invalid number formats
        if (/\d+\.\d*\./.test(expression)) return false;
        
        return true;
    }
    
    /**
     * Validate parentheses in expression
     * @param {string} expression - Expression to validate
     * @returns {boolean} True if parentheses are valid
     */
    validateParentheses(expression) {
        let parenCount = 0;
        let lastChar = '';
        
        for (let char of expression) {
            if (char === '(') {
                parenCount++;
                // Check for invalid combinations like ")(" or "+("
                if (lastChar === ')' || (this.isOperator(lastChar) && lastChar !== '' && lastChar !== '-')) {
                    // Allow operators before opening parenthesis
                }
            }
            
            if (char === ')') {
                parenCount--;
                if (parenCount < 0) return false;
                // Cannot close parenthesis immediately after opening
                if (lastChar === '(') return false;
            }
            
            lastChar = char;
        }
        
        // Must have balanced parentheses
        return parenCount === 0;
    }
    
    /**
     * Safely evaluate mathematical expressions using Function constructor
     * @param {string} expression - Mathematical expression to evaluate
     * @returns {number|string} Result of evaluation or "Error"
     */
    safeEvaluate(expression) {
        try {
            // Sanitize expression
            expression = expression.replace(/\s/g, '');
            expression = expression.replace(/×/g, '*');
            expression = expression.replace(/÷/g, '/');
            
            // Validate expression before evaluation
            if (!this.isValidExpression(expression)) {
                return "Error";
            }
            
            // Use Function constructor for safer evaluation than eval()
            const result = Function(`"use strict"; return (${expression})`)();
            
            // Handle mathematical errors and edge cases
            if (!isFinite(result)) return "Error";
            if (typeof result !== 'number') return "Error";
            
            // Handle very small numbers (essentially zero)
            if (Math.abs(result) < this.MINIMUM_VALUE_THRESHOLD) {
                return 0;
            }
            
            return result;
            
        } catch (error) {
            console.log('Expression evaluation error:', error.message);
            return "Error";
        }
    }
    
    /**
     * Main input handler with comprehensive logic
     * @param {string} input - The input to handle
     */
    handleInput(input) {
        const lastChar = this.currentExpression.slice(-1);
        
        // Handle different input types
        switch(input) {
            case "clear":
                this.clearCalculator();
                break;
                
            case "backspace":
                this.handleBackspace();
                break;
                
            case "equal":
                this.calculateResult();
                break;
                
            case ".":
                this.handleDecimalInput(lastChar);
                break;
                
            default:
                if (this.isNumericKey(input)) {
                    this.handleNumberInput(input, lastChar);
                } else if (this.isOperator(input) || this.isOperatorKey(input)) {
                    this.handleOperatorInput(input, lastChar);
                } else if (input === "(" || input === ")") {
                    this.handleParenthesesInput(input, lastChar);
                }
                break;
        }
        
        this.updateDisplay();
    }
    
    /**
     * Clear calculator state
     */
    clearCalculator() {
        this.currentExpression = "";
        this.lastResult = null;
    }
    
    /**
     * Handle backspace input
     */
    handleBackspace() {
        this.currentExpression = this.currentExpression.slice(0, -1);
        if (this.lastResult !== null && this.currentExpression === this.lastResult.toString().slice(0, -1)) {
            this.lastResult = null;
        }
    }
    
    /**
     * Calculate and display result
     */
    calculateResult() {
        if (!this.currentExpression) return;
        
        const result = this.safeEvaluate(this.currentExpression);
        
        if (result !== "Error") {
            this.lastResult = result;
            this.currentExpression = result.toString();
        } else {
            this.currentExpression = "";
            this.lastResult = null;
        }
    }
    
    /**
     * Handle decimal point input
     * @param {string} lastChar - Last character in expression
     */
    handleDecimalInput(lastChar) {
        if (!this.canAddDecimal()) return;
        
        // Add decimal point logic
        if (this.currentExpression === "" || this.isOperator(lastChar) || lastChar === "(") {
            this.currentExpression += "0.";
        } else if (lastChar !== "." && !this.isOperator(lastChar) && lastChar !== "(") {
            this.currentExpression += ".";
        }
    }
    
    /**
     * Handle number input
     * @param {string} input - Number input
     * @param {string} lastChar - Last character in expression
     */
    handleNumberInput(input, lastChar) {
        // If last result was displayed, start fresh unless continuing with decimal
        if (this.lastResult !== null && !this.isOperator(lastChar) && lastChar !== ".") {
            this.currentExpression = input;
            this.lastResult = null;
        } else {
            this.currentExpression += input;
        }
    }
    
    /**
     * Handle operator input
     * @param {string} input - Operator input
     * @param {string} lastChar - Last character in expression
     */
    handleOperatorInput(input, lastChar) {
        // Normalize operator symbols
        const normalizedInput = input.replace('×', '*').replace('÷', '/');
        
        // Don't start with operator (except minus for negative numbers)
        if (this.currentExpression === "" && normalizedInput !== "-") {
            return;
        }
        
        // Handle consecutive operators
        if (this.isOperator(lastChar)) {
            this.currentExpression = this.currentExpression.slice(0, -1) + normalizedInput;
        } else if (lastChar !== "") {
            this.currentExpression += normalizedInput;
            this.lastResult = null;
        }
    }
    
    /**
     * Handle parentheses input
     * @param {string} input - Parenthesis input
     * @param {string} lastChar - Last character in expression
     */
    handleParenthesesInput(input, lastChar) {
        if (input === "(") {
            // Add multiplication before ( if needed
            if (lastChar && !this.isOperator(lastChar) && lastChar !== "(") {
                this.currentExpression += "*";
            }
            this.currentExpression += "(";
        } else if (input === ")") {
            // Only add ) if there are unmatched (
            const openParens = (this.currentExpression.match(/\(/g) || []).length;
            const closeParens = (this.currentExpression.match(/\)/g) || []).length;
            
            if (openParens > closeParens && lastChar !== "(" && !this.isOperator(lastChar)) {
                this.currentExpression += ")";
            }
        }
        
        this.lastResult = null;
    }
    
    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
        if (this.calculator) {
            this.calculator.classList.toggle("dark");
        }
        
        if (this.themeToggleBtn) {
            this.themeToggleBtn.classList.toggle("active");
        }
        
        this.isDark = !this.isDark;
        
        // Save theme preference
        this.saveThemePreference();
    }
    
    /**
     * Save theme preference to localStorage
     */
    saveThemePreference() {
        try {
            localStorage.setItem('calculatorTheme', this.isDark ? 'dark' : 'light');
        } catch (error) {
            console.warn('Could not save theme preference:', error);
        }
    }
    
    /**
     * Load theme preference from localStorage
     */
    loadThemePreference() {
        try {
            const savedTheme = localStorage.getItem('calculatorTheme');
            if (savedTheme === 'light' && this.isDark) {
                this.toggleTheme();
            }
        } catch (error) {
            console.warn('Could not load theme preference:', error);
        }
    }
    
    /**
     * Save calculator state
     */
    saveCalculatorState() {
        try {
            const state = {
                currentExpression: this.currentExpression,
                lastResult: this.lastResult,
                isDark: this.isDark
            };
            localStorage.setItem('calculatorState', JSON.stringify(state));
        } catch (error) {
            console.warn('Could not save calculator state:', error);
        }
    }
    
    /**
     * Load calculator state
     */
    loadCalculatorState() {
        try {
            const savedState = localStorage.getItem('calculatorState');
            if (savedState) {
                const state = JSON.parse(savedState);
                this.currentExpression = state.currentExpression || "";
                this.lastResult = state.lastResult || null;
                // Theme is handled separately
            }
        } catch (error) {
            console.warn('Could not load calculator state:', error);
        }
    }
    
    /**
     * Get current calculator state for debugging
     * @returns {Object} Current calculator state
     */
    getState() {
        return {
            currentExpression: this.currentExpression,
            lastResult: this.lastResult,
            isDark: this.isDark,
            isInitialized: this.isInitialized
        };
    }
}

/**
 * Initialize calculator with proper error handling and fallbacks
 */
function initializeCalculator() {
    try {
        const calc = new Calculator();
        
        // Load saved state if initialization was successful
        if (calc.isInitialized) {
            calc.loadCalculatorState();
        }
        
        return calc;
    } catch (error) {
        console.error('Failed to initialize calculator:', error);
        return null;
    }
}

// DOM ready initialization with multiple fallbacks
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCalculator);
} else {
    // DOM already loaded
    initializeCalculator();
}

// Additional fallback for older browsers
window.addEventListener('load', () => {
    if (!Calculator.instance) {
        initializeCalculator();
    }
});

// Export for module usage (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Calculator;
}

// Global access for debugging (development only)
if (typeof window !== 'undefined') {
    window.Calculator = Calculator;
}

// ======================================================================================================

/* 
===================================================
OLD VERSION-3 (NOT USED):

This version implemented a functional programming approach 
with significant improvements over previous versions:

IMPROVEMENTS MADE:
• Fixed operator validation logic to handle negative numbers correctly
• Added comprehensive error handling for missing DOM elements  
• Implemented proper decimal point validation
• Enhanced expression validation with parentheses checking
• Added number formatting for better display readability
• Included keyboard event handling with proper key validation

LIMITATIONS ADDRESSED:
• Resolved flawed regex patterns that blocked valid expressions
• Fixed missing null checks that caused runtime errors  
• Improved mathematical expression evaluation safety
• Better handling of edge cases and mathematical errors

REASON FOR REPLACEMENT:
This functional approach, while robust, became difficult to 
maintain and extend due to:
• Global scope pollution with multiple utility functions
• Lack of encapsulation and data privacy
• Difficulty in managing state and dependencies
• Limited reusability and testability

Therefore, this version was refactored into a class-based 
architecture (current version) that provides:
• Better code organization and encapsulation
• Improved maintainability and extensibility  
• Enhanced error handling and validation
• Easier testing and debugging capabilities
• Modern JavaScript practices and patterns

@version 3.0.0

Kept here only for reference and comparison purposes.

===================================================
*/

// const display = document.querySelector('#display');
// const buttons = document.querySelectorAll('button');
// const themeToggleBtn = document.querySelector('.theme-toggler');
// const calculator = document.querySelector('.calculator');

// let currentExpression = "";

// // Check if required elements exist
// if (!display) {
//     console.error('Calculator display not found!');
// }

// // Function to update display
// function updateDisplay() {
//     if (display) {
//         let displayText = currentExpression || "0";
//         // Handle very long numbers
//         if (displayText.length > 15) {
//             displayText = parseFloat(displayText).toExponential(2);
//         }
//         display.innerText = displayText;
//     }
// }

// // Function to check if character is an operator
// function isOperator(char) {
//     return ["+", "-", "*", "/"].includes(char);
// }

// // Improved validation for operators
// function hasInvalidOperators(expression) {
//     // Don't allow: ++, --, //, **, but allow +-, *-, etc.
//     if (/[+]{2,}|[-]{2,}|[*]{2,}|[/]{2,}/.test(expression)) return true;
//     // Don't start with */ or end with any operator
//     if (/^[*/]|[+\-*/]$/.test(expression)) return true;
//     return false;
// }

// // Check for invalid decimal points
// function hasInvalidDecimals(expression) {
//     // Split by operators and check each number
//     const numbers = expression.split(/[+\-*/()]/);
//     return numbers.some(num => (num.match(/\./g) || []).length > 1);
// }

// // Safely evaluate the math expression
// function safeEvaluate(expression) {
//     try {
//         // Basic character validation
//         if (!/^[0-9+\-*/().\s]+$/.test(expression)) return "Error";
        
//         // Check for invalid operators and decimals
//         if (hasInvalidOperators(expression) || hasInvalidDecimals(expression)) {
//             return "Error";
//         }
        
//         // Parentheses validation
//         let stack = [];
//         for (let ch of expression) {
//             if (ch === '(') stack.push('(');
//             if (ch === ')') {
//                 if (!stack.length) return "Error";
//                 stack.pop();
//             }
//         }
//         if (stack.length) return "Error";
        
//         // Evaluate the expression
//         const result = Function('"use strict"; return (' + expression + ')')();
        
//         // Handle special cases
//         if (!isFinite(result)) return "Error";
//         if (typeof result !== 'number') return "Error";
        
//         // Round very long decimals
//         return Math.round(result * 1000000000000) / 1000000000000;
        
//     } catch {
//         return "Error";
//     }
// }

// // Handle button clicks
// if (buttons.length > 0) {
//     buttons.forEach((item) => {
//         item.onclick = () => handleInput(item.id);
//     });
// }

// // Handle keyboard typing
// document.addEventListener('keydown', (event) => {
//     const validKeys = ['0','1','2','3','4','5','6','7','8','9','+','-','*','/','.',',','(', ')'];
    
//     if (validKeys.includes(event.key)) {
//         handleInput(event.key);
//     } else if (event.key === 'Enter') {
//         handleInput('equal');
//     } else if (event.key === 'Backspace') {
//         handleInput('backspace');
//     } else if (event.key === 'Escape') {
//         handleInput('clear');
//     }
// });

// // Main input handler
// function handleInput(input) {
//     if (input === "clear") {
//         currentExpression = "";
//     } else if (input === "backspace") {
//         currentExpression = currentExpression.slice(0, -1);
//     } else if (input === "equal") {
//         const result = safeEvaluate(currentExpression);
//         currentExpression = (result === "Error") ? "" : result.toString();
//     } else {
//         // Don't start with an operator (except -)
//         if (currentExpression === "" && isOperator(input) && input !== "-") return;
        
//         const lastChar = currentExpression.slice(-1);
        
//         // Handle consecutive operators
//         if (isOperator(lastChar) && isOperator(input)) {
//             currentExpression = currentExpression.slice(0, -1) + input;
//         } else {
//             currentExpression += input;
//         }
//     }
//     updateDisplay();
// }

// // Theme Toggle with error handling
// if (themeToggleBtn && calculator) {
//     themeToggleBtn.onclick = () => {
//         calculator.classList.toggle("dark");
//         themeToggleBtn.classList.toggle("active");
//     };
// }

// // Initialize display
// updateDisplay();

// ======================================================================================================

/* 
===================================================
OLD VERSION-2 (NOT USED):

This version had several validation issues that caused 
incorrect behavior:

1. Flawed operator validation regex (/[+\/-*]{2,}/) that 
incorrectly rejected valid expressions like "5*-3" 
(5 times negative 3).

2. Lack of proper error handling for missing DOM elements, 
which could cause runtime crashes.

3. Missing decimal point validation allowing invalid 
inputs like "5.5.5".

4. No handling of division by zero or infinity results.

5. Basic validation that didn't account for edge cases 
in mathematical expressions.

Therefore, this version was replaced by an improved 
version with better validation, error handling, and 
more robust mathematical expression processing.

@version 2.0.0

Kept here only for reference and comparison purposes.

===================================================
*/

// const display = document.querySelector('#display');
// const buttons = document.querySelectorAll('button');
// let currentExpression = "";

// // Function to update display
// function updateDisplay() {
//     display.innerText = currentExpression ||"0";
// }

// // Function to check if character is an operator
// function isOperator(char) {
//     return ["+", "-","*", "/"].includes(char);
// }

// // Safely evaluate the math expression
// function safeEvaluate(expression) {
//     try {
//         if (!/^[0-9+\-*/().\s]+$/.test(expression)) return "Error";
//         if (/[+\-*/]{2,}/.test(expression)) return "Error";
//         let stack = [];
//         for (let ch of expression) {
//             if (ch === '(') stack.push('(');
//             if (ch === ')') {
//                 if (!stack.length) return "Error";
//                 stack.pop();
//             }
//         }
//         if (stack.length) return "Error";
//         return Function('"use strict"; return (' + expression + ')')();
//     } catch {
//         return "Error";
//     }
// }

// // Handle button clicks
// buttons.forEach((item) => {
//     item.onclick = () => handleInput(item.id);
// });

// // Handle keyboard typing
// document.addEventListener('keydown', (event) => {
//     if ((event.key >= '0' && event.key <= '9') || ['+', '-', '*', '/', '.', '(', ')'].includes(event.key)) {
//         handleInput(event.key);
//     } else if (event.key === 'Enter') {
//         handleInput('equal');
//     } else if (event.key === 'Backspace') {
//         handleInput('backspace');
//     } else if (event.key === 'Escape') {
//         handleInput('clear');
//     }
// });

// // Main input handler
// function handleInput(input) {
//     if (input === "clear") {
//         currentExpression = "";
//     } else if (input === "backspace") {
//         currentExpression = currentExpression.slice(0, -1);
//     } else if (input === "equal") {
//         const result = safeEvaluate(currentExpression);
//         currentExpression = (result === "Error") ? "" : result.toString();
//     } else {
//         if (currentExpression === "" && isOperator(input)) return;
//         const lastChar = currentExpression.slice(-1);
//         if (isOperator(lastChar) && isOperator(input)) {
//             currentExpression = currentExpression.slice(0, -1) + input;
//         } else {
//             currentExpression += input;
//         }
//     }
//     updateDisplay();
// }

// // Theme Toggle
// const themeToggleBtn = document.querySelector('.theme-toggler');
// const calculator = document.querySelector('.calculator');
// const toggleIcon = document.querySelector('.toggler-icon');
// let isDark = true;

// themeToggleBtn.onclick = () => {
//     calculator.classList.toggle("dark");
//     themeToggleBtn.classList.toggle("active");
//     isDark = !isDark;
// };

// // Initialize display
// updateDisplay();

// ======================================================================================================

/* 
===================================================
OLD VERSION-1 (NOT USED):

This code uses 'eval()' to evaluate expressions, 
which is considered unsafe because it can execute 
arbitrary JavaScript code and cause security risks.

Therefore, this version was replaced by a safer 
parser-based calculation method without using 'eval()'.

@version 1.0.0

Kept here only for reference.

===================================================
*/

// const display = document.querySelector('#display');
// const buttons = document.querySelectorAll('button');

// buttons.forEach((item) => {
//     item.onclick = () => {
//         if (item.id == "clear") {
//             display.innerText = "";
//         } else if (item.id == "backspace") {
//             let string = display.innerText.toString();
//             display.innerText = string.substr(0, string.length - 1);
//         } else if (display.innerText != '' && item.id == "equal") {
//             display.innerText = eval(display.innerText);              // eval() used here.
//         } else if (display.innerText == "" && item.id == "equal") {
//             display.innerText = "Empty!";
//             setTimeout(() => (display.innerText = ""), 2000);
//         } else {
//             display.innerText += item.id;
//         }
//     }
// });

// const themeToggleBtn = document.querySelector('.theme-toggler');
// const calculator = document.querySelector('.calculator');
// const toggleIcon = document.querySelector('.toggler-icon');
// let isDark = true;
// themeToggleBtn.onclick = () => {
//     calculator.classList.toggle("dark");
//     themeToggleBtn.classList.toggle("active");
//     isDark = !isDark;
// };
