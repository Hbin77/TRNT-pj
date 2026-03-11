'use client';

import { useEffect, useRef } from 'react';

interface KakaoAdFitProps {
  unit: string;
  width: number;
  height: number;
  className?: string;
}

export function KakaoAdFit({ unit, width, height, className = '' }: KakaoAdFitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/kas/static/ba.min.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // cleanup on unmount
      try { document.body.removeChild(script); } catch {}
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    // SDK 로드 후 광고 렌더링
    const timer = setTimeout(() => {
      const ins = containerRef.current?.querySelector('ins');
      if (ins && (window as any).adfit) {
        (window as any).adfit.display(unit);
      }
    }, 500);
    return () => clearTimeout(timer);
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

// 기본 728x90 배너 (프로젝트 광고단위)
export function KakaoAdBanner({ className = '' }: { className?: string }) {
  return (
    <KakaoAdFit
      unit="DAN-zAViISprZ9Vafa2m"
      width={728}
      height={90}
      className={className}
    />
  );
}
