'use client';

import React, { useState, useMemo } from 'react';
import {
  Layers,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  FolderPlus,
  Folder,
  Trash2,
  Info,
} from 'lucide-react';
import { VocabularyWord, VocabularyCollection } from '@/types';
import { Modal } from '@/design-system/components/Modal';

interface BulkVocabModalProps {
  isOpen: boolean;
  onClose: () => void;
  collections: VocabularyCollection[];
  onImportSuccess: (importedWords: VocabularyWord[], newCollection?: VocabularyCollection) => void;
}

interface ParsedWordItem {
  id: string;
  lemma: string;
  ipa: string;
  viDefinition: string;
  isValid: boolean;
  error?: string;
}

const SAMPLE_BATCH_TEXT = `accomplish - /əˈkʌm.plɪʃ/ - hoàn thành, đạt được mục tiêu
resilient - /rɪˈzɪliənt/ - kiên cường, mau phục hồi
meticulous - /məˈtɪkjələs/ - cẩn thận, tỉ mỉ từng chi tiết
comprehend - /ˌkɒm.prɪˈhend/ - hiểu thấu đáo, lĩnh hội kiến thức
lucrative - /ˈluː.krə.tɪv/ - sinh lời, đem lại lợi nhuận cao
persevere - /ˌpɜː.səˈvɪər/ - kiên trì, bền bỉ đến cùng
diligent - /ˈdɪl.ɪ.dʒənt/ - chăm chỉ, cần mẫn trong công việc`;

