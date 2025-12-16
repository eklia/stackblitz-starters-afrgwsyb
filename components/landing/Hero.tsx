'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Translations } from '@/lib/i18n';
import { Button } from '@/components/ui/Button';

type Props = {
  t: Translations['hero'];
};

type Promo = {
  badge: string;
  title: string;
  subtitle?: string;
  href?: string;
};

export function Hero({ t }: Props) {
  const promos: Promo[] = (t as any).promos ?? [
    {
      badge: 'Promo Akhir Tahun',
      title: 'Diskon 20% untuk laporan SPT Tahunan Pribadi.',
      subtitle: 'Berlaku untuk pendaftaran sebelum 31 Desember 2025.',
      href: '#layanan',
    },
    {
      badge: 'Prioritas UMKM',
      title: 'Layanan paket pajak bulanan khusus UMKM.',
      subtitle: 'Mulai dari Rp 300.000/bulan untuk pengelolaan pajak rutin.',
      href: '#layanan',
    },
    {
      badge: 'Konsultasi Gratis',
      title: 'Sesi konsultasi awal 30 menit tanpa biaya.',
      subtitle: 'Bantu cek kondisi pajak kamu sebelum mulai berlangganan.',
      href: '/request',
    },
  ];

  const [promoIndex, setPromoIndex] = useState(0);

  useEffect(() => {
    if (promos.length <= 1) return;
    const id = setInterval(() => {
      setPromoIndex((i) => (i + 1) % promos.length);
    }, 8000);
    return () => clearInterval(id);
  }, [promos.length]);

  const activePromo = promos[promoIndex];

  const goTo = (dir: 'prev' | 'next') => {
    setPromoIndex((i) => {
      if (dir === 'prev') return (i - 1 + promos.length) % promos.length;
      return (i + 1) % promos.length;
    });
  };

  return (
    <section id="beranda" className="pt-4 pb-10 md:pb-14">
      {/* PROMO SLIDER FULL-BLEED */}
      {promos.length > 0 && (
        <div className="-mx-4 mb-4 sm:-mx-6 md:mb-6 lg:-mx-8">
          <div className="flex flex-col gap-2 rounded-none bg-emerald-600 px-4 py-3 text-emerald-50 shadow-lg md:flex-row md:items-center md:justify-between md:px-8">
            <div className="flex items-start gap-3 md:items-center">
              <span className="mt-0.5 inline-flex rounded-full bg-emerald-500/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide">
                {activePromo.badge}
              </span>
              <div>
                <div className="text-sm font-semibold md:text-base">
                  {activePromo.title}
                </div>
                {activePromo.subtitle && (
                  <div className="mt-0.5 text-[11px] text-emerald-100/90 md:text-xs">
                    {activePromo.subtitle}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between gap-3 md:mt-0 md:justify-end">
              {activePromo.href && (
                <Link
                  href={activePromo.href}
                  className="text-xs font-semibold underline-offset-2 hover:underline"
                >
                  Lihat detail
                </Link>
              )}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => goTo('prev')}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/80 text-xs font-semibold hover:bg-emerald-400"
                  aria-label="Promo sebelumnya"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => goTo('next')}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/80 text-xs font-semibold hover:bg-emerald-400"
                  aria-label="Promo berikutnya"
                >
                  ›
                </button>
              </div>
            </div>
          </div>

          {/* DOTS */}
          <div className="mt-2 flex justify-center gap-1.5">
            {promos.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPromoIndex(i)}
                className={`h-1.5 rounded-full bg-emerald-200 transition-all ${
                  i === promoIndex ? 'w-4 bg-emerald-600' : 'w-2'
                }`}
                aria-label={`Promo ${i + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* KARTU HERO UTAMA (teks + SPT card) */}
      <div className="relative overflow-hidden rounded-[32px] border border-emerald-100 bg-white/80 p-5 shadow-soft md:p-8">
        {/* dekorasi background */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-emerald-100/60 blur-2xl" />

        <div className="relative z-[1] flex flex-col-reverse gap-8 md:grid md:grid-cols-[minmax(0,3fr)_minmax(0,2.5fr)] md:items-center">
          {/* Kartu SPT kanan */}
          <div className="flex justify-center md:justify-end">
            <div className="relative w-full max-w-sm md:max-w-md">
              {/* layer hijau di belakang */}
              <div className="pointer-events-none absolute inset-0 translate-x-4 translate-y-4 rounded-3xl bg-emerald-600/70 blur-[2px]" />

              {/* kartu utama */}
              <div className="relative overflow-hidden rounded-3xl bg-white p-5 shadow-lg shadow-emerald-100 ring-1 ring-emerald-50 md:p-6">
                <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                      SPT Tahunan
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Klien individu · 2024
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-semibold text-emerald-700">
                    Proses 2–3 Hari
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
                    <span className="text-slate-500">Status</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                      ✓ Terlapor
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
                    <span className="text-slate-500">Tanggal Lapor</span>
                    <span className="text-[11px] font-medium text-slate-900">
                      15 Maret 2024
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
                    <span className="text-slate-500">Penghematan Pajak</span>
                    <span className="text-[11px] font-semibold text-emerald-700">
                      Rp 5,7 Juta
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
                    100% Online & Offline
                  </span>
                  <span>Tanpa denda telat lapor</span>
                </div>
              </div>
            </div>
          </div>

          {/* Teks kiri */}
          <div className="space-y-4 text-center md:text-left">
            {/* Badge kecil */}
            <div className="inline-flex items-center rounded-full bg-emerald-100/80 px-3 py-1 text-[11px] font-medium text-emerald-800 shadow-sm">
              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {t.badge}
            </div>

            {/* Judul */}
            <h1 className="mt-4 text-3xl font-semibold leading-tight text-slate-900 md:text-4xl lg:text-5xl">
              <span className="block">{t.titleLine1}</span>
              <span className="block">
                {t.titleLine2}{' '}
                <span className="text-emerald-600">{t.titleEm}</span>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-3 max-w-xl text-sm text-slate-600 md:text-base">
              {t.subtitle}
            </p>

            {/* CTA */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1 md:justify-start">
              {/* Primary → /request */}
              <Link href="/request">
                <Button variant="primary" size="md">
                  {t.primaryCta}
                </Button>
              </Link>

              {/* Secondary → scroll ke layanan */}
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => {
                  const el = document.querySelector('#layanan');
                  if (el) {
                    el.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start',
                    });
                  }
                }}
              >
                {t.secondaryCta}
              </Button>
            </div>

            {/* NEW: CALCULATOR CTAS */}
            <div className="mt-4 inline-flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/60 px-3 py-2 text-[11px] md:mt-5 md:px-4 md:py-3">
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="font-semibold text-emerald-900">
                  {t.calculatorHelper}
                </span>
                <span className="text-[11px] text-emerald-700">
                  Cocok untuk cek cepat kewajiban pajak sebelum konsultasi.
                </span>
              </div>
              <Link href="/calculators">
                <Button
                  size="sm"
                  variant="ghost"
                  className="whitespace-nowrap border border-emerald-300 bg-white/80 text-emerald-800 hover:border-emerald-400 hover:bg-emerald-50"
                >
                  {t.calculatorCta}
                </Button>
              </Link>
            </div>

            {/* Rating & “dipercaya” */}
            <div className="flex flex-col gap-2 pt-1 text-xs text-slate-600 md:flex-row md:items-center md:gap-4">
              <div className="flex items-center justify-center gap-2 md:justify-start">
                <div className="flex -space-x-2">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="h-7 w-7 rounded-full bg-emerald-500/80"
                    />
                  ))}
                </div>
                <div>
                  <div className="font-semibold text-slate-900">
                    {t.ratingMain}
                  </div>
                  <div className="text-[11px] text-amber-500">★★★★★</div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 md:justify-start">
                <span className="h-px w-8 bg-emerald-200 md:w-10" />
                <span className="text-[11px] text-slate-500">
                  Dipercaya klien individu & bisnis di berbagai kota.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
