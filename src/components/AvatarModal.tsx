import React, { useState } from 'react';
import type { UserProfile } from '../utils/storage';
import { StorageService } from '../utils/storage';
import {
  X,
  Check,
  Download,
  Upload,
  ShieldCheck,
  Smartphone,
  Copy,
  ExternalLink,
  Laptop
} from 'lucide-react';

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onOpenSocialLogin?: () => void;
  onOpenDevicesModal?: () => void;
  onOpenGooglePlayGuide?: () => void;
}

const AVATAR_OPTIONS = [
  '🦊', '🐱', '🐶', '🐼', '🦁', '🐯', '🦄', '🐨',
  '🤖', '👾', '👻', '🤠', '😎', '🥳', '🤩', '🥷',
  '🚀', '🛸', '⭐', '⚡', '🔥', '💎', '👑', '🔮',
  '🍕', '🥑', '🍣', '🍩', '🍦', '🧁', '🍿', '🍉',
];

const BG_GRADIENTS = [
  { name: 'Amber Blaze', class: 'bg-gradient-to-tr from-amber-500 to-orange-500' },
  { name: 'Emerald Forest', class: 'bg-gradient-to-tr from-emerald-500 to-teal-600' },
  { name: 'Cosmic Violet', class: 'bg-gradient-to-tr from-indigo-500 to-purple-600' },
  { name: 'Rose Sunset', class: 'bg-gradient-to-tr from-rose-500 to-pink-600' },
  { name: 'Cyan Wave', class: 'bg-gradient-to-tr from-cyan-500 to-blue-600' },
  { name: 'Slate Shadow', class: 'bg-gradient-to-tr from-slate-700 to-slate-900' },
];

const TITLES = [
  'Emoji Novice',
  'Memory Whiz',
  'Combo Striker',
  'Brain Dynamo',
  'Grid Conqueror',
  'Titan of 32x32',
  'Memory God',
];

