/**
 * Event Simulation Helpers for zOS Testing
 *
 * Low-level event simulation utilities for testing user interactions.
 * These helpers dispatch real DOM events for accurate behavior testing.
 */

/**
 * Simulate a click event on an element
 *
 * @param element The element to click
 * @param options Optional MouseEvent options
 */
export function click(
  element: HTMLElement,
  options: Partial<MouseEventInit> = {}
): void {
  // First, focus the element if it's focusable
  if (isFocusable(element)) {
    element.focus();
  }

  // Dispatch mousedown
  element.dispatchEvent(
    new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
      view: window,
      button: 0,
      ...options,
    })
  );

  // Dispatch mouseup
  element.dispatchEvent(
    new MouseEvent('mouseup', {
      bubbles: true,
      cancelable: true,
      view: window,
      button: 0,
      ...options,
    })
  );

  // Dispatch click
  element.dispatchEvent(
    new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window,
      button: 0,
      ...options,
    })
  );
}

/**
 * Simulate a double-click event on an element
 *
 * @param element The element to double-click
 * @param options Optional MouseEvent options
 */
export function doubleClick(
  element: HTMLElement,
  options: Partial<MouseEventInit> = {}
): void {
  // Two clicks followed by dblclick
  click(element, { ...options, detail: 1 });
  click(element, { ...options, detail: 2 });

  element.dispatchEvent(
    new MouseEvent('dblclick', {
      bubbles: true,
      cancelable: true,
      view: window,
      detail: 2,
      ...options,
    })
  );
}

/**
 * Simulate a right-click (context menu) event
 *
 * @param element The element to right-click
 * @param options Optional MouseEvent options
 */
export function rightClick(
  element: HTMLElement,
  options: Partial<MouseEventInit> = {}
): void {
  element.dispatchEvent(
    new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
      view: window,
      button: 2,
      ...options,
    })
  );
}

/**
 * Simulate typing text into an input element
 *
 * @param element The input element
 * @param text The text to type
 * @param options Typing options
 */
export function type(
  element: HTMLElement,
  text: string,
  options: { delay?: number; clear?: boolean } = {}
): void {
  const { clear = false } = options;

  // Focus the element
  element.focus();

  // Clear existing value if requested
  if (clear) {
    if (isInputElement(element)) {
      element.value = '';
    } else if (element.isContentEditable) {
      element.textContent = '';
    }
  }

  // Type each character
  for (const char of text) {
    // Dispatch keydown
    element.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: char,
        code: getKeyCode(char),
        bubbles: true,
        cancelable: true,
      })
    );

    // Dispatch keypress (for printable characters)
    if (char.length === 1) {
      element.dispatchEvent(
        new KeyboardEvent('keypress', {
          key: char,
          code: getKeyCode(char),
          bubbles: true,
          cancelable: true,
        })
      );
    }

    // Update value
    if (isInputElement(element)) {
      element.value += char;
      element.dispatchEvent(new Event('input', { bubbles: true }));
    } else if (element.isContentEditable) {
      element.textContent = (element.textContent ?? '') + char;
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // Dispatch keyup
    element.dispatchEvent(
      new KeyboardEvent('keyup', {
        key: char,
        code: getKeyCode(char),
        bubbles: true,
        cancelable: true,
      })
    );
  }

  // Dispatch change event
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

/**
 * Clear the content of an input element
 *
 * @param element The input element to clear
 */
