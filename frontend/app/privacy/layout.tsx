import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description: 'TRNT 개인정보처리방침. 수집하는 개인정보 항목, 이용 목적, 보유 기간 및 이용자 권리에 대해 안내합니다.',
  openGraph: {
    title: '개인정보처리방침 | TRNT',
    description: 'TRNT 개인정보처리방침 안내',
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
