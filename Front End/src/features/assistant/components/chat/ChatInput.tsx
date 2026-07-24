import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send, Loader2, Navigation, BarChart3, Search } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

const QUICK_ACTIONS = [
  { icon: Search, label: 'Find', prompt: 'Find ', color: 'text-primary bg-primary/5 border-primary/20 hover:bg-primary/10' },
  { icon: Navigation, label: 'Directions', prompt: 'Directions from ', color: 'text-muted-foreground bg-secondary border-border hover:bg-accent' },
  { icon: BarChart3, label: 'Analyze', prompt: 'Analyze the market for ', color: 'text-muted-foreground bg-secondary border-border hover:bg-accent' },
];

export default function ChatInput({ onSend, isLoading, placeholder = 'Ask anything...' }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  const handleSubmit = () => {
    if (message.trim() && !isLoading) {
      onSend(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleQuickAction = (prompt: string) => {
    setMessage(prompt);
    textareaRef.current?.focus();
  };

  return (
    <div className="p-3 border-t border-border bg-card">
      {/* Quick Action Buttons */}
      <div className="flex gap-1.5 mb-2 overflow-x-auto" role="toolbar" aria-label="Quick actions">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.label}
            onClick={() => handleQuickAction(action.prompt)}
            disabled={isLoading}
            aria-label={`${action.label}: ${action.prompt.trim()}`}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition-all whitespace-nowrap disabled:opacity-50 ${action.color}`}
          >
            <action.icon size={12} aria-hidden="true" />
            {action.label}
          </button>
        ))}
      </div>

      <div className="flex items-end gap-2 bg-background rounded-md border border-border p-2 focus-within:border-primary/50 transition-colors">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Chat message input"
          disabled={isLoading}
          rows={1}
          className="flex-1 bg-transparent text-sm text-foreground placeholder-muted-foreground resize-none outline-none min-h-[24px] max-h-[120px] py-1 px-2"
        />
        <button
          onClick={handleSubmit}
          disabled={!message.trim() || isLoading}
          aria-label={isLoading ? 'Sending message' : 'Send message'}
          className="flex-shrink-0 w-8 h-8 rounded-md bg-primary hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        >
          {isLoading ? (
            <Loader2 size={16} className="text-primary-foreground animate-spin" aria-hidden="true" />
          ) : (
            <Send size={16} className="text-primary-foreground" aria-hidden="true" />
          )}
        </button>
      </div>
      <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
        Press Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
