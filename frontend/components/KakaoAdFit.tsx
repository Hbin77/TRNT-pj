'use client';

import { useEffect, useRef } from 'react';
import { useSubscriptionStore } from '@/store/subscriptionStore';

declare global {
  interface Window {
    adfit?: { display: (unit: string) => void };
  }
}

interface KakaoAdFitProps {
  unit: string;
  width: number;
  height: number;
  className?: string;
}

export function KakaoAdFit({ unit, width, height, className = '' }: KakaoAdFitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const displayedRef = useRef(false);

  useEffect(() => {
    const tryDisplay = () => {
      if (displayedRef.current) return;
      if (containerRef.current && window.adfit) {
        window.adfit.display(unit);
        displayedRef.current = true;
      }
    };

    // SDK가 이미 로드되었으면 바로 실행
    if (window.adfit) {
      tryDisplay();
      return;
    }

    // layout.tsx의 Script onReady가 발행하는 이벤트 대기
    const handleReady = () => tryDisplay();
    window.addEventListener('adfit-ready', handleReady);

    return () => {
      window.removeEventListener('adfit-ready', handleReady);
    };
  }, [unit]);

  // unmount 시 displayedRef 리셋 (remount 시 재표시 가능하도록)
  useEffect(() => {
    return () => { displayedRef.current = false; };
  }, []);

  return (
    <div ref={containerRef} className={`flex justify-center ${className}`}>
      <ins
        className="kakao_ad_area"
        style={{ display: 'none' }}
        data-ad-unit={unit}
        data-ad-width={String(width)}
        data-ad-height={String(height)}
      />
    </div>
  );
}

// 기본 728x90 배너 (유료 구독자에게는 표시하지 않음)
export function KakaoAdBanner({ className = '' }: { className?: string }) {
  const { isPremium } = useSubscriptionStore();

  if (isPremium) return null;

  return (
    <KakaoAdFit
      unit="DAN-zAViISprZ9Vafa2m"
      width={728}
      height={90}
      className={className}
    />
  );
}
