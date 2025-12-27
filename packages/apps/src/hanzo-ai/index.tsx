import React, { useState, useRef, useEffect } from 'react';
import { ZWindow } from '@z-os/ui';
import { Send, Bot, User, Sparkles, Zap } from 'lucide-react';

interface HanzoAIWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const HanzoAIWindow: React.FC<HanzoAIWindowProps> = ({ onClose, onFocus }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m Hanzo AI, your intelligent assistant. How can I help you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "That's an interesting question! Let me think about it...",
        "I'd be happy to help you with that.",
        "Great question! Here's what I know...",
        "I understand. Let me provide some insights.",
        "Thanks for asking! Here's my perspective...",
      ];

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)]
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  return (
    <ZWindow
      title="Hanzo AI"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 160, y: 100 }}
      initialSize={{ width: 500, height: 600 }}
      windowType="default"
    >
      <div className="flex flex-col h-full bg-black/90 backdrop-blur-xl">
        {/* Header - Glass panel */}
        <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-white/5 backdrop-blur-md">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            {/* Status indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-black/90" />
          </div>
          <div>
            <h2 className="text-white font-medium flex items-center gap-2">
              Hanzo AI
              <Zap className="w-3 h-3 text-cyan-400" />
            </h2>
            <p className="text-xs text-white/40">Online • Ready to assist</p>
          </div>
        </div>

        {/* Messages - Glass container */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'user'
                  ? 'bg-white/10 backdrop-blur-sm border border-white/20'
                  : 'bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 shadow-lg shadow-cyan-500/10'
              }`}>
                {message.role === 'user'
                  ? <User className="w-4 h-4 text-white/80" />
                  : <Bot className="w-4 h-4 text-white" />
                }
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-white/10 backdrop-blur-md border border-white/10 text-white'
                  : 'bg-white/5 backdrop-blur-md border border-white/10 text-white/90'
              }`}>
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/10">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-cyan-400/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-blue-400/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-purple-400/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input - Glass panel */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-md">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Hanzo AI anything..."
                className="w-full h-11 px-4 pr-12 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 hover:shadow-lg hover:shadow-cyan-500/20 transition-all active:scale-95"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
          <p className="text-[10px] text-white/20 text-center mt-2">
            Powered by Hanzo AI • Press Enter to send
          </p>
        </form>
      </div>
    </ZWindow>
  );
};

// ============================================================================
// App Definition
// ============================================================================

/**
 * Hanzo AI app manifest
 */
export const HanzoAIManifest = {
  identifier: 'ai.hanzo.assistant',
  name: 'Hanzo AI',
  version: '1.0.0',
  description: 'AI assistant for zOS',
  category: 'ai' as const,
  permissions: ['network'] as const,
  window: {
    type: 'default' as const,
    defaultSize: { width: 500, height: 600 },
    resizable: true,
    showInDock: true,
  },
};

/**
 * Hanzo AI menu bar configuration
 */
export const HanzoAIMenuBar = {
  menus: [
    {
      id: 'file',
      label: 'File',
      items: [
        { type: 'item' as const, id: 'newConversation', label: 'New Conversation', shortcut: '⌘N' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'exportChat', label: 'Export Chat...' },
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
        { type: 'item' as const, id: 'clearHistory', label: 'Clear History' },
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { type: 'item' as const, id: 'showHistory', label: 'Show History' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'compactMode', label: 'Compact Mode' },
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
        { type: 'item' as const, id: 'hanzoHelp', label: 'Hanzo AI Help' },
        { type: 'item' as const, id: 'feedback', label: 'Send Feedback' },
      ],
    },
  ],
};

/**
 * Hanzo AI dock configuration
 */
export const HanzoAIDockConfig = {
  contextMenu: [
    { type: 'item' as const, id: 'newConversation', label: 'New Conversation' },
    { type: 'separator' as const },
    { type: 'item' as const, id: 'options', label: 'Options' },
  ],
};

/**
 * Hanzo AI App definition for registry
 */
export const HanzoAIApp = {
  manifest: HanzoAIManifest,
  component: HanzoAIWindow,
  icon: Sparkles,
  menuBar: HanzoAIMenuBar,
  dockConfig: HanzoAIDockConfig,
};

export default HanzoAIWindow;
