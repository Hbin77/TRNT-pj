'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { scenarioAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Sparkles, Calendar, BookOpen, Trash2, ArrowLeft } from 'lucide-react';
import type { ScenarioListItem } from '@/types';
import { GlassCard } from '@/components/ui/GlassCard';

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
    e.preventDefault();
    if (!confirm('정말로 이 시나리오를 삭제하시겠습니까?')) return;

    try {
      await scenarioAPI.delete(id);
      setScenarios(scenarios.filter((s) => s.id !== id));
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

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[20%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0A0A0F]/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center text-white/60 hover:text-white transition-colors group">
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">대시보드</span>
          </Link>
          <Link href="/scenarios/new">
            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-blue-900/20">
              <Sparkles className="w-4 h-4 mr-2" />
              새 시나리오
            </Button>
          </Link>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">내 평행세계 목록</h1>
              <p className="text-white/40">지금까지 당신이 선택한 {scenarios.length}개의 다른 삶</p>
            </div>
          </div>

          {scenarios.length === 0 && !isLoading ? (
            <GlassCard className="text-center py-32 border-dashed border-2 border-white/10 bg-white/5">
              <BookOpen className="w-20 h-20 text-white/10 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-2">아직 기록된 역사가 없습니다</h3>
              <p className="text-white/40 mb-8 max-w-md mx-auto">
                첫 번째 분기점을 선택하고, 당신이 살아보지 못한<br />새로운 인생의 이야기를 시작해보세요.
              </p>
              <Link href="/scenarios/new">
                <Button className="bg-white text-black hover:bg-gray-200 font-bold px-8 py-6 text-lg rounded-xl">
                  첫 시나리오 생성하기
                </Button>
              </Link>
            </GlassCard>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {scenarios.map((scenario, index) => (
                  <motion.div
                    key={scenario.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link href={`/scenarios/${scenario.id}`} className="block h-full group">
                      <div className="h-full relative p-[1px] rounded-2xl bg-gradient-to-br from-white/10 to-transparent hover:from-blue-500/50 hover:to-purple-500/50 transition-all duration-300">
                        <div className="bg-[#12121A]/80 backdrop-blur-xl p-6 rounded-2xl h-full flex flex-col relative overflow-hidden group-hover:bg-[#12121A]/60 transition-all">

                          {/* Card Content Top */}
                          <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center space-x-2">
                              <div className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-blue-300">
                                {scenario.genre.toUpperCase()}
                              </div>
                              <div className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-purple-300">
                                {scenario.tone.toUpperCase()}
                              </div>
                            </div>
                            <button
                              onClick={(e) => handleDelete(scenario.id, e)}
                              className="w-8 h-8 flex items-center justify-center rounded-full text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-colors z-20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="mb-6 flex-grow">
                            <div className="flex items-center text-xs text-white/40 mb-3 font-mono">
                              <Calendar className="w-3 h-3 mr-1.5 opacity-70" />
                              {new Date(scenario.created_at).toLocaleDateString()}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 leading-snug group-hover:text-blue-200 transition-colors">
                              {scenario.branch_data.alternative_choice}
                            </h3>
                            <div className="flex items-center text-sm text-white/40">
                              <span className="line-through opacity-50 mr-2 truncate max-w-[120px]">{scenario.branch_data.original_choice}</span>
                              <span className="text-blue-500/80 text-xs">대신 선택</span>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-white/5 flex items-center justify-between text-sm">
                            <span className="text-white/30 truncate max-w-[150px] italic">
                              &quot;{scenario.branch_data.context ? scenario.branch_data.context.substring(0, 15) + '...' : '새로운 운명의 시작'}&quot;
                            </span>
                            <div className="flex items-center text-blue-400 font-medium opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                              읽기 <span className="ml-1">→</span>
                            </div>
                          </div>

                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
