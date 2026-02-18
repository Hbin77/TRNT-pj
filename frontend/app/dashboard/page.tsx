'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { userAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Sparkles, BookOpen, LogOut, User } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

/** personality raw 문자열에서 MBTI와 성격 키워드를 추출 */
function parsePersonality(raw: string | undefined) {
  if (!raw) return { mbti: '-', keywords: [] };
  const parts = raw.split('|');
  const mbti = (parts.length > 1 && /^[EI][SN][TF][JP]$/.test(parts[1]?.trim())) ? parts[1].trim() : '-';
  const keywords = parts.length > 2 ? parts[2].split(',').map(k => k.trim()).filter(Boolean) : [];
  return { mbti, keywords };
}

/** 대각선 시나리오 비 애니메이션 아이템 */
const rainItems = [
  { text: '만약 그때 다른 선택을 했다면...', left: '5%', duration: 22, delay: 0, direction: 'diagonal-rain-down', fontSize: '0.75rem', className: 'text-white/[0.12]' },
  { text: '평행세계의 나는 어떤 삶을 살고 있을까', left: '25%', duration: 28, delay: 4, direction: 'diagonal-rain-up', fontSize: '0.8125rem', className: 'text-white/[0.08]' },
  { text: '후회 없는 선택은 없다', left: '50%', duration: 18, delay: 8, direction: 'diagonal-rain-down', fontSize: '0.875rem', className: 'text-white/[0.15]' },
  { text: '1998년, 서울의 어느 골목길에서', left: '70%', duration: 25, delay: 2, direction: 'diagonal-rain-up', fontSize: '0.75rem', className: 'text-white/[0.1]' },
  { text: '돌아갈 수 없는 그 순간으로', left: '15%', duration: 20, delay: 12, direction: 'diagonal-rain-up', fontSize: '0.8125rem', className: 'text-white/[0.15]' },
  { text: '당신의 이야기는 아직 끝나지 않았다', left: '85%', duration: 30, delay: 6, direction: 'diagonal-rain-down', fontSize: '0.75rem', className: 'text-white/[0.08]' },
  { text: '선택의 갈림길', left: '40%', duration: 16, delay: 10, direction: 'diagonal-rain-down', fontSize: '0.875rem', className: 'text-white/[0.12]' },
  { text: '또 다른 가능성', left: '60%', duration: 24, delay: 14, direction: 'diagonal-rain-up', fontSize: '0.75rem', className: 'text-white/[0.1]' },
  { text: '그날의 선택이 모든 것을 바꿨다', left: '35%', duration: 26, delay: 3, direction: 'diagonal-rain-down', fontSize: '0.8125rem', className: 'text-white/[0.08]' },
  { text: '시간을 되돌릴 수 있다면', left: '90%', duration: 19, delay: 9, direction: 'diagonal-rain-up', fontSize: '0.75rem', className: 'text-white/[0.12]' },
  { text: '운명의 분기점에서', left: '10%', duration: 27, delay: 7, direction: 'diagonal-rain-down', fontSize: '0.875rem', className: 'text-white/[0.1]' },
  { text: '다시 한번, 그 길 위에 서다', left: '75%', duration: 21, delay: 11, direction: 'diagonal-rain-up', fontSize: '0.8125rem', className: 'text-white/[0.08]' },
];

