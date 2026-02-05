import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">
            {label}
            {props.required && <span className="text-accent ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white",
            "placeholder:text-gray-500 font-normal transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:bg-white/10",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error ? "border-red-500 focus:ring-red-500" : "hover:border-white/20",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-400 ml-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
