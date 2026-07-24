import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trash2, SquarePen, Info, Menu } from 'lucide-react';
import SearchBar from '@/features/assistant/components/map/SearchBar';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { ChatMessage as ChatMessageType } from '@/shared/types/chat';

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessageType[];
  isLoading: boolean;
  isAnalyzing?: boolean;
  onSendMessage: (message: string) => void;
  onSearch: (query: string) => void;
  onClearSearch: () => void;
  isSearching: boolean;
  recentSearches: string[];
  onClearMap: () => void;
  onNewChat: () => void;
  hasMarkers: boolean;
  hasDirections: boolean;
}

function IconTooltip({ label, children, align = 'center' }: { label: string; children: React.ReactNode; align?: 'center' | 'right' }) {
  const posClass = align === 'right' ? 'right-0' : 'left-1/2 -translate-x-1/2';
  return (
    <div className="relative group">
      {children}
      <div className={`absolute top-full ${posClass} mt-2 px-2 py-1 bg-card border border-border rounded-md text-[10px] text-muted-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-[80]`}>
        {label}
      </div>
    </div>
  );
}

function SuggestionButton({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left text-sm text-muted-foreground hover:text-primary bg-background hover:bg-accent border border-border hover:border-primary/30 rounded-md px-3 py-2 transition-all"
    >
      {text}
    </button>
  );
}

export default function ChatSidebar({
  isOpen,
  onClose,
  messages,
  isLoading,
  isAnalyzing,
  onSendMessage,
  onSearch,
  onClearSearch,
  isSearching,
  recentSearches,
  onClearMap,
  onNewChat,
  hasMarkers,
  hasDirections,
}: ChatSidebarProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAnalyzing]);

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <Sparkles size={16} className="text-primary-foreground" />
            </div>
            <div className="flex flex-col min-w-0">
              <h2 className="text-sm font-medium text-foreground leading-tight truncate">AI Chat</h2>
              <p className="text-[11px] text-muted-foreground leading-tight truncate">Property Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {messages.length > 0 && (
              <IconTooltip label="New Chat" align="right">
                <button
                  onClick={onNewChat}
                  aria-label="New chat"
                  className="w-7 h-7 rounded-md hover:bg-accent flex items-center justify-center transition-colors"
                >
                  <SquarePen size={14} className="text-muted-foreground" />
                </button>
              </IconTooltip>
            )}
            <IconTooltip label="Guide" align="right">
              <button
                onClick={() => setIsGuideOpen((prev) => !prev)}
                aria-label="Toggle guide"
                className="w-7 h-7 rounded-md hover:bg-accent flex items-center justify-center transition-colors"
              >
                <Info size={14} className="text-muted-foreground" />
              </button>
            </IconTooltip>
            <IconTooltip label="Close" align="right">
              <button
                onClick={onClose}
                aria-label="Close chat panel"
                className="w-7 h-7 rounded-md hover:bg-accent flex items-center justify-center transition-colors"
              >
                <Menu size={14} className="text-muted-foreground" />
              </button>
            </IconTooltip>
          </div>
        </div>
      </div>

      {/* Guide Modal */}
      <AnimatePresence>
        {isGuideOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGuideOpen(false)}
              aria-hidden="true"
              className="fixed inset-0 z-[60] bg-black/30"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.2 }}
              role="dialog"
              aria-modal="true"
              aria-label="Assistant guide"
              className="fixed left-1/2 top-1/2 z-[70] w-[90vw] max-w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-md border border-border bg-card shadow-lg"
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div>
                  <h3 className="text-sm font-medium text-foreground">What can I ask?</h3>
                  <p className="text-[11px] text-muted-foreground">Quick guide to AI Assistant capabilities</p>
                </div>
                <button
                  onClick={() => setIsGuideOpen(false)}
                  aria-label="Close guide"
                  className="w-7 h-7 rounded-md hover:bg-accent flex items-center justify-center transition-colors"
                >
                  <Menu size={14} className="text-muted-foreground" />
                </button>
              </div>
              <div className="p-4 text-xs text-secondary-foreground space-y-3">
                <div className="text-muted-foreground">
                  Capabilities: search places, directions, market analysis, accessibility scoring, and environment insights.
                </div>
                <div className="text-muted-foreground">
                  Limits: can&apos;t search private databases, real-time traffic incidents, or places without public Google Maps listings.
                </div>
                <div className="grid gap-2">
                  <SuggestionButton text="Find cafes in Kuala Lumpur" onClick={() => onSendMessage('Find cafes in Kuala Lumpur')} />
                  <SuggestionButton text="Directions from KL Sentral to KLCC" onClick={() => onSendMessage('Directions from KL Sentral to KLCC')} />
                  <SuggestionButton text="Analyze market for gyms in Petaling Jaya" onClick={() => onSendMessage('Analyze market for gyms in Petaling Jaya')} />
                  <SuggestionButton text="How accessible is Mid Valley Megamall?" onClick={() => onSendMessage('How accessible is Mid Valley Megamall?')} />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Search Bar */}
      <SearchBar
        onSearch={onSearch}
        onClear={onClearSearch}
        isSearching={isSearching}
        recentSearches={recentSearches}
      />

      {/* Chat Messages */}
      <div role="log" aria-label="Chat messages" aria-live="polite" className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles size={24} className="text-primary" />
            </div>
            <h3 className="text-base font-medium text-foreground mb-1">
              AI Assistant
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Find the best location to open your business using AI-powered competitor analysis.
            </p>
            <div className="space-y-2 w-full">
              <SuggestionButton text="Open a Pet Cafe in Selangor" onClick={() => onSendMessage('I want to open a Pet Cafe in Selangor. Where should I set up?')} />
              <SuggestionButton text="Gym at Bukit Jalil" onClick={() => onSendMessage('I want to open a Gym at Bukit Jalil. Analyze the competition and find the best location.')} />
              <SuggestionButton text="Coffee Shop in KL" onClick={() => onSendMessage('Analyze the market for opening a Coffee Shop in Kuala Lumpur. Where are the gaps?')} />
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {(isLoading || isAnalyzing) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                    <Sparkles size={14} className="text-primary" />
                  </motion.div>
                </div>
                <div className="flex-1">
                  <div className="rounded-md px-3 py-2 bg-card border border-border">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {isAnalyzing ? 'Analyzing market data' : 'Thinking'}
                      </span>
                      <motion.span
                        className="text-sm text-primary"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        ...
                      </motion.span>
                    </div>
                    {isAnalyzing && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 15, ease: 'easeOut' }}
                        className="h-0.5 bg-primary rounded-full mt-2"
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Clear Map Button */}
      {(hasMarkers || hasDirections) && (
        <div className="px-3 pb-2">
          <button
            onClick={onClearMap}
            className="w-full py-2 px-3 bg-critical-soft hover:bg-critical/10 border border-critical/20 hover:border-critical/40 rounded-md text-critical text-sm font-medium transition-all flex items-center justify-center gap-2"
          >
            <Trash2 size={14} />
            Clear All Markers
          </button>
        </div>
      )}

      {/* Chat Input */}
      <ChatInput onSend={onSendMessage} isLoading={isLoading} />
    </div>
  );
}
