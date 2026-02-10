'use client';

import { useEffect, useState, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { userAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Logo } from '@/components/ui/Logo';
import { GlassCard } from '@/components/ui/GlassCard';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { ScenarioSelect } from '@/components/ui/ScenarioSelect';
import { MbtiSelector } from '@/components/ui/MbtiSelector';
import { ChipGroup } from '@/components/ui/ChipGroup';
import { AxiosError } from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

import {
  SCENARIO_QUESTIONS,
  PERSONALITY_KEYWORDS,
  CORE_VALUES,
  LIFE_PRIORITY_OPTIONS,
  STORY_QUESTIONS,
  OCCUPATION_OPTIONS,
  EDUCATION_OPTIONS,
  EDUCATION_WITH_MAJOR,
  RESIDENCE_OPTIONS,
  GENDER_OPTIONS,
  RELATIONSHIP_OPTIONS,
} from '@/lib/profileConstants';
import {
  type Step1Data,
  type Step2Data,
  type Step3Data,
  serializePersonality,
  serializeValues,
  serializeLifeBackground,
  serializeKeyEvents,
  deserializePersonality,
  deserializeValues,
  deserializeLifeBackground,
} from '@/lib/profileSerializer';
import { cn } from '@/lib/utils';

// ── 공용 Select 컴포넌트 ──
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
  value,
  ...props
}: {
  label: string;
  required?: boolean;
  error?: string;
  options: readonly { value: string; label: string }[];
  placeholder?: string;
  value?: string;
} & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'value'>) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">
        {label}
        {required && <span className="text-accent ml-1">*</span>}
      </label>
      <select className={cn(selectClass, !value && 'text-gray-500')} value={value || ''} {...props}>
        <option value="" className="bg-gray-900">{placeholder || '선택'}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-gray-900">{opt.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-400 ml-1">{error}</p>}
    </div>
  );
}

function RadioGroup({
  label,
  options,
  value,
  onChange,
  required,
}: {
  label: string;
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
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
    </div>
  );
}

const WIZARD_LABELS = ['나의 성격', '가치관', '나의 이야기'];

function ProfileEditContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSetup = searchParams.get('setup') === 'true';
  const { user, fetchUser, isLoading: authLoading } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Wizard step (setup 모드에서만 사용)
  const [step, setStep] = useState(0);

  // ── 기본 정보 (edit 모드) ──
  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [gender, setGender] = useState('');
  const [occupation, setOccupation] = useState('');
  const [education, setEducation] = useState('');
  const [major, setMajor] = useState('');
  const [residence, setResidence] = useState('');
  const [relationship, setRelationship] = useState('');

  // ── Step 1: 성격 ──
  const [step1, setStep1] = useState<Step1Data>({
    scenarios: {},
    mbti: [],
    mbtiUnknown: false,
    keywords: [],
  });

  // ── Step 2: 가치관 ──
  const [step2, setStep2] = useState<Step2Data>({
    coreValues: [],
    lifePriority: '',
    futureVision: '',
  });

  // ── Step 3: 이야기 ──
  const [step3, setStep3] = useState<Step3Data>({
    turningPoint: '',
    currentConcern: '',
    ifAgain: '',
  });

  // ── 아코디언 (edit 모드) ──
  const [openSection, setOpenSection] = useState<number | null>(null);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  // 유저 데이터 → 상태 초기화
  useEffect(() => {
    if (!user) return;
    setName(user.name || '');
    setBirthYear(user.birth_year && user.birth_year !== 0 ? String(user.birth_year) : '');
    setGender(user.gender || '');
    setOccupation(user.occupation === '미입력' ? '' : user.occupation || '');
    setEducation(user.education || '');
    setMajor(user.major || '');
    setResidence(user.residence || '');
    setRelationship(user.relationship_status || '');

    setStep1(deserializePersonality(user.personality || ''));
    setStep2(deserializeValues(user.values || ''));
    setStep3(deserializeLifeBackground(user.life_background || ''));
  }, [user]);

  const showMajor = EDUCATION_WITH_MAJOR.includes(education);

  // ── 유효성 검사 ──
  const validateStep = (s: number): string | null => {
    if (s === 0) {
      const answered = Object.keys(step1.scenarios).filter((k) => step1.scenarios[k]);
      if (answered.length < 4) return '모든 질문에 답해주세요.';
    }
    if (s === 1) {
      if (step1 && step2.coreValues.length < 3) return '핵심 가치를 3개 이상 선택해주세요.';
      if (!step2.lifePriority) return '삶에서 가장 중요한 것을 선택해주세요.';
    }
    if (s === 2) {
      if (!step3.turningPoint.trim()) return '인생 전환점을 입력해주세요.';
      if (!step3.currentConcern.trim()) return '현재 고민을 입력해주세요.';
    }
    return null;
  };

  // ── 저장 ──
  const handleSave = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload: Record<string, unknown> = {
        personality: serializePersonality(step1),
        values: serializeValues(step2),
        life_background: serializeLifeBackground(step3),
        key_events: serializeKeyEvents(step3),
      };

      // edit 모드에서는 기본 정보도 포함
      if (!isSetup) {
        payload.name = name;
        payload.birth_year = birthYear ? Number(birthYear) : undefined;
        payload.gender = gender;
        payload.occupation = occupation;
        payload.education = education || undefined;
        payload.major = showMajor ? major : undefined;
        payload.residence = residence || undefined;
        payload.relationship_status = relationship || undefined;
      }

      await userAPI.update(user.id, payload);
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
  }, [user, step1, step2, step3, isSetup, name, birthYear, gender, occupation, education, major, residence, relationship, showMajor, fetchUser, router]);

  const handleNext = () => {
    const err = validateStep(step);
    if (err) { setError(err); return; }
    setError('');
    if (step < 2) {
      setStep(step + 1);
    } else {
      handleSave();
    }
  };

  const handleBack = () => {
    setError('');
    if (step > 0) setStep(step - 1);
  };

  // ── 로딩 ──
  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">로딩중...</p>
        </div>
      </div>
    );
  }

  // ── 위저드 Step 렌더링 ──
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <motion.div
            key="step0"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div>
              <h3 className="font-semibold text-lg text-white mb-1">나의 성격</h3>
              <p className="text-sm text-gray-400">당신의 행동 패턴을 알려주세요. AI가 시나리오에서 당신을 더 사실적으로 묘사합니다.</p>
            </div>

            {SCENARIO_QUESTIONS.map((q) => (
              <ScenarioSelect
                key={q.id}
                question={q}
                value={step1.scenarios[q.id] || ''}
                onChange={(v) =>
                  setStep1((prev) => ({ ...prev, scenarios: { ...prev.scenarios, [q.id]: v } }))
                }
              />
            ))}

            <div className="pt-4 border-t border-white/10">
              <MbtiSelector
                value={step1.mbti}
                unknown={step1.mbtiUnknown}
                onChange={(mbti, unknown) => setStep1((prev) => ({ ...prev, mbti, mbtiUnknown: unknown }))}
              />
            </div>

            <div className="pt-4 border-t border-white/10">
              <ChipGroup
                label="성격 키워드"
                options={PERSONALITY_KEYWORDS}
                selected={step1.keywords}
                onChange={(keywords) => setStep1((prev) => ({ ...prev, keywords }))}
                max={5}
                min={1}
              />
            </div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div>
              <h3 className="font-semibold text-lg text-white mb-1">가치관 & 삶의 방향</h3>
              <p className="text-sm text-gray-400">당신이 중요하게 생각하는 것들을 알려주세요.</p>
            </div>

            <ChipGroup
              label="핵심 가치"
              options={CORE_VALUES}
              selected={step2.coreValues}
              onChange={(coreValues) => setStep2((prev) => ({ ...prev, coreValues }))}
              min={3}
              max={5}
            />

            <div className="space-y-3">
              <h4 className="text-base font-medium text-white">삶에서 가장 중요한 것은?</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {LIFE_PRIORITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStep2((prev) => ({ ...prev, lifePriority: opt.value }))}
                    className={cn(
                      'text-left px-4 py-3 rounded-xl border transition-all',
                      step2.lifePriority === opt.value
                        ? 'bg-primary/15 border-primary/50 text-primary'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="10년 후 이상적인 나의 모습은?"
              placeholder="예: 내 사업을 운영하며 가족과 함께하는 삶"
              value={step2.futureVision}
              onChange={(e) => setStep2((prev) => ({ ...prev, futureVision: e.target.value }))}
            />
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div>
              <h3 className="font-semibold text-lg text-white mb-1">나의 이야기</h3>
              <p className="text-sm text-gray-400">간단한 질문에 답해주세요. 더 깊이있는 시나리오를 만들 수 있어요.</p>
            </div>

            {STORY_QUESTIONS.map((q) => {
              const val =
                q.id === 'turning_point'
                  ? step3.turningPoint
                  : q.id === 'current_concern'
                    ? step3.currentConcern
                    : step3.ifAgain;
              return (
                <Textarea
                  key={q.id}
                  label={q.label}
                  placeholder={q.placeholder}
                  rows={2}
                  required={q.required}
                  value={val}
                  onChange={(e) => {
                    const v = e.target.value;
                    setStep3((prev) => ({
                      ...prev,
                      ...(q.id === 'turning_point' && { turningPoint: v }),
                      ...(q.id === 'current_concern' && { currentConcern: v }),
                      ...(q.id === 'if_again' && { ifAgain: v }),
                    }));
                  }}
                />
              );
            })}
          </motion.div>
        );

      default:
        return null;
    }
  };

  // ══════════════════════════════════════════
  // SETUP 모드: 3단계 위저드
  // ══════════════════════════════════════════
  if (isSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-2xl w-full relative z-10">
          <div className="text-center mb-6">
            <Link href="/dashboard" className="inline-flex mb-4">
              <Logo size="large" />
            </Link>
            <h2 className="text-2xl font-bold text-white mb-2">프로필을 완성해주세요</h2>
            <p className="text-gray-400 text-sm">AI가 당신을 이해하는 데 사용됩니다 (약 2분)</p>
          </div>

          <div className="mb-6">
            <StepIndicator currentStep={step} totalSteps={3} labels={WIZARD_LABELS} />
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

            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>

            <div className="flex gap-4 mt-8">
              {step > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1 text-white/60 hover:text-white"
                  onClick={handleBack}
                >
                  이전
                </Button>
              )}
              {step === 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1 text-white/40 hover:text-white/60 text-sm"
                  onClick={() => router.push('/dashboard')}
                >
                  나중에 할게요
                </Button>
              )}
              <Button
                type="button"
                className="flex-1"
                size="lg"
                isLoading={isLoading}
                onClick={handleNext}
              >
                {step < 2 ? '다음' : '프로필 완성하기'}
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // EDIT 모드: 아코디언 레이아웃
  // ══════════════════════════════════════════
  const sections = [
    {
      title: '기본 정보',
      content: (
        <div className="space-y-4 pt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="이름"
              placeholder="이름/닉네임"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="출생연도"
              type="number"
              placeholder="1995"
              required
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
            />
          </div>
          <RadioGroup
            label="성별"
            options={GENDER_OPTIONS}
            value={gender}
            onChange={setGender}
          />
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
            />
          </div>
          {showMajor && (
            <Input
              label="전공"
              placeholder="전공을 입력해주세요"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
            />
          )}
          <div className="grid md:grid-cols-2 gap-4">
            <Select
              label="거주지"
              options={RESIDENCE_OPTIONS}
              value={residence}
              onChange={(e) => setResidence(e.target.value)}
            />
            <RadioGroup
              label="교제 상태"
              options={RELATIONSHIP_OPTIONS}
              value={relationship}
              onChange={setRelationship}
            />
          </div>
        </div>
      ),
    },
    {
      title: '나의 성격',
      content: (
        <div className="space-y-6 pt-4">
          {SCENARIO_QUESTIONS.map((q) => (
            <ScenarioSelect
              key={q.id}
              question={q}
              value={step1.scenarios[q.id] || ''}
              onChange={(v) =>
                setStep1((prev) => ({ ...prev, scenarios: { ...prev.scenarios, [q.id]: v } }))
              }
            />
          ))}
          <div className="pt-4 border-t border-white/10">
            <MbtiSelector
              value={step1.mbti}
              unknown={step1.mbtiUnknown}
              onChange={(mbti, unknown) => setStep1((prev) => ({ ...prev, mbti, mbtiUnknown: unknown }))}
            />
          </div>
          <div className="pt-4 border-t border-white/10">
            <ChipGroup
              label="성격 키워드"
              options={PERSONALITY_KEYWORDS}
              selected={step1.keywords}
              onChange={(keywords) => setStep1((prev) => ({ ...prev, keywords }))}
              max={5}
              min={1}
            />
          </div>
        </div>
      ),
    },
    {
      title: '가치관 & 삶의 방향',
      content: (
        <div className="space-y-6 pt-4">
          <ChipGroup
            label="핵심 가치"
            options={CORE_VALUES}
            selected={step2.coreValues}
            onChange={(coreValues) => setStep2((prev) => ({ ...prev, coreValues }))}
            min={3}
            max={5}
          />
          <div className="space-y-3">
            <h4 className="text-base font-medium text-white">삶에서 가장 중요한 것은?</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {LIFE_PRIORITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStep2((prev) => ({ ...prev, lifePriority: opt.value }))}
                  className={cn(
                    'text-left px-4 py-3 rounded-xl border transition-all',
                    step2.lifePriority === opt.value
                      ? 'bg-primary/15 border-primary/50 text-primary'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <Input
            label="10년 후 이상적인 나의 모습은?"
            placeholder="예: 내 사업을 운영하며 가족과 함께하는 삶"
            value={step2.futureVision}
            onChange={(e) => setStep2((prev) => ({ ...prev, futureVision: e.target.value }))}
          />
        </div>
      ),
    },
    {
      title: '나의 이야기',
      content: (
        <div className="space-y-6 pt-4">
          {STORY_QUESTIONS.map((q) => {
            const val =
              q.id === 'turning_point'
                ? step3.turningPoint
                : q.id === 'current_concern'
                  ? step3.currentConcern
                  : step3.ifAgain;
            return (
              <Textarea
                key={q.id}
                label={q.label}
                placeholder={q.placeholder}
                rows={2}
                required={q.required}
                value={val}
                onChange={(e) => {
                  const v = e.target.value;
                  setStep3((prev) => ({
                    ...prev,
                    ...(q.id === 'turning_point' && { turningPoint: v }),
                    ...(q.id === 'current_concern' && { currentConcern: v }),
                    ...(q.id === 'if_again' && { ifAgain: v }),
                  }));
                }}
              />
            );
          })}
        </div>
      ),
    },
  ];

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
          <h2 className="text-2xl font-bold text-white mb-2">프로필 수정</h2>
          <p className="text-gray-400">프로필 정보를 수정할 수 있습니다</p>
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

          <div className="space-y-3">
            {sections.map((section, i) => (
              <div key={i} className="border border-white/10 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenSection(openSection === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/5 transition-colors"
                >
                  <span className="font-medium text-white">{section.title}</span>
                  <svg
                    className={cn(
                      'w-5 h-5 text-gray-400 transition-transform duration-200',
                      openSection === i && 'rotate-180'
                    )}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <AnimatePresence>
                  {openSection === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5">{section.content}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-6">
            <Button
              type="button"
              variant="ghost"
              className="flex-1 text-white/60 hover:text-white"
              onClick={() => router.push('/dashboard')}
            >
              취소
            </Button>
            <Button
              type="button"
              className="flex-1"
              size="lg"
              isLoading={isLoading}
              onClick={handleSave}
            >
              저장하기
            </Button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

export default function ProfileEditPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#030712] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
      </div>
    }>
      <ProfileEditContent />
    </Suspense>
  );
}
