'use client';

import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

type ApiResult = {
  monthlyTax: number;
  yearlyTax: number;
  effectiveRate: number;
  notes: string[];
};

export function Pph21Calculator() {
  const [monthlyGross, setMonthlyGross] = useState<string>('');
  const [status, setStatus] = useState<string>('TK/0');

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/calculators/pph21', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          monthlyGross: Number(
            monthlyGross.replace(/\./g, '').replace(/,/g, '')
          ),
          status,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data?.error ?? 'Gagal menghitung pajak.');
        return;
      }

      setResult(data.result as ApiResult);
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan jaringan / server.');
    } finally {
      setIsLoading(false);
    }
  }

  const formatCurrency = (value: number) =>
    value.toLocaleString('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    });

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,3fr)_minmax(0,2.5fr)] md:items-start">
      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-3xl bg-white p-5 shadow-soft ring-1 ring-emerald-50 md:p-6"
      >
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-slate-900 md:text-2xl">
            Kalkulator PPh 21 (Basic)
          </h1>
          <p className="text-sm text-slate-600">
            Masukkan gaji bruto bulanan Anda untuk melihat estimasi pajak PPh
            21. Perhitungan saat ini masih simulasi dan akan disesuaikan dengan
            regulasi resmi pada fase berikutnya.
          </p>
        </div>

        {/* Gaji bruto */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-800">
            Gaji Bruto Bulanan (Rp)
          </label>
          <input
            type="number"
            min={0}
            value={monthlyGross}
            onChange={(e) => setMonthlyGross(e.target.value)}
            required
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500/40 focus:bg-white focus:ring-2"
            placeholder="Contoh: 10000000"
          />
          <p className="text-[11px] text-slate-500">
            Belum termasuk tunjangan dan komponen penghasilan lain (bisa
            ditambah kemudian).
          </p>
        </div>

        {/* Status PTKP */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-800">
            Status PTKP
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500/40 focus:bg-white focus:ring-2"
          >
            <option value="TK/0">TK/0 - Tidak Kawin, tanpa tanggungan</option>
            <option value="TK/1">TK/1 - Tidak Kawin, 1 tanggungan</option>
            <option value="K/0">K/0 - Kawin, tanpa tanggungan</option>
            <option value="K/1">K/1 - Kawin, 1 tanggungan</option>
            <option value="K/2">K/2 - Kawin, 2 tanggungan</option>
            <option value="K/3">K/3 - Kawin, 3 tanggungan</option>
          </select>
          <p className="text-[11px] text-slate-500">
            Status ini akan digunakan untuk menentukan PTKP pada rumus resmi
            nantinya.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-2xl bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="pt-1">
          <Button
            type="submit"
            variant="primary"
            size="md"
            className={cn('w-full md:w-auto', isLoading && 'opacity-80')}
            disabled={isLoading}
          >
            {isLoading ? 'Menghitung...' : 'Hitung Pajak'}
          </Button>
        </div>
      </form>

      {/* Hasil */}
      <div className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-emerald-50 md:p-6">
        <h2 className="text-base font-semibold text-slate-900 md:text-lg">
          Hasil Perhitungan
        </h2>

        {!result && (
          <p className="mt-3 text-sm text-slate-500">
            Hasil perhitungan akan muncul di sini setelah Anda menekan tombol{' '}
            <span className="font-semibold text-slate-700">
              “Hitung Pajak”.
            </span>
          </p>
        )}

        {result && (
          <div className="mt-4 space-y-4 text-sm text-slate-700">
            <div className="flex items-center justify-between rounded-2xl bg-emerald-50 px-3 py-2">
              <span className="text-slate-600">Estimasi PPh 21 Bulanan</span>
              <span className="font-semibold text-emerald-700">
                {formatCurrency(result.monthlyTax)}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
              <span className="text-slate-600">Estimasi PPh 21 Tahunan</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(result.yearlyTax)}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
              <span className="text-slate-600">Effective Tax Rate</span>
              <span className="font-semibold text-slate-900">
                {result.effectiveRate.toFixed(2)}%
              </span>
            </div>

            {result.notes?.length > 0 && (
              <div className="pt-2">
                <p className="mb-1 text-xs font-semibold text-slate-500">
                  Catatan:
                </p>
                <ul className="space-y-1 text-xs text-slate-500">
                  {result.notes.map((n, i) => (
                    <li key={i}>• {n}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
