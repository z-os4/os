/**
 * Async Wait Utilities for zOS Testing
 *
 * Utilities for waiting on async conditions in tests.
 * Provides timeout handling and polling-based assertions.
 */

import type { WaitOptions } from './types';

/** Default timeout in milliseconds */
const DEFAULT_TIMEOUT = 1000;

/** Default polling interval in milliseconds */
const DEFAULT_INTERVAL = 50;

/**
 * Wait for a condition to be true
 *
 * Repeatedly calls the callback until it returns a truthy value
 * or the timeout is reached.
 *
 * @param callback Function to evaluate (can be async)
 * @param options Wait options
 * @returns The truthy value returned by callback
 * @throws Error if timeout is reached
 */
export async function waitFor<T>(
  callback: () => T | Promise<T>,
  options: WaitOptions = {}
): Promise<T> {
  const {
    timeout = DEFAULT_TIMEOUT,
    interval = DEFAULT_INTERVAL,
    message = 'waitFor timed out',
  } = options;

  const startTime = Date.now();
  let lastError: Error | null = null;

  while (Date.now() - startTime < timeout) {
    try {
      const result = await callback();
      if (result) {
        return result;
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }

    await sleep(interval);
  }

  const errorMessage = lastError
    ? `${message}: ${lastError.message}`
    : message;

  throw new Error(errorMessage);
}

/**
 * Wait for an element to appear in the DOM
 *
 * @param selector CSS selector for the element
 * @param options Wait options
 * @returns The found element
 * @throws Error if element is not found within timeout
 */
export async function waitForElement(
  selector: string,
  options: WaitOptions = {}
): Promise<HTMLElement> {
  const element = await waitFor(
    (): HTMLElement | null => document.querySelector<HTMLElement>(selector),
    {
      ...options,
      message: options.message ?? `Element not found: ${selector}`,
    }
  );

  // waitFor guarantees a truthy return, but TypeScript needs explicit assertion
  return element as HTMLElement;
}

/**
 * Wait for an element with a specific test ID
 *
 * @param testId The data-testid value
 * @param options Wait options
 * @returns The found element
 */
export async function waitForTestId(
  testId: string,
  options: WaitOptions = {}
): Promise<HTMLElement> {
  return waitForElement(`[data-testid="${testId}"]`, {
    ...options,
    message: options.message ?? `Element with testId "${testId}" not found`,
  });
}

/**
 * Wait for an element containing specific text
 *
 * @param text Text to search for (string or regex)
 * @param options Wait options with optional container
 * @returns The found element
 */
export async function waitForText(
  text: string | RegExp,
  options: WaitOptions & { container?: HTMLElement } = {}
): Promise<HTMLElement> {
  const { container = document.body, ...waitOptions } = options;

  const element = await waitFor(
    (): HTMLElement | null => {
      const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
      let node: Text | null;

      while ((node = walker.nextNode() as Text | null)) {
        const matches =
          typeof text === 'string'
            ? node.textContent?.includes(text)
            : text.test(node.textContent ?? '');

        if (matches && node.parentElement) {
          return node.parentElement;
        }
      }

      return null;
    },
    {
      ...waitOptions,
      message: waitOptions.message ?? `Text not found: ${text}`,
    }
  );

  return element as HTMLElement;
}

/**
 * Wait for an element to be removed from the DOM
 *
 * @param selector CSS selector for the element
 * @param options Wait options
 */
export async function waitForElementToBeRemoved(
  selector: string,
  options: WaitOptions = {}
): Promise<void> {
  await waitFor(
    () => document.querySelector(selector) === null,
    {
      ...options,
      message: options.message ?? `Element still present: ${selector}`,
    }
  );
}

/**
 * Wait for an element to become visible
 *
 * @param element The element to check
 * @param options Wait options
 */
export async function waitForVisible(
  element: HTMLElement,
  options: WaitOptions = {}
): Promise<void> {
  await waitFor(
    () => {
      const style = getComputedStyle(element);
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0' &&
        element.offsetParent !== null
      );
    },
    {
      ...options,
      message: options.message ?? 'Element not visible',
    }
  );
}

/**
 * Wait for an element to become hidden
 *
 * @param element The element to check
 * @param options Wait options
 */
export async function waitForHidden(
  element: HTMLElement,
  options: WaitOptions = {}
): Promise<void> {
  await waitFor(
    () => {
      const style = getComputedStyle(element);
      return (
        style.display === 'none' ||
        style.visibility === 'hidden' ||
        style.opacity === '0' ||
        element.offsetParent === null
      );
    },
    {
      ...options,
      message: options.message ?? 'Element still visible',
    }
  );
}

