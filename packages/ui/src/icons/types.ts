import type { LucideIcon } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';

/**
 * Icon size presets
 */
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;

/**
 * Standard app icon sizes (macOS-style)
 */
export type AppIconSize = 16 | 32 | 64 | 128 | 256 | 512;

/**
 * Icon component type - either a Lucide icon or a custom SVG component
 */
export type IconComponent = LucideIcon | ComponentType<SVGProps<SVGSVGElement>>;

/**
 * Size mapping for icon presets
 */
export const ICON_SIZE_MAP: Record<Exclude<IconSize, number>, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

/**
 * File type categories
 */
export type FileType =
  | 'folder'
  | 'document'
  | 'image'
  | 'video'
  | 'audio'
  | 'code'
  | 'archive'
  | 'pdf'
  | 'spreadsheet'
  | 'presentation'
  | 'text'
  | 'executable'
  | 'font'
  | 'database'
  | 'config'
  | 'unknown';

/**
 * Extension to file type mapping
 */
export const EXTENSION_TYPE_MAP: Record<string, FileType> = {
  // Folders
  '': 'folder',

  // Documents
  doc: 'document',
  docx: 'document',
  odt: 'document',
  rtf: 'document',

  // Images
  png: 'image',
  jpg: 'image',
  jpeg: 'image',
  gif: 'image',
  webp: 'image',
  svg: 'image',
  bmp: 'image',
  ico: 'image',
  tiff: 'image',
  tif: 'image',
  heic: 'image',
  heif: 'image',

  // Video
  mp4: 'video',
  mov: 'video',
  avi: 'video',
  mkv: 'video',
  webm: 'video',
  wmv: 'video',
  flv: 'video',
  m4v: 'video',

  // Audio
  mp3: 'audio',
  wav: 'audio',
  flac: 'audio',
  aac: 'audio',
  ogg: 'audio',
  m4a: 'audio',
  wma: 'audio',
  aiff: 'audio',

  // Code
  js: 'code',
  jsx: 'code',
  ts: 'code',
  tsx: 'code',
  py: 'code',
  rb: 'code',
  go: 'code',
  rs: 'code',
  java: 'code',
  c: 'code',
  cpp: 'code',
  h: 'code',
  hpp: 'code',
  cs: 'code',
  php: 'code',
  swift: 'code',
  kt: 'code',
  scala: 'code',
  vue: 'code',
  svelte: 'code',
  html: 'code',
  css: 'code',
  scss: 'code',
  sass: 'code',
  less: 'code',
  sql: 'code',
  sh: 'code',
  bash: 'code',
  zsh: 'code',

  // Archives
  zip: 'archive',
  rar: 'archive',
  '7z': 'archive',
  tar: 'archive',
  gz: 'archive',
  bz2: 'archive',
  xz: 'archive',
  dmg: 'archive',
  iso: 'archive',

  // PDF
  pdf: 'pdf',

  // Spreadsheets
  xls: 'spreadsheet',
  xlsx: 'spreadsheet',
  csv: 'spreadsheet',
  ods: 'spreadsheet',
  numbers: 'spreadsheet',

  // Presentations
  ppt: 'presentation',
  pptx: 'presentation',
  odp: 'presentation',
  key: 'presentation',

  // Text
  txt: 'text',
  md: 'text',
  markdown: 'text',
  log: 'text',
  readme: 'text',

  // Executables
  exe: 'executable',
  app: 'executable',
  msi: 'executable',
  deb: 'executable',
  rpm: 'executable',
  pkg: 'executable',

  // Fonts
  ttf: 'font',
  otf: 'font',
  woff: 'font',
  woff2: 'font',
  eot: 'font',

  // Database
  db: 'database',
  sqlite: 'database',
  sqlite3: 'database',
  mdb: 'database',

  // Config
  json: 'config',
  yaml: 'config',
  yml: 'config',
  toml: 'config',
  xml: 'config',
  ini: 'config',
  env: 'config',
  conf: 'config',
  config: 'config',
};

/**
 * Get file type from extension
 */
export function getFileType(filename: string): FileType {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return EXTENSION_TYPE_MAP[ext] || 'unknown';
}
