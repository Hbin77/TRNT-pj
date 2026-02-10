'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ChipGroupProps {
  options: readonly string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  min?: number;
  max?: number;
  label?: string;
  error?: string;
}

export function ChipGroup({ options, selected, onChange, min, max, label, error }: ChipGroupProps) {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      if (max && selected.length >= max) return;
      onChange([...selected, value]);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-3 ml-1">
          {label}
          {min && max && (
            <span className="text-gray-500 font-normal ml-2">({min}~{max}개 선택)</span>
          )}
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = selected.includes(option);
          return (
            <motion.button
              key={option}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => toggle(option)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border',
                isActive
                  ? 'bg-primary/20 border-primary/50 text-primary shadow-sm shadow-primary/10'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-300'
              )}
            >
              {option}
            </motion.button>
          );
        })}
      </div>
      {error && <p className="mt-2 text-sm text-red-400 ml-1">{error}</p>}
    </div>
  );
}
