// app/request/page.tsx
import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { RequestForm } from '@/components/request/RequestForm';
import { Lang } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Konsultasi Pajak | CekPajak',
};

type PageProps = {
  params: {
    lang: Lang;
  };
};

export default function RequestPage({ params }: PageProps)  {
  return (
    <main className="bg-emerald-50/40 pb-12 pt-20 md:pb-16 md:pt-24">
      <Container>
        <div className="grid gap-8 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:items-start">
          {/* Form kiri */}
          <RequestForm />

          {/* Kartu info proses kanan (optional, bisa pakai konten lama kamu) */}
          <aside className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-emerald-50 md:p-6">
            <h2 className="text-base font-semibold text-slate-900 md:text-lg">
              Bagaimana proses di CekPajak?
            </h2>
            <ol className="mt-3 space-y-2 text-sm text-slate-600">
              <li>1. Isi formulir konsultasi di sebelah kiri.</li>
              <li>2. Tim kami review kebutuhan pajak Anda.</li>
              <li>3. Kami hubungi Anda via WhatsApp / email.</li>
              <li>4. Sepakati paket layanan & jadwal.</li>
              <li>5. Proses pajak berjalan, laporan rutin dikirim.</li>
            </ol>
            <p className="mt-4 text-xs text-slate-500">
              *Untuk kebutuhan khusus (pemeriksaan pajak, sengketa, dsb.), tim
              akan menyiapkan paket dan estimasi waktu secara terpisah.
            </p>
          </aside>
        </div>
      </Container>
    </main>
  );
}
