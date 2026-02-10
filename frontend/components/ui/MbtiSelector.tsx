'use client';

import { cn } from '@/lib/utils';
import { MBTI_DIMENSIONS } from '@/lib/profileConstants';

interface MbtiSelectorProps {
  value: string[]; // e.g. ['E','N','F','P']
  unknown: boolean;
  onChange: (value: string[], unknown: boolean) => void;
}

export function MbtiSelector({ value, unknown, onChange }: MbtiSelectorProps) {
  const handleToggle = (index: number, letter: string) => {
    if (unknown) return;
    const next = [...value];
    // 4개 슬롯을 미리 확보
    while (next.length < 4) next.push('');
    next[index] = letter;
    onChange(next, false);
  };

  const handleUnknown = () => {
    onChange([], !unknown);
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-300 ml-1">
          MBTI <span className="text-gray-500 font-normal">(선택)</span>
        </label>
        <button
          type="button"
          onClick={handleUnknown}
          className={cn(
            'text-xs px-3 py-1 rounded-full border transition-all',
            unknown
              ? 'bg-white/10 border-white/20 text-white'
              : 'bg-transparent border-white/10 text-gray-500 hover:text-gray-400'
          )}
        >
          모르겠어요
        </button>
      </div>
      <div className={cn('space-y-2', unknown && 'opacity-40 pointer-events-none')}>
        {MBTI_DIMENSIONS.map((dim, i) => (
          <div key={dim.left + dim.right} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleToggle(i, dim.left)}
              className={cn(
                'flex-1 py-2 rounded-lg text-sm font-medium transition-all border',
                value[i] === dim.left
                  ? 'bg-primary/20 border-primary/50 text-primary'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
              )}
            >
              {dim.leftLabel}
            </button>
            <button
              type="button"
              onClick={() => handleToggle(i, dim.right)}
              className={cn(
                'flex-1 py-2 rounded-lg text-sm font-medium transition-all border',
                value[i] === dim.right
                  ? 'bg-primary/20 border-primary/50 text-primary'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
              )}
            >
              {dim.rightLabel}
            </button>
          </div>
        ))}
      </div>
      {!unknown && value.filter(Boolean).length === 4 && (
        <p className="text-center text-primary font-semibold text-lg">{value.join('')}</p>
      )}
    </div>
  );
}
