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
                    <h1 className="text-3xl font-bold text-white mb-8 border-b border-white/10 pb-4">개인정보처리방침</h1>

                    <div className="space-y-8 text-sm leading-relaxed whitespace-pre-line text-gray-300">
                        <section>
                            <h3 className="text-xl font-bold text-white mb-4">제1장 총칙</h3>
                            <div>
                                <h4 className="font-semibold text-blue-400 mb-2">제1조 (기본원칙)</h4>
                                <p>'TRNT (The Road Not Taken)'(이하 "회사"라 합니다)는 『정보통신망 이용촉진 및 정보보호 등에 관한 법률』, 『통신비밀보호법』, 『전기통신사업법』, 『개인정보보호법』 등 정보통신서비스제공자가 준수하여야 할 관련 법령상의 개인정보보호 규정을 준수하며, 관련 법령에 의거한 개인정보처리방침을 정하여 회원 권익 보호에 최선을 다하고 있습니다.</p>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-white mb-4">제2장 수집하는 개인정보의 항목 및 수집방법</h3>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-blue-400 mb-2">제2조 (수집하는 개인정보)</h4>
                                    <p>회사는 회원가입 및 관리, 원활한 고충처리, 각종 서비스의 제공을 위해 회원가입 당시 회원으로부터 아래와 같은 개인정보를 수집하고 있습니다.</p>
                                    <p className="mt-2 text-gray-400">- 수집항목: 이름, 이메일, 비밀번호, 서비스 이용 약관 동의, 개인정보 수집 및 이용 동의</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-blue-400 mb-2">제3조 (서비스 이용과정에서 추가 생성되어 수집하는 정보)</h4>
                                    <p>1. 회원이 서비스를 이용하는 과정에서 로그 데이터, 쿠키, 접속 IP 정보 등이 수집될 수 있습니다.</p>
                                    <p>2. 회원이 유료 서비스를 이용하는 경우 결제기록 등의 정보가 수집될 수 있습니다.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-blue-400 mb-2">제4조 (민감한 개인정보의 수집 금지 등)</h4>
                                    <p>회사는 회원의 기본적 인권 침해의 우려가 있는 민감한 개인정보(인종, 사상 및 신조, 정치적 성향이나 범죄기록, 의료정보 등)는 수집하지 않습니다.</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-white mb-4">제3장 개인정보의 수집 및 이용목적</h3>
                            <div>
                                <h4 className="font-semibold text-blue-400 mb-2">제6조 (개인정보의 수집 및 이용목적)</h4>
                                <p>회사는 다음 각 호의 목적으로 회원의 개인정보를 수집 및 이용합니다.</p>
                                <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-400">
                                    <li>회원 가입 및 관리: 회원가입 의사 확인, 본인 식별, 부정이용 방지</li>
                                    <li>서비스의 제공: 콘텐츠 생성 및 제공, 맞춤형 서비스</li>
                                    <li>고충 처리: 민원인의 신원 확인 및 처리 결과 통보</li>
                                    <li>마케팅 및 광고 활용: 신규 서비스 개발, 이벤트 정보 제공 (동의 시)</li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-white mb-4">제4장 개인정보의 공유 및 제공</h3>
                            <div>
                                <h4 className="font-semibold text-blue-400 mb-2">제7조 (개인정보 공유 및 제공의 기본 원칙)</h4>
                                <p>회사는 회원의 개인정보를 고지한 범위 내에서 사용하며, 회원의 사전 동의 없이는 동 범위를 초과하여 이용하거나 외부에 공개하지 않습니다. 단, 법령의 규정에 의거하거나 수사 기관의 요구가 있는 경우는 예외로 합니다.</p>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-white mb-4">제5장 개인정보의 보유 및 이용기간</h3>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-blue-400 mb-2">제9조 (보유 및 이용기간)</h4>
                                    <p>원칙적으로 회원의 개인정보는 수집 및 이용목적이 달성되면 지체 없이 파기됩니다. 단, 회원이 탈퇴하는 경우 재가입 요청 등을 고려하여 탈퇴일로부터 2주가 경과한 후 파기합니다.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-blue-400 mb-2">제11조 (관련 법령에 의한 정보보유)</h4>
                                    <p>관계 법령의 규정에 의하여 보존할 필요가 있는 경우, 회사는 다음 기간 동안 개인정보를 보관합니다.</p>
                                    <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-400">
                                        <li>계약 또는 청약철회 등에 관한 기록: 5년</li>
                                        <li>대금결제 및 재화 등의 공급에 관한 기록: 5년</li>
                                        <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년</li>
                                        <li>방문 기록 (통신비밀보호법): 3개월</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-white mb-4">제6장 이용자의 권리</h3>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-blue-400 mb-2">제13조 (동의 철회 및 열람, 정정)</h4>
                                    <p>회원은 언제든지 개인정보의 수집·이용·제공에 대한 동의를 철회할 수 있으며, 자신의 개인정보에 대한 열람, 증명, 정정을 요청할 수 있습니다.</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-white mb-4">제7장 개인정보 보호 책임자</h3>
                            <div>
                                <h4 className="font-semibold text-blue-400 mb-2">제24조 (책임자 및 담당자)</h4>
                                <p>회원은 서비스를 이용하며 발생하는 모든 개인정보보호 관련 민원을 아래 담당자에게 신고하실 수 있습니다.</p>
                                <div className="mt-2 text-gray-400 pl-4 border-l-2 border-white/10">
                                    <p>성명: 박현빈</p>
                                    <p>메일: phb007298@gmail.com</p>
                                </div>
                            </div>
                        </section>

                        <section className="border-t border-white/10 pt-8 mt-8">
                            <h3 className="text-xl font-bold text-white mb-4">기타</h3>
                            <p>공고일자: 2026년 2월 6일</p>
                            <p>시행일자: 2026년 2월 6일</p>
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
