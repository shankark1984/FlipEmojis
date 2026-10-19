import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateDeviceId,
  getOrCreateDeviceId,
  detectCurrentDevice,
  calculateDeviceStatus,
  formatRelativeTime,
  DeviceTracker,
} from './device.ts';
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

test('generateDeviceId returns unique ID with dev_ prefix', () => {
  const id1 = generateDeviceId();
  const id2 = generateDeviceId();
  assert.match(id1, /^dev_[a-z0-9]+$/);
  assert.match(id2, /^dev_[a-z0-9]+$/);
  assert.notEqual(id1, id2);
});

test('getOrCreateDeviceId persists ID across invocations', () => {
  const id1 = getOrCreateDeviceId();
  const id2 = getOrCreateDeviceId();
  assert.equal(id1, id2);
  assert.ok(id1.startsWith('dev_'));
});

test('detectCurrentDevice returns valid DeviceInfo structure', () => {
  const dev = detectCurrentDevice();
  assert.ok(dev.deviceId.startsWith('dev_'));
  assert.ok(dev.deviceName.length > 0);
  assert.ok(['desktop', 'mobile', 'tablet'].includes(dev.deviceType));
  assert.equal(dev.isCurrentDevice, true);
  assert.equal(dev.status, 'active');
});

test('calculateDeviceStatus distinguishes active, idle, and offline', () => {
  const now = new Date();
  const activeIso = now.toISOString();
  const idleIso = new Date(now.getTime() - 5 * 60 * 1000).toISOString(); // 5m ago
  const offlineIso = new Date(now.getTime() - 30 * 60 * 1000).toISOString(); // 30m ago

  assert.equal(calculateDeviceStatus(activeIso), 'active');
  assert.equal(calculateDeviceStatus(idleIso), 'idle');
  assert.equal(calculateDeviceStatus(offlineIso), 'offline');
});

test('formatRelativeTime formats durations clearly', () => {
  const now = new Date();
  assert.equal(formatRelativeTime(now.toISOString()), 'Active now');
  const twoMinAgo = new Date(now.getTime() - 120 * 1000).toISOString();
  assert.equal(formatRelativeTime(twoMinAgo), '2m ago');
});

test('DeviceTracker tracks devices and supports heartbeat and rename', () => {
  const devices = DeviceTracker.getDevices();
  assert.ok(devices.length >= 1);
  const currentDev = devices.find(d => d.isCurrentDevice);
  assert.ok(currentDev);

  // Test rename
  const renamed = DeviceTracker.renameDevice(currentDev.deviceId, 'Gaming Station');
  assert.equal(renamed, true);
  const updatedDevices = DeviceTracker.getDevices();
  const found = updatedDevices.find(d => d.deviceId === currentDev.deviceId);
  assert.equal(found?.deviceName, 'Gaming Station');

  // Test heartbeat
  const hb = DeviceTracker.heartbeat();
  assert.ok(hb);
  assert.equal(hb.status, 'active');
});

test('DeviceTracker.simulateAddDevice adds companion mobile/tablet device', () => {
  const sim = DeviceTracker.simulateAddDevice('iPhone 15 Pro', 'mobile', 'iOS 18', 'Safari');
  assert.ok(sim.deviceId.startsWith('dev_'));
  assert.equal(sim.deviceName, 'iPhone 15 Pro');
  assert.equal(sim.deviceType, 'mobile');
  assert.equal(sim.isCurrentDevice, false);

  const devices = DeviceTracker.getDevices();
  const exists = devices.some(d => d.deviceId === sim.deviceId);
  assert.equal(exists, true);
});

test('StorageService.loginWithSocialAccount authenticates Google, Facebook, or X and binds active device', () => {
  // Test Google Login
  const gResult = StorageService.loginWithSocialAccount(
    'google',
    'alex@gmail.com',
    'Alex Turner',
    '😎'
  );
  assert.equal(gResult.profile.provider, 'google');
  assert.equal(gResult.profile.name, 'Alex Turner');
  assert.equal(gResult.profile.email, 'alex@gmail.com');
  assert.ok(gResult.device.deviceId.startsWith('dev_'));

  // Test Facebook Login
  const fbResult = StorageService.loginWithSocialAccount(
    'facebook',
    'sarah.fb@facebook.com',
    'Sarah Facebook',
    '🦁'
  );
  assert.equal(fbResult.profile.provider, 'facebook');
  assert.equal(fbResult.profile.name, 'Sarah Facebook');

  // Test X Login
  const xResult = StorageService.loginWithSocialAccount(
    'x',
    '@FlipMasterX',
    'FlipMasterX',
    '⚡'
  );
  assert.equal(xResult.profile.provider, 'x');

  // Check achievements unlocked
  const ach = StorageService.getAchievements();
  const devAch = ach.find(a => a.id === 'device_linked');
  const socAch = ach.find(a => a.id === 'social_linked');
  assert.ok(devAch?.unlockedAt);
  assert.ok(socAch?.unlockedAt);
});
