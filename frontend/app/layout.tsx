import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from './layout/Header';
import { Providers } from './layout/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FitPlan Lite - 运动训练计划管理',
  description: '一个简单易用的运动训练计划管理应用',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="dark">
      <body className={inter.className + ' bg-background text-white min-h-screen'}>
        <Providers>
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
