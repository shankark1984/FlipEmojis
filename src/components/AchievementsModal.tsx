import React from 'react';
import type { Achievement } from '../utils/storage';
import { StorageService } from '../utils/storage';
import { X, Award, CheckCircle2, Lock } from 'lucide-react';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const list = StorageService.getAchievements();
  const unlockedCount = list.filter(a => a.unlockedAt).length;
  const progressPct = Math.round((unlockedCount / list.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 relative max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white font-display">Achievement Badges</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Unlocked Progress Tracker */}
        <div className="my-4 p-3.5 bg-slate-950 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-300 font-semibold">Trophy Progress</span>
            <span className="font-mono text-amber-400 font-bold">{unlockedCount} / {list.length} ({progressPct}%)</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Badges Grid */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {list.map(item => {
            const isUnlocked = !!item.unlockedAt;
            return (
              <div
                key={item.id}
                className={`
                  flex items-center gap-3.5 p-3 rounded-2xl border transition-all
                  ${isUnlocked
                    ? 'bg-slate-950/90 border-indigo-500/30 shadow-sm shadow-indigo-500/5'
                    : 'bg-slate-950/40 border-slate-850 opacity-60'
                  }
                `}
              >
                <div
                  className={`
                    w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-inner
                    ${isUnlocked ? 'bg-gradient-to-tr from-indigo-900/60 to-purple-900/60 border border-indigo-500/40' : 'bg-slate-850 border border-slate-800 grayscale'}
                  `}
                >
                  {item.icon}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>
                      {item.title}
                    </span>
                    {isUnlocked ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Lock className="w-3 h-3 text-slate-500" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
