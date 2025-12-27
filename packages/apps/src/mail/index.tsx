/**
 * Mail App
 *
 * Email client for zOS following macOS Mail patterns.
 * Unified black glass UI with transparency, backdrop blur, and glass morphism.
 */

import React, { useState } from 'react';
import { ZWindow } from '@z-os/ui';
import { Inbox, Send, Archive, Trash2, Star, Edit3, Mail as MailIcon, Search, Reply, Forward, MoreHorizontal } from 'lucide-react';

interface MailWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

interface Email {
  id: string;
  from: string;
  subject: string;
  preview: string;
  date: string;
  read: boolean;
  starred: boolean;
}

const mockEmails: Email[] = [
  { id: '1', from: 'Hanzo AI', subject: 'Welcome to zOS', preview: 'Thank you for using zOS. Here are some tips to get started...', date: 'Today', read: false, starred: true },
  { id: '2', from: 'System', subject: 'Security Update Available', preview: 'A new security update is available for your system...', date: 'Yesterday', read: false, starred: false },
  { id: '3', from: 'Developer Team', subject: 'New Features Released', preview: 'We are excited to announce new features including...', date: 'Dec 20', read: true, starred: false },
  { id: '4', from: 'Newsletter', subject: 'Weekly Digest', preview: 'Here is your weekly summary of activities...', date: 'Dec 18', read: true, starred: false },
];

const folders = [
  { id: 'inbox', label: 'Inbox', icon: Inbox, count: 2 },
  { id: 'sent', label: 'Sent', icon: Send, count: 0 },
  { id: 'archive', label: 'Archive', icon: Archive, count: 0 },
  { id: 'trash', label: 'Trash', icon: Trash2, count: 0 },
];

