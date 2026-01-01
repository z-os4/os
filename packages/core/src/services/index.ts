export {
  fetchAvailableApps,
  getInstalledApps,
  installApp,
  uninstallApp,
  updateApp,
  checkForUpdates,
  clearAppCache,
  compareVersions,
  categoryGradients,
  type LoaderAppManifest,
  type InstalledApp,
  type AppUpdate,
} from './appLoader';

// Menu Registry
export {
  menuRegistry,
  type MenuRegistry,
  type MenuItem,
  type Menu,
  type AppMenuConfig,
  type MenuActionEvent,
  type MenuItemType,
} from './menuRegistry';

// Menu Templates
export {
  createStandardAppMenu,
  createStandardFileMenu,
  createStandardEditMenu,
  createStandardViewMenu,
  createStandardWindowMenu,
  createStandardHelpMenu,
  createStandardMenus,
  createSeparator,
  createCheckboxItem,
  createRadioGroup,
  type FileMenuHandlers,
  type EditMenuHandlers,
  type ViewMenuHandlers,
  type WindowMenuHandlers,
  type HelpMenuHandlers,
  type AppMenuHandlers,
  type StandardMenuOptions,
} from './menuTemplates';

// Virtual File System
export * from './fileSystem';

// Drag & Drop
export * from './dragDrop';

// Keyboard Shortcuts
export * from './keyboard';

// History (Undo/Redo)
export * from './history';

// File Associations
export * from './fileAssociations';

// Clipboard
export * from './clipboard';

// App Lifecycle
export * from './appLifecycle';

// Window State Persistence
export * from './windowState';

// Internationalization (i18n)
export * from './i18n';

// Audio Mixer
export * from './audioMixer';

// Graphics (2D/3D)
export * from './graphics';
