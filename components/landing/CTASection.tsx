// components/landing/CTASection.tsx
import type { Translations } from '@/lib/i18n';
import type { Lang } from '@/lib/types';
import { buildLangHref } from '@/lib/utils'; 
import Link from 'next/link';

type Props = {
  t: Translations['cta'];
  lang: Lang;
};

export function CTASection({ t, lang }: Props) {
  return (
    <section className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 py-10 md:py-12">
      <div className="mx-auto max-w-6xl px-4 text-center text-emerald-50">
        <h2 className="text-2xl font-semibold md:text-3xl">
          {t.headingLine1} <span className="font-bold">{t.headingLine2}</span>
        </h2>
        <p className="mt-2 text-sm text-emerald-100 md:text-base">
          {t.subtitle}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={buildLangHref(lang, "/request")}
            className="rounded-full bg-emerald-50 px-6 py-2.5 text-sm font-semibold text-emerald-900 shadow-lg shadow-emerald-900/40 hover:bg-white"
          >
            {t.primaryCta}
          </Link>
          <a
            href={buildLangHref(lang, "#contact")}
            className="rounded-full border border-emerald-100/70 px-6 py-2.5 text-sm font-semibold text-emerald-50 hover:border-white hover:bg-emerald-600/40"
          >
            {t.secondaryCta}
          </a>
        </div>

        {/* Entry point ke kalkulator */}
        <div className="mt-2 text-xs text-slate-500 md:text-sm">
          <Link
            href={buildLangHref(lang, "/calculators/pph21")}
            className="font-medium text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            atau mulai dari Kalkulator Pajak Gratis →
          </Link>
        </div>
      </div>
    </section>
  );
}
