// components/layout/Container.tsx
import { cn } from '@/lib/utils';

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function Container({ children, className }: Props) {
  return (
    <div className={cn('mx-auto max-w-6xl px-4', className)}>{children}</div>
  );
}