/** values raw 문자열에서 핵심 가치를 추출 */
function parseCoreValues(raw: string | undefined) {
  if (!raw || !raw.includes('|')) return [];
  const first = raw.split('|')[0];
  return first.split(',').map(v => v.trim()).filter(Boolean);
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, fetchUser, logout } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const profile = useMemo(() => {
    if (!user) return { mbti: '-', keywords: [] as string[], coreValues: [] as string[] };
    const { mbti, keywords } = parsePersonality(user.personality);
    const coreValues = parseCoreValues(user.values);
    return { mbti, keywords, coreValues };
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsDeleting(true);
    try {
      await userAPI.delete(user.id);
      await logout();
      router.push('/');
    } catch {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]" />
      </div>

      {/* Scenario Rain Background */}
      <div className="fixed inset-0 z-0 pointer-events-none select-none overflow-hidden">
        {rainItems.map((item, i) => (
          <span
            key={i}
            className={`absolute whitespace-nowrap ${item.className}`}
            style={{
              left: item.left,
              animation: `${item.direction} ${item.duration}s linear infinite`,
              animationDelay: `${item.delay}s`,
              fontSize: item.fontSize,
            }}
          >
            {item.text}
          </span>
        ))}
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0A0A0F]/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/dashboard">
              <Logo />
            </Link>

            <div className="flex items-center space-x-6">
              <span className="text-white/80 font-medium text-sm hidden md:block">
                반갑습니다, <span className="text-white font-bold">{user.name}</span>님
              </span>
              <Button onClick={handleLogout} variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                <LogOut className="w-4 h-4 mr-2" />
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 pt-32 pb-12">
        <div className="max-w-5xl mx-auto">

          {/* Welcome Message */}
          <div className="mb-12">
            <h2 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              대시보드
            </h2>
            <p className="text-white/60 text-lg">
              당신의 선택으로 만들어질 새로운 이야기를 기다립니다.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Link href="/scenarios/new" className="block group">
              <div className="relative p-[1px] rounded-2xl bg-gradient-to-br from-white/10 to-transparent group-hover:from-blue-500/50 group-hover:to-purple-500/50 transition-all duration-300">
                <div className="bg-[#12121A]/90 backdrop-blur-xl p-8 rounded-2xl h-full relative overflow-hidden group-hover:bg-[#12121A]/80 transition-all">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Sparkles className="w-32 h-32 text-blue-500 transform rotate-12" />
                  </div>

                  <div className="bg-blue-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="w-7 h-7 text-blue-400" />
                  </div>

                  <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-blue-200 transition-colors">새 시나리오 생성</h3>
                  <p className="text-white/60 leading-relaxed mb-6">
                    인생의 중요한 분기점으로 돌아가<br />새로운 선택을 해보세요.
                  </p>

                  <div className="flex items-center text-blue-400 font-medium group-hover:translate-x-1 transition-transform">
                    시작하기 <span className="ml-2">→</span>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/scenarios" className="block group">
              <div className="relative p-[1px] rounded-2xl bg-gradient-to-br from-white/10 to-transparent group-hover:from-purple-500/50 group-hover:to-pink-500/50 transition-all duration-300">
                <div className="bg-[#12121A]/90 backdrop-blur-xl p-8 rounded-2xl h-full relative overflow-hidden group-hover:bg-[#12121A]/80 transition-all">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <BookOpen className="w-32 h-32 text-purple-500 transform -rotate-12" />
                  </div>

                  <div className="bg-purple-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="w-7 h-7 text-purple-400" />
                  </div>

                  <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-purple-200 transition-colors">내 시나리오</h3>
                  <p className="text-white/60 leading-relaxed mb-6">
                    지금까지 기록된<br />당신의 평행세계 이야기입니다.
                  </p>

                  <div className="flex items-center text-purple-400 font-medium group-hover:translate-x-1 transition-transform">
                    목록 보기 <span className="ml-2">→</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* User Info & Stats */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: User Profile */}
            <div className="lg:col-span-2 component-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
                <div className="flex items-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shadow-lg border border-white/10 mr-5">
                    <User className="w-8 h-8 text-white/80" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">{user.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-white/50">
                      <span>{user.email || 'Kakao Account'}</span>
                      <span>•</span>
                      <span>{user.auth_provider === 'email' ? 'Email' : 'Kakao'}</span>
                    </div>
                  </div>
                </div>

                {/* 기본 정보 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="text-xs text-white/40 mb-1">출생연도</div>
                    <div className="text-lg font-bold text-white/90">{user.birth_year}년</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="text-xs text-white/40 mb-1">직업</div>
                    <div className="text-lg font-bold text-white/90">{user.occupation}</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="text-xs text-white/40 mb-1">MBTI</div>
                    <div className="text-lg font-bold text-white/90">{profile.mbti}</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="text-xs text-white/40 mb-1">거주지</div>
                    <div className="text-lg font-bold text-white/90">{user.residence || '-'}</div>
                  </div>
                </div>

                {/* 성격 키워드 + 핵심 가치 */}
                {(profile.keywords.length > 0 || profile.coreValues.length > 0) && (
                  <div className="space-y-4 mb-6">
                    {profile.keywords.length > 0 && (
                      <div>
                        <div className="text-xs text-white/40 mb-2">성격 키워드</div>
                        <div className="flex flex-wrap gap-2">
                          {profile.keywords.map((kw) => (
                            <span key={kw} className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {profile.coreValues.length > 0 && (
                      <div>
                        <div className="text-xs text-white/40 mb-2">핵심 가치</div>
                        <div className="flex flex-wrap gap-2">
                          {profile.coreValues.map((v) => (
                            <span key={v} className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium">
                              {v}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Usage & Info */}
            <div className="component-fade-in space-y-6" style={{ animationDelay: '0.2s' }}>
              <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-lg border border-blue-500/30 rounded-2xl p-6 relative overflow-hidden">
                <div className="relative z-10">
                  <h4 className="text-lg font-bold text-white mb-2">일일 생성 한도</h4>
                  <div className="flex items-end space-x-2 mb-2">
                    <span className="text-4xl font-black text-white">3</span>
                    <span className="text-white/60 mb-1.5">회 / 일</span>
                  </div>
                  <p className="text-white/50 text-sm">매일 자정에 초기화됩니다.</p>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                <h4 className="text-white font-bold mb-4">내 정보 관리</h4>
                <div className="space-y-2">
                  <Link href="/profile/edit" className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-white/60 hover:text-white transition-colors text-sm flex justify-between items-center group">
                    <span>프로필 수정</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </Link>
                  {user.auth_provider === 'email' && (
                  <Link href="/profile/password" className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-white/60 hover:text-white transition-colors text-sm flex justify-between items-center group">
                    <span>비밀번호 변경</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </Link>
                  )}
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400/60 hover:text-red-400 transition-colors text-sm flex justify-between items-center group"
                  >
                    <span>회원 탈퇴</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 회원 탈퇴 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#12121A] border border-white/10 rounded-2xl p-8 max-w-sm w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-3">회원 탈퇴</h3>
            <p className="text-white/60 text-sm mb-6 leading-relaxed">
              탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.<br />정말 탈퇴하시겠습니까?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors text-sm font-medium"
              >
                취소
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {isDeleting ? '처리중...' : '탈퇴하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
