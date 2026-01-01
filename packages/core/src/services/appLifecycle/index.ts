/**
 * zOS App Lifecycle System
 *
 * Manages app registration, lifecycle hooks, and state persistence.
 *
 * @example
 * ```tsx
 * // Define an app
 * const NotesApp = defineApp({
 *   manifest: {
 *     id: 'apps.zos.notes',
 *     name: 'Notes',
 *     version: '1.0.0',
 *     icon: '📝',
 *     capabilities: {
 *       canOpenFiles: ['.txt', '.md'],
 *       supportsMultipleWindows: true,
 *     },
 *   },
 *   component: NotesComponent,
 *   hooks: {
 *     onSaveState: () => ({ notes }),
 *     onRestoreState: (state) => setNotes(state?.notes || []),
 *   },
 * });
 *
 * // Register the app
 * appRegistry.register(NotesApp.manifest, NotesApp.component, NotesApp.hooks);
 *
 * // In a component
 * function App() {
 *   return (
 *     <AppProvider>
 *       <Desktop />
 *     </AppProvider>
 *   );
 * }
 *
 * // Use the registry
 * function Desktop() {
 *   const { apps, launch, terminate } = useAppRegistry();
 *
 *   const openNotes = async () => {
 *     const instanceId = await launch('apps.zos.notes');
 *     console.log('Launched instance:', instanceId);
 *   };
 *
 *   return <button onClick={openNotes}>Open Notes</button>;
 * }
 *
 * // Inside an app component
 * function NotesComponent({ instanceId }: AppComponentProps) {
 *   const { status, isActive, saveState } = useAppLifecycle({
 *     appId: 'apps.zos.notes',
 *     instanceId,
 *     autoSaveOnDeactivate: true,
 *   });
 *
 *   return <div>Notes content (active: {isActive})</div>;
 * }
 * ```
 */

// Types
// Note: AppManifest is exported as LifecycleAppManifest to avoid conflict with appLoader.AppManifest
export type {
  AppStatus,
  AppCapabilities,
  AppManifest as LifecycleAppManifest,
  AppLifecycleHooks,
  RegisteredApp,
  AppComponentProps,
  LaunchOptions,
  SavedAppState,
} from './types';

// Registry
export { appRegistry } from './AppRegistry';

// Context and hooks
export {
  AppProvider,
  useAppRegistry,
  useApp,
  useAppRunning,
  useActiveApp,
  type AppContextValue,
} from './AppContext';

// Lifecycle hooks
export {
  useAppLifecycle,
  useAppActive,
  useAppStatus,
  useRestoreState,
  type AppLifecycleResult,
  type UseAppLifecycleOptions,
} from './useAppLifecycle';

// App definition helpers
export {
  defineApp,
  createApp,
  AppBuilder,
  type AppDefinition,
  type DefineAppOptions,
  type AppProps,
} from './defineApp.js';
