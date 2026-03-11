'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { subscriptionAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { ArrowLeft, Crown, CreditCard, Calendar, AlertTriangle } from 'lucide-react';

export default function SubscriptionPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, fetchUser } = useAuthStore();
  const { subscription, plan, isLoading, isPremium, fetchSubscription } = useSubscriptionStore();
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?returnUrl=/profile/subscription');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSubscription();
      loadPayments();
    }
  }, [isAuthenticated, fetchSubscription]);

  const loadPayments = async () => {
    setPaymentsLoading(true);
    try {
      const data = await subscriptionAPI.getPaymentHistory();
      setPayments(data.payments || []);
    } catch {
      setPayments([]);
    } finally {
      setPaymentsLoading(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await subscriptionAPI.cancelSubscription();
      await fetchSubscription();
      setCancelModal(false);
    } catch {
      alert('구독 취소 중 오류가 발생했습니다.');
    } finally {
      setCancelling(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    );
  }

  const currentPlanName = plan?.name || 'Free';
  const nextBillingDate = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString('ko-KR')
    : null;

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0A0A0F]/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/dashboard">
              <Logo />
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                대시보드
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              구독 관리
            </h1>
            <p className="text-white/50 mb-10">현재 구독 상태와 결제 내역을 확인하세요.</p>
          </motion.div>

          {/* Current Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 mb-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isPremium ? 'bg-gradient-to-br from-purple-600/20 to-pink-600/20' : 'bg-white/5'}`}>
                  <Crown className={`w-6 h-6 ${isPremium ? 'text-purple-400' : 'text-white/30'}`} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{currentPlanName}</h3>
                  <p className="text-white/40 text-sm">
                    {isPremium ? '프리미엄 구독 중' : '무료 플랜 이용 중'}
                  </p>
                </div>
              </div>
              {isPremium && subscription?.status === 'active' && (
                <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium border border-green-500/20">
                  활성
                </span>
              )}
            </div>

            {nextBillingDate && (
              <div className="flex items-center gap-3 bg-white/5 rounded-xl p-4 mb-6">
                <Calendar className="w-5 h-5 text-white/40" />
                <div>
                  <p className="text-white/60 text-xs">다음 결제일</p>
                  <p className="text-white font-medium text-sm">{nextBillingDate}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Link href="/pricing" className="flex-1">
                <Button variant="outline" size="md" className="w-full">
                  플랜 변경
                </Button>
              </Link>
              {isPremium && subscription?.status === 'active' && (
                <Button
                  onClick={() => setCancelModal(true)}
                  variant="ghost"
                  size="md"
                  className="text-red-400/60 hover:text-red-400 hover:bg-red-500/10"
                >
                  구독 취소
                </Button>
              )}
            </div>
          </motion.div>

          {/* Payment History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-5 h-5 text-white/40" />
              <h3 className="text-lg font-bold text-white">결제 내역</h3>
            </div>

            {paymentsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto" />
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/30 text-sm">결제 내역이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map((payment: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white/5 rounded-xl p-4 border border-white/5"
                  >
                    <div>
                      <p className="text-white/80 text-sm font-medium">{payment.name || payment.plan_name}</p>
                      <p className="text-white/30 text-xs mt-0.5">
                        {new Date(payment.created_at || payment.paid_at).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-sm">
                        {(payment.amount || 0).toLocaleString()}원
                      </p>
                      <p className={`text-xs mt-0.5 ${payment.status === 'paid' ? 'text-green-400' : 'text-white/30'}`}>
                        {payment.status === 'paid' ? '결제 완료' : payment.status === 'cancelled' ? '취소됨' : payment.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {cancelModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#12121A] border border-white/10 rounded-2xl p-8 max-w-sm w-full mx-4"
          >
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-white text-center mb-2">구독 취소</h3>
            <p className="text-white/60 text-sm text-center mb-6 leading-relaxed">
              구독을 취소하면 현재 결제 기간이 끝난 후 무료 플랜으로 전환됩니다.
              정말 취소하시겠습니까?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setCancelModal(false)}
                disabled={cancelling}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors text-sm font-medium"
              >
                돌아가기
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {cancelling ? '처리중...' : '취소하기'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
