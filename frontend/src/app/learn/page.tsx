import React from 'react';
import Link from 'next/link';
import { BookOpen, Sparkles, FileText, Headphones, Mic, PenTool, Award, ArrowRight } from 'lucide-react';
import { Section, Container } from '@/design-system/components/Section';
import { Card } from '@/design-system/components/Card';
import { Badge } from '@/design-system/components/Badge';
import { Progress } from '@/design-system/components/Progress';

const ALL_MODULES = [
  {
    id: 'grammar',
    name: 'Ngữ pháp (Grammar)',
    slug: 'grammar',
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
    description: 'Tích lũy từ vựng theo cụm (collocations), phiên âm IPA chuẩn, nghĩa tiếng Việt chuẩn xác và lật Flashcard ghi nhớ lâu.',
    icon: Sparkles,
    tone: 'orange' as const,
    status: 'active',
    itemCount: '1,200+ Từ trọng tâm',
    progressPercent: 45,
  },
  {
    id: 'reading',
    name: 'Đọc hiểu (Reading)',
    slug: 'reading',
    description: 'Rèn luyện kỹ năng đọc lướt (skimming) và quét thông tin (scanning) qua các bài đọc học thuật và đời sống.',
    icon: FileText,
    tone: 'purple' as const,
    status: 'active',
    itemCount: '48 Bài đọc',
    progressPercent: 30,
  },
  {
    id: 'listening',
    name: 'Luyện nghe (Listening)',
    slug: 'listening',
    description: 'Luyện tai bắt âm ngữ điệu bản xứ qua các tình huống hội thoại thực tế, tin tức và podcast có transcript.',
    icon: Headphones,
    tone: 'cyan' as const,
    status: 'active',
    itemCount: '64 Bài nghe',
    progressPercent: 25,
  },
  {
    id: 'speaking',
    name: 'Luyện nói (Speaking)',
    slug: 'speaking',
    description: 'Thực hành phát âm, trọng âm từ, nối âm và ngữ điệu câu để giao tiếp tự nhiên không ngập ngừng.',
    icon: Mic,
    tone: 'green' as const,
    status: 'beta',
    itemCount: '32 Chủ đề',
    progressPercent: 15,
  },
  {
    id: 'writing',
    name: 'Luyện viết (Writing)',
    slug: 'writing',
    description: 'Kỹ thuật biến đổi câu, liên kết ý tưởng, viết email công việc và bài luận súc tích, chuyên nghiệp.',
    icon: PenTool,
    tone: 'pink' as const,
    status: 'beta',
    itemCount: '28 Bài tập',
    progressPercent: 10,
  },
  {
    id: 'toeic',
    name: 'Luyện thi TOEIC',
    slug: 'toeic',
    description: 'Chuyên sâu Part 5, 6, 7: nhận diện bẫy ngữ pháp, chọn từ loại nhanh trong 15s và dự đoán thang điểm thật.',
    icon: Award,
    tone: 'warm' as const,
    status: 'active',
    itemCount: '15 Bộ đề',
    progressPercent: 50,
  },
];

export default function LearnPage() {
  return (
    <Section theme="warm" className="min-h-screen py-10">
      <Container size="lg" className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <Badge tone="orange">Trung Tâm Đào Tạo</Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Chọn Lộ Trình Học Phù Hợp
          </h1>
          <p className="text-slate-600 max-w-2xl text-sm sm:text-base">
            Mỗi phân hệ đều được xây dựng theo phương pháp học chủ động: Lý thuyết tinh gọn → Bài tập phản xạ → Sổ tay sửa sai.
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ALL_MODULES.map((module) => {
            const Icon = module.icon;
            const targetUrl = `/learn/${module.slug}`;

            return (
              <Link key={module.id} href={targetUrl} className="group">
                <Card
                  tone={module.tone}
                  interactive
                  className="h-full flex flex-col justify-between p-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-800 group-hover:scale-105 transition-transform">
                        <Icon className="w-6 h-6" />
                      </div>
                      <Badge tone="green">
                        Đang mở
                      </Badge>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#FF5C28] transition-colors">
                        {module.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                        {module.description}
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-xs font-semibold text-slate-600">
                        <span>Mức độ thành thạo</span>
                        <span>{module.progressPercent}%</span>
                      </div>
                      <Progress value={module.progressPercent} tone="orange" size="sm" />
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-[#FF5C28]">
                    <span>{module.itemCount}</span>
                    <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Bắt đầu học</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
