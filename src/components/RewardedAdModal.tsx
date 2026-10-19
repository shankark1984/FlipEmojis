import React, { useState, useEffect } from 'react';
import { X, Play, Volume2, Sparkles, Award, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { StorageService } from '../utils/storage';
import confetti from 'canvas-confetti';
import { AudioService } from '../utils/audio';

interface RewardedAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardEarned: (coins: number) => void;
}

const AD_SPONSORS = [
  {
    name: 'Emoji Quest RPG',
    tagline: 'Match emojis, defeat monsters & conquer the enchanted realm!',
    emoji: '⚔️',
    bg: 'from-violet-600 via-indigo-600 to-purple-800',
    cta: 'Install on Google Play',
    stars: '4.8 ⭐⭐⭐⭐⭐ (120K reviews)',
  },
  {
    name: 'Cyber Blade Neon 2099',
    tagline: 'High speed futuristic runner with synthwave beats & infinite combos.',
    emoji: '🚀',
    bg: 'from-cyan-600 via-blue-600 to-slate-900',
    cta: 'Pre-register on Play Store',
    stars: '4.9 ⭐⭐⭐⭐⭐ (450K reviews)',
  },
  {
    name: 'Brain IQ Memory Dojo',
    tagline: 'Train your brain with daily cognitive spatial puzzles & leaderboards.',
    emoji: '🧠',
    bg: 'from-emerald-600 via-teal-700 to-slate-900',
    cta: 'Free on App Store & Play Store',
    stars: '4.7 ⭐⭐⭐⭐⭐ (89K reviews)',
  },
];

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({
  isOpen,
  onClose,
  onRewardEarned,
}) => {
  const [currentSponsorIndex] = useState(() => Math.floor(Math.random() * AD_SPONSORS.length));
  const [secondsRemaining, setSecondsRemaining] = useState(5);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);

  const sponsor = AD_SPONSORS[currentSponsorIndex];

  useEffect(() => {
    if (!isOpen) {
      setSecondsRemaining(5);
      setIsCompleted(false);
      setIsClaimed(false);
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsCompleted(true);
          try {
            AudioService.playCelebration();
          } catch {}
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClaimReward = () => {
    if (isClaimed) return;
    setIsClaimed(true);

    const { coinsGranted } = StorageService.watchRewardedAd();

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {}

    onRewardEarned(coinsGranted);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const progressPercent = Math.min(100, Math.round(((5 - secondsRemaining) / 5) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-[fade-in_0.2s_ease-out]">
      <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Top Header with Countdown and Ad badge */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Rewarded Ad · AdMob Partner
            </span>
            <div className="flex items-center gap-1 text-slate-400 text-xs">
              <Volume2 className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isCompleted ? (
              <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                Reward in {secondsRemaining}s
              </span>
            ) : (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Reward Ready!
              </span>
            )}
            {isCompleted && (
              <button
                type="button"
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
                aria-label="Close ad modal"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-800 h-1.5">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-400 transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Interactive Ad Body */}
        <div className={`p-6 bg-gradient-to-br ${sponsor.bg} text-white text-center flex flex-col items-center justify-center min-h-[260px] relative overflow-hidden`}>
          {/* Animated floating background elements */}
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

          <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-4xl shadow-xl shadow-black/30 mb-3 animate-[bounce_2s_infinite]">
            {sponsor.emoji}
          </div>

          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
            Featured Google Play Sponsor
          </span>
          <h4 className="text-xl font-black font-display tracking-tight text-white mt-1">
            {sponsor.name}
          </h4>
          <p className="text-xs text-white/90 max-w-xs mt-1.5 leading-relaxed">
            {sponsor.tagline}
          </p>
          <div className="mt-2 text-[11px] text-amber-200 font-semibold">
            {sponsor.stars}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <span className="px-4 py-2 bg-white text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 hover:bg-slate-100 transition active:scale-95 cursor-pointer">
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              {sponsor.cta}
            </span>
          </div>
        </div>

        {/* Reward Claim Footer */}
        <div className="p-5 bg-slate-900 flex flex-col items-center">
          <div className="flex items-center gap-2 text-xs text-slate-300 mb-3">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Reward for viewing: <strong className="text-amber-400 font-mono">+50 Coins</strong></span>
          </div>

          {isCompleted ? (
            <button
              type="button"
              onClick={handleClaimReward}
              disabled={isClaimed}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-sm rounded-2xl shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              {isClaimed ? '🪙 +50 Coins Added!' : 'Claim +50 Coins Now!'}
            </button>
          ) : (
            <div className="w-full py-3 px-4 bg-slate-800 text-slate-500 font-bold text-xs rounded-2xl text-center">
              Watch {secondsRemaining} more seconds to claim reward...
            </div>
          )}

          <div className="flex items-center gap-1.5 mt-3 text-[10px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Verified Google Mobile Ads (AdMob) Partner Policy Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
};
