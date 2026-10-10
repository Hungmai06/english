'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  CheckCircle2,
  AlertCircle,
  FolderPlus,
} from 'lucide-react';
import { Modal } from '@/design-system/components/Modal';
import { Button } from '@/design-system/components/Button';
import { createCustomDeck, CustomDeck } from '@/lib/storage';

interface CreateCustomDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newDeck: CustomDeck) => void;
}

const AVAILABLE_ICONS = ['📁', '🎓', '💻', '☕', '✈️', '💼', '🏥', '🎨', '🎵', '⭐', '📚', '⚡', '🏆', '🔥'];
const AVAILABLE_COLORS = [
  { label: 'Cam Lingua', value: '#FF5C28' },
  { label: 'Tím Hoàng Gia', value: '#7548CE' },
  { label: 'Xanh IT', value: '#00A3C4' },
  { label: 'Xanh Lá', value: '#10B981' },
  { label: 'Đỏ Nhiệt Huyết', value: '#EF4444' },
  { label: 'Hồng Năng Động', value: '#EC4899' },
  { label: 'Xanh Dương', value: '#3B82F6' },
];

export const CreateCustomDeckModal: React.FC<CreateCustomDeckModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('📁');
  const [selectedColor, setSelectedColor] = useState('#FF5C28');
  const [errorMsg, setErrorMsg] = useState('');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSelectedIcon('📁');
    setSelectedColor('#FF5C28');
    setErrorMsg('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Vui lòng nhập tên bộ từ vựng');
      return;
    }

    try {
      const newDeck = createCustomDeck({
        title,
        description,
        icon: selectedIcon,
        color: selectedColor,
      });

      if (onSuccess) onSuccess(newDeck);
      handleClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Có lỗi xảy ra khi tạo bộ từ.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Tạo Bộ Từ Vựng Mới"
      description="Tạo một bộ từ riêng để phân loại từ vựng theo chủ đề, ngành nghề hoặc mục tiêu của bạn."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2.5 text-xs text-red-700 font-semibold">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tên bộ từ */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
            Tên bộ từ <span className="text-[#FF5C28]">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setErrorMsg('');
            }}
            placeholder="ví dụ: Từ Vựng Chuyên Ngành IT, IELTS Speaking Task 2..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF5C28]/30 focus:border-[#FF5C28]"
            autoFocus
          />
        </div>

        {/* Mô tả */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Mô tả (tùy chọn)</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="ví dụ: Tuyển tập các thuật ngữ quan trọng thường gặp khi làm việc với đối tác quốc tế."
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF5C28]/30 focus:border-[#FF5C28]"
          />
        </div>

        {/* Chọn biểu tượng Icon */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Biểu tượng bộ từ</label>
          <div className="flex items-center gap-2 flex-wrap">
            {AVAILABLE_ICONS.map((ic) => (
              <button
                type="button"
                key={ic}
                onClick={() => setSelectedIcon(ic)}
                className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${
                  selectedIcon === ic
                    ? 'bg-orange-100 border-2 border-[#FF5C28] scale-110 shadow-xs'
                    : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>

        {/* Chọn Màu sắc */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Màu chủ đạo</label>
          <div className="flex items-center gap-2.5 flex-wrap">
            {AVAILABLE_COLORS.map((col) => (
              <button
                type="button"
                key={col.value}
                onClick={() => setSelectedColor(col.value)}
                className={`w-7 h-7 rounded-full transition-all flex items-center justify-center ${
                  selectedColor === col.value
                    ? 'ring-2 ring-offset-2 ring-slate-800 scale-110'
                    : 'opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: col.value }}
                title={col.label}
              />
            ))}
          </div>
        </div>

        {/* Xem trước thẻ bộ từ */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
            Xem trước bộ từ
          </span>
          <div className="flex items-center gap-3">
            <span
              className="w-10 h-10 rounded-2xl text-white flex items-center justify-center text-lg font-black shadow-xs"
              style={{ backgroundColor: selectedColor }}
            >
              {selectedIcon}
            </span>
            <div>
              <h4 className="text-sm font-black text-slate-900">
                {title || 'Tên bộ từ của bạn'}
              </h4>
              <p className="text-[11px] text-slate-500 line-clamp-1">
                {description || 'Chưa nhập mô tả'}
              </p>
            </div>
          </div>
        </div>

        {/* Nút hành động */}
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
            <FolderPlus className="w-4 h-4 mr-1.5" />
            <span>Tạo Bộ Từ Mới</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
