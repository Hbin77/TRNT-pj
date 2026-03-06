'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { subscriptionAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { Check, X, Crown, Zap, Sparkles, ArrowLeft } from 'lucide-react';

declare global {
  interface Window {
    IMP: any;
  }
}

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    yearlyPrice: 0,
    description: '가볍게 시작해보세요',
    features: [
      { text: '일 3회 시나리오 생성', included: true },
      { text: '이어쓰기 제한적', included: true },
      { text: 'TTS 음성 변환', included: false },
      { text: '최근 10편 저장', included: true },
      { text: '우선 생성', included: false },
    ],
    highlighted: false,
    icon: Sparkles,
    gradient: 'from-gray-500/20 to-gray-600/20',
    borderColor: 'border-white/10',
    iconColor: 'text-gray-400',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 5900,
    yearlyPrice: 4900,
    description: '더 깊은 이야기를 경험하세요',
    badge: '추천',
    features: [
      { text: '일 15회 시나리오 생성', included: true },
      { text: '이어쓰기 무제한', included: true },
      { text: 'TTS 월 30회', included: true },
      { text: '무제한 저장', included: true },
      { text: '우선 생성', included: false },
    ],
    highlighted: true,
    icon: Crown,
    gradient: 'from-purple-600/20 to-pink-600/20',
    borderColor: 'border-purple-500/30',
    iconColor: 'text-purple-400',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 14900,
    yearlyPrice: 12400,
    description: '제한 없는 창작의 자유',
    features: [
      { text: '무제한 시나리오 생성', included: true },
      { text: '이어쓰기 무제한', included: true },
      { text: 'TTS 무제한', included: true },
      { text: '무제한 저장', included: true },
      { text: '우선 생성', included: true },
    ],
    highlighted: false,
    icon: Zap,
    gradient: 'from-blue-600/20 to-cyan-600/20',
    borderColor: 'border-blue-500/20',
    iconColor: 'text-blue-400',
  },
];

