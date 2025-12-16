// app/page.tsx
'use client';

import { useState } from 'react';
import { Lang } from '@/lib/types';
import { getTranslations } from '@/lib/i18n';
import { Navbar } from '@/components/layout/Navbar';
import { Hero } from '@/components/landing/Hero';
import { StatsBar } from '@/components/landing/StatsBar';
import { WhyChoose } from '@/components/landing/WhyChoose';
import { Services } from '@/components/landing/Services';
import { Industries } from '@/components/landing/Industries';
import { Partners } from '@/components/landing/Partners';
import { Testimonials } from '@/components/landing/Testimonials';
import { FAQ } from '@/components/landing/FAQ';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/layout/Footer';
import { Container } from '@/components/layout/Container';

export default function HomePage() {
  const [lang, setLang] = useState<Lang>('id');
  const t = getTranslations(lang);

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-emerald-50/40 to-slate-50">
      <Navbar lang={lang} onChangeLang={setLang} />

      <Container className="pb-10 pt-24">
        <Hero t={t.hero} />
      </Container>

      <StatsBar t={t.stats} />
      <WhyChoose t={t.whyChoose} />
      <Services t={t.services} />
      <Industries t={t.industries} />
      <Partners t={t.partners} />
      <Testimonials t={t.testimonials} />
      <FAQ t={t.faq} />
      <CTASection t={t.cta} />
      <Footer t={t.footer} />
    </main>
  );
}
