// app/[lang]/layout.tsx
import type { ReactNode } from 'react';
import type { Lang } from '@/lib/types';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { getTranslations } from '@/lib/i18n';

type Props = {
  children: ReactNode;
  params: {
    lang: Lang;
  };
};

export default function LangLayout({ children, params }: Props) {
  const lang: Lang = params.lang === 'en' ? 'en' : 'id';
  const t = getTranslations(lang);

  return (
    <>
      {/* Header global */}
      <Navbar lang={lang} />

      {/* Konten halaman (hero, calculators, dll) */}
      <main className="min-h-screen pt-16 md:pt-20">
        {children}
      </main>

      {/* Footer global, pakai translation sesuai lang */}
      <Footer t={t.footer} />
    </>
  );
}
