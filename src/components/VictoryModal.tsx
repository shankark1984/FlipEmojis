import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { type Player, type BoardSize, getDifficultyByBoardSize, getTodayDateString } from '../game/rules';
import { Play, RotateCcw, Home, Trophy, Flame, Clock, Award, Star, CheckCircle, Sparkles } from 'lucide-react';

interface VictoryModalProps {
  isOpen: boolean;
  players: Player[];
  boardSize: BoardSize;
  moveCount: number;
  elapsedSeconds: number;
  maxStreak: number;
  gameMode?: 'solo' | 'daily' | 'pass_and_play' | 'online';
  dailyRank?: number;
  onPlayAgain: () => void;
  onNextSize: () => void;
  onHome: () => void;
  onViewDailyTop?: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  players,
  boardSize,
  moveCount,
  elapsedSeconds,
  maxStreak,
  gameMode = 'solo',
  dailyRank,
  onPlayAgain,
  onNextSize,
  onHome,
  onViewDailyTop,
}) => {
  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#8b5cf6'],
        });
      } catch {
        // ignore
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}m ${secs}s`;
  };

  const diff = getDifficultyByBoardSize(boardSize);
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];
  const isMultiplayer = players.length > 1;
  const isDaily = gameMode === 'daily';

  const totalPairs = (boardSize * boardSize) / 2;
  const accuracy = moveCount > 0 ? Math.min(100, Math.round((totalPairs / moveCount) * 100)) : 100;
  const isUnderPar = moveCount <= diff.parMoves;
  const stars = accuracy >= 65 || isUnderPar ? 3 : accuracy >= 40 ? 2 : 1;
  const todayStr = getTodayDateString();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 text-center relative max-h-[90vh] overflow-y-auto">
        {/* Animated Trophy Icon */}
        <div className="w-20 h-20 mx-auto -mt-10 rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-4xl shadow-xl shadow-amber-500/30 ring-4 ring-slate-900 mb-3 animate-bounce">
          {isDaily ? '⭐' : '🏆'}
        </div>

        {/* Title & Difficulty Badge */}
        <div className="flex items-center justify-center gap-2 mb-1">
          {isDaily ? (
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase font-mono bg-amber-500/20 text-amber-300 border-amber-500/40">
              Synchronized Daily Challenge · {todayStr}
            </span>
          ) : (
            <>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase font-mono ${diff.badgeColor}`}>
                {diff.name} Difficulty
              </span>
              <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                {diff.scoreMultiplier}x Multiplier
              </span>
            </>
          )}
        </div>

        <h2 className="text-2xl font-black font-display text-white mb-0.5">
          {isDaily
            ? 'Daily Challenge Completed!'
            : isMultiplayer
            ? `${winner.name} Wins!`
            : `${diff.name} Matrix Cleared!`}
        </h2>
        <p className="text-xs text-slate-400 mb-3 font-medium">
          {boardSize}x{boardSize} Grid ({totalPairs} Emoji Pairs) Completed!
        </p>

        {/* Daily Rank Ribbon */}
        {isDaily && dailyRank && (
          <div className="mb-3 p-2 bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/20 border border-amber-500/40 rounded-xl flex items-center justify-center gap-2 text-xs font-mono font-bold text-amber-300">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>You ranked #{dailyRank} on today's Daily Top Leaderboard!</span>
          </div>
        )}

        {/* Stars */}
        <div className="flex items-center justify-center gap-1.5 mb-3">
          {[1, 2, 3].map(st => (
            <Star
              key={st}
              className={`w-6 h-6 ${st <= stars ? 'text-amber-400 fill-amber-400 animate-pulse' : 'text-slate-700'}`}
            />
          ))}
        </div>

        {/* Par Performance Callout */}
        <div className={`mb-4 p-2 rounded-xl border text-xs font-mono flex items-center justify-center gap-2 ${isUnderPar ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>
          <CheckCircle className={`w-3.5 h-3.5 ${isUnderPar ? 'text-emerald-400' : 'text-slate-500'}`} />
          <span>
            Par: {diff.parMoves} moves · Cleared in {moveCount} moves {isUnderPar ? `(${diff.parMoves - moveCount} Under Par! ⭐)` : ''}
          </span>
        </div>

        {/* Multiplayer Leaderboard or Solo Metrics */}
        {isMultiplayer ? (
          <div className="mb-4 space-y-2 text-left">
            <span className="text-xs font-semibold text-slate-400 block px-1">Round Results:</span>
            {sortedPlayers.map((p, idx) => (
              <div
                key={p.id}
                className={`flex items-center justify-between p-2.5 rounded-xl border ${idx === 0 ? 'bg-amber-500/10 border-amber-500/50' : 'bg-slate-950/60 border-slate-850'}`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-amber-400 w-4">#{idx + 1}</span>
                  <div className={`w-7 h-7 rounded-lg ${p.avatarBg} flex items-center justify-center text-xs`}>
                    {p.avatar}
                  </div>
                  <span className="text-xs font-bold text-white">{p.name}</span>
                </div>
                <span className="font-mono font-black text-amber-400 text-sm">{p.score} pts</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 mb-4 text-left font-mono">
            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-500 block uppercase">Final Score ({diff.scoreMultiplier}x)</span>
              <span className="text-xl font-black text-amber-400 tabular-nums">{winner.score} pts</span>
            </div>
            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-500 block uppercase">Peak Streak</span>
              <div className="flex items-center gap-1 text-orange-400">
                <Flame className="w-4 h-4" />
                <span className="text-xl font-black tabular-nums">{maxStreak}</span>
              </div>
            </div>
            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-500 block uppercase">Accuracy</span>
              <span className="text-sm font-bold text-white tabular-nums">{accuracy}%</span>
            </div>
            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-500 block uppercase">Clear Time</span>
              <div className="flex items-center gap-1 text-slate-300">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-sm font-bold tabular-nums">{formatTime(elapsedSeconds)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {isDaily && onViewDailyTop && (
            <button
              type="button"
              onClick={onViewDailyTop}
              className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4 fill-slate-950" />
              <span>View Daily Top Leaderboard</span>
            </button>
          )}

          <button
            type="button"
            data-start="true"
            onClick={onPlayAgain}
            className={`w-full py-2.5 ${isDaily ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950'} font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again {isDaily ? '(Re-try Daily Board)' : `(${diff.name} · ${boardSize}x${boardSize})`}</span>
          </button>

          {!isDaily && boardSize < 32 && (
            <button
              type="button"
              onClick={onNextSize}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>
                Next Difficulty: {boardSize === 4 ? 'Standard (6x6)' : boardSize === 6 ? 'Medium (8x8)' : boardSize === 8 ? 'Hard (16x16)' : 'Titan (32x32)'}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={onHome}
            className="w-full py-2 text-xs text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Title Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
