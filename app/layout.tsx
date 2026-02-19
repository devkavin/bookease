import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { GradientOrbs } from '@/components/app/GradientOrbs';
import { NoiseOverlay } from '@/components/app/NoiseOverlay';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = { title: 'BookEase', description: 'Premium booking micro SaaS' };

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}><Providers><GradientOrbs />{children}<NoiseOverlay /></Providers></body>
    </html>
  );
}
