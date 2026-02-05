"use client";

import { GlassCard } from '@/components/ui/GlassCard';
import { Logo } from '@/components/ui/Logo';
import Link from 'next/link';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#030712] text-gray-300">
            {/* Background Elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px]" />
            </div>

            <nav className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50 max-w-7xl mx-auto w-full">
                <Link href="/">
                    <Logo size="large" />
                </Link>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                    Home
                </Link>
            </nav>

            <main className="max-w-4xl w-full z-10 pt-32 pb-16">
                <GlassCard className="p-8 md:p-12 bg-white/5 border-white/10">
                    <h1 className="text-3xl font-bold text-white mb-8 border-b border-white/10 pb-4">Privacy Policy (개인정보처리방침)</h1>

                    <div className="space-y-6 text-sm leading-relaxed">
                        <section>
                            <h2 className="text-xl font-semibold text-blue-400 mb-2">1. Data Collection (수집하는 정보)</h2>
                            <p>We collect information you provide directly to us, such as your email address, username, and input data for scenario generation.</p>
                            <p className="mt-2 text-gray-500">이메일, 사용자 이름, 시나리오 생성을 위해 입력한 데이터 등 귀하가 직접 제공하는 정보를 수집합니다.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-blue-400 mb-2">2. Use of Information (정보의 이용)</h2>
                            <p>We use the information we collect to provide, maintain, and improve our services, including generating personalized content via AI models.</p>
                            <p className="mt-2 text-gray-500">수집된 정보는 AI 모델을 통한 맞춤형 콘텐츠 생성 등 서비스 제공, 유지 및 개선에 사용됩니다.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-blue-400 mb-2">3. Data Sharing (정보 공유)</h2>
                            <p>We do not share your personal information with third parties except as described in this policy (e.g., with AI service providers for generation purposes) or with your consent.</p>
                            <p className="mt-2 text-gray-500">본 정책에 명시된 경우(예: 생성을 위한 AI 서비스 제공업체와의 공유) 또는 귀하의 동의가 있는 경우를 제외하고는 개인정보를 제3자와 공유하지 않습니다.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-blue-400 mb-2">4. Data Security (데이터 보안)</h2>
                            <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access.</p>
                            <p className="mt-2 text-gray-500">귀하의 정보를 분실, 도난, 오용 및 무단 접근으로부터 보호하기 위해 합리적인 조치를 취하고 있습니다.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-blue-400 mb-2">5. Updates (변경 사항)</h2>
                            <p>We may update this Privacy Policy from time to time. If we make changes, we will notify you by revising the date at the top of the policy.</p>
                            <p className="mt-2 text-gray-500">본 개인정보처리방침은 수시로 업데이트될 수 있습니다.</p>
                        </section>
                    </div>
                </GlassCard>
            </main>

            <footer className="w-full max-w-7xl mx-auto py-8 text-center text-gray-500 text-sm border-t border-white/5">
                <p>© 2026 TRNT Team. All rights reserved.</p>
            </footer>
        </div>
    );
}
