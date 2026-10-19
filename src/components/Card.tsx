import React from 'react';
import type { CardItem } from '../game/rules';

interface CardProps {
  card: CardItem;
  index: number;
  boardSize: number;
  isMismatched?: boolean;
  isMatchedJustNow?: boolean;
  isHinted?: boolean;
  cardBackTheme?: 'classic' | 'cyber' | 'galactic' | 'gold';
  onClick: (index: number) => void;
  disabled?: boolean;
}

export const Card: React.FC<CardProps> = ({
  card,
  index,
  boardSize,
  isMismatched,
  isMatchedJustNow,
  isHinted,
  cardBackTheme = 'classic',
  onClick,
  disabled,
}) => {
  // Compute responsive sizing based on board size
  const getCardSizeClasses = () => {
    switch (boardSize) {
      case 4:
        return 'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-2xl sm:text-3xl md:text-4xl rounded-2xl';
      case 6:
        return 'w-12 h-12 sm:w-16 sm:h-16 md:w-18 md:h-18 text-xl sm:text-2xl md:text-3xl rounded-xl';
      case 8:
        return 'w-9 h-9 sm:w-11 sm:h-11 md:w-13 md:h-13 text-base sm:text-xl md:text-2xl rounded-lg';
      case 16:
        return 'w-6 h-6 sm:w-7 sm:h-7 text-xs sm:text-sm rounded-md';
      case 32:
        return 'w-4 h-4 sm:w-5 sm:h-5 text-[9px] sm:text-[11px] rounded-[3px]';
      default:
        return 'w-16 h-16 text-3xl rounded-xl';
    }
  };

  const getThemeFrontClasses = () => {
    switch (cardBackTheme) {
      case 'cyber':
        return 'bg-gradient-to-br from-cyan-950 via-slate-900 to-fuchsia-950 border-cyan-500/50 hover:border-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)] text-cyan-300';
      case 'galactic':
        return 'bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 border-purple-500/50 hover:border-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.25)] text-purple-300';
      case 'gold':
        return 'bg-gradient-to-br from-amber-700 via-yellow-600 to-amber-900 border-yellow-400/70 hover:border-yellow-200 shadow-[0_0_14px_rgba(234,179,8,0.35)] text-yellow-100';
      default:
        return 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700/80 hover:border-amber-500/50 text-slate-400';
    }
  };

  const isRevealed = card.isFlipped || card.isMatched;

  return (
    <button
      type="button"
      onClick={() => onClick(index)}
      disabled={disabled || card.isMatched || card.isFlipped}
      aria-label={`Card ${index + 1}${card.isMatched ? `, Matched ${card.emoji}` : card.isFlipped ? `, Revealed ${card.emoji}` : ', Hidden'}`}
      className={`
        perspective-1000 relative select-none transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
        ${getCardSizeClasses()}
        ${disabled ? 'cursor-not-allowed' : card.isMatched ? 'cursor-default' : 'cursor-pointer hover:scale-105 active:scale-95'}
        ${isMismatched ? 'animate-[shake_0.4s_ease-in-out]' : ''}
        ${isMatchedJustNow ? 'animate-[bounce_0.5s_ease-in-out]' : ''}
        ${isHinted ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-slate-950 scale-105 shadow-2xl shadow-amber-400/90 z-20 animate-[pulse_1.2s_infinite]' : ''}
      `}
      data-card-index={index}
      data-card-matched={card.isMatched}
      data-card-flipped={card.isFlipped}
      data-card-hinted={isHinted}
    >
      <div
        className={`
          w-full h-full relative preserve-3d transition-transform duration-350 ease-out
          ${isRevealed ? 'rotate-y-180' : ''}
        `}
      >
        {/* Card Front (Hidden Box) */}
        <div
          className={`
            absolute inset-0 backface-hidden flex items-center justify-center font-bold
            border shadow-md rounded-[inherit] transition-all
            ${getThemeFrontClasses()}
          `}
        >
          {isHinted ? (
            <span className="text-amber-300 text-sm sm:text-base font-black animate-bounce">💡</span>
          ) : boardSize <= 8 ? (
            <span className="opacity-40 text-sm sm:text-base font-mono">
              {cardBackTheme === 'cyber' ? '⚡' : cardBackTheme === 'gold' ? '👑' : cardBackTheme === 'galactic' ? '✦' : '?'}
            </span>
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-slate-600/60" />
          )}
        </div>

        {/* Card Back (Revealed Emoji) */}
        <div
          className={`
            absolute inset-0 backface-hidden rotate-y-180 flex items-center justify-center
            rounded-[inherit] border shadow-lg transition-colors
            ${card.isMatched
              ? 'bg-gradient-to-br from-emerald-900/60 to-emerald-950/80 border-emerald-500/60 shadow-emerald-500/20'
              : 'bg-gradient-to-br from-slate-700 to-slate-850 border-amber-400/70 shadow-amber-500/20'
            }
          `}
        >
          <span className="transform transition-transform scale-110 drop-shadow-md select-none leading-none">
            {card.emoji}
          </span>
          {card.isMatched && boardSize <= 8 && (
            <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400" />
          )}
        </div>
      </div>
    </button>
  );
};
