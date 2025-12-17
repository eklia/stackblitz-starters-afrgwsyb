// components/layout/Navbar.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { Lang } from '@/lib/types';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { buildLangHref } from '@/lib/utils'; 
import { getTranslations } from '@/lib/i18n';

type Props = {
  lang: Lang;
};

export function Navbar({ lang }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const t = getTranslations(lang); 
  const nav = t.nav;                 

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-30 transition-colors',
        scrolled ? 'bg-white/90 shadow-sm backdrop-blur' : 'bg-transparent'
      )}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href={`/${lang}`} className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-600 text-sm font-semibold text-emerald-50 shadow-lg shadow-emerald-500/40">
            CP
          </div>
          <span className="text-base font-semibold text-slate-900">
            CekPajak
          </span>
        </Link>

        {/* Menu desktop */}
        <div className="hidden items-center gap-6 md:flex">
          <Link
            href={buildLangHref(lang ,`#beranda`)}
            className="text-sm font-medium text-slate-700 hover:text-slate-900"
          >
            {nav.home}
          </Link>
          <Link
            href={buildLangHref(lang ,`#layanan`)}
            className="text-sm font-medium text-slate-700 hover:text-slate-900"
          >
            {nav.services}
          </Link>
          <Link
            href={buildLangHref(lang ,`#tentang`)}
            className="text-sm font-medium text-slate-700 hover:text-slate-900"
          >
            {nav.about}
          </Link>
          <Link
            href={buildLangHref(lang ,`#faq`)}
            className="text-sm font-medium text-slate-700 hover:text-slate-900"
          >
            {nav.faq}
          </Link>

          <LanguageSwitcher lang={lang} />

          <Link
            href={buildLangHref(lang ,`/request`)}
            className="rounded-full bg-emerald-700 px-4 py-2 text-xs font-semibold text-emerald-50 shadow-lg shadow-emerald-500/30 hover:bg-emerald-800"
          >
            {nav.freeConsult}
          </Link>

          <Link
            href={buildLangHref(lang ,`/calculators`)}
            className="rounded-full bg-emerald-700 px-4 py-2 text-xs font-semibold text-emerald-50 shadow-lg shadow-emerald-500/30 hover:bg-emerald-800"
          >
            {nav.tryCalculator}
          </Link>
        </div>

        {/* mobile: language + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher lang={lang} />
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-emerald-100 bg-white/80 text-slate-900 shadow-sm"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <div className="flex flex-col items-center justify-center gap-[3px]">
              <span
                className={cn(
                  'block h-0.5 w-4 rounded bg-slate-900 transition',
                  open && 'translate-y-[3px] rotate-45'
                )}
              />
              <span
                className={cn(
                  'block h-0.5 w-4 rounded bg-slate-900 transition',
                  open && 'opacity-0'
                )}
              />
              <span
                className={cn(
                  'block h-0.5 w-4 rounded bg-slate-900 transition',
                  open && '-translate-y-[3px] -rotate-45'
                )}
              />
            </div>
          </button>
        </div>
      </nav>

      {/* Dropdown mobile */}
      {open && (
        <div className="border-t border-emerald-100 bg-white/95 backdrop-blur md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3 text-sm">
            <Link
              href="#beranda"
              className="py-1 text-slate-700"
              onClick={() => setOpen(false)}
            >
              {nav.home}
            </Link>
            <Link
              href="#layanan"
              className="py-1 text-slate-700"
              onClick={() => setOpen(false)}
            >
              {nav.services}
            </Link>
            <Link
              href="#tentang"
              className="py-1 text-slate-700"
              onClick={() => setOpen(false)}
            >
              {nav.about}
            </Link>
            <Link
              href="#faq"
              className="py-1 text-slate-700"
              onClick={() => setOpen(false)}
            >
              {nav.faq}
            </Link>

            <Link
              href={buildLangHref(lang ,`/request`)}
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-emerald-700 px-4 py-2 text-xs font-semibold text-emerald-50 shadow-lg shadow-emerald-500/30 hover:bg-emerald-800"
            >
              {nav.freeConsult}
            </Link>

            <Link
              href={buildLangHref(lang ,`/calculators/pph21-ter`)}
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-emerald-700 px-4 py-2 text-xs font-semibold text-emerald-50 shadow-lg shadow-emerald-500/30 hover:bg-emerald-800"
            >
              {nav.tryCalculator}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
