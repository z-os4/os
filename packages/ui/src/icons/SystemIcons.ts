/**
 * SystemIcons - Organized re-exports of lucide-react icons
 *
 * Icons are organized by category for easy discovery and consistent usage
 * across the zOS interface.
 *
 * @example
 * ```tsx
 * import { Icons } from '@z-os/ui/icons';
 *
 * <Icon icon={Icons.Settings} size="lg" />
 * <Icon icon={Icons.ChevronLeft} />
 * ```
 */

// ============================================================================
// NAVIGATION
// ============================================================================
export {
  // Chevrons
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUp,
  ChevronsDown,
  ChevronFirst,
  ChevronLast,

  // Arrows
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ArrowUpLeft,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowDownRight,
  MoveLeft,
  MoveRight,
  MoveUp,
  MoveDown,
  Undo,
  Redo,
  Undo2,
  Redo2,
  RotateCcw,
  RotateCw,
  RefreshCw,
  RefreshCcw,

  // Navigation UI
  Home,
  ExternalLink,
  Link,
  Link2,
  Unlink,
  Unlink2,
  CornerDownLeft,
  CornerDownRight,
  CornerUpLeft,
  CornerUpRight,
} from 'lucide-react';

// ============================================================================
// ACTIONS
// ============================================================================
export {
  // Add/Remove
  Plus,
  Minus,
  PlusCircle,
  MinusCircle,
  PlusSquare,
  MinusSquare,

  // Edit
  Edit,
  Edit2,
  Edit3,
  Pencil,
  PenLine,
  Eraser,
  Scissors,

  // Delete
  Trash,
  Trash2,

  // Save/Load
  Save,
  SaveAll,
  Download,
  Upload,
  Import,
  FileDown,
  FileUp,
  FolderDown,
  FolderUp,

  // Copy/Paste
  Copy,
  Clipboard,
  ClipboardCopy,
  ClipboardPaste,
  ClipboardCheck,
  ClipboardList,
  ClipboardX,

  // Move/Organize
  Move,
  FolderInput,
  FolderOutput,
  Archive,
  ArchiveRestore,
  ArchiveX,

  // Send/Share
  Send,
  SendHorizontal,
  Forward,
  Reply,
  ReplyAll,

  // Zoom
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Expand,

  // Lock
  Lock,
  Unlock,
  LockKeyhole,
  UnlockKeyhole,

  // Power
  Power,
  PowerOff,

  // Print
  Printer,

  // Other Actions
  Eye,
  EyeOff,
  Scan,
  QrCode,
  Sparkles,
  Wand2,
  Zap,
} from 'lucide-react';

// ============================================================================
// MEDIA
// ============================================================================
export {
  // Playback
  Play,
  Pause,
  // Note: lucide-react doesn't have Stop, use Square instead
  Square,
  Circle,
  SkipBack,
  SkipForward,
  Rewind,
  FastForward,
  Repeat,
  Repeat1,
  Shuffle,

  // Volume
  Volume,
  Volume1,
  Volume2,
  VolumeX,

  // Video
  Video,
  VideoOff,
  Camera,
  CameraOff,
  MonitorPlay,
  Clapperboard,

  // Audio
  Music,
  Music2,
  Music3,
  Music4,
  Mic,
  MicOff,
  Mic2,
  Headphones,
  Speaker,
  Radio,
  Podcast,

  // Record
  Disc,
  Disc2,
  Disc3,

  // Casting
  Cast,
  Airplay,
  ScreenShare,
  ScreenShareOff,
} from 'lucide-react';

