'use client';

import { useEffect, useRef } from 'react';
import { useSubscriptionStore } from '@/store/subscriptionStore';

declare global {
  interface Window {
    adfit?: { display: (unit: string) => void };
  }
}

// 전역 싱글턴: 스크립트 한 번만 로드
let sdkLoaded = false;
let sdkReady = false;
const sdkCallbacks: (() => void)[] = [];

function ensureSDK(callback: () => void) {
  if (sdkReady) {
    callback();
    return;
  }

  sdkCallbacks.push(callback);

  if (!sdkLoaded) {
    sdkLoaded = true;
    const script = document.createElement('script');
    script.src = 'https://t1.daumcdn.net/kas/static/ba.min.js';
    script.async = true;
    script.onload = () => {
      sdkReady = true;
      sdkCallbacks.forEach((cb) => cb());
      sdkCallbacks.length = 0;
    };
    document.body.appendChild(script);
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

    ensureSDK(() => {
      if (displayedRef.current) return;
      if (containerRef.current && window.adfit) {
        window.adfit.display(unit);
        displayedRef.current = true;
      }
    });
  }, [unit]);

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
