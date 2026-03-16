import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from '@/lib/i18n/LanguageContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://trnt.hbinserver.cloud';

export const metadata: Metadata = {
  title: {
    default: 'TRNT - AI 평행세계 시뮬레이터',
    template: '%s | TRNT',
  },
  description: '만약 다른 선택을 했다면? AI가 그려주는 당신의 또 다른 삶. 인생의 분기점을 탐험하고 평행세계 시나리오를 경험하세요.',
  keywords: ['평행세계', '시뮬레이터', 'AI 시나리오', '인생 분기점', 'The Road Not Taken', 'TRNT', '대안적 삶'],
  authors: [{ name: 'TRNT Team' }],
  metadataBase: new URL(BASE_URL),
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: BASE_URL,
    siteName: 'TRNT',
    title: 'TRNT - AI 평행세계 시뮬레이터',
    description: '만약 다른 선택을 했다면? AI가 그려주는 당신의 또 다른 삶.',
    images: [
      {
        url: '/ogtag.png',
        width: 1200,
        height: 630,
        alt: 'TRNT - The Road Not Taken',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TRNT - AI 평행세계 시뮬레이터',
    description: '만약 다른 선택을 했다면? AI가 그려주는 당신의 또 다른 삶.',
    images: ['/ogtag.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script
          src="https://t1.daumcdn.net/kas/static/ba.min.js"
          strategy="afterInteractive"
        />
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
