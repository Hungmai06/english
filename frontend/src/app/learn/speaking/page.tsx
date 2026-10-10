'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Mic,
  Volume2,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Award,
  ChevronLeft,
  Square,
  Radio,
  HelpCircle,
  TrendingUp,
  Flame
} from 'lucide-react';
import { Container } from '@/design-system/components/Section';
import { Card } from '@/design-system/components/Card';
import { Badge } from '@/design-system/components/Badge';
import { Button } from '@/design-system/components/Button';
import { Progress } from '@/design-system/components/Progress';
import { speakText } from '@/lib/tts';
import { addXP } from '@/lib/storage';

interface MinimalPair {
  id: string;
  soundA: string;
  wordA: string;
  ipaA: string;
  soundB: string;
  wordB: string;
  ipaB: string;
  tip: string;
}

interface ShadowingSentence {
  id: string;
  sentence: string;
  ipa: string;
  translation: string;
  focusTone: string;
  words: { text: string; stressed: boolean }[];
}

const MINIMAL_PAIRS: MinimalPair[] = [
  {
    id: 'pair-1',
    soundA: '/iː/ (Âm i dài)',
    wordA: 'sheep',
    ipaA: '/ʃiːp/',
    soundB: '/ɪ/ (Âm i ngắn)',
    wordB: 'ship',
    ipaB: '/ʃɪp/',
    tip: 'Âm /iː/ kéo khóe môi sang hai bên như đang cười nhẹ; âm /ɪ/ mở miệng tự nhiên, phát âm dứt khoát nửa giây.'
  },
  {
    id: 'pair-2',
    soundA: '/θ/ (Âm th vô thanh)',
    wordA: 'think',
    ipaA: '/θɪŋk/',
    soundB: '/s/ (Âm s xì hơi)',
    wordB: 'sink',
    ipaB: '/sɪŋk/',
    tip: 'Đặt đầu lưỡi nhẹ giữa hai hàm răng rồi thổi luồng hơi ra mà không rung dây thanh quản.'
  },
  {
    id: 'pair-3',
    soundA: '/p/ (Âm bật hơi)',
    wordA: 'pat',
    ipaA: '/pæt/',
    soundB: '/b/ (Âm rung môi)',
    wordB: 'bat',
    ipaB: '/bæt/',
    tip: 'Mím chặt hai môi và bật mạnh luồng khí ra để tờ giấy trước miệng bay nhẹ.'
  }
];

const SHADOWING_LIST: ShadowingSentence[] = [
  {
    id: 'shad-1',
    sentence: 'I would appreciate it if you could send over the quarterly report.',
    ipa: '/aɪ wʊd əˈpriː.ʃi.eɪt ɪt ɪf juː kʊd send ˈoʊ.vɚ ðə ˈkwɔːr.tɚ.li rɪˈpɔːrt/',
    translation: 'Tôi sẽ rất cảm kích nếu bạn có thể gửi qua bản báo cáo quý.',
    focusTone: 'Lịch sự, ngữ điệu xuống nhẹ ở cuối câu (Falling intonation)',
    words: [
      { text: 'I', stressed: false },
      { text: 'would', stressed: false },
      { text: 'appreciate', stressed: true },
      { text: 'it', stressed: false },
      { text: 'if', stressed: false },
      { text: 'you', stressed: false },
      { text: 'could', stressed: false },
      { text: 'send', stressed: true },
      { text: 'over', stressed: false },
      { text: 'the', stressed: false },
      { text: 'quarterly', stressed: true },
      { text: 'report', stressed: true }
    ]
  },
  {
    id: 'shad-2',
    sentence: 'Could you please clarify whether the meeting is in person or online?',
    ipa: '/kʊd juː pliːz ˈklær.ə.faɪ ˈweð.ɚ ðə ˈmiː.tɪŋ ɪz ɪn ˈpɝː.sən ɔːr ˈɑːnˌlaɪn/',
    translation: 'Bạn có thể làm rõ giúp tôi là cuộc họp trực tiếp hay trực tuyến không?',
    focusTone: 'Ngữ điệu lên ở lựa chọn đầu và xuống ở lựa chọn cuối',
    words: [
      { text: 'Could', stressed: false },
      { text: 'you', stressed: false },
      { text: 'please', stressed: true },
      { text: 'clarify', stressed: true },
      { text: 'whether', stressed: false },
      { text: 'the', stressed: false },
      { text: 'meeting', stressed: true },
      { text: 'is', stressed: false },
      { text: 'in', stressed: false },
      { text: 'person', stressed: true },
      { text: 'or', stressed: false },
      { text: 'online', stressed: true }
    ]
  }
];

