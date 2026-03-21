'use client';

import { useEffect, useRef } from 'react';
import { useSubscriptionStore } from '@/store/subscriptionStore';

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
    if (displayedRef.current) return;

    const tryDisplay = () => {
      if (displayedRef.current) return false;
      try {
        const adfit = (window as any).adfit;
        if (containerRef.current && adfit && typeof adfit.display === 'function') {
          adfit.display(unit);
          displayedRef.current = true;
          return true;
        }
      } catch {
        // SDK 에러 무시 — 광고 실패가 앱을 크래시시키면 안 됨
      }
      return false;
    };

    if (tryDisplay()) return;

    // SDK 로드 대기
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (tryDisplay() || attempts > 40) {
        clearInterval(interval);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [unit]);

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

export function KakaoAdBanner({ className = '' }: { className?: string }) {
  const { isPremium } = useSubscriptionStore();
  if (isPremium) return null;
  return (
    <KakaoAdFit unit="DAN-zAViISprZ9Vafa2m" width={728} height={90} className={className} />
  );
}
