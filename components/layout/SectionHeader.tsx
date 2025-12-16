// components/layout/SectionHeader.tsx
import { cn } from '@/lib/utils';

type Props = {
  title: string;
  highlight?: string;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
};

export function SectionHeader({
  title,
  highlight,
  subtitle,
  align = 'center',
  className,
}: Props) {
  const isCenter = align === 'center';

  return (
    <div
      className={cn(
        'mb-8 md:mb-10',
        isCenter ? 'text-center' : 'text-left',
        className
      )}
    >
      <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
        {title}{' '}
        {highlight && <span className="text-brandAccent">{highlight}</span>}
      </h2>
      {subtitle && (
        <p
          className={cn(
            'mt-2 text-sm text-slate-600 md:text-base',
            isCenter ? 'mx-auto max-w-2xl' : 'max-w-xl'
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
