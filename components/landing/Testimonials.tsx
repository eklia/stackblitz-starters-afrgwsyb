// components/landing/Testimonials.tsx
import { Container } from '@/components/layout/Container';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { cn } from '@/lib/utils';
import type { Lang } from '@/lib/types';

type Props = {
  t: any; // longgar dulu, supaya tidak bentrok dengan bentuk i18n
  lang: Lang;
};

export function Testimonials({ t, lang }: Props) {
  const items: any[] = t?.items ?? t?.cards ?? [];

  return (
    <section className="bg-emerald-50/40 py-12 md:py-16">
      <Container>
        <SectionHeader
          title={t?.heading ?? 'Kata'}
          highlight={t?.highlight ?? 'Mereka'}
          subtitle={
            t?.subtitle ??
            'Dengarkan pengalaman klien kami yang telah merasakan manfaat layanan CekPajak.'
          }
          align="center"
          className="mb-10 md:mb-12"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, idx) => (
            <TestimonialCard key={idx} item={item} />
          ))}
        </div>
      </Container>
    </section>
  );
}

type CardProps = {
  item: any;
};

function TestimonialCard({ item }: CardProps) {
  const name = item.name ?? 'Nama Klien';
  const role = item.role ?? item.position ?? '';
  const company = item.company ?? '';
  const quote = item.quote ?? item.body ?? '';

  return (
    <article className="flex h-full flex-col rounded-3xl bg-white p-5 shadow-soft ring-1 ring-emerald-50 transition hover:-translate-y-1 hover:shadow-lg md:p-6">
      {/* Icon kutip + rating */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-xl text-emerald-500">
          “
        </div>
        <div className="flex items-center gap-0.5 text-amber-400">
          {/* static 5 stars untuk feel saja */}
          <span>★</span>
          <span>★</span>
          <span>★</span>
          <span>★</span>
          <span>★</span>
        </div>
      </div>

      {/* Isi quote */}
      <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-600 md:text-[15px]">
        {quote}
      </p>

      {/* Divider tipis */}
      <div className="mb-3 h-px w-12 rounded-full bg-emerald-100" />

      {/* Profil klien */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
          {name
            .split(' ')
            .map((s: string) => s[0])
            .join('')
            .slice(0, 2)}
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900">{name}</div>
          {(role || company) && (
            <div className="text-xs text-slate-500">
              {role}
              {role && company && ' · '}
              {company}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
