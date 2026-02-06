'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/ui/Logo';
import { GlassCard } from '@/components/ui/GlassCard';
import { AxiosError } from 'axios';

interface PasswordFormData {
  current_password?: string;
  new_password: string;
  confirm_password: string;
}

export default function PasswordChangePage() {
  const router = useRouter();
  const { user, fetchUser, isLoading: authLoading } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isEmailUser = user?.auth_provider === 'email';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PasswordFormData>();

  const newPassword = watch('new_password');

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  const onSubmit = async (data: PasswordFormData) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await authAPI.changePassword({
        current_password: isEmailUser ? data.current_password : undefined,
        new_password: data.new_password,
      });
      setSuccess('비밀번호가 변경되었습니다.');
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ error?: { message: string }; detail?: string | [] }>;
      if (axiosErr.response?.data?.error?.message) {
        setError(axiosErr.response.data.error.message);
      } else if (typeof axiosErr.response?.data?.detail === 'string') {
        setError(axiosErr.response.data.detail);
      } else {
        setError('비밀번호 변경에 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <Link href="/dashboard" className="inline-flex mb-6">
            <Logo size="large" />
          </Link>
          <h2 className="text-2xl font-bold text-white mb-2">
            {isEmailUser ? '비밀번호 변경' : '비밀번호 설정'}
          </h2>
          <p className="text-gray-400">
            {isEmailUser
              ? '새로운 비밀번호를 입력해주세요'
              : '이메일 로그인에 사용할 비밀번호를 설정하세요'}
          </p>
        </div>

        <GlassCard>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-200 px-4 py-3 rounded-xl mb-6 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {isEmailUser && (
              <Input
                label="현재 비밀번호"
                type="password"
                placeholder="현재 비밀번호"
                required
                error={errors.current_password?.message}
                {...register('current_password', {
                  required: '현재 비밀번호를 입력해주세요',
                })}
              />
            )}

            <Input
              label="새 비밀번호"
              type="password"
              placeholder="8자 이상, 대문자/숫자/특수문자 포함"
              required
              error={errors.new_password?.message}
              {...register('new_password', {
                required: '새 비밀번호를 입력해주세요',
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

            <Input
              label="새 비밀번호 확인"
              type="password"
              placeholder="비밀번호 재입력"
              required
              error={errors.confirm_password?.message}
              {...register('confirm_password', {
                required: '비밀번호 확인을 입력해주세요',
                validate: (value) =>
                  value === newPassword || '비밀번호가 일치하지 않습니다',
              })}
            />

            <div className="flex gap-4">
              <Button
                type="button"
                variant="ghost"
                className="flex-1 text-white/60 hover:text-white"
                onClick={() => router.push('/dashboard')}
              >
                취소
              </Button>
              <Button type="submit" className="flex-1" size="lg" isLoading={isLoading}>
                {isEmailUser ? '비밀번호 변경' : '비밀번호 설정'}
              </Button>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
