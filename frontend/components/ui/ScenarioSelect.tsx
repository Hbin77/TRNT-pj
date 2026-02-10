'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { ScenarioQuestion } from '@/lib/profileConstants';

interface ScenarioSelectProps {
  question: ScenarioQuestion;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function ScenarioSelect({ question, value, onChange, error }: ScenarioSelectProps) {
  return (
    <div className="w-full space-y-3">
      <h4 className="text-base font-medium text-white">{question.question}</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {question.options.map((option) => {
          const isActive = value === option.value;
          return (
            <motion.button
              key={option.value}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => onChange(option.value)}
              className={cn(
                'text-left px-4 py-3 rounded-xl border transition-all duration-200',
                isActive
                  ? 'bg-primary/15 border-primary/50 shadow-sm shadow-primary/10'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              )}
            >
              <span className={cn('block text-sm font-medium', isActive ? 'text-primary' : 'text-white')}>
                {option.label}
              </span>
              <span className="block text-xs text-gray-500 mt-0.5">{option.description}</span>
            </motion.button>
          );
        })}
      </div>
      {error && <p className="text-sm text-red-400 ml-1">{error}</p>}
    </div>
  );
}
