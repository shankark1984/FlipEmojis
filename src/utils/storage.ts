import {
  getOrCreateDeviceId,
  DeviceTracker,
  type DeviceInfo,
} from './device.ts';

export interface LinkedAccount {
  provider: 'guest' | 'google' | 'facebook' | 'x' | 'github' | 'apple' | 'discord' | 'email';
  identifier: string; // e.g. email or username
  displayName: string;
  connectedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatar: string; // Emoji
  avatarBg: string; // Tailwind color class or hex
  title: string;
  provider: 'guest' | 'google' | 'facebook' | 'x' | 'github' | 'apple' | 'discord' | 'email';
  joinedDate: string;
  currentDeviceId?: string;
  linkedAccounts?: LinkedAccount[];
  coins?: number;
  isProPass?: boolean;
  activeCardBack?: 'classic' | 'cyber' | 'galactic' | 'gold';
  isApproved?: boolean;
  emailVerified?: boolean;
  verificationEmail?: string;
  verificationSentAt?: string;
  verificationFrom?: string;
  verificationDispatcher?: string;
}

export const VERIFICATION_SENDER_EMAIL = 'shankara.singh@gmail.com';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export interface LeaderboardEntry {
  id: string;
  rank?: number;
  playerName: string;
  avatar: string;
  avatarBg: string;
  title: string;
  boardSize: number;
  score: number;
  moves: number;
  timeSeconds: number;
  streak: number;
  date: string;
  isCurrentUser?: boolean;
  isWin?: boolean;
  mode?: string;
}

export interface GameStatistics {
  gamesPlayed: number; // Total played boards
  gamesWon: number;    // Winning boards
  gamesLost: number;   // Losing boards
  totalScore: number;  // Total accumulated played points across all games
  winPercentage: number; // (gamesWon / gamesPlayed) * 100
  bestStreak: number;
  fastestTimes: Record<number, number>; // boardSize -> seconds
  highScores: Record<number, number>; // boardSize -> score
}

export interface RankingTier {
  tier: string;
  level: number;
  badge: string;
  minPoints: number;
  maxPoints: number;
  color: string;
  nextTier?: string;
  pointsToNext?: number;
  progressPercent: number;
}

const DEFAULT_PROFILE: UserProfile = {
  id: 'usr_' + Math.random().toString(36).substring(2, 9),
  name: 'FlipMaster',
  email: 'player@flipemojis.local',
  avatar: '🦊',
  avatarBg: 'bg-gradient-to-tr from-amber-500 to-orange-500',
  title: 'Emoji Novice',
  provider: 'guest',
  joinedDate: new Date().toLocaleDateString(),
  currentDeviceId: typeof window !== 'undefined' ? getOrCreateDeviceId() : undefined,
  linkedAccounts: [],
  coins: 150,
  isProPass: false,
  activeCardBack: 'classic',
  isApproved: false,
  emailVerified: false,
};

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_flip', title: 'Curious Eye', description: 'Flip your very first card box', icon: '👀' },
  { id: 'first_match', title: 'Perfect Pair', description: 'Match your first pair of hidden emojis', icon: '✨' },
  { id: 'streak_3', title: 'Spark Ignition', description: 'Reach a streak of 3 consecutive matches', icon: '🔥' },
  { id: 'streak_5', title: 'Brain Dynamo', description: 'Hit a scorching 5-match combo streak', icon: '⚡' },
  { id: 'streak_10', title: 'Memory Deity', description: 'Unreal memory! 10 consecutive matches without error', icon: '👑' },
  { id: 'grid_4', title: 'Grid Scout', description: 'Complete any 4x4 board', icon: '🧩' },
  { id: 'grid_8', title: 'Board Conqueror', description: 'Complete any 8x8 (64-card) board', icon: '🛡️' },
  { id: 'grid_16', title: 'Grandmaster 16x16', description: 'Clear a massive 16x16 (256-card) grid', icon: '🏆' },
  { id: 'grid_32', title: 'Titan of 32x32', description: 'Ultimate conquest: solve the colossal 32x32 (1024-card) matrix', icon: '🌌' },
  { id: 'speedster', title: 'Speed Demon', description: 'Complete a 4x4 game in under 30 seconds', icon: '⏱️' },
  { id: 'social_butterfly', title: 'Party Animal', description: 'Play an online or 2-player game mode', icon: '🎉' },
  { id: 'chat_enthusiast', title: 'Battle Taunter', description: 'Send a reaction or message in game chat', icon: '💬' },
  { id: 'daily_voyager', title: 'Daily Voyager', description: 'Complete today\'s synchronized Daily Challenge board', icon: '⭐' },
  { id: 'daily_champion', title: 'Daily Podium', description: 'Finish in the Top 3 on the Daily Top leaderboard', icon: '🎖️' },
  { id: 'device_linked', title: 'Hardware Authenticated', description: 'Register an active device ID with your account', icon: '📱' },
  { id: 'social_linked', title: 'Verified Citizen', description: 'Log in with a social account (Google, Facebook, X, etc.)', icon: '🌐' },
  { id: 'ad_watcher', title: 'Ad Sponsor', description: 'Watch a rewarded ad to earn 50 bonus coins', icon: '📺' },
  { id: 'master_pass', title: 'VIP Champion', description: 'Unlock the VIP Master Pass for advanced gameplay', icon: '👑' },
  { id: 'tip_tactician', title: 'Tactical Mind', description: 'Use the Find Next Match tip during a game', icon: '💡' },
];

