'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { scenarioAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Calendar, Share2, Trash2, BookOpen, Sparkles } from 'lucide-react';
import type { ScenarioDetail } from '@/types';

export default function ScenarioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [scenario, setScenario] = useState<ScenarioDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const fetchScenario = async () => {
      try {
        const data = await scenarioAPI.get(resolvedParams.id);
        setScenario(data);
      } catch (error) {
        console.error('Failed to fetch scenario:', error);
        alert('시나리오를 불러오는 데 실패했습니다.');
        router.push('/scenarios');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchScenario();
    }
  }, [isAuthenticated, resolvedParams.id, router]);

  const handleDelete = async () => {
    if (!confirm('정말로 이 시나리오를 삭제하시겠습니까?')) return;

    try {
      await scenarioAPI.delete(resolvedParams.id);
      router.push('/scenarios');
    } catch {
      alert('삭제에 실패했습니다.');
    } finally { };
  };

  if (authLoading || (isLoading && isAuthenticated)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!scenario) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/scenarios" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-gray-900" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900 truncate max-w-[200px] md:max-w-md">
              시나리오 상세
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => alert('공유 기능은 준비 중입니다.')} className="text-gray-900 font-bold">
              <Share2 className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">공유</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-600 hover:text-red-700 hover:bg-red-50 font-bold">
              <Trash2 className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">삭제</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Branch Summary Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8">
            <div className="flex items-center text-gray-900 font-bold mb-4">
              <Calendar className="w-5 h-5 mr-2 text-gray-600" />
              {new Date(scenario.created_at).toLocaleDateString()} 생성됨
            </div>

            <div className="grid md:grid-cols-2 gap-8 relative">
              <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="bg-blue-50 p-2 rounded-full border-2 border-blue-200 shadow-sm">
                  <ArrowLeft className="w-6 h-6 text-blue-600 rotate-180" />
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-black px-2 py-1 bg-gray-100 text-gray-900 rounded uppercase">원래의 선택</span>
                <p className="text-lg font-extrabold text-black leading-tight">
                  {scenario.branch_data.original_choice}
                </p>
              </div>

              <div className="space-y-2 text-right md:text-left">
                <span className="text-xs font-black px-2 py-1 bg-blue-100 text-blue-900 rounded uppercase">평행세계의 선택</span>
                <p className="text-lg font-extrabold text-blue-700 leading-tight">
                  {scenario.branch_data.alternative_choice}
                </p>
              </div>
            </div>

            {scenario.branch_data.context && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-sm font-black text-gray-900 mb-2">당시 상황</p>
                <p className="text-gray-800 font-medium leading-relaxed italic">&quot;{scenario.branch_data.context}&quot;</p>
              </div>
            )}
          </div>

          {/* Scenario Text Section */}
          <div className="bg-white p-8 md:p-12 rounded-2xl shadow-md border border-gray-200">
            <div className="flex items-center space-x-3 mb-8">
              <div className="bg-blue-100 p-2 rounded-xl">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-black">시나리오 결과</h2>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs font-bold text-gray-500 uppercase">{scenario.genre}</span>
                  <span className="text-xs font-bold text-gray-500">•</span>
                  <span className="text-xs font-bold text-gray-500 uppercase">{scenario.tone}</span>
                </div>
              </div>
            </div>

            <div className="prose prose-blue max-w-none">
              <p className="text-gray-900 text-lg leading-[1.8] font-medium whitespace-pre-wrap">
                {scenario.scenario_text}
              </p>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-100 flex justify-center">
              <Link href="/scenarios/new">
                <Button className="bg-blue-600 hover:bg-blue-700 font-black px-8 py-6 h-auto text-lg rounded-xl">
                  <Sparkles className="w-5 h-5 mr-2" />
                  또 다른 평행세계 확인하기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
