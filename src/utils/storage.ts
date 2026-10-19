import {
  getOrCreateDeviceId,
  DeviceTracker,
  type DeviceInfo,
} from './device.ts';

export interface LinkedAccount {
  provider: 'guest' | 'google' | 'facebook' | 'x' | 'github' | 'apple' | 'discord';
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
  provider: 'guest' | 'google' | 'facebook' | 'x' | 'github' | 'apple' | 'discord';
  joinedDate: string;
  currentDeviceId?: string;
  linkedAccounts?: LinkedAccount[];
  coins?: number;
  isProPass?: boolean;
  activeCardBack?: 'classic' | 'cyber' | 'galactic' | 'gold';
}

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
}

export interface GameStatistics {
  gamesPlayed: number;
  gamesWon: number;
  totalScore: number;
  bestStreak: number;
  fastestTimes: Record<number, number>; // boardSize -> seconds
  highScores: Record<number, number>; // boardSize -> score
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
  totalScore: 0,
  bestStreak: 0,
  fastestTimes: {},
  highScores: {},
};

// Seed global leaderboard with fun competitive profiles
const SEED_LEADERBOARDS: LeaderboardEntry[] = [
  { id: 'lb-1', playerName: 'PixelNinja', avatar: '🐱', avatarBg: 'bg-emerald-600', title: 'Memory Deity', boardSize: 4, score: 38, moves: 10, timeSeconds: 18, streak: 8, date: 'Today' },
  { id: 'lb-2', playerName: 'CosmicNova', avatar: '🚀', avatarBg: 'bg-indigo-600', title: 'Grandmaster', boardSize: 4, score: 32, moves: 12, timeSeconds: 22, streak: 6, date: 'Today' },
  { id: 'lb-3', playerName: 'ZenMaster', avatar: '🐼', avatarBg: 'bg-teal-600', title: 'Brain Dynamo', boardSize: 4, score: 28, moves: 14, timeSeconds: 29, streak: 4, date: 'Yesterday' },
  { id: 'lb-4', playerName: 'TurboFox', avatar: '🦊', avatarBg: 'bg-amber-600', title: 'Titan 32x32', boardSize: 8, score: 142, moves: 48, timeSeconds: 98, streak: 12, date: 'Today' },
  { id: 'lb-5', playerName: 'ShadowGhost', avatar: '👻', avatarBg: 'bg-purple-600', title: 'Board Conqueror', boardSize: 8, score: 120, moves: 56, timeSeconds: 114, streak: 9, date: 'Yesterday' },
  { id: 'lb-6', playerName: 'CyberDragon', avatar: '🐲', avatarBg: 'bg-rose-600', title: 'Titan 32x32', boardSize: 16, score: 620, moves: 210, timeSeconds: 430, streak: 18, date: '2 days ago' },
  { id: 'lb-7', playerName: 'QuantumBot', avatar: '🤖', avatarBg: 'bg-cyan-600', title: 'Legend 32x32', boardSize: 32, score: 2840, moves: 890, timeSeconds: 1420, streak: 34, date: '3 days ago' },
];

// Seed Daily Top leaderboard for today's synchronized challenge (6x6 board)
const SEED_DAILY_LEADERBOARDS: LeaderboardEntry[] = [
  { id: 'daily-lb-1', playerName: 'AuroraPulse', avatar: '🌟', avatarBg: 'bg-purple-600', title: 'Speed Demon', boardSize: 6, score: 68, moves: 24, timeSeconds: 42, streak: 11, date: 'Today (Sync)' },
  { id: 'daily-lb-2', playerName: 'NeonBlaze', avatar: '⚡', avatarBg: 'bg-amber-600', title: 'Brain Dynamo', boardSize: 6, score: 61, moves: 26, timeSeconds: 48, streak: 9, date: 'Today (Sync)' },
  { id: 'daily-lb-3', playerName: 'StarlightFox', avatar: '🦊', avatarBg: 'bg-indigo-600', title: 'Board Conqueror', boardSize: 6, score: 54, moves: 29, timeSeconds: 53, streak: 7, date: 'Today (Sync)' },
  { id: 'daily-lb-4', playerName: 'PixelPanda', avatar: '🐼', avatarBg: 'bg-emerald-600', title: 'Memory Scout', boardSize: 6, score: 48, moves: 32, timeSeconds: 61, streak: 6, date: 'Today (Sync)' },
  { id: 'daily-lb-5', playerName: 'EchoKnight', avatar: '⚔️', avatarBg: 'bg-cyan-600', title: 'Card Whiz', boardSize: 6, score: 42, moves: 36, timeSeconds: 74, streak: 5, date: 'Today (Sync)' },
];

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
      return data ? JSON.parse(data) : INITIAL_STATS;
    } catch {
      return INITIAL_STATS;
    }
  }

  public static recordGame(boardSize: number, score: number, moves: number, timeSec: number, streak: number) {
    const stats = this.getStats();
    stats.gamesPlayed += 1;
    stats.gamesWon += 1;
    stats.totalScore += score;
    stats.bestStreak = Math.max(stats.bestStreak, streak);

    const prevBestTime = stats.fastestTimes[boardSize];
    if (!prevBestTime || timeSec < prevBestTime) {
      stats.fastestTimes[boardSize] = timeSec;
    }

    const prevHighScore = stats.highScores[boardSize];
    if (!prevHighScore || score > prevHighScore) {
      stats.highScores[boardSize] = score;
    }

    try {
      localStorage.setItem('flip_emojis_stats', JSON.stringify(stats));
    } catch (e) {
      console.error(e);
    }

    // Record into local leaderboard
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

    return stats;
  }

  public static getLeaderboards(boardSize?: number): LeaderboardEntry[] {
    try {
      const stored = localStorage.getItem('flip_emojis_leaderboard');
      let list: LeaderboardEntry[] = stored ? JSON.parse(stored) : SEED_LEADERBOARDS;
      if (boardSize) {
        list = list.filter(e => e.boardSize === boardSize);
      }
      return list.sort((a, b) => b.score - a.score);
    } catch {
      return SEED_LEADERBOARDS;
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
      let list: LeaderboardEntry[] = stored ? JSON.parse(stored) : SEED_DAILY_LEADERBOARDS;
      return list.sort((a, b) => b.score - a.score);
    } catch {
      return SEED_DAILY_LEADERBOARDS;
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
}

