// components/landing/Industries.tsx
import type { Translations } from '@/lib/i18n';
import type { Lang } from '@/lib/types';

type Props = {
  t: Translations['industries'];
  lang: Lang;
};

export function Industries({ t, lang }: Props) {
  return (
    <section className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-6 text-center md:mb-8">
          <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
            {t.heading} <span className="text-emerald-600">{t.highlight}</span>
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
            {t.subtitle}
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          {t.items.map((name, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-center text-xs font-medium text-slate-700 shadow-sm hover:border-emerald-200 hover:bg-emerald-50 md:text-sm"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
