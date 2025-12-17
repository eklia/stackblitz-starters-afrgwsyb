// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CekPajak',
  description: 'Platform kalkulator dan konsultasi pajak online.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-emerald-50/40 text-slate-900">
        {children}
      </body>
    </html>
  );
}
