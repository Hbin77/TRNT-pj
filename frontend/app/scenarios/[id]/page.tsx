'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { scenarioAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Calendar, Share2, Trash2, BookOpen, Sparkles, Quote } from 'lucide-react';
import type { ScenarioDetail } from '@/types';
import { GlassCard } from '@/components/ui/GlassCard';

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
    }
  };

  if (authLoading || (isLoading && isAuthenticated)) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-white/60 text-sm animate-pulse">평행세계를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!scenario) return null;

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0A0A0F]/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/scenarios" className="flex items-center text-white/60 hover:text-white transition-colors group">
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">목록으로</span>
          </Link>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => alert('공유 기능은 준비 중입니다.')} className="text-white/60 hover:text-white hover:bg-white/10">
              <Share2 className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">공유</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
              <Trash2 className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">삭제</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 pt-28 pb-20">
        <div className="max-w-4xl mx-auto space-y-8">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Branch Summary Card */}
            <GlassCard className="p-8 border border-white/10 bg-white/5 backdrop-blur-xl mb-8">
              <div className="flex items-center text-white/40 text-sm mb-6 font-mono">
                <Calendar className="w-4 h-4 mr-2 opacity-70" />
                {new Date(scenario.created_at).toLocaleDateString()} 생성됨
              </div>

              <div className="grid md:grid-cols-2 gap-8 relative items-center">
                <div className="flex flex-col space-y-4 md:text-right border-r border-white/10 pr-8 border-none md:border-solid">
                  <div className="inline-flex self-start md:self-end items-center px-3 py-1 rounded-full bg-white/5 border border-white/10">
                    <span className="text-xs font-bold text-white/40 uppercase tracking-wider">Original Timeline</span>
                  </div>
                  <p className="text-2xl font-bold text-white/60 leading-tight">
                    {scenario.branch_data.original_choice}
                  </p>
                </div>

                <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#0A0A0F] border border-white/10 items-center justify-center z-10">
                  <ArrowLeft className="w-4 h-4 text-blue-500 rotate-180" />
                </div>

                <div className="flex flex-col space-y-4 pl-8 md:pl-0 border-l border-white/10 md:border-none pl-4 md:pl-0 ml-4 md:ml-0 md:pl-8">
                  <div className="inline-flex self-start items-center px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                    <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">New Timeline</span>
                  </div>
                  <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 leading-tight shadow-blue-500/20 drop-shadow-lg">
                    {scenario.branch_data.alternative_choice}
                  </p>
                </div>
              </div>

              {scenario.branch_data.context && (
                <div className="mt-8 pt-8 border-t border-white/10 relative">
                  <Quote className="absolute top-8 left-0 w-8 h-8 text-white/5 -translate-y-1/2 -translate-x-2" />
                  <p className="text-white/60 italic leading-relaxed pl-8 border-l-2 border-white/10">
                    &quot;{scenario.branch_data.context}&quot;
                  </p>
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* Scenario Text Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="glass p-8 md:p-12 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-32 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

              <div className="flex items-center space-x-4 mb-10 relative z-10">
                <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-3 rounded-xl border border-white/10 shadow-inner">
                  <BookOpen className="w-6 h-6 text-blue-300" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">시나리오 결과</h2>
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-0.5 bg-white/5 rounded text-xs font-medium text-white/40 uppercase tracking-wider border border-white/5">{scenario.genre}</span>
                    <span className="px-2 py-0.5 bg-white/5 rounded text-xs font-medium text-white/40 uppercase tracking-wider border border-white/5">{scenario.tone}</span>
                  </div>
                </div>
              </div>

              <div className="prose prose-invert prose-lg max-w-none">
                <p className="text-gray-300 leading-loose font-serif tracking-wide whitespace-pre-wrap">
                  {scenario.scenario_text}
                </p>
              </div>

              <div className="mt-16 pt-8 border-t border-white/5 flex justify-center">
                <Link href="/scenarios/new">
                  <Button className="bg-white text-black hover:bg-gray-200 font-bold px-8 py-6 h-auto text-lg rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all hover:scale-105">
                    <Sparkles className="w-5 h-5 mr-3 text-yellow-600" />
                    또 다른 평행세계 확인하기
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
