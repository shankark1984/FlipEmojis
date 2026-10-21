/**
 * Pure game rules, scoring calculations, difficulty configurations, and board generator for Flip Emojis
 */

export type BoardSize = 4 | 6 | 8 | 10 | 12 | 16 | 32;
export type DifficultyLevel = 'easy' | 'standard' | 'medium' | 'expert' | 'master' | 'hard' | 'titan';

export interface DifficultyConfig {
  level: DifficultyLevel;
  name: string;
  boardSize: BoardSize;
  cardsCount: number;
  pairsCount: number;
  description: string;
  badgeLabel: string;
  badgeColor: string;
  accentColor: string;
  scoreMultiplier: number;
  parMoves: number;
  memoryWindowMs: number;
  hasPeekHint?: boolean;
  streakBonusRate: number;
}

export const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  easy: {
    level: 'easy',
    name: 'Easy',
    boardSize: 4,
    cardsCount: 16,
    pairsCount: 8,
    description: 'Relaxed 4x4 matrix. Quick memory warm-up.',
    badgeLabel: 'Easy',
    badgeColor: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/40',
    accentColor: '#10b981',
    scoreMultiplier: 1.0,
    parMoves: 16,
    memoryWindowMs: 950,
    hasPeekHint: true,
    streakBonusRate: 1,
  },
  standard: {
    level: 'standard',
    name: 'Standard',
    boardSize: 6,
    cardsCount: 36,
    pairsCount: 18,
    description: 'Classic 6x6 matrix. Balanced memory challenge.',
    badgeLabel: 'Standard',
    badgeColor: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/40',
    accentColor: '#06b6d4',
    scoreMultiplier: 1.25,
    parMoves: 34,
    memoryWindowMs: 850,
    hasPeekHint: true,
    streakBonusRate: 1,
  },
  medium: {
    level: 'medium',
    name: 'Medium',
    boardSize: 8,
    cardsCount: 64,
    pairsCount: 32,
    description: 'Intense 8x8 matrix. Requires sharp spatial recall.',
    badgeLabel: 'Medium',
    badgeColor: 'text-amber-400 bg-amber-500/15 border-amber-500/40',
    accentColor: '#f59e0b',
    scoreMultiplier: 1.5,
    parMoves: 58,
    memoryWindowMs: 800,
    hasPeekHint: false,
    streakBonusRate: 2,
  },
  expert: {
    level: 'expert',
    name: 'Expert',
    boardSize: 10,
    cardsCount: 100,
    pairsCount: 50,
    description: 'Demanding 10x10 grid (100 boxes). High concentration required.',
    badgeLabel: 'Expert',
    badgeColor: 'text-orange-400 bg-orange-500/15 border-orange-500/40',
    accentColor: '#f97316',
    scoreMultiplier: 2.0,
    parMoves: 92,
    memoryWindowMs: 720,
    hasPeekHint: false,
    streakBonusRate: 2,
  },
  master: {
    level: 'master',
    name: 'Master',
    boardSize: 12,
    cardsCount: 144,
    pairsCount: 72,
    description: 'Elite 12x12 labyrinth (144 boxes). Severe spatial cognitive test.',
    badgeLabel: 'Master',
    badgeColor: 'text-pink-400 bg-pink-500/15 border-pink-500/40',
    accentColor: '#ec4899',
    scoreMultiplier: 2.3,
    parMoves: 136,
    memoryWindowMs: 680,
    hasPeekHint: false,
    streakBonusRate: 3,
  },
  hard: {
    level: 'hard',
    name: 'Hard',
    boardSize: 16,
    cardsCount: 256,
    pairsCount: 128,
    description: 'Grand 16x16 arena. 256 hidden boxes with rapid memory window.',
    badgeLabel: 'Hard',
    badgeColor: 'text-rose-400 bg-rose-500/15 border-rose-500/40',
    accentColor: '#f43f5e',
    scoreMultiplier: 2.75,
    parMoves: 230,
    memoryWindowMs: 650,
    hasPeekHint: false,
    streakBonusRate: 3,
  },
  titan: {
    level: 'titan',
    name: 'Titan',
    boardSize: 32,
    cardsCount: 1024,
    pairsCount: 512,
    description: 'Ultimate 32x32 Matrix: 1024 boxes! Extreme endurance & 5x legendary score.',
    badgeLabel: 'Titan',
    badgeColor: 'text-purple-400 bg-purple-500/20 border-purple-500/50',
    accentColor: '#a855f7',
    scoreMultiplier: 5.0,
    parMoves: 950,
    memoryWindowMs: 500,
    hasPeekHint: false,
    streakBonusRate: 5,
  },
};

