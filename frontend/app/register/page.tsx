'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Sparkles } from 'lucide-react';
import type { RegisterRequest } from '@/types';
import { AxiosError } from 'axios';

export default function RegisterPage() {
  const router = useRouter();
  const registerUser = useAuthStore((state) => state.register);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterRequest>();

  const onSubmit = async (data: RegisterRequest) => {
    setIsLoading(true);
    setError('');

    try {
      await registerUser(data);
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as AxiosError<{ error: { message: string } }>;
      const errorMessage = error.response?.data?.error?.message || '회원가입에 실패했습니다.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="flex items-center justify-center space-x-2 mb-8">
          <Sparkles className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">TRNT</h1>
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-4xl font-bold text-center mb-2 text-gray-900">회원가입</h2>
          <p className="text-center text-gray-700 mb-8 font-medium">
            평행세계로의 첫 걸음을 시작하세요
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 로그인 정보 */}
            <div className="space-y-4">
              <h3 className="font-bold text-xl text-gray-900 border-b-2 border-blue-500 pb-2">로그인 정보</h3>

              <Input
                label="이메일"
                type="email"
                placeholder="your@email.com"
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
                placeholder="8자 이상, 대문자/숫자/특수문자 포함"
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
                    message: '대문자, 숫자, 특수문자를 포함해야 합니다',
                  },
                })}
              />
            </div>

            {/* 기본 정보 */}
            <div className="space-y-4">
              <h3 className="font-bold text-xl text-gray-900 border-b-2 border-blue-500 pb-2">기본 정보</h3>

              <Input
                label="이름"
                placeholder="홍길동"
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
                  required: '출생연도를 입력해주세요',
                  valueAsNumber: true,
                  min: {
                    value: 1900,
                    message: '1900년 이후를 입력해주세요',
                  },
                  max: {
                    value: new Date().getFullYear(),
                    message: '올바른 연도를 입력해주세요',
                  },
                })}
              />

              <Input
                label="직업"
                placeholder="개발자"
                required
                error={errors.occupation?.message}
                {...register('occupation', { required: '직업을 입력해주세요' })}
              />
            </div>

            {/* 인생 배경 */}
            <div className="space-y-4">
              <h3 className="font-bold text-xl text-gray-900 border-b-2 border-blue-500 pb-2">인생 배경</h3>

              <Textarea
                label="배경 스토리"
                placeholder="당신의 인생 이야기를 간단히 들려주세요. 어떤 선택들을 해왔고, 어떤 삶을 살아왔나요?"
                rows={4}
                required
                error={errors.life_background?.message}
                {...register('life_background', {
                  required: '배경 스토리를 입력해주세요',
                })}
              />

              <Textarea
                label="성격/MBTI (선택)"
                placeholder="예: ENFP, 외향적이고 호기심 많은 성격"
                rows={2}
                {...register('personality')}
              />

              <Textarea
                label="가치관 (선택)"
                placeholder="예: 자유와 창의성을 중시하며, 새로운 경험을 추구함"
                rows={2}
                {...register('values')}
              />
            </div>

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              회원가입하고 시작하기
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              로그인
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
