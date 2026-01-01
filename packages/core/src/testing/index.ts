/**
 * zOS Testing Utilities
 *
 * Comprehensive testing utilities for zOS apps and components.
 * Designed to work with Jest, Vitest, and similar testing frameworks.
 *
 * @example Basic usage
 * ```typescript
 * import { renderWithProviders, click, waitFor } from '@zos/core/testing';
 *
 * test('my component', async () => {
 *   const { getByTestId } = renderWithProviders(<MyComponent />);
 *   click(getByTestId('my-button'));
 *   await waitFor(() => getByTestId('result'));
 * });
 * ```
 *
 * @example Testing an app
 * ```typescript
 * import { createTestApp, simulateMenuAction } from '@zos/core/testing';
 *
 * const testApp = createTestApp({
 *   id: 'my-app',
 *   name: 'My App',
 *   component: MyAppComponent,
 * });
 *
 * test('app menu actions', () => {
 *   const { getByText } = testApp.render();
 *   simulateMenuAction('file', 'new');
 *   expect(getByText('New Document')).toBeTruthy();
 * });
 * ```
 */

// Types
export type {
  RenderResult,
  RenderOptions,
  MockFn,
  MockWindowManager,
  MockDockContext,
  MockMenuContext,
  MockFileSystem,
  MockClipboard,
  MockDockItem,
  TranslationDict,
  TestAppConfig,
  TestAppResult,
  KeyboardShortcut,
  DragDropOptions,
  WaitOptions,
} from './types';

// Test Providers
export {
  TestProviders,
  useTestContext,
  renderWithProviders,
  createRenderer,
  cleanup,
  type TestProvidersProps,
} from './TestProviders';

// Mock Providers
export {
  createMockFn,
  createMockWindowManager,
  createMockDockContext,
  createMockMenuContext,
  createMockFileSystem,
  createMockClipboard,
} from './mockProviders';

// App Test Utilities
export {
  createTestApp,
  parseKeyboardShortcut,
  simulateMenuAction,
  simulateKeyboardShortcut,
  simulateDragDrop,
  simulateFileDrop,
  simulateWindowResize,
  simulateVisibilityChange,
  simulateNetworkChange,
  simulateStorageEvent,
} from './appTestUtils';

// Event Helpers
export {
  click,
  doubleClick,
  rightClick,
  type,
  clear,
  press,
  pressEnter,
  pressEscape,
  pressTab,
  hover,
  unhover,
  focus,
  blur,
  scroll,
  select,
  check,
  uncheck,
  tap,
} from './eventHelpers';

// Wait Utilities
export {
  waitFor,
  waitForElement,
  waitForTestId,
  waitForText,
  waitForElementToBeRemoved,
  waitForVisible,
  waitForHidden,
  waitForElementCount,
  waitForMockCall,
  waitForPromise,
  waitForCondition,
  waitForEvent,
  waitForMutation,
  waitForAnimationFrame,
  sleep,
  flushPromises,
  createDeferred,
} from './waitFor';
