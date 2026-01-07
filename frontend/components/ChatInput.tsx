'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send, Mic } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface ChatInputProps {
  onSend: (message: string) => void;
  onVoiceClick: () => void;
  disabled?: boolean;
  showVoice?: boolean;
}

export function ChatInput({
  onSend,
  onVoiceClick,
  disabled = false,
  showVoice = true,
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSend(trimmedMessage);
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

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 120);
      textarea.style.height = `${newHeight}px`;
    }
  };

  useEffect(() => {
    if (textareaRef.current && !disabled) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  return (
    <div className="glass-strong rounded-2xl p-2">
      <div className="flex items-end gap-2">
        {showVoice && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onVoiceClick}
            disabled={disabled}
            className={clsx(
              'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
              'bg-secondary hover:bg-secondary/80',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            aria-label="Voice input"
          >
            <Mic size={18} className="text-foreground" />
          </motion.button>
        )}

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Message JARVIS..."
            disabled={disabled}
            rows={1}
            className={clsx(
              'w-full resize-none bg-transparent text-foreground placeholder-muted-foreground',
              'px-4 py-2.5 rounded-xl outline-none',
              'text-[15px] leading-relaxed',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            style={{ maxHeight: '120px' }}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          disabled={disabled || !message.trim()}
          className={clsx(
            'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
            message.trim() && !disabled
              ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
              : 'bg-secondary text-muted-foreground',
            (disabled || !message.trim()) && 'opacity-50 cursor-not-allowed'
          )}
          aria-label="Send message"
        >
          <Send size={18} />
        </motion.button>
      </div>
    </div>
  );
}
