// components/common/LanguageSwitcher.tsx
'use client';

import { Lang } from '@/lib/types';

type Props = {
  lang: Lang;
  onChange: (lang: Lang) => void;
};

export function LanguageSwitcher({ lang, onChange }: Props) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-1 py-0.5 text-xs font-medium text-emerald-700">
      <button
        type="button"
        onClick={() => onChange('id')}
        className={`rounded-full px-2 py-0.5 transition ${
          lang === 'id' ? 'bg-white shadow-sm' : 'hover:bg-emerald-100'
        }`}
      >
        ID
      </button>
      <button
        type="button"
        onClick={() => onChange('en')}
        className={`rounded-full px-2 py-0.5 transition ${
          lang === 'en' ? 'bg-white shadow-sm' : 'hover:bg-emerald-100'
        }`}
      >
        EN
      </button>
    </div>
  );
}
