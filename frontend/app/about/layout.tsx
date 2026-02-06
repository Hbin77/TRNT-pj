import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '서비스 소개',
  description: 'TRNT(The Road Not Taken)의 시작 이야기와 서비스 이용 가이드. AI 평행세계 시뮬레이터로 가지 않은 길을 경험하세요.',
  openGraph: {
    title: '서비스 소개 | TRNT',
    description: 'TRNT의 시작 이야기와 서비스 이용 가이드',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
