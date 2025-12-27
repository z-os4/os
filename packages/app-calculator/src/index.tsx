/**
 * Calculator App
 *
 * A fully-featured calculator app for zOS.
 */

import { useState, useCallback } from 'react';
import { ZWindow } from '@z-os/ui';
import { Calculator as CalculatorIcon } from 'lucide-react';

// ============================================================================
// Calculator Logic Hook
// ============================================================================

function useCalculator() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputDigit = useCallback((digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  }, [display, waitingForOperand]);

  const inputDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  }, [display, waitingForOperand]);

  const clear = useCallback(() => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  }, []);

  const toggleSign = useCallback(() => {
    const value = parseFloat(display);
    setDisplay(String(-value));
  }, [display]);

  const inputPercent = useCallback(() => {
    const value = parseFloat(display);
    setDisplay(String(value / 100));
  }, [display]);

  const calculate = (left: number, right: number, op: string): number => {
    switch (op) {
      case '+': return left + right;
      case '-': return left - right;
      case '*': return left * right;
      case '/': return right !== 0 ? left / right : 0;
      default: return right;
    }
  };

  const performOperation = useCallback((nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const result = calculate(previousValue, inputValue, operation);
      setDisplay(String(result));
      setPreviousValue(result);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  }, [display, previousValue, operation]);

  const equals = useCallback(() => {
    if (operation && previousValue !== null) {
      const inputValue = parseFloat(display);
      const result = calculate(previousValue, inputValue, operation);
      setDisplay(String(result));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  }, [display, previousValue, operation]);

  return {
    display,
    previousValue,
    operation,
    waitingForOperand,
    inputDigit,
    inputDecimal,
    clear,
    toggleSign,
    inputPercent,
    performOperation,
    equals,
  };
}

// ============================================================================
// Calculator Window Component
// ============================================================================

interface CalculatorWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

const CalculatorWindow: React.FC<CalculatorWindowProps> = ({ onClose, onFocus }) => {
  const calc = useCalculator();

  // Glass morphism button styles
  const buttonBase = "flex items-center justify-center text-xl font-medium rounded-xl transition-all duration-150 active:scale-95 backdrop-blur-md border border-white/10";
  const numberButton = `${buttonBase} bg-white/10 hover:bg-white/20 text-white`;
  const operatorButton = `${buttonBase} bg-orange-500/80 hover:bg-orange-500 text-white border-orange-400/30`;
  const functionButton = `${buttonBase} bg-white/20 hover:bg-white/30 text-white`;

  const formatDisplay = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    if (value.length > 9) {
      return num.toExponential(4);
    }
    return value;
  };

  return (
    <ZWindow
      title="Calculator"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 200, y: 100 }}
      initialSize={{ width: 260, height: 380 }}
      windowType="system"
    >
      <div className="flex flex-col h-full bg-black/80 backdrop-blur-xl select-none">
        {/* Display */}
        <div className="flex-shrink-0 h-24 flex items-end justify-end px-5 pb-3 border-b border-white/10">
          <span className="text-white text-5xl font-light tracking-tight truncate">
            {formatDisplay(calc.display)}
          </span>
        </div>

        {/* Buttons Grid */}
        <div className="flex-1 grid grid-cols-4 gap-2 p-3">
          {/* Row 1 */}
          <button className={functionButton} onClick={calc.clear}>
            {calc.previousValue ? 'C' : 'AC'}
          </button>
          <button className={functionButton} onClick={calc.toggleSign}>+/-</button>
          <button className={functionButton} onClick={calc.inputPercent}>%</button>
          <button
            className={`${operatorButton} ${calc.operation === '/' && calc.waitingForOperand ? 'bg-white text-orange-500 border-white/30' : ''}`}
            onClick={() => calc.performOperation('/')}
          >/</button>

          {/* Row 2 */}
          <button className={numberButton} onClick={() => calc.inputDigit('7')}>7</button>
          <button className={numberButton} onClick={() => calc.inputDigit('8')}>8</button>
          <button className={numberButton} onClick={() => calc.inputDigit('9')}>9</button>
          <button
            className={`${operatorButton} ${calc.operation === '*' && calc.waitingForOperand ? 'bg-white text-orange-500 border-white/30' : ''}`}
            onClick={() => calc.performOperation('*')}
          >×</button>

          {/* Row 3 */}
          <button className={numberButton} onClick={() => calc.inputDigit('4')}>4</button>
          <button className={numberButton} onClick={() => calc.inputDigit('5')}>5</button>
          <button className={numberButton} onClick={() => calc.inputDigit('6')}>6</button>
          <button
            className={`${operatorButton} ${calc.operation === '-' && calc.waitingForOperand ? 'bg-white text-orange-500 border-white/30' : ''}`}
            onClick={() => calc.performOperation('-')}
          >−</button>

          {/* Row 4 */}
          <button className={numberButton} onClick={() => calc.inputDigit('1')}>1</button>
          <button className={numberButton} onClick={() => calc.inputDigit('2')}>2</button>
          <button className={numberButton} onClick={() => calc.inputDigit('3')}>3</button>
          <button
            className={`${operatorButton} ${calc.operation === '+' && calc.waitingForOperand ? 'bg-white text-orange-500 border-white/30' : ''}`}
            onClick={() => calc.performOperation('+')}
          >+</button>

          {/* Row 5 */}
          <button
            className={`${numberButton} col-span-2`}
            onClick={() => calc.inputDigit('0')}
          >0</button>
          <button className={numberButton} onClick={calc.inputDecimal}>.</button>
          <button className={operatorButton} onClick={calc.equals}>=</button>
        </div>
      </div>
    </ZWindow>
  );
};

// ============================================================================
// App Definition
// ============================================================================

/**
 * Calculator app manifest
 */
export const CalculatorManifest = {
  identifier: 'ai.hanzo.calculator',
  name: 'Calculator',
  version: '1.0.0',
  description: 'A simple calculator app',
  category: 'utilities' as const,
  window: {
    type: 'system' as const,
    defaultSize: { width: 260, height: 380 },
    resizable: false,
    showInDock: true,
  },
};

/**
 * Calculator App definition for registry
 */
export const CalculatorApp = {
  manifest: CalculatorManifest,
  component: CalculatorWindow,
  icon: CalculatorIcon,
};

export default CalculatorWindow;
