import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '이용약관',
  description: 'TRNT 서비스 이용약관. 서비스 이용 조건, 회원의 권리와 의무, 저작권 및 면책사항을 안내합니다.',
  openGraph: {
    title: '이용약관 | TRNT',
    description: 'TRNT 서비스 이용약관 안내',
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
