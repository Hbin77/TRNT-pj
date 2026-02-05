'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { scenarioAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Sparkles, Info, Loader2 } from 'lucide-react';
import type { ScenarioRequest } from '@/types';

export default function NewScenarioPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<{
    occurred_at: string;
    original_choice: string;
    alternative_choice: string;
    context: string;
    tone: 'realistic' | 'optimistic' | 'pessimistic';
    genre: 'drama' | 'success' | 'healing' | 'romance';
    detail_level: 'normal' | 'summary' | 'novel';
  }>({
    occurred_at: '',
    original_choice: '',
    alternative_choice: '',
    context: '',
    tone: 'realistic',
    genre: 'drama',
    detail_level: 'normal',
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const requestData: ScenarioRequest = {
        branch: {
          occurred_at: formData.occurred_at,
          original_choice: formData.original_choice,
          alternative_choice: formData.alternative_choice,
          context: formData.context,
        },
        tone: formData.tone,
        genre: formData.genre,
        detail_level: formData.detail_level,
      };

      const result = await scenarioAPI.generate(requestData);
      router.push(`/scenarios/${result.scenario_id || ''}`);
    } catch (error) {
      console.error('Generation failed:', error);
      alert('시나리오 생성에 실패했습니다. 일일 제한을 초과했거나 서버 오류일 수 있습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Link href="/dashboard" className="flex items-center space-x-2 mr-6">
            <Image src="/logo.svg" alt="TRNT Logo" width={32} height={32} className="object-contain" />
            <span className="text-xl font-bold text-gray-900">TRNT</span>
          </Link>
          <div className="h-6 w-px bg-gray-200 mr-6"></div>
          <h1 className="text-xl font-bold text-gray-900">새 시나리오 생성</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Branch Information Card */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-6">
              <div className="flex items-center space-x-2 mb-2">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Info className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-black text-black">인생의 분기점 정보</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-black text-gray-900 mb-1">언제 일어난 일인가요?</label>
                  <Input
                    placeholder="예: 2015년 여름, 대학교 2학년 때"
                    value={formData.occurred_at}
                    onChange={(e) => setFormData({ ...formData, occurred_at: e.target.value })}
                    required
                    className="font-medium text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-gray-900 mb-1">원래 어떤 선택을 했나요?</label>
                  <Input
                    placeholder="예: 안정적인 대기업 취업을 선택함"
                    value={formData.original_choice}
                    onChange={(e) => setFormData({ ...formData, original_choice: e.target.value })}
                    required
                    className="font-medium text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-gray-900 mb-1">만약 어떤 선택을 했다면?</label>
                  <Input
                    placeholder="예: 하고 싶었던 스타트업 창업을 선택함"
                    value={formData.alternative_choice}
                    onChange={(e) => setFormData({ ...formData, alternative_choice: e.target.value })}
                    required
                    className="font-medium text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-gray-900 mb-1">상황을 더 자세히 설명해주세요 (선택사항)</label>
                  <Textarea
                    placeholder="당시의 고민이나 주변 상황을 적어주시면 더 정확한 시나리오가 생성됩니다."
                    rows={4}
                    value={formData.context}
                    onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                    className="font-medium text-black"
                  />
                </div>
              </div>
            </section>

            {/* AI Style Options */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-6">
              <div className="flex items-center space-x-2 mb-2">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-black text-black">시나리오 스타일 설정</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-black text-gray-900 mb-2">장르</label>
                  <select
                    className="w-full bg-white border border-gray-200 rounded-lg p-3 text-black font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value as 'drama' | 'success' | 'healing' | 'romance' })}
                  >
                    <option value="drama">드라마 (현실적)</option>
                    <option value="success">성공 (카타르시스)</option>
                    <option value="healing">힐링 (따뜻함)</option>
                    <option value="romance">로맨스 (감성적)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-black text-gray-900 mb-2">분위기</label>
                  <select
                    className="w-full bg-white border border-gray-200 rounded-lg p-3 text-black font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={formData.tone}
                    onChange={(e) => setFormData({ ...formData, tone: e.target.value as 'realistic' | 'optimistic' | 'pessimistic' })}
                  >
                    <option value="realistic">현실적인</option>
                    <option value="optimistic">낙관적인</option>
                    <option value="pessimistic">비관적인 (교훈적)</option>
                  </select>
                </div>
              </div>
            </section>

            <Button
              type="submit"
              disabled={isGenerating}
              className="w-full h-14 text-lg font-black bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 disabled:bg-gray-400"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                  평행세계 시나리오 생성 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6 mr-2" />
                  시나리오 생성하기
                </>
              )}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
