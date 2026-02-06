import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '로그인',
  description: 'TRNT 로그인. 이메일 또는 소셜 계정으로 로그인하여 AI 평행세계 시뮬레이터를 이용하세요.',
  robots: { index: false, follow: true },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
