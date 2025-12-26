import { describe, it, expect, beforeEach } from 'vitest';
import {
  createFS,
  defaultEnv,
  defaultAliases,
  resolvePath,
  getPromptPath,
  formatSize,
  getChildren,
  parseChainedCommands,
  executeCommand,
  executeChainedCommands,
  TerminalState,
  FileNode,
} from './terminal';

describe('Terminal Utilities', () => {
  describe('resolvePath', () => {
    it('should return current directory for empty path', () => {
      expect(resolvePath('/Users/user', '')).toBe('/Users/user');
    });

    it('should expand ~ to home directory', () => {
      expect(resolvePath('/tmp', '~')).toBe('/Users/user');
    });

    it('should expand ~/path to home directory path', () => {
      expect(resolvePath('/tmp', '~/Documents')).toBe('/Users/user/Documents');
    });

    it('should handle absolute paths', () => {
      expect(resolvePath('/Users/user', '/tmp')).toBe('/tmp');
      expect(resolvePath('/Users/user', '/')).toBe('/');
    });

    it('should handle relative paths', () => {
      expect(resolvePath('/Users/user', 'Documents')).toBe('/Users/user/Documents');
      expect(resolvePath('/Users/user/Documents', 'projects')).toBe('/Users/user/Documents/projects');
    });

    it('should handle .. navigation', () => {
      expect(resolvePath('/Users/user/Documents', '..')).toBe('/Users/user');
      expect(resolvePath('/Users/user/Documents/projects', '../..')).toBe('/Users/user');
    });

    it('should handle . (current directory)', () => {
      expect(resolvePath('/Users/user', '.')).toBe('/Users/user');
      expect(resolvePath('/Users/user', './Documents')).toBe('/Users/user/Documents');
    });

    it('should handle mixed paths', () => {
      expect(resolvePath('/Users/user', 'Documents/../Pictures')).toBe('/Users/user/Pictures');
    });

    it('should handle trailing slashes', () => {
      expect(resolvePath('/Users/user', '/tmp/')).toBe('/tmp');
    });
  });

  describe('getPromptPath', () => {
    it('should return ~ for home directory', () => {
      expect(getPromptPath('/Users/user')).toBe('~');
    });

    it('should return ~/ prefix for paths under home', () => {
      expect(getPromptPath('/Users/user/Documents')).toBe('~/Documents');
      expect(getPromptPath('/Users/user/Documents/projects')).toBe('~/Documents/projects');
    });

    it('should return absolute path for paths outside home', () => {
      expect(getPromptPath('/tmp')).toBe('/tmp');
      expect(getPromptPath('/var/log')).toBe('/var/log');
      expect(getPromptPath('/')).toBe('/');
    });
  });

  describe('formatSize', () => {
    it('should format bytes', () => {
      expect(formatSize(0)).toBe('0');
      expect(formatSize(100)).toBe('100');
      expect(formatSize(1023)).toBe('1023');
    });

    it('should format kilobytes', () => {
      expect(formatSize(1024)).toBe('1.0K');
      expect(formatSize(2048)).toBe('2.0K');
      expect(formatSize(1536)).toBe('1.5K');
    });

    it('should format megabytes', () => {
      expect(formatSize(1048576)).toBe('1.0M');
      expect(formatSize(2097152)).toBe('2.0M');
    });

    it('should format gigabytes', () => {
      expect(formatSize(1073741824)).toBe('1.0G');
      expect(formatSize(2147483648)).toBe('2.0G');
    });
  });

  describe('getChildren', () => {
    const testFs: Record<string, FileNode> = {
      '/': { type: 'dir' },
      '/Users': { type: 'dir' },
      '/Users/user': { type: 'dir' },
      '/Users/user/file.txt': { type: 'file' },
      '/Users/user/Documents': { type: 'dir' },
      '/Users/user/.hidden': { type: 'file' },
      '/tmp': { type: 'dir' },
    };

    it('should return immediate children of root', () => {
      const children = getChildren(testFs, '/');
      expect(children).toContain('Users');
      expect(children).toContain('tmp');
      expect(children).not.toContain('user');
    });

    it('should return immediate children of directory', () => {
      const children = getChildren(testFs, '/Users/user');
      expect(children).toEqual(['.hidden', 'Documents', 'file.txt']);
    });

    it('should return sorted children', () => {
      const children = getChildren(testFs, '/Users/user');
      const sorted = [...children].sort();
      expect(children).toEqual(sorted);
    });

    it('should return empty array for empty directory', () => {
      const children = getChildren(testFs, '/tmp');
      expect(children).toEqual([]);
    });
  });

  describe('parseChainedCommands', () => {
    it('should parse single command', () => {
      const result = parseChainedCommands('ls');
      expect(result).toEqual([{ cmd: 'ls', requireSuccess: false }]);
    });

    it('should parse && chained commands', () => {
      const result = parseChainedCommands('cd /tmp && ls');
      expect(result).toEqual([
        { cmd: 'cd /tmp', requireSuccess: false },
        { cmd: 'ls', requireSuccess: true },
      ]);
    });

    it('should parse ; chained commands', () => {
      const result = parseChainedCommands('cd /tmp ; ls');
      expect(result).toEqual([
        { cmd: 'cd /tmp', requireSuccess: false },
        { cmd: 'ls', requireSuccess: false },
      ]);
    });

    it('should parse mixed && and ; chains', () => {
      const result = parseChainedCommands('cmd1 && cmd2 ; cmd3 && cmd4');
      expect(result).toEqual([
        { cmd: 'cmd1', requireSuccess: false },
        { cmd: 'cmd2', requireSuccess: true },
        { cmd: 'cmd3', requireSuccess: false },
        { cmd: 'cmd4', requireSuccess: true },
      ]);
    });

    it('should handle multiple && in sequence', () => {
      const result = parseChainedCommands('cmd1 && cmd2 && cmd3');
      expect(result).toEqual([
        { cmd: 'cmd1', requireSuccess: false },
        { cmd: 'cmd2', requireSuccess: true },
        { cmd: 'cmd3', requireSuccess: true },
      ]);
    });

    it('should trim whitespace', () => {
      const result = parseChainedCommands('  ls   &&   pwd  ');
      expect(result).toEqual([
        { cmd: 'ls', requireSuccess: false },
        { cmd: 'pwd', requireSuccess: true },
      ]);
    });
  });
});

