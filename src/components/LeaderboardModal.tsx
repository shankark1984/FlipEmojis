import React, { useState, useEffect } from 'react';
import type { LeaderboardEntry } from '../utils/storage';
import { StorageService } from '../utils/storage';
import { getTodayDateString } from '../game/rules';
import { X, Trophy, Medal, Flame, Clock, Sparkles, Calendar, Play, TrendingUp, CheckCircle2, XCircle, Award } from 'lucide-react';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'daily' | 'all_time';
  onPlayDaily?: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'daily',
  onPlayDaily,
}) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'all_time'>(initialTab);
  const [filterSize, setFilterSize] = useState<number | undefined>(undefined);
  const [timeLeft, setTimeLeft] = useState<string>('');

  const todayStr = getTodayDateString();

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  // Live countdown to midnight UTC reset for Daily Challenge
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
      const diffMs = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  const dailyEntries = StorageService.getDailyLeaderboards(todayStr);
  const allTimeEntries = StorageService.getLeaderboards(filterSize);
  const currentEntries = activeTab === 'daily' ? dailyEntries : allTimeEntries;
  const userDailyRecord = StorageService.getDailyRecord(todayStr);
  const stats = StorageService.getStats();
  const ranking = StorageService.getRankingTier(stats.totalScore || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-6 relative max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white font-display">Hall of Memory Champions</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player Total Points & Ranking System Card */}
        <div className="mt-3 p-3.5 bg-gradient-to-br from-slate-950 to-slate-900/90 border border-amber-500/30 rounded-2xl shadow-inner">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{ranking.badge}</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">{ranking.tier}</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Tier {ranking.level}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Career Points: <strong className="text-amber-400 font-mono text-xs">{(stats.totalScore || 0).toLocaleString()} pts</strong>
                </p>
              </div>
            </div>

            {/* Win/Loss percentage data */}
            <div className="flex items-center gap-3 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 text-[11px]">
              <div className="flex items-center gap-1 text-emerald-400" title="Winning Boards">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="font-mono font-bold">{stats.gamesWon || 0}W</span>
              </div>
              <div className="flex items-center gap-1 text-rose-400" title="Losing Boards">
                <XCircle className="w-3.5 h-3.5" />
                <span className="font-mono font-bold">{stats.gamesLost || 0}L</span>
              </div>
              <div className="text-amber-300 font-mono font-bold pl-1 border-l border-slate-700" title="Win Rate Percentage">
                {stats.winPercentage || 0}% Win
              </div>
            </div>
          </div>

          {/* Tier Progress Bar */}
          {ranking.nextTier && (
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Progress to {ranking.nextTier}</span>
                <span className="font-mono text-amber-300">{(ranking.pointsToNext ?? 0).toLocaleString()} pts remaining</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${ranking.progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Tab Selection: Daily Top vs All-Time */}
        <div className="grid grid-cols-2 gap-2 mt-3 p-1 bg-slate-950 rounded-2xl border border-slate-800/80">
          <button
            type="button"
            onClick={() => setActiveTab('daily')}
            className={`
              flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all
              ${activeTab === 'daily'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }
            `}
          >
            <Sparkles className="w-4 h-4" />
            <span>Daily Top Challenge</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/20 font-mono">
              Live
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('all_time')}
            className={`
              flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all
              ${activeTab === 'all_time'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }
            `}
          >
            <Medal className="w-4 h-4" />
            <span>All-Time Records</span>
          </button>
        </div>

        {/* Daily Challenge Info Banner */}
        {activeTab === 'daily' ? (
          <div className="mt-3 p-3 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/25 rounded-2xl flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-bold text-white">Daily Board: {todayStr}</span>
                <span className="text-[10px] text-amber-400 font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-500/30">
                  Fixed Layout (6x6)
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Resets in: <span className="font-mono font-bold text-amber-300">{timeLeft || 'calculating...'}</span> (Midnight UTC)
              </div>
            </div>

            {userDailyRecord ? (
              <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-amber-500/30">
                <span className="text-[10px] text-slate-400">Your Rank:</span>
                <span className="text-sm font-mono font-black text-amber-400">#{userDailyRecord.rank}</span>
                <span className="text-[11px] font-mono font-bold text-slate-300">({userDailyRecord.score} pts)</span>
              </div>
            ) : onPlayDaily ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onPlayDaily();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>Play Today</span>
              </button>
            ) : null}
          </div>
        ) : (
          /* All-Time Grid Size Filter Bar */
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl my-3 overflow-x-auto">
            {[
              { label: 'All Grids', val: undefined },
              { label: '4x4', val: 4 },
              { label: '6x6', val: 6 },
              { label: '8x8', val: 8 },
              { label: '16x16', val: 16 },
              { label: '32x32', val: 32 },
            ].map(f => (
              <button
                key={f.label}
                type="button"
                onClick={() => setFilterSize(f.val)}
                className={`
                  px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors
                  ${filterSize === f.val ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}
                `}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 mt-3">
          {currentEntries.length === 0 ? (
            <div className="text-center text-xs text-slate-500 py-10">
              No records for this board yet. Be the first to conquer it!
            </div>
          ) : (
            currentEntries.map((entry, index) => {
              const rank = index + 1;
              const isTop3 = rank <= 3;
              return (
                <div
                  key={entry.id}
                  className={`
                    flex items-center justify-between p-3 rounded-2xl border transition-all
                    ${entry.isCurrentUser
                      ? 'bg-amber-500/15 border-amber-500/60 shadow-md ring-1 ring-amber-400/30'
                      : isTop3
                      ? 'bg-slate-950/90 border-slate-800'
                      : 'bg-slate-950/50 border-slate-850'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Indicator */}
                    <div className="w-6 text-center font-mono font-bold text-xs">
                      {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                    </div>

                    {/* Avatar & Name */}
                    <div className={`w-8 h-8 rounded-xl ${entry.avatarBg} flex items-center justify-center text-base shadow-sm`}>
                      {entry.avatar}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">
                          {entry.playerName}
                        </span>
                        {entry.isCurrentUser && (
                          <span className="text-[9px] px-1 py-0.2 bg-amber-500/30 text-amber-300 rounded font-semibold">YOU</span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {entry.boardSize}x{entry.boardSize} Grid · {entry.date} · {entry.moves} moves
                      </span>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="flex items-center gap-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-mono font-black text-amber-400 text-sm tabular-nums">
                        {entry.score} pts
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Flame className="w-2.5 h-2.5 text-orange-400" />
                        <span>Streak {entry.streak}</span>
                        <span className="mx-0.5">·</span>
                        <Clock className="w-2.5 h-2.5 text-cyan-400" />
                        <span>{entry.timeSeconds}s</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
