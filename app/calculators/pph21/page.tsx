// app/calculators/pph21/page.tsx
import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { Pph21Calculator } from '@/components/calculators/Pph21Calculator';

export const metadata: Metadata = {
  title: 'Kalkulator PPh 21 | CekPajak',
};

export default function Pph21Page() {
  return (
    <main className="bg-emerald-50/40 pb-12 pt-20 md:pb-16 md:pt-24">
      <Container>
        <div className="mb-6 md:mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
            Kalkulator Pajak
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">
            Kalkulator PPh 21 (Basic)
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
            Halaman ini adalah contoh kalkulator pajak basic. Field dan logika
            perhitungan di dalamnya masih dapat disesuaikan sesuai kebutuhan
            bisnis dan regulasi pajak yang berlaku.
          </p>
        </div>

        <Pph21Calculator />
      </Container>
    </main>
  );
}
