import React, { useState } from 'react';
import { ZWindow } from '@z-os/ui';
import { Edit3, Search, Phone, Video, MoreHorizontal } from 'lucide-react';

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
      <div className="flex h-full bg-[#1e1e1e]">
        {/* Sidebar - Contacts */}
        <div className="w-72 bg-[#2c2c2e] border-r border-white/10 flex flex-col">
          {/* Search */}
          <div className="p-3 flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-9 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/30 outline-none focus:border-blue-500/50"
              />
            </div>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Edit3 className="w-4 h-4 text-blue-400" />
            </button>
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto">
            {mockContacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => setSelectedContact(contact.id)}
                className={`w-full flex items-center gap-3 p-3 transition-colors ${
                  selectedContact === contact.id ? 'bg-blue-500/20' : 'hover:bg-white/5'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                  {contact.avatar}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium text-sm">{contact.name}</span>
                    <span className="text-white/40 text-xs">{contact.time}</span>
                  </div>
                  <p className="text-white/50 text-xs truncate">{contact.lastMessage}</p>
                </div>
                {contact.unread > 0 && (
                  <span className="bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {contact.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {contact ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {contact.avatar}
                  </div>
                  <div>
                    <p className="text-white font-medium">{contact.name}</p>
                    <p className="text-green-400 text-xs">Online</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <Phone className="w-5 h-5 text-white/70" />
                  </button>
                  <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <Video className="w-5 h-5 text-white/70" />
                  </button>
                  <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <MoreHorizontal className="w-5 h-5 text-white/70" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {mockMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sent ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                        msg.sent
                          ? 'bg-blue-500 text-white rounded-br-none'
                          : 'bg-white/10 text-white rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p className={`text-xs mt-1 ${msg.sent ? 'text-white/70' : 'text-white/40'}`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-white placeholder:text-white/30 outline-none focus:border-blue-500/50"
                  />
                  <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors">
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

export default MessagesWindow;