describe('Terminal Commands', () => {
  let state: TerminalState;

  beforeEach(() => {
    state = {
      fs: createFS(),
      env: { ...defaultEnv },
      aliases: { ...defaultAliases },
      cwd: '/Users/user',
      commandHistory: [],
    };
  });

  describe('Basic Commands', () => {
    it('pwd should return current directory', () => {
      const result = executeCommand('pwd', state);
      expect(result.output).toBe('/Users/user');
      expect(result.success).toBe(true);
    });

    it('whoami should return username', () => {
      const result = executeCommand('whoami', state);
      expect(result.output).toBe('user');
      expect(result.success).toBe(true);
    });

    it('hostname should return hostname', () => {
      const result = executeCommand('hostname', state);
      expect(result.output).toBe('zos.local');
      expect(result.success).toBe(true);
    });

    it('id should return user info', () => {
      const result = executeCommand('id', state);
      expect(result.output).toContain('uid=501(user)');
      expect(result.success).toBe(true);
    });

    it('uname should return OS name', () => {
      const result = executeCommand('uname', state);
      expect(result.output).toBe('zOS');
    });

    it('uname -a should return full system info', () => {
      const result = executeCommand('uname -a', state);
      expect(result.output).toContain('zOS');
      expect(result.output).toContain('x86_64');
    });

    it('echo should print text', () => {
      const result = executeCommand('echo hello world', state);
      expect(result.output).toBe('hello world');
    });

    it('echo should handle escape sequences', () => {
      const result = executeCommand('echo "hello\\nworld"', state);
      expect(result.output).toBe('hello\nworld');
    });

    it('true should return success', () => {
      const result = executeCommand('true', state);
      expect(result.success).toBe(true);
      expect(result.output).toBe('');
    });

    it('false should return failure', () => {
      const result = executeCommand('false', state);
      expect(result.success).toBe(false);
      expect(result.output).toBe('');
    });

    it('clear should set clear flag', () => {
      const result = executeCommand('clear', state);
      expect(result.clear).toBe(true);
    });

    it('help should return help text', () => {
      const result = executeCommand('help', state);
      expect(result.output).toContain('FILE OPERATIONS');
      expect(result.output).toContain('ls');
      expect(result.output).toContain('cd');
    });
  });

  describe('cd command', () => {
    it('should change to home directory with no args', () => {
      state.cwd = '/tmp';
      const result = executeCommand('cd', state);
      expect(result.newCwd).toBe('/Users/user');
      expect(result.success).toBe(true);
    });

    it('should change to specified directory', () => {
      const result = executeCommand('cd /tmp', state);
      expect(result.newCwd).toBe('/tmp');
      expect(result.success).toBe(true);
    });

    it('should change to relative directory', () => {
      const result = executeCommand('cd Documents', state);
      expect(result.newCwd).toBe('/Users/user/Documents');
      expect(result.success).toBe(true);
    });

    it('should fail for non-existent directory', () => {
      const result = executeCommand('cd /nonexistent', state);
      expect(result.success).toBe(false);
      expect(result.output).toContain('no such file or directory');
    });

    it('should fail for file (not directory)', () => {
      const result = executeCommand('cd Desktop/README.txt', state);
      expect(result.success).toBe(false);
      expect(result.output).toContain('not a directory');
    });

    it('should handle ~ expansion', () => {
      state.cwd = '/tmp';
      const result = executeCommand('cd ~', state);
      expect(result.newCwd).toBe('/Users/user');
    });

    it('should handle .. navigation', () => {
      state.cwd = '/Users/user/Documents';
      const result = executeCommand('cd ..', state);
      expect(result.newCwd).toBe('/Users/user');
    });
  });

  describe('ls command', () => {
    it('should list current directory', () => {
      const result = executeCommand('ls', state);
      expect(result.output).toContain('Desktop');
      expect(result.output).toContain('Documents');
      expect(result.output).not.toContain('.zshrc'); // Hidden files excluded by default
    });

    it('should show hidden files with -a', () => {
      const result = executeCommand('ls -a', state);
      expect(result.output).toContain('.zshrc');
      expect(result.output).toContain('.bashrc');
    });

    it('should show long format with -l', () => {
      const result = executeCommand('ls -l', state);
      expect(result.output).toContain('drwxr-xr-x');
      expect(result.output).toContain('user');
      expect(result.output).toContain('staff');
    });

    it('should list specified directory', () => {
      const result = executeCommand('ls /bin', state);
      expect(result.output).toContain('ls');
      expect(result.output).toContain('cat');
      expect(result.output).toContain('zsh');
    });

    it('should fail for non-existent path', () => {
      const result = executeCommand('ls /nonexistent', state);
      expect(result.success).toBe(false);
      expect(result.output).toContain('No such file or directory');
    });

    it('should show file name for file path', () => {
      const result = executeCommand('ls Desktop/README.txt', state);
      expect(result.output).toBe('Desktop/README.txt');
    });
  });

  describe('cat command', () => {
    it('should display file contents', () => {
      const result = executeCommand('cat Desktop/README.txt', state);
      expect(result.output).toContain('Welcome to zOS!');
    });

    it('should fail for non-existent file', () => {
      const result = executeCommand('cat nonexistent.txt', state);
      expect(result.success).toBe(false);
      expect(result.output).toContain('No such file or directory');
    });

    it('should fail for directory', () => {
      const result = executeCommand('cat Desktop', state);
      expect(result.success).toBe(false);
      expect(result.output).toContain('Is a directory');
    });

    it('should fail without file argument', () => {
      const result = executeCommand('cat', state);
      expect(result.success).toBe(false);
      expect(result.output).toContain('missing file operand');
    });

    it('should concatenate multiple files', () => {
      const result = executeCommand('cat .zshrc .bashrc', state);
      expect(result.output).toContain('zOS zshrc');
      expect(result.output).toContain('zOS bashrc');
    });
  });

  describe('head and tail commands', () => {
    it('head should show first lines', () => {
      const result = executeCommand('head /etc/hosts', state);
      expect(result.output).toContain('Host Database');
    });

    it('tail should show last lines', () => {
      const result = executeCommand('tail /var/log/system.log', state);
      expect(result.output).toContain('All systems operational');
    });

    it('should fail for missing file', () => {
      expect(executeCommand('head', state).success).toBe(false);
      expect(executeCommand('tail', state).success).toBe(false);
    });
  });

  describe('touch command', () => {
    it('should create new file', () => {
      const result = executeCommand('touch newfile.txt', state);
      expect(result.success).toBe(true);
      expect(result.fsChanges).toBeDefined();
      expect(result.fsChanges!['/Users/user/newfile.txt']).toBeDefined();
      expect(result.fsChanges!['/Users/user/newfile.txt']?.type).toBe('file');
    });

    it('should not error on existing file', () => {
      const result = executeCommand('touch Desktop/README.txt', state);
      expect(result.success).toBe(true);
    });

    it('should fail without argument', () => {
      const result = executeCommand('touch', state);
      expect(result.success).toBe(false);
    });
  });

  describe('mkdir command', () => {
    it('should create new directory', () => {
      const result = executeCommand('mkdir newdir', state);
      expect(result.success).toBe(true);
      expect(result.fsChanges!['/Users/user/newdir']?.type).toBe('dir');
    });

    it('should fail if directory exists', () => {
      const result = executeCommand('mkdir Desktop', state);
      expect(result.success).toBe(false);
      expect(result.output).toContain('File exists');
    });

    it('should fail if parent does not exist without -p', () => {
      const result = executeCommand('mkdir nonexistent/subdir', state);
      expect(result.success).toBe(false);
    });

    it('should fail without argument', () => {
      const result = executeCommand('mkdir', state);
      expect(result.success).toBe(false);
    });
  });

  describe('rm command', () => {
    it('should fail to remove directory without -r', () => {
      const result = executeCommand('rm Desktop', state);
      expect(result.success).toBe(false);
      expect(result.output).toContain('is a directory');
    });

    it('should remove directory with -r', () => {
      const result = executeCommand('rm -r Documents/projects/zos', state);
      expect(result.success).toBe(true);
      expect(result.fsChanges!['/Users/user/Documents/projects/zos']).toBeNull();
    });

    it('should fail for non-existent file', () => {
      const result = executeCommand('rm nonexistent', state);
      expect(result.success).toBe(false);
    });

    it('should not fail for non-existent file with -f', () => {
      const result = executeCommand('rm -f nonexistent', state);
      expect(result.success).toBe(true);
    });

    it('should fail without argument', () => {
      const result = executeCommand('rm', state);
      expect(result.success).toBe(false);
    });
  });

  describe('cp command', () => {
    it('should copy file', () => {
      const result = executeCommand('cp Desktop/README.txt copied.txt', state);
      expect(result.success).toBe(true);
      expect(result.fsChanges!['/Users/user/copied.txt']).toBeDefined();
    });

    it('should fail for non-existent source', () => {
      const result = executeCommand('cp nonexistent.txt dest.txt', state);
      expect(result.success).toBe(false);
    });

    it('should fail to copy directory without -r', () => {
      const result = executeCommand('cp Desktop dest', state);
      expect(result.success).toBe(false);
      expect(result.output).toContain('is a directory');
    });

    it('should fail without destination', () => {
      const result = executeCommand('cp file.txt', state);
      expect(result.success).toBe(false);
    });
  });

  describe('mv command', () => {
    it('should move file', () => {
      const result = executeCommand('mv Desktop/README.txt moved.txt', state);
      expect(result.success).toBe(true);
      expect(result.fsChanges!['/Users/user/moved.txt']).toBeDefined();
      expect(result.fsChanges!['/Users/user/Desktop/README.txt']).toBeNull();
    });

    it('should fail for non-existent source', () => {
      const result = executeCommand('mv nonexistent.txt dest.txt', state);
      expect(result.success).toBe(false);
    });

    it('should fail without destination', () => {
      const result = executeCommand('mv file.txt', state);
      expect(result.success).toBe(false);
    });
  });

  describe('grep command', () => {
    it('should find matching lines', () => {
      const result = executeCommand('grep alias .zshrc', state);
      expect(result.output).toContain('alias ll=');
    });

    it('should handle case insensitive search with -i', () => {
      const result = executeCommand('grep -i ZOS .zshrc', state);
      expect(result.output).toContain('zOS zshrc');
    });

    it('should count matches with -c', () => {
      const result = executeCommand('grep -c alias .zshrc', state);
      expect(parseInt(result.output)).toBeGreaterThan(0);
    });

    it('should fail for non-existent file', () => {
      const result = executeCommand('grep pattern nonexistent', state);
      expect(result.success).toBe(false);
    });

    it('should fail without enough arguments', () => {
      const result = executeCommand('grep pattern', state);
      expect(result.success).toBe(false);
    });
  });

  describe('wc command', () => {
    it('should count lines, words, chars', () => {
      const result = executeCommand('wc .zshrc', state);
      expect(result.output).toMatch(/\d+\s+\d+\s+\d+/);
    });

    it('should count only lines with -l', () => {
      const result = executeCommand('wc -l .zshrc', state);
      expect(parseInt(result.output)).toBeGreaterThan(0);
    });

    it('should fail for non-existent file', () => {
      const result = executeCommand('wc nonexistent', state);
      expect(result.success).toBe(false);
    });
  });

  describe('which command', () => {
    it('should find command in PATH', () => {
      const result = executeCommand('which ls', state);
      expect(result.output).toBe('/bin/ls');
    });

    it('should report not found for unknown command', () => {
      const result = executeCommand('which unknowncommand', state);
      expect(result.success).toBe(false);
      expect(result.output).toContain('not found');
    });
  });

  describe('type command', () => {
    it('should identify builtin', () => {
      const result = executeCommand('type cd', state);
      expect(result.output).toContain('shell builtin');
    });

    it('should identify alias', () => {
      const result = executeCommand('type ll', state);
      expect(result.output).toContain('aliased to');
    });
  });

  describe('Environment commands', () => {
    it('env should show environment variables', () => {
      const result = executeCommand('env', state);
      expect(result.output).toContain('HOME=/Users/user');
      expect(result.output).toContain('USER=user');
    });

    it('export should set variable', () => {
      const result = executeCommand('export MYVAR=hello', state);
      expect(result.success).toBe(true);
      expect(result.envChanges!['MYVAR']).toBe('hello');
    });

    it('unset should remove variable', () => {
      const result = executeCommand('unset HOME', state);
      expect(result.envChanges!['HOME']).toBeNull();
    });

    it('alias should show aliases', () => {
      const result = executeCommand('alias', state);
      expect(result.output).toContain("alias ll='ls -la'");
    });

    it('alias should set new alias', () => {
      const result = executeCommand('alias myalias=mycommand', state);
      expect(result.aliasChanges!['myalias']).toBe('mycommand');
    });

    it('unalias should remove alias', () => {
      const result = executeCommand('unalias ll', state);
      expect(result.aliasChanges!['ll']).toBeNull();
    });
  });

  describe('Alias expansion', () => {
    it('should expand ll to ls -la', () => {
      const result = executeCommand('ll', state);
      expect(result.output).toContain('.zshrc'); // Hidden files shown due to -a
    });
  });

  describe('Environment variable expansion', () => {
    it('should expand $HOME', () => {
      const result = executeCommand('echo $HOME', state);
      expect(result.output).toBe('/Users/user');
    });

    it('should expand ${VAR} syntax', () => {
      const result = executeCommand('echo ${USER}', state);
      expect(result.output).toBe('user');
    });
  });

  describe('tree command', () => {
    it('should show directory tree', () => {
      const result = executeCommand('tree Documents', state);
      expect(result.output).toContain('Documents');
      expect(result.output).toContain('├──');
      expect(result.output).toContain('notes.md');
    });
  });

  describe('find command', () => {
    it('should find files under path', () => {
      const result = executeCommand('find /bin', state);
      expect(result.output).toContain('/bin/ls');
      expect(result.output).toContain('/bin/cat');
    });
  });

  describe('cowsay command', () => {
    it('should show ASCII cow with message', () => {
      const result = executeCommand('cowsay hello', state);
      expect(result.output).toContain('< hello >');
      expect(result.output).toContain('(oo)');
    });

    it('should default to moo', () => {
      const result = executeCommand('cowsay', state);
      expect(result.output).toContain('< moo >');
    });
  });

  describe('neofetch command', () => {
    it('should show system info', () => {
      const result = executeCommand('neofetch', state);
      expect(result.output).toContain('user@zos');
      expect(result.output).toContain('OS: zOS');
      expect(result.output).toContain('Shell: zsh');
    });
  });

  describe('Unknown command', () => {
    it('should return command not found error', () => {
      const result = executeCommand('unknowncommand', state);
      expect(result.success).toBe(false);
      expect(result.output).toContain('command not found');
    });
  });
});

