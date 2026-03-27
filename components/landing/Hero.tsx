// components/landing/Hero.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // ⬅️ NEW

import type { Translations } from '@/lib/i18n';
import type { Lang } from '@/lib/types';
import { buildLangHref } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

type Props = {
  t: Translations['hero'];
  lang: Lang;
};

// ⬇️ Promo sekarang boleh pakai image, text tetap opsional
type Promo = {
  badge?: string;
  title?: string;
  subtitle?: string;
  href?: string;
  imageUrl?: string;   // e.g. "/promos/promo-year-end-id.jpg"
  imageAlt?: string;   // e.g. "Promo akhir tahun SPT Tahunan Pribadi"
};

export function Hero({ t, lang }: Props) {
  const promos: Promo[] = t.promos ?? [];
  const [promoIndex, setPromoIndex] = useState(0);

  useEffect(() => {
    if (promos.length <= 1) return;
    const id = setInterval(
      () => setPromoIndex((i) => (i + 1) % promos.length),
      8000
    );
    return () => clearInterval(id);
  }, [promos.length]);

  const activePromo = promos[promoIndex];
  const hasImage = !!activePromo?.imageUrl;

  const goTo = (dir: 'prev' | 'next') => {
    if (promos.length === 0) return;
    setPromoIndex((i) => {
      if (dir === 'prev') return (i - 1 + promos.length) % promos.length;
      return (i + 1) % promos.length;
    });
  };

  return (
    <section id="beranda" className="pt-4 pb-10 md:pb-14">
      {/* === PROMO SLIDER === */}
      {promos.length > 0 && activePromo && (
        <div className="-mx-4 mb-4 sm:-mx-6 md:mb-6 lg:-mx-8">
          {hasImage ? (
            // ====== VARIAN IMAGE-BANNER (baru) ======
            <div className="relative overflow-hidden rounded-[28px] bg-emerald-700/90">
              {/* Banner image */}
              {activePromo.href ? (
                <Link
                  href={buildLangHref(lang, activePromo.href)}
                  className="block"
                >
                  <div className="relative h-32 sm:h-40 md:h-52 lg:h-60">
                    <Image
                      src={activePromo.imageUrl!}
                      alt={activePromo.imageAlt ?? activePromo.title ?? 'Promo'}
                      fill
                      sizes="100vw"
                      className="object-cover"
                      priority
                    />
                  </div>
                </Link>
              ) : (
                <div className="relative h-32 sm:h-40 md:h-52 lg:h-60">
                  <Image
                    src={activePromo.imageUrl!}
                    alt={activePromo.imageAlt ?? activePromo.title ?? 'Promo'}
                    fill
                    sizes="100vw"
                    className="object-cover"
                    priority
                  />
                </div>
              )}

              {/* Gradient tipis supaya nyambung ke brand hijau */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-emerald-900/40 via-transparent to-transparent" />

              {/* Arrows kiri bawah */}
              {promos.length > 1 && (
                <div className="absolute bottom-3 left-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => goTo('prev')}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-emerald-700 shadow-md shadow-emerald-900/20 hover:bg-emerald-50"
                    aria-label="Promo sebelumnya"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => goTo('next')}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-emerald-700 shadow-md shadow-emerald-900/20 hover:bg-emerald-50"
                    aria-label="Promo berikutnya"
                  >
                    ›
                  </button>
                </div>
              )}

              {/* Dots di tengah bawah */}
              {promos.length > 1 && (
                <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
                  {promos.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPromoIndex(i)}
                      className={`h-1.5 rounded-full bg-emerald-100/80 transition-all ${
                        i === promoIndex
                          ? 'w-5 bg-emerald-300'
                          : 'w-2 bg-emerald-50/80'
                      }`}
                      aria-label={`Promo ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            // ====== FALLBACK: VARIAN TEXT LAMA ======
            <div>
              <div className="flex flex-col gap-2 rounded-none bg-emerald-600 px-4 py-3 text-emerald-50 shadow-lg md:flex-row md:items-center md:justify-between md:px-8">
                <div className="flex items-start gap-3 md:items-center">
                  {activePromo.badge && (
                    <span className="mt-0.5 inline-flex rounded-full bg-emerald-500/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide">
                      {activePromo.badge}
                    </span>
                  )}
                  <div>
                    {activePromo.title && (
                      <div className="text-sm font-semibold md:text-base">
                        {activePromo.title}
                      </div>
                    )}
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
                      href={buildLangHref(lang, activePromo.href)}
                      className="text-xs font-semibold underline-offset-2 hover:underline"
                    >
                      Lihat detail
                    </Link>
                  )}
                  {promos.length > 1 && (
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
                  )}
                </div>
              </div>

              {promos.length > 1 && (
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
              )}
            </div>
          )}
        </div>
      )}

      {/* === HERO CARD UTAMA (tidak diubah) === */}
      <div className="relative overflow-hidden rounded-[32px] border border-emerald-100 bg-white/80 p-5 shadow-soft md:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-emerald-100/60 blur-2xl" />

        <div className="relative z-[1] flex flex-col-reverse gap-8 md:grid md:grid-cols-[minmax(0,3fr)_minmax(0,2.5fr)] md:items-center">
          <div className="space-y-4 text-center md:text-left">
            <div className="inline-flex items-center rounded-full bg-emerald-100/80 px-3 py-1 text-[11px] font-medium text-emerald-800 shadow-sm">
              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {t.badge}
            </div>

            <h1 className="mt-4 text-3xl font-semibold leading-tight text-slate-900 md:text-4xl lg:text-5xl">
              <span className="block">{t.titleLine1}</span>
              <span className="block">
                {t.titleLine2}{' '}
                <span className="text-emerald-600">{t.titleEm}</span>
              </span>
            </h1>

            <p className="mt-3 max-w-xl text-sm text-slate-600 md:text-base">
              {t.subtitle}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-1 md:justify-start">
              <Link href={buildLangHref(lang, '/request')}>
                <Button variant="primary" size="md">
                  {t.primaryCta}
                </Button>
              </Link>

              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => {
                  const el = document.querySelector('#layanan');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
              >
                {t.secondaryCta}
              </Button>
            </div>

            <div className="mt-4 inline-flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/60 px-3 py-2 text-[11px] md:mt-5 md:px-4 md:py-3">
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="font-semibold text-emerald-900">
                  {t.calculatorHelperTitle}
                </span>
                <span className="text-[11px] text-emerald-700">
                  {t.calculatorHelperSubtitle}
                </span>
              </div>
              <Link href={buildLangHref(lang, `/calculators`)}>
                <Button
                  size="sm"
                  variant="ghost"
                  className="whitespace-nowrap border border-emerald-300 bg-white/80 text-emerald-800 hover:border-emerald-400 hover:bg-emerald-50"
                >
                  {t.calculatorCta}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
