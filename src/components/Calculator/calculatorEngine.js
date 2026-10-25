/**
 * Core calculation and precedence engine for GateQA Scientific Calculator.
 * Implements standard operator precedence (BODMAS/PEMDAS), floating-point precision guards,
 * and recursive-descent expression parsing for both sequential keypad entry and parenthesized expressions.
 */

export function toPrecisionClean(num, precision = 14) {
  if (typeof num !== "number" || !Number.isFinite(num)) return num;
  return parseFloat(num.toPrecision(precision));
}

export function formatResult(retVal) {
  if (retVal === 0 || retVal === "Math Error" || retVal === "Infinity" || retVal === "Error") return retVal;
  if (typeof retVal === "string") return retVal;
  if (isNaN(retVal)) return "Math Error";
  if (!isFinite(retVal)) return "Infinity";

  const cleaned = toPrecisionClean(retVal, 14);
  if (Math.abs(cleaned) < 0.00000001 || Math.abs(cleaned) > 100000000) {
    return cleaned;
  }
  if (cleaned.toFixed(8) % 1 !== 0) {
    let i = 1;
    while (i < 10) {
      if (cleaned.toFixed(i) != 0 && cleaned.toFixed(i) / cleaned.toFixed(i + 8) == 1) {
        return parseFloat(cleaned.toFixed(i));
      }
      i++;
    }
  } else {
    return parseFloat(cleaned.toFixed(0));
  }
  return cleaned;
}

export function nthroot(x, n) {
  try {
    const negate = n % 2 === 1 && x < 0;
    if (negate) x = -x;
    const possible = Math.pow(x, 1 / n);
    return negate ? -possible : possible;
  } catch (e) {
    return NaN;
  }
}

export function applyBinaryOp(a, op, b) {
  let res;
  switch (op) {
    case "+":
      res = a + b;
      break;
    case "-":
      res = a - b;
      break;
    case "*":
      res = a * b;
      break;
    case "/":
      if (b === 0) throw new Error("Divide by zero");
      res = a / b;
      break;
    case "mod":
      if (b === 0) throw new Error("Modulo by zero");
      res = a % b;
      break;
    case "exp_op":
      res = a * Math.pow(10, b);
      break;
    case "%":
      res = (a / 100) * b;
      break;
    case "^":
      res = Math.pow(a, b);
      break;
    case "logyx":
      if (a <= 0 || a === 1 || b <= 0) throw new Error("Math error");
      res = Math.log(b) / Math.log(a);
      break;
    case "yroot":
      res = nthroot(b, a);
      break;
    default:
      throw new Error(`Unknown operator ${op}`);
  }
  return toPrecisionClean(res, 14);
}

export function getPrecedence(op) {
  if (op === "+" || op === "-") return 1;
  if (op === "*" || op === "/" || op === "mod" || op === "%" || op === "exp_op") return 2;
  if (op === "^" || op === "logyx" || op === "yroot") return 3;
  return 0;
}

export function evaluateExpression(input) {
  const tokens = input.match(/(?:\d*\.\d+|\d+\.?\d*|[()+\-*/^]|mod)/g);
  if (!tokens || tokens.join("") !== input.replace(/\s+/g, "")) throw new Error("Invalid expression");
  let position = 0;
  const peek = () => tokens[position];
  const consume = () => tokens[position++];

  function parseExpression() {
    let value = parseTerm();
    while (peek() === "+" || peek() === "-") {
      const operatorToken = consume();
      const right = parseTerm();
      value = applyBinaryOp(value, operatorToken, right);
    }
    return value;
  }

  function parseTerm() {
    let value = parsePower();
    while (peek() === "*" || peek() === "/" || peek() === "mod") {
      const operatorToken = consume();
      const right = parsePower();
      value = applyBinaryOp(value, operatorToken, right);
    }
    return value;
  }

  function parsePower() {
    const value = parseUnary();
    if (peek() === "^") {
      consume();
      return applyBinaryOp(value, "^", parsePower());
    }
    return value;
  }

  function parseUnary() {
    if (peek() === "+") {
      consume();
      return parseUnary();
    }
    if (peek() === "-") {
      consume();
      return -parseUnary();
    }
    return parsePrimary();
  }

  function parsePrimary() {
    if (peek() === "(") {
      consume();
      const value = parseExpression();
      if (consume() !== ")") throw new Error("Unbalanced parentheses");
      return value;
    }
    const value = Number(consume());
    if (!Number.isFinite(value)) throw new Error("Invalid number");
    return value;
  }

  const result = parseExpression();
  if (position !== tokens.length || !Number.isFinite(result)) throw new Error("Invalid expression");
  return toPrecisionClean(result, 14);
}

