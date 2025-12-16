// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CeK Pajak',
  description:
    'Kelola pajak Anda dengan mudah dan aman bersama CeK Pajak, untuk individu dan perusahaan.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-gradient-to-b from-emerald-50 via-emerald-50/40 to-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
