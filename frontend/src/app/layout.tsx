import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Newsreader, Caveat } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ClientProviders } from '@/components/ClientProviders';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const newsreader = Newsreader({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-serif',
  display: 'swap',
  style: ['normal', 'italic'],
  weight: ['400', '500', '600', '700'],
});

const caveat = Caveat({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-handwriting',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'LinguaCore — Học tiếng Anh theo một hệ thống',
  description:
    'Nền tảng học tiếng Anh hiện đại với ngữ pháp rõ ràng, từ vựng theo ngữ cảnh và luyện tập ghi nhớ sâu sắc.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${plusJakarta.variable} ${newsreader.variable} ${caveat.variable}`}>
      <body className="min-h-screen flex flex-col antialiased bg-[#FAF8F5] text-[#102A43] font-sans selection:bg-[#FFF0E7] selection:text-[#FF5C28]">
        <ClientProviders>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
}



