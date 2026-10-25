import { describe, it, expect } from "vitest";
import {
  applyBinaryOp,
  formatResult,
  evaluateExpression,
  CalculatorSession,
} from "./calculatorEngine";

describe("Calculator Precision & Operator Precedence Suite (go:357396)", () => {
  describe("Arithmetic & Precision Cleanup", () => {
    it("evaluates 0.1 * 0.3 + 0.9 * 0.8 accurately to 0.75 without precision loss", () => {
      const term1 = applyBinaryOp(0.1, "*", 0.3); // 0.03
      const term2 = applyBinaryOp(0.9, "*", 0.8); // 0.72
      const sum = applyBinaryOp(term1, "+", term2);
      expect(sum).toBe(0.75);
      expect(formatResult(sum)).toBe(0.75);
    });

    it("evaluates classic IEEE 754 precision corner cases cleanly", () => {
      expect(applyBinaryOp(0.1, "+", 0.2)).toBe(0.3);
      expect(formatResult(applyBinaryOp(0.1, "+", 0.2))).toBe(0.3);
      expect(applyBinaryOp(0.3, "-", 0.1)).toBe(0.2);
      expect(formatResult(applyBinaryOp(0.3, "-", 0.1))).toBe(0.2);
    });
  });

  describe("Parenthesized Expression Parser (evaluateExpression)", () => {
    it("evaluates 0.1 * 0.3 + 0.9 * 0.8 with standard operator precedence to 0.75", () => {
      const result = evaluateExpression("0.1 * 0.3 + 0.9 * 0.8");
      expect(result).toBe(0.75);
      expect(formatResult(result)).toBe(0.75);
    });

    it("respects multiplication over addition precedence in mixed expressions", () => {
      expect(evaluateExpression("2 + 3 * 4")).toBe(14);
      expect(evaluateExpression("10 - 2 * 3")).toBe(4);
      expect(evaluateExpression("2 * 3 + 4 * 5")).toBe(26);
    });

    it("respects parentheses grouping override", () => {
      expect(evaluateExpression("(2 + 3) * 4")).toBe(20);
      expect(evaluateExpression("10 / (2 + 3)")).toBe(2);
      expect(evaluateExpression("((0.1 * 0.3) + (0.9 * 0.8))")).toBe(0.75);
    });
  });

  describe("Keystroke Simulator (CalculatorSession - Button-by-Button Entry)", () => {
    it("correctly evaluates 0.1 * 0.3 + 0.9 * 0.8 = 0.75 when entered sequentially without parens", () => {
      const calc = new CalculatorSession();

      // Enter 0.1
      calc.inputChar("0");
      calc.inputChar(".");
      calc.inputChar("1");
      expect(calc.currentInput).toBe("0.1");

      // Enter *
      calc.inputOp("*");

      // Enter 0.3
      calc.inputChar("0");
      calc.inputChar(".");
      calc.inputChar("3");
      expect(calc.currentInput).toBe("0.3");

      // Enter + (triggers 0.1 * 0.3 -> 0.03 because * has higher precedence than incoming +)
      calc.inputOp("+");
      expect(calc.currentInput).toBe("0.03");

      // Enter 0.9
      calc.inputChar("0");
      calc.inputChar(".");
      calc.inputChar("9");
      expect(calc.currentInput).toBe("0.9");

      // Enter * (must NOT eagerly compute 0.03 + 0.9, because incoming * has higher precedence!)
      calc.inputOp("*");
      expect(calc.valStack).toEqual([0.03, 0.9]);
      expect(calc.opStack).toEqual(["+", "*"]);

      // Enter 0.8
      calc.inputChar("0");
      calc.inputChar(".");
      calc.inputChar("8");
      expect(calc.currentInput).toBe("0.8");

      // Press =
      calc.calculate();
      expect(calc.currentInput).toBe("0.75");
    });

    it("correctly evaluates 2 + 3 * 4 = 14", () => {
      const calc = new CalculatorSession();
      calc.inputChar("2");
      calc.inputOp("+");
      calc.inputChar("3");
      calc.inputOp("*");
      calc.inputChar("4");
      calc.calculate();
      expect(calc.currentInput).toBe("14");
    });

    it("correctly evaluates 10 - 2 * 3 = 4", () => {
      const calc = new CalculatorSession();
      calc.inputChar("1");
      calc.inputChar("0");
      calc.inputOp("-");
      calc.inputChar("2");
      calc.inputOp("*");
      calc.inputChar("3");
      calc.calculate();
      expect(calc.currentInput).toBe("4");
    });

    it("correctly evaluates chained equal-precedence operations left-to-right (10 - 5 - 2 = 3)", () => {
      const calc = new CalculatorSession();
      calc.inputChar("1");
      calc.inputChar("0");
      calc.inputOp("-");
      calc.inputChar("5");
      calc.inputOp("-");
      expect(calc.currentInput).toBe("5");
      calc.inputChar("2");
      calc.calculate();
      expect(calc.currentInput).toBe("3");
    });
  });
});
