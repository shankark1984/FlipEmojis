import React from 'react';
import type { CardItem } from '../game/rules';

interface CardProps {
  card: CardItem;
  index: number;
  boardSize: number;
  isMismatched?: boolean;
  isMatchedJustNow?: boolean;
  onClick: (index: number) => void;
  disabled?: boolean;
}

export const Card: React.FC<CardProps> = ({
  card,
  index,
  boardSize,
  isMismatched,
  isMatchedJustNow,
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

  const isRevealed = card.isFlipped || card.isMatched;

  return (
    <button
      type="button"
      onClick={() => onClick(index)}
      disabled={disabled || card.isMatched || card.isFlipped}
      aria-label={`Card ${index + 1}${card.isMatched ? `, Matched ${card.emoji}` : card.isFlipped ? `, Revealed ${card.emoji}` : ', Hidden'}`}
      className={`
        perspective-1000 relative select-none transition-transform duration-200 outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
        ${getCardSizeClasses()}
        ${disabled ? 'cursor-not-allowed' : card.isMatched ? 'cursor-default' : 'cursor-pointer hover:scale-105 active:scale-95'}
        ${isMismatched ? 'animate-[shake_0.4s_ease-in-out]' : ''}
        ${isMatchedJustNow ? 'animate-[bounce_0.5s_ease-in-out]' : ''}
      `}
      data-card-index={index}
      data-card-matched={card.isMatched}
      data-card-flipped={card.isFlipped}
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
            bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80 shadow-md
            hover:border-amber-500/50 hover:from-slate-750 hover:to-slate-850
            rounded-[inherit] text-slate-400
          `}
        >
          {boardSize <= 8 ? (
            <span className="opacity-40 text-sm sm:text-base font-mono">?</span>
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
