import React, { useState, useRef, useEffect } from 'react';
import { ZWindow } from '@z-os/ui';

interface TerminalWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

interface FileNode {
  type: 'file' | 'dir';
  content?: string;
  permissions?: string;
  owner?: string;
  group?: string;
  size?: number;
  modified?: Date;
}

// Virtual file system with content
const createFS = (): Record<string, FileNode> => ({
  '/': { type: 'dir', permissions: 'drwxr-xr-x', owner: 'root', group: 'wheel' },
  '/Users': { type: 'dir', permissions: 'drwxr-xr-x', owner: 'root', group: 'wheel' },
  '/Users/user': { type: 'dir', permissions: 'drwxr-xr-x', owner: 'user', group: 'staff' },
  '/Users/user/Desktop': { type: 'dir', permissions: 'drwxr-xr-x', owner: 'user', group: 'staff' },
  '/Users/user/Desktop/README.txt': {
    type: 'file',
    content: 'Welcome to zOS!\n\nThis is a simulated macOS-style desktop environment.\nBuilt with React and TypeScript.\n\nEnjoy exploring!',
    permissions: '-rw-r--r--', owner: 'user', group: 'staff', size: 142
  },
  '/Users/user/Documents': { type: 'dir', permissions: 'drwxr-xr-x', owner: 'user', group: 'staff' },
  '/Users/user/Documents/notes.md': {
    type: 'file',
    content: '# Notes\n\n## TODO\n- Build zOS\n- Add more features\n- Ship it!\n\n## Ideas\n- Virtual file system\n- More apps\n- Cloud sync',
    permissions: '-rw-r--r--', owner: 'user', group: 'staff', size: 128
  },
  '/Users/user/Documents/projects': { type: 'dir', permissions: 'drwxr-xr-x', owner: 'user', group: 'staff' },
  '/Users/user/Documents/projects/zos': { type: 'dir', permissions: 'drwxr-xr-x', owner: 'user', group: 'staff' },
  '/Users/user/Documents/projects/hanzo': { type: 'dir', permissions: 'drwxr-xr-x', owner: 'user', group: 'staff' },
  '/Users/user/Documents/projects/lux': { type: 'dir', permissions: 'drwxr-xr-x', owner: 'user', group: 'staff' },
  '/Users/user/Downloads': { type: 'dir', permissions: 'drwxr-xr-x', owner: 'user', group: 'staff' },
  '/Users/user/Music': { type: 'dir', permissions: 'drwxr-xr-x', owner: 'user', group: 'staff' },
  '/Users/user/Music/playlist.m3u': {
    type: 'file',
    content: '#EXTM3U\n#EXTINF:180,Track 1\ntrack1.mp3\n#EXTINF:240,Track 2\ntrack2.mp3',
    permissions: '-rw-r--r--', owner: 'user', group: 'staff', size: 89
  },
  '/Users/user/Pictures': { type: 'dir', permissions: 'drwxr-xr-x', owner: 'user', group: 'staff' },
  '/Users/user/Pictures/wallpaper.png': { type: 'file', content: '[binary image data]', permissions: '-rw-r--r--', owner: 'user', group: 'staff', size: 2048576 },
  '/Users/user/Pictures/screenshot.png': { type: 'file', content: '[binary image data]', permissions: '-rw-r--r--', owner: 'user', group: 'staff', size: 1024000 },
  '/Users/user/Videos': { type: 'dir', permissions: 'drwxr-xr-x', owner: 'user', group: 'staff' },
  '/Users/user/.zshrc': {
    type: 'file',
    content: '# zOS zshrc\nexport PATH="/usr/local/bin:$PATH"\nexport EDITOR=vim\nalias ll="ls -la"\nalias la="ls -a"\nalias l="ls -CF"\n\n# Prompt\nPS1="%n@%m:%~$ "',
    permissions: '-rw-r--r--', owner: 'user', group: 'staff', size: 186
  },
  '/Users/user/.bashrc': {
    type: 'file',
    content: '# zOS bashrc\nexport PATH="/usr/local/bin:$PATH"\nalias ll="ls -la"',
    permissions: '-rw-r--r--', owner: 'user', group: 'staff', size: 78
  },
  '/Users/user/.profile': {
    type: 'file',
    content: '# zOS profile\n[ -f ~/.zshrc ] && source ~/.zshrc',
    permissions: '-rw-r--r--', owner: 'user', group: 'staff', size: 52
  },
  '/Applications': { type: 'dir', permissions: 'drwxr-xr-x', owner: 'root', group: 'admin' },
  '/Applications/Safari.app': { type: 'dir', permissions: 'drwxr-xr-x', owner: 'root', group: 'wheel' },
  '/Applications/Terminal.app': { type: 'dir', permissions: 'drwxr-xr-x', owner: 'root', group: 'wheel' },
  '/Applications/Finder.app': { type: 'dir', permissions: 'drwxr-xr-x', owner: 'root', group: 'wheel' },
  '/Applications/Mail.app': { type: 'dir', permissions: 'drwxr-xr-x', owner: 'root', group: 'wheel' },
  '/System': { type: 'dir', permissions: 'drwxr-xr-x', owner: 'root', group: 'wheel' },
  '/System/Library': { type: 'dir', permissions: 'drwxr-xr-x', owner: 'root', group: 'wheel' },
  '/Library': { type: 'dir', permissions: 'drwxr-xr-x', owner: 'root', group: 'wheel' },
  '/Library/Preferences': { type: 'dir', permissions: 'drwxr-xr-x', owner: 'root', group: 'wheel' },
  '/bin': { type: 'dir', permissions: 'drwxr-xr-x', owner: 'root', group: 'wheel' },
  '/bin/ls': { type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'wheel', size: 51856 },
  '/bin/cat': { type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'wheel', size: 23648 },
  '/bin/echo': { type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'wheel', size: 14432 },
  '/bin/pwd': { type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'wheel', size: 14416 },
  '/bin/cd': { type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'wheel', size: 14400 },
  '/bin/mkdir': { type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'wheel', size: 18528 },
  '/bin/rm': { type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'wheel', size: 18560 },
  '/bin/cp': { type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'wheel', size: 26752 },
  '/bin/mv': { type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'wheel', size: 26736 },
  '/bin/zsh': { type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'wheel', size: 1296464 },
  '/bin/bash': { type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'wheel', size: 1296464 },
  '/usr': { type: 'dir', permissions: 'drwxr-xr-x', owner: 'root', group: 'wheel' },
  '/usr/bin': { type: 'dir', permissions: 'drwxr-xr-x', owner: 'root', group: 'wheel' },
  '/usr/bin/vim': { type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'wheel', size: 3145728 },
  '/usr/bin/grep': { type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'wheel', size: 163024 },
  '/usr/bin/find': { type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'wheel', size: 108800 },
  '/usr/bin/which': { type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'wheel', size: 14416 },
  '/usr/local': { type: 'dir', permissions: 'drwxr-xr-x', owner: 'root', group: 'wheel' },
  '/usr/local/bin': { type: 'dir', permissions: 'drwxr-xr-x', owner: 'root', group: 'wheel' },
  '/etc': { type: 'dir', permissions: 'drwxr-xr-x', owner: 'root', group: 'wheel' },
  '/etc/hosts': {
    type: 'file',
    content: '##\n# Host Database\n##\n127.0.0.1\tlocalhost\n255.255.255.255\tbroadcasthost\n::1\tlocalhost',
    permissions: '-rw-r--r--', owner: 'root', group: 'wheel', size: 89
  },
  '/etc/passwd': {
    type: 'file',
    content: 'root:*:0:0:System Administrator:/var/root:/bin/zsh\nuser:*:501:20:User:/Users/user:/bin/zsh',
    permissions: '-rw-r--r--', owner: 'root', group: 'wheel', size: 94
  },
  '/etc/shells': {
    type: 'file',
    content: '/bin/bash\n/bin/zsh\n/bin/sh',
    permissions: '-rw-r--r--', owner: 'root', group: 'wheel', size: 27
  },
  '/tmp': { type: 'dir', permissions: 'drwxrwxrwt', owner: 'root', group: 'wheel' },
  '/var': { type: 'dir', permissions: 'drwxr-xr-x', owner: 'root', group: 'wheel' },
  '/var/log': { type: 'dir', permissions: 'drwxr-xr-x', owner: 'root', group: 'wheel' },
  '/var/log/system.log': {
    type: 'file',
    content: 'Dec 25 10:00:00 zos kernel[0]: zOS initialized\nDec 25 10:00:01 zos kernel[0]: All systems operational',
    permissions: '-rw-r-----', owner: 'root', group: 'wheel', size: 104
  },
  '/dev': { type: 'dir', permissions: 'drwxr-xr-x', owner: 'root', group: 'wheel' },
  '/dev/null': { type: 'file', permissions: 'crw-rw-rw-', owner: 'root', group: 'wheel', size: 0 },
  '/dev/zero': { type: 'file', permissions: 'crw-rw-rw-', owner: 'root', group: 'wheel', size: 0 },
  '/dev/random': { type: 'file', permissions: 'crw-rw-rw-', owner: 'root', group: 'wheel', size: 0 },
  '/proc': { type: 'dir', permissions: 'dr-xr-xr-x', owner: 'root', group: 'wheel' },
});

