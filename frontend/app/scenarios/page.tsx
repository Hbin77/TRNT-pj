'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { scenarioAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Sparkles, Calendar, BookOpen, Trash2 } from 'lucide-react';
import type { ScenarioListItem } from '@/types';

export default function ScenariosPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [scenarios, setScenarios] = useState<ScenarioListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const response = await scenarioAPI.list();
        setScenarios(response.scenarios);
      } catch {
        // ignore error
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchScenarios();
    }
  }, [isAuthenticated]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault(); // 링크 클릭 방지
    if (!confirm('정말로 이 시나리오를 삭제하시겠습니까?')) return;

    try {
      await scenarioAPI.delete(id);
      setScenarios(scenarios.filter((s) => s.id !== id));
    } catch (error) {
      alert('삭제에 실패했습니다.');
    }
  };

  if (authLoading || (isLoading && isAuthenticated)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <img src="/logo.svg" alt="TRNT Logo" className="w-8 h-8 object-contain" />
              <span className="text-xl font-bold text-gray-900">TRNT</span>
            </Link>
            <div className="h-6 w-px bg-gray-200 mx-2"></div>
            <h1 className="text-xl font-bold text-gray-900">내 시나리오 목록</h1>
          </div>
          <Link href="/scenarios/new">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Sparkles className="w-4 h-4 mr-2" />
              새 시나리오
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {scenarios.length === 0 && !isLoading ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">저장된 시나리오가 없습니다</h3>
              <p className="text-gray-600 mb-8">첫 번째 평행세계 시나리오를 생성해보세요!</p>
              <Link href="/scenarios/new">
                <Button className="bg-blue-600 hover:bg-blue-700 font-bold">
                  시작하기
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {scenarios.map((scenario) => (
                <Link
                  key={scenario.id}
                  href={`/scenarios/${scenario.id}`}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group relative"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center text-sm text-gray-900 font-bold mb-1">
                      <Calendar className="w-4 h-4 mr-1 text-gray-600" />
                      {new Date(scenario.created_at).toLocaleDateString()}
                    </div>
                    <button
                      onClick={(e) => handleDelete(scenario.id, e)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-lg font-extrabold text-black">
                      {scenario.branch_data.original_choice} → {scenario.branch_data.alternative_choice}
                    </h4>
                    <p className="text-gray-900 line-clamp-2 leading-relaxed">
                      {scenario.branch_data.context || '상세 내용 없음'}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-blue-50 text-blue-800 text-xs font-bold rounded border border-blue-100">
                      {scenario.genre}
                    </span>
                    <span className="px-2 py-1 bg-purple-50 text-purple-800 text-xs font-bold rounded border border-purple-100">
                      {scenario.tone}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-bold rounded border border-gray-200">
                      {scenario.word_count} 단어
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