export function getDifficultyByBoardSize(size: BoardSize): DifficultyConfig {
  switch (size) {
    case 4:
      return DIFFICULTY_CONFIGS.easy;
    case 6:
      return DIFFICULTY_CONFIGS.standard;
    case 8:
      return DIFFICULTY_CONFIGS.medium;
    case 10:
      return DIFFICULTY_CONFIGS.expert;
    case 12:
      return DIFFICULTY_CONFIGS.master;
    case 16:
      return DIFFICULTY_CONFIGS.hard;
    case 32:
      return DIFFICULTY_CONFIGS.titan;
    default:
      return DIFFICULTY_CONFIGS.easy;
  }
}

export interface CardItem {
  id: string;
  emoji: string;
  category: string;
  isFlipped: boolean;
  isMatched: boolean;
  matchedByPlayerId?: string;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  avatarBg: string;
  score: number;
  matches: number;
  consecutiveMatches: number;
  isBot?: boolean;
}

export interface GameState {
  boardSize: BoardSize;
  difficulty: DifficultyConfig;
  cards: CardItem[];
  flippedIndices: number[];
  players: Player[];
  activePlayerIndex: number;
  gameMode: 'solo' | 'pass_and_play' | 'online';
  status: 'idle' | 'playing' | 'paused' | 'gameover';
  moveCount: number;
  elapsedSeconds: number;
  currentStreak: number;
  maxStreak: number;
  isProcessing: boolean;
}

// Curated rich emojis collection by theme
export const EMOJI_PALETTE: { category: string; emojis: string[] }[] = [
  {
    category: 'Smilies',
    emojis: [
      '😀', '😎', '🥳', '🤩', '🤠', '🤖', '👾', '👻',
      '😻', '🦊', '🦄', '🦁', '🐯', '🐼', '🐨', '🐵',
      '🐸', '🐲', '🐙', '🦖', '🦩', '🐬', '🦚', '🦉'
    ],
  },
  {
    category: 'Food',
    emojis: [
      '🍕', '🍔', '🍟', '🍣', '🍦', '🍩', '🍪', '🥑',
      '🌮', '🍓', '🍉', '🍍', '🍒', '🍇', '🧁', '🍿',
      '🥞', '🧇', '🥨', '🍫', '🍬', '🥥', '🥭', '🍜'
    ],
  },
  {
    category: 'Cosmos & Adventure',
    emojis: [
      '🚀', '🛸', '🪐', '⭐', '🌟', '⚡', '🔥', '🌈',
      '💎', '👑', '🔮', '🎯', '🎨', '🎸', '🕹️', '🏆',
      '🎪', '🎭', '🧩', '🎲', '🪄', '⛵', '🗺️', '🏝️'
    ],
  },
  {
    category: 'Nature & Power',
    emojis: [
      '🌸', '🌻', '🌺', '🍀', '🌴', '🍁', '🍄', '🌊',
      '🌋', '🌪️', '☄️', '✨', '🌙', '☀️', '❄️', '🌵',
      '🎋', '🌾', '🌱', '🌿', '🍃', '🐚', '🪸', '🪷'
    ],
  },
];

