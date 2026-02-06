"use client";

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');

        if (accessToken && refreshToken) {
            // 토큰 저장
            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('refresh_token', refreshToken);

            // 사용자 정보 가져오기 및 상태 업데이트
            useAuthStore.getState().fetchUser().then(() => {
                router.push('/dashboard');
            }).catch(() => {
                router.push('/login?error=social_login_failed');
            });
        } else {
            // 실패 시 로그인 페이지로
            router.push('/login?error=social_login_failed');
        }
    }, [router, searchParams]);

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p>로그인 처리 중...</p>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#030712] text-white">
            <Suspense fallback={
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    <p>로딩 중...</p>
                </div>
            }>
                <AuthCallbackContent />
            </Suspense>
        </div>
    );
}