export function BulkVocabModal({
  isOpen,
  onClose,
  collections,
  onImportSuccess,
}: BulkVocabModalProps) {
  const [rawText, setRawText] = useState('');
  const [collectionMode, setCollectionMode] = useState<'existing' | 'create'>('existing');
  const [selectedCollectionId, setSelectedCollectionId] = useState(collections[0]?.id || 'col-oxford');
  const [newCollectionTitle, setNewCollectionTitle] = useState('');
  const [newCollectionDesc, setNewCollectionDesc] = useState('');

  // Smart Parser for: từ - phiên âm - nghĩa
  const parsedItems = useMemo<ParsedWordItem[]>(() => {
    if (!rawText.trim()) return [];

    const lines = rawText.split('\n');
    const items: ParsedWordItem[] = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      let lemma = '';
      let ipa = '';
      let viDefinition = '';

      // Format 1: Separated by hyphens " - "
      if (trimmed.includes(' - ')) {
        const parts = trimmed.split(' - ').map((p) => p.trim());
        if (parts.length >= 3) {
          // Format: từ - phiên âm - nghĩa
          lemma = parts[0];
          ipa = parts[1];
          viDefinition = parts.slice(2).join(' - ');
        } else if (parts.length === 2) {
          // Format: từ - nghĩa
          lemma = parts[0];
          viDefinition = parts[1];
        }
      }
      // Format 2: Separated by "|"
      else if (trimmed.includes('|')) {
        const parts = trimmed.split('|').map((p) => p.trim());
        if (parts.length >= 3) {
          lemma = parts[0];
          ipa = parts[1];
          viDefinition = parts.slice(2).join(' | ');
        } else if (parts.length === 2) {
          lemma = parts[0];
          viDefinition = parts[1];
        }
      }
      // Format 3: Single hyphen without spaces e.g. từ-phiên âm-nghĩa
      else if (trimmed.includes('-')) {
        const parts = trimmed.split('-').map((p) => p.trim());
        if (parts.length >= 3) {
          lemma = parts[0];
          ipa = parts[1];
          viDefinition = parts.slice(2).join(' - ');
        } else if (parts.length === 2) {
          lemma = parts[0];
          viDefinition = parts[1];
        }
      }
      // Format 4: Single word without delimiter
      else {
        lemma = trimmed;
        viDefinition = '';
      }

      // Clean up IPA
      if (ipa && !ipa.startsWith('/')) {
        ipa = `/${ipa}/`;
      }
      if (!ipa && lemma) {
        ipa = `/${lemma.toLowerCase()}/`;
      }

      const isValid = lemma.length > 0 && viDefinition.length > 0;

      items.push({
        id: `bulk-${Date.now()}-${idx}`,
        lemma,
        ipa,
        viDefinition,
        isValid,
        error: !lemma ? 'Thiếu từ tiếng Anh' : !viDefinition ? 'Thiếu nghĩa tiếng Việt' : undefined,
      });
    });

    return items;
  }, [rawText]);

  const validItems = parsedItems.filter((i) => i.isValid);
  const invalidCount = parsedItems.length - validItems.length;

  const handleApplySample = () => {
    setRawText(SAMPLE_BATCH_TEXT);
  };

  const handleClear = () => {
    setRawText('');
  };

  const handleConfirmImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (validItems.length === 0) return;

    let targetCollectionId = selectedCollectionId;
    let newlyCreatedCollection: VocabularyCollection | undefined = undefined;

    // Handle New Collection Creation
    if (collectionMode === 'create') {
      if (!newCollectionTitle.trim()) {
        alert('Vui lòng nhập tên cho bộ từ vựng mới');
        return;
      }

      const slug = newCollectionTitle
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      targetCollectionId = `col-${Date.now()}`;
      newlyCreatedCollection = {
        id: targetCollectionId,
        title: newCollectionTitle.trim(),
        slug: slug || `col-${Date.now()}`,
        description: newCollectionDesc.trim() || `Bộ từ vựng ${newCollectionTitle.trim()}`,
        category: 'Custom',
        icon: 'BookOpen',
        wordsCount: validItems.length,
      };
    }

    const wordsToImport: VocabularyWord[] = validItems.map((item, index) => ({
      id: `w-${Date.now()}-${index}`,
      lemma: item.lemma,
      ipa: item.ipa,
      level: 'B1', // default CEFR value for data consistency
      collectionId: targetCollectionId,
      senses: [
        {
          id: `s-${Date.now()}-${index}`,
          partOfSpeech: 'verb',
          definition: item.viDefinition,
          viDefinition: item.viDefinition,
          examples: [],
        },
      ],
      collocations: [],
    }));

    onImportSuccess(wordsToImport, newlyCreatedCollection);
    handleClear();
    setNewCollectionTitle('');
    setNewCollectionDesc('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm Hàng Loạt Từ Vựng Mới"
      description="Nhập danh sách từ vựng theo định dạng: từ - phiên âm - nghĩa. Tự động nhận diện và lưu vào bộ từ của bạn."
      size="xl"
    >
      <form onSubmit={handleConfirmImport} className="space-y-4">
        {/* Step 1: Collection Selection / Creation Bar */}
        <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/60">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Folder className="w-4 h-4 text-[#FF5C28]" />
              <span>Nơi Lưu Trữ (Bộ Sưu Tập Từ Vựng)</span>
            </span>

            {/* Toggle between existing and new collection */}
            <div className="inline-flex bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold shadow-2xs">
              <button
                type="button"
                onClick={() => setCollectionMode('existing')}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                  collectionMode === 'existing'
                    ? 'bg-[#FF5C28] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Folder className="w-3.5 h-3.5" />
                <span>Chọn Bộ Có Sẵn</span>
              </button>
              <button
                type="button"
                onClick={() => setCollectionMode('create')}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                  collectionMode === 'create'
                    ? 'bg-[#FF5C28] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>+ Tạo Bộ Từ Mới</span>
              </button>
            </div>
          </div>

          {/* Mode 1: Select existing collection */}
          {collectionMode === 'existing' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Chọn Bộ Từ Vựng Để Import Vào:
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={selectedCollectionId}
                  onChange={(e) => {
                    if (e.target.value === '__CREATE_NEW__') {
                      setCollectionMode('create');
                    } else {
                      setSelectedCollectionId(e.target.value);
                    }
                  }}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#FF5C28]"
                >
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.category})
                    </option>
                  ))}
                  <option value="__CREATE_NEW__">+ Tạo bộ sưu tập từ mới...</option>
                </select>

                <button
                  type="button"
                  onClick={() => setCollectionMode('create')}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 hover:border-orange-400 bg-white text-xs font-bold text-[#FF5C28] flex items-center gap-1 whitespace-nowrap shadow-2xs"
                  title="Tạo bộ sưu tập mới"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tạo Mới</span>
                </button>
              </div>
            </div>
          ) : (
            /* Mode 2: Create new collection on the fly */
            <div className="space-y-2.5 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tên Bộ Từ Mới <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newCollectionTitle}
                    onChange={(e) => setNewCollectionTitle(e.target.value)}
                    placeholder="Ví dụ: 100 Từ Vựng Giao Tiếp Chuyên Ngành..."
                    className="w-full p-2.5 bg-white border border-orange-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF5C28]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mô Tả Bộ Từ (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={newCollectionDesc}
                    onChange={(e) => setNewCollectionDesc(e.target.value)}
                    placeholder="Ví dụ: Các từ vựng then chốt dùng trong đàm phán..."
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#FF5C28]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-amber-700 bg-amber-50/80 px-3 py-1.5 rounded-xl border border-amber-200">
                <span>Bộ từ mới này sẽ được tự động tạo và lưu trữ trên hệ thống cùng các từ bên dưới.</span>
                <button
                  type="button"
                  onClick={() => setCollectionMode('existing')}
                  className="font-bold underline ml-2 whitespace-nowrap text-slate-600 hover:text-slate-900"
                >
                  Quay lại chọn bộ có sẵn
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Text Area Input: từ - phiên âm - nghĩa */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <span>Định dạng nhập: <code className="bg-slate-100 text-[#FF5C28] px-1.5 py-0.5 rounded font-bold">từ - phiên âm - nghĩa</code></span>
              <span className="text-[11px] text-slate-400 font-normal hidden sm:inline">
                (mỗi dòng 1 từ)
              </span>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleApplySample}
                className="text-[11px] font-bold text-[#FF5C28] hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Nạp Dữ Liệu Mẫu</span>
              </button>
              {rawText && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-[11px] font-bold text-slate-400 hover:text-rose-600 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa</span>
                </button>
              )}
            </div>
          </div>

          <textarea
            rows={7}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder={`accomplish - /əˈkʌm.plɪʃ/ - hoàn thành, đạt được mục tiêu\nresilient - /rɪˈzɪliənt/ - kiên cường, mau phục hồi\nmeticulous - /məˈtɪkjələs/ - cẩn thận, tỉ mỉ từng chi tiết\ncomprehend - /ˌkɒm.prɪˈhend/ - hiểu thấu đáo, lĩnh hội`}
            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF5C28] resize-y leading-relaxed"
          />
        </div>

        {/* Step 3: Live Preview Table (Only Word, Pronunciation, Meaning) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">Xem trước danh sách ({validItems.length} từ hợp lệ):</span>
              {invalidCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800">
                  {invalidCount} dòng chưa đúng định dạng
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400">
              {collectionMode === 'create' ? (
                <span>Lưu vào bộ mới: <b>{newCollectionTitle || 'Chưa đặt tên'}</b></span>
              ) : (
                <span>Lưu vào: <b>{collections.find((c) => c.id === selectedCollectionId)?.title}</b></span>
              )}
            </span>
          </div>

          {parsedItems.length === 0 ? (
            <div className="p-5 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 text-slate-400 text-xs">
              Chưa có dữ liệu. Nhập danh sách hoặc bấm <b>"Nạp Dữ Liệu Mẫu"</b> ở trên để thử nghiệm ngay.
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider sticky top-0">
                    <th className="py-2.5 px-3 w-10">#</th>
                    <th className="py-2.5 px-4 font-black">Từ Tiếng Anh</th>
                    <th className="py-2.5 px-4 font-black">Phiên Âm (IPA)</th>
                    <th className="py-2.5 px-4 font-black">Nghĩa Tiếng Việt</th>
                    <th className="py-2.5 px-3 text-center w-20">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedItems.map((item, idx) => (
                    <tr
                      key={item.id}
                      className={item.isValid ? 'hover:bg-slate-50/60' : 'bg-rose-50/40 text-slate-400'}
                    >
                      <td className="py-2 px-3 text-[11px] text-slate-400">{idx + 1}</td>
                      <td className="py-2 px-4 font-black text-slate-900 text-sm">{item.lemma || '—'}</td>
                      <td className="py-2 px-4 font-mono text-slate-600 text-xs">{item.ipa}</td>
                      <td className="py-2 px-4 text-slate-800 font-medium">{item.viDefinition || <span className="text-rose-500 italic">Chưa nhập nghĩa</span>}</td>
                      <td className="py-2 px-3 text-center">
                        {item.isValid ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 inline-block" />
                        ) : (
                          <span title={item.error} className="inline-flex cursor-help">
                            <AlertCircle className="w-4 h-4 text-rose-500" />
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-slate-400" />
            <span>
              Sẵn sàng import <b>{validItems.length}</b> từ vựng
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={validItems.length === 0}
              className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all flex items-center gap-1.5 ${
                validItems.length > 0
                  ? 'bg-[#FF5C28] hover:bg-[#ea501e] cursor-pointer'
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>
                {collectionMode === 'create'
                  ? `Tạo Bộ Mới & Thêm (${validItems.length} từ)`
                  : `Xác Nhận Thêm (${validItems.length} từ)`}
              </span>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
