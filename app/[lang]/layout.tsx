import type { ReactNode } from 'react';
import type { Lang } from '@/lib/types';
import { getTranslations } from '@/lib/i18n';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

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
    <html lang={lang}>
      <body className="bg-emerald-50/40 text-slate-900">
        <Navbar lang={lang} />
        <main className="pt-16 md:pt-20">{children}</main>
        <Footer t={t.footer} />
      </body>
    </html>
  );
}