// Expanded emoji generator for mega sizes up to 32x32 (512 pairs = 1024 cards)
export function getEmojiBank(requiredPairs: number): { emoji: string; category: string }[] {
  const all: { emoji: string; category: string }[] = [];
  EMOJI_PALETTE.forEach(group => {
    group.emojis.forEach(e => {
      all.push({ emoji: e, category: group.category });
    });
  });

  const extendedEmojis = [
    '👑', '💎', '💍', '💄', '🧢', '🕶️', '🥽', '🧣', '🧤', '🧦',
    '🚗', '🏎️', '🏍️', '🚲', '🛴', '✈️', '🚁', '🚤', '⛵', '🚢',
    '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸',
    '🥇', '🥈', '🥉', '🎖️', '🎗️', '🎫', '🎟️', '🎪', '🎭', '🎨',
    '📱', '💻', '🖥️', '📷', '📹', '📻', '🎙️', '🔋', '💡', '🔦',
    '🧭', '⏰', '⌛', '⏳', '📡', '🔭', '🔬', '💊', '🩹', '🩺',
    '🔑', '🗝️', '🪓', '🔨', '⛏️', '🪚', '🔧', '🪛', '🔩', '⚙️',
    '🧲', '🪜', '🧪', '🧬', '🔬', '🧺', '🪣', '🧹', '🧼', '🧽',
    '🛎️', '📦', '🏷️', '📫', '📪', '📬', '📭', '📮', '📯', '📜',
    '📄', '📃', '📑', '📊', '📈', '📉', '🗂️', '📁', '📂', '🗄️',
    '🧸', '🪅', '🪄', '🪁', '🪀', '🎯', '🎳', '🎮', '🎰', '🧩',
    '🎷', '🎺', '🎸', '🪕', '🎻', '🥁', '🪘', '🎹', '🪗', '🎤',
    '🍎', '🍐', '🍊', '🍋', '🍌', '🍈', '🍏', '🍑', '🍒', '🍓',
    '🥝', '🍅', '🥥', '🥑', '🍆', '🥔', '🥕', '🌽', '🌶️', '🥒',
    '🥬', '🥦', '🧄', '🧅', '🍄', '🥜', '🌰', '🍞', '🥐', '🥖',
    '🥨', '🥯', '🥞', '🧇', '🧀', '🍖', '🍗', '🥩', '🥓', '🍔',
    '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🫔', '🥙', '🧆', '🥚',
    '🍳', '🥘', '🍲', '🫕', '🥣', '🥗', '🍿', '🧈', '🧂', '🥫',
    '🍱', '🍘', '🍙', '🍚', '🍛', '🍜', '🍝', '🍠', '🍢', '🍣',
    '🍤', '🍥', '🥮', '🍡', '🥟', '🥠', '🥡', '🦪', '🍧', '🍨',
    '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿',
    '🍩', '🍪', '🌰', '🍯', '🥛', '🍼', '☕', '🫖', '🍵', '🍶',
    '🍾', '🍷', '🍸', '🍹', '🍺', '🍻', '🥂', '🥃', '🥤', '🧋',
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨',
    '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊',
    '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉',
    '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🪱', '🐛', '🦋', '🐌',
    '🐞', '🐜', '🪰', '🪲', '🪳', '🦟', '🦗', '🕷️', '🕸️', '🦂',
    '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀',
    '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🦭', '🐊', '🐅',
    '🐆', '🦓', '🦍', '🦧', '🦣', '🐘', '🦛', '🦏', '🐪', '🐫',
    '🦒', '🦘', '🦬', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑',
    '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🐓',
    '🦃', '🦚', '🦜', '🦢', '🦩', '🕊️', '🐇', '🦝', '🦨', '🦡',
    '🦫', '🦦', '🦥', '🐁', '🐀', '🐿️', '🦔', '🐾', '🐉', '🐲',
  ];

  extendedEmojis.forEach((e, idx) => {
    all.push({ emoji: e, category: `Extended ${Math.floor(idx / 20) + 1}` });
  });

  while (all.length < requiredPairs) {
    const base = extendedEmojis[all.length % extendedEmojis.length];
    all.push({ emoji: `${base}✨`, category: 'Special' });
  }

  return all.slice(0, requiredPairs);
}

/**
 * Fisher-Yates shuffle
 */
export function shuffleCards<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Simple, robust Mulberry32 seeded pseudo-random number generator
 */
export function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Hash a string (e.g., date "2026-10-19") into an integer seed
 */
export function hashSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
  }
  return hash;
}

/**
 * Get current UTC date string YYYY-MM-DD
 */
export function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Fisher-Yates shuffle with custom RNG
 */
export function shuffleCardsSeeded<T>(array: T[], rng: () => number): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generate a new game board with pairs (random shuffle)
 */