// ============================================================================
// FILES & FOLDERS
// ============================================================================
export {
  // Files
  File,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileCode,
  FileCode2,
  FileJson,
  FileJson2,
  FileArchive,
  FileSpreadsheet,
  FilePlus,
  FilePlus2,
  FileMinus,
  FileMinus2,
  FileX,
  FileX2,
  FileCheck,
  FileCheck2,
  FileWarning,
  FileQuestion,
  FileSearch,
  FileSearch2,
  FileCog,
  FileKey,
  FileKey2,
  FileLock,
  FileLock2,
  FileOutput,
  FileInput,
  FileDiff,
  FileDigit,
  FileSymlink,
  FileType,
  FileType2,
  Files,

  // Folders
  Folder,
  FolderOpen,
  FolderPlus,
  FolderMinus,
  FolderX,
  FolderCheck,
  FolderSearch,
  FolderSearch2,
  FolderCog,
  FolderKey,
  FolderLock,
  FolderSymlink,
  FolderTree,
  FolderArchive,
  FolderGit,
  FolderGit2,
  FolderHeart,
  FolderKanban,
  Folders,

  // Documents
  BookOpen,
  BookMarked,
  Book,
  BookText,
  Notebook,
  Library,
  Newspaper,
  ScrollText,
  NotepadText,
} from 'lucide-react';

