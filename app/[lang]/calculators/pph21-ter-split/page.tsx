// app/[lang]/calculators/pph21-ter-split/page.tsx
import { Pph21TerSplitCalculator } from '@/components/calculators/Pph21TerSplitCalculator';
import type { Lang } from '@/lib/types';

type Props = { params: { lang: Lang } };

export default function Page({ params }: Props) {
  return <Pph21TerSplitCalculator lang={params.lang} />;
}
