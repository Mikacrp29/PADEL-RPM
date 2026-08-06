import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-ball text-court-950 hover:bg-ball-dim active:scale-[0.98] font-semibold shadow-[0_0_0_1px_rgba(200,241,60,0.4)]',
  secondary:
    'bg-court-800 text-mist-100 border border-court-600 hover:bg-court-700 active:scale-[0.98]',
  ghost: 'bg-transparent text-mist-300 hover:text-mist-100 hover:bg-court-800',
  danger: 'bg-transparent text-clay border border-clay/50 hover:bg-clay/10',
};

const sizeClasses: Record<Size, string> = {
  sm: 'text-sm px-3 py-1.5 rounded-lg gap-1.5',
  md: 'text-sm px-4 py-2.5 rounded-xl gap-2',
  lg: 'text-base px-6 py-3.5 rounded-xl gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ball/60 focus-visible:ring-offset-2 focus-visible:ring-offset-court-950',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
