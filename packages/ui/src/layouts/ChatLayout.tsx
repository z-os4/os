/**
 * ChatLayout - Messaging interface layout
 * 
 * Features:
 * - Header with avatar, title, status, actions
 * - Scrollable message area
 * - Fixed input area at bottom
 * 
 * @example
 * <ChatLayout
 *   header={{ title: 'Hanzo AI', status: 'Online', avatar: <Bot /> }}
 *   messages={messages.map(m => <Message key={m.id} {...m} />)}
 *   input={<ChatInput onSend={handleSend} />}
 * />
 */

import React, { ReactNode, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';

export interface ChatLayoutHeader {
  avatar?: ReactNode;
  title: string;
  subtitle?: string;
  status?: ReactNode;
  actions?: ReactNode;
}

export interface ChatLayoutProps {
  header?: ChatLayoutHeader;
  messages: ReactNode;
  input: ReactNode;
  className?: string;
  onScrollToBottom?: () => void;
  autoScroll?: boolean;
}

export function ChatLayout({
  header,
  messages,
  input,
  className,
  autoScroll = true,
}: ChatLayoutProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  return (
    <div className={cn('flex flex-col h-full bg-zos-bg-primary', className)}>
      {/* Header */}
      {header && (
        <div className="flex items-center justify-between p-4 border-b border-zos-border-primary">
          <div className="flex items-center gap-3">
            {header.avatar && (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-600 flex items-center justify-center">
                {header.avatar}
              </div>
            )}
            <div>
              <h2 className="text-zos-text-primary font-medium">{header.title}</h2>
              {(header.subtitle || header.status) && (
                <p className="text-xs text-zos-text-muted flex items-center gap-1">
                  {header.status}
                  {header.subtitle}
                </p>
              )}
            </div>
          </div>
          {header.actions && (
            <div className="flex items-center gap-2">
              {header.actions}
            </div>
          )}
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-zos-border-primary">
        {input}
      </div>
    </div>
  );
}

export default ChatLayout;
