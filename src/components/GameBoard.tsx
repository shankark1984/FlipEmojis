import React, { useState, useRef } from 'react';
import type { CardItem, BoardSize } from '../game/rules';
import { Card } from './Card';
import { ZoomIn, ZoomOut, RotateCcw, Compass, MapPin } from 'lucide-react';

interface GameBoardProps {
  cards: CardItem[];
  boardSize: BoardSize;
  mismatchedIndices: number[];
  matchedIndices: number[];
  onCardClick: (index: number) => void;
  disabled?: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  cards,
  boardSize,
  mismatchedIndices,
  matchedIndices,
  onCardClick,
  disabled,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(boardSize === 32 ? 0.75 : boardSize === 16 ? 0.85 : 1);
  const containerRef = useRef<HTMLDivElement>(null);

  const getGapClass = () => {
    if (boardSize <= 4) return 'gap-2.5 sm:gap-3.5';
    if (boardSize <= 8) return 'gap-1.5 sm:gap-2';
    if (boardSize <= 16) return 'gap-1';
    return 'gap-0.5';
  };

  const handleZoom = (delta: number) => {
    setZoomLevel(prev => Math.min(2.5, Math.max(0.35, Number((prev + delta).toFixed(2)))));
  };

  const resetZoom = () => {
    setZoomLevel(boardSize === 32 ? 0.75 : boardSize === 16 ? 0.85 : 1);
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  };

  const scrollToSector = (sector: 'tl' | 'tr' | 'bl' | 'br' | 'center') => {
    if (!containerRef.current) return;
    const { scrollWidth, scrollHeight, clientWidth, clientHeight } = containerRef.current;
    let top = 0;
    let left = 0;

    if (sector === 'tl') {
      top = 0;
      left = 0;
    } else if (sector === 'tr') {
      top = 0;
      left = scrollWidth - clientWidth;
    } else if (sector === 'bl') {
      top = scrollHeight - clientHeight;
      left = 0;
    } else if (sector === 'br') {
      top = scrollHeight - clientHeight;
      left = scrollWidth - clientWidth;
    } else if (sector === 'center') {
      top = (scrollHeight - clientHeight) / 2;
      left = (scrollWidth - clientWidth) / 2;
    }

    containerRef.current.scrollTo({ top, left, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-full px-2 py-2">
      {/* Mega Grid Navigation Toolbar (For 8x8, 16x16, 32x32) */}
      {boardSize >= 8 && (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3 px-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-full shadow-sm text-xs text-slate-300">
          <div className="flex items-center gap-1">
            <span className="font-medium mr-1 text-slate-400">Zoom: {Math.round(zoomLevel * 100)}%</span>
            <button
              type="button"
              onClick={() => handleZoom(-0.15)}
              className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Zoom Out"
              aria-label="Zoom out grid"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleZoom(0.15)}
              className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Zoom In"
              aria-label="Zoom in grid"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={resetZoom}
              className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Reset Zoom & Scroll"
              aria-label="Reset zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quadrant Quick Sector Jump for 16x16 and 32x32 */}
          {boardSize >= 16 && (
            <div className="flex items-center gap-1 border-l border-slate-800 pl-2 text-[11px]">
              <Compass className="w-3.5 h-3.5 text-amber-400 mr-0.5" />
              <span className="text-slate-400 hidden sm:inline">Jump Sector:</span>
              <button
                type="button"
                onClick={() => scrollToSector('tl')}
                className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-mono"
                title="Top-Left Sector"
              >
                Q1
              </button>
              <button
                type="button"
                onClick={() => scrollToSector('tr')}
                className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-mono"
                title="Top-Right Sector"
              >
                Q2
              </button>
              <button
                type="button"
                onClick={() => scrollToSector('center')}
                className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-mono"
                title="Center Sector"
              >
                Mid
              </button>
              <button
                type="button"
                onClick={() => scrollToSector('bl')}
                className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-mono"
                title="Bottom-Left Sector"
              >
                Q3
              </button>
              <button
                type="button"
                onClick={() => scrollToSector('br')}
                className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-mono"
                title="Bottom-Right Sector"
              >
                Q4
              </button>
            </div>
          )}
        </div>
      )}

      {/* Grid Container with responsive scroll for mega matrix */}
      <div
        ref={containerRef}
        className={`
          w-full flex items-center justify-center overflow-auto max-h-[75vh] p-2
          rounded-2xl transition-all
          ${boardSize >= 16 ? 'bg-slate-950/70 border border-slate-800/80 shadow-inner' : ''}
        `}
      >
        <div
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
            display: 'grid',
            gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
          }}
          className={`${getGapClass()} p-2`}
        >
          {cards.map((card, idx) => (
            <Card
              key={card.id}
              card={card}
              index={idx}
              boardSize={boardSize}
              isMismatched={mismatchedIndices.includes(idx)}
              isMatchedJustNow={matchedIndices.includes(idx)}
              onClick={onCardClick}
              disabled={disabled}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
