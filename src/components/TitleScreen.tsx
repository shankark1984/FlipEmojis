import React, { useState, useEffect } from 'react';
import { type BoardSize, getDifficultyByBoardSize, getTodayDateString } from '../game/rules';
import type { UserProfile } from '../utils/storage';
import { StorageService } from '../utils/storage';
import {
  Play,
  Users,
  Globe,
  Trophy,
  Award,
  Sparkles,
  UserCheck,
  Flame,
  Zap,
  Sun,
  Moon,
  Calendar,
  Smartphone,
  ShieldCheck,
  Coins,
  Download,
  Tv,
  Crown,
  CreditCard,
} from 'lucide-react';

interface TitleScreenProps {
  profile: UserProfile;
  selectedBoardSize: BoardSize;
  onSelectBoardSize: (size: BoardSize) => void;
  selectedMode: 'solo' | 'daily' | 'pass_and_play' | 'online';
  onSelectMode: (mode: 'solo' | 'daily' | 'pass_and_play' | 'online') => void;
  playerCount: number;
  onSetPlayerCount: (count: number) => void;
  onStartGame: () => void;
  onOpenAvatar: () => void;
  onOpenLeaderboard: () => void;
  onOpenAchievements: () => void;
  onOpenOnlineRoom: () => void;
  onOpenSocialLogin?: () => void;
  onOpenDevices?: () => void;
  onOpenShop?: () => void;
  onOpenRewardedAd?: () => void;
  onOpenInstallModal?: () => void;
  onOpenGooglePlayGuide?: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  profile,
  selectedBoardSize,
  onSelectBoardSize,
  selectedMode,
  onSelectMode,
  playerCount,
  onSetPlayerCount,
  onStartGame,
  onOpenAvatar,
  onOpenLeaderboard,
  onOpenAchievements,
  onOpenOnlineRoom,
  onOpenSocialLogin,
  onOpenDevices,
  onOpenShop,
  onOpenRewardedAd,
  onOpenInstallModal,
  onOpenGooglePlayGuide,
  theme,
  onToggleTheme,
}) => {
  const [dailyCountdown, setDailyCountdown] = useState<string>('');
  const todayStr = getTodayDateString();
  const dailyRecord = StorageService.getDailyRecord(todayStr);
  const currentDeviceId = StorageService.getDeviceId();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
      const diffMs = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      setDailyCountdown(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const boardSizes: { size: BoardSize; label: string; cards: number; desc: string; badge?: string }[] = [
    { size: 4, label: '4x4', cards: 16, desc: '8 Pairs · Fast & snappy' },
    { size: 6, label: '6x6', cards: 36, desc: '18 Pairs · Classic challenge' },
    { size: 8, label: '8x8', cards: 64, desc: '32 Pairs · Memory master' },
    { size: 16, label: '16x16', cards: 256, desc: '128 Pairs · Grand arena', badge: 'Hot' },
    { size: 32, label: '32x32', cards: 1024, desc: '512 Pairs · Titan matrix', badge: 'Mega' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-3 sm:py-6 flex flex-col items-center justify-center min-h-[85vh]">
      {/* Top Profile / Social Bar */}
      <div className="w-full flex items-center justify-between mb-3 sm:mb-6">
        <button
          type="button"
          onClick={onOpenAvatar}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 dark:bg-slate-900/90 light-card border border-slate-800 dark:border-slate-800 hover:border-amber-500/50 transition-all text-left group"
        >
          <div className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-full ${profile.avatarBg} flex items-center justify-center text-sm sm:text-base shadow-sm group-hover:scale-110 transition-transform`}>
            {profile.avatar}
            {profile.isProPass && (
              <span className="absolute -top-1 -right-1 text-[10px]">👑</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                {profile.name}
              </span>
              <span className="text-[10px] text-amber-400 font-mono">
                {profile.isProPass ? 'VIP Master' : `(${profile.title})`}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 capitalize">
              {profile.provider === 'guest' ? 'Guest Player' : `${profile.provider} Connected`} · Edit
            </div>
          </div>
        </button>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Coins Balance Pill -> Opens Shop */}
          {onOpenShop && (
            <button
              type="button"
              onClick={onOpenShop}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/40 hover:bg-amber-500/20 text-amber-300 font-mono text-xs font-bold transition-all active:scale-95 shadow-sm"
              title="Coin & Pro Store · Click to buy coins or unlock VIP pass"
            >
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>{(profile.coins ?? 150).toLocaleString()}</span>
              {profile.isProPass && (
                <span className="text-[9px] bg-amber-400 text-slate-950 px-1 rounded font-black">VIP</span>
              )}
            </button>
          )}

          {/* Watch Ad Free Coins Button */}
          {onOpenRewardedAd && (
            <button
              type="button"
              onClick={onOpenRewardedAd}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-violet-600/20 border border-violet-500/40 hover:bg-violet-600/30 text-violet-300 text-xs font-bold transition-all active:scale-95"
              title="Watch 5s ad to earn +50 free coins"
            >
              <Tv className="w-3.5 h-3.5 text-violet-400" />
              <span className="hidden sm:inline">+50 Coins</span>
            </button>
          )}

          {/* Active Device Tracker Chip */}
          {onOpenDevices && (
            <button
              type="button"
              onClick={onOpenDevices}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 text-xs transition-colors group"
              title="Tracked Device ID · Click to manage active devices"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="font-mono text-emerald-400 text-[11px] font-bold">
                {currentDeviceId.slice(0, 8)}...
              </span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] text-emerald-300 font-semibold hidden lg:inline">ACTIVE</span>
            </button>
          )}

          {/* Social Sign-in Button */}
          {onOpenSocialLogin && (
            <button
              type="button"
              onClick={onOpenSocialLogin}
              className={`
                flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs transition-all
                ${profile.provider === 'guest'
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'}
              `}
              title="Log in with Google, Facebook, X, or other social accounts"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">
                {profile.provider === 'guest' ? 'Social Login' : `${profile.provider}`}
              </span>
            </button>
          )}

          {/* Install App button */}
          {onOpenInstallModal && (
            <button
              type="button"
              onClick={onOpenInstallModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-600/20 border border-emerald-500/40 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold transition-all active:scale-95"
              title="Install Flip Emojis App on this device"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Install</span>
            </button>
          )}

          {/* Google Play Guide button */}
          {onOpenGooglePlayGuide && (
            <button
              type="button"
              onClick={onOpenGooglePlayGuide}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-xs font-semibold transition-all active:scale-95"
              title="Google Play Store & Revenue Guide"
            >
              <span className="text-emerald-400 font-black">▶</span>
              <span className="hidden md:inline">Play Store</span>
            </button>
          )}

          {/* Dark / Light Mode Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="p-2 rounded-full bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-amber-400 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={onOpenLeaderboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition-colors"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Rankings</span>
          </button>
          <button
            type="button"
            onClick={onOpenAchievements}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition-colors"
          >
            <Award className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Badges</span>
          </button>
        </div>
      </div>

      {/* Guest Social Link Reminder */}
      {profile.provider === 'guest' && onOpenSocialLogin && (
        <div className="w-full max-w-2xl mx-auto mb-2 p-2 sm:p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/30 flex items-center justify-between text-xs animate-fade-in shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-base">🔐</span>
            <span className="text-slate-300">
              Log in with <strong className="text-amber-300">Facebook, Gmail, or X</strong> to link Active Device ID (<span className="font-mono text-emerald-400 font-bold">{currentDeviceId.slice(0, 8)}...</span>)
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenSocialLogin}
            className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-[11px] whitespace-nowrap shadow-sm transition-colors ml-2"
          >
            Sign In
          </button>
        </div>
      )}

      {/* Main Title Hero Emblem */}
      <div className="text-center my-2 sm:my-3 relative">
        <div className="inline-flex items-center justify-center gap-2 p-2 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 mb-2 shadow-inner">
          <span className="text-3xl sm:text-4xl animate-bounce">🃏</span>
          <span className="text-2xl sm:text-3xl">⚡</span>
          <span className="text-3xl sm:text-4xl animate-bounce delay-100">✨</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-display tracking-tight text-white mb-1.5">
          Flip <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">Emojis</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto font-medium px-2">
          Flip boxes to match hidden emoji pairs. Collect <span className="text-amber-400 font-bold">+2 pts</span> on match, <span className="text-rose-400 font-bold">-1 pt</span> on miss, and score fiery combo bonus points on consecutive streaks!
        </p>
      </div>

      {/* Game Mode Selector - 4 Modes */}
      <div className="w-full max-w-2xl my-2 sm:my-3">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 text-center">
          Choose Game Mode
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-md">
          {/* 1. Solo Rush */}
          <button
            type="button"
            onClick={() => onSelectMode('solo')}
            className={`
              flex flex-col items-center justify-center py-2 sm:py-3 px-1 sm:px-2 rounded-xl transition-all
              ${selectedMode === 'solo'
                ? 'bg-gradient-to-b from-amber-500 to-orange-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }
            `}
          >
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5 sm:mb-1" />
            <span className="text-xs">Solo Rush</span>
            <span className={`text-[9px] sm:text-[10px] ${selectedMode === 'solo' ? 'text-slate-950/80' : 'text-slate-500'}`}>
              High score race
            </span>
          </button>

          {/* 2. Daily Challenge */}
          <button
            type="button"
            onClick={() => onSelectMode('daily')}
            className={`
              relative flex flex-col items-center justify-center py-2 sm:py-3 px-1 sm:px-2 rounded-xl transition-all
              ${selectedMode === 'daily'
                ? 'bg-gradient-to-b from-amber-500 to-orange-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }
            `}
          >
            <span className="absolute -top-1 -right-1 text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono shadow-sm">
              Daily
            </span>
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5 sm:mb-1 text-amber-400" />
            <span className="text-xs">Daily Challenge</span>
            <span className={`text-[9px] sm:text-[10px] ${selectedMode === 'daily' ? 'text-slate-950/80' : 'text-slate-500'}`}>
              Daily Top Sync
            </span>
          </button>

          {/* 3. Pass & Play */}
          <button
            type="button"
            onClick={() => onSelectMode('pass_and_play')}
            className={`
              flex flex-col items-center justify-center py-2 sm:py-3 px-1 sm:px-2 rounded-xl transition-all
              ${selectedMode === 'pass_and_play'
                ? 'bg-gradient-to-b from-amber-500 to-orange-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }
            `}
          >
            <Users className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5 sm:mb-1" />
            <span className="text-xs">Pass & Play</span>
            <span className={`text-[9px] sm:text-[10px] ${selectedMode === 'pass_and_play' ? 'text-slate-950/80' : 'text-slate-500'}`}>
              Local 2-4 players
            </span>
          </button>

          {/* 4. Online Screech */}
          <button
            type="button"
            onClick={() => {
              onSelectMode('online');
              onOpenOnlineRoom();
            }}
            className={`
              flex flex-col items-center justify-center py-2 sm:py-3 px-1 sm:px-2 rounded-xl transition-all
              ${selectedMode === 'online'
                ? 'bg-gradient-to-b from-amber-500 to-orange-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }
            `}
          >
            <Globe className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5 sm:mb-1" />
            <span className="text-xs">Online Screech</span>
            <span className={`text-[9px] sm:text-[10px] ${selectedMode === 'online' ? 'text-slate-950/80' : 'text-slate-500'}`}>
              Auto-match & codes
            </span>
          </button>
        </div>

        {/* Local Player Count for Pass & Play */}
        {selectedMode === 'pass_and_play' && (
          <div className="flex items-center justify-center gap-3 mt-2 p-1.5 bg-slate-900/60 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-300">Players:</span>
            {[2, 3, 4].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => onSetPlayerCount(num)}
                className={`
                  w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-bold font-mono transition-colors
                  ${playerCount === num ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}
                `}
              >
                {num}P
              </button>
            ))}
          </div>
        )}

        {/* Daily Challenge Highlight Banner */}
        {selectedMode === 'daily' && (
          <div className="mt-2.5 p-3 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-amber-500/40 rounded-2xl flex flex-wrap items-center justify-between gap-2 shadow-md">
            <div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Today's Synchronized Board
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {todayStr}
                </span>
              </div>
              <div className="text-[11px] text-slate-300 mt-1">
                Fixed 6x6 arena (36 boxes). Compete on the same board layout as players worldwide to climb the <strong className="text-amber-400">Daily Top</strong> leaderboard!
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Resets in</div>
                <div className="text-xs font-mono font-bold text-amber-300">{dailyCountdown || 'Midnight UTC'}</div>
              </div>
              {dailyRecord && (
                <div className="px-2.5 py-1 bg-slate-950/80 rounded-xl border border-amber-500/30 text-[11px] font-mono text-amber-400">
                  Daily Score: <strong>{dailyRecord.score} pts</strong> (#{dailyRecord.rank})
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Board Size and Difficulty Selection (For solo, pass & play, online) */}
      {selectedMode !== 'daily' ? (
        <div className="w-full max-w-2xl my-2 sm:my-3">
          {/* VIP Pass Advanced Play Promo Banner */}
          <div className="mb-3 p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-indigo-950/40 border border-amber-500/30 flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-lg shrink-0">
                👑
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs font-display">Play More Advance · VIP Pass</span>
                  {profile.isProPass ? (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      ADVANCED MODES
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-300">
                  {profile.isProPass
                    ? 'All extreme 32x32 grids, unlimited hints & holographic themes unlocked!'
                    : 'Unlock unlimited game tips, extreme 32x32 matrix, and holographic card skins!'}
                </p>
              </div>
            </div>

            {onOpenShop && !profile.isProPass && (
              <button
                type="button"
                onClick={onOpenShop}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs rounded-xl shadow transition active:scale-95 shrink-0"
              >
                Unlock VIP
              </button>
            )}
          </div>

          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Select Challenge Difficulty
            </span>
            <span className="text-[11px] text-amber-400 font-mono font-medium">
              Higher grids = Higher score multiplier!
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2">
            {boardSizes.map(item => {
              const isSelected = selectedBoardSize === item.size;
              const diff = getDifficultyByBoardSize(item.size);
              return (
                <button
                  key={item.size}
                  type="button"
                  onClick={() => onSelectBoardSize(item.size)}
                  className={`
                    relative flex flex-col p-2.5 rounded-xl border text-left transition-all
                    ${isSelected
                      ? 'bg-amber-500/15 border-amber-500 shadow-md shadow-amber-500/10 ring-1 ring-amber-400'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-300'
                    }
                  `}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border uppercase font-mono ${diff.badgeColor}`}>
                      {diff.badgeLabel}
                    </span>
                    <span className="text-[10px] font-mono font-black text-amber-400">
                      {diff.scoreMultiplier}x
                    </span>
                  </div>
                  <span className={`text-base font-extrabold font-mono ${isSelected ? 'text-amber-400' : 'text-white'}`}>
                    {item.label}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-200 mt-0.5">
                    {item.cards} Boxes
                  </span>
                  <span className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">
                    Par: {diff.parMoves} moves
                  </span>
                </button>
              );
            })}
          </div>

          {/* Difficulty Spec Banner */}
          {(() => {
            const activeDiff = getDifficultyByBoardSize(selectedBoardSize);
            return (
              <div className="mt-2.5 p-2.5 bg-slate-900/80 border border-slate-800/80 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase font-mono ${activeDiff.badgeColor}`}>
                    {activeDiff.name} Mode
                  </span>
                  <span className="text-slate-300 text-[11px]">
                    {activeDiff.description}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                  <span>Score: <strong className="text-amber-400">{activeDiff.scoreMultiplier}x Multiplier</strong></span>
                  <span>·</span>
                  <span>Par: <strong className="text-white">{activeDiff.parMoves} Moves</strong></span>
                  <span>·</span>
                  <span>Window: <strong className="text-white">{activeDiff.memoryWindowMs}ms</strong></span>
                </div>
              </div>
            );
          })()}
        </div>
      ) : null}

      {/* Primary Start Action */}
      <div className="mt-3 sm:mt-5 flex flex-col items-center">
        <button
          type="button"
          data-start="true"
          onClick={onStartGame}
          className="
            group px-8 py-3.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400
            text-slate-950 font-display font-black text-lg tracking-wide rounded-2xl shadow-xl shadow-amber-500/25
            hover:shadow-amber-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-3
          "
        >
          <Play className="w-5 h-5 fill-slate-950" />
          <span>{selectedMode === 'daily' ? 'PLAY DAILY CHALLENGE' : 'START FLIPPING'}</span>
          <span className="text-xs px-2 py-0.5 rounded-md bg-slate-950/20 text-slate-950 font-mono font-bold">
            {selectedMode === 'daily' ? '6x6 Sync' : `${selectedBoardSize}x${selectedBoardSize}`}
          </span>
        </button>

        <p className="mt-4 text-xs text-slate-500 flex items-center gap-2">
          <span>Click cards to flip</span>
          <span>·</span>
          <span>Consecutive matches give +1 bonus point</span>
          <span>·</span>
          <span>Space / Enter to Start</span>
        </p>
      </div>
    </div>
  );
};
