import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  type BoardSize,
  type CardItem,
  type Player,
  getDifficultyByBoardSize,
  createGameBoard,
  createDailyGameBoard,
  getTodayDateString,
  evaluateTurnScore,
  isGameComplete,
} from './game/rules';
import { StorageService, type UserProfile } from './utils/storage';
import { sounds } from './utils/audio';
import { TitleScreen } from './components/TitleScreen';
import { GameBoard } from './components/GameBoard';
import { GameHud } from './components/GameHud';
import { VictoryModal } from './components/VictoryModal';
import { PauseModal } from './components/PauseModal';
import { AvatarModal } from './components/AvatarModal';
import { OnlineRoomModal } from './components/OnlineRoomModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { AchievementsModal } from './components/AchievementsModal';
import { ChatDrawer, type ChatMessage } from './components/ChatDrawer';
import { ParticleBackground } from './components/ParticleBackground';
import { SocialLoginModal } from './components/SocialLoginModal';
import { ActiveDevicesModal } from './components/ActiveDevicesModal';
import { ShopModal } from './components/ShopModal';
import { RewardedAdModal } from './components/RewardedAdModal';
import { GooglePlayGuideModal } from './components/GooglePlayGuideModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';

export default function App() {
  // Profiles and System State
  const [profile, setProfile] = useState<UserProfile>(() => StorageService.getProfile());
  const [gameState, setGameState] = useState<'title' | 'playing' | 'paused' | 'gameover'>('title');
  const [boardSize, setBoardSize] = useState<BoardSize>(4);
  const [gameMode, setGameMode] = useState<'solo' | 'daily' | 'pass_and_play' | 'online'>('solo');
  const [playerCount, setPlayerCount] = useState<number>(2);
  const [isMuted, setIsMuted] = useState<boolean>(() => sounds.isMuted());
  const [theme, setTheme] = useState<'dark' | 'light'>(() => StorageService.getTheme());

  // Board and Play State
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [mismatchedIndices, setMismatchedIndices] = useState<number[]>([]);
  const [matchedJustNow, setMatchedJustNow] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Score & Round Stats
  const [players, setPlayers] = useState<Player[]>([]);
  const [activePlayerIndex, setActivePlayerIndex] = useState<number>(0);
  const [moveCount, setMoveCount] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [scorePopups, setScorePopups] = useState<{ id: string; text: string; isPositive: boolean }[]>([]);
  const [peekHintsRemaining, setPeekHintsRemaining] = useState<number>(2);
  const [lastDailyRank, setLastDailyRank] = useState<number | undefined>(undefined);

  // Modals & Drawers
  const [showAvatarModal, setShowAvatarModal] = useState<boolean>(false);
  const [showSocialModal, setShowSocialModal] = useState<boolean>(false);
  const [showDevicesModal, setShowDevicesModal] = useState<boolean>(false);
  const [showOnlineModal, setShowOnlineModal] = useState<boolean>(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState<boolean>(false);
  const [leaderboardTab, setLeaderboardTab] = useState<'daily' | 'all_time'>('daily');
  const [showAchievementsModal, setShowAchievementsModal] = useState<boolean>(false);
  const [showChatDrawer, setShowChatDrawer] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [unreadChatCount, setUnreadChatCount] = useState<number>(0);
  const [showShopModal, setShowShopModal] = useState<boolean>(false);
  const [showRewardedAdModal, setShowRewardedAdModal] = useState<boolean>(false);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);
  const [showGooglePlayGuideModal, setShowGooglePlayGuideModal] = useState<boolean>(false);
  const [hintedIndices, setHintedIndices] = useState<number[]>([]);

  // Timer Ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync body dataset state and theme
  useEffect(() => {
    document.body.dataset.state = gameState;
  }, [gameState]);

  useEffect(() => {
    StorageService.setTheme(theme);
  }, [theme]);

  // Periodic device active heartbeat
  useEffect(() => {
    StorageService.heartbeatDevice();
    const interval = setInterval(() => {
      StorageService.heartbeatDevice();
    }, 25000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  // Push score popup
  const addScorePopup = (text: string, isPositive: boolean) => {
    const id = Math.random().toString(36).substring(2, 9);
    setScorePopups(prev => [...prev.slice(-3), { id, text, isPositive }]);
    setTimeout(() => {
      setScorePopups(prev => prev.filter(p => p.id !== id));
    }, 1200);
  };

  // Setup Players list based on mode
  const setupPlayers = useCallback((mode: 'solo' | 'daily' | 'pass_and_play' | 'online', customOpponent?: { name: string; avatar: string; avatarBg: string }): Player[] => {
    const mainPlayer: Player = {
      id: profile.id,
      name: profile.name,
      avatar: profile.avatar,
      avatarBg: profile.avatarBg,
      score: 0,
      matches: 0,
      consecutiveMatches: 0,
    };

    if (mode === 'solo' || mode === 'daily') {
      return [mainPlayer];
    } else if (mode === 'online') {
      const opp = customOpponent || {
        name: 'CyberDragon',
        avatar: '🐲',
        avatarBg: 'bg-rose-600',
      };
      return [
        mainPlayer,
        {
          id: 'player_online_opp',
          name: opp.name,
          avatar: opp.avatar,
          avatarBg: opp.avatarBg,
          score: 0,
          matches: 0,
          consecutiveMatches: 0,
          isBot: true,
        },
      ];
    } else {
      // Pass & play
      const list: Player[] = [mainPlayer];
      const defaultAvatars = [
        { name: 'Player 2', avatar: '🐱', bg: 'bg-emerald-600' },
        { name: 'Player 3', avatar: '🐼', bg: 'bg-purple-600' },
        { name: 'Player 4', avatar: '🦄', bg: 'bg-rose-600' },
      ];
      for (let i = 1; i < playerCount; i++) {
        const d = defaultAvatars[i - 1];
        list.push({
          id: `player_local_${i + 1}`,
          name: d.name,
          avatar: d.avatar,
          avatarBg: d.bg,
          score: 0,
          matches: 0,
          consecutiveMatches: 0,
        });
      }
      return list;
    }
  }, [profile, playerCount]);

  // Start or Restart Game
  const startNewGame = useCallback((size: BoardSize = boardSize, mode: 'solo' | 'daily' | 'pass_and_play' | 'online' = gameMode, customOpponent?: { name: string; avatar: string; avatarBg: string }) => {
    const isDaily = mode === 'daily';
    const actualSize: BoardSize = isDaily ? 6 : size;
    const freshCards = isDaily
      ? createDailyGameBoard(getTodayDateString(), 6)
      : createGameBoard(actualSize);

    const diff = getDifficultyByBoardSize(actualSize);
    setCards(freshCards);
    setBoardSize(actualSize);
    setGameMode(mode);
    setFlippedIndices([]);
    setMismatchedIndices([]);
    setMatchedJustNow([]);
    setIsProcessing(false);
    setMoveCount(0);
    setElapsedSeconds(0);
    setCurrentStreak(0);
    setMaxStreak(0);
    setScorePopups([]);
    setLastDailyRank(undefined);
    setPeekHintsRemaining(diff.hasPeekHint ? (actualSize <= 4 ? 2 : 1) : 0);

    const newPlayers = setupPlayers(mode, customOpponent);
    setPlayers(newPlayers);
    setActivePlayerIndex(0);

    setGameState('playing');
    sounds.playClick();
    StorageService.unlockAchievement('first_flip');
    if (mode === 'online' || mode === 'pass_and_play') StorageService.unlockAchievement('social_butterfly');
  }, [boardSize, gameMode, setupPlayers]);

  // Peek Hint Handler
  const handlePeekHint = () => {
    if (isProcessing || peekHintsRemaining <= 0 || gameState !== 'playing') return;
    const unmatched = cards.filter(c => !c.isMatched);
    if (unmatched.length < 2) return;
    const targetEmoji = unmatched[0].emoji;
    const pairIndices = cards
      .map((c, i) => (c.emoji === targetEmoji && !c.isMatched ? i : -1))
      .filter(i => i !== -1);
    if (pairIndices.length === 2) {
      setIsProcessing(true);
      setPeekHintsRemaining(prev => Math.max(0, prev - 1));
      sounds.playFlip();
      setCards(prev =>
        prev.map((c, idx) => (pairIndices.includes(idx) ? { ...c, isFlipped: true } : c))
      );
      setTimeout(() => {
        setCards(prev =>
          prev.map((c, idx) =>
            pairIndices.includes(idx) && !c.isMatched ? { ...c, isFlipped: false } : c
          )
        );
        setIsProcessing(false);
      }, 1000);
    }
  };

  // Find Next Match Tip Handler (costs 25 coins or free with VIP Master Pass)
  const handleFindMatchTip = () => {
    if (isProcessing || gameState !== 'playing') return;

    const isPro = StorageService.isProPass();
    const userCoins = StorageService.getCoins();

    if (!isPro && userCoins < 25) {
      // Prompt user to watch a rewarded ad to get 50 coins or open shop
      setShowRewardedAdModal(true);
      return;
    }

    // Group unmatched cards by emoji
    const emojiMap = new Map<string, number[]>();
    cards.forEach((c, idx) => {
      if (!c.isMatched) {
        const list = emojiMap.get(c.emoji) || [];
        list.push(idx);
        emojiMap.set(c.emoji, list);
      }
    });

    let targetPair: number[] | null = null;
    for (const indices of emojiMap.values()) {
      if (indices.length >= 2) {
        targetPair = [indices[0], indices[1]];
        break;
      }
    }

    if (!targetPair) return;

    if (!isPro) {
      StorageService.spendCoins(25);
      const updated = StorageService.getProfile();
      setProfile(updated);
      addScorePopup('-25 🪙 Tip', true);
    } else {
      addScorePopup('VIP Free Tip! 👑', true);
    }

    StorageService.unlockAchievement('tip_tactician');
    sounds.playFlip();

    setHintedIndices(targetPair);
    setTimeout(() => {
      setHintedIndices([]);
    }, 3500);
  };

  const handleRewardEarned = (coinsAdded: number) => {
    const updated = StorageService.getProfile();
    setProfile(updated);
    addScorePopup(`+${coinsAdded} 🪙 Coins!`, true);
    if (gameState === 'playing') {
      setTimeout(() => {
        handleFindMatchTip();
      }, 400);
    }
  };

  // Autostart query parameter detection (?autostart=1)
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('autostart') === '1') {
        startNewGame(4, 'solo');
      }
    } catch {
      // ignore
    }
  }, [startNewGame]);

  // Timer loop when playing
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  // Bot Turn Simulation for Online / Pass & Play
  useEffect(() => {
    if (gameState !== 'playing' || isProcessing) return;
    const activePlayer = players[activePlayerIndex];
    if (activePlayer && activePlayer.isBot) {
      // Pick 2 random unmatched cards
      const availableIndices = cards
        .map((c, i) => (!c.isMatched && !c.isFlipped ? i : -1))
        .filter(i => i !== -1);

      if (availableIndices.length >= 2) {
        setIsProcessing(true);
        const botTimer = setTimeout(() => {
          // Flip first
          const idx1 = availableIndices[Math.floor(Math.random() * availableIndices.length)];
          handleCardClick(idx1, true);

          setTimeout(() => {
            // Flip second
            const remaining = availableIndices.filter(i => i !== idx1);
            const idx2 = remaining[Math.floor(Math.random() * remaining.length)];
            handleCardClick(idx2, true);
            setIsProcessing(false);
          }, 800);
        }, 900);

        return () => clearTimeout(botTimer);
      }
    }
  }, [activePlayerIndex, gameState, cards, isProcessing, players]);

  // Card Flip Handler
  const handleCardClick = (clickedIndex: number, isBotTrigger = false) => {
    if (gameState !== 'playing') return;
    if (isProcessing && !isBotTrigger) return;

    const targetCard = cards[clickedIndex];
    if (!targetCard || targetCard.isMatched || targetCard.isFlipped) return;
    if (flippedIndices.includes(clickedIndex)) return;

    sounds.playFlip();

    // Flip the target card
    const updatedCards = cards.map((c, idx) =>
      idx === clickedIndex ? { ...c, isFlipped: true } : c
    );
    setCards(updatedCards);

    const nextFlipped = [...flippedIndices, clickedIndex];
    setFlippedIndices(nextFlipped);

    // If this is the second card flipped
    if (nextFlipped.length === 2) {
      setIsProcessing(true);
      setMoveCount(prev => prev + 1);

      const [firstIdx, secondIdx] = nextFlipped;
      const firstCard = updatedCards[firstIdx];
      const secondCard = updatedCards[secondIdx];

      const diff = getDifficultyByBoardSize(boardSize);
      const isMatch = firstCard.emoji === secondCard.emoji;
      const turnScore = evaluateTurnScore(
        isMatch,
        currentStreak,
        diff.scoreMultiplier,
        diff.streakBonusRate
      );

      if (isMatch) {
        // MATCH MADE!
        sounds.playMatch(turnScore.newStreak);
        if (turnScore.newStreak >= 3) {
          sounds.playCombo();
        }

        const bonusText = turnScore.bonusPoints > 0 ? ` (+${turnScore.bonusPoints} Streak!)` : '';
        addScorePopup(`+${turnScore.scoreDelta} pts${bonusText}`, true);

        // Update active player's score
        setPlayers(prevPlayers =>
          prevPlayers.map((p, idx) =>
            idx === activePlayerIndex
              ? {
                  ...p,
                  score: p.score + turnScore.scoreDelta,
                  matches: p.matches + 1,
                  consecutiveMatches: turnScore.newStreak,
                }
              : p
          )
        );

        setCurrentStreak(turnScore.newStreak);
        setMaxStreak(prev => Math.max(prev, turnScore.newStreak));

        // Mark cards matched
        const matchedCards = updatedCards.map((c, idx) =>
          idx === firstIdx || idx === secondIdx
            ? { ...c, isFlipped: true, isMatched: true, matchedByPlayerId: players[activePlayerIndex]?.id }
            : c
        );
        setCards(matchedCards);
        setMatchedJustNow([firstIdx, secondIdx]);
        setFlippedIndices([]);
        setIsProcessing(false);

        StorageService.unlockAchievement('first_match');

        // Check for Game Completion
        if (isGameComplete(matchedCards)) {
          sounds.playVictory();
          setGameState('gameover');

          const finalWinner = players[activePlayerIndex];
          const finalScore = finalWinner ? finalWinner.score + turnScore.scoreDelta : turnScore.scoreDelta;

          if (gameMode === 'daily') {
            const dailyResult = StorageService.recordDailyChallenge(
              boardSize,
              finalScore,
              moveCount + 1,
              elapsedSeconds,
              Math.max(maxStreak, turnScore.newStreak)
            );
            setLastDailyRank(dailyResult.rank);
          } else {
            StorageService.recordGame(
              boardSize,
              finalScore,
              moveCount + 1,
              elapsedSeconds,
              Math.max(maxStreak, turnScore.newStreak)
            );
          }
        }
      } else {
        // MISMATCH!
        sounds.playMismatch();
        addScorePopup('-1 pt', false);

        // Deduct 1 pt from active player
        setPlayers(prevPlayers =>
          prevPlayers.map((p, idx) =>
            idx === activePlayerIndex
              ? {
                  ...p,
                  score: p.score - 1,
                  consecutiveMatches: 0,
                }
              : p
          )
        );

        setCurrentStreak(0);
        setMismatchedIndices([firstIdx, secondIdx]);

        // Keep revealed for difficulty memoryWindowMs so player can memorize
        setTimeout(() => {
          setCards(prev =>
            prev.map((c, idx) =>
              idx === firstIdx || idx === secondIdx ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedIndices([]);
          setMismatchedIndices([]);
          setIsProcessing(false);

          // Rotate turn if multiplayer
          if (players.length > 1) {
            setActivePlayerIndex(prev => (prev + 1) % players.length);
          }
        }, diff.memoryWindowMs);
      }
    }
  };

  // Keyboard navigation & Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (gameState === 'title') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          startNewGame();
        }
      } else if (gameState === 'playing') {
        if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
          e.preventDefault();
          setGameState('paused');
        } else if (e.key === 'm' || e.key === 'M') {
          const next = sounds.toggleMute();
          setIsMuted(next);
        }
      } else if (gameState === 'paused') {
        if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          setGameState('playing');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, startNewGame]);

  const handleToggleMute = () => {
    const next = sounds.toggleMute();
    setIsMuted(next);
  };

  // Chat message send handler
  const handleSendMessage = (text: string, isReaction = false) => {
    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: profile.name,
      avatar: profile.avatar,
      avatarBg: profile.avatarBg,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isReaction,
    };

    setChatMessages(prev => [...prev, newMsg]);

    // Simulated opponent reply
    if (players.length > 1) {
      setTimeout(() => {
        const opp = players.find(p => p.id !== profile.id) || players[1];
        const replies = [
          'Nice one! 👀',
          'I saw where that card was! ⚡',
          'Watch out for my turn! 🔥',
          'GG! 🤝',
          'Haha lucky guess! 😜',
          '💯',
        ];
        const replyText = replies[Math.floor(Math.random() * replies.length)];
        const replyMsg: ChatMessage = {
          id: 'msg-opp-' + Date.now(),
          sender: opp.name,
          avatar: opp.avatar,
          avatarBg: opp.avatarBg,
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isReaction: ['💯', '🔥'].includes(replyText),
        };
        setChatMessages(prev => [...prev, replyMsg]);
        if (!showChatDrawer) {
          setUnreadChatCount(prev => prev + 1);
        }
      }, 1200);
    }
  };

  const handleOpenChat = () => {
    setShowChatDrawer(true);
    setUnreadChatCount(0);
  };

  const handleNextBoardSize = () => {
    const nextSizes: Record<BoardSize, BoardSize> = {
      4: 6,
      6: 8,
      8: 16,
      16: 32,
      32: 32,
    };
    const next = nextSizes[boardSize] || 4;
    setBoardSize(next);
    startNewGame(next, 'solo');
  };

  const matchedPairs = cards.filter(c => c.isMatched).length / 2;
  const totalPairs = (boardSize * boardSize) / 2;

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'light-theme bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'} flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950 font-sans relative overflow-x-hidden`}>
      {/* Subtle Atmospheric Particle Background during sessions */}
      <ParticleBackground active={gameState !== 'title'} currentStreak={currentStreak} />

      {/* Title Screen View */}
      {gameState === 'title' && (
        <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center">
          <TitleScreen
            profile={profile}
            selectedBoardSize={boardSize}
            onSelectBoardSize={setBoardSize}
            selectedMode={gameMode}
            onSelectMode={setGameMode}
            playerCount={playerCount}
            onSetPlayerCount={setPlayerCount}
            onStartGame={() => startNewGame(boardSize, gameMode)}
            onOpenAvatar={() => setShowAvatarModal(true)}
            onOpenSocialLogin={() => setShowSocialModal(true)}
            onOpenDevices={() => setShowDevicesModal(true)}
            onOpenShop={() => setShowShopModal(true)}
            onOpenRewardedAd={() => setShowRewardedAdModal(true)}
            onOpenInstallModal={() => setShowInstallModal(true)}
            onOpenGooglePlayGuide={() => setShowGooglePlayGuideModal(true)}
            onOpenLeaderboard={() => {
              setLeaderboardTab('daily');
              setShowLeaderboardModal(true);
            }}
            onOpenAchievements={() => setShowAchievementsModal(true)}
            onOpenOnlineRoom={() => setShowOnlineModal(true)}
            theme={theme}
            onToggleTheme={handleToggleTheme}
          />
        </div>
      )}

      {/* Playing & Game Over Views */}
      {(gameState === 'playing' || gameState === 'paused' || gameState === 'gameover') && (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-between w-full max-w-full">
          {/* Game HUD */}
          <GameHud
            players={players}
            activePlayerIndex={activePlayerIndex}
            gameMode={gameMode}
            boardSize={boardSize}
            difficulty={getDifficultyByBoardSize(boardSize)}
            moveCount={moveCount}
            elapsedSeconds={elapsedSeconds}
            currentStreak={currentStreak}
            matchedPairs={matchedPairs}
            totalPairs={totalPairs}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onPause={() => setGameState('paused')}
            onOpenChat={handleOpenChat}
            unreadChatCount={unreadChatCount}
            scorePopups={scorePopups}
            onPeekHint={handlePeekHint}
            peekHintsRemaining={peekHintsRemaining}
            theme={theme}
            onToggleTheme={handleToggleTheme}
            coins={profile.coins ?? 150}
            isProPass={profile.isProPass}
            onOpenShop={() => setShowShopModal(true)}
            onFindMatchTip={handleFindMatchTip}
          />

          {/* Interactive Game Board */}
          <div className="flex-1 w-full flex items-center justify-center p-2">
            <GameBoard
              cards={cards}
              boardSize={boardSize}
              mismatchedIndices={mismatchedIndices}
              matchedIndices={matchedJustNow}
              hintedIndices={hintedIndices}
              cardBackTheme={profile.activeCardBack}
              onCardClick={handleCardClick}
              disabled={isProcessing}
            />
          </div>

          {/* Safe Bottom Control Hint */}
          <div className="w-full py-1 text-center text-[11px] text-slate-500">
            Esc/P: Pause · M: Mute · Space: Resume · 💡 Tip: 25 Coins (or Free with VIP Pass)
          </div>
        </div>
      )}

      {/* PWA Install Banner & Update Notification */}
      <PWAInstallBanner
        forceShowModal={showInstallModal}
        onCloseForceModal={() => setShowInstallModal(false)}
      />

      {/* Modals */}
      <ShopModal
        isOpen={showShopModal}
        onClose={() => setShowShopModal(false)}
        profile={profile}
        onProfileUpdated={setProfile}
        onOpenRewardedAd={() => {
          setShowShopModal(false);
          setShowRewardedAdModal(true);
        }}
      />

      <RewardedAdModal
        isOpen={showRewardedAdModal}
        onClose={() => setShowRewardedAdModal(false)}
        onRewardEarned={handleRewardEarned}
      />

      <GooglePlayGuideModal
        isOpen={showGooglePlayGuideModal}
        onClose={() => setShowGooglePlayGuideModal(false)}
      />

      <PauseModal
        isOpen={gameState === 'paused'}
        onResume={() => setGameState('playing')}
        onRestart={() => startNewGame(boardSize, gameMode)}
        onHome={() => setGameState('title')}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        boardSize={boardSize}
        onChangeDifficulty={(newSize) => {
          setBoardSize(newSize);
          startNewGame(newSize, gameMode);
        }}
      />

      <VictoryModal
        isOpen={gameState === 'gameover'}
        players={players}
        boardSize={boardSize}
        moveCount={moveCount}
        elapsedSeconds={elapsedSeconds}
        maxStreak={maxStreak}
        gameMode={gameMode}
        dailyRank={lastDailyRank}
        onPlayAgain={() => startNewGame(boardSize, gameMode)}
        onNextSize={handleNextBoardSize}
        onHome={() => setGameState('title')}
        onViewDailyTop={() => {
          setGameState('title');
          setLeaderboardTab('daily');
          setShowLeaderboardModal(true);
        }}
      />

      <AvatarModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        profile={profile}
        onSaveProfile={setProfile}
        onOpenSocialLogin={() => setShowSocialModal(true)}
        onOpenDevicesModal={() => setShowDevicesModal(true)}
      />

      <SocialLoginModal
        isOpen={showSocialModal}
        onClose={() => setShowSocialModal(false)}
        profile={profile}
        onProfileUpdated={(updated) => setProfile(updated)}
        onOpenDevicesModal={() => setShowDevicesModal(true)}
      />

      <ActiveDevicesModal
        isOpen={showDevicesModal}
        onClose={() => setShowDevicesModal(false)}
        onOpenSocialLogin={() => setShowSocialModal(true)}
      />

      <OnlineRoomModal
        isOpen={showOnlineModal}
        onClose={() => setShowOnlineModal(false)}
        profile={profile}
        onStartOnlineMatch={(name, avatar, bg) => {
          startNewGame(boardSize, 'online', { name, avatar, avatarBg: bg });
        }}
      />

      <LeaderboardModal
        isOpen={showLeaderboardModal}
        onClose={() => setShowLeaderboardModal(false)}
        initialTab={leaderboardTab}
        onPlayDaily={() => startNewGame(6, 'daily')}
      />

      <AchievementsModal
        isOpen={showAchievementsModal}
        onClose={() => setShowAchievementsModal(false)}
      />

      <ChatDrawer
        isOpen={showChatDrawer}
        onClose={() => setShowChatDrawer(false)}
        messages={chatMessages}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
