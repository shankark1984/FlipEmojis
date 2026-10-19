import React, { useState } from 'react';
import {
  X,
  Play,
  CheckCircle2,
  DollarSign,
  Tv,
  CreditCard,
  Copy,
  Check,
  Shield,
  Smartphone,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface GooglePlayGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GooglePlayGuideModal: React.FC<GooglePlayGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const bubblewrapCommand = `# 1. Install Google's official Bubblewrap CLI
npm install -g @bubblewrap/cli

# 2. Initialize Android TWA Project from Web Manifest
bubblewrap init --manifest=https://flip-emojis.web.app/manifest.webmanifest

# 3. Build signed Android App Bundle (.aab)
bubblewrap build

# 4. Upload app-release-bundle.aab to Google Play Console!`;

  const assetLinksJson = `[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.flipemojis.game",
      "sha256_cert_fingerprints": [
        "14:6D:E9:7D:0F:52:AB:FC:21:48:65:29:43:7E:11:43:2F:B0:98:90:98:02:44:A2:4B:9B:6C:54:E5:A9:C3:57"
      ]
    }
  }
]`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-[fade-in_0.2s_ease-out]">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/90 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-xl shadow-md shadow-emerald-500/20 text-slate-950 font-black">
              ▶
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-extrabold text-white text-lg">Google Play Store & Revenue Guide</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase font-mono">
                  Store Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Step-by-step blueprint to package as an Android App and monetize via In-App Billing & AdMob
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            aria-label="Close guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed">
          {/* Readiness Checklist */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Google Play PWA / TWA Readiness Checklist</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <Check className="w-3.5 h-3.5" />
                <span>Web App Manifest configured</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <Check className="w-3.5 h-3.5" />
                <span>Service Worker & Auto-Update active</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <Check className="w-3.5 h-3.5" />
                <span>192px & 512px Maskable Icons included</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <Check className="w-3.5 h-3.5" />
                <span>Digital Asset Links (.well-known) ready</span>
              </div>
            </div>
          </div>

          {/* Revenue Model Breakdown */}
          <div>
            <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span>How To Generate Income on Google Play</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <CreditCard className="w-4 h-4" />
                  <span>1. In-App Purchases (Google Play Billing)</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Sell virtual items directly through Google Play:
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                  <li><strong>Coin Packs:</strong> $0.99 for 250 coins, $2.99 for 1,000 coins</li>
                  <li><strong>VIP Master Pass:</strong> $4.99 one-time unlock for advanced levels & free hints</li>
                  <li><strong>Google takes:</strong> 15% service fee for first $1M/year under Google Play's Tier 1 developer rate</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Tv className="w-4 h-4" />
                  <span>2. Rewarded Video Ads (Google AdMob)</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Monetize non-paying players without hurting retention:
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                  <li><strong>Rewarded Ads:</strong> Players watch 5s videos to earn 50 Coins for hints</li>
                  <li><strong>High eCPM:</strong> Rewarded gaming video ads earn $15–$35 per 1,000 impressions in Tier-1 countries</li>
                  <li><strong>Opt-In:</strong> 100% voluntary, giving high user satisfaction</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Publishing Steps */}
          <div>
            <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <span>Step-by-Step Store Publishing (Bubblewrap TWA)</span>
            </h4>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <div className="flex items-center justify-between font-bold text-white mb-1.5">
                  <span>1. Generate Android App Bundle (.aab)</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(bubblewrapCommand, 'cmd')}
                    className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-mono"
                  >
                    {copiedCode === 'cmd' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'cmd' ? 'Copied' : 'Copy Commands'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-slate-950 text-slate-300 font-mono text-[11px] overflow-x-auto whitespace-pre">
                  {bubblewrapCommand}
                </pre>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <div className="flex items-center justify-between font-bold text-white mb-1.5">
                  <span>2. Digital Asset Links Verification (/public/.well-known/assetlinks.json)</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(assetLinksJson, 'json')}
                    className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-mono"
                  >
                    {copiedCode === 'json' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'json' ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mb-2">
                  Already created in <code className="text-amber-300">/public/.well-known/assetlinks.json</code>. This enables full-screen native execution on Android without any browser URL bar.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <span className="font-bold text-white block mb-1">3. Google Play Console Submission</span>
                <p className="text-[11px] text-slate-400">
                  Register at <strong className="text-white">play.google.com/console</strong> ($25 one-time developer registration), create a new app titled <em>"Flip Emojis - Emoji Match Memory Game"</em>, set content rating to PEGI 3 / Everyone, and upload your generated <code>app-release-bundle.aab</code>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-md transition"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
};
