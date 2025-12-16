// lib/tax/pph21.ts

export type Pph21Input = {
  monthlyGross: number; // gaji bruto per bulan
  status: string; // contoh: "TK/0", "K/0", dll
};

export type Pph21Result = {
  monthlyTax: number;
  yearlyTax: number;
  effectiveRate: number; // persen
  notes: string[];
};

/**
 * SKELETON PERHITUNGAN PPH21
 * -----------------------------------------
 * Saat ini masih dummy:
 * - pajak = 5% dari gaji bruto bulanan
 * Nanti kamu bisa ganti penuh dengan rumus resmi.
 */
export function computePph21(input: Pph21Input): Pph21Result {
  const { monthlyGross } = input;

  // simple dummy logic: 5% dari gaji bruto
  const monthlyTax = Math.max(0, monthlyGross * 0.05);
  const yearlyTax = monthlyTax * 12;
  const effectiveRate =
    monthlyGross > 0 ? (monthlyTax / monthlyGross) * 100 : 0;

  return {
    monthlyTax,
    yearlyTax,
    effectiveRate,
    notes: [
      'Saat ini perhitungan masih menggunakan rumus simulasi (5% dari gaji bruto).',
      'Nanti akan diganti dengan perhitungan PPh 21 sesuai regulasi yang berlaku.',
    ],
  };
}
