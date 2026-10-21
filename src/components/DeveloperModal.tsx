import React, { useState } from 'react';
import {
  X,
  Smartphone,
  BookOpen,
  Wrench,
  Coins,
  Crown,
  RefreshCw,
  Trash2,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { StorageService, type UserProfile } from '../utils/storage';
import { ActiveDevicesModal } from './ActiveDevicesModal';
import { GooglePlayGuideModal } from './GooglePlayGuideModal';
import confetti from 'canvas-confetti';

interface DeveloperModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onProfileUpdated: (profile: UserProfile) => void;
  onOpenSocialLogin?: () => void;
}

export const DeveloperModal: React.FC<DeveloperModalProps> = ({
  isOpen,
  onClose,
  profile,
  onProfileUpdated,
  onOpenSocialLogin,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'devices' | 'store_guide'>('overview');
  const [copiedId, setCopiedId] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  if (!isOpen) return null;

  const currentDeviceId = StorageService.getDeviceId();

  const handleCopyDeviceId = () => {
    navigator.clipboard?.writeText(currentDeviceId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleAddCoins = (amount: number) => {
    const updatedTotal = StorageService.addCoins(amount, 'sandbox_dev');
    const updated: UserProfile = { ...profile, coins: updatedTotal };
    StorageService.saveProfile(updated);
    onProfileUpdated(updated);
    setStatusMessage(`Added +${amount} coins! Balance: ${updatedTotal}`);
    try {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
    } catch {}
    setTimeout(() => setStatusMessage(''), 2500);
  };

  const handleToggleProPass = () => {
    const nextPass = !profile.isProPass;
    const updated: UserProfile = { ...profile, isProPass: nextPass };
    StorageService.saveProfile(updated);
    onProfileUpdated(updated);
    setStatusMessage(nextPass ? 'VIP Master Pass enabled!' : 'VIP Master Pass disabled.');
    setTimeout(() => setStatusMessage(''), 2500);
  };

  const handleResetCoins = () => {
    const updated: UserProfile = { ...profile, coins: 0 };
    StorageService.saveProfile(updated);
    onProfileUpdated(updated);
    setStatusMessage('Coins reset to 0 (useful for testing zero-coin prompt).');
    setTimeout(() => setStatusMessage(''), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-[fade-in_0.2s_ease-out]">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-emerald-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/90 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-white text-base">Developer Tools Console</h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                  DEV ONLY
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Hidden from public players · Active device tracking & Google Play revenue setup
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            aria-label="Close developer console"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-6">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition ${
              activeTab === 'overview'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Sandbox & Testing</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('devices')}
            className={`py-3 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition ${
              activeTab === 'devices'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Device Tracker</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('store_guide')}
            className={`py-3 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition ${
              activeTab === 'store_guide'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Google Play & Revenue Guide</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {statusMessage && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-xs font-semibold text-emerald-300 animate-[fade-in_0.2s_ease-out]">
              {statusMessage}
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Device identifier block */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-slate-400 block">Current Device ID (UUID)</span>
                  <span className="font-mono text-emerald-400 text-sm font-bold">{currentDeviceId}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[11px] text-slate-500">Heartbeat transmitting (Every 25s)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyDeviceId}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs flex items-center gap-1.5 transition"
                  >
                    {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId ? 'Copied' : 'Copy ID'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('devices')}
                    className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 rounded-xl text-xs font-semibold transition"
                  >
                    Full Tracker →
                  </button>
                </div>
              </div>

              {/* Verification Email Dispatcher Configuration */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <span className="text-sm">✉️</span>
                    <span>Verification Dispatcher Email</span>
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Active System Sender
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-mono text-amber-300 font-bold text-xs sm:text-sm">shankara.singh@gmail.com</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Designated official email ID to dispatch verification links to new user registrations.
                    </p>
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-1 rounded-lg shrink-0">
                    STATUS: OK
                  </div>
                </div>
              </div>

              {/* Economy Test Tools */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span>Economy Sandbox Controls</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => handleAddCoins(100)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold rounded-xl border border-slate-700 transition"
                  >
                    +100 Coins
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddCoins(1000)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold rounded-xl border border-slate-700 transition"
                  >
                    +1,000 Coins
                  </button>

                  <button
                    type="button"
                    onClick={handleResetCoins}
                    className="px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold rounded-xl border border-rose-500/30 transition"
                  >
                    Reset Coins (0)
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleProPass}
                    className={`px-3 py-2 text-xs font-bold rounded-xl border transition ${
                      profile.isProPass
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {profile.isProPass ? 'VIP Pass: Active' : 'Toggle VIP Pass'}
                  </button>
                </div>

                <p className="text-[11px] text-slate-500">
                  Tip: Set coins to 0 to test the automatic <strong>"Need Coins?"</strong> ad view prompt when clicking Tip in game.
                </p>
              </div>

              {/* Quick links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('devices')}
                  className="p-3.5 bg-slate-950 border border-slate-800 hover:border-emerald-500/50 rounded-2xl text-left transition group"
                >
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
                    <Smartphone className="w-4 h-4" />
                    <span>Multi-Device Tracker</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Inspect active device list, ping devices, simulate concurrent devices.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('store_guide')}
                  className="p-3.5 bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-2xl text-left transition group"
                >
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-1">
                    <BookOpen className="w-4 h-4" />
                    <span>Play Store Publishing Guide</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Step-by-step TWA APK/AAB build, In-App Billing products, and AdMob ads.
                  </p>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'devices' && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                >
                  ← Back to Sandbox
                </button>
                <span className="text-xs text-slate-400">Active Device Session Manager</span>
              </div>
              {/* Embedded Active Devices component */}
              <ActiveDevicesModal
                isOpen={true}
                onClose={() => setActiveTab('overview')}
                onOpenSocialLogin={onOpenSocialLogin}
              />
            </div>
          )}

          {activeTab === 'store_guide' && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                >
                  ← Back to Sandbox
                </button>
                <span className="text-xs text-slate-400">Revenue & Publishing Documentation</span>
              </div>
              {/* Embedded Google Play Guide component */}
              <GooglePlayGuideModal
                isOpen={true}
                onClose={() => setActiveTab('overview')}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
