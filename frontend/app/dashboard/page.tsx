'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Sparkles, BookOpen, LogOut, User } from 'lucide-react';

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

  const handleLogout = async () => {
    await logout();
    router.push('/');
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <img src="/logo.svg" alt="TRNT Logo" className="w-10 h-10 object-contain" />
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">TRNT</h1>
            </Link>

            <div className="flex items-center space-x-4">
              <span className="text-gray-900 font-medium">안녕하세요, {user.name}님</span>
              <Button onClick={handleLogout} variant="ghost" size="sm" className="text-gray-900 font-bold hover:bg-gray-100">
                <LogOut className="w-4 h-4 mr-2" />
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">대시보드</h2>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Link
              href="/scenarios/new"
              className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <Sparkles className="w-6 h-6 text-blue-700" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-black">새 시나리오 생성</h3>
              <p className="text-gray-900 font-medium leading-relaxed">
                인생의 분기점을 선택하고 평행세계 이야기를 만들어보세요
              </p>
              <div className="mt-4 text-blue-600 font-medium group-hover:underline">
                시작하기 →
              </div>
            </Link>

            <Link
              href="/scenarios"
              className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                <BookOpen className="w-6 h-6 text-purple-700" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-black">내 시나리오</h3>
              <p className="text-gray-900 font-medium leading-relaxed">
                지금까지 생성한 평행세계 이야기들을 다시 읽어보세요
              </p>
              <div className="mt-4 text-purple-600 font-medium group-hover:underline">
                목록 보기 →
              </div>
            </Link>
          </div>

          {/* User Info Card */}
          <div className="bg-white p-8 rounded-xl shadow-md">
            <div className="flex items-center mb-6">
              <div className="bg-gray-200 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                <User className="w-6 h-6 text-gray-900" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-black">{user.name}</h3>
                <p className="text-gray-900 font-medium">{user.email || '카카오 로그인'}</p>
              </div>
            </div>

            <div className="border-t-2 border-gray-100 pt-6 space-y-4 text-base">
              <div className="flex justify-between items-center">
                <span className="text-gray-900 font-bold">출생연도</span>
                <span className="text-black font-extrabold bg-gray-50 px-2 py-1 rounded">
                  {user.birth_year > 0 ? `${user.birth_year}년생` : '미입력'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-900 font-bold">직업</span>
                <span className="text-black font-extrabold bg-gray-50 px-2 py-1 rounded">
                  {user.occupation || '미입력'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-900 font-bold">가입 방식</span>
                <span className="text-black font-extrabold bg-gray-50 px-2 py-1 rounded">
                  {user.auth_provider === 'email' ? '이메일' : '카카오'}
                </span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t-2 border-gray-100">
              <p className="text-base text-black mb-3 font-black">배경 스토리</p>
              <p className="text-gray-900 font-medium leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-200">
                {user.life_background || '등록된 배경 스토리가 없습니다.'}
              </p>
            </div>
          </div>

          {/* Rate Limit Info */}
          <div className="mt-8 bg-blue-100 border-2 border-blue-300 rounded-xl p-5 text-center shadow-sm">
            <p className="text-blue-900 font-bold text-lg">
              💡 매일 무료로 <span className="text-blue-700 underline decoration-2">3회</span>까지 시나리오를 생성할 수 있습니다
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
