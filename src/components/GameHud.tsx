import React from 'react';
import type { Player, BoardSize, DifficultyConfig } from '../game/rules';
import { Volume2, VolumeX, Pause, MessageSquare, Flame, Sparkles, Eye, Sun, Moon } from 'lucide-react';

interface GameHudProps {
  players: Player[];
  activePlayerIndex: number;
  gameMode: 'solo' | 'daily' | 'pass_and_play' | 'online';
  boardSize: BoardSize;
  difficulty: DifficultyConfig;
  moveCount: number;
  elapsedSeconds: number;
  currentStreak: number;
  matchedPairs: number;
  totalPairs: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onOpenChat?: () => void;
  unreadChatCount?: number;
  scorePopups?: { id: string; text: string; isPositive: boolean }[];
  onPeekHint?: () => void;
  peekHintsRemaining?: number;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  coins?: number;
  isProPass?: boolean;
  onOpenShop?: () => void;
  onFindMatchTip?: () => void;
}

export const GameHud: React.FC<GameHudProps> = ({
  players,
  activePlayerIndex,
  gameMode,
  boardSize,
  difficulty,
  moveCount,
  elapsedSeconds,
  currentStreak,
  matchedPairs,
  totalPairs,
  isMuted,
  onToggleMute,
  onPause,
  onOpenChat,
  unreadChatCount = 0,
  scorePopups = [],
  onPeekHint,
  peekHintsRemaining = 0,
  theme,
  onToggleTheme,
  coins,
  isProPass,
  onOpenShop,
  onFindMatchTip,
}) => {
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const activePlayer = players[activePlayerIndex] || players[0];
  const isUnderPar = moveCount <= difficulty.parMoves;
  const isDaily = gameMode === 'daily';

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-2 select-none">
      {/* Top Utility and Status Bar */}
      <div className="flex items-center justify-between gap-4 py-2 px-4 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg backdrop-blur-sm">
        
        {/* Brand & Board & Difficulty info */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-xl shadow-md shadow-amber-500/20">
            {isDaily ? '⭐' : '🃏'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-white text-base tracking-tight">Flip Emojis</span>
              {isDaily ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase font-mono bg-amber-500/20 text-amber-300 border-amber-500/40">
                  Daily Challenge · 6x6 Sync
                </span>
              ) : (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase font-mono ${difficulty.badgeColor}`}>
                  {difficulty.name} {boardSize}x{boardSize} ({difficulty.scoreMultiplier}x)
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-2">
              <span>{matchedPairs} / {totalPairs} Pairs</span>
              <span>·</span>
              <span className="capitalize">{gameMode === 'daily' ? 'Daily Top Challenge' : gameMode.replace(/_/g, ' ')}</span>
            </div>
          </div>
        </div>

        {/* Players & Turns Bar */}
        <div className="flex items-center gap-2 sm:gap-4">
          {players.map((p, idx) => {
            const isActive = idx === activePlayerIndex && gameMode !== 'solo' && gameMode !== 'daily';
            return (
              <div
                key={p.id}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all relative
                  ${isActive
                    ? 'bg-amber-500/10 border-amber-500/60 shadow-sm shadow-amber-500/10 ring-1 ring-amber-400/40'
                    : 'bg-slate-850/60 border-slate-800 text-slate-400'
                  }
                `}
              >
                <div className={`w-7 h-7 rounded-lg ${p.avatarBg || 'bg-slate-700'} flex items-center justify-center text-sm shadow-inner`}>
                  {p.avatar}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-semibold max-w-[80px] sm:max-w-[110px] truncate ${isActive ? 'text-amber-300' : 'text-slate-300'}`}>
                      {p.name}
                    </span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    )}
                  </div>
                  <span className="text-xs font-mono font-bold text-white tabular-nums">
                    {p.score} pts
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Utility Controls */}
        <div className="flex items-center gap-1.5">
          {/* Find Next Match (Tip) button */}
          {onFindMatchTip && (
            <button
              type="button"
              onClick={onFindMatchTip}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/50 rounded-xl text-xs font-bold transition shadow-sm active:scale-95 group"
              title="Find next matching pair on board (Uses 25 coins or free with VIP Master Pass)"
              aria-label="Find next matching pair tip"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline">Tip</span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-200 border border-amber-400/30">
                {isProPass ? 'FREE' : '25 🪙'}
              </span>
            </button>
          )}

          {/* Coins Balance pill */}
          {typeof coins === 'number' && (
            <button
              type="button"
              onClick={onOpenShop}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-800 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-mono font-bold transition"
              title="Open Coin & Pro Store"
              aria-label="Coin balance and shop"
            >
              <span>🪙</span>
              <span>{coins.toLocaleString()}</span>
            </button>
          )}

          {/* Peek Hint button for Easy / Standard */}
          {onPeekHint && peekHintsRemaining > 0 && (
            <button
              type="button"
              onClick={onPeekHint}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-semibold transition-colors"
              title="Peek at 1 matching pair"
              aria-label="Use peek hint"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Peek</span>
              <span className="font-mono text-[10px] bg-amber-400/20 px-1 rounded">
                {peekHintsRemaining}
              </span>
            </button>
          )}

          {onOpenChat && (
            <button
              type="button"
              onClick={onOpenChat}
              className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              title="Open Chat"
              aria-label="Open Game Chat"
            >
              <MessageSquare className="w-4 h-4" />
              {unreadChatCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full" />
              )}
            </button>
          )}

          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>
          )}

          <button
            type="button"
            onClick={onToggleMute}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onPause}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            title="Pause Game"
            aria-label="Pause Game"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Secondary Metrics Strip: Score, Streak, Moves vs Par, Timer */}
      <div className="flex items-center justify-between gap-3 mt-2 px-4 py-2 bg-slate-900/50 border border-slate-800/60 rounded-xl text-xs">
        {/* Live Score & Floating Popups */}
        <div className="flex items-center gap-3 relative">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Score:</span>
            <span className="font-mono font-black text-amber-400 text-sm tabular-nums">
              {activePlayer.score}
            </span>
          </div>

          {/* Floating score feedback popups */}
          <div className="flex items-center gap-1">
            {scorePopups.slice(-2).map(popup => (
              <span
                key={popup.id}
                className={`
                  font-mono text-xs font-extrabold px-1.5 py-0.5 rounded animate-[bounce_0.6s_ease-out]
                  ${popup.isPositive ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-500/30' : 'text-rose-400 bg-rose-950/60 border border-rose-500/30'}
                `}
              >
                {popup.text}
              </span>
            ))}
          </div>
        </div>

        {/* Streak Combo Bar */}
        <div className="flex items-center gap-2">
          {currentStreak > 0 ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 border border-orange-500/40 text-orange-300 font-semibold shadow-sm animate-pulse">
              <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
              <span>Streak x{currentStreak}</span>
              {currentStreak >= 1 && (
                <span className="text-[10px] text-amber-200 bg-orange-600/50 px-1 rounded font-mono">
                  +{Math.round(currentStreak * difficulty.streakBonusRate * difficulty.scoreMultiplier)} bonus!
                </span>
              )}
            </div>
          ) : (
            <div className="text-slate-500 flex items-center gap-1 text-[11px]">
              <Sparkles className="w-3 h-3 text-slate-600" />
              <span>{difficulty.name} Challenge · Match pairs in a row for combo bonus!</span>
            </div>
          )}
        </div>

        {/* Moves & Par & Elapsed Time */}
        <div className="flex items-center gap-4 text-slate-300 font-mono tabular-nums">
          <div>
            <span className="text-slate-500 text-[11px] mr-1">Moves:</span>
            <span className={`font-bold ${isUnderPar ? 'text-emerald-400' : 'text-amber-400'}`}>
              {moveCount}
            </span>
            <span className="text-slate-500 text-[10px] ml-0.5">/ {difficulty.parMoves} par</span>
          </div>
          <div>
            <span className="text-slate-500 text-[11px] mr-1">Time:</span>
            <span className="font-bold">{formatTime(elapsedSeconds)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