export default function PricingPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { plan: currentPlan, fetchSubscription } = useSubscriptionStore();
  const [isYearly, setIsYearly] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [successModal, setSuccessModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSubscription();
    }
  }, [isAuthenticated, fetchSubscription]);

  const handlePayment = async (planId: string, amount: number, planName: string) => {
    if (!isAuthenticated) {
      router.push(`/login?returnUrl=/pricing`);
      return;
    }

    if (planId === 'free') return;

    if (!window.IMP) {
      alert('결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    setLoadingPlan(planId);

    const merchantId = process.env.NEXT_PUBLIC_IMP_MERCHANT_ID || 'imp_merchant_id';
    window.IMP.init(merchantId);

    window.IMP.request_pay(
      {
        pg: 'tosspayments',
        pay_method: 'card',
        merchant_uid: `order_${Date.now()}`,
        name: `TRNT ${planName}`,
        amount: amount,
        buyer_email: user?.email,
        buyer_name: user?.name,
      },
      async (response: any) => {
        if (response.success) {
          try {
            await subscriptionAPI.createSubscription({
              imp_uid: response.imp_uid,
              merchant_uid: response.merchant_uid,
              plan_id: planId,
            });
            await fetchSubscription();
            setSuccessModal(true);
          } catch {
            alert('결제는 완료되었으나 구독 등록 중 오류가 발생했습니다. 고객센터로 문의해주세요.');
          }
        } else {
          alert(`결제에 실패했습니다: ${response.error_msg}`);
        }
        setLoadingPlan(null);
      }
    );
  };

  const getButtonProps = (planId: string) => {
    const currentPlanId = currentPlan?.id || 'free';

    if (currentPlanId === planId) {
      return { label: '현재 플랜', disabled: true };
    }
    if (planId === 'free') {
      return { label: isAuthenticated ? '현재 플랜' : '시작하기', disabled: isAuthenticated && currentPlanId === 'free' };
    }
    return { label: `${plans.find(p => p.id === planId)?.name} 시작`, disabled: false };
  };

  return (
    <>
      <Script src="https://cdn.iamport.kr/v1/iamport.js" strategy="afterInteractive" />

      <div className="min-h-screen bg-[#0A0A0F] text-white relative overflow-hidden">
        {/* Background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]" />
          <div className="absolute top-[40%] left-[50%] w-[30%] h-[30%] bg-pink-900/10 rounded-full blur-[100px]" />
        </div>

        {/* Header */}
        <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0A0A0F]/50 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <Link href={isAuthenticated ? '/dashboard' : '/'}>
                <Logo />
              </Link>
              <div className="flex items-center space-x-4">
                {isAuthenticated ? (
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      대시보드
                    </Button>
                  </Link>
                ) : (
                  <Link href="/login">
                    <Button variant="outline" size="sm">로그인</Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 pt-32 pb-20">
          <div className="max-w-6xl mx-auto">
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                요금제
              </h1>
              <p className="text-white/60 text-lg md:text-xl">
                나에게 맞는 플랜을 선택하세요
              </p>
            </motion.div>

            {/* Billing Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex items-center justify-center gap-4 mb-12"
            >
              <span className={`text-sm font-medium transition-colors ${!isYearly ? 'text-white' : 'text-white/40'}`}>
                월간 결제
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className={`relative w-14 h-7 rounded-full transition-colors ${isYearly ? 'bg-purple-500' : 'bg-white/20'}`}
              >
                <div
                  className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${isYearly ? 'translate-x-7' : 'translate-x-0.5'}`}
                />
              </button>
              <span className={`text-sm font-medium transition-colors ${isYearly ? 'text-white' : 'text-white/40'}`}>
                연간 결제
                <span className="ml-2 text-xs text-purple-400 font-bold">2개월 무료</span>
              </span>
            </motion.div>

            {/* Plan Cards */}
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {plans.map((plan, index) => {
                const { label, disabled } = getButtonProps(plan.id);
                const displayPrice = isYearly ? plan.yearlyPrice : plan.price;
                const Icon = plan.icon;

                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.15 + index * 0.1 }}
                    whileHover={{ y: -4 }}
                    className={`relative ${plan.highlighted ? 'md:-mt-4 md:mb-[-16px]' : ''}`}
                  >
                    {/* Recommended Badge */}
                    {plan.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                        <span className="px-4 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold shadow-lg shadow-purple-500/25">
                          {plan.badge}
                        </span>
                      </div>
                    )}

                    <div
                      className={`relative p-[1px] rounded-2xl ${
                        plan.highlighted
                          ? 'bg-gradient-to-br from-purple-500/50 to-pink-500/50'
                          : 'bg-gradient-to-br from-white/10 to-transparent'
                      }`}
                    >
                      <div
                        className={`bg-[#12121A]/95 backdrop-blur-xl rounded-2xl p-8 h-full border ${plan.borderColor}`}
                      >
                        {/* Icon */}
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-6`}>
                          <Icon className={`w-6 h-6 ${plan.iconColor}`} />
                        </div>

                        {/* Plan Name */}
                        <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                        <p className="text-white/50 text-sm mb-6">{plan.description}</p>

                        {/* Price */}
                        <div className="mb-8">
                          <div className="flex items-end gap-1">
                            <span className="text-4xl font-black text-white">
                              {displayPrice === 0 ? '무료' : `${displayPrice.toLocaleString()}`}
                            </span>
                            {displayPrice > 0 && (
                              <span className="text-white/40 mb-1 text-sm">원/월</span>
                            )}
                          </div>
                          {isYearly && plan.price > 0 && (
                            <p className="text-purple-400 text-xs mt-1">
                              연 {(plan.yearlyPrice * 12).toLocaleString()}원 결제
                            </p>
                          )}
                        </div>

                        {/* Features */}
                        <ul className="space-y-3 mb-8">
                          {plan.features.map((feature, fi) => (
                            <li key={fi} className="flex items-center gap-3">
                              {feature.included ? (
                                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                  <Check className="w-3 h-3 text-green-400" />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                                  <X className="w-3 h-3 text-white/20" />
                                </div>
                              )}
                              <span className={`text-sm ${feature.included ? 'text-white/80' : 'text-white/30'}`}>
                                {feature.text}
                              </span>
                            </li>
                          ))}
                        </ul>

                        {/* CTA Button */}
                        <Button
                          onClick={() => {
                            if (plan.id === 'free' && !isAuthenticated) {
                              router.push('/register');
                            } else {
                              handlePayment(plan.id, displayPrice, plan.name);
                            }
                          }}
                          disabled={disabled || loadingPlan === plan.id}
                          isLoading={loadingPlan === plan.id}
                          variant={plan.highlighted ? 'primary' : 'outline'}
                          size="lg"
                          className="w-full"
                        >
                          {label}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* FAQ or note */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center mt-16"
            >
              <p className="text-white/30 text-sm">
                구독은 언제든지 취소할 수 있으며, 취소 후에도 결제 기간까지 이용 가능합니다.
              </p>
              {isAuthenticated && (
                <Link href="/profile/subscription" className="text-purple-400 hover:text-purple-300 text-sm mt-2 inline-block">
                  구독 관리 바로가기 →
                </Link>
              )}
            </motion.div>
          </div>
        </div>

        {/* Success Modal */}
        {successModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#12121A] border border-purple-500/30 rounded-2xl p-8 max-w-sm w-full mx-4 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">구독 완료!</h3>
              <p className="text-white/60 text-sm mb-6">
                프리미엄 기능을 마음껏 이용하세요.
              </p>
              <Button
                onClick={() => {
                  setSuccessModal(false);
                  router.push('/dashboard');
                }}
                variant="primary"
                size="lg"
                className="w-full"
              >
                시작하기
              </Button>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
}
