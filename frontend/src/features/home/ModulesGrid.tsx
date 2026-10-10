import React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Sparkles,
  FileText,
  Headphones,
  Mic,
  PenTool,
  Award,
  ArrowRight,
} from 'lucide-react';
import { Card } from '@/design-system/components/Card';
import { Badge } from '@/design-system/components/Badge';

const VIETNAMESE_MODULES = [
  {
    id: 'grammar',
    name: 'Ngữ pháp (Grammar)',
    slug: 'grammar',
    href: '/learn/grammar',
    description: 'Nắm vững các thì, trật tự câu, mệnh đề quan hệ và đảo ngữ qua lý thuyết cô đọng & bài tập phản xạ tức thì.',
    icon: BookOpen,
    tone: 'orange' as const,
    status: 'active',
    itemCount: '21 Chuyên đề',
    progressPercent: 68,
  },
  {
    id: 'vocabulary',
    name: 'Từ vựng (Vocabulary)',
    slug: 'vocabulary',
    href: '/learn/vocabulary',
    description: 'Tích lũy từ vựng theo cụm (collocations), phiên âm IPA chuẩn, nghĩa tiếng Việt chuẩn xác và lật Flashcard ghi nhớ lâu.',
    icon: Sparkles,
    tone: 'orange' as const,
    status: 'active',
    itemCount: '1,200+ Từ trọng tâm',
    progressPercent: 45,
  },
];

export const ModulesGrid: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF5C28]">
            Lộ trình học tập trọng tâm
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            2 Trọng Tâm Cốt Lõi: Ngữ Pháp & Từ Vựng
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Tập trung học sâu vào bản chất cấu trúc câu và mở rộng vốn từ ngữ cảnh chuẩn bản xứ.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {VIETNAMESE_MODULES.map((module) => {
          const IconComponent = module.icon;

          return (
            <Link
              key={module.id}
              href={module.href}
              className="block group"
            >
              <Card
                tone={module.tone}
                interactive
                className="h-full flex flex-col justify-between p-6 relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-800 group-hover:scale-110 transition-transform">
                      <IconComponent className="w-6 h-6 text-slate-800" />
                    </div>
                    {module.status === 'active' ? (
                      <Badge tone="orange">
                        {module.itemCount}
                      </Badge>
                    ) : (
                      <Badge tone="neutral">Sắp ra mắt</Badge>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#FF5C28] transition-colors">
                    {module.name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {module.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/50 flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-500">
                    Tiến độ: <span className="text-slate-800 font-bold">{module.progressPercent}%</span>
                  </div>
                  <span className="text-xs font-bold text-[#FF5C28] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    <span>Vào học</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
