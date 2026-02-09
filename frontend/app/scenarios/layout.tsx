import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '나의 시나리오',
  description: 'AI가 생성한 평행세계 시나리오를 확인하세요. 다른 선택이 만들어낸 또 다른 인생 이야기.',
  openGraph: {
    title: '나의 평행세계 시나리오 | TRNT',
    description: 'AI가 생성한 평행세계 시나리오를 확인하세요.',
    images: ['/hero-visual.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: '나의 평행세계 시나리오 | TRNT',
    description: 'AI가 생성한 평행세계 시나리오를 확인하세요.',
    images: ['/hero-visual.png'],
  },
};

export default function ScenariosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
