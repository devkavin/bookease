import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { AppBackground } from '@/components/app/AppBackground';
import { NoiseOverlay } from '@/components/app/NoiseOverlay';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
});

const siteName = 'BookEase';
const siteDescription =
  'BookEase helps hospitality and service brands deliver premium booking journeys with real-time availability and guest-first automation.';

export const metadata: Metadata = {
  metadataBase: new URL('https://bookease.vercel.app'),
  title: {
    default: siteName,
    template: `%s · ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  category: 'business',
  openGraph: {
    title: siteName,
    description: siteDescription,
    type: 'website',
    siteName,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description: siteDescription,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#05030a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} ${inter.variable} selection:bg-amber-300/30 selection:text-white`}>
        <Providers>
          <AppBackground />
          <div className="relative z-10">{children}</div>
          <NoiseOverlay />
        </Providers>
      </body>
    </html>
  );
}
