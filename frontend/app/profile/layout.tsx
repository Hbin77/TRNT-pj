import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '프로필',
  description: '프로필 정보를 관리하세요.',
  robots: { index: false, follow: false },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
