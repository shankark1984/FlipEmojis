/**
 * Device Management, Hardware/Browser Identification, and Active Device Tracking
 */

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  screenResolution: string;
  ipHint: string;
  firstLogin: string;
  lastActive: string;
  isCurrentDevice: boolean;
  status: 'active' | 'idle' | 'offline';
  lastPingMs?: number;
}

const STORAGE_KEY_DEVICE_ID = 'flip_emojis_device_id';
const STORAGE_KEY_DEVICES_LIST = 'flip_emojis_active_devices';

/**
 * Generate a unique, resilient device identifier
 */
export function generateDeviceId(): string {
  // Combine random entropy with timestamp
  const randomHex = Math.random().toString(36).substring(2, 10);
  const timeHex = Date.now().toString(36).substring(4);
  return `dev_${randomHex}${timeHex}`;
}

/**
 * Get the persistent device ID for this client, or generate a new one
 */
export function getOrCreateDeviceId(): string {
  try {
    const storage = typeof globalThis !== 'undefined' ? globalThis.localStorage : null;
    if (storage) {
      let id = storage.getItem(STORAGE_KEY_DEVICE_ID);
      if (!id || !id.startsWith('dev_')) {
        id = generateDeviceId();
        storage.setItem(STORAGE_KEY_DEVICE_ID, id);
      }
      return id;
    }
  } catch (e) {
    console.warn('LocalStorage unavailable for device ID, using memory ID', e);
  }
  return generateDeviceId();
}

/**
 * Detect OS, Browser, Device Type, and Screen from environment
 */
export function detectCurrentDevice(providedDeviceId?: string): DeviceInfo {
  const deviceId = providedDeviceId || getOrCreateDeviceId();
  let userAgent = '';
  let platform = '';
  let screenResolution = '1920x1080';

  if (typeof window !== 'undefined') {
    userAgent = navigator.userAgent || '';
    platform = (navigator as unknown as { userAgentData?: { platform?: string } }).userAgentData?.platform || navigator.platform || '';
    if (window.screen) {
      screenResolution = `${window.screen.width}x${window.screen.height}`;
    }
  }

  // Detect OS
  let os = 'Unknown OS';
  if (/windows/i.test(userAgent)) os = 'Windows 11';
  else if (/macintosh|mac os x/i.test(userAgent)) os = 'macOS';
  else if (/android/i.test(userAgent)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(userAgent)) os = 'iOS';
  else if (/linux/i.test(userAgent)) os = 'Linux';

  // Detect Browser
  let browser = 'Browser';
  if (/edg/i.test(userAgent)) browser = 'Microsoft Edge';
  else if (/chrome|crios/i.test(userAgent)) browser = 'Google Chrome';
  else if (/firefox|fxios/i.test(userAgent)) browser = 'Mozilla Firefox';
  else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) browser = 'Apple Safari';
  else if (/opera|opr/i.test(userAgent)) browser = 'Opera';

  // Detect Type
  let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
  if (/ipad|tablet/i.test(userAgent)) {
    deviceType = 'tablet';
  } else if (/mobi|android|iphone/i.test(userAgent)) {
    deviceType = 'mobile';
  }

  // Friendly Device Name
  const deviceName = `${browser} on ${os}`;
  const nowIso = new Date().toISOString();

  return {
    deviceId,
    deviceName,
    deviceType,
    browser,
    os,
    screenResolution,
    ipHint: '192.168.1.108 · Secure Client',
    firstLogin: nowIso,
    lastActive: nowIso,
    isCurrentDevice: true,
    status: 'active',
  };
}

/**
 * Calculate active status based on last active timestamp
 */
export function calculateDeviceStatus(lastActiveIso: string): 'active' | 'idle' | 'offline' {
  try {
    const diffMs = Date.now() - new Date(lastActiveIso).getTime();
    if (diffMs < 2 * 60 * 1000) return 'active'; // within 2 minutes
    if (diffMs < 15 * 60 * 1000) return 'idle'; // within 15 minutes
    return 'offline';
  } catch {
    return 'offline';
  }
}

/**
 * Format relative time (e.g. "Just now", "3m ago", "2h ago")
 */
export function formatRelativeTime(isoString: string): string {
  try {
    const diffMs = Math.max(0, Date.now() - new Date(isoString).getTime());
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 10) return 'Active now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h ago`;
    const diffDay = Math.floor(diffHour / 24);
    return `${diffDay}d ago`;
  } catch {
    return 'Recently';
  }
}

