'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/ui/Logo';
import { GlassCard } from '@/components/ui/GlassCard';
import type { LoginRequest } from '@/types';
import { AxiosError } from 'axios';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>();

  const onSubmit = async (data: LoginRequest) => {
    setIsLoading(true);
    setError('');

    try {
      await login(data);
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as AxiosError<{ error: { message: string } }>;
      const errorMessage = error.response?.data?.error?.message || '로그인에 실패했습니다.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex mb-6">
            <Logo size="large" />
          </Link>
          <h2 className="text-2xl font-bold text-white mb-2">다시 오신 것을 환영합니다</h2>
          <p className="text-gray-400">당신의 평행세계가 기다리고 있습니다</p>
        </div>

        <GlassCard>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <a
              href="/api/v1/auth/kakao/login"
              className="flex items-center justify-center gap-2 bg-[#FEE500] text-[#000000] py-2.5 rounded-xl text-sm font-medium hover:bg-[#FEE500]/90 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 3C5.9 3 1 6.9 1 11.6C1 14.5 2.9 17.1 5.9 18.6C6.4 18.9 6.5 19.3 6.3 19.8L5.3 23.3C5.2 23.8 5.7 24.2 6.1 23.9L10.9 20.7C11.3 20.8 11.6 20.8 12 20.8C18.1 20.8 23 16.9 23 12.2C23 7.5 18.1 3 12 3Z" />
              </svg>
              카카오 로그인
            </a>
            <a
              href="/api/v1/auth/google/login"
              className="flex items-center justify-center gap-2 bg-white text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </a>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#030712] px-2 text-gray-500">또는 이메일로 로그인</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="이메일"
              type="email"
              placeholder="name@example.com"
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
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password', {
                required: '비밀번호를 입력해주세요',
              })}
            />

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              로그인
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center text-sm text-gray-400">
            아직 계정이 없으신가요?{' '}
            <Link href="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
              회원가입하기
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
