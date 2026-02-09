import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '대시보드',
  description: '나의 평행세계 시나리오를 관리하고 새로운 분기점을 탐험하세요.',
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