// Environment variables
const defaultEnv: Record<string, string> = {
  HOME: '/Users/user',
  USER: 'user',
  SHELL: '/bin/zsh',
  PATH: '/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin',
  PWD: '/Users/user',
  TERM: 'xterm-256color',
  LANG: 'en_US.UTF-8',
  EDITOR: 'vim',
  HOSTNAME: 'zos.local',
  LOGNAME: 'user',
  TMPDIR: '/tmp',
  PS1: '%n@%m:%~$ ',
};

// Aliases
const defaultAliases: Record<string, string> = {
  'll': 'ls -la',
  'la': 'ls -a',
  'l': 'ls -CF',
  '..': 'cd ..',
  '...': 'cd ../..',
  'cls': 'clear',
  'h': 'history',
  'md': 'mkdir',
  'rd': 'rmdir',
};

const resolvePath = (currentDir: string, path: string): string => {
  if (!path) return currentDir;

  // Handle ~ expansion
  if (path === '~') return '/Users/user';
  if (path.startsWith('~/')) return '/Users/user' + path.slice(1);

  if (path === '/') return '/';
  if (path.startsWith('/')) return path.replace(/\/+$/, '') || '/';

  const parts = currentDir.split('/').filter(Boolean);
  const pathParts = path.split('/');

  for (const part of pathParts) {
    if (part === '..') {
      parts.pop();
    } else if (part !== '.' && part !== '') {
      parts.push(part);
    }
  }

  return '/' + parts.join('/') || '/';
};

const getPromptPath = (cwd: string): string => {
  if (cwd === '/Users/user') return '~';
  if (cwd.startsWith('/Users/user/')) return '~' + cwd.slice(11);
  return cwd;
};

const formatSize = (size: number): string => {
  if (size >= 1073741824) return (size / 1073741824).toFixed(1) + 'G';
  if (size >= 1048576) return (size / 1048576).toFixed(1) + 'M';
  if (size >= 1024) return (size / 1024).toFixed(1) + 'K';
  return size.toString();
};

