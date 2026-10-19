import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Smile, Flame, ThumbsUp, Zap } from 'lucide-react';
import { StorageService } from '../utils/storage';

export interface ChatMessage {
  id: string;
  sender: string;
  avatar: string;
  avatarBg: string;
  text: string;
  time: string;
  isReaction?: boolean;
}

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (text: string, isReaction?: boolean) => void;
}

const QUICK_TAUNTS = [
  'Nice match! 🔥',
  'Watch this streak! ⚡',
  'Almost had it! 😅',
  'My memory is photographic! 🧠',
  'Good Game! 🤝',
  'Too fast for you! 🏎️',
];

const EMOJI_REACTIONS = ['🔥', '👏', '😱', '😎', '🤯', '🥳', '💀', '💯'];

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
    StorageService.unlockAchievement('chat_enthusiast');
  };

  const handleReaction = (emoji: string) => {
    onSendMessage(emoji, true);
    StorageService.unlockAchievement('chat_enthusiast');
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xs sm:max-w-sm bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-slide-left">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">💬</span>
          <h3 className="font-bold text-white text-sm font-display">Live Game Chat</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Reactions Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-950 border-b border-slate-850 overflow-x-auto gap-1">
        {EMOJI_REACTIONS.map(emoji => (
          <button
            key={emoji}
            type="button"
            onClick={() => handleReaction(emoji)}
            className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center text-lg hover:scale-110 active:scale-95 transition-transform"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
        {messages.length === 0 ? (
          <div className="text-center text-xs text-slate-500 py-8">
            No messages yet. Send a quick reaction or taunt!
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className="flex items-start gap-2">
              <div className={`w-7 h-7 rounded-lg ${msg.avatarBg} flex items-center justify-center text-xs shrink-0 shadow-sm`}>
                {msg.avatar}
              </div>
              <div className="flex-1 bg-slate-950/80 border border-slate-850 p-2 rounded-xl">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                  <span className="font-semibold text-amber-300/90">{msg.sender}</span>
                  <span>{msg.time}</span>
                </div>
                <div className={`text-xs text-slate-100 ${msg.isReaction ? 'text-2xl py-1' : ''}`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Taunts */}
      <div className="px-3 py-1.5 bg-slate-950/60 border-t border-slate-850 flex gap-1.5 overflow-x-auto no-scrollbar">
        {QUICK_TAUNTS.map(taunt => (
          <button
            key={taunt}
            type="button"
            onClick={() => {
              onSendMessage(taunt);
              StorageService.unlockAchievement('chat_enthusiast');
            }}
            className="px-2 py-1 bg-slate-850 hover:bg-slate-800 text-[11px] text-slate-300 hover:text-white rounded-lg whitespace-nowrap shrink-0 transition-colors"
          >
            {taunt}
          </button>
        ))}
      </div>

      {/* Text Input */}
      <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          maxLength={80}
          onChange={e => setInputText(e.target.value)}
          placeholder="Type message..."
          className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2 bg-amber-400 disabled:opacity-40 text-slate-950 rounded-xl hover:bg-amber-300 transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
