"use client";

import { GlassCard } from '@/components/ui/GlassCard';
import { Logo } from '@/components/ui/Logo';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function TermsPage() {
    const { language } = useLanguage();

    // Only Korean content is detailed as per request source
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#030712] text-gray-300">
            {/* Background Elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px]" />
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
                    <h1 className="text-3xl font-bold text-white mb-8 border-b border-white/10 pb-4">이용약관</h1>

                    <div className="space-y-8 text-sm leading-relaxed whitespace-pre-line text-gray-300">
                        <section>
                            <h3 className="text-xl font-bold text-white mb-4">제1장 총칙</h3>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-blue-400 mb-2">제1조 (목적)</h4>
                                    <p>본 약관은 'TRNT (The Road Not Taken)'(이하 "회사"라 합니다)가 운영하는 웹사이트 및 AI 평행세계 시뮬레이션 서비스(이하 "서비스"라 합니다)의 이용과 관련하여 회사와 이용자의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-blue-400 mb-2">제2조 (용어의 정의)</h4>
                                    <p>1. "서비스"란 구현되는 단말기(PC, 휴대형 단말기 등 각종 유무선 장치를 포함)와 상관없이 회원이 이용할 수 있는 TRNT 관련 제반 서비스를 의미합니다.</p>
                                    <p>2. "회원"이란 회사의 서비스에 접속하여 본 약관에 따라 회사와 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 고객을 말합니다.</p>
                                    <p>3. "AI 시뮬레이션"이란 인공지능 알고리즘을 활용하여 이용자의 선택에 따른 가상의 시나리오를 생성하고 제공하는 기능을 말합니다.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-blue-400 mb-2">제3조 (약관의 명시와 개정)</h4>
                                    <p>회사는 본 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다. 회사는 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있으며, 개정 시 시행일자 및 개정사유를 명시하여 공지합니다.</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-white mb-4">제2장 서비스 이용계약</h3>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-blue-400 mb-2">제4조 (이용계약의 성립)</h4>
                                    <p>이용계약은 회원이 되고자 하는 자(이하 "가입신청자")가 약관의 내용에 대하여 동의를 한 다음 회원가입 신청을 하고 회사가 이러한 신청에 대하여 승낙함으로써 체결됩니다.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-blue-400 mb-2">제5조 (이용신청의 승낙과 제한)</h4>
                                    <p>회사는 가입신청자의 신청에 대하여 서비스 이용을 승낙함을 원칙으로 합니다. 다만, 다음 각 호에 해당하는 경우 승낙을 하지 않거나 사후에 이용계약을 해지할 수 있습니다.</p>
                                    <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-400">
                                        <li>다른 사람의 명의를 도용하여 신청한 경우</li>
                                        <li>허위의 정보를 기재하거나, 회사가 제시하는 내용을 기재하지 않은 경우</li>
                                        <li>사회의 안녕질서 혹은 미풍양속을 저해할 목적으로 신청한 경우</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-white mb-4">제3장 계약 당사자의 의무</h3>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-blue-400 mb-2">제6조 (회사의 의무)</h4>
                                    <p>회사는 법령과 본 약관이 금지하거나 공서양속에 반하는 행위를 하지 않으며, 계속적이고 안정적으로 서비스를 제공하기 위하여 최선을 다합니다.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-blue-400 mb-2">제7조 (회원의 의무)</h4>
                                    <p>회원은 다음 행위를 하여서는 안 됩니다.</p>
                                    <ol className="list-decimal pl-5 mt-2 space-y-1 text-gray-400">
                                        <li>서비스 신청 또는 변경 시 허위 내용의 등록</li>
                                        <li>타인의 정보 도용</li>
                                        <li>회사가 게시한 정보의 변경</li>
                                        <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
                                        <li>회사 및 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                                        <li>회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                                    </ol>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-white mb-4">제4장 서비스의 이용</h3>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-blue-400 mb-2">제8조 (서비스의 제공 등)</h4>
                                    <p>1. 서비스는 연중무휴, 1일 24시간 제공함을 원칙으로 합니다.</p>
                                    <p>2. 회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신두절 또는 운영상 상당한 이유가 있는 경우 서비스의 제공을 일시적으로 중단할 수 있습니다.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-blue-400 mb-2">제9조 (AI 정보 서비스의 고지)</h4>
                                    <p>1. 본 서비스가 제공하는 시나리오는 AI에 의해 생성되며, 실제 사실과 다를 수 있습니다.</p>
                                    <p>2. 생성된 콘텐츠는 엔터테인먼트 및 자기 성찰 목적으로만 제공됩니다.</p>
                                    <p>3. 회사는 AI가 생성한 결과물의 정확성, 신뢰성, 적법성에 대해 보증하지 않습니다.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-blue-400 mb-2">제10조 (정보의 제공 및 광고의 게재)</h4>
                                    <p>회사는 서비스의 운영과 관련하여 서비스 화면, 홈페이지, 이메일 등에 광고를 게재할 수 있습니다.</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-white mb-4">제5장 저작권 및 이용제한</h3>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-blue-400 mb-2">제11조 (저작권의 귀속)</h4>
                                    <p>1. 회사가 작성한 저작물에 대한 저작권 및 기타 지적재산권은 회사에 귀속됩니다.</p>
                                    <p>2. 회원은 서비스를 이용함으로써 얻은 정보 중 회사에게 지적재산권이 귀속된 정보를 회사의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안 됩니다.</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-white mb-4">제6장 손해배상 및 기타사항</h3>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-blue-400 mb-2">제12조 (책임제한)</h4>
                                    <p>1. 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</p>
                                    <p>2. 회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.</p>
                                    <p>3. 회사는 회원이 서비스와 관련하여 게재한 정보, 자료, 사실의 신뢰도, 정확성 등의 내용에 관하여는 책임을 지지 않습니다.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-blue-400 mb-2">제13조 (재판권 및 준거법)</h4>
                                    <p>회사와 회원 간에 발생한 전자상거래 분쟁에 관한 소송은 제소 당시의 회원의 주소에 의하고, 주소가 없는 경우에는 거소를 관할하는 지방법원의 전속관할로 합니다.</p>
                                </div>
                            </div>
                        </section>

                        <section className="border-t border-white/10 pt-8 mt-8">
                            <h3 className="text-xl font-bold text-white mb-4">부칙</h3>
                            <p>제1조 (시행일) 본 약관은 2026년 2월 6일부터 시행합니다.</p>
                            <p>제2조 (운영정책) 본 약관에 명시되지 않은 사항은 '개인정보처리방침' 및 관련 법령, 상관례에 따릅니다.</p>
                        </section>

                        <section className="mt-8 text-gray-500 text-xs">
                            <p>문의처: contact@trnt.app</p>
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
