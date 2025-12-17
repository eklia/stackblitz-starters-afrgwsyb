// components/landing/WhyChoose.tsx
import type { Translations } from '@/lib/i18n';
import type { Lang } from '@/lib/types';
import { Container } from '@/components/layout/Container';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { cn } from '@/lib/utils';

type Props = {
  t: Translations['whyChoose'];
  lang: Lang;
};

export function WhyChoose({ t, lang }: Props) {
  return (
    <section id="tentang" className="bg-white py-12 md:py-16">
      <Container>
        <SectionHeader
          title={t.heading}
          highlight={t.highlight}
          subtitle={t.subtitle}
          align="center"
          className="mb-10 md:mb-12"
        />

        {/* 6 kartu: mobile 1 kolom, tablet 2, desktop 3 */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {t.cards.map((card, idx) => (
            <WhyCard key={idx} card={card} index={idx} />
          ))}
        </div>
      </Container>
    </section>
  );
}

type WhyCardType = Translations['whyChoose']['cards'][number];

type CardProps = {
  card: WhyCardType;
  index: number;
};

function WhyCard({ card, index }: CardProps) {
  const colors = [
    'bg-emerald-100 text-emerald-700',
    'bg-sky-100 text-sky-700',
    'bg-amber-100 text-amber-700',
  ];

  return (
    <div className="group h-full rounded-3xl bg-emerald-50/60 p-5 shadow-soft transition hover:-translate-y-1 hover:bg-emerald-50 hover:shadow-lg md:p-6">
      {/* Badge angka kecil */}
      <div
        className={cn(
          'mb-4 inline-flex h-9 w-9 items-center justify-center rounded-2xl text-xs font-semibold',
          colors[index % colors.length]
        )}
      >
        {index + 1}
      </div>

      <h3 className="text-base font-semibold text-slate-900 md:text-lg">
        {card.title}
      </h3>

      {card.body && (
        <p className="mt-2 text-sm text-slate-600 md:text-[15px]">
          {card.body}
        </p>
      )}
    </div>
  );
}
