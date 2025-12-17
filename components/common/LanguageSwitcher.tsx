'use client';

import { useRouter, usePathname } from 'next/navigation';
import type { Lang } from '@/lib/types';
import { cn } from '@/lib/utils';

type Props = {
  lang: Lang;
};

export function LanguageSwitcher({ lang }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const handleSwitch = (nextLang: Lang) => {
    if (nextLang === lang) return;

    const segments = pathname.split('/').filter(Boolean);
    // contoh: /id/calculators/pph21-ter -> ['id','calculators','pph21-ter']

    if (segments.length === 0) {
      router.push(`/${nextLang}`);
      return;
    }

    segments[0] = nextLang;
    const newPath = '/' + segments.join('/');
    router.push(newPath);
  };

  return (
    <div className="inline-flex items-center rounded-full border border-slate-200 bg-white/70 p-0.5 text-[11px] shadow-sm">
      <button
        type="button"
        onClick={() => handleSwitch('id')}
        className={cn(
          'px-2 py-1 rounded-full',
          lang === 'id'
            ? 'bg-emerald-600 text-emerald-50'
            : 'text-slate-600 hover:text-slate-900'
        )}
      >
        ID
      </button>
      <button
        type="button"
        onClick={() => handleSwitch('en')}
        className={cn(
          'px-2 py-1 rounded-full',
          lang === 'en'
            ? 'bg-emerald-600 text-emerald-50'
            : 'text-slate-600 hover:text-slate-900'
        )}
      >
        EN
      </button>
    </div>
  );
}
