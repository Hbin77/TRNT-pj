import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '회원가입',
  description: 'TRNT 무료 회원가입. AI 평행세계 시뮬레이터로 당신이 가지 않은 길을 탐험하세요.',
  openGraph: {
    title: '무료 회원가입 | TRNT',
    description: 'AI 평행세계 시뮬레이터 TRNT에 무료로 가입하세요.',
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
