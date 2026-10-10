'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Headphones,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FileText,
  Sparkles,
  ChevronLeft,
  FastForward,
  Rewind,
  Eye,
  EyeOff
} from 'lucide-react';
import { Container } from '@/design-system/components/Section';
import { Card } from '@/design-system/components/Card';
import { Badge } from '@/design-system/components/Badge';
import { Button } from '@/design-system/components/Button';
import { speakText } from '@/lib/tts';
import { addXP } from '@/lib/storage';

interface TranscriptLine {
  speaker: string;
  time: string;
  en: string;
  vi: string;
  maskedWord?: string;
}

interface ListeningTrack {
  id: string;
  title: string;
  topic: string;
  level: 'A2' | 'B1' | 'B2' | 'C1';
  durationSec: number;
  transcript: TranscriptLine[];
  quiz: {
    id: string;
    prompt: string;
    options: { id: string; text: string }[];
    correct: string;
    explanation: string;
  }[];
}

const LISTENING_TRACKS: ListeningTrack[] = [
  {
    id: 'job-interview-remote',
    title: 'Job Interview: Discussing Work Flexibility & Team Culture',
    topic: 'Business & Career',
    level: 'B2',
    durationSec: 45,
    transcript: [
      {
        speaker: 'Interviewer',
        time: '0:02',
        en: 'Good morning, Alex. Thank you for making time to speak with our engineering division today.',
        vi: 'Chào buổi sáng Alex. Cảm ơn bạn đã dành thời gian trao đổi với bộ phận kỹ thuật của chúng tôi hôm nay.',
        maskedWord: 'engineering'
      },
      {
        speaker: 'Alex',
        time: '0:08',
        en: 'It is a pleasure. I have been following your open-source cloud initiatives with great enthusiasm.',
        vi: 'Rất hân hạnh ạ. Tôi đã theo dõi các sáng kiến điện toán đám mây mã nguồn mở của công ty với sự hào hứng lớn.',
        maskedWord: 'enthusiasm'
      },
      {
        speaker: 'Interviewer',
        time: '0:16',
        en: 'Our company operates on a hybrid framework. How do you maintain team accountability when collaborating across time zones?',
        vi: 'Công ty chúng tôi hoạt động theo mô hình linh hoạt kết hợp. Bạn duy trì trách nhiệm đội nhóm như thế nào khi làm việc xuyên múi giờ?',
        maskedWord: 'accountability'
      },
      {
        speaker: 'Alex',
        time: '0:25',
        en: 'I rely heavily on comprehensive documentation and structured daily updates rather than unnecessary meetings.',
        vi: 'Tôi chủ yếu dựa vào tài liệu chi tiết và các báo cáo tóm tắt hàng ngày có cấu trúc thay vì các cuộc họp không cần thiết.',
        maskedWord: 'documentation'
      }
    ],
    quiz: [
      {
        id: 'lq1',
        prompt: 'What specific company initiatives has Alex been following?',
        options: [
          { id: 'a', text: 'Social media marketing campaigns' },
          { id: 'b', text: 'Open-source cloud initiatives' },
          { id: 'c', text: 'Financial accounting software acquisitions' },
          { id: 'd', text: 'Hardware manufacturing blueprints' }
        ],
        correct: 'b',
        explanation: 'Alex says: "I have been following your open-source cloud initiatives with great enthusiasm."'
      },
      {
        id: 'lq2',
        prompt: 'How does Alex prefer to maintain accountability across time zones?',
        options: [
          { id: 'a', text: 'By organizing long telephone conferences every morning' },
          { id: 'b', text: 'By using thorough documentation and structured updates' },
          { id: 'c', text: 'By requiring all engineers to log in simultaneously' },
          { id: 'd', text: 'By delegating all task monitoring to project managers' }
        ],
        correct: 'b',
        explanation: 'Alex clarifies: "I rely heavily on comprehensive documentation and structured daily updates..."'
      }
    ]
  },
  {
    id: 'airport-announcement',
    title: 'International Flight Departure & Gate Change Notice',
    topic: 'Travel & Logistics',
    level: 'B1',
    durationSec: 32,
    transcript: [
      {
        speaker: 'Announcer',
        time: '0:02',
        en: 'Attention all passengers booked on Pacific Skyways flight 482 bound for Tokyo Haneda.',
        vi: 'Xin quý hành khách trên chuyến bay Pacific Skyways số hiệu 482 đi Tokyo Haneda lưu ý.',
        maskedWord: 'passengers'
      },
      {
        speaker: 'Announcer',
        time: '0:10',
        en: 'Due to routine runway inspection, the departure gate has been relocated from Gate 14 to Gate 29B.',
        vi: 'Do kiểm tra đường băng định kỳ, cửa khởi hành đã được chuyển từ Cửa 14 sang Cửa 29B.',
        maskedWord: 'relocated'
      },
      {
        speaker: 'Announcer',
        time: '0:20',
        en: 'Boarding will commence in approximately fifteen minutes. Please have your boarding passes ready.',
        vi: 'Việc lên máy bay sẽ bắt đầu sau khoảng mười lăm phút nữa. Xin vui lòng chuẩn bị sẵn thẻ lên tàu bay.',
        maskedWord: 'commence'
      }
    ],
    quiz: [
      {
        id: 'lq1',
        prompt: 'Why was the departure gate relocated?',
        options: [
          { id: 'a', text: 'Severe incoming thunderstorm' },
          { id: 'b', text: 'Routine runway inspection' },
          { id: 'c', text: 'Mechanical aircraft failure' },
          { id: 'd', text: 'Airport terminal power outage' }
        ],
        correct: 'b',
        explanation: 'The announcer explains: "Due to routine runway inspection, the departure gate has been relocated..."'
      }
    ]
  }
];

