'use client';

import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

export function StepIndicator({ currentStep, totalSteps, labels }: StepIndicatorProps) {
  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-2">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} className="flex-1 flex items-center">
            <div
              className={cn(
                'h-1.5 w-full rounded-full transition-all duration-500',
                i < currentStep
                  ? 'bg-primary'
                  : i === currentStep
                    ? 'bg-primary/50'
                    : 'bg-white/10'
              )}
            />
          </div>
        ))}
      </div>
      {/* Labels */}
      {labels && (
        <div className="flex justify-between">
          {labels.map((label, i) => (
            <span
              key={i}
              className={cn(
                'text-xs transition-colors',
                i === currentStep ? 'text-primary font-medium' : 'text-gray-500'
              )}
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