export function clear(element: HTMLElement): void {
  element.focus();

  if (isInputElement(element)) {
    element.value = '';
  } else if (element.isContentEditable) {
    element.textContent = '';
  }

  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

/**
 * Simulate pressing a key
 *
 * @param key The key to press (e.g., "Enter", "Escape", "a")
 * @param target Optional target element (defaults to document.activeElement or body)
 * @param options Optional keyboard event options
 */
export function press(
  key: string,
  target?: EventTarget | null,
  options: Partial<KeyboardEventInit> = {}
): void {
  const eventTarget = target ?? document.activeElement ?? document.body;

  const eventOptions: KeyboardEventInit = {
    key,
    code: getKeyCode(key),
    bubbles: true,
    cancelable: true,
    ...options,
  };

  eventTarget.dispatchEvent(new KeyboardEvent('keydown', eventOptions));

  // Only dispatch keypress for printable characters
  if (key.length === 1) {
    eventTarget.dispatchEvent(new KeyboardEvent('keypress', eventOptions));
  }

  eventTarget.dispatchEvent(new KeyboardEvent('keyup', eventOptions));
}

/**
 * Simulate pressing Enter key
 *
 * @param target Optional target element
 */
export function pressEnter(target?: EventTarget | null): void {
  press('Enter', target);
}

/**
 * Simulate pressing Escape key
 *
 * @param target Optional target element
 */
export function pressEscape(target?: EventTarget | null): void {
  press('Escape', target);
}

/**
 * Simulate pressing Tab key
 *
 * @param target Optional target element
 * @param shiftKey Whether Shift is held (reverse tab)
 */
export function pressTab(target?: EventTarget | null, shiftKey = false): void {
  press('Tab', target, { shiftKey });

  // Move focus to next/previous focusable element
  const focusables = getFocusableElements();
  const currentIndex = focusables.indexOf(document.activeElement as HTMLElement);

  if (currentIndex !== -1) {
    const nextIndex = shiftKey
      ? (currentIndex - 1 + focusables.length) % focusables.length
      : (currentIndex + 1) % focusables.length;
    focusables[nextIndex]?.focus();
  }
}

/**
 * Simulate hovering over an element
 *
 * @param element The element to hover over
 */
export function hover(element: HTMLElement): void {
  element.dispatchEvent(
    new MouseEvent('mouseenter', {
      bubbles: true,
      cancelable: true,
      view: window,
    })
  );

  element.dispatchEvent(
    new MouseEvent('mouseover', {
      bubbles: true,
      cancelable: true,
      view: window,
    })
  );
}

/**
 * Simulate moving mouse away from an element
 *
 * @param element The element to unhover
 */
export function unhover(element: HTMLElement): void {
  element.dispatchEvent(
    new MouseEvent('mouseleave', {
      bubbles: true,
      cancelable: true,
      view: window,
    })
  );

  element.dispatchEvent(
    new MouseEvent('mouseout', {
      bubbles: true,
      cancelable: true,
      view: window,
    })
  );
}

/**
 * Simulate focusing an element
 *
 * @param element The element to focus
 */
export function focus(element: HTMLElement): void {
  element.focus();
  element.dispatchEvent(
    new FocusEvent('focus', {
      bubbles: false,
      cancelable: false,
    })
  );
  element.dispatchEvent(
    new FocusEvent('focusin', {
      bubbles: true,
      cancelable: false,
    })
  );
}

/**
 * Simulate blurring an element
 *
 * @param element The element to blur
 */
export function blur(element: HTMLElement): void {
  element.blur();
  element.dispatchEvent(
    new FocusEvent('blur', {
      bubbles: false,
      cancelable: false,
    })
  );
  element.dispatchEvent(
    new FocusEvent('focusout', {
      bubbles: true,
      cancelable: false,
    })
  );
}

/**
 * Simulate scrolling an element
 *
 * @param element The element to scroll
 * @param options Scroll options
 */
export function scroll(
  element: HTMLElement,
  options: { top?: number; left?: number } = {}
): void {
  if (options.top !== undefined) {
    element.scrollTop = options.top;
  }
  if (options.left !== undefined) {
    element.scrollLeft = options.left;
  }

  element.dispatchEvent(new Event('scroll', { bubbles: true }));
}

/**
 * Simulate selecting an option in a select element
 *
 * @param element The select element
 * @param value The value to select (or array for multiple select)
 */
export function select(
  element: HTMLSelectElement,
  value: string | string[]
): void {
  element.focus();

  const values = Array.isArray(value) ? value : [value];

  for (const option of element.options) {
    option.selected = values.includes(option.value);
  }

  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

/**
 * Simulate checking/unchecking a checkbox
 *
 * @param element The checkbox element
 * @param checked Whether to check (true) or uncheck (false)
 */
export function check(element: HTMLInputElement, checked = true): void {
  if (element.type !== 'checkbox' && element.type !== 'radio') {
    throw new Error('check() can only be used on checkbox or radio inputs');
  }

  element.focus();
  element.checked = checked;
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

/**
 * Simulate unchecking a checkbox
 *
 * @param element The checkbox element
 */
export function uncheck(element: HTMLInputElement): void {
  check(element, false);
}

/**
 * Simulate a touch tap on an element
 *
 * @param element The element to tap
 * @param options Optional touch options
 */
export function tap(
  element: HTMLElement,
  options: { x?: number; y?: number } = {}
): void {
  const rect = element.getBoundingClientRect();
  const x = options.x ?? rect.left + rect.width / 2;
  const y = options.y ?? rect.top + rect.height / 2;

  const touch = new Touch({
    identifier: Date.now(),
    target: element,
    clientX: x,
    clientY: y,
    pageX: x,
    pageY: y,
    radiusX: 10,
    radiusY: 10,
    rotationAngle: 0,
    force: 1,
  });

  element.dispatchEvent(
    new TouchEvent('touchstart', {
      bubbles: true,
      cancelable: true,
      touches: [touch],
      targetTouches: [touch],
      changedTouches: [touch],
    })
  );

  element.dispatchEvent(
    new TouchEvent('touchend', {
      bubbles: true,
      cancelable: true,
      touches: [],
      targetTouches: [],
      changedTouches: [touch],
    })
  );

  // Also trigger click for touch devices
  click(element);
}

// Helper functions

function isInputElement(
  element: HTMLElement
): element is HTMLInputElement | HTMLTextAreaElement {
  return element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement;
}

function isFocusable(element: HTMLElement): boolean {
  if (element.tabIndex < 0) return false;

  const focusableTags = ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON', 'A'];
  if (focusableTags.includes(element.tagName)) return true;

  return element.tabIndex >= 0 || element.isContentEditable;
}

function getFocusableElements(): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable]',
  ].join(', ');

  return Array.from(document.querySelectorAll<HTMLElement>(selector));
}

function getKeyCode(key: string): string {
  // Map common keys to their codes
  const keyMap: Record<string, string> = {
    Enter: 'Enter',
    Escape: 'Escape',
    Tab: 'Tab',
    Backspace: 'Backspace',
    Delete: 'Delete',
    ArrowUp: 'ArrowUp',
    ArrowDown: 'ArrowDown',
    ArrowLeft: 'ArrowLeft',
    ArrowRight: 'ArrowRight',
    Home: 'Home',
    End: 'End',
    PageUp: 'PageUp',
    PageDown: 'PageDown',
    ' ': 'Space',
  };

  if (keyMap[key]) {
    return keyMap[key];
  }

  // For single characters, use KeyX format
  if (key.length === 1) {
    const char = key.toUpperCase();
    if (/[A-Z]/.test(char)) {
      return `Key${char}`;
    }
    if (/[0-9]/.test(char)) {
      return `Digit${char}`;
    }
  }

  return key;
}