export default function ListeningComprehensionPage() {
  const [selectedTrackId, setSelectedTrackId] = useState(LISTENING_TRACKS[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<0.75 | 1 | 1.25>(1);
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  const [showTranslations, setShowTranslations] = useState(false);
  const [practiceMode, setPracticeMode] = useState<'transcript' | 'dictation' | 'quiz'>('transcript');
  const [dictationAnswers, setDictationAnswers] = useState<Record<number, string>>({});
  const [dictationChecked, setDictationChecked] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizChecked, setQuizChecked] = useState(false);

  const track = LISTENING_TRACKS.find((t) => t.id === selectedTrackId) || LISTENING_TRACKS[0];

  // Play line audio
  const handlePlayLine = (index: number) => {
    setActiveLineIndex(index);
    setIsPlaying(true);
    const line = track.transcript[index];
    speakText(line.en);
  };

  const handleTogglePlayAll = () => {
    if (isPlaying) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      const fullText = track.transcript.map((l) => l.en).join('. ');
      speakText(fullText);
    }
  };

  const handleSelectTrack = (id: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSelectedTrackId(id);
    setIsPlaying(false);
    setActiveLineIndex(0);
    setDictationAnswers({});
    setDictationChecked(false);
    setQuizAnswers({});
    setQuizChecked(false);
  };

  const handleCheckDictation = () => {
    setDictationChecked(true);
    let correct = 0;
    track.transcript.forEach((line, idx) => {
      if (
        line.maskedWord &&
        dictationAnswers[idx]?.trim().toLowerCase() === line.maskedWord.toLowerCase()
      ) {
        correct++;
      }
    });
    if (correct > 0) addXP(correct * 10);
  };

  const handleCheckQuiz = () => {
    setQuizChecked(true);
    let correct = 0;
    track.quiz.forEach((q) => {
      if (quizAnswers[q.id] === q.correct) correct++;
    });
    if (correct > 0) addXP(correct * 15);
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-8 pb-20">
      <Container size="lg" className="space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/learn"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Quay lại Khóa học</span>
          </Link>
          <div className="flex items-center gap-2">
            <Badge tone="orange">Phòng Luyện Tai Bắt Âm</Badge>
            <Badge tone="neutral">{track.level}</Badge>
          </div>
        </div>

        {/* Title & Track Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Luyện Nghe Tương Tác (Listening Lab)
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Nghe hội thoại thực tế, luyện chép chính tả (Dictation) và đối chiếu bản dịch song ngữ chuẩn xác.
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {LISTENING_TRACKS.map((t) => (
              <button
                key={t.id}
                onClick={() => handleSelectTrack(t.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedTrackId === t.id
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {t.topic} ({t.level})
              </button>
            ))}
          </div>
        </div>

        {/* Audio Player Console */}
        <Card tone="white" className="p-6 border-slate-200 shadow-subtle space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Big Play/Pause Button */}
              <button
                onClick={handleTogglePlayAll}
                className="w-14 h-14 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white flex items-center justify-center shadow-lg shadow-cyan-600/25 transition-transform hover:scale-105"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
              </button>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">{track.title}</h3>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                  <span className="font-semibold text-cyan-700">{track.topic}</span>
                  <span>•</span>
                  <span>{track.durationSec} giây</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Headphones className="w-3.5 h-3.5" />
                    <span>Native Accent</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Playback Speed Controls */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <span className="text-xs font-bold text-slate-400 uppercase">Tốc độ:</span>
              {([0.75, 1, 1.25] as const).map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    playbackSpeed === spd
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Equalizer animation bar */}
          <div className="flex items-center gap-1.5 pt-2">
            {[40, 70, 30, 90, 60, 80, 45, 95, 30, 85, 50, 75, 90, 60, 40, 70, 85, 55, 65, 45].map((h, i) => (
              <div
                key={i}
                className={`flex-1 rounded-full transition-all duration-300 ${
                  isPlaying ? 'bg-cyan-500 animate-pulse' : 'bg-slate-200'
                }`}
                style={{ height: `${isPlaying ? (h * 0.3) + 6 : 8}px` }}
              />
            ))}
          </div>
        </Card>

        {/* Practice Mode Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPracticeMode('transcript')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                practiceMode === 'transcript'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              1. Lời thoại Song ngữ (Transcript)
            </button>
            <button
              onClick={() => setPracticeMode('dictation')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                practiceMode === 'dictation'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              2. Chép chính tả (Dictation)
            </button>
            <button
              onClick={() => setPracticeMode('quiz')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                practiceMode === 'quiz'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              3. Trắc nghiệm Hiểu bài ({track.quiz.length})
            </button>
          </div>

          {practiceMode === 'transcript' && (
            <button
              onClick={() => setShowTranslations((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {showTranslations ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showTranslations ? 'Ẩn nghĩa tiếng Việt' : 'Hiện nghĩa tiếng Việt'}</span>
            </button>
          )}
        </div>

        {/* Tab 1: Transcript View */}
        {practiceMode === 'transcript' && (
          <div className="space-y-3">
            {track.transcript.map((line, idx) => {
              const isActive = activeLineIndex === idx && isPlaying;
              return (
                <div
                  key={idx}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                    isActive
                      ? 'bg-cyan-50/70 border-cyan-400 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <button
                    onClick={() => handlePlayLine(idx)}
                    className="w-10 h-10 rounded-xl bg-cyan-100 hover:bg-cyan-200 text-cyan-800 flex items-center justify-center flex-shrink-0 transition-colors mt-0.5"
                    title="Nghe câu này"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-cyan-800 uppercase tracking-wide">
                        {line.speaker}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">{line.time}</span>
                    </div>

                    <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                      {line.en}
                    </p>

                    {showTranslations && (
                      <p className="text-xs text-slate-500 italic pt-1 border-t border-slate-100 mt-2">
                        {line.vi}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Dictation / Fill in the blank */}
        {practiceMode === 'dictation' && (
          <div className="space-y-4">
            <Card tone="white" className="p-6 border-slate-200 shadow-subtle space-y-6">
              <div className="space-y-1">
                <h3 className="font-bold text-base text-slate-900">
                  Bài Tập Chép Chính Tả (Audio Dictation)
                </h3>
                <p className="text-xs text-slate-500">
                  Bấm biểu tượng loa ở từng câu để nghe và gõ lại chính xác từ vựng bị khuyết vào ô trống.
                </p>
              </div>

              <div className="space-y-4">
                {track.transcript.map((line, idx) => {
                  if (!line.maskedWord) return null;
                  const parts = line.en.split(new RegExp(`(${line.maskedWord})`, 'i'));
                  const userVal = dictationAnswers[idx] || '';
                  const isCorrect =
                    userVal.trim().toLowerCase() === line.maskedWord.toLowerCase();

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase">
                          Câu {idx + 1} ({line.speaker})
                        </span>
                        <button
                          onClick={() => handlePlayLine(idx)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-cyan-700 hover:bg-cyan-50"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Nghe lại</span>
                        </button>
                      </div>

                      <div className="text-sm font-medium text-slate-800 leading-loose">
                        {parts[0]}
                        <span className="inline-block mx-1">
                          <input
                            type="text"
                            value={userVal}
                            onChange={(e) =>
                              setDictationAnswers((prev) => ({ ...prev, [idx]: e.target.value }))
                            }
                            placeholder="Gõ từ nghe được..."
                            disabled={dictationChecked}
                            className={`px-3 py-1 rounded-lg border text-sm font-bold w-40 text-center transition-all ${
                              dictationChecked
                                ? isCorrect
                                  ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                                  : 'bg-red-50 border-red-500 text-red-900'
                                : 'bg-white border-slate-300 focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600'
                            }`}
                          />
                        </span>
                        {parts[2]}
                      </div>

                      {dictationChecked && (
                        <div className="text-xs flex items-center gap-1.5 pt-1">
                          {isCorrect ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Chính xác! (+10 Xu)
                            </span>
                          ) : (
                            <span className="text-red-700 font-bold flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" /> Đáp án đúng: <strong>{line.maskedWord}</strong>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                {!dictationChecked ? (
                  <Button
                    onClick={handleCheckDictation}
                    tone="orange"
                    size="md"
                    className="font-bold shadow-md shadow-orange-500/20"
                  >
                    Kiểm Tra Từ Đã Gõ
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      setDictationChecked(false);
                      setDictationAnswers({});
                    }}
                    variant="outline"
                    size="sm"
                    className="font-bold"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" />
                    <span>Làm lại chính tả</span>
                  </Button>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Tab 3: Quiz View */}
        {practiceMode === 'quiz' && (
          <div className="space-y-4">
            <Card tone="white" className="p-6 border-slate-200 shadow-subtle space-y-6">
              <div className="space-y-1">
                <h3 className="font-bold text-base text-slate-900">
                  Câu Hỏi Kiểm Tra Mức Độ Hiểu Hội Thoại
                </h3>
                <p className="text-xs text-slate-500">
                  Chọn đáp án chính xác nhất dựa trên thông tin đã nghe được trong đoạn băng.
                </p>
              </div>

              <div className="space-y-6">
                {track.quiz.map((q, idx) => {
                  const userChoice = quizAnswers[q.id];
                  const isCorrect = userChoice === q.correct;

                  return (
                    <div key={q.id} className="space-y-3">
                      <p className="text-sm font-bold text-slate-900">
                        {idx + 1}. {q.prompt}
                      </p>

                      <div className="space-y-2">
                        {q.options.map((opt) => {
                          const isSelected = userChoice === opt.id;
                          let btnStyle = 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700';

                          if (quizChecked) {
                            if (opt.id === q.correct) {
                              btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold';
                            } else if (isSelected && !isCorrect) {
                              btnStyle = 'bg-red-50 border-red-300 text-red-800 line-through';
                            }
                          } else if (isSelected) {
                            btnStyle = 'bg-cyan-50 border-cyan-500 text-cyan-900 font-semibold';
                          }

                          return (
                            <button
                              key={opt.id}
                              onClick={() => {
                                if (quizChecked) return;
                                setQuizAnswers((prev) => ({ ...prev, [q.id]: opt.id }));
                              }}
                              className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center gap-3 ${btnStyle}`}
                            >
                              <span className="w-5 h-5 rounded-md font-bold uppercase text-[10px] flex items-center justify-center bg-white border border-slate-300">
                                {opt.id}
                              </span>
                              <span>{opt.text}</span>
                            </button>
                          );
                        })}
                      </div>

                      {quizChecked && (
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                          <p className="font-bold text-slate-900">
                            {isCorrect ? '✅ Trả lời đúng (+15 Xu)' : '❌ Chưa chính xác'}
                          </p>
                          <p className="text-slate-600">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-100">
                {!quizChecked ? (
                  <Button
                    onClick={handleCheckQuiz}
                    disabled={Object.keys(quizAnswers).length === 0}
                    tone="orange"
                    size="md"
                    className="font-bold shadow-md shadow-orange-500/20"
                  >
                    Kiểm Tra Đáp Án ({Object.keys(quizAnswers).length}/{track.quiz.length})
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      setQuizChecked(false);
                      setQuizAnswers({});
                    }}
                    variant="outline"
                    size="sm"
                    className="font-bold"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" />
                    <span>Làm lại trắc nghiệm</span>
                  </Button>
                )}
              </div>
            </Card>
          </div>
        )}
      </Container>
    </div>
  );
}
