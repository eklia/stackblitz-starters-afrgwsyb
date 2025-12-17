import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { buildLangHref } from '@/lib/utils'; 
import { Lang } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Daftar Kalkulator Pajak | CekPajak',
};

type CalculatorItem = {
  id: string;
  name: string;
  description: string;
  type: 'standard' | 'advanced';
  priceLabel: string;
  status: 'live' | 'coming-soon';
  href?: string;
};

const calculators: CalculatorItem[] = [
  {
    id: 'pph21-basic',
    name: 'Kalkulator PPh 21 (Basic)',
    description:
      'Hitung estimasi PPh 21 bulanan dan tahunan berdasarkan gaji bruto. Cocok untuk simulasi cepat karyawan tetap.',
    type: 'standard',
    priceLabel: 'Gratis',
    status: 'live',
    href: '/calculators/pph21',
  },
  {
    id: 'pph21-ter-basic',
    name: 'Kalkulator PPh 21 (TER)',
    description:
      'Hitung estimasi PPh 21 bulanan dan tahunan berdasarkan gaji bruto. Cocok untuk simulasi cepat karyawan tetap.',
    type: 'standard',
    priceLabel: 'Gratis',
    status: 'live',
    href: '/calculators/pph21-ter',
  },
  {
    id: 'individual-advanced',
    name: 'Kalkulator Pajak Perorangan (Advanced)',
    description:
      'Perhitungan pajak penghasilan perorangan yang lebih kompleks, termasuk berbagai sumber penghasilan.',
    type: 'advanced',
    priceLabel: 'Berbayar (via QRIS)',
    status: 'coming-soon',
  },
  {
    id: 'corporate-advanced',
    name: 'Kalkulator Pajak Badan Usaha (Advanced)',
    description:
      'Simulasi kewajiban pajak badan untuk UMKM hingga perusahaan besar dengan aturan yang lebih lengkap.',
    type: 'advanced',
    priceLabel: 'Berbayar (via QRIS)',
    status: 'coming-soon',
  },
  {
    id: 'professional-advanced',
    name: 'Kalkulator Pajak Profesional (Advanced)',
    description:
      'Dirancang untuk profesi tertentu (konsultan, kreator, freelancer) dengan skema penghasilan yang bervariasi.',
    type: 'advanced',
    priceLabel: 'Berbayar (via QRIS)',
    status: 'coming-soon',
  },
];

type PageProps = {
  params: {
    lang: Lang;
  };
};

export default function CalculatorsPage({ params }: PageProps) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-emerald-50/40 to-slate-50">
      <Container>
        {/* Header */}
        <header className="mb-8 md:mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
            Kalkulator Pajak
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">
            Daftar Kalkulator CekPajak
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
            Gunakan kalkulator standar untuk simulasi pajak dasar secara gratis.
            Untuk kebutuhan perhitungan yang lebih kompleks, kalkulator{' '}
            <span className="font-semibold text-slate-800">advanced</span> akan
            tersedia sebagai layanan berbayar pada rilis berikutnya.
          </p>
        </header>

        {/* Grid kalkulator */}
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {calculators.map((calc) => {
            const isLive = calc.status === 'live';
            const isStandard = calc.type === 'standard';

            return (
              <article
                key={calc.id}
                className="flex h-full flex-col rounded-3xl bg-white/90 p-5 shadow-soft ring-1 ring-slate-100/80 backdrop-blur md:p-6"
              >
                {/* Badge */}
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2">
                    <span
                      className={
                        isStandard
                          ? 'inline-flex items-center rounded-full bg-emerald-50 px-3 py-[5px] text-[11px] font-semibold uppercase tracking-wide text-emerald-700'
                          : 'inline-flex items-center rounded-full bg-amber-50 px-3 py-[5px] text-[11px] font-semibold uppercase tracking-wide text-amber-700'
                      }
                    >
                      {isStandard
                        ? 'Kalkulator Standar'
                        : 'Kalkulator Advanced'}
                    </span>

                    <span className="text-[11px] font-medium text-slate-400">
                      {calc.priceLabel}
                    </span>
                  </div>

                  {calc.status === 'coming-soon' && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-[3px] text-[11px] font-medium text-slate-500">
                      Segera Hadir
                    </span>
                  )}
                </div>

                {/* Title + desc */}
                <h2 className="text-base font-semibold text-slate-900 md:text-lg">
                  {calc.name}
                </h2>
                <p className="mt-2 flex-1 text-sm text-slate-600">
                  {calc.description}
                </p>

                {/* CTA */}
                <div className="mt-4 flex items-center justify-between pt-1">
                  {isLive && calc.href ? (
                    <Link href={buildLangHref(params.lang, calc.href)}>
                      <Button variant="primary" size="sm">
                        Buka Kalkulator
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled
                      className="cursor-not-allowed opacity-60"
                    >
                      Segera Hadir
                    </Button>
                  )}

                  <p className="text-[11px] text-slate-400">
                    ID: <span className="font-mono">{calc.id}</span>
                  </p>
                </div>
              </article>
            );
          })}
        </section>

        {/* Info kecil di bawah */}
        <p className="mt-6 text-[11px] text-slate-500 md:text-xs">
          Catatan: daftar di atas masih dapat berubah sesuai prioritas rilis.
          Untuk fase pertama, fokus utama adalah memastikan kalkulator standar
          berjalan akurat dan mudah digunakan.
        </p>
      </Container>
    </main>
  );
}
