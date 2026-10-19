import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createGameBoard,
  createDailyGameBoard,
  evaluateTurnScore,
  isGameComplete,
  calculateGameStats,
  getEmojiBank,
  getDifficultyByBoardSize,
  DIFFICULTY_CONFIGS,
  type CardItem
} from './rules.ts';

test('createGameBoard generates exact number of cards and pairs for 4x4', () => {
  const cards = createGameBoard(4);
  assert.equal(cards.length, 16);

  const countMap: Record<string, number> = {};
  cards.forEach(c => {
    countMap[c.emoji] = (countMap[c.emoji] || 0) + 1;
  });

  const emojis = Object.keys(countMap);
  assert.equal(emojis.length, 8);
  emojis.forEach(e => {
    assert.equal(countMap[e], 2, `Emoji ${e} must have exactly 2 cards`);
  });
});

test('createGameBoard generates exact number of cards for 8x8 and 16x16', () => {
  const cards8 = createGameBoard(8);
  assert.equal(cards8.length, 64);

  const cards16 = createGameBoard(16);
  assert.equal(cards16.length, 256);
});

test('difficulty configs: 4x4, 8x8, 16x16, 32x32 have distinct challenge settings', () => {
  const easy = getDifficultyByBoardSize(4);
  assert.equal(easy.level, 'easy');
  assert.equal(easy.cardsCount, 16);
  assert.equal(easy.scoreMultiplier, 1.0);
  assert.equal(easy.memoryWindowMs, 950);

  const medium = getDifficultyByBoardSize(8);
  assert.equal(medium.level, 'medium');
  assert.equal(medium.cardsCount, 64);
  assert.equal(medium.scoreMultiplier, 1.5);
  assert.equal(medium.memoryWindowMs, 800);

  const hard = getDifficultyByBoardSize(16);
  assert.equal(hard.level, 'hard');
  assert.equal(hard.cardsCount, 256);
  assert.equal(hard.scoreMultiplier, 2.5);
  assert.equal(hard.memoryWindowMs, 650);

  const titan = getDifficultyByBoardSize(32);
  assert.equal(titan.level, 'titan');
  assert.equal(titan.cardsCount, 1024);
  assert.equal(titan.scoreMultiplier, 5.0);
  assert.equal(titan.memoryWindowMs, 500);
});

test('scoring rules: match gives 2 points and starts streak', () => {
  const firstMatch = evaluateTurnScore(true, 0);
  assert.equal(firstMatch.scoreDelta, 2);
  assert.equal(firstMatch.newStreak, 1);
  assert.equal(firstMatch.bonusPoints, 0);
});

test('scoring rules: consecutive match gives +1 additional bonus point on easy', () => {
  const secondMatch = evaluateTurnScore(true, 1, 1.0, 1);
  assert.equal(secondMatch.scoreDelta, 3);
  assert.equal(secondMatch.newStreak, 2);
  assert.equal(secondMatch.bonusPoints, 1);
});

test('scoring rules: difficulty multipliers scale points on higher levels', () => {
  // On Titan 32x32: scoreMultiplier = 5.0
  const titanMatch = evaluateTurnScore(true, 0, 5.0, 5);
  assert.equal(titanMatch.scoreDelta, 10); // 2 * 5.0 = 10 pts!

  // Streak on Titan: 2 base + 5 bonus = 7 * 5.0 = 35 pts!
  const titanStreakMatch = evaluateTurnScore(true, 1, 5.0, 5);
  assert.equal(titanStreakMatch.scoreDelta, 35);
});

test('scoring rules: mismatch deducts 1 point and resets streak to 0 across all difficulties', () => {
  const mismatch = evaluateTurnScore(false, 3, 5.0);
  assert.equal(mismatch.scoreDelta, -1);
  assert.equal(mismatch.newStreak, 0);
  assert.equal(mismatch.bonusPoints, 0);
});

test('isGameComplete validates all matched cards', () => {
  const cards: CardItem[] = [
    { id: '1', emoji: '🌟', category: 'A', isFlipped: true, isMatched: true },
    { id: '2', emoji: '🌟', category: 'A', isFlipped: true, isMatched: true },
  ];
  assert.equal(isGameComplete(cards), true);

  cards[1].isMatched = false;
  assert.equal(isGameComplete(cards), false);
});

test('calculateGameStats computes accuracy, par comparison, and stars', () => {
  const cards = createGameBoard(4);
  const statsUnderPar = calculateGameStats(cards, 12, 25, 16);
  assert.equal(statsUnderPar.totalPairs, 8);
  assert.equal(statsUnderPar.isUnderPar, true);
  assert.equal(statsUnderPar.stars, 3);
});

test('createDailyGameBoard is deterministic: same date yields identical board layout', () => {
  const dateStr = '2026-10-19';
  const boardA = createDailyGameBoard(dateStr, 6);
  const boardB = createDailyGameBoard(dateStr, 6);

  assert.equal(boardA.length, 36);
  assert.equal(boardB.length, 36);

  // Every single card at every position must have identical emoji and IDs
  for (let i = 0; i < boardA.length; i++) {
    assert.equal(boardA[i].emoji, boardB[i].emoji, `Mismatch at index ${i}`);
    assert.equal(boardA[i].id, boardB[i].id, `ID mismatch at index ${i}`);
  }
});

test('createDailyGameBoard with different dates yields different board layouts', () => {
  const boardToday = createDailyGameBoard('2026-10-19', 6);
  const boardTomorrow = createDailyGameBoard('2026-10-20', 6);

  assert.equal(boardToday.length, 36);
  assert.equal(boardTomorrow.length, 36);

  // They should not be 100% identical
  let matches = 0;
  for (let i = 0; i < boardToday.length; i++) {
    if (boardToday[i].emoji === boardTomorrow[i].emoji) {
      matches++;
    }
  }
  assert.notEqual(matches, 36, 'Different dates must yield different daily board configurations');
});

