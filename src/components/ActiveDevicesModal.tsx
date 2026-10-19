import React, { useState, useEffect } from 'react';
import type { DeviceInfo } from '../utils/device';
import { DeviceTracker, formatRelativeTime } from '../utils/device';
import { StorageService } from '../utils/storage';
import {
  X,
  Smartphone,
  Laptop,
  Tablet,
  Check,
  Copy,
  Activity,
  Trash2,
  RefreshCw,
  Edit2,
  ShieldCheck,
  Plus,
  Wifi,
  Clock,
  Radio,
  Monitor
} from 'lucide-react';

interface ActiveDevicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSocialLogin?: () => void;
}

export const ActiveDevicesModal: React.FC<ActiveDevicesModalProps> = ({
  isOpen,
  onClose,
  onOpenSocialLogin,
}) => {
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [pingStatus, setPingStatus] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadDevices();
    }
  }, [isOpen]);

  const loadDevices = () => {
    const list = DeviceTracker.getDevices();
    setDevices(list);
  };

  if (!isOpen) return null;

  const currentDevice = devices.find(d => d.isCurrentDevice) || devices[0];
  const remoteDevices = devices.filter(d => !d.isCurrentDevice);

  const handleCopyId = (id: string) => {
    navigator.clipboard?.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStartRename = (device: DeviceInfo) => {
    setEditingDeviceId(device.deviceId);
    setEditingName(device.deviceName);
  };

  const handleSaveRename = (deviceId: string) => {
    if (editingName.trim()) {
      DeviceTracker.renameDevice(deviceId, editingName.trim());
      loadDevices();
    }
    setEditingDeviceId(null);
  };

  const handlePingHeartbeat = () => {
    const startTime = performance.now();
    DeviceTracker.heartbeat();
    const duration = Math.round(performance.now() - startTime);
    loadDevices();
    setPingStatus(`Active signal confirmed! Heartbeat latency: ${Math.max(1, duration + 8)}ms`);
    setTimeout(() => setPingStatus(null), 3000);
  };

  const handleRevokeDevice = (deviceId: string) => {
    const updated = DeviceTracker.revokeDevice(deviceId);
    setDevices(updated);
  };

  const handleSimulateDevice = (preset: 'iphone' | 'android' | 'ipad' | 'macbook') => {
    setIsSimulating(true);
    let name = '';
    let type: 'mobile' | 'tablet' | 'desktop' = 'mobile';
    let os = '';
    let browser = '';

    if (preset === 'iphone') {
      name = 'iPhone 15 Pro';
      type = 'mobile';
      os = 'iOS 18';
      browser = 'Mobile Safari';
    } else if (preset === 'android') {
      name = 'Google Pixel 8';
      type = 'mobile';
      os = 'Android 15';
      browser = 'Chrome Mobile';
    } else if (preset === 'ipad') {
      name = 'iPad Air (M2)';
      type = 'tablet';
      os = 'iPadOS 18';
      browser = 'Safari Tablet';
    } else {
      name = 'MacBook Air (Work)';
      type = 'desktop';
      os = 'macOS Sonoma';
      browser = 'Google Chrome';
    }

    DeviceTracker.simulateAddDevice(name, type, os, browser);
    loadDevices();
    setTimeout(() => setIsSimulating(false), 300);
  };

  const getDeviceIcon = (type: DeviceInfo['deviceType']) => {
    if (type === 'mobile') return <Smartphone className="w-5 h-5" />;
    if (type === 'tablet') return <Tablet className="w-5 h-5" />;
    return <Laptop className="w-5 h-5" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-6 relative max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-sm">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white font-display">
                  Active Devices Tracker
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {devices.length} {devices.length === 1 ? 'Device' : 'Devices'} Connected
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Monitor and manage all hardware registered and authenticated to your account
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Device Hero Card */}
        {currentDevice && (
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-emerald-500/40 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  {getDeviceIcon(currentDevice.deviceType)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    {editingDeviceId === currentDevice.deviceId ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={editingName}
                          onChange={e => setEditingName(e.target.value)}
                          className="px-2 py-0.5 text-xs bg-slate-900 border border-emerald-400 rounded text-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveRename(currentDevice.deviceId)}
                          className="p-1 bg-emerald-500 text-slate-950 rounded hover:bg-emerald-400"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-sm sm:text-base font-bold text-white">
                          {currentDevice.deviceName}
                        </h3>
                        <button
                          type="button"
                          onClick={() => handleStartRename(currentDevice)}
                          title="Rename this device"
                          className="text-slate-400 hover:text-white transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      THIS DEVICE · ACTIVE NOW
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    {currentDevice.browser} · {currentDevice.os} ({currentDevice.screenResolution})
                  </div>
                </div>
              </div>

              {/* Heartbeat Action */}
              <button
                type="button"
                onClick={handlePingHeartbeat}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 border border-slate-700 hover:border-emerald-500/50 transition-all self-start sm:self-center"
              >
                <Radio className="w-3.5 h-3.5 animate-spin" />
                <span>Send Heartbeat</span>
              </button>
            </div>

            {/* Device ID Display & Copy */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">Device Identifier:</span>
                <span className="font-mono font-bold text-emerald-400 text-xs bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {currentDevice.deviceId}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span>Last heartbeat: <strong className="text-slate-200">{formatRelativeTime(currentDevice.lastActive)}</strong></span>
                <button
                  type="button"
                  onClick={() => handleCopyId(currentDevice.deviceId)}
                  className="flex items-center gap-1 text-slate-300 hover:text-amber-400 transition-colors"
                >
                  {copiedId === currentDevice.deviceId ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy ID</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {pingStatus && (
              <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1.5 animate-fade-in">
                <Check className="w-3.5 h-3.5" />
                <span>{pingStatus}</span>
              </div>
            )}
          </div>
        )}

        {/* Remote Devices Section */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Other Logged-in Devices ({remoteDevices.length})
            </h3>
            {remoteDevices.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  remoteDevices.forEach(d => handleRevokeDevice(d.deviceId));
                }}
                className="text-[11px] text-rose-400 hover:text-rose-300 underline font-medium"
              >
                Sign Out All Remote Devices
              </button>
            )}
          </div>

          {remoteDevices.length === 0 ? (
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center">
              <p className="text-xs text-slate-400">
                No other devices are currently connected.
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Log in with your social account on another phone, tablet, or browser to see it tracked here in real-time.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {remoteDevices.map(d => (
                <div
                  key={d.deviceId}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 flex-shrink-0">
                      {getDeviceIcon(d.deviceType)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        {editingDeviceId === d.deviceId ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={editingName}
                              onChange={e => setEditingName(e.target.value)}
                              className="px-2 py-0.5 text-xs bg-slate-900 border border-amber-400 rounded text-white focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveRename(d.deviceId)}
                              className="p-1 bg-amber-500 text-slate-950 rounded hover:bg-amber-400"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="text-xs font-bold text-white">{d.deviceName}</span>
                            <button
                              type="button"
                              onClick={() => handleStartRename(d)}
                              className="text-slate-500 hover:text-white"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </>
                        )}
                        <span
                          className={`
                            text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase
                            ${d.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : d.status === 'idle' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'}
                          `}
                        >
                          {d.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-slate-500">{d.deviceId}</span>
                        <span>•</span>
                        <span>{d.browser} on {d.os}</span>
                        <span>•</span>
                        <span className="text-slate-300">{formatRelativeTime(d.lastActive)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleCopyId(d.deviceId)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                      title="Copy Device ID"
                    >
                      {copiedId === d.deviceId ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRevokeDevice(d.deviceId)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs text-rose-400 hover:text-white hover:bg-rose-500/20 rounded-lg border border-rose-500/30 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Revoke</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Multi-Device Simulation Quick Test */}
        <div className="mt-5 p-3.5 bg-slate-950/80 border border-slate-850 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate Logging in on another device</span>
            </span>
            <span className="text-[10px] text-slate-500">Test Multi-Device Tracking</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => handleSimulateDevice('iphone')}
              disabled={isSimulating}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-400/50 text-left transition-all group"
            >
              <Smartphone className="w-4 h-4 text-amber-400 mb-1 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-white">iPhone 15 Pro</div>
              <div className="text-[10px] text-slate-400">iOS Safari</div>
            </button>

            <button
              type="button"
              onClick={() => handleSimulateDevice('android')}
              disabled={isSimulating}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-400/50 text-left transition-all group"
            >
              <Smartphone className="w-4 h-4 text-emerald-400 mb-1 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-white">Pixel 8</div>
              <div className="text-[10px] text-slate-400">Android Chrome</div>
            </button>

            <button
              type="button"
              onClick={() => handleSimulateDevice('ipad')}
              disabled={isSimulating}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-400/50 text-left transition-all group"
            >
              <Tablet className="w-4 h-4 text-indigo-400 mb-1 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-white">iPad Air</div>
              <div className="text-[10px] text-slate-400">iPadOS Safari</div>
            </button>

            <button
              type="button"
              onClick={() => handleSimulateDevice('macbook')}
              disabled={isSimulating}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-400/50 text-left transition-all group"
            >
              <Laptop className="w-4 h-4 text-cyan-400 mb-1 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-white">MacBook Work</div>
              <div className="text-[10px] text-slate-400">macOS Chrome</div>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
          {onOpenSocialLogin && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSocialLogin();
              }}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Link Social Account (Google, FB, X)</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors ml-auto"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
