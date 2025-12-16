// components/landing/Partners.tsx
import type { Translations } from '@/lib/i18n';

type Props = {
  t: Translations['partners'];
};

export function Partners({ t }: Props) {
  return (
    <section id="tentang" className="bg-white py-10 md:py-14">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-6 text-center md:mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            {t.heading}
          </h2>
          <p className="mt-1 text-sm text-slate-600 md:text-base">
            {t.subtitle}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-6">
          {t.items.map((name, idx) => (
            <div
              key={idx}
              className="flex h-16 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-xs font-medium text-slate-500 shadow-sm md:text-sm"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
