import React, { useState } from 'react';
import {
  X,
  Coins,
  Tv,
  Crown,
  Sparkles,
  Check,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Palette,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { StorageService, type UserProfile } from '../utils/storage';
import confetti from 'canvas-confetti';
import { AudioService } from '../utils/audio';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onProfileUpdated: (profile: UserProfile) => void;
  onOpenRewardedAd: () => void;
}

interface ProductItem {
  id: string;
  title: string;
  subtitle: string;
  coins?: number;
  realPrice: string;
  badge?: string;
  icon: string;
  isPass?: boolean;
}

const COIN_PACKS: ProductItem[] = [
  {
    id: 'pack_small',
    title: 'Handful of Coins',
    subtitle: '10 Game Tips / Hints',
    coins: 250,
    realPrice: '$0.99',
    badge: 'Starter',
    icon: '🪙',
  },
  {
    id: 'pack_medium',
    title: 'Pouch of Coins',
    subtitle: '40 Game Tips + Combo Boost',
    coins: 1000,
    realPrice: '$2.99',
    badge: 'Popular 🔥',
    icon: '💰',
  },
  {
    id: 'pack_large',
    title: 'Chest of Coins',
    subtitle: '200 Game Tips + Golden Foil',
    coins: 5000,
    realPrice: '$9.99',
    badge: 'Best Value 💎',
    icon: '👑',
  },
];

const CARD_THEMES = [
  { id: 'classic', name: 'Classic Slate', preview: 'bg-slate-800 border-amber-500/40 text-amber-400', desc: 'Default sleek slate design' },
  { id: 'cyber', name: 'Cyber Neon', preview: 'bg-gradient-to-tr from-cyan-600 to-fuchsia-600 border-cyan-400 text-cyan-200', desc: 'Glowing cyberpunk synthwave cards' },
  { id: 'galactic', name: 'Galactic Void', preview: 'bg-gradient-to-tr from-indigo-950 via-purple-900 to-black border-purple-500 text-purple-200', desc: 'Deep cosmic starfield cards' },
  { id: 'gold', name: 'Golden Royale', preview: 'bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-700 border-yellow-300 text-yellow-100', desc: 'Luxurious 24K gold gilded cards' },
];

