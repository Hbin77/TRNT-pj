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
          <div className="grid grid-cols-2 gap-3 mb-6">
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/kakao/login`}
              className="flex items-center justify-center gap-2 bg-[#FEE500] text-[#000000] py-2.5 rounded-xl text-sm font-medium hover:bg-[#FEE500]/90 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 3C5.9 3 1 6.9 1 11.6C1 14.5 2.9 17.1 5.9 18.6C6.4 18.9 6.5 19.3 6.3 19.8L5.3 23.3C5.2 23.8 5.7 24.2 6.1 23.9L10.9 20.7C11.3 20.8 11.6 20.8 12 20.8C18.1 20.8 23 16.9 23 12.2C23 7.5 18.1 3 12 3Z" />
              </svg>
              카카오로 시작
            </a>
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/google/login`}
              className="flex items-center justify-center gap-2 bg-white text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google로 시작
            </a>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#030712] px-2 text-gray-500">또는 이메일로 가입</span>
            </div>
          </div>

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