/**
 * Device Storage & Registry Service
 */
export class DeviceTracker {
  /**
   * Get all registered active devices, ensuring current device is tracked and up to date
   */
  public static getDevices(): DeviceInfo[] {
    const currentDeviceId = getOrCreateDeviceId();
    let devices: DeviceInfo[] = [];

    try {
      const stored = localStorage.getItem(STORAGE_KEY_DEVICES_LIST);
      if (stored) {
        devices = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error reading devices list', e);
    }

    // Check if current device is in the list
    let currentIdx = devices.findIndex(d => d.deviceId === currentDeviceId);
    const nowIso = new Date().toISOString();

    if (currentIdx === -1) {
      // First time this device is tracked
      const newCurrent = detectCurrentDevice(currentDeviceId);
      devices.unshift(newCurrent);
    } else {
      // Update current device's heartbeat and active state
      devices[currentIdx] = {
        ...devices[currentIdx],
        lastActive: nowIso,
        isCurrentDevice: true,
        status: 'active',
      };
    }

    // Mark other devices and update their statuses
    devices = devices.map(d => ({
      ...d,
      isCurrentDevice: d.deviceId === currentDeviceId,
      status: d.deviceId === currentDeviceId ? 'active' : calculateDeviceStatus(d.lastActive),
    }));

    this.saveDevices(devices);
    return devices;
  }

  /**
   * Save devices array to storage
   */
  public static saveDevices(devices: DeviceInfo[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_DEVICES_LIST, JSON.stringify(devices));
    } catch (e) {
      console.error('Failed to save devices', e);
    }
  }

  /**
   * Update heartbeat ping for the current device
   */
  public static heartbeat(): DeviceInfo | null {
    const devices = this.getDevices();
    const currentDeviceId = getOrCreateDeviceId();
    const current = devices.find(d => d.deviceId === currentDeviceId);
    if (current) {
      current.lastActive = new Date().toISOString();
      current.status = 'active';
      this.saveDevices(devices);
      return current;
    }
    return null;
  }

  /**
   * Update device name
   */
  public static renameDevice(deviceId: string, newName: string): boolean {
    const devices = this.getDevices();
    const target = devices.find(d => d.deviceId === deviceId);
    if (target && newName.trim()) {
      target.deviceName = newName.trim();
      this.saveDevices(devices);
      return true;
    }
    return false;
  }

  /**
   * Revoke or remove a device
   */
  public static revokeDevice(deviceId: string): DeviceInfo[] {
    let devices = this.getDevices();
    const currentDeviceId = getOrCreateDeviceId();
    // Cannot revoke current device this way, or if so, generate a new current device
    devices = devices.filter(d => d.deviceId !== deviceId);
    if (deviceId === currentDeviceId) {
      // Reset device ID
      localStorage.removeItem(STORAGE_KEY_DEVICE_ID);
      const newDev = detectCurrentDevice();
      devices.unshift(newDev);
    }
    this.saveDevices(devices);
    return devices;
  }

  /**
   * Register a login event on this device
   */
  public static registerLoginOnCurrentDevice(provider: string, accountName: string): DeviceInfo {
    const currentDeviceId = getOrCreateDeviceId();
    const devices = this.getDevices();
    let current = devices.find(d => d.deviceId === currentDeviceId);
    const nowIso = new Date().toISOString();

    if (!current) {
      current = detectCurrentDevice(currentDeviceId);
      devices.unshift(current);
    }

    current.lastActive = nowIso;
    current.status = 'active';
    this.saveDevices(devices);
    return current;
  }

  /**
   * Simulate a companion / second device for testing multi-device tracking
   */
  public static simulateAddDevice(
    name: string,
    type: 'mobile' | 'tablet' | 'desktop',
    os: string,
    browser: string
  ): DeviceInfo {
    const devices = this.getDevices();
    const fakeId = generateDeviceId();
    const now = new Date();
    // Make last active 30s ago
    const simulated: DeviceInfo = {
      deviceId: fakeId,
      deviceName: name,
      deviceType: type,
      browser,
      os,
      screenResolution: type === 'mobile' ? '393x852' : type === 'tablet' ? '820x1180' : '2560x1440',
      ipHint: '172.56.42.18 · Cellular Gateway',
      firstLogin: now.toISOString(),
      lastActive: new Date(now.getTime() - 25000).toISOString(),
      isCurrentDevice: false,
      status: 'active',
    };

    devices.push(simulated);
    this.saveDevices(devices);
    return simulated;
  }
}
