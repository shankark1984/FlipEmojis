import React, { useState, useEffect } from 'react';
import type { UserProfile } from '../utils/storage';
import { X, Globe, Radio, Copy, Check, Users, Sparkles, ArrowRight } from 'lucide-react';

interface OnlineRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onStartOnlineMatch: (opponentName: string, opponentAvatar: string, opponentAvatarBg: string) => void;
}

export const OnlineRoomModal: React.FC<OnlineRoomModalProps> = ({
  isOpen,
  onClose,
  profile,
  onStartOnlineMatch,
}) => {
  const [tab, setTab] = useState<'screech' | 'room'>('screech');
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState('Idle');
  const [matchedOpponent, setMatchedOpponent] = useState<{
    name: string;
    avatar: string;
    avatarBg: string;
    title: string;
  } | null>(null);

  const [roomCode, setRoomCode] = useState('FLIP-7842');
  const [joinInput, setJoinInput] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsSearching(false);
      setMatchedOpponent(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const startScreechSearch = () => {
    setIsSearching(true);
    setSearchStatus('Broadcasting Screech signal to online network...');
    setMatchedOpponent(null);

    const opponents = [
      { name: 'CyberDragon', avatar: '🐲', avatarBg: 'bg-rose-600', title: 'Grandmaster' },
      { name: 'LunaStar', avatar: '🌟', avatarBg: 'bg-purple-600', title: 'Combo Striker' },
      { name: 'NeonViper', avatar: '🐍', avatarBg: 'bg-emerald-600', title: 'Speed Demon' },
      { name: 'QuantumFox', avatar: '🦊', avatarBg: 'bg-amber-600', title: 'Titan 32x32' },
    ];

    setTimeout(() => {
      setSearchStatus('Challenger accepted online request! Syncing board...');
      const picked = opponents[Math.floor(Math.random() * opponents.length)];
      setMatchedOpponent(picked);

      setTimeout(() => {
        onStartOnlineMatch(picked.name, picked.avatar, picked.avatarBg);
        onClose();
      }, 1500);
    }, 2000);
  };

  const copyCode = () => {
    navigator.clipboard?.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinWithCode = () => {
    if (!joinInput.trim()) return;
    const opp = { name: 'Player_' + joinInput.toUpperCase(), avatar: '👾', avatarBg: 'bg-cyan-600', title: 'Challenger' };
    onStartOnlineMatch(opp.name, opp.avatar, opp.avatarBg);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white font-display">Multiplayer Lobby</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl my-4">
          <button
            type="button"
            onClick={() => setTab('screech')}
            className={`
              flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5
              ${tab === 'screech' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'}
            `}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Screech Auto-Match</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('room')}
            className={`
              flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5
              ${tab === 'room' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'}
            `}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Room Code</span>
          </button>
        </div>

        {/* Screech Tab */}
        {tab === 'screech' && (
          <div className="flex flex-col items-center text-center py-4">
            <div className="relative w-24 h-24 mb-4 flex items-center justify-center">
              {isSearching && (
                <>
                  <div className="absolute inset-0 rounded-full border border-amber-400/40 animate-ping" />
                  <div className="absolute inset-2 rounded-full border border-orange-400/30 animate-pulse" />
                </>
              )}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-3xl shadow-lg">
                📡
              </div>
            </div>

            <h3 className="text-base font-bold text-white mb-1">
              {isSearching ? 'Connecting Match...' : 'Instant Screech Matchmaking'}
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mb-5">
              {isSearching
                ? searchStatus
                : 'Broadband auto-match connects you directly with online players or nearby boards.'}
            </p>

            {matchedOpponent && (
              <div className="w-full flex items-center justify-center gap-3 p-3 bg-slate-950 border border-emerald-500/40 rounded-2xl mb-4 animate-fade-in">
                <div className={`w-10 h-10 rounded-xl ${matchedOpponent.avatarBg} flex items-center justify-center text-xl`}>
                  {matchedOpponent.avatar}
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold text-emerald-400 block">Matched Opponent!</span>
                  <span className="text-sm font-extrabold text-white">{matchedOpponent.name}</span>
                  <span className="text-[10px] text-slate-400 block">Starting game board...</span>
                </div>
              </div>
            )}

            {!isSearching && (
              <button
                type="button"
                onClick={startScreechSearch}
                className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-bold text-sm rounded-xl hover:from-amber-300 hover:to-orange-400 shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Radio className="w-4 h-4" />
                <span>Screech / Auto-Connect Now</span>
              </button>
            )}
          </div>
        )}

        {/* Room Code Tab */}
        {tab === 'room' && (
          <div className="py-2 space-y-4">
            {/* Share Your Room Code */}
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl">
              <span className="text-xs font-semibold text-slate-400 block mb-1">Your Host Code</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-amber-400 text-lg tracking-wider px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg flex-1 text-center">
                  {roomCode}
                </span>
                <button
                  type="button"
                  onClick={copyCode}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <span className="text-[11px] text-slate-500 block mt-2">
                Send this code to a friend on any device to join your board.
              </span>
            </div>

            {/* Enter Friend's Code */}
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl">
              <span className="text-xs font-semibold text-slate-400 block mb-1">Join Friend's Board</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={joinInput}
                  onChange={e => setJoinInput(e.target.value)}
                  placeholder="e.g. FLIP-1234"
                  className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white text-sm font-mono flex-1 focus:outline-none focus:border-amber-400 uppercase"
                />
                <button
                  type="button"
                  onClick={handleJoinWithCode}
                  disabled={!joinInput.trim()}
                  className="px-4 py-2 bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold rounded-lg hover:bg-amber-300 transition-colors flex items-center gap-1"
                >
                  <span>Join</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
