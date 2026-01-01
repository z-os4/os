/**
 * Default File Associations
 *
 * Built-in associations for common file types and URL schemes.
 */

import type { FileAssociation, UrlSchemeHandler } from './types';

/**
 * Default file type associations.
 * Maps common file extensions to built-in zOS apps.
 */
export const DEFAULT_FILE_ASSOCIATIONS: FileAssociation[] = [
  // Images
  {
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico', '.tiff', '.tif'],
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp', 'image/x-icon', 'image/tiff'],
    appId: 'photos',
    role: 'viewer',
    description: 'Image files',
  },

  // Documents - Text
  {
    extensions: ['.txt', '.text'],
    mimeTypes: ['text/plain'],
    appId: 'textedit',
    role: 'editor',
    description: 'Plain text files',
  },
  {
    extensions: ['.md', '.markdown'],
    mimeTypes: ['text/markdown'],
    appId: 'textedit',
    role: 'editor',
    description: 'Markdown documents',
  },
  {
    extensions: ['.rtf'],
    mimeTypes: ['application/rtf', 'text/rtf'],
    appId: 'textedit',
    role: 'editor',
    description: 'Rich text documents',
  },

  // Documents - PDF
  {
    extensions: ['.pdf'],
    mimeTypes: ['application/pdf'],
    appId: 'preview',
    role: 'viewer',
    description: 'PDF documents',
  },

  // Code - JavaScript/TypeScript
  {
    extensions: ['.js', '.mjs', '.cjs'],
    mimeTypes: ['application/javascript', 'text/javascript'],
    appId: 'textedit',
    role: 'editor',
    description: 'JavaScript files',
  },
  {
    extensions: ['.ts', '.mts', '.cts'],
    mimeTypes: ['application/typescript', 'text/typescript'],
    appId: 'textedit',
    role: 'editor',
    description: 'TypeScript files',
  },
  {
    extensions: ['.jsx', '.tsx'],
    mimeTypes: ['text/jsx', 'text/tsx'],
    appId: 'textedit',
    role: 'editor',
    description: 'React component files',
  },

  // Code - Web
  {
    extensions: ['.html', '.htm'],
    mimeTypes: ['text/html'],
    appId: 'textedit',
    role: 'editor',
    description: 'HTML files',
  },
  {
    extensions: ['.css'],
    mimeTypes: ['text/css'],
    appId: 'textedit',
    role: 'editor',
    description: 'CSS stylesheets',
  },
  {
    extensions: ['.scss', '.sass', '.less'],
    mimeTypes: ['text/x-scss', 'text/x-sass', 'text/x-less'],
    appId: 'textedit',
    role: 'editor',
    description: 'CSS preprocessor files',
  },

  // Code - Data
  {
    extensions: ['.json'],
    mimeTypes: ['application/json'],
    appId: 'textedit',
    role: 'editor',
    description: 'JSON files',
  },
  {
    extensions: ['.yaml', '.yml'],
    mimeTypes: ['application/x-yaml', 'text/yaml'],
    appId: 'textedit',
    role: 'editor',
    description: 'YAML files',
  },
  {
    extensions: ['.xml'],
    mimeTypes: ['application/xml', 'text/xml'],
    appId: 'textedit',
    role: 'editor',
    description: 'XML files',
  },
  {
    extensions: ['.toml'],
    mimeTypes: ['application/toml'],
    appId: 'textedit',
    role: 'editor',
    description: 'TOML configuration files',
  },

  // Code - Other languages
  {
    extensions: ['.py', '.pyw'],
    mimeTypes: ['text/x-python'],
    appId: 'textedit',
    role: 'editor',
    description: 'Python files',
  },
  {
    extensions: ['.go'],
    mimeTypes: ['text/x-go'],
    appId: 'textedit',
    role: 'editor',
    description: 'Go files',
  },
  {
    extensions: ['.rs'],
    mimeTypes: ['text/x-rust'],
    appId: 'textedit',
    role: 'editor',
    description: 'Rust files',
  },
  {
    extensions: ['.c', '.h'],
    mimeTypes: ['text/x-c'],
    appId: 'textedit',
    role: 'editor',
    description: 'C files',
  },
  {
    extensions: ['.cpp', '.hpp', '.cc', '.cxx'],
    mimeTypes: ['text/x-c++'],
    appId: 'textedit',
    role: 'editor',
    description: 'C++ files',
  },
  {
    extensions: ['.java'],
    mimeTypes: ['text/x-java'],
    appId: 'textedit',
    role: 'editor',
    description: 'Java files',
  },
  {
    extensions: ['.rb'],
    mimeTypes: ['text/x-ruby'],
    appId: 'textedit',
    role: 'editor',
    description: 'Ruby files',
  },
  {
    extensions: ['.php'],
    mimeTypes: ['text/x-php'],
    appId: 'textedit',
    role: 'editor',
    description: 'PHP files',
  },
  {
    extensions: ['.sh', '.bash', '.zsh'],
    mimeTypes: ['application/x-sh', 'text/x-shellscript'],
    appId: 'textedit',
    role: 'editor',
    description: 'Shell scripts',
  },
  {
    extensions: ['.sql'],
    mimeTypes: ['application/sql', 'text/x-sql'],
    appId: 'textedit',
    role: 'editor',
    description: 'SQL files',
  },

  // Audio
  {
    extensions: ['.mp3'],
    mimeTypes: ['audio/mpeg'],
    appId: 'music',
    role: 'default',
    description: 'MP3 audio',
  },
  {
    extensions: ['.wav'],
    mimeTypes: ['audio/wav', 'audio/x-wav'],
    appId: 'music',
    role: 'default',
    description: 'WAV audio',
  },
  {
    extensions: ['.aac'],
    mimeTypes: ['audio/aac'],
    appId: 'music',
    role: 'default',
    description: 'AAC audio',
  },
  {
    extensions: ['.flac'],
    mimeTypes: ['audio/flac'],
    appId: 'music',
    role: 'default',
    description: 'FLAC audio',
  },
  {
    extensions: ['.ogg', '.oga'],
    mimeTypes: ['audio/ogg'],
    appId: 'music',
    role: 'default',
    description: 'OGG audio',
  },
  {
    extensions: ['.m4a'],
    mimeTypes: ['audio/mp4', 'audio/x-m4a'],
    appId: 'music',
    role: 'default',
    description: 'M4A audio',
  },
  {
    extensions: ['.wma'],
    mimeTypes: ['audio/x-ms-wma'],
    appId: 'music',
    role: 'default',
    description: 'WMA audio',
  },

  // Video
  {
    extensions: ['.mp4', '.m4v'],
    mimeTypes: ['video/mp4'],
    appId: 'quicktime',
    role: 'default',
    description: 'MP4 video',
  },
  {
    extensions: ['.mov'],
    mimeTypes: ['video/quicktime'],
    appId: 'quicktime',
    role: 'default',
    description: 'QuickTime video',
  },
  {
    extensions: ['.avi'],
    mimeTypes: ['video/x-msvideo'],
    appId: 'quicktime',
    role: 'default',
    description: 'AVI video',
  },
  {
    extensions: ['.mkv'],
    mimeTypes: ['video/x-matroska'],
    appId: 'quicktime',
    role: 'default',
    description: 'MKV video',
  },
  {
    extensions: ['.webm'],
    mimeTypes: ['video/webm'],
    appId: 'quicktime',
    role: 'default',
    description: 'WebM video',
  },
  {
    extensions: ['.wmv'],
    mimeTypes: ['video/x-ms-wmv'],
    appId: 'quicktime',
    role: 'default',
    description: 'WMV video',
  },
  {
    extensions: ['.flv'],
    mimeTypes: ['video/x-flv'],
    appId: 'quicktime',
    role: 'default',
    description: 'FLV video',
  },
  {
    extensions: ['.ogv'],
    mimeTypes: ['video/ogg'],
    appId: 'quicktime',
    role: 'default',
    description: 'OGG video',
  },

  // Archives
  {
    extensions: ['.zip'],
    mimeTypes: ['application/zip'],
    appId: 'archive-utility',
    role: 'default',
    description: 'ZIP archive',
  },
  {
    extensions: ['.tar'],
    mimeTypes: ['application/x-tar'],
    appId: 'archive-utility',
    role: 'default',
    description: 'TAR archive',
  },
  {
    extensions: ['.gz', '.gzip'],
    mimeTypes: ['application/gzip'],
    appId: 'archive-utility',
    role: 'default',
    description: 'GZIP archive',
  },
  {
    extensions: ['.tar.gz', '.tgz'],
    mimeTypes: ['application/x-gzip'],
    appId: 'archive-utility',
    role: 'default',
    description: 'Compressed TAR archive',
  },
  {
    extensions: ['.7z'],
    mimeTypes: ['application/x-7z-compressed'],
    appId: 'archive-utility',
    role: 'default',
    description: '7-Zip archive',
  },
  {
    extensions: ['.rar'],
    mimeTypes: ['application/x-rar-compressed', 'application/vnd.rar'],
    appId: 'archive-utility',
    role: 'default',
    description: 'RAR archive',
  },
  {
    extensions: ['.bz2'],
    mimeTypes: ['application/x-bzip2'],
    appId: 'archive-utility',
    role: 'default',
    description: 'BZIP2 archive',
  },
  {
    extensions: ['.xz'],
    mimeTypes: ['application/x-xz'],
    appId: 'archive-utility',
    role: 'default',
    description: 'XZ archive',
  },

  // Config files
  {
    extensions: ['.env', '.env.local', '.env.development', '.env.production'],
    appId: 'textedit',
    role: 'editor',
    description: 'Environment files',
  },
  {
    extensions: ['.gitignore', '.gitattributes', '.gitmodules'],
    appId: 'textedit',
    role: 'editor',
    description: 'Git configuration files',
  },
  {
    extensions: ['.dockerignore', '.editorconfig', '.prettierrc', '.eslintrc'],
    appId: 'textedit',
    role: 'editor',
    description: 'Configuration files',
  },

  // Miscellaneous
  {
    extensions: ['.log'],
    mimeTypes: ['text/plain'],
    appId: 'textedit',
    role: 'viewer',
    description: 'Log files',
  },
  {
    extensions: ['.csv'],
    mimeTypes: ['text/csv'],
    appId: 'textedit',
    role: 'editor',
    description: 'CSV files',
  },
];

