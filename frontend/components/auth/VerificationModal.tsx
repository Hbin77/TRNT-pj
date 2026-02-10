'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AxiosError } from 'axios';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

interface VerificationModalProps {
    email: string;
    isOpen: boolean;
    onClose: () => void;
}

interface VerificationForm {
    code: string;
}

export default function VerificationModal({ email, isOpen, onClose }: VerificationModalProps) {
    const router = useRouter();
    const verifyEmail = useAuthStore((state) => state.verifyEmail);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { register, handleSubmit, formState: { errors } } = useForm<VerificationForm>();

    if (!isOpen) return null;

    const onSubmit = async (data: VerificationForm) => {
        setIsLoading(true);
        setError('');

        try {
            await verifyEmail(email, data.code);
            // 성공 시 프로필 완성 위저드로 이동
            router.push('/profile/edit?setup=true');
        } catch (err) {
            const error = err as AxiosError<{ detail?: string; error?: { message?: string } }>;
            const errorMessage = error.response?.data?.detail || error.response?.data?.error?.message || '인증에 실패했습니다.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <GlassCard className="w-full max-w-md relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    ✕
                </button>

                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">이메일 인증</h2>
                    <p className="text-gray-300 text-sm">
                        <span className="font-semibold text-primary">{email}</span>으로<br />
                        보내드린 6자리 인증 코드를 입력해주세요.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-xl mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Input
                        label="인증 코드"
                        placeholder="123456"
                        className="text-center text-2xl tracking-[0.5em]"
                        maxLength={6}
                        required
                        error={errors.code?.message}
                        {...register('code', {
                            required: '인증 코드를 입력해주세요',
                            pattern: {
                                value: /^[0-9]{6}$/,
                                message: '6자리 숫자를 입력해주세요'
                            }
                        })}
                    />

                    <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                        인증 완료
                    </Button>
                </form>
            </GlassCard>
        </div>
    );
}
