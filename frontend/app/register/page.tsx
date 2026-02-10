'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Turnstile } from '@marsidev/react-turnstile';
import { Logo } from '@/components/ui/Logo';
import { GlassCard } from '@/components/ui/GlassCard';
import type { RegisterRequest } from '@/types';
import { AxiosError } from 'axios';
import VerificationModal from '@/components/auth/VerificationModal';
import {
  GENDER_OPTIONS,
  OCCUPATION_OPTIONS,
  EDUCATION_OPTIONS,
  EDUCATION_WITH_MAJOR,
  RESIDENCE_OPTIONS,
  RELATIONSHIP_OPTIONS,
} from '@/lib/profileConstants';
import { cn } from '@/lib/utils';

// 드롭다운 select 스타일 (Input과 동일한 톤)
const selectClass = cn(
  'w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white',
  'transition-all duration-200 appearance-none',
  'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:bg-white/10',
  'hover:border-white/20'
);

function Select({
  label,
  required,
  error,
  options,
  placeholder,
  ...props
}: {
  label: string;
  required?: boolean;
  error?: string;
  options: readonly { value: string; label: string }[];
  placeholder?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">
        {label}
        {required && <span className="text-accent ml-1">*</span>}
      </label>
      <select className={cn(selectClass, !props.value && 'text-gray-500')} {...props}>
        <option value="" className="bg-gray-900">{placeholder || '선택'}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-gray-900">{opt.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-400 ml-1">{error}</p>}
    </div>
  );
}

// 라디오 그룹
function RadioGroup({
  label,
  options,
  value,
  onChange,
  required,
  error,
}: {
  label: string;
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  error?: string;
}) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">
        {label}
        {required && <span className="text-accent ml-1">*</span>}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-all border',
              value === opt.value
                ? 'bg-primary/20 border-primary/50 text-primary'
                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {error && <p className="mt-1 text-sm text-red-400 ml-1">{error}</p>}
    </div>
  );
}

type RegisterFormData = Omit<RegisterRequest, 'life_background' | 'personality' | 'values'> & {
  gender: string;
  occupation: string;
  education: string;
  major: string;
  residence: string;
  relationship_status: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const registerUser = useAuthStore((state) => state.register);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [showVerification, setShowVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  // 라디오/셀렉트 상태 (react-hook-form register가 까다로우므로 별도 관리)
  const [gender, setGender] = useState('');
  const [occupation, setOccupation] = useState('');
  const [education, setEducation] = useState('');
  const [residence, setResidence] = useState('');
  const [relationship, setRelationship] = useState('');

  // "기타" 직접 입력
  const [genderCustom, setGenderCustom] = useState('');
  const [occupationCustom, setOccupationCustom] = useState('');
  const [educationCustom, setEducationCustom] = useState('');
  const [relationshipCustom, setRelationshipCustom] = useState('');

  const showMajor = EDUCATION_WITH_MAJOR.includes(education);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const onSubmit = async (data: RegisterFormData) => {
    if (!gender) { setError('성별을 선택해주세요.'); return; }
    if (!occupation) { setError('직업을 선택해주세요.'); return; }

    setIsLoading(true);
    setError('');

    try {
      const payload: RegisterRequest = {
        email: data.email,
        password: data.password,
        name: data.name,
        birth_year: data.birth_year,
        gender: gender === '기타' ? (genderCustom || '기타') : gender,
        occupation: occupation === '기타' ? (occupationCustom || '기타') : occupation,
        education: education === '기타' ? (educationCustom || '기타') : (education || undefined),
        major: showMajor ? data.major : undefined,
        residence: residence || undefined,
        relationship_status: relationship === '기타' ? (relationshipCustom || '기타') : (relationship || undefined),
        life_background: '프로필을 완성해주세요.',
        personality: '',
        values: '',
        turnstile_token: turnstileToken || undefined,
      };
      await registerUser(payload);
      setRegisteredEmail(data.email);
      setShowVerification(true);
    } catch (err: unknown) {
      const error = err as AxiosError<{ error?: { message: string }, detail?: string | [] }>;
      let errorMessage = '회원가입에 실패했습니다.';

      if (error.response) {
        if (error.response.status === 422 && error.response.data?.detail) {
          errorMessage = `입력값이 올바르지 않습니다: ${JSON.stringify(error.response.data.detail)}`;
        } else if (error.response.data?.error?.message) {
          errorMessage = error.response.data.error.message;
        } else if (typeof error.response.data?.detail === 'string') {
          errorMessage = error.response.data.detail;
        } else {
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
          <p className="text-gray-400">간단한 정보만 입력하면 바로 시작할 수 있어요</p>
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
              카카오로 시작
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

              <div className="grid md:grid-cols-2 gap-4">
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
              </div>

              <RadioGroup
                label="성별"
                options={GENDER_OPTIONS}
                value={gender}
                onChange={setGender}
                required
              />
              {gender === '기타' && (
                <Input
                  label="성별 (직접 입력)"
                  placeholder="성별을 입력해주세요"
                  value={genderCustom}
                  onChange={(e) => setGenderCustom(e.target.value)}
                />
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <Select
                  label="직업"
                  options={OCCUPATION_OPTIONS}
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  required
                />

                <Select
                  label="학력"
                  options={EDUCATION_OPTIONS}
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="선택 (선택사항)"
                />
              </div>
              {occupation === '기타' && (
                <Input
                  label="직업 (직접 입력)"
                  placeholder="직업을 입력해주세요"
                  value={occupationCustom}
                  onChange={(e) => setOccupationCustom(e.target.value)}
                />
              )}
              {education === '기타' && (
                <Input
                  label="학력 (직접 입력)"
                  placeholder="학력을 입력해주세요"
                  value={educationCustom}
                  onChange={(e) => setEducationCustom(e.target.value)}
                />
              )}

              {showMajor && (
                <Input
                  label="전공"
                  placeholder="전공을 입력해주세요"
                  {...register('major')}
                />
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <Select
                  label="거주지"
                  options={RESIDENCE_OPTIONS}
                  value={residence}
                  onChange={(e) => setResidence(e.target.value)}
                  placeholder="선택 (선택사항)"
                />

                <RadioGroup
                  label="교제 상태"
                  options={RELATIONSHIP_OPTIONS}
                  value={relationship}
                  onChange={setRelationship}
                />
              </div>
              {relationship === '기타' && (
                <Input
                  label="교제 상태 (직접 입력)"
                  placeholder="교제 상태를 입력해주세요"
                  value={relationshipCustom}
                  onChange={(e) => setRelationshipCustom(e.target.value)}
                />
              )}
            </div>

            {/* Turnstile Widget */}
            <div className="flex justify-center my-6">
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <Turnstile
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
                  onSuccess={(token) => setTurnstileToken(token)}
                  onError={() => setError('로봇 인증에 실패했습니다.')}
                  className="mx-auto"
                  options={{ theme: 'dark' }}
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
