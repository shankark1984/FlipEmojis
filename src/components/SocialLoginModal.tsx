import React, { useState } from 'react';
import type { UserProfile } from '../utils/storage';
import { StorageService } from '../utils/storage';
import type { DeviceInfo } from '../utils/device';
import {
  X,
  Check,
  ShieldCheck,
  Smartphone,
  Sparkles,
  ArrowRight,
  LogOut,
  ExternalLink,
  Laptop,
  Copy,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface SocialLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onProfileUpdated: (profile: UserProfile) => void;
  onOpenDevicesModal?: () => void;
}

interface SocialOption {
  id: UserProfile['provider'];
  name: string;
  brandName: string;
  icon: string | React.ReactNode;
  bgClass: string;
  hoverClass: string;
  textClass: string;
  badge: string;
  defaultEmail: string;
  defaultName: string;
  defaultAvatar: string;
}

export const SocialLoginModal: React.FC<SocialLoginModalProps> = ({
  isOpen,
  onClose,
  profile,
  onProfileUpdated,
  onOpenDevicesModal,
}) => {
  const [selectedProvider, setSelectedProvider] = useState<UserProfile['provider']>('google');
  const [customHandle, setCustomHandle] = useState(profile.email || '');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [successInfo, setSuccessInfo] = useState<{ msg: string; deviceId: string } | null>(null);
  const [copiedDeviceId, setCopiedDeviceId] = useState(false);
  const [copiedVerifyLink, setCopiedVerifyLink] = useState(false);
  const [verificationPending, setVerificationPending] = useState<{ email: string; name: string } | null>(() => {
    if (profile.provider !== 'guest' && profile.emailVerified === false) {
      return {
        email: profile.email || profile.verificationEmail || 'shankara.singh@gmail.com',
        name: profile.name || 'Player',
      };
    }
    return null;
  });
  const [isEmailApproved, setIsEmailApproved] = useState(false);

  // Sync state if modal is opened when verification is pending
  React.useEffect(() => {
    if (isOpen && profile.provider !== 'guest' && profile.emailVerified === false) {
      setVerificationPending({
        email: profile.email || profile.verificationEmail || 'shankara.singh@gmail.com',
        name: profile.name || 'Player',
      });
      setIsEmailApproved(false);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const currentDeviceId = StorageService.getDeviceId();

  const handleCopyDeviceId = () => {
    navigator.clipboard?.writeText(currentDeviceId);
    setCopiedDeviceId(true);
    setTimeout(() => setCopiedDeviceId(false), 2000);
  };

  const socialProviders: SocialOption[] = [
    {
      id: 'google',
      name: 'Google / Gmail',
      brandName: 'Gmail Account',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
      ),
      bgClass: 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800 shadow-sm',
      hoverClass: 'border-red-400',
      textClass: 'text-slate-900',
      badge: 'Popular',
      defaultEmail: 'player.master@gmail.com',
      defaultName: 'Alex Turner',
      defaultAvatar: '🦊',
    },
    {
      id: 'facebook',
      name: 'Facebook',
      brandName: 'Facebook Profile',
      icon: (
        <svg className="w-5 h-5 fill-[#1877F2]" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      bgClass: 'bg-[#1877F2] hover:bg-[#166fe5] border-[#1877F2] text-white shadow-sm',
      hoverClass: 'border-blue-400',
      textClass: 'text-white',
      badge: 'Fast Connect',
      defaultEmail: 'sarah.gamer@facebook.com',
      defaultName: 'Sarah Jenkins',
      defaultAvatar: '🦁',
    },
    {
      id: 'x',
      name: 'X (Twitter)',
      brandName: 'X Handle',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 23.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      bgClass: 'bg-black hover:bg-neutral-900 border-neutral-800 text-white shadow-sm',
      hoverClass: 'border-neutral-500',
      textClass: 'text-white',
      badge: 'Gaming',
      defaultEmail: '@EmojiChampX',
      defaultName: 'EmojiChamp',
      defaultAvatar: '⚡',
    },
    {
      id: 'github',
      name: 'GitHub',
      brandName: 'GitHub Developer',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
      ),
      bgClass: 'bg-[#24292e] hover:bg-[#1b1f23] border-[#30363d] text-white shadow-sm',
      hoverClass: 'border-slate-500',
      textClass: 'text-white',
      badge: 'Code',
      defaultEmail: 'coder@github.com',
      defaultName: 'DevFlipster',
      defaultAvatar: '👾',
    },
    {
      id: 'discord',
      name: 'Discord',
      brandName: 'Discord Tag',
      icon: '🎮',
      bgClass: 'bg-[#5865F2] hover:bg-[#4752c4] border-[#5865F2] text-white shadow-sm',
      hoverClass: 'border-indigo-400',
      textClass: 'text-white',
      badge: 'Voice & Chat',
      defaultEmail: 'FlipPlayer#1337',
      defaultName: 'FlipPlayer#1337',
      defaultAvatar: '🦄',
    },
    {
      id: 'apple',
      name: 'Apple',
      brandName: 'Apple ID',
      icon: '🍎',
      bgClass: 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white shadow-sm',
      hoverClass: 'border-slate-400',
      textClass: 'text-white',
      badge: 'Privacy First',
      defaultEmail: 'player@icloud.com',
      defaultName: 'Apple Player',
      defaultAvatar: '🍏',
    },
  ];

  const handleExecuteLogin = (prov: UserProfile['provider']) => {
    setIsLoading(true);
    const target = socialProviders.find(p => p.id === prov);
    const handleToUse = customHandle.trim() || target?.defaultEmail || `${prov}_user`;
    const nameToUse = customHandle.trim()
      ? customHandle.split('@')[0]
      : target?.defaultName || 'Player';
    const avatarToUse = target?.defaultAvatar || '🦊';

    setLoadingStep(`Connecting to ${target?.name || prov} OAuth server...`);

    setTimeout(() => {
      setLoadingStep(`Verifying credentials for ${handleToUse}...`);
      setTimeout(() => {
        setLoadingStep(`Registering Active Device ID [${currentDeviceId}]...`);
        setTimeout(() => {
          // Perform login in storage
          const result = StorageService.loginWithSocialAccount(
            prov,
            handleToUse,
            nameToUse,
            avatarToUse
          );

          // Mark verification email sent initially
          StorageService.sendVerificationEmail(handleToUse, nameToUse, prov);
          onProfileUpdated(StorageService.getProfile());

          setIsLoading(false);
          setLoadingStep('');
          setVerificationPending({
            email: handleToUse,
            name: nameToUse,
          });
        }, 400);
      }, 400);
    }, 400);
  };

  const handleGuestPlay = () => {
    const updated = StorageService.logoutToGuest();
    onProfileUpdated(updated);
    onClose();
  };

  const activeOption = socialProviders.find(p => p.id === selectedProvider) || socialProviders[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-6 relative max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-xl shadow-md">
              <ShieldCheck className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white font-display">
                Social Account Login
              </h2>
              <p className="text-xs text-slate-400">
                Sign in with Gmail, Facebook, X, or other social networks
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

        {/* Device ID Tracking Banner */}
        <div className="mt-4 p-3 bg-slate-950 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-slate-300">Device ID:</span>
              <span className="font-mono text-xs text-emerald-400 font-bold bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
                {currentDeviceId}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyDeviceId}
              title="Copy Device ID"
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-amber-400 transition-colors"
            >
              {copiedDeviceId ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
            <span>Tracking active state for this hardware</span>
            {onOpenDevicesModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDevicesModal();
                }}
                className="text-amber-400 hover:text-amber-300 underline font-medium"
              >
                Manage Active Devices →
              </button>
            )}
          </div>
        </div>

        {/* Current Login Status */}
        {profile.provider !== 'guest' ? (
          <div className="mt-3 p-3 bg-slate-850/60 border border-slate-700/60 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-full ${profile.avatarBg} flex items-center justify-center text-sm`}>
                {profile.avatar}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">{profile.name}</span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {profile.provider} Connected
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {profile.email || 'Verified Account'}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleGuestPlay}
              className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-2 py-1 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        ) : (
          <div className="mt-3 text-xs text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Currently playing as <strong>Guest</strong>. Connect a social account to sync progress & track your device!</span>
          </div>
        )}

        {/* Loading state indicator */}
        {isLoading && (
          <div className="my-5 p-4 bg-slate-950 border border-amber-500/30 rounded-2xl flex flex-col items-center justify-center text-center animate-pulse">
            <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mb-2"></div>
            <span className="text-xs font-bold text-amber-300">{loadingStep}</span>
            <span className="text-[11px] text-slate-400 mt-1">Creating secure device token...</span>
          </div>
        )}

        {/* Success toast */}
        {successInfo && (
          <div className="my-5 p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl flex items-center gap-3 animate-bounce">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">{successInfo.msg}</div>
              <div className="text-[11px] text-emerald-300 font-mono mt-0.5">
                Device ID: {successInfo.deviceId} marked ACTIVE
              </div>
            </div>
          </div>
        )}

        {/* Verification Email Sent Screen */}
        {verificationPending && (
          <div className="mt-4 p-5 rounded-2xl bg-slate-950 border border-cyan-500/40 shadow-xl space-y-4 animate-fade-in">
            {isEmailApproved ? (
              <div className="p-5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center text-2xl font-bold">
                  ✓
                </div>
                <h4 className="text-sm font-bold text-white">Email Verified & Approved to Play!</h4>
                <p className="text-xs text-emerald-300">
                  Your account is verified and ready. Launching game arena...
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-xl shrink-0">
                    ✉️
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-white">Email Verification Required</h4>
                    <p className="text-xs text-slate-300">
                      Sender ID: <strong className="font-mono text-amber-300 font-bold">shankara.singh@gmail.com</strong>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Sending link to new user: <span className="font-mono text-cyan-300 font-bold">{verificationPending.email}</span>
                    </p>
                  </div>
                </div>

                {/* Instant 1-Click Approval Primary Action */}
                <button
                  type="button"
                  onClick={() => {
                    const approved = StorageService.approveEmailVerification();
                    onProfileUpdated(approved);
                    setIsEmailApproved(true);
                    setTimeout(() => {
                      setVerificationPending(null);
                      onClose();
                    }, 1200);
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl flex items-center justify-center gap-2 transition active:scale-95 border border-emerald-400/50"
                >
                  <CheckCircle2 className="w-5 h-5 text-slate-950" />
                  <span>⚡ 1-Click Approve Account & Play</span>
                </button>

                {/* Explanation note on sandbox vs live SMTP */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 space-y-1.5">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">Verification Link Dispatched from shankara.singh@gmail.com</p>
                      <p className="text-slate-400 mt-0.5 leading-relaxed">
                        Verification links for new registrations are issued by <strong>shankara.singh@gmail.com</strong>. You can approve instantly below or send directly via Gmail.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Direct Verification Link Box */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-2.5 shadow-inner">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/80 pb-1.5">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span>From: <strong className="text-amber-300 font-mono">shankara.singh@gmail.com</strong></span>
                    </span>
                    <span className="font-mono text-emerald-400 text-[10px]">Authorized Dispatcher</span>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-hidden">
                    <span className="truncate flex-1">
                      {window.location.origin}/?verify=1&email={encodeURIComponent(verificationPending.email)}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const url = `${window.location.origin}/?verify=1&email=${encodeURIComponent(verificationPending.email)}`;
                        navigator.clipboard?.writeText(url);
                        setCopiedVerifyLink(true);
                        setTimeout(() => setCopiedVerifyLink(false), 2000);
                      }}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[10px] font-sans flex items-center gap-1 shrink-0 transition"
                    >
                      {copiedVerifyLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedVerifyLink ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <a
                      href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(verificationPending.email)}&su=${encodeURIComponent('Verify your Flip Emojis account')}&body=${encodeURIComponent('Hello ' + verificationPending.name + ',\n\nHere is your official verification link to approve your Flip Emojis account:\n\n' + window.location.origin + '/?verify=1&email=' + encodeURIComponent(verificationPending.email) + '\n\nSent from: shankara.singh@gmail.com (Flip Emojis System Administrator)')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-gradient-to-r from-red-600/30 to-amber-600/30 hover:from-red-600/40 hover:to-amber-600/40 border border-red-500/40 text-white rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition text-center"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-red-400" />
                      <span>Send from shankara.singh@gmail.com</span>
                    </a>

                    <a
                      href={`mailto:${encodeURIComponent(verificationPending.email)}?subject=${encodeURIComponent('Verify Flip Emojis Game Account')}&body=${encodeURIComponent('Click here to verify your Flip Emojis account: ' + window.location.origin + '/?verify=1&email=' + encodeURIComponent(verificationPending.email) + '\n\nSender: shankara.singh@gmail.com')}`}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition text-center"
                    >
                      <span>📬 Default Mail Client</span>
                    </a>
                  </div>

                  <div className="text-right pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setVerificationPending(null);
                      }}
                      className="text-[11px] text-slate-400 hover:text-slate-200 underline"
                    >
                      Register with different email
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Social Provider Buttons */}
        {!isLoading && !successInfo && !verificationPending && (
          <div className="mt-4">
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Select Social Provider to Sign In
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {socialProviders.map(p => {
                const isSelected = selectedProvider === p.id;
                const isLinked = profile.provider === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedProvider(p.id);
                      setCustomHandle(p.defaultEmail);
                    }}
                    className={`
                      flex items-center justify-between p-3 rounded-2xl border text-left transition-all
                      ${isSelected ? 'border-amber-400 ring-2 ring-amber-400/30 bg-slate-800' : 'border-slate-800 hover:border-slate-700 bg-slate-950'}
                    `}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700/50 flex items-center justify-center">
                        {p.icon}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{p.name}</span>
                          {isLinked && (
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1 rounded">
                              Connected
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">{p.badge}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Account Handle / Email Input */}
            <div className="mt-4 p-3.5 bg-slate-950 border border-slate-800 rounded-2xl">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {activeOption.brandName} or Email address
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customHandle}
                  onChange={e => setCustomHandle(e.target.value)}
                  placeholder={`e.g. ${activeOption.defaultEmail}`}
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={() => setCustomHandle(activeOption.defaultEmail)}
                  className="px-2.5 py-2 text-[11px] bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-700/50 whitespace-nowrap transition-colors"
                >
                  Fill Sample
                </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5">
                Connecting will register this device (<span className="font-mono text-emerald-400">{currentDeviceId}</span>) as active on this account.
              </p>
            </div>

            {/* Primary Action Button */}
            <div className="mt-5 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleExecuteLogin(selectedProvider)}
                className={`
                  w-full sm:flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg
                  ${activeOption.bgClass}
                `}
              >
                <span>Sign in with {activeOption.name}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleGuestPlay}
                className="w-full sm:w-auto px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap"
              >
                Continue as Guest
              </button>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>Active devices are synchronized with your account</span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
