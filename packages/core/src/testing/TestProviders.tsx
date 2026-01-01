/**
 * Test Providers for zOS
 *
 * Wrapper components that provide all required contexts for testing zOS apps.
 * Integrates with the mock providers for full control in tests.
 */

import React, { createContext, useContext, ReactNode, ReactElement, useCallback, useState } from 'react';
import type {
  RenderResult,
  RenderOptions,
  MockWindowManager,
  MockDockContext,
  MockMenuContext,
  MockFileSystem,
  MockClipboard,
  TranslationDict,
} from './types';
import {
  createMockWindowManager,
  createMockDockContext,
  createMockMenuContext,
  createMockFileSystem,
  createMockClipboard,
} from './mockProviders';

// Test context for accessing mocks in tests
interface TestContextValue {
  windowManager: MockWindowManager;
  dock: MockDockContext;
  menu: MockMenuContext;
  fileSystem: MockFileSystem;
  clipboard: MockClipboard;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const TestContext = createContext<TestContextValue | null>(null);

/**
 * Hook to access test context in components under test
 */
export function useTestContext(): TestContextValue {
  const ctx = useContext(TestContext);
  if (!ctx) {
    throw new Error('useTestContext must be used within TestProviders');
  }
  return ctx;
}

/**
 * Props for TestProviders component
 */
export interface TestProvidersProps {
  children: ReactNode;
  /** Initial window manager mock */
  initialWindowManager?: Partial<MockWindowManager>;
  /** Initial dock context mock */
  initialDock?: Partial<MockDockContext>;
  /** Initial menu context mock */
  initialMenu?: Partial<MockMenuContext>;
  /** Initial file system mock */
  initialFileSystem?: Partial<MockFileSystem>;
  /** Initial clipboard mock */
  initialClipboard?: Partial<MockClipboard>;
  /** Initial i18n configuration */
  initialI18n?: {
    locale?: string;
    translations?: TranslationDict;
  };
  /** Initial theme */
  initialTheme?: 'light' | 'dark' | 'system';
}

/**
 * TestProviders wraps app with all required providers for testing.
 * Provides mock implementations of all zOS contexts.
 */
export const TestProviders: React.FC<TestProvidersProps> = ({
  children,
  initialWindowManager,
  initialDock,
  initialMenu,
  initialFileSystem,
  initialClipboard,
  initialI18n,
  initialTheme = 'light',
}) => {
  // Create mock instances
  const [windowManager] = useState(() => createMockWindowManager(initialWindowManager));
  const [dock] = useState(() => createMockDockContext(initialDock));
  const [menu] = useState(() => createMockMenuContext(initialMenu));
  const [fileSystem] = useState(() => createMockFileSystem(initialFileSystem));
  const [clipboard] = useState(() => createMockClipboard(initialClipboard));

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(initialTheme);

  // i18n state
  const [locale, setLocale] = useState(initialI18n?.locale ?? 'en');
  const [translations] = useState<TranslationDict>(initialI18n?.translations ?? {});

  // Translation function
  const t = useCallback(
    (key: string, params?: Record<string, string>): string => {
      // Try to find translation
      const parts = key.split('.');
      let value: unknown = translations;

      for (const part of parts) {
        if (value && typeof value === 'object' && part in value) {
          value = (value as Record<string, unknown>)[part];
        } else {
          // Key not found, return key itself
          return key;
        }
      }

      if (typeof value !== 'string') {
        return key;
      }

      // Replace parameters
      if (params) {
        return value.replace(/\{\{(\w+)\}\}/g, (_, name) => params[name] ?? `{{${name}}}`);
      }

      return value;
    },
    [translations]
  );

  // Apply theme class to container
  const themeClass = theme === 'system' ? '' : theme === 'dark' ? 'dark' : '';

  const contextValue: TestContextValue = {
    windowManager,
    dock,
    menu,
    fileSystem,
    clipboard,
    theme,
    setTheme,
    locale,
    setLocale,
    t,
  };

  return (
    <TestContext.Provider value={contextValue}>
      <div className={themeClass} data-testid="test-providers-root">
        {children}
      </div>
    </TestContext.Provider>
  );
};

/**
 * Query utilities for finding elements in the DOM
 */
function createQueryUtils(container: HTMLElement) {
  const getByTestId = (testId: string): HTMLElement => {
    const element = container.querySelector(`[data-testid="${testId}"]`);
    if (!element) {
      throw new Error(`Unable to find element with data-testid="${testId}"`);
    }
    return element as HTMLElement;
  };

  const queryByTestId = (testId: string): HTMLElement | null => {
    return container.querySelector(`[data-testid="${testId}"]`) as HTMLElement | null;
  };

  const queryAllByTestId = (testId: string): HTMLElement[] => {
    return Array.from(container.querySelectorAll(`[data-testid="${testId}"]`));
  };

  const getByText = (text: string | RegExp): HTMLElement => {
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

    throw new Error(`Unable to find element with text: ${text}`);
  };

  const queryByText = (text: string | RegExp): HTMLElement | null => {
    try {
      return getByText(text);
    } catch {
      return null;
    }
  };

  const getByRole = (role: string, options?: { name?: string | RegExp }): HTMLElement => {
    const elements = container.querySelectorAll(`[role="${role}"]`);

    for (const el of elements) {
      if (!options?.name) {
        return el as HTMLElement;
      }

      const name = el.getAttribute('aria-label') ?? el.textContent ?? '';
      const matches =
        typeof options.name === 'string'
          ? name.includes(options.name)
          : options.name.test(name);

      if (matches) {
        return el as HTMLElement;
      }
    }

    // Also check implicit roles
    const roleToElement: Record<string, string> = {
      button: 'button',
      textbox: 'input[type="text"], textarea',
      checkbox: 'input[type="checkbox"]',
      radio: 'input[type="radio"]',
      link: 'a',
      heading: 'h1, h2, h3, h4, h5, h6',
      list: 'ul, ol',
      listitem: 'li',
      img: 'img',
    };

    const selector = roleToElement[role];
    if (selector) {
      const implicitElements = container.querySelectorAll(selector);
      for (const el of implicitElements) {
        if (!options?.name) {
          return el as HTMLElement;
        }

        const name =
          el.getAttribute('aria-label') ??
          el.textContent ??
          (el as HTMLInputElement).value ??
          '';
        const matches =
          typeof options.name === 'string'
            ? name.includes(options.name)
            : options.name.test(name);

        if (matches) {
          return el as HTMLElement;
        }
      }
    }

    throw new Error(
      `Unable to find element with role="${role}"${options?.name ? ` and name="${options.name}"` : ''}`
    );
  };

  const queryByRole = (role: string, options?: { name?: string | RegExp }): HTMLElement | null => {
    try {
      return getByRole(role, options);
    } catch {
      return null;
    }
  };

  const debug = (): void => {
    console.log(container.innerHTML);
  };

  return {
    getByTestId,
    queryByTestId,
    queryAllByTestId,
    getByText,
    queryByText,
    getByRole,
    queryByRole,
    debug,
  };
}

/**
 * Global render registry for cleanup
 */
const renderedContainers = new Set<HTMLElement>();

/**
 * Cleanup all rendered components
 */
export function cleanup(): void {
  for (const container of renderedContainers) {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
  renderedContainers.clear();
}

/**
 * Render a component with all zOS providers
 *
 * @param ui The React element to render
 * @param options Render options including initial mock states
 * @returns RenderResult with query utilities and test helpers
 */
export function renderWithProviders(
  ui: ReactElement,
  options: RenderOptions = {}
): RenderResult & { testContext: TestContextValue } {
  const {
    wrapper: Wrapper,
    windowManager,
    dock,
    menu,
    fileSystem,
    clipboard,
    i18n,
    theme,
    container: providedContainer,
  } = options;

  // Create or use provided container
  const container = providedContainer ?? document.createElement('div');
  if (!providedContainer) {
    document.body.appendChild(container);
    renderedContainers.add(container);
  }

  // Track context value
  let testContextValue: TestContextValue | null = null;

  // Component to capture context
  const ContextCapture: React.FC<{ children: ReactNode }> = ({ children }) => {
    testContextValue = useTestContext();
    return <>{children}</>;
  };

  // Build the element tree
  let element: ReactElement = (
    <TestProviders
      initialWindowManager={windowManager}
      initialDock={dock}
      initialMenu={menu}
      initialFileSystem={fileSystem}
      initialClipboard={clipboard}
      initialI18n={i18n}
      initialTheme={theme}
    >
      <ContextCapture>{ui}</ContextCapture>
    </TestProviders>
  );

  // Wrap with custom wrapper if provided
  if (Wrapper) {
    element = <Wrapper>{element}</Wrapper>;
  }

  // Render using React DOM
  // Note: Requires react-dom to be installed
  const renderToDOM = (el: ReactElement) => {
    // Dynamic import of react-dom
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ReactDOM = (globalThis as any).ReactDOM || (typeof window !== 'undefined' ? (window as any).ReactDOM : null);

    if (!ReactDOM) {
      // For environments where ReactDOM is not on window, try dynamic import
      // This path is for testing environments that set up ReactDOM differently
      throw new Error(
        'ReactDOM not found. Ensure react-dom is available in your test environment. ' +
        'For Jest/Vitest, use @testing-library/react or set globalThis.ReactDOM.'
      );
    }

    // Use React 18 createRoot if available
    if (typeof ReactDOM.createRoot === 'function') {
      const root = ReactDOM.createRoot(container);
      root.render(el);
      (container as any)._reactRoot = root;
    } else if (typeof ReactDOM.render === 'function') {
      // Fallback for React 17 and earlier
      ReactDOM.render(el, container);
    } else {
      throw new Error('ReactDOM.createRoot or ReactDOM.render not available');
    }
  };

  renderToDOM(element);

  const queryUtils = createQueryUtils(container);

  const rerender = (newUi: ReactElement): void => {
    let newElement: ReactElement = (
      <TestProviders
        initialWindowManager={windowManager}
        initialDock={dock}
        initialMenu={menu}
        initialFileSystem={fileSystem}
        initialClipboard={clipboard}
        initialI18n={i18n}
        initialTheme={theme}
      >
        <ContextCapture>{newUi}</ContextCapture>
      </TestProviders>
    );

    if (Wrapper) {
      newElement = <Wrapper>{newElement}</Wrapper>;
    }

    renderToDOM(newElement);
  };

  const unmount = (): void => {
    if ((container as any)._reactRoot) {
      (container as any)._reactRoot.unmount();
    } else {
      const ReactDOM = (globalThis as any).ReactDOM || (typeof window !== 'undefined' ? (window as any).ReactDOM : null);
      if (ReactDOM && typeof ReactDOM.unmountComponentAtNode === 'function') {
        ReactDOM.unmountComponentAtNode(container);
      }
    }

    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
    renderedContainers.delete(container);
  };

  return {
    container,
    ...queryUtils,
    rerender,
    unmount,
    testContext: testContextValue!,
  };
}

/**
 * Create a custom render function with preset options
 */
export function createRenderer(defaultOptions: RenderOptions) {
  return (ui: ReactElement, options?: RenderOptions) =>
    renderWithProviders(ui, { ...defaultOptions, ...options });
}
