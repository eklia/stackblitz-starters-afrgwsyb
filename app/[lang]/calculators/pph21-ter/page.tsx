// app/calculators/pph21-ter/page.tsx
import { Pph21TerCalculator } from '@/components/calculators/Pph21TerCalculator';
import { Lang } from '@/lib/types';

type PageProps = {
  params: {
    lang: Lang;
  };
};

export default function Pph21TerPage({ params }: PageProps) {
  return (
    <main className="min-h-screen bg-emerald-50/40 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl">
        <Pph21TerCalculator />
      </div>
    </main>
  );
}
