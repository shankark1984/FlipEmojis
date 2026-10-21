import React from 'react';
import { X, Tv, Coins, Sparkles, Crown } from 'lucide-react';

interface NeedCoinsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCoins: number;
  requiredCoins: number;
  onWatchAd: () => void;
  onOpenShop: () => void;
}

export const NeedCoinsModal: React.FC<NeedCoinsModalProps> = ({
  isOpen,
  onClose,
  currentCoins,
  requiredCoins,
  onWatchAd,
  onOpenShop,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-[fade-in_0.2s_ease-out]">
      <div className="relative w-full max-w-sm bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl text-center">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 mx-auto flex items-center justify-center text-3xl shadow-lg shadow-amber-500/25 mb-4 animate-bounce">
          🪙
        </div>

        <h3 className="text-xl font-bold font-display text-white">
          Need More Coins?
        </h3>
        <p className="text-xs text-slate-300 mt-1 mb-2">
          Revealing a matching pair tip requires <strong className="text-amber-400">{requiredCoins} Coins</strong>.
        </p>

        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800/80 rounded-full border border-slate-700 text-xs font-mono mb-5">
          <span className="text-slate-400">Current Balance:</span>
          <span className="text-amber-400 font-bold">{currentCoins} 🪙</span>
        </div>

        {/* Options to get coins */}
        <div className="space-y-3">
          {/* 1. Watch Ad Option (Free +50 coins) */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onWatchAd();
            }}
            className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/25 flex items-center justify-between group active:scale-95 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Tv className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <div className="text-xs font-extrabold flex items-center gap-1.5">
                  <span>Watch Sponsor Ad</span>
                  <span className="text-[9px] bg-emerald-400 text-slate-950 px-1 rounded font-black">
                    FREE
                  </span>
                </div>
                <div className="text-[10px] text-white/80">5-second video · Instant reward</div>
              </div>
            </div>
            <span className="font-mono text-xs font-extrabold text-amber-300 bg-black/20 px-2 py-1 rounded-lg">
              +50 🪙
            </span>
          </button>

          {/* 2. In-App Purchase Shop */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenShop();
            }}
            className="w-full py-3 px-4 bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-amber-500/40 font-bold rounded-2xl flex items-center justify-between active:scale-95 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Coins className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Buy Coins or VIP Pass</span>
                  <Crown className="w-3 h-3 text-amber-400" />
                </div>
                <div className="text-[10px] text-slate-400">Packs from $0.99 · Unlimited VIP tips</div>
              </div>
            </div>
            <span className="text-xs text-amber-400">Store →</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 text-xs text-slate-500 hover:text-slate-400"
        >
          No thanks, I'll play without tips
        </button>
      </div>
    </div>
  );
};
