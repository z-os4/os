// Theme system
export * from './theme';

// Layout components
export * from './layouts';

// Window components
export * from './window';

// Quick Look components
export {
  QuickLookOverlay,
  ImagePreview,
  TextPreview,
  VideoPreview,
  AudioPreview,
  PDFPreview,
  GenericPreview,
} from './quick-look';
export type {
  QuickLookOverlayProps,
  QuickLookFile,
  FileType as QuickLookFileType, // Renamed to avoid conflict with icons
  ImagePreviewProps,
  TextPreviewProps,
  VideoPreviewProps,
  AudioPreviewProps,
  PDFPreviewProps,
  GenericPreviewProps,
} from './quick-look';

// Notification system
export * from './notifications';

// Dialog system
export * from './dialogs';

// Context Menu system
export * from './context-menu';

// Command Palette (avoid conflict with context-menu Command type)
export {
  CommandPaletteProvider,
  CommandPaletteContext,
  useCommandPalette,
  useRegisterCommand,
  useRegisterCommands,
  fuzzyMatch,
  searchCommands,
  groupResultsByCategory,
  evaluateMathExpression,
  createSystemCommands,
  CommandPalette,
  CommandPaletteItem,
} from './command-palette';
export type {
  Command as PaletteCommand, // Renamed to avoid conflict
  CommandCategory,
  CommandType,
  CommandGroup,
  CommandSearchResult,
  CommandPaletteState,
  CommandPaletteProps,
  CommandPaletteProviderProps,
  CommandPaletteContextValue,
  CommandPaletteItemProps,
} from './command-palette';

// Icon system (export selectively to avoid Lucide conflicts)
export {
  Icon,
  AppIcon,
  FileIcon,
  iconRegistry,
  Icons,
  getFileType,
  ICON_SIZE_MAP,
  EXTENSION_TYPE_MAP,
} from './icons';
export type {
  IconProps,
  AppIconProps,
  FileIconProps,
  IconSize,
  AppIconSize,
  IconComponent,
  FileType,
  IconName,
} from './icons';

// Accessibility utilities
export * from './a11y';

// UI Components
export * from './components/Button';
export * from './components/Input';
export * from './components/Card';
export * from './components/Switch';
export * from './components/Slider';
export * from './components/List';
export * from './components/Toolbar';
export * from './components/Sidebar';

// Data Display Components
export {
  // Types
  type SelectionMode,
  type SortDirection,
  type SortConfig,
  type SelectableProps,
  type DataStateProps,
  type Size,
  type StatusVariant,
  type DropPosition,
  type Alignment,
  type KeyExtractor,
  type RenderFunction,
  // Table
  Table,
  type Column,
  type TableProps,
  // List
  DataList,
  DataListItem,
  type DataListProps,
  type DataListItemProps,
  // Tree
  Tree,
  type TreeNode,
  type TreeProps,
  // Grid
  Grid,
  GridItem,
  type GridColumns,
  type GridProps,
  type GridItemProps,
  // Accordion
  Accordion,
  AccordionItem,
  type AccordionProps,
  type AccordionItemProps,
  // Tabs
  Tabs,
  TabList,
  TabButton,
  TabPanel,
  type Tab,
  type TabsProps,
  type TabListProps,
  type TabButtonProps,
  type TabPanelProps,
  // Badge
  Badge,
  badgeVariants,
  type BadgeProps,
  // Tag
  Tag,
  TagGroup,
  type TagColor,
  type TagProps,
  type TagGroupProps,
  // Avatar
  Avatar,
  AvatarGroup,
  avatarVariants,
  type AvatarStatus,
  type AvatarProps,
  type AvatarGroupProps,
  // Progress
  Progress,
  type ProgressProps,
  // Spinner
  Spinner,
  LoadingOverlay,
  Skeleton,
  type SpinnerProps,
  type LoadingOverlayProps,
  type SkeletonProps,
  // Empty states
  Empty,
  EmptySearch,
  EmptyError,
  EmptyFiles,
  EmptyImages,
  type EmptyProps,
  type EmptyPresetProps,
} from './data';

// Utilities
export { cn } from './lib/utils';

// Constants
export * from './constants';

// Animation utilities (useReducedMotion already exported from a11y)
export {
  // Types
  type EasingFunction,
  type AnimationConfig,
  type AnimationState,
  type SlideDirection,
  EASING_MAP,
  resolveEasing,
  // Hooks (useReducedMotion omitted - already exported from a11y)
  useTransition,
  type UseTransitionOptions,
  type UseTransitionResult,
  useAnimateValue,
  type UseAnimateValueOptions,
  // Components
  Transition,
  type TransitionProps,
  Fade,
  type FadeProps,
  Scale,
  type ScaleProps,
  Slide,
  type SlideProps,
  Collapse,
  type CollapseProps,
  AnimatePresence,
  type AnimatePresenceProps,
  // Presets
  PRESETS,
  getPreset,
  mergePreset,
  type TransitionPreset,
  type PresetName,
} from './animation';