// ============================================================================
// UI CONTROLS
// ============================================================================
export {
  // Menu
  Menu,
  MoreHorizontal,
  MoreVertical,
  Grip,
  GripHorizontal,
  GripVertical,
  Ellipsis,
  EllipsisVertical,
  PanelLeft,
  PanelRight,
  PanelTop,
  PanelBottom,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  PanelTopClose,
  PanelTopOpen,
  PanelBottomClose,
  PanelBottomOpen,
  Sidebar,
  SidebarClose,
  SidebarOpen,
  Columns2,
  Columns3,
  Columns4,
  Rows2,
  Rows3,
  Rows4,
  LayoutGrid,
  LayoutList,
  LayoutTemplate,
  LayoutDashboard,
  LayoutPanelLeft,
  LayoutPanelTop,
  AppWindow,
  Square as WindowSquare,
  SquareStack,

  // Window controls
  X,
  Maximize,
  Minimize,
  ChevronsUpDown,
  ChevronsLeftRight,
  Fullscreen,
  ShrinkIcon,
  Expand as ExpandWindow,

  // Search & Filter
  Search,
  SearchX,
  SearchCheck,
  SearchCode,
  SearchSlash,
  Filter,
  FilterX,
  SlidersHorizontal,
  SlidersVertical,

  // Settings
  Settings,
  Settings2,
  Cog,
  Wrench,
  Hammer,

  // View controls
  List,
  ListOrdered,
  ListChecks,
  ListFilter,
  ListTree,
  ListVideo,
  ListMusic,
  ListTodo,
  ListMinus,
  ListPlus,
  ListX,
  Grid2x2,
  Grid3x3,
  Table,
  Table2,
  TableProperties,
  Kanban,
  GanttChart,
  Calendar,
  CalendarDays,
  CalendarCheck,
  CalendarX,
  CalendarPlus,
  CalendarMinus,
  CalendarClock,
  CalendarRange,
  CalendarSearch,
  Clock,
  Clock1,
  Clock2,
  Clock3,
  Clock4,
  Clock5,
  Clock6,
  Clock7,
  Clock8,
  Clock9,
  Clock10,
  Clock11,
  Clock12,
  Timer,
  TimerOff,
  TimerReset,
  Hourglass,
  History,
  AlarmClock,
  AlarmClockOff,
  AlarmClockCheck,

  // Toggle
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

// ============================================================================
// STATUS & INDICATORS
// ============================================================================
export {
  // Success/Error/Warning
  Check,
  CheckCircle,
  CheckCircle2,
  CheckSquare,
  CircleCheck,
  CircleX,
  SquareCheck,
  XCircle,
  XSquare,
  AlertCircle,
  AlertTriangle,
  AlertOctagon,
  Ban,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  ShieldOff,

  // Info
  Info,
  HelpCircle,
  CircleHelp,
  MessageCircle,
  MessageSquare,
  MessagesSquare,

  // Loading/Progress
  Loader,
  Loader2,
  LoaderCircle,
  LoaderPinwheel,
  RefreshCw as Refresh,
  Hourglass as Loading,

  // Connection
  Wifi,
  WifiOff,
  WifiLow,
  WifiHigh,
  Signal,
  SignalLow,
  SignalMedium,
  SignalHigh,
  SignalZero,
  Bluetooth,
  BluetoothOff,
  BluetoothConnected,
  BluetoothSearching,
  Nfc,

  // Battery
  Battery,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  BatteryCharging,
  BatteryWarning,
  Plug,
  PlugZap,

  // Activity
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart,
  BarChart2,
  BarChart3,
  BarChart4,
  BarChartHorizontal,
  BarChartBig,
  PieChart,
  LineChart,
  AreaChart,
  Gauge,

  // Notifications
  Bell,
  BellOff,
  BellRing,
  BellPlus,
  BellMinus,
  BellDot,
} from 'lucide-react';

// ============================================================================
// SOCIAL & COMMUNICATION
// ============================================================================
export {
  // Sharing
  Share,
  Share2,

  // Reactions
  Heart,
  HeartOff,
  ThumbsUp,
  ThumbsDown,
  Star,
  StarOff,
  StarHalf,
  Smile,
  Frown,
  Meh,
  Laugh,
  Angry,

  // Social
  Users,
  User,
  UserPlus,
  UserMinus,
  UserX,
  UserCheck,
  UserCog,
  UserCircle,
  UserCircle2,
  UserSquare,
  UserSquare2,
  UserRound,
  UserRoundCheck,
  UserRoundMinus,
  UserRoundPlus,
  UserRoundX,
  UserRoundCog,
  UserSearch,
  Users2,
  UsersRound,
  Contact,
  Contact2,
  AtSign,
  Hash,
  Bookmark,
  BookmarkCheck,
  BookmarkMinus,
  BookmarkPlus,
  BookmarkX,
  Flag,
  FlagOff,
  FlagTriangleLeft,
  FlagTriangleRight,
  Award,
  Trophy,
  Medal,
  Crown,
  Gem,

  // Messages
  Mail,
  MailOpen,
  MailPlus,
  MailMinus,
  MailX,
  MailCheck,
  MailWarning,
  MailQuestion,
  MailSearch,
  Inbox,
  Send as SendMessage,
  MessageCircle as Chat,
  Phone,
  PhoneCall,
  PhoneForwarded,
  PhoneIncoming,
  PhoneMissed,
  PhoneOff,
  PhoneOutgoing,
  Voicemail,

  // Globe
  Globe,
  Globe2,
  Earth,
  Languages,
  MapPin,
  MapPinOff,
  Map,
  Compass,
  Navigation,
  Navigation2,
  Locate,
  LocateFixed,
  LocateOff,
} from 'lucide-react';

// ============================================================================
// DEVELOPMENT & TECH
// ============================================================================
export {
  // Code
  Code,
  Code2,
  Braces,
  Brackets,
  Terminal,
  TerminalSquare,
  Command,
  Option,
  Hash as HashTag,
  Binary,
  Regex,

  // Git
  GitBranch,
  GitBranchPlus,
  GitCommit,
  GitCompare,
  GitFork,
  GitGraph,
  GitMerge,
  GitPullRequest,
  GitPullRequestClosed,
  GitPullRequestCreate,
  GitPullRequestDraft,

  // Database
  Database,
  DatabaseBackup,
  DatabaseZap,
  HardDrive,
  HardDriveDownload,
  HardDriveUpload,
  Server,
  ServerCog,
  ServerCrash,
  ServerOff,
  Cloud,
  CloudOff,
  CloudDownload,
  CloudUpload,
  CloudCog,
  CloudLightning,
  CloudRain,
  CloudSun,
  CloudMoon,

  // Security
  Key,
  KeyRound,
  KeySquare,
  Fingerprint,
  ScanFace,
  ScanEye,
  Shield,
  ShieldCheck as SecureShield,
  Bug,
  BugOff,
  BugPlay,

  // Devices
  Monitor,
  Laptop,
  Laptop2,
  Smartphone,
  Tablet,
  TabletSmartphone,
  Watch,
  Tv,
  Tv2,
  Gamepad,
  Gamepad2,
  Mouse,
  MousePointer,
  MousePointer2,
  MousePointerClick,
  Keyboard,
  Cpu,
  CircuitBoard,
  MemoryStick,
  Usb,

  // Network
  Network,
  Cable,
  Router,
  Waypoints,
  Workflow,
  Share2 as NetworkShare,
  Rss,

  // AI/ML
  Bot,
  BrainCircuit,
  BrainCog,
  Sparkle,
  Lightbulb,
  LightbulbOff,
} from 'lucide-react';

// ============================================================================
// SHAPES & MISC
// ============================================================================
export {
  // Shapes
  Circle as ShapeCircle,
  Square as ShapeSquare,
  Triangle,
  Pentagon,
  Hexagon,
  Octagon,
  Diamond,
  Heart as ShapeHeart,
  Star as ShapeStar,
  Asterisk,

  // Misc
  Tag,
  Tags,
  Layers,
  Layers2,
  Layers3,
  Box,
  Boxes,
  Package as Pkg,
  Package2,
  PackageCheck,
  PackageOpen,
  PackagePlus,
  PackageMinus,
  PackageSearch,
  PackageX,
  Palette,
  PaintBucket,
  Brush,
  PaintRoller,
  Pipette,
  Ruler,
  Crop,
  Image,
  ImagePlus,
  ImageMinus,
  ImageOff,
  Images,
  Frame,
  Ratio,
  Move3d,
  Rotate3d,
  Scale3d,
  FlipHorizontal,
  FlipHorizontal2,
  FlipVertical,
  FlipVertical2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  AlignHorizontalDistributeCenter,
  AlignHorizontalDistributeEnd,
  AlignHorizontalDistributeStart,
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  AlignHorizontalJustifyStart,
  AlignHorizontalSpaceAround,
  AlignHorizontalSpaceBetween,
  AlignVerticalDistributeCenter,
  AlignVerticalDistributeEnd,
  AlignVerticalDistributeStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignVerticalJustifyStart,
  AlignVerticalSpaceAround,
  AlignVerticalSpaceBetween,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Subscript,
  Superscript,
  Type as TextType,
  CaseLower,
  CaseUpper,
  CaseSensitive,
  RemoveFormatting,
  Quote,
  Heading,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Pilcrow,
  ListOrdered as NumberedList,
  List as BulletList,
  Outdent,
  Indent,
  WrapText,
  TextCursor,
  TextCursorInput,
  TextSelect,
  SpellCheck,
  SpellCheck2,
  WholeWord,
  SeparatorHorizontal,
  SeparatorVertical,
  SplitSquareHorizontal,
  SplitSquareVertical,

  // Other
  Aperture,
  Crosshair,
  Target,
  Focus,
  Eye as View,
  EyeOff as HideView,
  Glasses,
  SunMedium,
  Moon,
  Sun,
  Sunrise,
  Sunset,
  CloudSun as PartlyCloudy,
  Thermometer,
  ThermometerSun,
  ThermometerSnowflake,
  Droplet,
  Droplets,
  Wind,
  Snowflake,
  Flame,
  Leaf,
  TreeDeciduous,
  TreePine,
  Flower,
  Flower2,
  Clover,
  Mountain,
  MountainSnow,
  Waves,
  Anchor,
  Shell,
  Fish,
  Bird,
  Cat,
  Dog,
  Rabbit,
  Turtle,
  Squirrel,
  Bug as Insect,
  Footprints,
} from 'lucide-react';

// ============================================================================
// CONSOLIDATED ICONS OBJECT
// ============================================================================
import * as LucideIcons from 'lucide-react';

/**
 * All icons organized by category for easy access
 */
export const Icons = {
  // Navigation
  ChevronLeft: LucideIcons.ChevronLeft,
  ChevronRight: LucideIcons.ChevronRight,
  ChevronUp: LucideIcons.ChevronUp,
  ChevronDown: LucideIcons.ChevronDown,
  ArrowLeft: LucideIcons.ArrowLeft,
  ArrowRight: LucideIcons.ArrowRight,
  ArrowUp: LucideIcons.ArrowUp,
  ArrowDown: LucideIcons.ArrowDown,
  Home: LucideIcons.Home,
  ExternalLink: LucideIcons.ExternalLink,

  // Actions
  Plus: LucideIcons.Plus,
  Minus: LucideIcons.Minus,
  Edit: LucideIcons.Edit,
  Trash: LucideIcons.Trash,
  Trash2: LucideIcons.Trash2,
  Save: LucideIcons.Save,
  Download: LucideIcons.Download,
  Upload: LucideIcons.Upload,
  Copy: LucideIcons.Copy,
  Paste: LucideIcons.ClipboardPaste,

  // Media
  Play: LucideIcons.Play,
  Pause: LucideIcons.Pause,
  Stop: LucideIcons.Square,
  Volume: LucideIcons.Volume2,
  VolumeOff: LucideIcons.VolumeX,
  SkipBack: LucideIcons.SkipBack,
  SkipForward: LucideIcons.SkipForward,

  // Files
  File: LucideIcons.File,
  Folder: LucideIcons.Folder,
  FolderOpen: LucideIcons.FolderOpen,
  Document: LucideIcons.FileText,
  Image: LucideIcons.Image,

  // UI
  Menu: LucideIcons.Menu,
  Close: LucideIcons.X,
  Maximize: LucideIcons.Maximize,
  Minimize: LucideIcons.Minimize,
  Settings: LucideIcons.Settings,
  Search: LucideIcons.Search,
  Filter: LucideIcons.Filter,
  MoreHorizontal: LucideIcons.MoreHorizontal,
  MoreVertical: LucideIcons.MoreVertical,

  // Status
  Check: LucideIcons.Check,
  CheckCircle: LucideIcons.CheckCircle,
  X: LucideIcons.X,
  XCircle: LucideIcons.XCircle,
  AlertCircle: LucideIcons.AlertCircle,
  AlertTriangle: LucideIcons.AlertTriangle,
  Info: LucideIcons.Info,
  HelpCircle: LucideIcons.HelpCircle,

  // Loading
  Loader: LucideIcons.Loader2,
  Spinner: LucideIcons.LoaderCircle,
  Refresh: LucideIcons.RefreshCw,

  // Social
  Share: LucideIcons.Share,
  Share2: LucideIcons.Share2,
  Heart: LucideIcons.Heart,
  Star: LucideIcons.Star,
  ThumbsUp: LucideIcons.ThumbsUp,
  ThumbsDown: LucideIcons.ThumbsDown,
  Bookmark: LucideIcons.Bookmark,

  // Communication
  Mail: LucideIcons.Mail,
  Message: LucideIcons.MessageCircle,
  Phone: LucideIcons.Phone,
  User: LucideIcons.User,
  Users: LucideIcons.Users,
  Bell: LucideIcons.Bell,
  BellOff: LucideIcons.BellOff,

  // Development
  Code: LucideIcons.Code,
  Terminal: LucideIcons.Terminal,
  Database: LucideIcons.Database,
  GitBranch: LucideIcons.GitBranch,
  Bug: LucideIcons.Bug,

  // Security
  Lock: LucideIcons.Lock,
  Unlock: LucideIcons.Unlock,
  Key: LucideIcons.Key,
  Shield: LucideIcons.Shield,

  // Misc
  Calendar: LucideIcons.Calendar,
  Clock: LucideIcons.Clock,
  Link: LucideIcons.Link,
  Tag: LucideIcons.Tag,
  Layers: LucideIcons.Layers,
  Zap: LucideIcons.Zap,
  Sparkles: LucideIcons.Sparkles,
  Wand: LucideIcons.Wand2,
  Eye: LucideIcons.Eye,
  EyeOff: LucideIcons.EyeOff,
  Globe: LucideIcons.Globe,
  MapPin: LucideIcons.MapPin,
  Compass: LucideIcons.Compass,
  Sun: LucideIcons.Sun,
  Moon: LucideIcons.Moon,
  Monitor: LucideIcons.Monitor,
  Laptop: LucideIcons.Laptop,
  Smartphone: LucideIcons.Smartphone,
  Wifi: LucideIcons.Wifi,
  WifiOff: LucideIcons.WifiOff,
  Bluetooth: LucideIcons.Bluetooth,
  Battery: LucideIcons.Battery,
  Power: LucideIcons.Power,
  Bot: LucideIcons.Bot,
  Brain: LucideIcons.BrainCircuit,
} as const;

export type IconName = keyof typeof Icons;
