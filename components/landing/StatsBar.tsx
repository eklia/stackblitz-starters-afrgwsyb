// components/landing/StatsBar.tsx
import type { Translations } from '@/lib/i18n';
import type { Lang } from '@/lib/types';
import { Container } from '@/components/layout/Container';

type Props = {
  t: Translations['stats'];
  lang: Lang;
};

export function StatsBar({ t, lang }: Props) {
  return (
    <section className="bg-emerald-700 py-4 md:py-5">
      <Container>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-4">
          {t.items.map((item, idx) => (
            <div key={idx} className="text-center text-emerald-50 md:text-left">
              <div className="text-lg font-semibold md:text-2xl">
                {item.value}
              </div>
              <div className="text-[11px] text-emerald-100 md:text-sm">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