const getChildren = (fs: Record<string, FileNode>, path: string): string[] => {
  const prefix = path === '/' ? '/' : path + '/';
  const children: string[] = [];

  for (const p of Object.keys(fs)) {
    if (p === path) continue;
    if (p.startsWith(prefix)) {
      const rest = p.slice(prefix.length);
      if (!rest.includes('/')) {
        children.push(rest);
      }
    }
  }

  return children.sort();
};

const TerminalWindow: React.FC<TerminalWindowProps> = ({ onClose, onFocus }) => {
  const [history, setHistory] = useState<Array<{ command: string; output: string; cwd?: string }>>([
    { command: '', output: 'Welcome to zOS Terminal v1.0\nType "help" for available commands.\n' }
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [cwd, setCwd] = useState('/Users/user');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [env, setEnv] = useState<Record<string, string>>(defaultEnv);
  const [aliases, setAliases] = useState<Record<string, string>>(defaultAliases);
  const [fs, setFs] = useState<Record<string, FileNode>>(createFS);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startTime = useRef(Date.now());

  const executeCommand = (rawCmd: string) => {
    const trimmedCmd = rawCmd.trim();
    if (!trimmedCmd) return;

    // Add to command history
    setCommandHistory(prev => [...prev, rawCmd]);
    setHistoryIndex(-1);

    // Handle command chaining with && and ;
    // Split on && first, then on ;
    const chainedCommands: { cmd: string; requireSuccess: boolean }[] = [];

    // Split by && (requires previous success) and ; (always runs)
    let remaining = trimmedCmd;
    let lastSeparator = ''; // Track the separator that preceded this command

    while (remaining) {
      const andIndex = remaining.indexOf('&&');
      const semicolonIndex = remaining.indexOf(';');

      let splitIndex = -1;
      let separator = '';

      if (andIndex !== -1 && (semicolonIndex === -1 || andIndex < semicolonIndex)) {
        splitIndex = andIndex;
        separator = '&&';
      } else if (semicolonIndex !== -1) {
        splitIndex = semicolonIndex;
        separator = ';';
      }

      if (splitIndex !== -1) {
        const cmd = remaining.slice(0, splitIndex).trim();
        if (cmd) {
          // requireSuccess is true if the PREVIOUS separator was &&
          chainedCommands.push({ cmd, requireSuccess: lastSeparator === '&&' });
        }
        lastSeparator = separator;
        remaining = remaining.slice(splitIndex + separator.length);
      } else {
        if (remaining.trim()) {
          // Last command: requireSuccess based on the separator before it
          chainedCommands.push({ cmd: remaining.trim(), requireSuccess: lastSeparator === '&&' });
        }
        break;
      }
    }

    // Execute chained commands
    const outputs: string[] = [];
    let lastSuccess = true;

    for (const { cmd: cmdStr, requireSuccess } of chainedCommands) {
      if (requireSuccess && !lastSuccess) {
        break; // Stop if previous command failed and this requires success
      }
      
      const result = executeSingleCommand(cmdStr);
      if (result.output) outputs.push(result.output);
      lastSuccess = result.success;
      
      if (result.clear) {
        setHistory([]);
        return;
      }
    }

    const output = outputs.join('\n');
    setHistory(prev => [...prev, { command: rawCmd, output, cwd }]);
    setCurrentInput('');
  };

  const executeSingleCommand = (rawCmd: string): { output: string; success: boolean; clear?: boolean } => {
    let cmd = rawCmd.trim();
    if (!cmd) return { output: '', success: true };

    // Expand aliases
    const firstWord = cmd.split(/\s+/)[0];
    if (aliases[firstWord]) {
      cmd = aliases[firstWord] + cmd.slice(firstWord.length);
    }

    // Expand environment variables
    cmd = cmd.replace(/\$(\w+)/g, (_, name) => env[name] || '');
    cmd = cmd.replace(/\$\{(\w+)\}/g, (_, name) => env[name] || '');

    const parts = cmd.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
    const command = (parts[0] || '').toLowerCase();
    const args = parts.slice(1).map(a => a.replace(/^["']|["']$/g, ''));
    let output = '';
    let success = true;

    // Parse flags
    const flags = new Set<string>();
    const nonFlagArgs: string[] = [];
    for (const arg of args) {
      if (arg.startsWith('--')) {
        flags.add(arg.slice(2));
      } else if (arg.startsWith('-') && arg.length > 1) {
        for (const char of arg.slice(1)) {
          flags.add(char);
        }
      } else {
        nonFlagArgs.push(arg);
      }
    }

    switch (command) {
      case 'help':
        output = `zOS Terminal - Available Commands:

FILE OPERATIONS:
  ls [path]       List directory contents (-l, -a, -h, -R)
  cd [path]       Change directory
  pwd             Print working directory
  cat [file]      Display file contents
  head [file]     Display first lines (-n N)
  tail [file]     Display last lines (-n N)
  less [file]     View file (alias for cat)
  touch [file]    Create empty file
  mkdir [dir]     Create directory (-p for parents)
  rm [file]       Remove file (-r for recursive, -f for force)
  rmdir [dir]     Remove empty directory
  cp [src] [dst]  Copy file
  mv [src] [dst]  Move/rename file
  ln [src] [dst]  Create link (-s for symbolic)
  chmod [mode] [file]  Change permissions (simulated)
  chown [owner] [file] Change owner (simulated)

TEXT PROCESSING:
  echo [text]     Print text
  grep [pattern] [file]  Search for pattern
  wc [file]       Word/line/char count (-l, -w, -c)
  sort [file]     Sort lines
  uniq [file]     Remove duplicates
  tr [a] [b]      Translate characters
  cut [options]   Cut fields (-d delimiter, -f fields)
  sed [expr]      Stream editor (basic)
  awk [program]   Pattern processing (basic)

SYSTEM:
  whoami          Current username
  id              User/group IDs
  hostname        System hostname
  uname [-a]      System information
  date            Current date/time
  uptime          System uptime
  df [-h]         Disk space
  du [path]       Directory size
  ps              Process list
  top             Process monitor (snapshot)
  kill [pid]      Kill process (simulated)
  which [cmd]     Locate command
  type [cmd]      Command type
  man [cmd]       Manual page
  history         Command history

ENVIRONMENT:
  env             Show environment
  export [VAR=val] Set environment variable
  unset [VAR]     Unset variable
  alias [name=cmd] Set alias
  unalias [name]  Remove alias
  set             Show all variables
  source [file]   Execute file

SHELL:
  clear           Clear screen
  exit            Exit shell
  true            Return success
  false           Return failure
  test [expr]     Evaluate expression
  [ expr ]        Test alias
  sleep [n]       Sleep seconds (simulated)

MISC:
  neofetch        System info display
  cowsay [text]   ASCII cow
  fortune         Random quote
  cal             Calendar
  bc              Calculator
`;
        break;

      case 'clear':
        return { output: '', success: true, clear: true };

      case 'exit':
        output = 'logout\n[Process completed]';
        break;

      case 'pwd':
        output = cwd;
        break;

      case 'cd': {
        const target = nonFlagArgs[0] || '~';
        const newPath = resolvePath(cwd, target);
        const node = fs[newPath];

        if (!node) {
          output = `cd: no such file or directory: ${target}`;
          success = false;
        } else if (node.type !== 'dir') {
          output = `cd: not a directory: ${target}`;
          success = false;
        } else {
          setCwd(newPath);
          setEnv(prev => ({ ...prev, PWD: newPath, OLDPWD: cwd }));
          output = '';
        }
        break;
      }

      case 'ls': {
        const targetPath = nonFlagArgs[0] ? resolvePath(cwd, nonFlagArgs[0]) : cwd;
        const node = fs[targetPath];

        if (!node) {
          output = `ls: cannot access '${nonFlagArgs[0] || targetPath}': No such file or directory`;
        } else if (node.type === 'file') {
          output = nonFlagArgs[0] || targetPath.split('/').pop() || '';
        } else {
          let children = getChildren(fs, targetPath);

          // Filter hidden files unless -a flag
          if (!flags.has('a') && !flags.has('all')) {
            children = children.filter(c => !c.startsWith('.'));
          }

          if (flags.has('l')) {
            // Long format
            const lines = children.map(name => {
              const childPath = targetPath === '/' ? '/' + name : targetPath + '/' + name;
              const child = fs[childPath];
              if (!child) return '';
              const perms = child.permissions || (child.type === 'dir' ? 'drwxr-xr-x' : '-rw-r--r--');
              const owner = child.owner || 'user';
              const group = child.group || 'staff';
              const size = flags.has('h') ? formatSize(child.size || 0) : (child.size || 0).toString();
              const date = 'Dec 25 10:00';
              return `${perms}  1 ${owner.padEnd(6)} ${group.padEnd(6)} ${size.padStart(8)} ${date} ${name}`;
            });
            output = lines.join('\n');
          } else {
            output = children.join('  ');
          }
        }
        break;
      }

      case 'cat': {
        if (!nonFlagArgs[0]) {
          output = 'cat: missing file operand';
        } else {
          const outputs: string[] = [];
          for (const arg of nonFlagArgs) {
            const path = resolvePath(cwd, arg);
            const node = fs[path];
            if (!node) {
              outputs.push(`cat: ${arg}: No such file or directory`);
            } else if (node.type === 'dir') {
              outputs.push(`cat: ${arg}: Is a directory`);
            } else {
              outputs.push(node.content || '');
            }
          }
          output = outputs.join('\n');
        }
        break;
      }

      case 'head': {
        const n = flags.has('n') ? parseInt(nonFlagArgs[0]) || 10 : 10;
        const file = flags.has('n') ? nonFlagArgs[1] : nonFlagArgs[0];
        if (!file) {
          output = 'head: missing file operand';
        } else {
          const path = resolvePath(cwd, file);
          const node = fs[path];
          if (!node) {
            output = `head: ${file}: No such file or directory`;
          } else if (node.type === 'dir') {
            output = `head: ${file}: Is a directory`;
          } else {
            const lines = (node.content || '').split('\n');
            output = lines.slice(0, n).join('\n');
          }
        }
        break;
      }

      case 'tail': {
        const n = flags.has('n') ? parseInt(nonFlagArgs[0]) || 10 : 10;
        const file = flags.has('n') ? nonFlagArgs[1] : nonFlagArgs[0];
        if (!file) {
          output = 'tail: missing file operand';
        } else {
          const path = resolvePath(cwd, file);
          const node = fs[path];
          if (!node) {
            output = `tail: ${file}: No such file or directory`;
          } else if (node.type === 'dir') {
            output = `tail: ${file}: Is a directory`;
          } else {
            const lines = (node.content || '').split('\n');
            output = lines.slice(-n).join('\n');
          }
        }
        break;
      }

      case 'less':
      case 'more': {
        const file = nonFlagArgs[0];
        if (!file) {
          output = `${command}: missing file operand`;
        } else {
          const path = resolvePath(cwd, file);
          const node = fs[path];
          if (!node) {
            output = `${command}: ${file}: No such file or directory`;
          } else if (node.type === 'dir') {
            output = `${command}: ${file}: Is a directory`;
          } else {
            output = node.content || '';
          }
        }
        break;
      }

      case 'touch': {
        if (!nonFlagArgs[0]) {
          output = 'touch: missing file operand';
        } else {
          for (const arg of nonFlagArgs) {
            const path = resolvePath(cwd, arg);
            if (!fs[path]) {
              setFs(prev => ({
                ...prev,
                [path]: { type: 'file', content: '', permissions: '-rw-r--r--', owner: 'user', group: 'staff', size: 0 }
              }));
            }
          }
          output = '';
        }
        break;
      }

      case 'mkdir': {
        if (!nonFlagArgs[0]) {
          output = 'mkdir: missing operand';
        } else {
          const results: string[] = [];
          for (const arg of nonFlagArgs) {
            const path = resolvePath(cwd, arg);
            if (fs[path]) {
              results.push(`mkdir: ${arg}: File exists`);
            } else {
              // Check parent exists (unless -p flag)
              const parent = path.split('/').slice(0, -1).join('/') || '/';
              if (!flags.has('p') && !fs[parent]) {
                results.push(`mkdir: ${arg}: No such file or directory`);
              } else {
                setFs(prev => ({
                  ...prev,
                  [path]: { type: 'dir', permissions: 'drwxr-xr-x', owner: 'user', group: 'staff' }
                }));
              }
            }
          }
          output = results.join('\n');
        }
        break;
      }

      case 'rm': {
        if (!nonFlagArgs[0]) {
          output = 'rm: missing operand';
        } else {
          const results: string[] = [];
          for (const arg of nonFlagArgs) {
            const path = resolvePath(cwd, arg);
            const node = fs[path];
            if (!node) {
              if (!flags.has('f')) {
                results.push(`rm: ${arg}: No such file or directory`);
              }
            } else if (node.type === 'dir' && !flags.has('r') && !flags.has('R')) {
              results.push(`rm: ${arg}: is a directory`);
            } else {
              setFs(prev => {
                const newFs = { ...prev };
                delete newFs[path];
                // If recursive, delete children too
                if (flags.has('r') || flags.has('R')) {
                  for (const p of Object.keys(newFs)) {
                    if (p.startsWith(path + '/')) {
                      delete newFs[p];
                    }
                  }
                }
                return newFs;
              });
            }
          }
          output = results.join('\n');
        }
        break;
      }

      case 'rmdir': {
        if (!nonFlagArgs[0]) {
          output = 'rmdir: missing operand';
        } else {
          const results: string[] = [];
          for (const arg of nonFlagArgs) {
            const path = resolvePath(cwd, arg);
            const node = fs[path];
            if (!node) {
              results.push(`rmdir: ${arg}: No such file or directory`);
            } else if (node.type !== 'dir') {
              results.push(`rmdir: ${arg}: Not a directory`);
            } else if (getChildren(fs, path).length > 0) {
              results.push(`rmdir: ${arg}: Directory not empty`);
            } else {
              setFs(prev => {
                const newFs = { ...prev };
                delete newFs[path];
                return newFs;
              });
            }
          }
          output = results.join('\n');
        }
        break;
      }

      case 'cp': {
        if (nonFlagArgs.length < 2) {
          output = 'cp: missing destination file operand';
        } else {
          const src = resolvePath(cwd, nonFlagArgs[0]);
          const dst = resolvePath(cwd, nonFlagArgs[1]);
          const srcNode = fs[src];
          if (!srcNode) {
            output = `cp: ${nonFlagArgs[0]}: No such file or directory`;
          } else if (srcNode.type === 'dir' && !flags.has('r') && !flags.has('R')) {
            output = `cp: ${nonFlagArgs[0]}: is a directory (not copied)`;
          } else {
            setFs(prev => ({
              ...prev,
              [dst]: { ...srcNode }
            }));
            output = '';
          }
        }
        break;
      }

      case 'mv': {
        if (nonFlagArgs.length < 2) {
          output = 'mv: missing destination file operand';
        } else {
          const src = resolvePath(cwd, nonFlagArgs[0]);
          const dst = resolvePath(cwd, nonFlagArgs[1]);
          const srcNode = fs[src];
          if (!srcNode) {
            output = `mv: ${nonFlagArgs[0]}: No such file or directory`;
          } else {
            setFs(prev => {
              const newFs = { ...prev };
              newFs[dst] = srcNode;
              delete newFs[src];
              return newFs;
            });
            output = '';
          }
        }
        break;
      }

      case 'ln': {
        if (nonFlagArgs.length < 2) {
          output = 'ln: missing destination file operand';
        } else {
          const src = resolvePath(cwd, nonFlagArgs[0]);
          const dst = resolvePath(cwd, nonFlagArgs[1]);
          if (!fs[src]) {
            output = `ln: ${nonFlagArgs[0]}: No such file or directory`;
          } else {
            const linkType = flags.has('s') ? 'symbolic link' : 'hard link';
            output = `ln: created ${linkType} '${nonFlagArgs[1]}' -> '${nonFlagArgs[0]}' (simulated)`;
          }
        }
        break;
      }

      case 'chmod':
        if (nonFlagArgs.length < 2) {
          output = 'chmod: missing operand';
        } else {
          output = `chmod: mode of '${nonFlagArgs[1]}' changed to ${nonFlagArgs[0]} (simulated)`;
        }
        break;

      case 'chown':
        if (nonFlagArgs.length < 2) {
          output = 'chown: missing operand';
        } else {
          output = `chown: changing ownership of '${nonFlagArgs[1]}' to ${nonFlagArgs[0]} (simulated)`;
        }
        break;

      case 'echo':
        output = args.join(' ').replace(/\\n/g, '\n').replace(/\\t/g, '\t');
        break;

      case 'grep': {
        if (nonFlagArgs.length < 2) {
          output = 'grep: usage: grep [pattern] [file]';
        } else {
          const pattern = nonFlagArgs[0];
          const file = nonFlagArgs[1];
          const path = resolvePath(cwd, file);
          const node = fs[path];
          if (!node) {
            output = `grep: ${file}: No such file or directory`;
          } else if (node.type === 'dir') {
            output = `grep: ${file}: Is a directory`;
          } else {
            const lines = (node.content || '').split('\n');
            const regex = new RegExp(pattern, flags.has('i') ? 'i' : '');
            const matches = lines.filter(line => regex.test(line));
            if (flags.has('c')) {
              output = matches.length.toString();
            } else if (flags.has('n')) {
              output = matches.map((line, i) => `${lines.indexOf(line) + 1}:${line}`).join('\n');
            } else {
              output = matches.join('\n');
            }
          }
        }
        break;
      }

      case 'wc': {
        if (!nonFlagArgs[0]) {
          output = 'wc: missing file operand';
        } else {
          const path = resolvePath(cwd, nonFlagArgs[0]);
          const node = fs[path];
          if (!node) {
            output = `wc: ${nonFlagArgs[0]}: No such file or directory`;
          } else if (node.type === 'dir') {
            output = `wc: ${nonFlagArgs[0]}: Is a directory`;
          } else {
            const content = node.content || '';
            const lines = content.split('\n').length;
            const words = content.split(/\s+/).filter(Boolean).length;
            const chars = content.length;
            if (flags.has('l')) output = lines.toString();
            else if (flags.has('w')) output = words.toString();
            else if (flags.has('c')) output = chars.toString();
            else output = `  ${lines}  ${words}  ${chars} ${nonFlagArgs[0]}`;
          }
        }
        break;
      }

      case 'sort': {
        if (!nonFlagArgs[0]) {
          output = 'sort: missing file operand';
        } else {
          const path = resolvePath(cwd, nonFlagArgs[0]);
          const node = fs[path];
          if (!node) {
            output = `sort: ${nonFlagArgs[0]}: No such file or directory`;
          } else {
            const lines = (node.content || '').split('\n');
            const sorted = flags.has('r') ? lines.sort().reverse() : lines.sort();
            output = sorted.join('\n');
          }
        }
        break;
      }

      case 'uniq': {
        if (!nonFlagArgs[0]) {
          output = 'uniq: missing file operand';
        } else {
          const path = resolvePath(cwd, nonFlagArgs[0]);
          const node = fs[path];
          if (!node) {
            output = `uniq: ${nonFlagArgs[0]}: No such file or directory`;
          } else {
            const lines = (node.content || '').split('\n');
            const unique = lines.filter((line, i) => i === 0 || line !== lines[i - 1]);
            output = unique.join('\n');
          }
        }
        break;
      }

      case 'whoami':
        output = 'user';
        break;

      case 'id':
        output = 'uid=501(user) gid=20(staff) groups=20(staff),12(everyone),61(localaccounts)';
        break;

      case 'hostname':
        output = env.HOSTNAME || 'zos.local';
        break;

      case 'uname':
        if (flags.has('a')) {
          output = 'zOS Darwin 23.0.0 zOS Kernel Version 23.0.0 x86_64';
        } else if (flags.has('s')) {
          output = 'zOS';
        } else if (flags.has('r')) {
          output = '23.0.0';
        } else if (flags.has('m')) {
          output = 'x86_64';
        } else {
          output = 'zOS';
        }
        break;

      case 'date':
        if (flags.has('u')) {
          output = new Date().toUTCString();
        } else {
          output = new Date().toString();
        }
        break;

      case 'uptime': {
        const uptime = Math.floor((Date.now() - startTime.current) / 1000);
        const hours = Math.floor(uptime / 3600);
        const mins = Math.floor((uptime % 3600) / 60);
        output = ` ${new Date().toLocaleTimeString()}  up ${hours}:${mins.toString().padStart(2, '0')},  1 user,  load averages: 0.42 0.38 0.35`;
        break;
      }

      case 'df':
        if (flags.has('h')) {
          output = `Filesystem      Size   Used  Avail Capacity  Mounted on
/dev/disk1s1   500G   250G   250G    50%     /
/dev/disk1s2   500G   100G   400G    20%     /System/Volumes/Data`;
        } else {
          output = `Filesystem     1K-blocks      Used Available Capacity  Mounted on
/dev/disk1s1   524288000 262144000 262144000    50%     /
/dev/disk1s2   524288000 104857600 419430400    20%     /System/Volumes/Data`;
        }
        break;

      case 'du': {
        const path = nonFlagArgs[0] ? resolvePath(cwd, nonFlagArgs[0]) : cwd;
        const node = fs[path];
        if (!node) {
          output = `du: ${nonFlagArgs[0] || path}: No such file or directory`;
        } else {
          const size = flags.has('h') ? '4.0K' : '4';
          output = `${size}\t${path}`;
        }
        break;
      }

      case 'ps':
        output = `  PID TTY          TIME CMD
    1 ttys000  0:00.01 /sbin/launchd
  501 ttys000  0:00.05 -zsh
  502 ttys000  0:00.02 node
  503 ttys000  0:00.01 ps`;
        break;

      case 'top':
        output = `Processes: 128 total, 2 running, 126 sleeping, 512 threads
Load Avg: 0.42, 0.38, 0.35
CPU usage: 2.5% user, 1.2% sys, 96.3% idle
MemRegions: 98765 total
PhysMem: 8G used (2G wired), 8G unused
VM: 1.2T vsize, 1234M framework vsize
Networks: packets: 12345/6M in, 9876/4M out
Disks: 1234/50M read, 567/25M written

PID   COMMAND      %CPU TIME     MEM
1     launchd      0.0  0:00.01  2.0M
501   zsh          0.1  0:00.05  4.0M
502   node         1.2  0:00.02  128M`;
        break;

      case 'kill':
        if (!nonFlagArgs[0]) {
          output = 'kill: usage: kill [-s sigspec | -n signum | -sigspec] pid';
        } else {
          output = `kill: ${nonFlagArgs[0]}: process terminated (simulated)`;
        }
        break;

      case 'which': {
        if (!nonFlagArgs[0]) {
          output = '';
        } else {
          const cmd = nonFlagArgs[0];
          const paths = ['/bin', '/usr/bin', '/usr/local/bin'];
          let found = false;
          for (const p of paths) {
            const fullPath = `${p}/${cmd}`;
            if (fs[fullPath]) {
              output = fullPath;
              found = true;
              break;
            }
          }
          if (!found) {
            output = `${cmd} not found`;
          }
        }
        break;
      }

      case 'type': {
        if (!nonFlagArgs[0]) {
          output = '';
        } else {
          const cmd = nonFlagArgs[0];
          const builtins = ['cd', 'pwd', 'echo', 'export', 'alias', 'history', 'exit'];
          if (builtins.includes(cmd)) {
            output = `${cmd} is a shell builtin`;
          } else if (aliases[cmd]) {
            output = `${cmd} is aliased to '${aliases[cmd]}'`;
          } else {
            output = `${cmd} is /usr/bin/${cmd}`;
          }
        }
        break;
      }

      case 'man': {
        if (!nonFlagArgs[0]) {
          output = 'What manual page do you want?';
        } else {
          const cmd = nonFlagArgs[0];
          output = `${cmd.toUpperCase()}(1)                   User Commands                   ${cmd.toUpperCase()}(1)

NAME
       ${cmd} - ${cmd === 'ls' ? 'list directory contents' : cmd === 'cd' ? 'change directory' : cmd === 'cat' ? 'concatenate files' : 'command description'}

SYNOPSIS
       ${cmd} [OPTION]... [FILE]...

DESCRIPTION
       ${cmd === 'ls' ? 'List information about the FILEs (the current directory by default).' :
         cmd === 'cd' ? 'Change the shell working directory.' :
         cmd === 'cat' ? 'Concatenate FILE(s) to standard output.' :
         `Execute the ${cmd} command.`}

       For more information, try '${cmd} --help' or visit the online documentation.

zOS                            December 2024                   ${cmd.toUpperCase()}(1)`;
        }
        break;
      }

      case 'history':
        output = commandHistory.map((cmd, i) => `  ${(i + 1).toString().padStart(4)}  ${cmd}`).join('\n');
        break;

      case 'env':
        output = Object.entries(env).map(([k, v]) => `${k}=${v}`).join('\n');
        break;

      case 'export': {
        if (!nonFlagArgs[0]) {
          output = Object.entries(env).map(([k, v]) => `declare -x ${k}="${v}"`).join('\n');
        } else {
          for (const arg of nonFlagArgs) {
            const [key, ...valueParts] = arg.split('=');
            const value = valueParts.join('=');
            if (key) {
              setEnv(prev => ({ ...prev, [key]: value }));
            }
          }
          output = '';
        }
        break;
      }

      case 'unset':
        if (nonFlagArgs[0]) {
          setEnv(prev => {
            const newEnv = { ...prev };
            delete newEnv[nonFlagArgs[0]];
            return newEnv;
          });
        }
        output = '';
        break;

      case 'alias': {
        if (!nonFlagArgs[0]) {
          output = Object.entries(aliases).map(([k, v]) => `alias ${k}='${v}'`).join('\n');
        } else {
          for (const arg of nonFlagArgs) {
            const [name, ...cmdParts] = arg.split('=');
            const aliasCmd = cmdParts.join('=').replace(/^['"]|['"]$/g, '');
            if (name && aliasCmd) {
              setAliases(prev => ({ ...prev, [name]: aliasCmd }));
            }
          }
          output = '';
        }
        break;
      }

      case 'unalias':
        if (nonFlagArgs[0]) {
          setAliases(prev => {
            const newAliases = { ...prev };
            delete newAliases[nonFlagArgs[0]];
            return newAliases;
          });
        }
        output = '';
        break;

      case 'set':
        output = [...Object.entries(env), ...Object.entries({ _: command })].map(([k, v]) => `${k}=${v}`).join('\n');
        break;

      case 'source':
      case '.':
        if (!nonFlagArgs[0]) {
          output = `${command}: filename argument required`;
        } else {
          output = `sourced '${nonFlagArgs[0]}' (simulated)`;
        }
        break;

      case 'true':
        output = '';
        break;

      case 'false':
        output = '';
        break;

      case 'test':
      case '[':
        output = '';
        break;

      case 'sleep':
        output = `sleep: slept for ${nonFlagArgs[0] || 1} seconds (simulated)`;
        break;

      case 'neofetch':
        output = `
       .:'                    user@zos
    _ :'_                     --------
 .'  \`'  '.                   OS: zOS 1.0.0
:  .-''-. .:                  Host: Web Browser
:  :    :  :                  Kernel: JavaScript ES2024
 '.  \`--'  .'                 Uptime: ${Math.floor((Date.now() - startTime.current) / 60000)} mins
   \`:____:'                   Shell: zsh 5.9
                              Terminal: zOS Terminal
                              CPU: Multi-core JavaScript Engine
                              Memory: ${(performance as any).memory?.usedJSHeapSize ? formatSize((performance as any).memory.usedJSHeapSize) : '64M'} / Unlimited`;
        break;

      case 'cowsay': {
        const text = args.join(' ') || 'moo';
        const border = '_'.repeat(text.length + 2);
        output = ` ${border}
< ${text} >
 ${'-'.repeat(text.length + 2)}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`;
        break;
      }

      case 'fortune':
        const fortunes = [
          'You will have a great day!',
          'A journey of a thousand miles begins with a single step.',
          'The best time to plant a tree was 20 years ago. The second best time is now.',
          'Code is like humor. When you have to explain it, it\'s bad.',
          'First, solve the problem. Then, write the code.',
          'In theory, there is no difference between theory and practice. In practice, there is.',
        ];
        output = fortunes[Math.floor(Math.random() * fortunes.length)];
        break;

      case 'cal': {
        const now = new Date();
        const month = now.toLocaleString('default', { month: 'long' });
        const year = now.getFullYear();
        output = `    ${month} ${year}
Su Mo Tu We Th Fr Sa
                1  2
 3  4  5  6  7  8  9
10 11 12 13 14 15 16
17 18 19 20 21 22 23
24 25 26 27 28 29 30
31`;
        break;
      }

      case 'bc': {
        if (!nonFlagArgs[0]) {
          output = 'bc: interactive mode not supported. Usage: bc "expression"';
        } else {
          try {
            // Safe math evaluation
            const expr = args.join(' ').replace(/[^0-9+\-*/().%\s]/g, '');
            output = eval(expr)?.toString() || '0';
          } catch {
            output = 'bc: syntax error';
          }
        }
        break;
      }

      case 'find': {
        const searchPath = nonFlagArgs[0] || '.';
        const resolved = resolvePath(cwd, searchPath);
        const results: string[] = [];

        for (const path of Object.keys(fs)) {
          if (path.startsWith(resolved) || path === resolved) {
            results.push(path);
          }
        }
        output = results.join('\n');
        break;
      }

      case 'tree': {
        const targetPath = nonFlagArgs[0] ? resolvePath(cwd, nonFlagArgs[0]) : cwd;
        const buildTree = (path: string, prefix: string = ''): string[] => {
          const lines: string[] = [];
          const children = getChildren(fs, path);
          children.forEach((child, i) => {
            const isLast = i === children.length - 1;
            const childPath = path === '/' ? '/' + child : path + '/' + child;
            const node = fs[childPath];
            lines.push(prefix + (isLast ? '└── ' : '├── ') + child);
            if (node?.type === 'dir') {
              lines.push(...buildTree(childPath, prefix + (isLast ? '    ' : '│   ')));
            }
          });
          return lines;
        };
        output = targetPath + '\n' + buildTree(targetPath).join('\n');
        break;
      }

      default:
        if (command) {
          output = `zsh: command not found: ${command}`;
          success = false;
        }
    }

    return { output, success };
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(currentInput);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCurrentInput('');
        } else {
          setHistoryIndex(newIndex);
          setCurrentInput(commandHistory[newIndex] || '');
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Basic tab completion
      const parts = currentInput.split(/\s+/);
      const lastPart = parts[parts.length - 1];
      if (lastPart) {
        const path = resolvePath(cwd, lastPart.replace(/[^/]*$/, ''));
        const prefix = lastPart.split('/').pop() || '';
        const children = getChildren(fs, path);
        const matches = children.filter(c => c.startsWith(prefix));
        if (matches.length === 1) {
          parts[parts.length - 1] = lastPart.replace(/[^/]*$/, '') + matches[0];
          const node = fs[resolvePath(cwd, parts[parts.length - 1])];
          if (node?.type === 'dir') parts[parts.length - 1] += '/';
          setCurrentInput(parts.join(' '));
        } else if (matches.length > 1) {
          setHistory(prev => [...prev, { command: currentInput, output: matches.join('  '), cwd }]);
        }
      }
    } else if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      setHistory(prev => [...prev, { command: currentInput + '^C', output: '', cwd }]);
      setCurrentInput('');
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setHistory([]);
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history]);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <ZWindow
      title="Terminal - zsh"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 120, y: 80 }}
      initialSize={{ width: 700, height: 450 }}
      windowType="terminal"
    >
      <div
        ref={containerRef}
        className="h-full bg-[#1a1a1a] text-green-400 font-mono text-sm p-4 overflow-auto cursor-text"
        onClick={focusInput}
      >
        {history.map((entry, index) => (
          <div key={index} className="mb-2">
            {entry.command && (
              <div className="flex">
                <span className="text-blue-400">user@zos</span>
                <span className="text-white">:</span>
                <span className="text-purple-400">{getPromptPath(entry.cwd || '/Users/user')}</span>
                <span className="text-white">$ </span>
                <span className="text-white">{entry.command}</span>
              </div>
            )}
            {entry.output && (
              <pre className="text-white/80 whitespace-pre-wrap">{entry.output}</pre>
            )}
          </div>
        ))}
        <div className="flex">
          <span className="text-blue-400">user@zos</span>
          <span className="text-white">:</span>
          <span className="text-purple-400">{getPromptPath(cwd)}</span>
          <span className="text-white">$ </span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-white outline-none caret-green-400"
            autoFocus
          />
        </div>
      </div>
    </ZWindow>
  );
};

export default TerminalWindow;