export default function SpeakingLabPage() {
  const [activeTab, setActiveTab] = useState<'pairs' | 'shadowing'>('shadowing');
  const [selectedShadowId, setSelectedShadowId] = useState(SHADOWING_LIST[0].id);

  // Recording & AI Evaluation state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [evaluationResult, setEvaluationResult] = useState<{
    score: number;
    fluency: number;
    accuracy: number;
    completeness: number;
    wordStatus: Record<string, 'good' | 'average' | 'poor'>;
  } | null>(null);

  const shadowItem = SHADOWING_LIST.find((s) => s.id === selectedShadowId) || SHADOWING_LIST[0];

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds((s) => {
          if (s >= 5) {
            handleStopRecording();
            return 5;
          }
          return s + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleStartRecording = () => {
    setEvaluationResult(null);
    setRecordingSeconds(0);
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    setIsRecording(false);

    // Simulate AI speech scoring algorithm
    setTimeout(() => {
      const simulatedScore = Math.floor(Math.random() * 15) + 85; // 85-99%
      const wordStatus: Record<string, 'good' | 'average' | 'poor'> = {};
      shadowItem.words.forEach((w, i) => {
        wordStatus[w.text] = i % 4 === 3 ? 'average' : 'good';
      });

      setEvaluationResult({
        score: simulatedScore,
        fluency: simulatedScore - 2,
        accuracy: simulatedScore + 1,
        completeness: 100,
        wordStatus
      });

      addXP(25);
    }, 600);
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
            <Badge tone="green">Phòng Thực Hành Phát Âm & Nói</Badge>
            <Badge tone="orange">AI Phản Hồi Giọng Nói</Badge>
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Phòng Luyện Nói (Speaking & Shadowing Lab)
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Luyện phát âm chuẩn IPA, phân biệt cặp âm dễ nhầm lẫn và thực hành kỹ thuật nhại giọng (Shadowing) theo người bản xứ.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('shadowing')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'shadowing'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              1. Luyện Nhại Giọng (Shadowing)
            </button>
            <button
              onClick={() => setActiveTab('pairs')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'pairs'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              2. Cặp Âm Tối Thiểu (Minimal Pairs)
            </button>
          </div>
        </div>

        {/* Tab 1: Shadowing Practice */}
        {activeTab === 'shadowing' && (
          <div className="space-y-6">
            {/* Sentence selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {SHADOWING_LIST.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedShadowId(s.id);
                    setEvaluationResult(null);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedShadowId === s.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Mẫu câu #{idx + 1}
                </button>
              ))}
            </div>

            {/* Main Interactive Shadowing Console */}
            <Card tone="white" className="p-6 sm:p-8 border-slate-200 shadow-subtle space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Mục tiêu luyện nói
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {shadowItem.focusTone}
                </span>
              </div>

              {/* English sentence display */}
              <div className="space-y-3">
                <div className="text-xl sm:text-2xl font-black text-slate-900 leading-relaxed">
                  {shadowItem.words.map((w, i) => {
                    const status = evaluationResult?.wordStatus[w.text];
                    let wordColor = 'text-slate-900';
                    if (status === 'good') wordColor = 'text-emerald-700 bg-emerald-50 px-1 rounded';
                    if (status === 'average') wordColor = 'text-amber-700 bg-amber-50 px-1 rounded';

                    return (
                      <span
                        key={i}
                        className={`inline-block mr-1.5 ${wordColor} ${
                          w.stressed ? 'font-black underline decoration-emerald-500 decoration-2' : 'font-normal'
                        }`}
                      >
                        {w.text}
                      </span>
                    );
                  })}
                </div>

                <p className="text-xs sm:text-sm font-mono text-slate-400">
                  {shadowItem.ipa}
                </p>

                <p className="text-xs text-slate-600 italic">
                  Dịch nghĩa: {shadowItem.translation}
                </p>
              </div>

              {/* Action Buttons: Listen & Record */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <button
                  onClick={() => speakText(shadowItem.sentence)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                >
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                  <span>Nghe Giọng Mẫu Bản Xứ</span>
                </button>

                <div className="flex items-center gap-3">
                  {!isRecording ? (
                    <Button
                      onClick={handleStartRecording}
                      tone="orange"
                      size="md"
                      className="font-bold shadow-md shadow-orange-500/20"
                    >
                      <Mic className="w-4 h-4 mr-1.5" />
                      <span>Bấm Để Thu Âm (Nói Thử)</span>
                    </Button>
                  ) : (
                    <button
                      onClick={handleStopRecording}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-600 text-white text-xs font-bold animate-pulse shadow-md shadow-red-600/25"
                    >
                      <Square className="w-4 h-4" />
                      <span>Đang thu ({recordingSeconds}s) - Bấm để chấm điểm</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Real-time AI Evaluation Report */}
              {evaluationResult && (
                <div className="p-6 rounded-3xl bg-emerald-50/80 border border-emerald-200 space-y-4 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-emerald-950">Đánh Giá Phát Âm AI</h4>
                        <p className="text-[11px] text-emerald-700">Đã cộng +25 Xu vào bảng xếp hạng</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-3xl font-black text-emerald-700">
                        {evaluationResult.score}%
                      </span>
                      <span className="block text-[10px] font-bold text-emerald-600 uppercase">
                        Độ chuẩn xác
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="p-3 bg-white rounded-xl border border-emerald-100">
                      <div className="text-xs text-slate-500">Độ trôi chảy (Fluency)</div>
                      <div className="text-base font-bold text-slate-900 mt-0.5">
                        {evaluationResult.fluency}%
                      </div>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-emerald-100">
                      <div className="text-xs text-slate-500">Trọng âm từ (Stress)</div>
                      <div className="text-base font-bold text-slate-900 mt-0.5">
                        {evaluationResult.accuracy}%
                      </div>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-emerald-100">
                      <div className="text-xs text-slate-500">Độ hoàn thành</div>
                      <div className="text-base font-bold text-slate-900 mt-0.5">
                        {evaluationResult.completeness}%
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-emerald-800 leading-relaxed pt-1">
                    💡 <strong>Nhận xét từ AI:</strong> Bạn bắt nhịp rất tốt ở các từ trọng tâm có gạch chân. Hãy chú ý giữ luồng hơi liên tục khi nối âm giữa <em>"send"</em> và <em>"over"</em> để giọng nói mượt mà tự nhiên hơn!
                  </p>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Tab 2: Minimal Pairs Practice */}
        {activeTab === 'pairs' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MINIMAL_PAIRS.map((pair) => (
              <Card key={pair.id} tone="white" className="p-6 border-slate-200 shadow-subtle space-y-5">
                <div className="space-y-1">
                  <Badge tone="green">Cặp Âm</Badge>
                  <h3 className="font-bold text-base text-slate-900 pt-1">
                    {pair.soundA} vs {pair.soundB}
                  </h3>
                </div>

                {/* Compare 2 Words */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                    <div className="text-lg font-black text-slate-900">{pair.wordA}</div>
                    <div className="text-xs font-mono text-slate-400">{pair.ipaA}</div>
                    <button
                      onClick={() => speakText(pair.wordA)}
                      className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 mx-auto flex items-center justify-center transition-colors"
                      title="Nghe phát âm"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                    <div className="text-lg font-black text-slate-900">{pair.wordB}</div>
                    <div className="text-xs font-mono text-slate-400">{pair.ipaB}</div>
                    <button
                      onClick={() => speakText(pair.wordB)}
                      className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 mx-auto flex items-center justify-center transition-colors"
                      title="Nghe phát âm"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                  <strong>Mẹo khẩu hình: </strong>
                  {pair.tip}
                </div>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
