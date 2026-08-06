import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-xl bg-court-800 border border-court-600 px-4 py-3 text-mist-100 placeholder:text-mist-500 outline-none transition-colors focus:border-ball/70 focus:ring-2 focus:ring-ball/20',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';