export const ShopModal: React.FC<ShopModalProps> = ({
  isOpen,
  onClose,
  profile,
  onProfileUpdated,
  onOpenRewardedAd,
}) => {
  const [activeTab, setActiveTab] = useState<'coins' | 'pass' | 'themes'>('coins');
  const [purchasingItem, setPurchasingItem] = useState<ProductItem | null>(null);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const userCoins = typeof profile.coins === 'number' ? profile.coins : 150;
  const isProPassActive = !!profile.isProPass;
  const activeCardBack = profile.activeCardBack || 'classic';

  const handleStartPurchase = (item: ProductItem) => {
    setPurchasingItem(item);
  };

  const handleConfirmPurchase = () => {
    if (!purchasingItem) return;
    setIsProcessingCheckout(true);

    setTimeout(() => {
      setIsProcessingCheckout(false);

      if (purchasingItem.isPass) {
        const updated = StorageService.unlockProPass();
        onProfileUpdated(updated);
        setPurchaseSuccess('VIP Master Pass Activated! Unlimited Tips & Advanced Modes Unlocked.');
      } else if (purchasingItem.coins) {
        const newTotal = StorageService.addCoins(purchasingItem.coins, 'real_money_purchase');
        const updated: UserProfile = { ...profile, coins: newTotal };
        StorageService.saveProfile(updated);
        onProfileUpdated(updated);
        setPurchaseSuccess(`+${purchasingItem.coins} Coins delivered to your balance!`);
      }

      try {
        AudioService.playCelebration();
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      } catch {}

      setTimeout(() => {
        setPurchasingItem(null);
        setPurchaseSuccess(null);
      }, 1800);
    }, 1200);
  };

  const handleBuyPassWithCoins = () => {
    if (userCoins < 2500) return;
    const ok = StorageService.spendCoins(2500);
    if (ok) {
      const updated = StorageService.unlockProPass();
      onProfileUpdated(updated);
      try {
        AudioService.playCelebration();
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      } catch {}
    }
  };

  const handleSelectCardBack = (themeId: string) => {
    if (!isProPassActive && themeId !== 'classic') {
      setActiveTab('pass');
      return;
    }
    StorageService.setCardBack(themeId as any);
    const updated: UserProfile = { ...profile, activeCardBack: themeId as any };
    onProfileUpdated(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-[fade-in_0.2s_ease-out]">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/90 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-xl shadow-md shadow-amber-500/20">
              🪙
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-extrabold text-white text-lg">Coin & Pro Store</h3>
                {isProPassActive && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase font-mono">
                    VIP Pro Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Unlock tips to find matches, watch rewarded ads, or unlock advanced modes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Coins Balance pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 font-mono font-bold text-sm">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>{userCoins.toLocaleString()}</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              aria-label="Close shop"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-6">
          <button
            type="button"
            onClick={() => setActiveTab('coins')}
            className={`py-3 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition ${
              activeTab === 'coins'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Coin Packs & Ads</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pass')}
            className={`py-3 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition ${
              activeTab === 'pass'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>Play More Advance (Pro Pass)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('themes')}
            className={`py-3 px-4 font-bold text-xs border-b-2 flex items-center gap-2 transition ${
              activeTab === 'themes'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Card Themes</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* TAB 1: COINS & REWARDED ADS */}
          {activeTab === 'coins' && (
            <div className="space-y-6">
              {/* Rewarded Ad Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-950/70 via-indigo-950/70 to-slate-900 border border-violet-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-violet-600/30 border border-violet-400/30 flex items-center justify-center text-2xl shrink-0">
                    📺
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm">Watch Rewarded Ad</h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        100% Free
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Watch a 5-second sponsor video to claim <strong>+50 Coins</strong> for hints!
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onOpenRewardedAd();
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-400 hover:to-indigo-400 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 shrink-0 active:scale-95 transition"
                >
                  <Tv className="w-4 h-4" />
                  <span>Watch Ad (+50 Coins)</span>
                </button>
              </div>

              {/* Real Money Coin Packs */}
              <div>
                <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                  <span>Coin Packs (Buy with Real Money)</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    · Powered by Google Play Billing / In-App Purchases
                  </span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {COIN_PACKS.map((pack) => (
                    <div
                      key={pack.id}
                      className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-amber-500/50 flex flex-col justify-between transition-all group relative overflow-hidden"
                    >
                      {pack.badge && (
                        <div className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          {pack.badge}
                        </div>
                      )}

                      <div>
                        <div className="text-3xl mb-2">{pack.icon}</div>
                        <h5 className="font-bold text-white text-sm">{pack.title}</h5>
                        <p className="text-[11px] text-slate-400 mt-0.5">{pack.subtitle}</p>
                        <div className="mt-3 flex items-baseline gap-1">
                          <span className="font-mono font-extrabold text-amber-400 text-xl">
                            +{pack.coins?.toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-400">Coins</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleStartPurchase(pack)}
                        className="mt-4 w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs rounded-xl shadow transition active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Buy {pack.realPrice}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* What Coins Are Used For Info */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-2">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>How to use Coins in Flip Emojis:</span>
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                  <li>
                    <strong className="text-slate-200">25 Coins per Hint:</strong> Use the 💡 <strong>Find Match</strong> tip in gameplay to instantly reveal and highlight a hidden matching pair.
                  </li>
                  <li>
                    <strong className="text-slate-200">Free Rewarded Ads:</strong> Run low on coins? Simply watch a quick 5-second sponsor video to replenish +50 coins anytime!
                  </li>
                  <li>
                    <strong className="text-slate-200">Unlock VIP Master Pass:</strong> Grind to 2,500 Coins to unlock the Pro Pass for free, or get it instantly for $4.99.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: PLAY MORE ADVANCE (PRO PASS) */}
          {activeTab === 'pass' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/20 via-orange-600/10 to-slate-900 border border-amber-500/40 relative overflow-hidden">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-mono">
                      VIP Advanced Pass
                    </span>
                    <h4 className="text-2xl font-black font-display text-white mt-2">
                      Flip Emojis Master Pass
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 max-w-md">
                      Play at an advanced level with extreme boards, endless free tips, exclusive card skins, and competitive prestige.
                    </p>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-3xl shadow-xl shadow-amber-500/30 shrink-0">
                    👑
                  </div>
                </div>

                {/* Features list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 text-xs">
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-200">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>Unlimited Free Tips:</strong> Use Find Match anytime for 0 Coins</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-200">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>Advanced Grids:</strong> Unlocks 6x6, 8x8, 16x16 & 32x32 Titan</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-200">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>Holographic Themes:</strong> Cyber Neon, Void, & Gold cards</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-200">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>VIP Badge:</strong> Golden crown icon on leaderboard & profile</span>
                  </div>
                </div>

                {/* Purchase / Status Action */}
                <div className="mt-6 pt-5 border-t border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                  {isProPassActive ? (
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <ShieldCheck className="w-5 h-5" />
                      <span>You own the VIP Master Pass! All advanced features unlocked.</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-center sm:text-left">
                        <span className="text-[11px] text-slate-400">One-time purchase · Lifetime access</span>
                        <div className="text-xl font-black text-amber-300 font-mono">$4.99 USD</div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() =>
                            handleStartPurchase({
                              id: 'vip_master_pass',
                              title: 'VIP Master Pass',
                              subtitle: 'Unlimited Tips & Advanced Game Modes',
                              realPrice: '$4.99',
                              icon: '👑',
                              isPass: true,
                            })
                          }
                          className="flex-1 sm:flex-none px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow-lg active:scale-95 transition flex items-center justify-center gap-2"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>Buy with Real Money ($4.99)</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleBuyPassWithCoins}
                          disabled={userCoins < 2500}
                          className={`px-4 py-3 border rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            userCoins >= 2500
                              ? 'border-amber-500/60 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                              : 'border-slate-800 bg-slate-900 text-slate-500 cursor-not-allowed'
                          }`}
                          title={userCoins < 2500 ? 'Need 2,500 coins' : 'Buy with 2,500 coins'}
                        >
                          <Coins className="w-4 h-4" />
                          <span>2,500 🪙</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CARD THEMES */}
          {activeTab === 'themes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">Holographic Card Skins</h4>
                  <p className="text-xs text-slate-400">Customize the look and feel of all cards on the board</p>
                </div>
                {!isProPassActive && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    VIP Pass Required for Premium Skins
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {CARD_THEMES.map((theme) => {
                  const isSelected = activeCardBack === theme.id;
                  const isLocked = !isProPassActive && theme.id !== 'classic';

                  return (
                    <div
                      key={theme.id}
                      onClick={() => handleSelectCardBack(theme.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/10'
                          : isLocked
                          ? 'border-slate-800 bg-slate-900/50 opacity-60'
                          : 'border-slate-700 bg-slate-800/60 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Card preview box */}
                        <div className={`w-12 h-16 rounded-xl border flex items-center justify-center text-xs font-bold shadow-md ${theme.preview}`}>
                          🃏
                        </div>
                        <div>
                          <h5 className="font-bold text-white text-sm">{theme.name}</h5>
                          <p className="text-[11px] text-slate-400">{theme.desc}</p>
                        </div>
                      </div>

                      <div>
                        {isSelected ? (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 font-extrabold text-[10px]">
                            Active
                          </span>
                        ) : isLocked ? (
                          <span className="text-xs text-amber-400 font-mono font-bold">🔒 VIP</span>
                        ) : (
                          <span className="text-xs text-slate-400 hover:text-white font-medium">Equip</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* In-App Purchase Simulated Checkout Dialog */}
        {purchasingItem && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]">
            <div className="w-full max-w-sm bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl text-center">
              {purchaseSuccess ? (
                <div className="py-4 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center text-2xl">
                    ✓
                  </div>
                  <h4 className="text-lg font-bold text-white font-display">Purchase Successful!</h4>
                  <p className="text-xs text-slate-300">{purchaseSuccess}</p>
                  <p className="text-[10px] text-slate-500 font-mono">Order ID: GPA.{Math.floor(1000 + Math.random() * 9000)}-{Math.floor(1000 + Math.random() * 9000)}-{Math.floor(1000 + Math.random() * 9000)}</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-blue-500 to-green-500 flex items-center justify-center text-xs font-bold text-white">
                        ▶
                      </div>
                      <span className="font-bold text-xs text-white">Google Play Billing</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPurchasingItem(null)}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-4xl mb-2">{purchasingItem.icon}</div>
                  <h4 className="font-bold text-white text-base font-display">{purchasingItem.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{purchasingItem.subtitle}</p>

                  <div className="my-5 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                    <div className="text-left">
                      <span className="text-[10px] text-slate-400">Total Charged</span>
                      <div className="text-lg font-mono font-extrabold text-white">
                        {purchasingItem.realPrice}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Encrypted & Verified</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmPurchase}
                    disabled={isProcessingCheckout}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm rounded-xl shadow-lg active:scale-95 transition flex items-center justify-center gap-2"
                  >
                    {isProcessingCheckout ? (
                      <span>Processing Payment...</span>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>1-Tap Buy with Google Play</span>
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-slate-500 mt-3">
                    Simulated Google Play In-App Purchase sandbox. Instant balance delivery.
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
