'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { scenarioAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Sparkles, ArrowLeft, Loader2, Calendar } from 'lucide-react';
import type { ScenarioRequest } from '@/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { AxiosError } from 'axios';

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
    } catch (err: unknown) {
      console.error('Generation failed:', err);
      const axiosErr = err as AxiosError<{ error?: { message: string }; detail?: string | [] }>;
      let message = '시나리오 생성에 실패했습니다.';
      if (axiosErr.response?.data?.error?.message) {
        message = axiosErr.response.data.error.message;
      } else if (typeof axiosErr.response?.data?.detail === 'string') {
        message = axiosErr.response.data.detail;
      }
      alert(message);
    } finally {
      setIsGenerating(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0A0A0F]/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Link href="/dashboard" className="flex items-center text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-medium">대시보드로 돌아가기</span>
          </Link>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 pt-28 pb-20">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              새로운 평행세계 설계
            </h1>
            <p className="text-white/60 text-lg">
              과거의 결정적인 순간으로 돌아가 다른 선택을 해보세요.<br />
              AI가 당신의 새로운 운명을 그려드립니다.
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Core Branch Info */}
            <GlassCard className="border border-white/10 bg-white/5 backdrop-blur-xl">
              <div className="flex items-center space-x-3 mb-8">
                <div className="bg-blue-500/20 p-2.5 rounded-lg border border-blue-500/30">
                  <Calendar className="w-6 h-6 text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-white">분기점 설정</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-200 ml-1">언제 일어난 일인가요?</label>
                  <Input
                    placeholder="예: 2015년 여름, 대학교 2학년 때"
                    value={formData.occurred_at}
                    onChange={(e) => setFormData({ ...formData, occurred_at: e.target.value })}
                    required
                    className="bg-black/20 border-white/10 text-white placeholder:text-white/20 focus:border-blue-500/50 focus:ring-blue-500/20 h-12 text-lg"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400 ml-1">원래 어떤 선택을 했나요?</label>
                    <Input
                      placeholder="예: 취업 준비를 선택함"
                      value={formData.original_choice}
                      onChange={(e) => setFormData({ ...formData, original_choice: e.target.value })}
                      required
                      className="bg-black/20 border-white/10 text-white placeholder:text-white/20 focus:border-white/30 h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-blue-400 ml-1">만약 어떤 선택을 했다면?</label>
                    <Input
                      placeholder="예: 세계 여행을 떠남"
                      value={formData.alternative_choice}
                      onChange={(e) => setFormData({ ...formData, alternative_choice: e.target.value })}
                      required
                      className="bg-blue-900/10 border-blue-500/30 text-white placeholder:text-white/20 focus:border-blue-500/60 focus:ring-blue-500/20 h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-sm font-medium text-gray-400 ml-1 flex items-center">
                    상황 설명 <span className="text-xs text-white/30 ml-2">(선택사항)</span>
                  </label>
                  <Textarea
                    placeholder="당시의 고민이나 주변 상황을 구체적으로 적어주시면 더 몰입감 있는 시나리오가 생성됩니다."
                    rows={4}
                    value={formData.context}
                    onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                    className="bg-black/20 border-white/10 text-white placeholder:text-white/20 focus:border-white/30 resize-none min-h-[120px]"
                  />
                </div>
              </div>
            </GlassCard>

            {/* Style Configuration */}
            <GlassCard className="border border-white/10 bg-white/5 backdrop-blur-xl" delay={0.1}>
              <div className="flex items-center space-x-3 mb-8">
                <div className="bg-purple-500/20 p-2.5 rounded-lg border border-purple-500/30">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                </div>
                <h2 className="text-xl font-bold text-white">시나리오 스타일</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-3 ml-1">장르</label>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { value: 'drama', label: '드라마', desc: '현실적 전개' },
                      { value: 'success', label: '성공 신화', desc: '카타르시스' },
                      { value: 'healing', label: '힐링', desc: '따뜻한 위로' },
                      { value: 'romance', label: '로맨스', desc: '감성적인' },
                    ] as const).map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, genre: option.value })}
                        className={`p-3 rounded-xl border text-left transition-all ${formData.genre === option.value
                          ? 'bg-purple-500/20 border-purple-500/50 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                          : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
                          }`}
                      >
                        <div className={`font-bold ${formData.genre === option.value ? 'text-purple-300' : ''}`}>
                          {option.label}
                        </div>
                        <div className="text-xs opacity-60 mt-1">{option.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-3 ml-1">분위기</label>
                  <div className="space-y-3">
                    {([
                      { value: 'realistic', label: '현실적인', sub: '개연성 중시' },
                      { value: 'optimistic', label: '낙관적인', sub: '희망찬 미래' },
                      { value: 'pessimistic', label: '비관적인', sub: '냉혹한 교훈' },
                    ] as const).map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, tone: option.value })}
                        className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all ${formData.tone === option.value
                          ? 'bg-purple-500/20 border-purple-500/50 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                          : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
                          }`}
                      >
                        <span className={`font-bold ${formData.tone === option.value ? 'text-purple-300' : ''}`}>
                          {option.label}
                        </span>
                        <span className="text-xs opacity-60">{option.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                disabled={isGenerating}
                className="w-full h-16 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-xl shadow-blue-900/20 border border-white/10 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 blur-xl" />
                <div className="relative flex items-center justify-center">
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                      <span className="animate-pulse">평행세계 시나리오 생성 중...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
                      시나리오 생성 시작하기
                    </>
                  )}
                </div>
              </Button>
            </motion.div>
          </form>
        </div>
      </main>
    </div>
  );
}
