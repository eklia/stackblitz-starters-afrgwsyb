// components/landing/Services.tsx
import Link from 'next/link';
import type { Translations } from '@/lib/i18n';
import { Container } from '@/components/layout/Container';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

type Props = {
  t: Translations['services'];
};

type ServiceItem = Translations['services']['items'][number];

export function Services({ t }: Props) {
  return (
    <section id="layanan" className="bg-emerald-50/40 py-12 md:py-16">
      <Container>
        {/* Header section + link ke halaman kalkulator */}
        <div className="mb-8 flex flex-col items-center gap-3 md:mb-10 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            title={t.heading}
            highlight={t.highlight}
            subtitle={t.subtitle}
            align="left" // sebelumnya "center", boleh kamu ubah lagi kalau mau
            className="mb-0 md:mb-0"
          />

          <Link
            href="/calculators"
            className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            Lihat semua kalkulator
            <span aria-hidden>→</span>
          </Link>
        </div>

        {/* List layanan */}
        <div className="space-y-10 md:space-y-14">
          {t.items.map((item, index) => (
            <ServiceBlock key={index} item={item} index={index} />
          ))}
        </div>
      </Container>
    </section>
  );
}

type BlockProps = {
  item: ServiceItem;
  index: number;
};

function ServiceBlock({ item, index }: BlockProps) {
  const isReversedOnDesktop = index === 1; // layanan tengah dibalik

  // mapping index -> key service
  const serviceKeys = ['individual', 'company', 'consultation'];
  const serviceKey = serviceKeys[index] ?? 'individual'; // fallback kalau nambah item baru

  return (
    <div
      className={cn(
        'flex flex-col gap-6 md:gap-10 md:items-center',
        isReversedOnDesktop ? 'md:flex-row-reverse' : 'md:flex-row'
      )}
    >
      {/* Teks / deskripsi */}
      <div className="md:w-1/2">
        {item.badge && (
          <div className="mb-2 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            {item.badge}
          </div>
        )}

        <h3 className="text-xl font-semibold text-slate-900 md:text-2xl">
          {item.title}
        </h3>

        {item.description && (
          <p className="mt-2 text-sm text-slate-600 md:text-base">
            {item.description}
          </p>
        )}

        {item.bullets && item.bullets.length > 0 && (
          <ul className="mt-4 space-y-1.5 text-sm text-slate-700">
            {item.bullets.map((point, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Harga + CTA */}
        <div className="mt-5 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          {item.priceLabel && item.priceValue && (
            <div className="text-sm text-slate-700">
              <span className="text-slate-500">{item.priceLabel} </span>
              <span className="font-semibold text-emerald-700">
                {item.priceValue}
              </span>
            </div>
          )}

          {item.ctaLabel && (
            <Link href={`/request?service=${serviceKey}`}>
              <Button
                type="button"
                variant="secondary"
                size="md"
                className="border-emerald-200 whitespace-nowrap"
              >
                {item.ctaLabel}
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Kartu visual */}
      <div className="md:w-1/2">
        <div className="relative mx-auto max-w-md">
          {/* layer hijau di belakang */}
          <div className="pointer-events-none absolute inset-0 translate-x-4 translate-y-4 rounded-3xl bg-emerald-600/70 blur-[2px]" />

          {/* kartu utama */}
          <div className="relative overflow-hidden rounded-3xl bg-white p-7 shadow-soft ring-1 ring-emerald-50 transition hover:-translate-y-1 hover:shadow-lg md:p-8">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
                  {item.tagNumber ?? index + 1}
                </div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {item.tagLabel ?? item.badge}
                </div>
              </div>
              <span className="text-[11px] font-medium text-emerald-600">
                {item.badge}
              </span>
            </div>

            <p className="text-base font-semibold text-slate-900 md:text-lg">
              {item.title}
            </p>

            {item.description && (
              <p className="mt-2 text-sm text-slate-600">{item.description}</p>
            )}

            <div className="mt-4 h-px w-16 rounded-full bg-emerald-100" />

            {item.priceLabel && item.priceValue && (
              <p className="mt-3 text-xs text-slate-500">
                {item.priceLabel}{' '}
                <span className="font-semibold text-emerald-700">
                  {item.priceValue}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