/**
 * Stateful calculator session simulator for keystroke sequence execution.
 */
export class CalculatorSession {
  constructor() {
    this.reset();
  }

  reset() {
    this.currentInput = "0";
    this.valStack = [];
    this.opStack = [];
    this.exprTokens = [];
    this.expressionDisplay = "";
    this.resetNext = false;
    this.waitingForSecondOperand = false;
    this.expressionMode = false;
  }

  inputChar(ch) {
    if (ch === "(" || ch === ")" || this.expressionMode) {
      if (!this.expressionMode) {
        this.expressionMode = true;
        this.currentInput = "";
      }
      if (this.resetNext && ch !== "(") this.resetNext = false;
      this.currentInput += ch;
      return;
    }
    if (this.resetNext) {
      this.currentInput = "";
      this.resetNext = false;
    }
    if (ch === "." && this.currentInput.includes(".")) return;
    if (this.currentInput === "0" && ch !== ".") this.currentInput = ch;
    else this.currentInput += ch;
  }

  inputOp(op) {
    if (this.expressionMode) {
      this.currentInput += op === "mod" ? "mod" : op;
      return;
    }

    // Changing operator when waiting for second operand
    if (this.resetNext && this.waitingForSecondOperand && this.opStack.length > 0) {
      this.opStack[this.opStack.length - 1] = op;
      if (this.exprTokens.length > 0) {
        this.exprTokens[this.exprTokens.length - 1] = op;
      }
      this.expressionDisplay = this.exprTokens.join(" ");
      return;
    }

    const currentNum = parseFloat(this.currentInput);
    this.valStack.push(currentNum);
    this.exprTokens.push(this.currentInput);
    this.exprTokens.push(op);

    // Operator precedence unwinding
    while (
      this.opStack.length > 0 &&
      getPrecedence(this.opStack[this.opStack.length - 1]) >= getPrecedence(op)
    ) {
      const topOp = this.opStack.pop();
      const right = this.valStack.pop();
      const left = this.valStack.pop();
      try {
        const intermediate = applyBinaryOp(left, topOp, right);
        this.valStack.push(intermediate);
        this.currentInput = String(formatResult(intermediate));
      } catch (err) {
        this.currentInput = "Error";
        this.reset();
        return;
      }
    }

    this.opStack.push(op);
    this.expressionDisplay = this.exprTokens.join(" ");
    this.resetNext = true;
    this.waitingForSecondOperand = true;
  }

  calculate() {
    if (this.expressionMode) {
      this.expressionDisplay = `${this.currentInput} =`;
      try {
        this.currentInput = String(formatResult(evaluateExpression(this.currentInput)));
      } catch (err) {
        this.currentInput = "Math Error";
      }
      this.expressionMode = false;
      this.resetNext = true;
      this.waitingForSecondOperand = false;
      return;
    }

    const currentNum = parseFloat(this.currentInput);
    this.valStack.push(currentNum);
    this.exprTokens.push(this.currentInput);

    while (this.opStack.length > 0) {
      const topOp = this.opStack.pop();
      const right = this.valStack.pop();
      const left = this.valStack.pop();
      try {
        const intermediate = applyBinaryOp(left, topOp, right);
        this.valStack.push(intermediate);
      } catch (err) {
        this.currentInput = "Error";
        this.reset();
        return;
      }
    }

    const finalResult = this.valStack.pop();
    if (finalResult !== undefined && !isNaN(finalResult)) {
      this.expressionDisplay = `${this.exprTokens.join(" ")} =`;
      this.currentInput = String(formatResult(finalResult));
    }
    this.valStack = [];
    this.opStack = [];
    this.exprTokens = [];
    this.waitingForSecondOperand = false;
    this.resetNext = true;
  }
}