// Form components
export {
  // Types
  type FormSize,
  type FormFieldBaseProps,
  type TextInputBaseProps,
  type SelectOption,
  type ValidationRule,
  type FieldState,
  type FormState,
  type FormContextValue,
  SIZE_CLASSES,
  GLASS_STYLES,
  // TextField
  TextField,
  type TextFieldProps,
  // TextArea
  TextArea,
  type TextAreaProps,
  // Select
  Select,
  type SelectProps,
  // Checkbox
  Checkbox,
  type CheckboxProps,
  CheckboxGroup,
  type CheckboxGroupProps,
  // Radio
  Radio,
  type RadioProps,
  RadioGroup,
  type RadioGroupProps,
  type RadioOption,
  // Switch
  FormSwitch,
  type FormSwitchProps,
  // Slider
  FormSlider,
  type FormSliderProps,
  type SliderMark,
  // DatePicker
  DatePicker,
  type DatePickerProps,
  // ColorPicker
  ColorPicker,
  type ColorPickerProps,
  // FileInput
  FileInput,
  type FileInputProps,
  // FormField
  FormField,
  FormFieldRow,
  FormSection,
  FormDivider,
  type FormFieldProps,
  type FormFieldRowProps,
  type FormSectionProps,
  type FormDividerProps,
  // Form
  Form,
  FormActions,
  useFormContext,
  useFormField,
  type FormProps,
  type FormActionsProps,
  type FormValues,
  type FormErrors,
  type FormTouched,
  type ValidateFn,
  type FormRenderProps,
} from './forms';

// Error handling components
export {
  // Types
  type ErrorInfo,
  type ErrorBoundaryProps,
  type AppErrorBoundaryProps,
  type ErrorFallbackProps,
  type AppCrashScreenProps,
  type ErrorContextValue,
  type ErrorProviderProps,
  type ErrorBoundaryState,
  type WithErrorBoundaryOptions,
  type UseErrorHandlerResult,
  // Components
  ErrorBoundary,
  AppErrorBoundary,
  ErrorFallback,
  AppCrashScreen,
  // HOC
  withErrorBoundary,
  // Context
  ErrorContext,
  ErrorProvider,
  useErrors,
  // Hooks
  useErrorHandler,
  useAsyncError,
} from './error';

// Navigation components
export {
  // Types
  type NavSize,
  type NavItem,
  type BreadcrumbItem,
  type Step,
  type SidebarSection,
  NAV_SIZE_CLASSES,
  NAV_GLASS_STYLES,
  // Breadcrumb
  Breadcrumb,
  type BreadcrumbProps,
  // Pagination
  Pagination,
  type PaginationProps,
  // Stepper
  Stepper,
  type StepperProps,
  // Navbar
  Navbar,
  type NavbarProps,
  // NavSidebar
  NavSidebar,
  type NavSidebarProps,
  // LinkButton
  LinkButton,
  type LinkButtonProps,
  // BackButton
  BackButton,
  type BackButtonProps,
} from './navigation';

// Toolbar and StatusBar (Window Chrome components)
export type {
  ToolbarItem,
  ToolbarItemType,
  ToolbarSize,
  ToolbarVariant,
  ToolbarProps as WindowToolbarProps, // Renamed to avoid conflict with components/Toolbar
  ToolbarButtonProps,
  ToolbarDropdownProps,
  ToolbarGroupProps as WindowToolbarGroupProps,
  StatusBarItem,
  StatusBarAlignment,
  StatusBarProps,
  StatusBarItemProps,
  WindowChromeProps,
  UseToolbarResult,
} from './toolbar';

export {
  // Constants
  TOOLBAR_SIZE_CLASSES,
  TOOLBAR_BUTTON_SIZES,
  TOOLBAR_GLASS_STYLES,
  STATUS_BAR_GLASS_STYLES,
  // Components
  Toolbar as WindowToolbar, // Renamed to avoid conflict with components/Toolbar
  ToolbarButton,
  ToolbarDropdown,
  ToolbarGroup as WindowToolbarGroup,
  ToolbarSeparator,
  ToolbarSpacer,
  StatusBar,
  StatusBarItemComponent,
  WindowChrome,
  // Hooks
  useToolbar,
  createToggleItems,
} from './toolbar';

// Split Pane components
export {
  // Components
  SplitPane,
  Pane,
  Gutter,
  ResizablePane,
  isPaneElement,
  // Hooks
  useSplitPane,
  // Types
  type SplitDirection,
  type PaneSize,
  type SplitPaneProps,
  type PaneProps,
  type GutterProps,
  type ResizablePaneProps,
  type PaneState,
  type UseSplitPaneOptions,
  type UseSplitPaneResult,
} from './split-pane';

// Media components
export {
  // Main components
  ImageViewer,
  VideoPlayer,
  AudioPlayer,
  // Shared controls
  PlayButton,
  VolumeControl,
  ProgressBar,
  TimeDisplay,
  FullscreenButton,
  PlaybackSpeedControl,
  ControlsOverlay,
  // Utilities
  formatTime,
  // Hook
  useMediaControls,
  // Types
  type MediaSource,
  type ImageFit,
  type ImageViewerProps,
  type VideoPlayerProps,
  type AudioPlayerProps,
  type PlayButtonProps,
  type VolumeControlProps,
  type ProgressBarProps,
  type TimeDisplayProps,
  type FullscreenButtonProps,
  type PlaybackSpeedControlProps,
  type ControlsOverlayProps,
  type MediaControlsState,
  type MediaControlsActions,
  type MediaControlsReturn,
  type UseMediaControlsOptions,
} from './media';
