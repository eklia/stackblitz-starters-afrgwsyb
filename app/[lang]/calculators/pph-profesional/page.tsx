// app/[lang]/calculators/pph-profesional/page.tsx
import { PphProfesionalCalculator } from '@/components/calculators/PphProfesionalCalculator';
import type { Lang } from '@/lib/types';

type Props = { params: { lang: Lang } };

export default function Page({ params }: Props) {
  return <PphProfesionalCalculator lang={params.lang} />;
}
