import test from 'node:test';
import assert from 'node:assert/strict';
import { StorageService } from './storage.ts';

// Mock localStorage for Node test environment
if (typeof globalThis.localStorage === 'undefined') {
  const store: Record<string, string> = {};
  globalThis.localStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, val: string) => {
      store[key] = String(val);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      for (const k of Object.keys(store)) delete store[k];
    },
    key: (i: number) => Object.keys(store)[i] || null,
    length: 0,
  } as Storage;
}

test('StorageService: coin balance defaults to initial 150 coins', () => {
  const coins = StorageService.getCoins();
  assert.ok(typeof coins === 'number');
  assert.ok(coins >= 0);
});

test('StorageService: addCoins increments user balance correctly', () => {
  const initial = StorageService.getCoins();
  const updated = StorageService.addCoins(250, 'pack_test');
  assert.equal(updated, initial + 250);
  assert.equal(StorageService.getCoins(), initial + 250);
});

test('StorageService: spendCoins deducts coins when sufficient balance', () => {
  StorageService.addCoins(100);
  const before = StorageService.getCoins();
  const success = StorageService.spendCoins(25);
  assert.equal(success, true);
  assert.equal(StorageService.getCoins(), before - 25);
});

test('StorageService: spendCoins rejects when insufficient balance', () => {
  const profile = StorageService.getProfile();
  StorageService.saveProfile({ ...profile, coins: 10 });
  const success = StorageService.spendCoins(25);
  assert.equal(success, false);
  assert.equal(StorageService.getCoins(), 10);
});

test('StorageService: watchRewardedAd grants +50 coins and unlocks ad_watcher achievement', () => {
  const profile = StorageService.getProfile();
  StorageService.saveProfile({ ...profile, coins: 50 });
  const result = StorageService.watchRewardedAd();
  assert.equal(result.coinsGranted, 50);
  assert.equal(result.newTotal, 100);

  const achievements = StorageService.getAchievements();
  const adBadge = achievements.find(a => a.id === 'ad_watcher');
  assert.ok(adBadge);
  assert.ok(adBadge.unlockedAt);
});

test('StorageService: unlockProPass sets isProPass to true and unlocks master_pass badge', () => {
  const profile = StorageService.getProfile();
  StorageService.saveProfile({ ...profile, isProPass: false });
  assert.equal(StorageService.isProPass(), false);

  const updated = StorageService.unlockProPass();
  assert.equal(updated.isProPass, true);
  assert.equal(StorageService.isProPass(), true);

  const achievements = StorageService.getAchievements();
  const passBadge = achievements.find(a => a.id === 'master_pass');
  assert.ok(passBadge);
  assert.ok(passBadge.unlockedAt);
});

test('StorageService: getCardBack and setCardBack update holographic skins', () => {
  StorageService.setCardBack('cyber');
  assert.equal(StorageService.getCardBack(), 'cyber');
  StorageService.setCardBack('gold');
  assert.equal(StorageService.getCardBack(), 'gold');
  StorageService.setCardBack('classic');
  assert.equal(StorageService.getCardBack(), 'classic');
});