describe('Command Chaining', () => {
  let state: TerminalState;

  beforeEach(() => {
    state = {
      fs: createFS(),
      env: { ...defaultEnv },
      aliases: { ...defaultAliases },
      cwd: '/Users/user',
      commandHistory: [],
    };
  });

  describe('&& operator', () => {
    it('should execute both commands on success', () => {
      const result = executeChainedCommands('echo hello && echo world', state);
      expect(result.outputs).toEqual(['hello', 'world']);
      expect(result.success).toBe(true);
    });

    it('should stop on first failure', () => {
      const result = executeChainedCommands('cd /nonexistent && echo should-not-run', state);
      expect(result.outputs.length).toBe(1);
      expect(result.outputs[0]).toContain('no such file or directory');
      expect(result.success).toBe(false);
    });

    it('should chain three commands', () => {
      const result = executeChainedCommands('echo one && echo two && echo three', state);
      expect(result.outputs).toEqual(['one', 'two', 'three']);
    });

    it('should stop chain at failure point', () => {
      const result = executeChainedCommands('echo one && cd /nonexistent && echo three', state);
      expect(result.outputs.length).toBe(2);
      expect(result.outputs[0]).toBe('one');
      expect(result.outputs[1]).toContain('no such file or directory');
    });
  });

  describe('; operator', () => {
    it('should execute both commands regardless of success', () => {
      const result = executeChainedCommands('cd /nonexistent ; echo should-run', state);
      expect(result.outputs.length).toBe(2);
      expect(result.outputs[1]).toBe('should-run');
    });

    it('should continue after failure', () => {
      const result = executeChainedCommands('false ; echo continued', state);
      expect(result.outputs).toEqual(['continued']);
    });
  });

  describe('Mixed operators', () => {
    it('should handle && followed by ;', () => {
      const result = executeChainedCommands('true && echo pass ; echo always', state);
      expect(result.outputs).toEqual(['pass', 'always']);
    });

    it('should handle failure in && followed by ;', () => {
      const result = executeChainedCommands('false && echo skip ; echo always', state);
      expect(result.outputs).toEqual(['always']);
    });
  });

  describe('State propagation', () => {
    it('should propagate cwd changes through chain', () => {
      const result = executeChainedCommands('cd /tmp && pwd', state);
      // cd returns empty string (falsy), so only pwd output is collected
      expect(result.outputs).toEqual(['/tmp']);
      expect(result.finalState.cwd).toBe('/tmp');
    });

    it('should propagate env changes through chain', () => {
      const result = executeChainedCommands('export MYVAR=test && echo $MYVAR', state);
      // Note: env expansion happens at parse time, so this tests the state update
      expect(result.finalState.env['MYVAR']).toBe('test');
    });

    it('should propagate fs changes through chain', () => {
      const result = executeChainedCommands('touch newfile.txt && ls', state);
      expect(result.finalState.fs['/Users/user/newfile.txt']).toBeDefined();
    });
  });

  describe('clear command in chain', () => {
    it('should return clear flag and stop', () => {
      const result = executeChainedCommands('echo hello && clear && echo world', state);
      expect(result.clear).toBe(true);
      expect(result.outputs).toEqual(['hello']);
    });
  });
});