const MailWindow: React.FC<MailWindowProps> = ({ onClose, onFocus }) => {
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  const email = mockEmails.find(e => e.id === selectedEmail);

  return (
    <ZWindow
      title="Mail"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 100, y: 60 }}
      initialSize={{ width: 900, height: 600 }}
      windowType="system"
    >
      <div className="flex h-full bg-black/80 backdrop-blur-xl">
        {/* Sidebar - Dark glass with transparency */}
        <div className="w-56 bg-black/40 backdrop-blur-2xl border-r border-white/[0.08] flex flex-col">
          {/* Compose button */}
          <div className="p-3 border-b border-white/[0.06]">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/[0.08] hover:bg-white/[0.12] backdrop-blur-sm text-white/90 rounded-lg transition-all duration-200 border border-white/[0.1] hover:border-white/[0.15] shadow-lg shadow-black/20">
              <Edit3 className="w-4 h-4" />
              <span className="font-medium text-sm">Compose</span>
            </button>
          </div>

          {/* Folders */}
          <div className="flex-1 p-2 space-y-0.5">
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolder(folder.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                  selectedFolder === folder.id 
                    ? 'bg-white/[0.12] text-white border border-white/[0.1] shadow-sm' 
                    : 'text-white/60 hover:bg-white/[0.06] hover:text-white/80 border border-transparent'
                }`}
              >
                <folder.icon className={`w-4 h-4 ${selectedFolder === folder.id ? 'text-white' : 'text-white/50'}`} />
                <span className="flex-1 text-left text-sm">{folder.label}</span>
                {folder.count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                    selectedFolder === folder.id 
                      ? 'bg-white/20 text-white' 
                      : 'bg-white/10 text-white/60'
                  }`}>
                    {folder.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Bottom section - Account info */}
          <div className="p-3 border-t border-white/[0.06]">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-white/20 to-white/5 border border-white/[0.1] flex items-center justify-center">
                <span className="text-xs font-medium text-white/80">Z</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white/70 truncate">zOS User</p>
                <p className="text-[10px] text-white/40 truncate">user@zos.local</p>
              </div>
            </div>
          </div>
        </div>

        {/* Email List - Glass panel */}
        <div className="w-72 bg-black/30 backdrop-blur-xl border-r border-white/[0.08] flex flex-col">
          {/* Search bar */}
          <div className="p-3 border-b border-white/[0.06]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder="Search Mail"
                className="w-full pl-9 pr-3 py-2 bg-white/[0.05] border border-white/[0.08] rounded-lg text-white/90 text-sm placeholder:text-white/25 outline-none focus:border-white/[0.15] focus:bg-white/[0.08] transition-all duration-200"
              />
            </div>
          </div>
          
          {/* Email list */}
          <div className="flex-1 overflow-y-auto">
            {mockEmails.map((emailItem) => (
              <button
                key={emailItem.id}
                onClick={() => setSelectedEmail(emailItem.id)}
                className={`w-full p-3 border-b border-white/[0.04] text-left transition-all duration-200 ${
                  selectedEmail === emailItem.id 
                    ? 'bg-white/[0.1] border-l-2 border-l-white/40' 
                    : 'hover:bg-white/[0.05] border-l-2 border-l-transparent'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${emailItem.read ? 'bg-transparent' : 'bg-white/70'}`} />
                  <span className={`text-sm flex-1 truncate ${emailItem.read ? 'text-white/60' : 'text-white font-medium'}`}>
                    {emailItem.from}
                  </span>
                  {emailItem.starred && <Star className="w-3.5 h-3.5 text-amber-400/80 fill-amber-400/80 flex-shrink-0" />}
                </div>
                <p className={`text-sm truncate mb-1 ${emailItem.read ? 'text-white/40' : 'text-white/70'}`}>
                  {emailItem.subject}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-white/30 truncate flex-1">{emailItem.preview}</p>
                  <span className="text-[10px] text-white/25 flex-shrink-0">{emailItem.date}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Email Content - Main glass panel */}
        <div className="flex-1 flex flex-col bg-black/20 backdrop-blur-xl">
          {email ? (
            <>
              {/* Email header */}
              <div className="p-5 border-b border-white/[0.06]">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-white/90 text-lg font-semibold">{email.subject}</h2>
                  <div className="flex items-center gap-1">
                    <button className="p-2 rounded-lg hover:bg-white/[0.08] text-white/50 hover:text-white/80 transition-all">
                      <Reply className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-white/[0.08] text-white/50 hover:text-white/80 transition-all">
                      <Forward className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-white/[0.08] text-white/50 hover:text-white/80 transition-all">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/15 to-white/5 border border-white/[0.1] flex items-center justify-center text-white/80 text-sm font-semibold shadow-lg shadow-black/20">
                    {email.from[0]}
                  </div>
                  <div>
                    <p className="text-white/90 text-sm font-medium">{email.from}</p>
                    <p className="text-white/35 text-xs">To: me | {email.date}</p>
                  </div>
                </div>
              </div>
              
              {/* Email body */}
              <div className="flex-1 p-5 overflow-y-auto">
                <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-5">
                  <p className="text-white/70 leading-relaxed text-sm">{email.preview}</p>
                  <p className="text-white/50 leading-relaxed text-sm mt-4">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                  </p>
                  <p className="text-white/50 leading-relaxed text-sm mt-4">
                    Best regards,<br />
                    <span className="text-white/60">{email.from}</span>
                  </p>
                </div>
              </div>

              {/* Quick reply */}
              <div className="p-4 border-t border-white/[0.06]">
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Reply to this email..."
                    className="flex-1 px-4 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-lg text-white/90 text-sm placeholder:text-white/25 outline-none focus:border-white/[0.15] focus:bg-white/[0.08] transition-all duration-200"
                  />
                  <button className="px-4 py-2.5 bg-white/[0.1] hover:bg-white/[0.15] text-white/80 hover:text-white rounded-lg transition-all duration-200 border border-white/[0.1] hover:border-white/[0.15] text-sm font-medium">
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-white/25">
              <MailIcon className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-sm">Select an email to read</p>
            </div>
          )}
        </div>
      </div>
    </ZWindow>
  );
};

// ============================================================================
// App Definition
// ============================================================================

/**
 * Mail app manifest
 */
