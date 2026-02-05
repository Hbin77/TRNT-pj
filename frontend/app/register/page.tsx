'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Turnstile } from '@marsidev/react-turnstile';
import { Logo } from '@/components/ui/Logo';
import { GlassCard } from '@/components/ui/GlassCard';
import type { RegisterRequest } from '@/types';
import { AxiosError } from 'axios';
import VerificationModal from '@/components/auth/VerificationModal';

export default function RegisterPage() {
  const router = useRouter();
  const registerUser = useAuthStore((state) => state.register);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [showVerification, setShowVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterRequest>();

  const onSubmit = async (data: RegisterRequest) => {
    setIsLoading(true);
    setError('');

    try {
      await registerUser({ ...data, turnstile_token: turnstileToken || undefined });
      setRegisteredEmail(data.email);
      setShowVerification(true);
    } catch (err: unknown) {
      const error = err as AxiosError<{ error?: { message: string }, detail?: string | [] }>;
      let errorMessage = '회원가입에 실패했습니다.';

      if (error.response) {
        // FastAPI Pydantic validation error (422)
        if (error.response.status === 422 && error.response.data?.detail) {
          errorMessage = `입력값이 올바르지 않습니다: ${JSON.stringify(error.response.data.detail)}`;
        }
        // Custom API Exception
        else if (error.response.data?.error?.message) {
          errorMessage = error.response.data.error.message;
        }
        // Generic detail message
        else if (typeof error.response.data?.detail === 'string') {
          errorMessage = error.response.data.detail;
        }
        else {
          errorMessage = `오류 발생 (${error.response.status}): ${error.message}`;
        }
      } else {
        errorMessage = `네트워크 오류: ${error.message}`;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-2xl w-full relative z-10">
        <VerificationModal
          email={registeredEmail}
          isOpen={showVerification}
          onClose={() => setShowVerification(false)}
        />

        <div className="text-center mb-8">
          <Link href="/" className="inline-flex mb-6">
            <Logo size="large" />
          </Link>
          <h2 className="text-2xl font-bold text-white mb-2">새로운 여정의 시작</h2>
          <p className="text-gray-400">당신의 이야기를 들려주세요</p>
        </div>

        <GlassCard>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* 로그인 정보 */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-white border-b border-white/10 pb-2">로그인 정보</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="이메일"
                  type="email"
                  placeholder="name@example.com"
                  required
                  error={errors.email?.message}
                  {...register('email', {
                    required: '이메일을 입력해주세요',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: '올바른 이메일 형식이 아닙니다',
                    },
                  })}
                />

                <Input
                  label="비밀번호"
                  type="password"
                  placeholder="8자 이상"
                  required
                  error={errors.password?.message}
                  {...register('password', {
                    required: '비밀번호를 입력해주세요',
                    minLength: {
                      value: 8,
                      message: '비밀번호는 최소 8자 이상이어야 합니다',
                    },
                    pattern: {
                      value: /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/,
                      message: '대문자, 숫자, 특수문자 포함',
                    },
                  })}
                />
              </div>
            </div>

            {/* 기본 정보 */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-white border-b border-white/10 pb-2">기본 정보</h3>

              <div className="grid md:grid-cols-3 gap-4">
                <Input
                  label="이름"
                  placeholder="이름/닉네임"
                  required
                  error={errors.name?.message}
                  {...register('name', { required: '이름을 입력해주세요' })}
                />

                <Input
                  label="출생연도"
                  type="number"
                  placeholder="1995"
                  required
                  error={errors.birth_year?.message}
                  {...register('birth_year', {
                    required: '필수',
                    valueAsNumber: true,
                    min: { value: 1900, message: '1900년 이후' },
                    max: { value: new Date().getFullYear(), message: '올바른 연도' },
                  })}
                />

                <Input
                  label="직업"
                  placeholder="현재 직업"
                  required
                  error={errors.occupation?.message}
                  {...register('occupation', { required: '직업을 입력해주세요' })}
                />
              </div>
            </div>

            {/* 인생 배경 */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-white border-b border-white/10 pb-2">인생 배경</h3>

              <Textarea
                label="배경 스토리 (핵심)"
                placeholder="인생의 주요 분기점이나 현재 상황을 간략히 설명해주세요. 이 내용은 AI가 당신의 캐릭터를 이해하는 데 사용됩니다."
                rows={4}
                required
                error={errors.life_background?.message}
                {...register('life_background', {
                  required: '배경 스토리를 입력해주세요',
                })}
              />

              <div className="grid md:grid-cols-2 gap-4">
                <Textarea
                  label="성격/MBTI"
                  placeholder="예: ENFP, 외향적임"
                  rows={2}
                  {...register('personality')}
                />

                <Textarea
                  label="가치관"
                  placeholder="예: 자유, 도전"
                  rows={2}
                  {...register('values')}
                />
              </div>
            </div>

            {/* Turnstile Widget */}
            <div className="flex justify-center my-6">
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <Turnstile
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
                  onSuccess={(token) => setTurnstileToken(token)}
                  onError={() => setError('로봇 인증에 실패했습니다.')}
                  className="mx-auto"
                  options={{ theme: 'dark' }} // Force dark theme for widget
                />
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading} disabled={!turnstileToken} variant={turnstileToken ? "primary" : "secondary"}>
              {turnstileToken ? '새로운 세계로 입장하기' : '로봇 인증을 완료해주세요'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center text-sm text-gray-400">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
              로그인하기
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