describe('File System', () => {
  it('should have required directories', () => {
    const fs = createFS();
    expect(fs['/']).toBeDefined();
    expect(fs['/Users']).toBeDefined();
    expect(fs['/Users/user']).toBeDefined();
    expect(fs['/bin']).toBeDefined();
    expect(fs['/tmp']).toBeDefined();
    expect(fs['/etc']).toBeDefined();
  });

  it('should have common binaries', () => {
    const fs = createFS();
    expect(fs['/bin/ls']).toBeDefined();
    expect(fs['/bin/cat']).toBeDefined();
    expect(fs['/bin/zsh']).toBeDefined();
  });

  it('should have config files', () => {
    const fs = createFS();
    expect(fs['/etc/hosts']).toBeDefined();
    expect(fs['/etc/passwd']).toBeDefined();
    expect(fs['/Users/user/.zshrc']).toBeDefined();
  });

  it('should have file contents', () => {
    const fs = createFS();
    expect(fs['/etc/hosts']?.content).toContain('localhost');
    expect(fs['/Users/user/.zshrc']?.content).toContain('alias');
  });
});

describe('Default Environment', () => {
  it('should have required variables', () => {
    expect(defaultEnv.HOME).toBe('/Users/user');
    expect(defaultEnv.USER).toBe('user');
    expect(defaultEnv.SHELL).toBe('/bin/zsh');
    expect(defaultEnv.PATH).toContain('/bin');
  });
});

describe('Default Aliases', () => {
  it('should have common aliases', () => {
    expect(defaultAliases['ll']).toBe('ls -la');
    expect(defaultAliases['la']).toBe('ls -a');
    expect(defaultAliases['..']).toBe('cd ..');
  });
});
