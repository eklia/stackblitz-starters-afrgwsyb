// components/landing/FAQ.tsx
'use client';

import { useState } from 'react';
import { Container } from '@/components/layout/Container';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { cn } from '@/lib/utils';

type Props = {
  t: any; // longgar supaya cocok dengan struktur i18n kamu
};

export function FAQ({ t }: Props) {
  const items: any[] = t?.items ?? t?.questions ?? t?.faqs ?? [];

  return (
    <section id="faq" className="bg-white py-12 md:py-16">
      <Container>
        <SectionHeader
          title={t?.heading ?? 'Pertanyaan'}
          highlight={t?.highlight ?? 'Umum'}
          subtitle={
            t?.subtitle ??
            'Temukan jawaban untuk pertanyaan yang sering diajukan.'
          }
          align="center"
          className="mb-8 md:mb-10"
        />

        <div className="mx-auto max-w-2xl space-y-3">
          {items.map((item, idx) => (
            <FAQItem key={idx} item={item} defaultOpen={idx === 0} />
          ))}
        </div>

        {/* CTA kecil di bawah */}
        {t?.ctaLabel && t?.ctaHref && (
          <div className="mt-8 text-center text-sm">
            <span className="text-slate-600">{t.ctaLabel} </span>
            <a
              href={t.ctaHref}
              className="font-semibold text-emerald-700 hover:underline"
            >
              {t.ctaText ?? 'Hubungi Tim Kami'}
            </a>
          </div>
        )}
      </Container>
    </section>
  );
}

type FAQItemProps = {
  item: any;
  defaultOpen?: boolean;
};

function FAQItem({ item, defaultOpen = false }: FAQItemProps) {
  const [open, setOpen] = useState(defaultOpen);
  const question = item.question ?? item.q ?? '';
  const answer = item.answer ?? item.a ?? item.body ?? '';

  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50/40">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left md:px-5 md:py-4"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-sm font-medium text-slate-900 md:text-[15px]">
          {question}
        </span>
        <span
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-full border border-emerald-100 bg-white text-xs font-semibold text-slate-900 transition',
            open && 'rotate-90'
          )}
        >
          ❯
        </span>
      </button>

      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-200 ease-in-out',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className="min-h-0">
          <div className="px-4 pb-4 text-sm leading-relaxed text-slate-600 md:px-5 md:pb-5">
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
}