export const AvatarModal: React.FC<AvatarModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  onOpenSocialLogin,
  onOpenDevicesModal,
  onOpenGooglePlayGuide,
}) => {
  const [name, setName] = useState(profile.name);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [avatarBg, setAvatarBg] = useState(profile.avatarBg);
  const [title, setTitle] = useState(profile.title);
  const [provider, setProvider] = useState(profile.provider);
  const [backupMessage, setBackupMessage] = useState('');
  const [versionTaps, setVersionTaps] = useState(0);
  const [isDevUnlocked, setIsDevUnlocked] = useState(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('dev') === 'true' || urlParams.get('dev') === '1' || localStorage.getItem('flip_emojis_developer_mode') === 'true';
    } catch {
      return false;
    }
  });

  if (!isOpen) return null;

  const currentDeviceId = StorageService.getDeviceId();



  const handleSave = () => {
    const updated: UserProfile = {
      ...profile,
      name: name.trim() || 'FlipMaster',
      avatar,
      avatarBg,
      title,
      provider,
      currentDeviceId,
    };
    StorageService.saveProfile(updated);
    onSaveProfile(updated);
    onClose();
  };

  const handleExport = () => {
    const data = StorageService.exportSaveData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flip_emojis_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupMessage('Progress exported to file!');
    setTimeout(() => setBackupMessage(''), 3000);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        const text = ev.target?.result as string;
        if (text && StorageService.importSaveData(text)) {
          const fresh = StorageService.getProfile();
          setName(fresh.name);
          setAvatar(fresh.avatar);
          setAvatarBg(fresh.avatarBg);
          setTitle(fresh.title);
          setProvider(fresh.provider);
          onSaveProfile(fresh);
          setBackupMessage('Save data imported successfully!');
          setTimeout(() => setBackupMessage(''), 3000);
        } else {
          setBackupMessage('Failed to import file.');
        }
      };
      reader.readAsText(file);
    }
  };

  const simulateSocialLogin = (prov: UserProfile['provider']) => {
    setProvider(prov);
    let sampleName = name;
    let sampleAvatar = avatar;

    if (prov === 'google') {
      sampleName = name === 'FlipMaster' ? 'Alex Google' : name;
      sampleAvatar = '😎';
    } else if (prov === 'facebook') {
      sampleName = name === 'FlipMaster' ? 'Sarah Facebook' : name;
      sampleAvatar = '🦁';
    } else if (prov === 'x') {
      sampleName = name === 'FlipMaster' ? '@FlipChampX' : name;
      sampleAvatar = '⚡';
    } else if (prov === 'github') {
      sampleName = name === 'FlipMaster' ? 'DevFlip' : name;
      sampleAvatar = '👾';
    } else if (prov === 'discord') {
      sampleName = name === 'FlipMaster' ? 'DiscordPro#1337' : name;
      sampleAvatar = '🦄';
    } else if (prov === 'apple') {
      sampleName = name === 'FlipMaster' ? 'Apple Player' : name;
      sampleAvatar = '🍏';
    } else {
      sampleName = 'FlipMaster';
    }

    setName(sampleName);
    setAvatar(sampleAvatar);

    // Register active device on login
    StorageService.loginWithSocialAccount(prov, `${prov}_user@flip.io`, sampleName, sampleAvatar);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white font-display">Player Profile & Settings</h2>
            <p className="text-xs text-slate-400">Personalize your character, social account & device</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Avatar Preview */}
        <div className="flex flex-col items-center justify-center py-4">
          <div className={`w-20 h-20 rounded-3xl ${avatarBg} flex items-center justify-center text-4xl shadow-lg ring-4 ring-slate-800/80 mb-2 transition-all`}>
            {avatar}
          </div>
          <span className="text-base font-bold text-white">{name || 'Unnamed Player'}</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs text-amber-400 font-mono">{title}</span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-emerald-400 capitalize">{provider}</span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-amber-300 font-mono font-bold">🪙 {(profile.coins ?? 150).toLocaleString()}</span>
            {profile.isProPass && (
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-black">VIP</span>
            )}
          </div>
        </div>

        {/* Nickname Input */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Display Nickname
          </label>
          <input
            type="text"
            value={name}
            maxLength={18}
            onChange={e => setName(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
            placeholder="Enter player name"
          />
        </div>

        {/* Title Selection */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Player Title / Badge
          </label>
          <select
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
          >
            {TITLES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Avatar Emoji Grid */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Choose Character Emoji
          </label>
          <div className="grid grid-cols-8 gap-2 p-2 bg-slate-950 rounded-2xl border border-slate-850 max-h-36 overflow-y-auto">
            {AVATAR_OPTIONS.map(em => (
              <button
                key={em}
                type="button"
                onClick={() => setAvatar(em)}
                className={`
                  h-10 text-xl rounded-xl flex items-center justify-center transition-all
                  ${avatar === em ? 'bg-amber-500/20 ring-2 ring-amber-400 scale-105' : 'hover:bg-slate-800'}
                `}
              >
                {em}
              </button>
            ))}
          </div>
        </div>

        {/* Background Gradient */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Avatar Aura Color
          </label>
          <div className="grid grid-cols-3 gap-2">
            {BG_GRADIENTS.map(bg => (
              <button
                key={bg.name}
                type="button"
                onClick={() => setAvatarBg(bg.class)}
                className={`
                  flex items-center gap-2 p-2 rounded-xl border text-xs text-left transition-all
                  ${avatarBg === bg.class ? 'border-amber-400 ring-1 ring-amber-400 bg-slate-800' : 'border-slate-800 hover:border-slate-700 bg-slate-950'}
                `}
              >
                <div className={`w-4 h-4 rounded-full ${bg.class}`} />
                <span className="truncate text-slate-300">{bg.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Social Accounts Link */}
        <div className="mb-5 p-3.5 bg-slate-950 border border-slate-850 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Social Accounts</span>
            </div>
            {onOpenSocialLogin && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSocialLogin();
                }}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium"
              >
                Full Social Login →
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {(['google', 'facebook', 'x', 'github', 'discord', 'guest'] as const).map(p => (
              <button
                key={p}
                type="button"
                onClick={() => simulateSocialLogin(p)}
                className={`
                  px-3 py-1.5 text-xs rounded-xl font-medium capitalize transition-colors
                  ${provider === p ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-850 text-slate-300 hover:bg-slate-800'}
                `}
              >
                {p === 'guest' ? 'Play as Guest' : p === 'google' ? 'Google / Gmail' : p}
              </button>
            ))}
          </div>
        </div>

        {/* Backup & Cloud Sync */}
        <div className="mb-5 flex items-center justify-between gap-3 p-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl text-xs">
          <div>
            <span className="font-semibold text-slate-300 block">Cloud & Local Sync</span>
            <span className="text-[11px] text-slate-500">Export or restore your memory records</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
            <label className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Import</span>
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>
        </div>

        {backupMessage && (
          <div className="mb-4 text-center text-xs text-emerald-400 font-medium">
            {backupMessage}
          </div>
        )}

        {/* App Version & Developer Easter Egg */}
        <div className="mb-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
          <button
            type="button"
            onClick={() => {
              const next = versionTaps + 1;
              setVersionTaps(next);
              if (next >= 5) {
                const newDev = !isDevUnlocked;
                setIsDevUnlocked(newDev);
                try {
                  localStorage.setItem('flip_emojis_developer_mode', newDev ? 'true' : 'false');
                  window.dispatchEvent(new Event('storage'));
                } catch {}
                setBackupMessage(newDev ? '🛠️ Developer Mode Enabled!' : 'Developer Mode Disabled.');
                setVersionTaps(0);
                setTimeout(() => setBackupMessage(''), 2500);
              }
            }}
            className="text-[11px] font-mono text-slate-500 hover:text-slate-400 cursor-pointer select-none"
            title="Flip Emojis v1.2.0"
          >
            v1.2.0 (Build 2026) {isDevUnlocked && <span className="text-emerald-400 font-bold">[Dev]</span>}
          </button>

          {isDevUnlocked && (
            <div className="flex items-center gap-2">
              {onOpenDevicesModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenDevicesModal();
                  }}
                  className="px-2 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[10px] font-mono hover:bg-emerald-500/30 transition"
                >
                  Device Tracker
                </button>
              )}
              {onOpenGooglePlayGuide && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenGooglePlayGuide();
                  }}
                  className="px-2 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[10px] font-mono hover:bg-amber-500/30 transition"
                >
                  Play Store Guide
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-xs font-bold rounded-xl hover:from-amber-300 hover:to-orange-400 shadow-md transition-all"
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
};
