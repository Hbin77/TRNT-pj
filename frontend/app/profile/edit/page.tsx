'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/store/authStore';
import { userAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Logo } from '@/components/ui/Logo';
import { GlassCard } from '@/components/ui/GlassCard';
import { AxiosError } from 'axios';

interface ProfileFormData {
  name: string;
  birth_year: number;
  occupation: string;
  life_background: string;
  personality?: string;
  values?: string;
  residence?: string;
  gender?: string;
  education?: string;
  major?: string;
  relationship_status?: string;
  key_events?: string;
}

function ProfileEditContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSetup = searchParams.get('setup') === 'true';
  const { user, fetchUser, isLoading: authLoading } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        birth_year: user.birth_year === 0 ? undefined : user.birth_year,
        occupation: user.occupation === '미입력' ? '' : user.occupation,
        life_background: user.life_background === '프로필을 완성해주세요.' ? '' : user.life_background,
        personality: user.personality || '',
        values: user.values || '',
        residence: user.residence || '',
        gender: user.gender || '',
        education: user.education || '',
        major: user.major || '',
        relationship_status: user.relationship_status || '',
        key_events: user.key_events || '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await userAPI.update(user.id, data);
      await fetchUser();
      setSuccess('프로필이 저장되었습니다.');
      setTimeout(() => router.push('/dashboard'), 1000);
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ error?: { message: string }; detail?: string | [] }>;
      if (axiosErr.response?.data?.error?.message) {
        setError(axiosErr.response.data.error.message);
      } else if (typeof axiosErr.response?.data?.detail === 'string') {
        setError(axiosErr.response.data.detail);
      } else {
        setError('프로필 저장에 실패했습니다.');
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

      <div className="max-w-2xl w-full relative z-10">
        <div className="text-center mb-8">
          <Link href="/dashboard" className="inline-flex mb-6">
            <Logo size="large" />
          </Link>
          <h2 className="text-2xl font-bold text-white mb-2">
            {isSetup ? '프로필을 완성해주세요' : '프로필 수정'}
          </h2>
          <p className="text-gray-400">
            {isSetup
              ? '시나리오 생성에 필요한 정보를 입력해주세요'
              : '프로필 정보를 수정할 수 있습니다'}
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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

            <div className="flex gap-4">
              {!isSetup && (
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1 text-white/60 hover:text-white"
                  onClick={() => router.push('/dashboard')}
                >
                  취소
                </Button>
              )}
              <Button type="submit" className="flex-1" size="lg" isLoading={isLoading}>
                {isSetup ? '프로필 완성하기' : '저장하기'}
              </Button>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}

export default function ProfileEditPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#030712] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    }>
      <ProfileEditContent />
    </Suspense>
  );
}
