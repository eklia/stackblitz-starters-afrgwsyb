// app/[lang]/page.tsx
'use client';

import { Lang } from '@/lib/types';
import { getTranslations } from '@/lib/i18n';
import { Hero } from '@/components/landing/Hero';
import { StatsBar } from '@/components/landing/StatsBar';
import { WhyChoose } from '@/components/landing/WhyChoose';
import { Services } from '@/components/landing/Services';
import { Industries } from '@/components/landing/Industries';
import { Partners } from '@/components/landing/Partners';
import { Testimonials } from '@/components/landing/Testimonials';
import { FAQ } from '@/components/landing/FAQ';
import { CTASection } from '@/components/landing/CTASection';

type PageProps = {
  params: {
    lang: Lang;
  };
};

export default function LandingPage({ params }: PageProps) {
  const lang: Lang = params.lang === 'en' ? 'en' : 'id';
  const t = getTranslations(lang);

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-emerald-50/40 to-slate-50">
      <Hero t={t.hero} lang={lang} />
      <StatsBar t={t.stats} lang={lang} />
      <WhyChoose t={t.whyChoose} lang={lang} />
      <Services t={t.services} lang={lang} />
      <Industries t={t.industries} lang={lang} />
      <Partners t={t.partners} lang={lang} />
      <Testimonials t={t.testimonials} lang={lang} />
      <FAQ t={t.faq} lang={lang} />
      <CTASection t={t.cta} lang={lang} />
    </main>
  );
}
