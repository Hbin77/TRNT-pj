'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Sparkles } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center space-x-2 mb-8">
          <Sparkles className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">TRNT</h1>
        </Link>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-4xl font-bold text-center mb-2 text-gray-900">로그인</h2>
          <p className="text-center text-gray-700 mb-8 font-medium">
            평행세계로 돌아오신 것을 환영합니다
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="이메일"
              type="email"
              placeholder="your@email.com"
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

            <Button type="submit" className="w-full" isLoading={isLoading}>
              로그인
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            아직 계정이 없으신가요?{' '}
            <Link href="/register" className="text-blue-600 hover:underline font-medium">
              회원가입
            </Link>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm">
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
