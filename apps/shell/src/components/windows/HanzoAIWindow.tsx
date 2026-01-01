import React, { useState, useRef, useEffect } from 'react';
import { ZWindow, useTheme } from '@z-os/ui';
import { Send, Bot, User, Sparkles, AlertCircle, Settings, Key } from 'lucide-react';

interface HanzoAIWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'error';
  content: string;
}

// Hanzo API configuration
const HANZO_API_URL = 'https://api.hanzo.ai/v1/chat/completions';

const HanzoAIWindow: React.FC<HanzoAIWindowProps> = ({ onClose, onFocus }) => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m Hanzo AI, your intelligent assistant. How can I help you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load API key from localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem('hanzo-api-key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveApiKey = (key: string) => {
    localStorage.setItem('hanzo-api-key', key);
    setApiKey(key);
    setShowApiKeyInput(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    try {
      // Build conversation history for context
      const conversationHistory = messages
        .filter(m => m.role !== 'error')
        .map(m => ({
          role: m.role,
          content: m.content
        }));

      conversationHistory.push({ role: 'user', content: userMessage.content });

      const response = await fetch(HANZO_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey && { 'Authorization': `Bearer ${apiKey}` }),
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are Hanzo AI, a helpful and intelligent assistant integrated into zOS. Be concise, friendly, and helpful.'
            },
            ...conversationHistory
          ],
          max_tokens: 1024,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      const aiContent = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiContent
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Hanzo AI error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'error',
        content: error instanceof Error ? error.message : 'Failed to connect to Hanzo AI'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
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
      <div className="flex flex-col h-full zos-bg-primary">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b zos-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 zos-text-primary" style={{ color: 'white' }} />
            </div>
            <div>
              <h2 className="zos-text-primary font-medium">Hanzo AI</h2>
              <p className="text-xs zos-text-muted flex items-center gap-1">
                {apiKey ? (
                  <>
                    <Key className="w-3 h-3 zos-text-green" />
                    <span className="zos-text-green">Connected</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 zos-text-yellow" />
                    <span className="zos-text-yellow">No API key</span>
                  </>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowApiKeyInput(true)}
            className="p-2 rounded-lg hover:bg-[var(--zos-surface-glass-hover)] transition-colors"
            title="API Settings"
          >
            <Settings className="w-4 h-4 zos-text-muted" />
          </button>
        </div>

        {/* API Key Input Modal */}
        {showApiKeyInput && (
          <div className="absolute inset-0 zos-surface-overlay flex items-center justify-center z-10">
            <div className="zos-bg-secondary rounded-xl p-6 w-80 border zos-border">
              <h3 className="zos-text-primary font-medium mb-3">Enter Hanzo API Key</h3>
              <input
                type="password"
                placeholder="sk-..."
                className="w-full h-10 px-3 rounded-lg zos-surface-glass border zos-border zos-text-primary placeholder:zos-text-muted focus:outline-none focus:border-[var(--zos-border-focus)] mb-3"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    saveApiKey((e.target as HTMLInputElement).value);
                  }
                }}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowApiKeyInput(false)}
                  className="flex-1 py-2 zos-surface-glass zos-text-primary rounded-lg hover:bg-[var(--zos-surface-glass-hover)]"
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => {
                    const input = (e.target as HTMLElement).parentElement?.previousElementSibling as HTMLInputElement;
                    if (input?.value) saveApiKey(input.value);
                  }}
                  className="flex-1 py-2 bg-gradient-to-br from-orange-400 to-pink-600 text-white rounded-lg hover:opacity-90"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'user'
                  ? 'bg-[var(--zos-accent-primary)]/20'
                  : message.role === 'error'
                  ? 'bg-[var(--zos-system-red)]/20'
                  : 'bg-gradient-to-br from-orange-400 to-pink-600'
              }`}>
                {message.role === 'user'
                  ? <User className="w-4 h-4 text-[var(--zos-accent-primary)]" />
                  : message.role === 'error'
                  ? <AlertCircle className="w-4 h-4 text-[var(--zos-system-red)]" />
                  : <Bot className="w-4 h-4 text-white" />
                }
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-[var(--zos-accent-primary)] text-white'
                  : message.role === 'error'
                  ? 'bg-[var(--zos-system-red)]/20 text-[var(--zos-system-red)]'
                  : 'zos-surface-glass zos-text-primary'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-600 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="zos-surface-glass rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-[var(--zos-text-muted)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-[var(--zos-text-muted)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-[var(--zos-text-muted)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t zos-border">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Hanzo AI anything..."
              className="flex-1 h-10 px-4 rounded-full zos-surface-glass border zos-border zos-text-primary placeholder:zos-text-muted focus:outline-none focus:border-[var(--zos-border-focus)]"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-600 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </form>
      </div>
    </ZWindow>
  );
};

export default HanzoAIWindow;
