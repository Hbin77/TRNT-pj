'use client';

import { useEffect, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { scenarioAPI, parseBlobError } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import Image from 'next/image';
import { ArrowLeft, Calendar, Share2, Trash2, BookOpen, Sparkles, Quote, ThumbsUp, ThumbsDown, PenLine, X, Loader2, Volume2, ImageIcon, Lock } from 'lucide-react';
import type { ScenarioDetail } from '@/types';
import { GlassCard } from '@/components/ui/GlassCard';

export default function ScenarioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [scenario, setScenario] = useState<ScenarioDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rating, setRating] = useState<string | null>(null);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);

  // TTS 상태
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isTTSLoading, setIsTTSLoading] = useState(false);

  // 커버 이미지 상태
  const [isCoverLoading, setIsCoverLoading] = useState(false);

  // 이어쓰기 상태
  const [showContinueModal, setShowContinueModal] = useState(false);
  const [continuationDirection, setContinuationDirection] = useState('');
  const [isContinuing, setIsContinuing] = useState(false);
  const [isStreamingContinuation, setIsStreamingContinuation] = useState(false);
  const [streamedContinuation, setStreamedContinuation] = useState('');
  const streamRef = useRef<HTMLDivElement>(null);

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
        setRating(data.rating || null);
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

  // 이어쓰기 스트리밍 자동 스크롤
  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight;
    }
  }, [streamedContinuation]);

  const handleDelete = async () => {
    if (!confirm('정말로 이 시나리오를 삭제하시겠습니까?')) return;

    try {
      await scenarioAPI.delete(resolvedParams.id);
      router.push('/scenarios');
    } catch {
      alert('삭제에 실패했습니다.');
    }
  };

  const handleFeedback = async (newRating: 'like' | 'dislike') => {
    setIsFeedbackLoading(true);
    try {
      await scenarioAPI.feedback(resolvedParams.id, { rating: newRating });
      setRating(newRating);
    } catch {
      alert('피드백 전송에 실패했습니다.');
    } finally {
      setIsFeedbackLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!continuationDirection.trim()) return;
    setIsContinuing(true);
    setIsStreamingContinuation(true);
    setStreamedContinuation('');
    setShowContinueModal(false);

    try {
      await scenarioAPI.continueScenarioStream(
        resolvedParams.id,
        { continuation_direction: continuationDirection },
        (content) => {
          setStreamedContinuation((prev) => prev + content);
        },
        (newScenarioId) => {
          setTimeout(() => {
            router.push(`/scenarios/${newScenarioId}`);
          }, 2000);
        },
        (errorMessage) => {
          alert(errorMessage || '이어쓰기에 실패했습니다.');
          setIsContinuing(false);
          setIsStreamingContinuation(false);
        }
      );
    } catch (err: unknown) {
      console.error('Continuation failed:', err);
      const message = err instanceof Error ? err.message : '이어쓰기에 실패했습니다.';
      alert(message);
      setIsContinuing(false);
      setIsStreamingContinuation(false);
    }
  };

  const handleTTS = async () => {
    setIsTTSLoading(true);
    try {
      const blob = await scenarioAPI.getTTS(resolvedParams.id);
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (err: unknown) {
      const { message, errorType } = await parseBlobError(err);
      if (errorType === 'quota' || errorType === 'rate_limit') {
        alert(message);
      } else {
        alert('음성 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setIsTTSLoading(false);
    }
  };

  const handleGenerateCover = async () => {
    if (!scenario) return;
    setIsCoverLoading(true);
    try {
      const result = await scenarioAPI.generateCover(resolvedParams.id);
      setScenario({ ...scenario, cover_image_url: result.cover_image_url });
    } catch {
      alert('커버 이미지 생성에 실패했습니다.');
    } finally {
      setIsCoverLoading(false);
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
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center text-white/40 text-sm font-mono">
                  <Calendar className="w-4 h-4 mr-2 opacity-70" />
                  {new Date(scenario.created_at).toLocaleDateString()} 생성됨
                </div>
                {scenario.parent_scenario_id && (
                  <span className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs text-purple-300">
                    이어쓰기
                  </span>
                )}
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

              {/* Cover Image */}
              {scenario.cover_image_url && (
                <div className="relative w-full aspect-video max-w-4xl mx-auto rounded-2xl overflow-hidden border border-white/10 mb-10">
                  <Image
                    src={scenario.cover_image_url}
                    alt="시나리오 커버 이미지"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}

              <div className="prose prose-invert prose-lg max-w-none">
                <p className="text-gray-300 leading-loose font-serif tracking-wide whitespace-pre-wrap">
                  {scenario.scenario_text}
                </p>
              </div>

              {/* TTS 오디오 플레이어 + 커버 이미지 생성 */}
              <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="relative group">
                  <button
                    disabled
                    className="flex items-center gap-2 px-6 py-3 rounded-xl border bg-white/3 border-white/8 text-white/25 cursor-not-allowed"
                  >
                    <Lock className="w-4 h-4" />
                    <Volume2 className="w-5 h-5" />
                    이 이야기 들어보기
                  </button>
                  {/* 호버 시 프리미엄 안내 툴팁 */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg bg-[#1a1a2e] border border-yellow-500/30 text-yellow-300 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                    ✦ 프리미엄 구독 시 이용 가능
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1a1a2e]" />
                  </div>
                </div>
                {!scenario.cover_image_url && (
                  <button
                    onClick={handleGenerateCover}
                    disabled={isCoverLoading}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl border bg-white/5 border-white/10 text-white/60 hover:bg-purple-500/10 hover:border-purple-500/30 hover:text-purple-300 transition-all disabled:opacity-50"
                  >
                    {isCoverLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        커버 이미지 생성 중...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-5 h-5" />
                        커버 이미지 생성
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* 피드백 섹션 */}
              <div className="mt-12 pt-8 border-t border-white/5">
                <p className="text-center text-white/40 text-sm mb-4">이 시나리오가 마음에 드셨나요?</p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => handleFeedback('like')}
                    disabled={isFeedbackLoading}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl border transition-all ${
                      rating === 'like'
                        ? 'bg-green-500/20 border-green-500/50 text-green-300 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-green-500/10 hover:border-green-500/30 hover:text-green-300'
                    }`}
                  >
                    <ThumbsUp className="w-5 h-5" />
                    <span className="font-medium">좋아요</span>
                  </button>
                  <button
                    onClick={() => handleFeedback('dislike')}
                    disabled={isFeedbackLoading}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl border transition-all ${
                      rating === 'dislike'
                        ? 'bg-red-500/20 border-red-500/50 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-300'
                    }`}
                  >
                    <ThumbsDown className="w-5 h-5" />
                    <span className="font-medium">아쉬워요</span>
                  </button>
                </div>
              </div>

              {/* 이어쓰기 스트리밍 영역 */}
              {isStreamingContinuation && (
                <div className="mt-8 pt-8 border-t border-white/5">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-purple-500/20 p-2 rounded-lg border border-purple-500/30">
                      <PenLine className="w-4 h-4 text-purple-400 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">이야기가 이어지고 있습니다...</h3>
                      <p className="text-xs text-white/40">실시간으로 생성 중</p>
                    </div>
                  </div>
                  <div
                    ref={streamRef}
                    className="max-h-[40vh] overflow-y-auto"
                  >
                    <p className="text-gray-300 leading-loose font-serif tracking-wide whitespace-pre-wrap">
                      {streamedContinuation}
                      <span className="inline-block w-0.5 h-5 bg-purple-400 ml-1 animate-pulse" />
                    </p>
                  </div>
                </div>
              )}

              {/* 하단 버튼 영역 */}
              <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={() => setShowContinueModal(true)}
                  disabled={isContinuing}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold px-8 py-4 rounded-xl shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PenLine className="w-5 h-5" />
                  이 이야기의 다음은?
                </button>
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

      {/* 이어쓰기 모달 */}
      {showContinueModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <PenLine className="w-5 h-5 text-purple-400" />
                이어쓰기
              </h3>
              <button
                onClick={() => setShowContinueModal(false)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-white/60 text-sm mb-4">
              이야기가 어떤 방향으로 전개되면 좋을지 알려주세요.
            </p>
            <Textarea
              placeholder="예: 주인공이 새로운 도시로 이사하면서 예상치 못한 기회를 만나는 방향으로..."
              rows={4}
              value={continuationDirection}
              onChange={(e) => setContinuationDirection(e.target.value)}
              className="bg-black/30 border-white/10 text-white placeholder:text-white/20 focus:border-purple-500/50 resize-none mb-6"
            />
            <div className="flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowContinueModal(false)}
                className="text-white/60 hover:text-white"
              >
                취소
              </Button>
              <button
                onClick={handleContinue}
                disabled={!continuationDirection.trim()}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isContinuing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <PenLine className="w-4 h-4" />
                    이어쓰기 시작
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
