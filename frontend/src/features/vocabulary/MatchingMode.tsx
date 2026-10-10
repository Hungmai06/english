'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Timer,
  Zap,
  RotateCcw,
  Trophy,
  CheckCircle2,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { VocabularyWord } from '@/types';
import { speakText } from '@/lib/tts';

interface MatchingModeProps {
  words: VocabularyWord[];
  onWordResult: (wordId: string, isCorrect: boolean) => void;
}

interface MatchingCard {
  id: string; // card unique id
  wordId: string;
  type: 'lemma' | 'meaning';
  text: string;
  isMatched: boolean;
}

export const MatchingMode: React.FC<MatchingModeProps> = ({ words, onWordResult }) => {
  const [cards, setCards] = useState<MatchingCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<MatchingCard[]>([]);
  const [mismatchedIds, setMismatchedIds] = useState<string[]>([]);
  const [seconds, setSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(true);
  const [isWon, setIsWon] = useState(false);
  const [movesCount, setMovesCount] = useState(0);

  // Initialize a round with 5 words (10 cards)
  const initRound = () => {
    const selectedPool = [...words].sort(() => Math.random() - 0.5).slice(0, 5);
    const cardList: MatchingCard[] = [];

    selectedPool.forEach((w) => {
      cardList.push({
        id: `lemma-${w.id}`,
        wordId: w.id,
        type: 'lemma',
        text: w.lemma,
        isMatched: false,
      });
      cardList.push({
        id: `meaning-${w.id}`,
        wordId: w.id,
        type: 'meaning',
        text: w.senses[0]?.viDefinition || '',
        isMatched: false,
      });
    });

    // Shuffle cards
    setCards(cardList.sort(() => Math.random() - 0.5));
    setSelectedCards([]);
    setMismatchedIds([]);
    setSeconds(0);
    setMovesCount(0);
    setTimerActive(true);
    setIsWon(false);
  };

  useEffect(() => {
    if (words.length > 0) {
      initRound();
    }
  }, [words]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && !isWon) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, isWon]);

  const handleCardClick = (card: MatchingCard) => {
    if (card.isMatched || selectedCards.some((c) => c.id === card.id) || selectedCards.length >= 2) {
      return;
    }

    if (card.type === 'lemma') {
      speakText(card.text);
    }

    const nextSelected = [...selectedCards, card];
    setSelectedCards(nextSelected);

    if (nextSelected.length === 2) {
      setMovesCount((m) => m + 1);
      const [c1, c2] = nextSelected;

      // Check match: different type and same wordId
      if (c1.wordId === c2.wordId && c1.type !== c2.type) {
        // MATCH!
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) => (c.wordId === c1.wordId ? { ...c, isMatched: true } : c))
          );
          setSelectedCards([]);
          onWordResult(c1.wordId, true);

          // Check win condition
          setCards((latest) => {
            const allMatched = latest.every((c) => c.wordId === c1.wordId || c.isMatched);
            if (allMatched) {
              setIsWon(true);
              setTimerActive(false);
            }
            return latest;
          });
        }, 300);
      } else {
        // MISMATCH!
        setMismatchedIds([c1.id, c2.id]);
        onWordResult(c1.wordId, false);
        setTimeout(() => {
          setSelectedCards([]);
          setMismatchedIds([]);
        }, 700);
      }
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  if (words.length < 2) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
        <p className="text-slate-500 font-semibold">Cần tối thiểu 2 từ vựng để chơi ghép cặp.</p>
      </div>
    );
  }

  // Victory Screen
  if (isWon) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-6 shadow-xl animate-in zoom-in-95 duration-200">
        <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <Trophy className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Ghép cặp hoàn tất!
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-1">Phản Xạ Tuyệt Vời!</h2>
          <p className="text-xs text-slate-500 mt-1">
            Bạn đã ghép đúng tất cả các cặp từ trong thời gian kỷ lục.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl">
          <div>
            <span className="text-[11px] text-slate-400 font-bold block">Thời gian</span>
            <span className="text-xl font-black text-[#FF5C28]">{formatTime(seconds)}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-bold block">Số lượt ghép</span>
            <span className="text-xl font-black text-emerald-600">{movesCount} lượt</span>
          </div>
        </div>

        <button
          onClick={initRound}
          className="w-full py-3.5 bg-[#FF5C28] hover:bg-[#ea501e] text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Chơi ván mới (+30 Xu)</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-700 shadow-xs">
            <Timer className="w-4 h-4 text-[#FF5C28]" />
            <span>{formatTime(seconds)}</span>
          </div>

          <span className="text-xs font-bold text-slate-400">
            Lượt ghép: <strong className="text-slate-800">{movesCount}</strong>
          </span>
        </div>

        <button
          onClick={initRound}
          className="p-2 bg-white rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 shadow-xs text-xs font-bold flex items-center gap-1.5 transition-colors"
          title="Chơi lại ván này"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Instructions */}
      <p className="text-xs text-slate-500 text-center font-medium">
        Nhấn vào 1 thẻ từ tiếng Anh và 1 thẻ nghĩa tiếng Việt tương ứng để ghép cặp.
      </p>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map((card) => {
          const isSelected = selectedCards.some((c) => c.id === card.id);
          const isMismatched = mismatchedIds.includes(card.id);

          let cardStyle =
            'bg-white border-slate-200/90 text-slate-800 hover:border-[#FF5C28] hover:shadow-md';

          if (card.isMatched) {
            cardStyle =
              'bg-emerald-50/70 border-emerald-400 text-emerald-700 opacity-60 pointer-events-none scale-95';
          } else if (isMismatched) {
            cardStyle = 'bg-rose-50 border-rose-500 text-rose-700 animate-shake';
          } else if (isSelected) {
            cardStyle =
              'bg-[#FFF0E7] border-[#FF5C28] text-[#FF5C28] shadow-md shadow-[#FF5C28]/20 scale-102';
          }

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card)}
              disabled={card.isMatched}
              className={`min-h-[110px] p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center text-center select-none ${cardStyle}`}
            >
              <span
                className={`text-[10px] font-black uppercase tracking-wider mb-1.5 ${
                  card.type === 'lemma' ? 'text-[#FF5C28]' : 'text-slate-400'
                }`}
              >
                {card.type === 'lemma' ? 'English' : 'Tiếng Việt'}
              </span>

              <span
                className={`leading-snug ${
                  card.type === 'lemma'
                    ? 'font-black text-sm text-slate-900'
                    : 'font-semibold text-xs text-slate-600 line-clamp-3'
                }`}
              >
                {card.text}
              </span>

              {card.isMatched && (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-2" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
