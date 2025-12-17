'use client';

import type { Lang } from '@/lib/types';
import { Pph21TerCalculator } from '@/components/calculators/Pph21TerCalculator';

type PageProps = {
  params: {
    lang: Lang;
  };
};

export default function Pph21TerPage({ params }: PageProps) {
  const lang: Lang = params.lang === 'en' ? 'en' : 'id';

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-emerald-50/40 to-slate-50 pb-10 pt-20">
      <div className="mx-auto max-w-5xl px-4">
        <Pph21TerCalculator lang={lang} />
      </div>
    </main>
  );
}
