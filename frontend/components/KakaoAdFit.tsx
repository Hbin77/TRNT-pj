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
    if (displayedRef.current) return;

    const tryDisplay = () => {
      if (displayedRef.current) return;
      if (containerRef.current && window.adfit) {
        window.adfit.display(unit);
        displayedRef.current = true;
        return true;
      }
      return false;
    };

    // SDK 이미 로드됨
    if (tryDisplay()) return;

    // SDK 로드 대기 (script onload 감지용 간단 폴링, 최대 10초)
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