export const MailManifest = {
  identifier: 'ai.hanzo.mail',
  name: 'Mail',
  version: '1.0.0',
  description: 'Email client for zOS',
  category: 'productivity' as const,
  permissions: ['network', 'storage'] as const,
  window: {
    type: 'system' as const,
    defaultSize: { width: 900, height: 600 },
    resizable: true,
    showInDock: true,
  },
};

/**
 * Mail menu bar configuration
 */
export const MailMenuBar = {
  menus: [
    {
      id: 'file',
      label: 'File',
      items: [
        { type: 'item' as const, id: 'newMessage', label: 'New Message', shortcut: '⌘N' },
        { type: 'item' as const, id: 'newMailbox', label: 'New Mailbox...' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'saveAs', label: 'Save As...', shortcut: '⌘S' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'print', label: 'Print...', shortcut: '⌘P' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'close', label: 'Close', shortcut: '⌘W' },
      ],
    },
    {
      id: 'edit',
      label: 'Edit',
      items: [
        { type: 'item' as const, id: 'undo', label: 'Undo', shortcut: '⌘Z' },
        { type: 'item' as const, id: 'redo', label: 'Redo', shortcut: '⇧⌘Z' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'cut', label: 'Cut', shortcut: '⌘X' },
        { type: 'item' as const, id: 'copy', label: 'Copy', shortcut: '⌘C' },
        { type: 'item' as const, id: 'paste', label: 'Paste', shortcut: '⌘V' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'selectAll', label: 'Select All', shortcut: '⌘A' },
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { type: 'item' as const, id: 'showMailboxList', label: 'Show Mailbox List', shortcut: '⇧⌘M' },
        { type: 'item' as const, id: 'showPreviewPane', label: 'Show Preview' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'sortByDate', label: 'Sort by Date' },
        { type: 'item' as const, id: 'sortByFrom', label: 'Sort by From' },
        { type: 'item' as const, id: 'sortBySubject', label: 'Sort by Subject' },
      ],
    },
    {
      id: 'mailbox',
      label: 'Mailbox',
      items: [
        { type: 'item' as const, id: 'getMail', label: 'Get New Mail', shortcut: '⇧⌘N' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'archive', label: 'Archive', shortcut: '⌃⌘A' },
        { type: 'item' as const, id: 'moveToJunk', label: 'Move to Junk', shortcut: '⇧⌘J' },
        { type: 'item' as const, id: 'moveToTrash', label: 'Move to Trash', shortcut: '⌘⌫' },
      ],
    },
    {
      id: 'message',
      label: 'Message',
      items: [
        { type: 'item' as const, id: 'reply', label: 'Reply', shortcut: '⌘R' },
        { type: 'item' as const, id: 'replyAll', label: 'Reply All', shortcut: '⇧⌘R' },
        { type: 'item' as const, id: 'forward', label: 'Forward', shortcut: '⇧⌘F' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'markAsRead', label: 'Mark as Read', shortcut: '⇧⌘U' },
        { type: 'item' as const, id: 'flagMessage', label: 'Flag', shortcut: '⇧⌘L' },
      ],
    },
    {
      id: 'window',
      label: 'Window',
      items: [
        { type: 'item' as const, id: 'minimize', label: 'Minimize', shortcut: '⌘M' },
        { type: 'item' as const, id: 'zoom', label: 'Zoom' },
      ],
    },
    {
      id: 'help',
      label: 'Help',
      items: [
        { type: 'item' as const, id: 'mailHelp', label: 'Mail Help' },
      ],
    },
  ],
};

/**
 * Mail dock configuration
 */
export const MailDockConfig = {
  contextMenu: [
    { type: 'item' as const, id: 'newMessage', label: 'New Message' },
    { type: 'item' as const, id: 'getMail', label: 'Get New Mail' },
    { type: 'separator' as const },
    { type: 'item' as const, id: 'options', label: 'Options' },
  ],
};

/**
 * Mail App definition for registry
 */
export const MailApp = {
  manifest: MailManifest,
  component: MailWindow,
  icon: MailIcon,
  menuBar: MailMenuBar,
  dockConfig: MailDockConfig,
};

export default MailWindow;
