'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { ArrowLeft, Users, BookOpen, TrendingUp, Calendar, Trash2, ChevronRight, RefreshCw, Shield, Mail, MessageCircle } from 'lucide-react';

interface Stats {
  total_users: number;
  total_scenarios: number;
  today_new_users: number;
  today_scenarios: number;
  verified_users: number;
  auth_providers: { email: number; kakao: number; google: number };
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  auth_provider: string;
  is_verified: boolean;
  is_active: boolean;
  birth_year: number;
  occupation: string;
  residence: string;
  scenario_count: number;
  created_at: string;
}

interface UserDetail extends AdminUser {
  personality: string;
  values: string;
  scenarios: {
    id: string;
    genre: string;
    tone: string;
    rating: string | null;
    word_count: number;
    created_at: string;
  }[];
}

const PROVIDER_LABEL: Record<string, string> = {
  email: '이메일',
  kakao: '카카오',
  google: '구글',
};
const PROVIDER_COLOR: Record<string, string> = {
  email: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  kakao: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  google: 'bg-red-500/20 text-red-300 border-red-500/30',
};

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, fetchUser } = useAuthStore();

  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isLoading, isAuthenticated, router]);

  const loadData = useCallback(async () => {
    setIsDataLoading(true);
    setError(null);
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users?limit=100'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users);
      setTotalUsers(usersRes.data.total);
    } catch (e: unknown) {
      const status = (e as { response?: { status: number } }).response?.status;
      if (status === 403) {
        setError('관리자 권한이 없습니다.');
      } else {
        setError('데이터를 불러오는데 실패했습니다.');
      }
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && !isLoading) loadData();
  }, [isAuthenticated, isLoading, loadData]);

  const loadUserDetail = async (userId: string) => {
    try {
      const res = await api.get(`/admin/users/${userId}`);
      setSelectedUser(res.data);
    } catch {
      alert('상세 정보를 불러오는데 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api.delete(`/admin/users/${deleteTarget.id}`);
      setUsers(prev => prev.filter(u => u.id !== deleteTarget.id));
      setTotalUsers(prev => prev - 1);
      if (selectedUser?.id === deleteTarget.id) setSelectedUser(null);
      setDeleteTarget(null);
      if (stats) setStats({ ...stats, total_users: stats.total_users - 1 });
    } catch {
      alert('삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading || isDataLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500" />
          <p className="text-white/40 text-sm">관리자 데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-white text-lg font-bold mb-2">{error}</p>
          <Link href="/dashboard" className="text-blue-400 text-sm hover:underline">대시보드로 돌아가기</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0A0A0F]/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-white/40 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <span className="font-bold text-white">관리자 패널</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/40 text-sm">{user?.name} ({user?.email})</span>
            <button
              onClick={loadData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all text-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              새로고침
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 pt-24 pb-16">

        {/* 통계 카드 */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: '총 회원', value: stats.total_users, sub: `인증 ${stats.verified_users}명`, icon: Users, color: 'from-blue-500/20 to-blue-600/10 border-blue-500/20' },
              { label: '총 시나리오', value: stats.total_scenarios, sub: '누적 생성', icon: BookOpen, color: 'from-purple-500/20 to-purple-600/10 border-purple-500/20' },
              { label: '오늘 신규 가입', value: stats.today_new_users, sub: '명', icon: TrendingUp, color: 'from-green-500/20 to-green-600/10 border-green-500/20' },
              { label: '오늘 시나리오', value: stats.today_scenarios, sub: '건 생성', icon: Calendar, color: 'from-orange-500/20 to-orange-600/10 border-orange-500/20' },
            ].map((card) => (
              <div key={card.label} className={`bg-gradient-to-br ${card.color} border rounded-2xl p-5`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white/50 text-xs font-medium">{card.label}</span>
                  <card.icon className="w-4 h-4 text-white/30" />
                </div>
                <div className="text-3xl font-black text-white">{card.value}</div>
                <div className="text-white/40 text-xs mt-1">{card.sub}</div>
              </div>
            ))}
          </div>
        )}

        {/* 가입 경로 통계 */}
        {stats && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8 flex items-center gap-8">
            <span className="text-white/50 text-sm font-medium">가입 경로</span>
            {Object.entries(stats.auth_providers).map(([provider, count]) => (
              <div key={provider} className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full border text-xs font-medium ${PROVIDER_COLOR[provider]}`}>
                  {PROVIDER_LABEL[provider]}
                </span>
                <span className="text-white font-bold">{count}명</span>
              </div>
            ))}
          </div>
        )}

        {/* 회원 목록 + 상세 패널 */}
        <div className="flex gap-6">

          {/* 회원 목록 테이블 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-lg">회원 목록</h2>
              <span className="text-white/40 text-sm">총 {totalUsers}명</span>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              {/* 테이블 헤더 */}
              <div className="grid grid-cols-[1fr_1fr_80px_60px_60px_36px] gap-3 px-5 py-3 border-b border-white/5 text-xs text-white/30 font-medium uppercase tracking-wider">
                <div>이름 / 이메일</div>
                <div>직업 / 거주지</div>
                <div>가입 경로</div>
                <div className="text-center">시나리오</div>
                <div className="text-center">가입일</div>
                <div />
              </div>

              {/* 테이블 바디 */}
              <div className="divide-y divide-white/5">
                {users.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => loadUserDetail(u.id)}
                    className={`grid grid-cols-[1fr_1fr_80px_60px_60px_36px] gap-3 px-5 py-3.5 cursor-pointer hover:bg-white/5 transition-colors group ${selectedUser?.id === u.id ? 'bg-white/5' : ''}`}
                  >
                    {/* 이름/이메일 */}
                    <div className="min-w-0">
                      <div className="text-white text-sm font-medium truncate">{u.name}</div>
                      <div className="text-white/40 text-xs truncate flex items-center gap-1">
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        {u.email}
                      </div>
                    </div>

                    {/* 직업/거주지 */}
                    <div className="min-w-0">
                      <div className="text-white/70 text-sm truncate">{u.occupation}</div>
                      <div className="text-white/30 text-xs truncate">{u.residence} · {u.birth_year}년생</div>
                    </div>

                    {/* 가입 경로 */}
                    <div className="flex items-center">
                      <span className={`px-2 py-0.5 rounded-full border text-xs font-medium ${PROVIDER_COLOR[u.auth_provider]}`}>
                        {PROVIDER_LABEL[u.auth_provider]}
                      </span>
                    </div>

                    {/* 시나리오 수 */}
                    <div className="flex items-center justify-center">
                      <span className="text-white/70 text-sm font-bold">{u.scenario_count}</span>
                    </div>

                    {/* 가입일 */}
                    <div className="flex items-center justify-center">
                      <span className="text-white/30 text-xs">
                        {new Date(u.created_at).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}
                      </span>
                    </div>

                    {/* 화살표 */}
                    <div className="flex items-center justify-center">
                      <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 사용자 상세 패널 */}
          {selectedUser && (
            <div className="w-80 flex-shrink-0">
              <div className="sticky top-24 bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-white font-bold text-base">{selectedUser.name}</h3>
                    <p className="text-white/40 text-xs mt-0.5">{selectedUser.email}</p>
                  </div>
                  <button
                    onClick={() => setDeleteTarget(selectedUser)}
                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/20 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* 기본 정보 */}
                <div className="space-y-2 mb-5">
                  {[
                    ['가입 경로', PROVIDER_LABEL[selectedUser.auth_provider]],
                    ['인증 상태', selectedUser.is_verified ? '✓ 인증완료' : '✗ 미인증'],
                    ['출생연도', `${selectedUser.birth_year}년생`],
                    ['직업', selectedUser.occupation],
                    ['거주지', selectedUser.residence],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between text-xs">
                      <span className="text-white/30">{label}</span>
                      <span className="text-white/70">{value}</span>
                    </div>
                  ))}
                </div>

                {/* 시나리오 목록 */}
                <div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <MessageCircle className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-white/50 text-xs font-medium">시나리오 ({selectedUser.scenarios.length})</span>
                  </div>
                  <div className="space-y-1.5 max-h-64 overflow-y-auto">
                    {selectedUser.scenarios.length === 0 && (
                      <p className="text-white/20 text-xs text-center py-4">없음</p>
                    )}
                    {selectedUser.scenarios.map((s) => (
                      <div key={s.id} className="bg-white/5 rounded-lg px-3 py-2">
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1.5">
                            <span className="text-white/50 text-xs">{s.genre}</span>
                            <span className="text-white/30 text-xs">·</span>
                            <span className="text-white/50 text-xs">{s.tone}</span>
                          </div>
                          <span className={`text-xs ${s.rating === 'like' ? 'text-green-400' : s.rating === 'dislike' ? 'text-red-400' : 'text-white/20'}`}>
                            {s.rating === 'like' ? '👍' : s.rating === 'dislike' ? '👎' : '—'}
                          </span>
                        </div>
                        <div className="text-white/20 text-[0.625rem] mt-0.5">
                          {s.word_count}자 · {new Date(s.created_at).toLocaleDateString('ko-KR')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 삭제 확인 모달 */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#12121A] border border-white/10 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-bold">회원 강제 탈퇴</h3>
                <p className="text-white/40 text-xs">{deleteTarget.name} ({deleteTarget.email})</p>
              </div>
            </div>
            <p className="text-white/60 text-sm mb-6 leading-relaxed">
              이 회원과 관련된 <strong className="text-white">시나리오 {deleteTarget.scenario_count}개</strong>가 모두 삭제됩니다.<br />
              복구할 수 없습니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors text-sm font-medium"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {isDeleting ? '처리중...' : '탈퇴시키기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
