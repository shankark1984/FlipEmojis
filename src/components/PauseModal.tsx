import React from 'react';
import { type BoardSize, getDifficultyByBoardSize } from '../game/rules';
import { Play, RotateCcw, Home, Volume2, VolumeX, ShieldAlert } from 'lucide-react';

interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  boardSize: BoardSize;
  onChangeDifficulty?: (size: BoardSize) => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  onResume,
  onRestart,
  onHome,
  isMuted,
  onToggleMute,
  boardSize,
  onChangeDifficulty,
}) => {
  if (!isOpen) return null;

  const diff = getDifficultyByBoardSize(boardSize);
  const options: BoardSize[] = [4, 6, 8, 16, 32];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl mb-3">
          ⏸️
        </div>

        <h2 className="text-xl font-bold text-white font-display mb-1">Game Paused</h2>
        <div className="flex items-center justify-center gap-1.5 mb-4">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase font-mono ${diff.badgeColor}`}>
            {diff.name} Difficulty ({diff.scoreMultiplier}x)
          </span>
          <span className="text-xs text-slate-400">· {boardSize}x{boardSize} Matrix</span>
        </div>

        {/* Change Difficulty Switcher */}
        {onChangeDifficulty && (
          <div className="mb-4 p-2.5 bg-slate-950 border border-slate-850 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
              Switch Difficulty:
            </span>
            <div className="grid grid-cols-5 gap-1">
              {options.map(sz => {
                const isCur = sz === boardSize;
                const d = getDifficultyByBoardSize(sz);
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => onChangeDifficulty(sz)}
                    className={`
                      py-1 px-1 rounded-lg text-xs font-mono font-bold transition-all
                      ${isCur ? 'bg-amber-400 text-slate-950 shadow-sm' : 'bg-slate-850 text-slate-300 hover:bg-slate-750'}
                    `}
                    title={`${d.name} (${sz}x${sz})`}
                  >
                    {sz}x{sz}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={onResume}
            className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Resume Game</span>
          </button>

          <button
            type="button"
            onClick={onRestart}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart Current Board</span>
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            className="w-full py-2.5 bg-slate-800/80 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>Sound Effects: {isMuted ? 'Muted' : 'Enabled'}</span>
          </button>

          <button
            type="button"
            onClick={onHome}
            className="w-full py-2 text-xs text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1.5 pt-2"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Quit to Title Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