export function createGameBoard(boardSize: BoardSize): CardItem[] {
  const totalCards = boardSize * boardSize;
  const pairCount = totalCards / 2;
  const selectedEmojis = getEmojiBank(pairCount);

  const cards: CardItem[] = [];
  selectedEmojis.forEach((item, index) => {
    cards.push({
      id: `card-${index}-a`,
      emoji: item.emoji,
      category: item.category,
      isFlipped: false,
      isMatched: false,
    });
    cards.push({
      id: `card-${index}-b`,
      emoji: item.emoji,
      category: item.category,
      isFlipped: false,
      isMatched: false,
    });
  });

  return shuffleCards(cards);
}

/**
 * Generate a deterministic, server-synchronized Daily Challenge board
 * All players on the same date get the exact identical cards and layout!
 */
export function createDailyGameBoard(dateStr: string = getTodayDateString(), boardSize: BoardSize = 6): CardItem[] {
  const seed = hashSeed(`flip-emoji-daily-${dateStr}-${boardSize}`);
  const rng = mulberry32(seed);

  const totalCards = boardSize * boardSize;
  const pairCount = totalCards / 2;
  const emojiBank = getEmojiBank(pairCount * 2);

  // Deterministically select emoji pairs using the RNG
  const selectedEmojis: { emoji: string; category: string }[] = [];
  const pool = [...emojiBank];
  for (let i = 0; i < pairCount; i++) {
    const pickIndex = Math.floor(rng() * pool.length);
    selectedEmojis.push(pool.splice(pickIndex, 1)[0]);
  }

  const cards: CardItem[] = [];
  selectedEmojis.forEach((item, index) => {
    cards.push({
      id: `daily-${dateStr}-${index}-a`,
      emoji: item.emoji,
      category: item.category,
      isFlipped: false,
      isMatched: false,
    });
    cards.push({
      id: `daily-${dateStr}-${index}-b`,
      emoji: item.emoji,
      category: item.category,
      isFlipped: false,
      isMatched: false,
    });
  });

  return shuffleCardsSeeded(cards, rng);
}

export interface ScoreResult {
  isMatch: boolean;
  scoreDelta: number;
  newStreak: number;
  bonusPoints: number;
}

/**
 * Evaluate turn score with difficulty multiplier support
 * User prompt rule:
 * - When same emoji: collect 2 points.
 * - Else: -1 point.
 * - When user continues to match emojis consecutively: get additional 1 point (scaled by difficulty streak rate).
 * - Multiplier scales the reward on larger, harder grids!
 */
export function evaluateTurnScore(
  isMatch: boolean,
  currentStreak: number,
  scoreMultiplier = 1.0,
  streakBonusRate = 1
): ScoreResult {
  if (isMatch) {
    const newStreak = currentStreak + 1;
    const bonusPoints = currentStreak > 0 ? streakBonusRate : 0;
    const baseScore = 2 + bonusPoints;
    const scoreDelta = Math.round(baseScore * scoreMultiplier);
    return {
      isMatch: true,
      scoreDelta,
      newStreak,
      bonusPoints,
    };
  } else {
    return {
      isMatch: false,
      scoreDelta: -1,
      newStreak: 0,
      bonusPoints: 0,
    };
  }
}

/**
 * Check if game is completed
 */
export function isGameComplete(cards: CardItem[]): boolean {
  return cards.length > 0 && cards.every(c => c.isMatched);
}

/**
 * Calculate game stats (Accuracy, stars, par comparison)
 */
export function calculateGameStats(
  cards: CardItem[],
  moveCount: number,
  elapsedSeconds: number,
  parMoves?: number
) {
  const totalPairs = cards.length / 2;
  const accuracy = moveCount > 0 ? Math.min(100, Math.round((totalPairs / moveCount) * 100)) : 100;
  
  // Par comparison
  const par = parMoves || totalPairs * 2;
  const isUnderPar = moveCount <= par;

  // Stars 1 to 3
  let stars = 1;
  if (accuracy >= 65 || isUnderPar) stars = 3;
  else if (accuracy >= 40 || moveCount <= par * 1.3) stars = 2;

  return {
    totalPairs,
    accuracy,
    stars,
    elapsedSeconds,
    moveCount,
    parMoves: par,
    isUnderPar,
  };
}
