import React, { useState } from 'react';
import { ZWindow } from '@z-os/ui';
import { Edit3, Search, Phone, Video, MoreHorizontal, MessageCircle } from 'lucide-react';

interface MessagesWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
}

interface Message {
  id: string;
  text: string;
  sent: boolean;
  time: string;
}

const mockContacts: Contact[] = [
  { id: '1', name: 'Hanzo Team', avatar: 'H', lastMessage: 'The deployment is complete!', time: 'Now', unread: 2 },
  { id: '2', name: 'Sarah Chen', avatar: 'S', lastMessage: 'Sounds good, see you then!', time: '1h', unread: 0 },
  { id: '3', name: 'Dev Group', avatar: 'D', lastMessage: 'PR has been approved', time: '2h', unread: 0 },
  { id: '4', name: 'Alex Kim', avatar: 'A', lastMessage: 'Thanks for the help!', time: 'Yesterday', unread: 0 },
];

const mockMessages: Message[] = [
  { id: '1', text: 'Hey! The deployment is starting now.', sent: false, time: '2:30 PM' },
  { id: '2', text: 'Great, I\'ll monitor the logs.', sent: true, time: '2:31 PM' },
  { id: '3', text: 'All services are healthy.', sent: false, time: '2:35 PM' },
  { id: '4', text: 'The deployment is complete!', sent: false, time: '2:40 PM' },
];

const MessagesWindow: React.FC<MessagesWindowProps> = ({ onClose, onFocus }) => {
  const [selectedContact, setSelectedContact] = useState<string | null>('1');
  const [messageInput, setMessageInput] = useState('');

  const contact = mockContacts.find(c => c.id === selectedContact);

  return (
    <ZWindow
      title="Messages"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 130, y: 70 }}
      initialSize={{ width: 800, height: 550 }}
      windowType="system"
    >
      <div className="flex h-full bg-black/80 backdrop-blur-2xl">
        {/* Sidebar - Contacts */}
        <div className="w-72 bg-black/40 backdrop-blur-xl border-r border-white/[0.08] flex flex-col">
          {/* Search */}
          <div className="p-3 flex items-center gap-2 border-b border-white/[0.06]">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-9 pr-3 py-1.5 bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] rounded-lg text-white/90 text-sm placeholder:text-white/40 outline-none focus:border-white/20 focus:bg-white/[0.08] transition-all"
              />
            </div>
            <button className="p-2 hover:bg-white/[0.08] rounded-lg transition-colors">
              <Edit3 className="w-4 h-4 text-white/70" />
            </button>
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto">
            {mockContacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => setSelectedContact(contact.id)}
                className={`w-full flex items-center gap-3 p-3 transition-all ${
                  selectedContact === contact.id 
                    ? 'bg-white/[0.12] backdrop-blur-sm border-l-2 border-white/30' 
                    : 'hover:bg-white/[0.06] border-l-2 border-transparent'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm border border-white/[0.12] flex items-center justify-center text-white/90 font-medium shadow-lg">
                  {contact.avatar}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-white/90 font-medium text-sm">{contact.name}</span>
                    <span className="text-white/40 text-xs">{contact.time}</span>
                  </div>
                  <p className="text-white/50 text-xs truncate">{contact.lastMessage}</p>
                </div>
                {contact.unread > 0 && (
                  <span className="bg-white/20 backdrop-blur-sm text-white/90 text-xs w-5 h-5 rounded-full flex items-center justify-center border border-white/20">
                    {contact.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-black/20">
          {contact ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/[0.08] bg-black/30 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm border border-white/[0.12] flex items-center justify-center text-white/90 font-medium shadow-lg">
                    {contact.avatar}
                  </div>
                  <div>
                    <p className="text-white/90 font-medium">{contact.name}</p>
                    <p className="text-emerald-400/80 text-xs">Online</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2.5 hover:bg-white/[0.08] rounded-lg transition-colors">
                    <Phone className="w-4 h-4 text-white/60" />
                  </button>
                  <button className="p-2.5 hover:bg-white/[0.08] rounded-lg transition-colors">
                    <Video className="w-4 h-4 text-white/60" />
                  </button>
                  <button className="p-2.5 hover:bg-white/[0.08] rounded-lg transition-colors">
                    <MoreHorizontal className="w-4 h-4 text-white/60" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {mockMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sent ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-2.5 backdrop-blur-xl shadow-lg ${
                        msg.sent
                          ? 'bg-white/[0.15] border border-white/[0.15] text-white/95 rounded-2xl rounded-br-md'
                          : 'bg-white/[0.08] border border-white/[0.08] text-white/90 rounded-2xl rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <p className={`text-[10px] mt-1.5 ${msg.sent ? 'text-white/50' : 'text-white/40'}`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/[0.08] bg-black/30 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 bg-white/[0.06] backdrop-blur-sm border border-white/[0.1] rounded-full text-white/90 placeholder:text-white/40 outline-none focus:border-white/20 focus:bg-white/[0.08] transition-all"
                  />
                  <button className="px-5 py-2.5 bg-white/[0.12] hover:bg-white/[0.18] backdrop-blur-sm border border-white/[0.15] text-white/90 rounded-full transition-all font-medium text-sm shadow-lg">
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-white/30">
              Select a conversation
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
 * Messages app manifest
 */
export const MessagesManifest = {
  identifier: 'ai.hanzo.messages',
  name: 'Messages',
  version: '1.0.0',
  description: 'Messaging app for zOS',
  category: 'communication' as const,
  permissions: ['network', 'notifications'] as const,
  window: {
    type: 'system' as const,
    defaultSize: { width: 800, height: 550 },
    resizable: true,
    showInDock: true,
  },
};

/**
 * Messages menu bar configuration
 */
export const MessagesMenuBar = {
  menus: [
    {
      id: 'file',
      label: 'File',
      items: [
        { type: 'item' as const, id: 'newMessage', label: 'New Message', shortcut: '⌘N' },
        { type: 'item' as const, id: 'newGroupMessage', label: 'New Group Message', shortcut: '⇧⌘N' },
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
      id: 'conversation',
      label: 'Conversation',
      items: [
        { type: 'item' as const, id: 'startAudioCall', label: 'Start Audio Call' },
        { type: 'item' as const, id: 'startVideoCall', label: 'Start Video Call' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'sendReadReceipts', label: 'Send Read Receipts' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'deleteConversation', label: 'Delete Conversation...', shortcut: '⌘⌫' },
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
        { type: 'item' as const, id: 'messagesHelp', label: 'Messages Help' },
      ],
    },
  ],
};

/**
 * Messages dock configuration
 */
export const MessagesDockConfig = {
  contextMenu: [
    { type: 'item' as const, id: 'newMessage', label: 'New Message' },
    { type: 'separator' as const },
    { type: 'item' as const, id: 'options', label: 'Options' },
  ],
};

/**
 * Messages App definition for registry
 */
export const MessagesApp = {
  manifest: MessagesManifest,
  component: MessagesWindow,
  icon: MessageCircle,
  menuBar: MessagesMenuBar,
  dockConfig: MessagesDockConfig,
};

export default MessagesWindow;
