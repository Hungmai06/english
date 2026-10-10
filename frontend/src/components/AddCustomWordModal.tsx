'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Volume2,
  CheckCircle2,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import { Modal } from '@/design-system/components/Modal';
import { Button } from '@/design-system/components/Button';
import { addSingleCustomWord, getCustomDecks, CustomDeck } from '@/lib/storage';
import { speakText } from '@/lib/tts';

interface AddCustomWordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultDeckId?: string;
}

export const AddCustomWordModal: React.FC<AddCustomWordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultDeckId,
}) => {
  const customDecks = getCustomDecks();
  const [selectedDeckId, setSelectedDeckId] = useState<string>(
    defaultDeckId || customDecks[0]?.id || 'cdeck-academic'
  );
  const [lemma, setLemma] = useState('');
  const [viDefinition, setViDefinition] = useState('');
  const [ipa, setIpa] = useState('');
  const [level, setLevel] = useState<'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'>('B1');
  const [partOfSpeech, setPartOfSpeech] = useState<
    'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'idiom'
  >('noun');
  const [definition, setDefinition] = useState('');
  const [exampleEn, setExampleEn] = useState('');
  const [exampleVi, setExampleVi] = useState('');
  const [collocation, setCollocation] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Sync defaultDeckId when modal opens
  React.useEffect(() => {
    if (defaultDeckId) {
      setSelectedDeckId(defaultDeckId);
    } else if (customDecks.length > 0) {
      setSelectedDeckId(customDecks[0].id);
    }
  }, [defaultDeckId, isOpen]);

  const resetForm = () => {
    setLemma('');
    setViDefinition('');
    setIpa('');
    setLevel('B1');
    setPartOfSpeech('noun');
    setDefinition('');
    setExampleEn('');
    setExampleVi('');
    setCollocation('');
    setErrorMsg('');
    setIsSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lemma.trim()) {
      setErrorMsg('Vui lòng nhập từ tiếng Anh (Lemma)');
      return;
    }
    if (!viDefinition.trim()) {
      setErrorMsg('Vui lòng nhập nghĩa tiếng Việt');
      return;
    }

    try {
      addSingleCustomWord({
        lemma,
        ipa,
        level,
        partOfSpeech,
        definition,
        viDefinition,
        exampleEn,
        exampleVi,
        collocation,
        collectionId: selectedDeckId,
      });

      setIsSuccess(true);
      if (onSuccess) onSuccess();

      setTimeout(() => {
        handleClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Có lỗi xảy ra khi lưu từ.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Thêm Từ Vào Bộ Từ Của Tôi"
      description="Tự tạo từ vựng cá nhân với đầy đủ phiên âm, nghĩa tiếng Việt và ví dụ để luyện tập."
      size="lg"
    >
      {isSuccess ? (
        <div className="py-10 text-center space-y-3 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-900">Đã Thêm Từ Mới Thành Công!</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Từ vựng <span className="font-bold text-[#FF5C28]">"{lemma}"</span> đã được thêm vào bộ từ cá nhân và sẵn sàng cho các bài luyện tập.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2.5 text-xs text-red-700 font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Chọn bộ từ */}
          {customDecks.length > 0 && (
            <div className="space-y-1.5 p-3 rounded-2xl bg-orange-50/50 border border-orange-200/60">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Thêm vào bộ từ:</span>
                <span className="text-[11px] text-[#FF5C28] font-bold">
                  {customDecks.find((d) => d.id === selectedDeckId)?.title || ''}
                </span>
              </label>
              <select
                value={selectedDeckId}
                onChange={(e) => setSelectedDeckId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5C28]/30 cursor-pointer"
              >
                {customDecks.map((deck) => (
                  <option key={deck.id} value={deck.id}>
                    {deck.icon} {deck.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Row 1: Word + Level + Part of speech */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                Từ tiếng Anh <span className="text-[#FF5C28]">*</span>
              </label>
              <input
                type="text"
                value={lemma}
                onChange={(e) => {
                  setLemma(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="ví dụ: Resilient, Metaphor..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF5C28]/30 focus:border-[#FF5C28]"
                autoFocus
              />
            </div>

            <div className="sm:col-span-3 space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Cấp độ</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5C28]/30 cursor-pointer"
              >
                <option value="A1">A1 - Sơ cấp</option>
                <option value="A2">A2 - Cơ bản</option>
                <option value="B1">B1 - Trung cấp</option>
                <option value="B2">B2 - Khá</option>
                <option value="C1">C1 - Nâng cao</option>
                <option value="C2">C2 - Thành thạo</option>
              </select>
            </div>

            <div className="sm:col-span-3 space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Loại từ</label>
              <select
                value={partOfSpeech}
                onChange={(e) => setPartOfSpeech(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5C28]/30 cursor-pointer"
              >
                <option value="noun">Danh từ (n)</option>
                <option value="verb">Động từ (v)</option>
                <option value="adjective">Tính từ (adj)</option>
                <option value="adverb">Trạng từ (adv)</option>
                <option value="idiom">Thành ngữ (idiom)</option>
                <option value="preposition">Giới từ (prep)</option>
              </select>
            </div>
          </div>

          {/* Row 2: IPA + Nghĩa tiếng Việt */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-5 space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Phiên âm IPA</label>
              <input
                type="text"
                value={ipa}
                onChange={(e) => setIpa(e.target.value)}
                placeholder="/rɪˈzɪl.jənt/"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF5C28]/30 focus:border-[#FF5C28]"
              />
            </div>

            <div className="sm:col-span-7 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                Nghĩa tiếng Việt <span className="text-[#FF5C28]">*</span>
              </label>
              <input
                type="text"
                value={viDefinition}
                onChange={(e) => {
                  setViDefinition(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="ví dụ: Kiên cường, mau hồi phục..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF5C28]/30 focus:border-[#FF5C28]"
              />
            </div>
          </div>

          {/* Row 3: English Definition (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Định nghĩa tiếng Anh (tùy chọn)
            </label>
            <input
              type="text"
              value={definition}
              onChange={(e) => setDefinition(e.target.value)}
              placeholder="e.g. Able to withstand or recover quickly from difficult conditions."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF5C28]/30 focus:border-[#FF5C28]"
            />
          </div>

          {/* Row 4: Example EN & VI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Câu ví dụ tiếng Anh</label>
              <textarea
                rows={2}
                value={exampleEn}
                onChange={(e) => setExampleEn(e.target.value)}
                placeholder="e.g. She remained resilient despite the setback."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF5C28]/30 focus:border-[#FF5C28]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Dịch nghĩa câu ví dụ</label>
              <textarea
                rows={2}
                value={exampleVi}
                onChange={(e) => setExampleVi(e.target.value)}
                placeholder="e.g. Cô ấy vẫn kiên cường bất chấp khó khăn trở ngại."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF5C28]/30 focus:border-[#FF5C28]"
              />
            </div>
          </div>

          {/* Row 5: Collocation */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Collocations / Cụm đi kèm (phân cách bằng dấu phẩy)
            </label>
            <input
              type="text"
              value={collocation}
              onChange={(e) => setCollocation(e.target.value)}
              placeholder="ví dụ: highly resilient, build resilience"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF5C28]/30 focus:border-[#FF5C28]"
            />
          </div>

          {/* Live Preview Card */}
          {lemma && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-50/60 to-amber-50/60 border border-orange-200/60 space-y-2">
              <span className="text-[10px] font-black uppercase text-[#FF5C28] tracking-wider block">
                Xem trước thẻ từ
              </span>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base font-black text-slate-900">{lemma}</span>
                  {ipa && <span className="text-xs font-mono text-slate-500">{ipa}</span>}
                  <button
                    type="button"
                    onClick={() => speakText(lemma)}
                    className="p-1 rounded-full text-slate-400 hover:text-[#FF5C28] hover:bg-white transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#FFF0E7] text-[#FF5C28] text-[10px] font-black">
                  {level} · {partOfSpeech}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-800">
                {viDefinition || 'Chưa nhập nghĩa tiếng Việt'}
              </p>
              {exampleEn && (
                <p className="text-[11px] text-slate-500 italic">
                  "{exampleEn}"
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={handleClose}
              className="text-slate-500 text-xs"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              tone="orange"
              size="md"
              className="font-bold shadow-md shadow-[#FF5C28]/25 text-xs sm:text-sm"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Lưu vào Bộ Từ Của Tôi</span>
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
