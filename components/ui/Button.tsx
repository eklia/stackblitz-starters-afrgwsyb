// components/ui/Button.tsx
import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-full font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:ring-offset-2 focus:ring-offset-emerald-50';

  const variants: Record<Variant, string> = {
    primary:
      'bg-emerald-600 text-emerald-50 shadow-lg shadow-emerald-500/30 hover:bg-emerald-700',
    secondary:
      'border border-emerald-200 bg-white text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50',
    ghost: 'text-emerald-700 hover:bg-emerald-50',
  };

  const sizes: Record<Size, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
