import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X, RefreshCw, CheckCircle2, Sparkles, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';

interface PWAInstallBannerProps {
  forceShowModal?: boolean;
  onCloseForceModal?: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  forceShowModal,
  onCloseForceModal,
}) => {
  const {
    isInstallable,
    hasNativePrompt,
    isInstalled,
    isIOS,
    hasPromptBeenShown,
    needRefresh,
    install,
    dismissPrompt,
    updateApp,
  } = usePWAInstall();

  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleInstallClick = async () => {
    if (hasNativePrompt) {
      const accepted = await install();
      if (accepted && onCloseForceModal) onCloseForceModal();
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // Desktop / Other: show manual instructions
      setShowIOSModal(true);
    }
  };

  const handleUpdate = () => {
    setIsUpdating(true);
    setTimeout(() => {
      updateApp();
    }, 600);
  };

  // Auto-Update Toast (Highest priority when new build / content is ready)
  if (needRefresh) {
    return (
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 text-white p-3.5 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-md animate-[bounce_1s_ease-out]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <RefreshCw className={`w-4 h-4 text-white ${isUpdating ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <p className="text-xs font-bold font-display">New Update Available!</p>
              <p className="text-[11px] text-white/80">Latest boards, features & daily sync ready.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleUpdate}
            disabled={isUpdating}
            className="px-3 py-1.5 bg-white text-slate-950 font-bold text-xs rounded-xl shadow hover:bg-slate-100 transition-all active:scale-95 shrink-0"
          >
            {isUpdating ? 'Updating...' : 'Auto Update'}
          </button>
        </div>
      </div>
    );
  }

  // If already installed in standalone mode and not manually forced, do not render banner
  if (isInstalled && !forceShowModal) {
    return null;
  }

  return (
    <>
      {/* Ambient install prompt suppressed from screen as requested */}

      {/* Force modal or iOS Guidance Dialog */}
      {(showIOSModal || forceShowModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-center">
            <button
              type="button"
              onClick={() => {
                setShowIOSModal(false);
                if (onCloseForceModal) onCloseForceModal();
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
              aria-label="Close installation modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 mx-auto flex items-center justify-center text-3xl shadow-lg shadow-amber-500/25 mb-4">
              🃏
            </div>

            <h3 className="text-lg font-bold font-display text-white">
              Install Flip Emojis on Device
            </h3>
            <p className="text-xs text-slate-400 mt-1 mb-5">
              Enjoy fullscreen gameplay, automatic updates, and fast launch from your home screen.
            </p>

            {hasNativePrompt ? (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={async () => {
                    await install();
                    setShowIOSModal(false);
                    if (onCloseForceModal) onCloseForceModal();
                  }}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl shadow-lg flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Install App Now
                </button>
              </div>
            ) : isIOS ? (
              <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 text-left text-xs space-y-3">
                <div className="flex items-center gap-3 text-slate-200">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <span>1. Tap the <strong className="text-white">Share</strong> button in Safari toolbar.</span>
                </div>
                <div className="flex items-center gap-3 text-slate-200">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <span>2. Scroll down and tap <strong className="text-white">Add to Home Screen</strong>.</span>
                </div>
                <div className="flex items-center gap-3 text-slate-200">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span>3. Tap <strong className="text-white">Add</strong> to launch with native performance!</span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 text-left text-xs space-y-2 text-slate-300">
                <p className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>On mobile: Tap browser menu (⋮) and select <strong>Install App</strong> or <strong>Add to Home Screen</strong>.</span>
                </p>
                <p className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>On desktop Chrome/Edge: Click the install icon in the URL bar (top-right).</span>
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setShowIOSModal(false);
                if (onCloseForceModal) onCloseForceModal();
              }}
              className="mt-5 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Continue in Browser
            </button>
          </div>
        </div>
      )}
    </>
  );
};