const INITIAL_STATS: GameStatistics = {
  gamesPlayed: 0,
  gamesWon: 0,
  gamesLost: 0,
  winPercentage: 0,
  totalScore: 0,
  bestStreak: 0,
  fastestTimes: {},
  highScores: {},
};

// No fake dummy data - strictly real user matches and live leaderboard records
const SEED_LEADERBOARDS: LeaderboardEntry[] = [];
const SEED_DAILY_LEADERBOARDS: LeaderboardEntry[] = [];

export class StorageService {
  public static getProfile(): UserProfile {
    try {
      const data = localStorage.getItem('flip_emojis_profile');
      return data ? JSON.parse(data) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  }

  public static saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem('flip_emojis_profile', JSON.stringify(profile));
    } catch (e) {
      console.error(e);
    }
  }

  public static getAchievements(): Achievement[] {
    try {
      const stored = localStorage.getItem('flip_emojis_achievements');
      if (!stored) return INITIAL_ACHIEVEMENTS;
      const parsed: Achievement[] = JSON.parse(stored);
      // Merge with initial in case new badges added
      return INITIAL_ACHIEVEMENTS.map(initial => {
        const found = parsed.find(p => p.id === initial.id);
        return found || initial;
      });
    } catch {
      return INITIAL_ACHIEVEMENTS;
    }
  }

  public static unlockAchievement(id: string): Achievement | null {
    const list = this.getAchievements();
    const item = list.find(a => a.id === id);
    if (item && !item.unlockedAt) {
      item.unlockedAt = new Date().toISOString();
      try {
        localStorage.setItem('flip_emojis_achievements', JSON.stringify(list));
      } catch (e) {
        console.error(e);
      }
      return item;
    }
    return null;
  }

  public static getStats(): GameStatistics {
    try {
      const data = localStorage.getItem('flip_emojis_stats');
      if (data) {
        const parsed = JSON.parse(data);
        return {
          gamesPlayed: parsed.gamesPlayed || 0,
          gamesWon: parsed.gamesWon || 0,
          gamesLost: parsed.gamesLost || 0,
          winPercentage: parsed.gamesPlayed ? Number(((parsed.gamesWon / parsed.gamesPlayed) * 100).toFixed(1)) : 0,
          totalScore: parsed.totalScore || 0,
          bestStreak: parsed.bestStreak || 0,
          fastestTimes: parsed.fastestTimes || {},
          highScores: parsed.highScores || {},
        };
      }
      return INITIAL_STATS;
    } catch {
      return INITIAL_STATS;
    }
  }

  public static getRankingTier(score?: number): RankingTier {
    const total = typeof score === 'number' ? score : (this.getStats().totalScore || 0);

    const TIERS = [
      { tier: 'Bronze Novice', level: 1, badge: '🥉', min: 0, max: 99, color: 'text-amber-600 border-amber-600/40 bg-amber-600/10' },
      { tier: 'Silver Apprentice', level: 2, badge: '🥈', min: 100, max: 299, color: 'text-slate-300 border-slate-300/40 bg-slate-300/10' },
      { tier: 'Gold Specialist', level: 3, badge: '🥇', min: 300, max: 699, color: 'text-yellow-400 border-yellow-400/40 bg-yellow-400/10' },
      { tier: 'Platinum Tactician', level: 4, badge: '💠', min: 700, max: 1499, color: 'text-cyan-400 border-cyan-400/40 bg-cyan-400/10' },
      { tier: 'Diamond Dynamo', level: 5, badge: '💎', min: 1500, max: 3499, color: 'text-blue-400 border-blue-400/40 bg-blue-400/10' },
      { tier: 'Master Flipster', level: 6, badge: '🔮', min: 3500, max: 7499, color: 'text-purple-400 border-purple-400/40 bg-purple-400/10' },
      { tier: 'Grandmaster Mind', level: 7, badge: '👑', min: 7500, max: 14999, color: 'text-rose-400 border-rose-400/40 bg-rose-400/10' },
      { tier: 'Memory Legend', level: 8, badge: '🌌', min: 15000, max: Infinity, color: 'text-emerald-400 border-emerald-400/40 bg-emerald-400/10' },
    ];

    const currentIdx = TIERS.findIndex(t => total >= t.min && total <= t.max);
    const curr = TIERS[currentIdx !== -1 ? currentIdx : 0];
    const next = currentIdx < TIERS.length - 1 ? TIERS[currentIdx + 1] : undefined;

    const span = next ? (next.min - curr.min) : 1000;
    const progressInTier = next ? (total - curr.min) : span;
    const progressPercent = next ? Math.min(100, Math.max(0, Math.round((progressInTier / span) * 100))) : 100;
    const pointsToNext = next ? Math.max(0, next.min - total) : 0;

    return {
      tier: curr.tier,
      level: curr.level,
      badge: curr.badge,
      minPoints: curr.min,
      maxPoints: curr.max,
      color: curr.color,
      nextTier: next ? next.tier : undefined,
      pointsToNext,
      progressPercent,
    };
  }

  public static recordGame(
    boardSize: number,
    score: number,
    moves: number,
    timeSec: number,
    streak: number,
    isWin: boolean = true,
    mode: string = 'solo'
  ) {
    return this.recordGameResult(boardSize, score, moves, timeSec, streak, isWin, mode);
  }

  public static recordGameResult(
    boardSize: number,
    score: number,
    moves: number,
    timeSec: number,
    streak: number,
    isWin: boolean = true,
    mode: string = 'solo'
  ): GameStatistics {
    const stats = this.getStats();
    stats.gamesPlayed = (stats.gamesPlayed || 0) + 1;
    if (isWin) {
      stats.gamesWon = (stats.gamesWon || 0) + 1;
    } else {
      stats.gamesLost = (stats.gamesLost || 0) + 1;
    }
    stats.winPercentage = stats.gamesPlayed > 0
      ? Number(((stats.gamesWon / stats.gamesPlayed) * 100).toFixed(1))
      : 0;

    stats.totalScore = (stats.totalScore || 0) + Math.max(0, score);
    stats.bestStreak = Math.max(stats.bestStreak || 0, streak);

    if (isWin) {
      const prevBestTime = stats.fastestTimes[boardSize];
      if (!prevBestTime || timeSec < prevBestTime) {
        stats.fastestTimes[boardSize] = timeSec;
      }

      const prevHighScore = stats.highScores[boardSize];
      if (!prevHighScore || score > prevHighScore) {
        stats.highScores[boardSize] = score;
      }

      // Record into real local leaderboard (no fake records)
      const profile = this.getProfile();
      const newEntry: LeaderboardEntry = {
        id: 'usr-score-' + Date.now(),
        playerName: profile.name,
        avatar: profile.avatar,
        avatarBg: profile.avatarBg,
        title: profile.title,
        boardSize,
        score,
        moves,
        timeSeconds: timeSec,
        streak,
        date: 'Just now',
        isCurrentUser: true,
        isWin: true,
        mode,
      };
      this.addLeaderboardEntry(newEntry);

      // Check achievement unlocks
      if (boardSize === 4) this.unlockAchievement('grid_4');
      if (boardSize === 8) this.unlockAchievement('grid_8');
      if (boardSize === 16) this.unlockAchievement('grid_16');
      if (boardSize === 32) this.unlockAchievement('grid_32');
      if (boardSize === 4 && timeSec < 30) this.unlockAchievement('speedster');
      if (streak >= 3) this.unlockAchievement('streak_3');
      if (streak >= 5) this.unlockAchievement('streak_5');
      if (streak >= 10) this.unlockAchievement('streak_10');
    }

    try {
      localStorage.setItem('flip_emojis_stats', JSON.stringify(stats));
    } catch (e) {
      console.error(e);
    }

    return stats;
  }

  public static getLeaderboards(boardSize?: number): LeaderboardEntry[] {
    try {
      const stored = localStorage.getItem('flip_emojis_leaderboard');
      let list: LeaderboardEntry[] = stored ? JSON.parse(stored) : [];
      // Remove any legacy mock/seed dummy data
      list = list.filter(e => !e.id.startsWith('lb-'));
      if (boardSize) {
        list = list.filter(e => e.boardSize === boardSize);
      }
      return list.sort((a, b) => b.score - a.score);
    } catch {
      return [];
    }
  }

  public static addLeaderboardEntry(entry: LeaderboardEntry) {
    try {
      const current = this.getLeaderboards();
      const updated = [entry, ...current].slice(0, 50);
      localStorage.setItem('flip_emojis_leaderboard', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  }

  // Daily Challenge & Daily Top methods
  public static getDailyLeaderboards(dateStr: string = new Date().toISOString().slice(0, 10)): LeaderboardEntry[] {
    try {
      const key = `flip_emojis_daily_lb_${dateStr}`;
      const stored = localStorage.getItem(key);
      let list: LeaderboardEntry[] = stored ? JSON.parse(stored) : [];
      // Remove any legacy mock dummy data
      list = list.filter(e => !e.id.startsWith('daily-lb-'));
      return list.sort((a, b) => b.score - a.score);
    } catch {
      return [];
    }
  }

  public static recordDailyChallenge(boardSize: number, score: number, moves: number, timeSec: number, streak: number, dateStr: string = new Date().toISOString().slice(0, 10)): { rank: number; isTop3: boolean } {
    const profile = this.getProfile();
    const entry: LeaderboardEntry = {
      id: `daily-entry-${Date.now()}`,
      playerName: profile.name,
      avatar: profile.avatar,
      avatarBg: profile.avatarBg,
      title: profile.title,
      boardSize,
      score,
      moves,
      timeSeconds: timeSec,
      streak,
      date: `Today (${dateStr})`,
      isCurrentUser: true,
    };

    const currentDaily = this.getDailyLeaderboards(dateStr).filter(e => !e.isCurrentUser);
    const updated = [entry, ...currentDaily].sort((a, b) => b.score - a.score);
    const rank = updated.findIndex(e => e.id === entry.id) + 1;

    try {
      localStorage.setItem(`flip_emojis_daily_lb_${dateStr}`, JSON.stringify(updated.slice(0, 50)));
      localStorage.setItem(`flip_emojis_daily_record_${dateStr}`, JSON.stringify({ score, moves, timeSec, streak, rank, completedAt: new Date().toISOString() }));
    } catch (e) {
      console.error(e);
    }

    this.unlockAchievement('daily_voyager');
    if (rank <= 3) {
      this.unlockAchievement('daily_champion');
    }

    return { rank, isTop3: rank <= 3 };
  }

  public static getDailyRecord(dateStr: string = new Date().toISOString().slice(0, 10)): { score: number; moves: number; timeSec: number; streak: number; rank: number } | null {
    try {
      const data = localStorage.getItem(`flip_emojis_daily_record_${dateStr}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  // Theme support: dark or light
  public static getTheme(): 'dark' | 'light' {
    try {
      const theme = localStorage.getItem('flip_emojis_theme');
      return theme === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  }

  public static setTheme(theme: 'dark' | 'light'): void {
    try {
      localStorage.setItem('flip_emojis_theme', theme);
      if (theme === 'light') {
        document.documentElement.classList.add('light-theme');
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.remove('light-theme');
        document.documentElement.classList.add('dark');
      }
    } catch (e) {
      console.error(e);
    }
  }

  public static exportSaveData(): string {
    return JSON.stringify({
      profile: this.getProfile(),
      stats: this.getStats(),
      achievements: this.getAchievements(),
      version: 1,
      exportedAt: new Date().toISOString(),
    }, null, 2);
  }

  public static importSaveData(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.profile) localStorage.setItem('flip_emojis_profile', JSON.stringify(parsed.profile));
      if (parsed.stats) localStorage.setItem('flip_emojis_stats', JSON.stringify(parsed.stats));
      if (parsed.achievements) localStorage.setItem('flip_emojis_achievements', JSON.stringify(parsed.achievements));
      return true;
    } catch {
      return false;
    }
  }

  // Active Device Tracking methods
  public static getDeviceId(): string {
    return getOrCreateDeviceId();
  }

  public static getActiveDevices(): DeviceInfo[] {
    return DeviceTracker.getDevices();
  }

  public static heartbeatDevice(): DeviceInfo | null {
    return DeviceTracker.heartbeat();
  }

  public static renameDevice(deviceId: string, newName: string): boolean {
    return DeviceTracker.renameDevice(deviceId, newName);
  }

  public static revokeDevice(deviceId: string): DeviceInfo[] {
    return DeviceTracker.revokeDevice(deviceId);
  }

  public static simulateAddDevice(
    name: string,
    type: 'mobile' | 'tablet' | 'desktop',
    os: string,
    browser: string
  ): DeviceInfo {
    return DeviceTracker.simulateAddDevice(name, type, os, browser);
  }

  // Social Account Login and Device ID Registration
  public static loginWithSocialAccount(
    provider: UserProfile['provider'],
    identifier: string,
    displayName?: string,
    avatarEmoji?: string
  ): { profile: UserProfile; device: DeviceInfo } {
    const currentProfile = this.getProfile();
    const deviceId = getOrCreateDeviceId();

    // Register active device on login
    const device = DeviceTracker.registerLoginOnCurrentDevice(provider, identifier);

    // Compute updated profile
    const accounts = currentProfile.linkedAccounts || [];
    const existingIdx = accounts.findIndex(a => a.provider === provider);
    const linkedRecord: LinkedAccount = {
      provider,
      identifier,
      displayName: displayName || identifier,
      connectedAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      accounts[existingIdx] = linkedRecord;
    } else {
      accounts.push(linkedRecord);
    }

    const updatedProfile: UserProfile = {
      ...currentProfile,
      name: displayName || currentProfile.name,
      email: identifier.includes('@') ? identifier : currentProfile.email,
      avatar: avatarEmoji || currentProfile.avatar,
      provider,
      currentDeviceId: deviceId,
      linkedAccounts: accounts,
    };

    this.saveProfile(updatedProfile);

    // Unlock badges
    this.unlockAchievement('device_linked');
    if (provider !== 'guest') {
      this.unlockAchievement('social_linked');
    }

    return { profile: updatedProfile, device };
  }

  public static logoutToGuest(): UserProfile {
    const currentProfile = this.getProfile();
    const updatedProfile: UserProfile = {
      ...currentProfile,
      provider: 'guest',
      name: 'Guest Player',
    };
    this.saveProfile(updatedProfile);
    return updatedProfile;
  }

  // --- Coin Economy & Monetization Methods ---

  public static getCoins(): number {
    const profile = this.getProfile();
    return typeof profile.coins === 'number' ? profile.coins : 150;
  }

  public static addCoins(amount: number, reason?: string): number {
    const profile = this.getProfile();
    const current = typeof profile.coins === 'number' ? profile.coins : 150;
    const updated = Math.max(0, current + amount);
    this.saveProfile({ ...profile, coins: updated });
    return updated;
  }

  public static spendCoins(amount: number): boolean {
    const profile = this.getProfile();
    const current = typeof profile.coins === 'number' ? profile.coins : 150;
    if (current < amount) return false;
    this.saveProfile({ ...profile, coins: current - amount });
    return true;
  }

  public static isProPass(): boolean {
    const profile = this.getProfile();
    return !!profile.isProPass;
  }

  public static unlockProPass(): UserProfile {
    const profile = this.getProfile();
    const updated: UserProfile = {
      ...profile,
      isProPass: true,
      title: profile.title === 'Emoji Novice' ? 'VIP Grandmaster' : profile.title,
    };
    this.saveProfile(updated);
    this.unlockAchievement('master_pass');
    return updated;
  }

  public static watchRewardedAd(): { coinsGranted: number; newTotal: number } {
    const coinsGranted = 50;
    const newTotal = this.addCoins(coinsGranted, 'rewarded_ad');
    this.unlockAchievement('ad_watcher');
    return { coinsGranted, newTotal };
  }

  public static getCardBack(): 'classic' | 'cyber' | 'galactic' | 'gold' {
    const profile = this.getProfile();
    return profile.activeCardBack || 'classic';
  }

  public static setCardBack(theme: 'classic' | 'cyber' | 'galactic' | 'gold'): void {
    const profile = this.getProfile();
    this.saveProfile({ ...profile, activeCardBack: theme });
  }

  // --- Email Verification Flow (Login verification required before approved play) ---
  public static sendVerificationEmail(email: string, displayName?: string, provider: UserProfile['provider'] = 'google'): { success: boolean; email: string; token: string; from: string } {
    const current = this.getProfile();
    const token = 'tok_' + Math.random().toString(36).substring(2, 10);
    const updated: UserProfile = {
      ...current,
      email,
      name: displayName || email.split('@')[0] || current.name,
      provider,
      verificationEmail: email,
      verificationSentAt: new Date().toISOString(),
      verificationFrom: VERIFICATION_SENDER_EMAIL,
      verificationDispatcher: VERIFICATION_SENDER_EMAIL,
      isApproved: false,
      emailVerified: false,
    };
    this.saveProfile(updated);
    return { success: true, email, token, from: VERIFICATION_SENDER_EMAIL };
  }

  public static approveEmailVerification(email?: string): UserProfile {
    const current = this.getProfile();
    const verifiedEmail = email || current.verificationEmail || current.email || 'player@flipemojis.local';
    const updated: UserProfile = {
      ...current,
      email: verifiedEmail,
      isApproved: true,
      emailVerified: true,
      verificationEmail: undefined,
      verificationSentAt: undefined,
    };
    this.saveProfile(updated);
    this.unlockAchievement('social_linked');
    return updated;
  }
}