/**
 * Wait for a specific number of elements
 *
 * @param selector CSS selector for the elements
 * @param count Expected count
 * @param options Wait options
 * @returns Array of found elements
 */
export async function waitForElementCount(
  selector: string,
  count: number,
  options: WaitOptions = {}
): Promise<HTMLElement[]> {
  const elements = await waitFor(
    (): HTMLElement[] | null => {
      const found = document.querySelectorAll<HTMLElement>(selector);
      return found.length === count ? Array.from(found) : null;
    },
    {
      ...options,
      message:
        options.message ?? `Expected ${count} elements matching ${selector}`,
    }
  );

  return elements as HTMLElement[];
}

/**
 * Wait for a mock function to be called
 *
 * @param mockFn The mock function to check
 * @param options Wait options with optional expected call count
 */
export async function waitForMockCall(
  mockFn: { mock: { calls: unknown[][] } },
  options: WaitOptions & { times?: number } = {}
): Promise<void> {
  const { times = 1, ...waitOptions } = options;

  await waitFor(() => mockFn.mock.calls.length >= times, {
    ...waitOptions,
    message: waitOptions.message ?? `Mock not called ${times} time(s)`,
  });
}

/**
 * Wait for a Promise to resolve
 *
 * Similar to Promise.race but with a timeout error
 *
 * @param promise The promise to wait for
 * @param options Wait options
 * @returns The resolved value
 */
export async function waitForPromise<T>(
  promise: Promise<T>,
  options: WaitOptions = {}
): Promise<T> {
  const { timeout = DEFAULT_TIMEOUT, message = 'Promise timed out' } = options;

  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(message)), timeout);
    }),
  ]);
}

/**
 * Wait for a specific amount of time
 *
 * @param ms Milliseconds to wait
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Wait for next animation frame
 */
export function waitForAnimationFrame(): Promise<number> {
  return new Promise(resolve => requestAnimationFrame(resolve));
}

/**
 * Wait for all pending promises to resolve (microtask queue flush)
 */
export function flushPromises(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}

/**
 * Wait for a condition with automatic retries
 *
 * @param condition Function that returns true when condition is met
 * @param options Wait options with optional retry count
 */
export async function waitForCondition(
  condition: () => boolean | Promise<boolean>,
  options: WaitOptions & { retries?: number } = {}
): Promise<void> {
  const { retries, ...waitOptions } = options;

  if (retries !== undefined) {
    // Use retry-based approach
    for (let i = 0; i < retries; i++) {
      try {
        const result = await condition();
        if (result) return;
      } catch {
        // Continue retrying
      }
      await sleep(waitOptions.interval ?? DEFAULT_INTERVAL);
    }
    throw new Error(waitOptions.message ?? 'Condition not met after retries');
  }

  // Use timeout-based approach
  await waitFor(condition, waitOptions);
}

/**
 * Create a deferred promise for testing async flows
 *
 * @returns Object with promise and resolve/reject functions
 */
export function createDeferred<T = void>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
} {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

/**
 * Wait for an event to be dispatched
 *
 * @param target Event target to listen on
 * @param eventType Event type to wait for
 * @param options Wait options
 * @returns The event that was dispatched
 */
export async function waitForEvent<T extends Event = Event>(
  target: EventTarget,
  eventType: string,
  options: WaitOptions = {}
): Promise<T> {
  const { timeout = DEFAULT_TIMEOUT, message } = options;

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      target.removeEventListener(eventType, handler);
      reject(new Error(message ?? `Event "${eventType}" not received`));
    }, timeout);

    const handler = (event: Event) => {
      clearTimeout(timeoutId);
      target.removeEventListener(eventType, handler);
      resolve(event as T);
    };

    target.addEventListener(eventType, handler);
  });
}

/**
 * Wait for a mutation in the DOM
 *
 * @param target Element to observe
 * @param options MutationObserver options and wait options
 */
export async function waitForMutation(
  target: Node,
  options: WaitOptions & MutationObserverInit = {}
): Promise<MutationRecord[]> {
  const {
    timeout = DEFAULT_TIMEOUT,
    message,
    childList = true,
    subtree = true,
    ...observerOptions
  } = options;

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      observer.disconnect();
      reject(new Error(message ?? 'No DOM mutation observed'));
    }, timeout);

    const observer = new MutationObserver((mutations) => {
      clearTimeout(timeoutId);
      observer.disconnect();
      resolve(mutations);
    });

    observer.observe(target, { childList, subtree, ...observerOptions });
  });
}