/**
 * Default URL scheme handlers.
 * Maps URL schemes to built-in zOS apps.
 */
export const DEFAULT_URL_SCHEMES: UrlSchemeHandler[] = [
  {
    scheme: 'http',
    appId: 'safari',
    description: 'HTTP URLs',
  },
  {
    scheme: 'https',
    appId: 'safari',
    description: 'HTTPS URLs',
  },
  {
    scheme: 'mailto',
    appId: 'mail',
    description: 'Email addresses',
  },
  {
    scheme: 'tel',
    appId: 'facetime',
    description: 'Phone numbers',
  },
  {
    scheme: 'sms',
    appId: 'messages',
    description: 'SMS messages',
  },
  {
    scheme: 'zos',
    appId: 'system',
    description: 'zOS internal URLs',
  },
  {
    scheme: 'file',
    appId: 'finder',
    description: 'Local file paths',
  },
];

/**
 * File extension sets for quick type checking.
 */
export const FILE_TYPE_EXTENSIONS = {
  image: new Set([
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico', '.tiff', '.tif',
  ]),
  video: new Set([
    '.mp4', '.m4v', '.mov', '.avi', '.mkv', '.webm', '.wmv', '.flv', '.ogv',
  ]),
  audio: new Set([
    '.mp3', '.wav', '.aac', '.flac', '.ogg', '.oga', '.m4a', '.wma',
  ]),
  document: new Set([
    '.txt', '.text', '.md', '.markdown', '.rtf', '.pdf', '.doc', '.docx',
    '.xls', '.xlsx', '.ppt', '.pptx', '.odt', '.ods', '.odp',
  ]),
  code: new Set([
    '.js', '.mjs', '.cjs', '.ts', '.mts', '.cts', '.jsx', '.tsx',
    '.html', '.htm', '.css', '.scss', '.sass', '.less',
    '.json', '.yaml', '.yml', '.xml', '.toml',
    '.py', '.pyw', '.go', '.rs', '.c', '.h', '.cpp', '.hpp', '.cc', '.cxx',
    '.java', '.rb', '.php', '.sh', '.bash', '.zsh', '.sql',
  ]),
  archive: new Set([
    '.zip', '.tar', '.gz', '.gzip', '.tar.gz', '.tgz', '.7z', '.rar', '.bz2', '.xz',
  ]),
};
