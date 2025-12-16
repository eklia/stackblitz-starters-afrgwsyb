// components/calculators/Pph21TerCalculator.tsx
'use client';

import { useState, useMemo } from 'react';
import type {
  BulanPenghasilan,
  JenisKelamin,
  JenisPerhitungan,
  Pph21TerInput,
  Pph21TerResult,
  PtkpStatus,
} from '@/lib/tax/pph21-ter';
import { computePph21Ter } from '@/lib/tax/pph21-ter';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

// ====== FORM STATE TYPE ======
type FormState = {
  nama: string;
  jenisKelamin: JenisKelamin | '';
  statusPtkp: PtkpStatus | '';
  hasNpwp: '' | 'YA' | 'TIDAK';
  jenisPerhitungan: JenisPerhitungan | '';
  bulan: BulanPenghasilan | '';

  masaKerjaSetahun: string; // SECTION 5 — 1..12

  gajiPokok: string;
  tunjanganTetap: string;
  tunjanganTidakTetap: string;
  bonus: string;
  thr: string;
  tunjanganLain: string;
  jkkPerusahaan: string;
  jkmPerusahaan: string;
  bpjsKesehatanPerusahaan: string;

  iuranPensiun: string;
  iuranJht: string;
  zakatMelaluiPemberiKerja: string;
};

const initialForm: FormState = {
  nama: '',
  jenisKelamin: '',
  statusPtkp: '',
  hasNpwp: '',
  jenisPerhitungan: '',
  bulan: '',

  masaKerjaSetahun: '',

  gajiPokok: '',
  tunjanganTetap: '',
  tunjanganTidakTetap: '',
  bonus: '',
  thr: '',
  tunjanganLain: '',
  jkkPerusahaan: '',
  jkmPerusahaan: '',
  bpjsKesehatanPerusahaan: '',

  iuranPensiun: '',
  iuranJht: '',
  zakatMelaluiPemberiKerja: '',
};

function parseNumber(value: string): number {
  const cleaned = value.replace(/[.,\s]/g, '');
  if (!cleaned) return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

// 👉 helper baru: format input ke "1.500.000" dst
function formatCurrencyInput(value: string): string {
  // ambil hanya digit
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  // tambahkan titik tiap 3 digit dari belakang
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

const MAX_INPUT_STEP = 5;
const MAX_STEP = 6;

export function Pph21TerCalculator() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [step, setStep] = useState<number>(1);
  const [result, setResult] = useState<Pph21TerResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isBulanan = form.jenisPerhitungan === 'BULANAN';

  // ====== PREVIEW BRUTO & PENGURANG UNTUK HELP CARD ======
  const preview = useMemo(() => {
    const bruto =
      parseNumber(form.gajiPokok) +
      parseNumber(form.tunjanganTetap) +
      parseNumber(form.tunjanganTidakTetap) +
      parseNumber(form.bonus) +
      parseNumber(form.thr) +
      parseNumber(form.tunjanganLain) +
      parseNumber(form.jkkPerusahaan) +
      parseNumber(form.jkmPerusahaan) +
      parseNumber(form.bpjsKesehatanPerusahaan);

    const pengurang =
      parseNumber(form.iuranPensiun) +
      parseNumber(form.iuranJht) +
      parseNumber(form.zakatMelaluiPemberiKerja);

    return { bruto, pengurang };
  }, [form]);

  // ====== VALIDASI PER STEP INPUT ======
  function validateStep(currentStep: number): string | null {
    switch (currentStep) {
      case 1:
        if (!form.nama.trim()) return 'Nama pegawai wajib diisi pada Step 1.';
        if (!form.jenisKelamin) return 'Jenis kelamin wajib dipilih.';
        return null;
      case 2:
        if (!form.statusPtkp) return 'Status PTKP wajib dipilih.';
        if (!form.hasNpwp)
          return 'Harap pilih apakah pegawai memiliki NPWP atau tidak.';
        return null;
      case 3:
        if (!form.jenisPerhitungan)
          return 'Jenis perhitungan pajak wajib dipilih.';

        if (form.jenisPerhitungan === 'BULANAN' && !form.bulan)
          return 'Bulan penghasilan wajib dipilih untuk perhitungan bulanan.';

        if (form.jenisPerhitungan === 'TAHUNAN' && !form.masaKerjaSetahun)
          return 'Masa penghasilan dalam setahun wajib diisi untuk perhitungan tahunan.';
        return null;
      case 4:
        if (!form.gajiPokok || parseNumber(form.gajiPokok) <= 0)
          return 'Gaji pokok bulanan wajib diisi.';
        return null;
      case 5:
        return null; // potongan boleh kosong
      default:
        return null;
    }
  }

  function validateAllSteps(): string | null {
    for (let s = 1; s <= MAX_INPUT_STEP; s++) {
      const err = validateStep(s);
      if (err) return err;
    }
    return null;
  }

  const handleNext = () => {
    const err = validateStep(step);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, MAX_INPUT_STEP));
  };

  const handlePrev = () => {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  };

  // ====== SUBMIT (HITUNG PPH21 DI STEP 6) -> PINDAH KE STEP 7 ======
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const err = validateAllSteps();
    if (err) {
      setError(err);
      return;
    }

    if (!form.jenisPerhitungan) {
      setError('Jenis perhitungan pajak wajib dipilih.');
      return;
    }
    if (form.jenisPerhitungan === 'BULANAN' && !form.bulan) {
      setError('Bulan penghasilan wajib dipilih.');
      return;
    }

    const input: Pph21TerInput = {
      nama: form.nama.trim(),
      jenisKelamin: form.jenisKelamin as JenisKelamin,
      statusPtkp: form.statusPtkp as PtkpStatus,
      hasNpwp: form.hasNpwp === 'YA',
      jenisPerhitungan: form.jenisPerhitungan as JenisPerhitungan,
      bulan:
        form.jenisPerhitungan === 'BULANAN'
          ? (form.bulan as BulanPenghasilan)
          : undefined,

      masaKerjaSetahun:
        form.jenisPerhitungan === 'TAHUNAN'
          ? Number(form.masaKerjaSetahun || '12')
          : undefined,

      gajiPokok: parseNumber(form.gajiPokok),
      tunjanganTetap: parseNumber(form.tunjanganTetap),
      tunjanganTidakTetap: parseNumber(form.tunjanganTidakTetap),
      bonus: parseNumber(form.bonus),
      thr: parseNumber(form.thr),
      tunjanganLain: parseNumber(form.tunjanganLain),
      jkkPerusahaan: parseNumber(form.jkkPerusahaan),
      jkmPerusahaan: parseNumber(form.jkmPerusahaan),
      bpjsKesehatanPerusahaan: parseNumber(form.bpjsKesehatanPerusahaan),

      iuranPensiun: parseNumber(form.iuranPensiun),
      iuranJht: parseNumber(form.iuranJht),
      zakatMelaluiPemberiKerja: parseNumber(form.zakatMelaluiPemberiKerja),
    };

    setIsSubmitting(true);
    try {
      const res = computePph21Ter(input);
      setResult(res);
      setStep(MAX_STEP); // pindah ke step hasil
    } catch (err) {
      console.error(err);
      setError(
        'Terjadi kesalahan saat menghitung PPh21. Coba cek kembali input Anda.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ====== RENDER ======
  return (
    <div className="mx-auto max-w-5xl space-y-6 md:space-y-8">
      {/* HEADER */}
      <header className="rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 p-5 text-slate-50 shadow-soft md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-100">
              Kalkulator PPh21
            </p>
            <h1 className="mt-1 text-lg font-semibold md:text-2xl">
              Simulasi PPh21 Pegawai Tetap (TER & Tahunan)
            </h1>
            <p className="mt-1 text-xs md:text-sm text-emerald-50/90">
              Isi data per step. Setelah Step {MAX_INPUT_STEP}, klik{' '}
              <span className="font-semibold">Hitung PPh21</span> untuk pindah
              ke section hasil perhitungan.
            </p>
          </div>
          <div className="flex flex-col items-start gap-1 text-xs md:items-end">
            <span className="inline-flex items-center rounded-full bg-emerald-700/60 px-3 py-1">
              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-200" />
              Versi simulasi — bukan pengganti review konsultan pajak
            </span>
            <span className="text-emerald-100/80">
              Langkah {step} dari {MAX_STEP}
            </span>
          </div>
        </div>
      </header>

      {/* GRID: FORM KIRI, HELP CARD KANAN */}
      <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)] md:items-start">
        {/* LEFT: FORM WIZARD + HASIL */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl bg-white p-5 shadow-soft ring-1 ring-emerald-50 md:p-6"
        >
          {/* STEP 1 */}
          {step === 1 && (
            <SectionCard
              step={step}
              title="Identitas Pegawai"
              description="Data dasar pegawai yang digunakan untuk perhitungan PPh21."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label required>Nama Pegawai</Label>
                  <input
                    type="text"
                    value={form.nama}
                    onChange={(e) => handleChange('nama', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    placeholder="Contoh: Budi Santoso"
                    required
                  />
                </div>
                <div>
                  <Label required>Jenis Kelamin</Label>
                  <select
                    value={form.jenisKelamin}
                    onChange={(e) =>
                      handleChange('jenisKelamin', e.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    required
                  >
                    <option value="">Pilih jenis kelamin</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>
            </SectionCard>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <SectionCard
              step={step}
              title="Status Perpajakan Pegawai"
              description="Status PTKP dan kepemilikan NPWP akan mempengaruhi perhitungan pajak."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label required>Status PTKP</Label>
                  <select
                    value={form.statusPtkp}
                    onChange={(e) => handleChange('statusPtkp', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    required
                  >
                    <option value="">Pilih status PTKP</option>
                    <option value="TK/0">TK/0</option>
                    <option value="TK/1">TK/1</option>
                    <option value="TK/2">TK/2</option>
                    <option value="TK/3">TK/3</option>
                    <option value="K/0">K/0</option>
                    <option value="K/1">K/1</option>
                    <option value="K/2">K/2</option>
                    <option value="K/3">K/3</option>
                  </select>
                </div>

                <div>
                  <Label required>Memiliki NPWP?</Label>
                  <div className="mt-1 flex gap-3">
                    {['YA', 'TIDAK'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleChange('hasNpwp', opt)}
                        className={cn(
                          'flex-1 rounded-lg border px-3 py-2 text-xs md:text-sm',
                          form.hasNpwp === opt
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 text-slate-700 hover:border-emerald-300'
                        )}
                      >
                        {opt === 'YA' ? 'Ya, punya NPWP' : 'Belum punya NPWP'}
                      </button>
                    ))}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Pegawai tanpa NPWP umumnya dikenakan tambahan 20% dari PPh
                    terutang.
                  </p>
                </div>
              </div>
            </SectionCard>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <SectionCard
              step={step}
              title="Jenis Perhitungan & Periode"
              description="Pilih apakah ingin menghitung pajak per bulan (TER) atau total tahun berjalan."
            >
              {/* PILIHAN JENIS PERHITUNGAN */}
              <div className="flex flex-col gap-3 md:flex-row">
                <PillButton
                  active={form.jenisPerhitungan === 'BULANAN'}
                  onClick={() => handleChange('jenisPerhitungan', 'BULANAN')}
                  title="Pajak Per Bulan"
                  subtitle="Menggunakan tarif efektif rata-rata (TER) untuk Jan–Nov. Desember dihitung progresif."
                />
                <PillButton
                  active={form.jenisPerhitungan === 'TAHUNAN'}
                  onClick={() => handleChange('jenisPerhitungan', 'TAHUNAN')}
                  title="Total Pajak Tahun Berjalan"
                  subtitle="Bruto x jumlah bulan kerja dikurangi PTKP & pengurang, lalu tarif progresif."
                />
              </div>

              {/* PERIODE: BULAN / MASA KERJA */}
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {isBulanan && (
                  <div className="max-w-xs">
                    <Label required>Bulan Penghasilan</Label>
                    <select
                      value={form.bulan}
                      onChange={(e) => handleChange('bulan', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      required
                    >
                      <option value="">Pilih bulan</option>
                      <option value="JANUARI">Januari</option>
                      <option value="FEBRUARI">Februari</option>
                      <option value="MARET">Maret</option>
                      <option value="APRIL">April</option>
                      <option value="MEI">Mei</option>
                      <option value="JUNI">Juni</option>
                      <option value="JULI">Juli</option>
                      <option value="AGUSTUS">Agustus</option>
                      <option value="SEPTEMBER">September</option>
                      <option value="OKTOBER">Oktober</option>
                      <option value="NOVEMBER">November (TER)</option>
                      <option value="DESEMBER">
                        Desember (dianggap final progresif)
                      </option>
                    </select>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Untuk bulan Desember, perhitungan akan menggunakan
                      pendekatan pajak tahunan progresif lalu dibagi 12.
                    </p>
                  </div>
                )}

                {form.jenisPerhitungan === 'TAHUNAN' && (
                  <div className="max-w-xs">
                    <Label required>
                      Masa Penghasilan dalam Setahun (bulan)
                    </Label>
                    <select
                      value={form.masaKerjaSetahun}
                      onChange={(e) =>
                        handleChange('masaKerjaSetahun', e.target.value)
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      required
                    >
                      <option value="">Pilih jumlah bulan</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m}>
                          {m} bulan
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Isi dengan jumlah masa kerja dalam tahun berjalan (1–12
                      bulan).
                    </p>
                  </div>
                )}
              </div>
            </SectionCard>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <SectionCard
              step={step}
              title="Penghasilan Bruto Bulanan"
              description="Isi seluruh komponen penghasilan bruto pegawai pada bulan yang dihitung."
            >
              <div className="grid gap-4 md:grid-cols-2">
                {(
                  [
                    ['gajiPokok', 'Gaji Pokok (Rp)', true],
                    ['tunjanganTetap', 'Tunjangan Tetap (Rp)', false],
                    [
                      'tunjanganTidakTetap',
                      'Tunjangan Tidak Tetap / Variabel (Rp)',
                      false,
                    ],
                    ['bonus', 'Bonus (Rp)', false],
                    ['thr', 'THR (Rp)', false],
                    ['tunjanganLain', 'Tunjangan Lainnya (Rp)', false],
                    [
                      'jkkPerusahaan',
                      'Tunjangan JKK oleh Perusahaan (Rp)',
                      false,
                    ],
                    [
                      'jkmPerusahaan',
                      'Tunjangan JKM oleh Perusahaan (Rp)',
                      false,
                    ],
                    [
                      'bpjsKesehatanPerusahaan',
                      'Tunjangan BPJS Kesehatan (4% x Gaji) oleh Perusahaan (Rp)',
                      false,
                    ],
                  ] as const
                ).map(([field, label, required]) => (
                  <div key={field}>
                    <Label required={required}>{label}</Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[11px] text-slate-400">
                        Rp
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={form[field]}
                        onChange={(e) =>
                          handleChange(
                            field,
                            formatCurrencyInput(e.target.value)
                          )
                        }
                        className="mt-1 w-full rounded-lg border border-slate-200 px-8 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        placeholder="0"
                        required={required}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <SectionCard
              step={step}
              title="Potongan yang Diakui Pajak"
              description="Iuran yang dibayar pegawai dan zakat yang dapat mengurangi penghasilan kena pajak."
            >
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label>Iuran Pensiun / JP Dibayar Pegawai (Rp)</Label>
                  <input
                    type="text"
                    min={0}
                    value={form.iuranPensiun}
                    onChange={(e) =>
                      handleChange(
                        'iuranPensiun',
                        formatCurrencyInput(e.target.value)
                      )
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Iuran JHT (Ditanggung Pegawai) (Rp)</Label>
                  <input
                    type="text"
                    min={0}
                    value={form.iuranJht}
                    onChange={(e) =>
                      handleChange(
                        'iuranJht',
                        formatCurrencyInput(e.target.value)
                      )
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Zakat / Sedekah via Pemberi Kerja (Rp)</Label>
                  <input
                    type="text"
                    min={0}
                    value={form.zakatMelaluiPemberiKerja}
                    onChange={(e) =>
                      handleChange(
                        'zakatMelaluiPemberiKerja',
                        formatCurrencyInput(e.target.value)
                      )
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    placeholder="0"
                  />
                </div>
              </div>
            </SectionCard>
          )}

          {/* LAST STEP = HASIL PERHITUNGAN */}
          {step === MAX_STEP && result && (
            <SectionCard
              step={step}
              title="Hasil Perhitungan PPh21"
              description="Ringkasan pajak berdasarkan data yang Anda isi di langkah sebelumnya."
            >
              <div className="space-y-5 text-sm">
                {/* HIGHLIGHT ANGKA UTAMA */}
                <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 text-emerald-50">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-100">
                    {result.jenisPerhitungan === 'BULANAN'
                      ? 'Perkiraan PPh21 Bulan Ini'
                      : 'Perkiraan PPh21 Tahunan'}
                  </p>
                  <p className="mt-1 text-xl font-semibold md:text-2xl">
                    Rp{' '}
                    {(result.jenisPerhitungan === 'BULANAN'
                      ? result.pph21Bulanan ?? 0
                      : result.pph21Tahunan ?? 0
                    ).toLocaleString('id-ID')}
                  </p>
                  <p className="mt-1 text-[11px] text-emerald-50/90">
                    Angka ini merupakan estimasi berdasarkan data yang Anda isi
                    dan tarif
                    {result.jenisPerhitungan === 'BULANAN'
                      ? ' efektif rata-rata (TER).'
                      : ' progresif tahunan.'}
                  </p>
                </div>

                {/* RINGKASAN UMUM */}
                <div className="rounded-xl bg-emerald-50 px-3 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                    Ringkasan
                  </p>
                  <p className="mt-1 text-xs text-slate-700">
                    Jenis Perhitungan:{' '}
                    <span className="font-semibold text-slate-900">
                      {result.jenisPerhitungan === 'BULANAN'
                        ? 'Pajak Per Bulan (TER)'
                        : 'Total Pajak Tahun Berjalan'}
                    </span>
                    {result.bulan && (
                      <>
                        {' '}
                        • Bulan{' '}
                        <span className="font-semibold">{result.bulan}</span>
                      </>
                    )}
                  </p>
                </div>

                {/* BLOK NILAI PPH DETAIL (BULANAN & TAHUNAN) */}
                <div className="mt-1 grid gap-3 md:grid-cols-2">
                  {typeof result.pph21Bulanan === 'number' && (
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2">
                      <p className="text-[11px] text-slate-500">
                        Perkiraan PPh21 Bulan Ini
                      </p>
                      <p className="text-sm font-semibold text-emerald-800 md:text-base">
                        Rp {result.pph21Bulanan.toLocaleString('id-ID')}
                      </p>
                    </div>
                  )}

                  {typeof result.pph21Tahunan === 'number' && (
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2">
                      <p className="text-[11px] text-slate-500">
                        Perkiraan PPh21 Tahunan
                      </p>
                      <p className="text-sm font-semibold text-emerald-800 md:text-base">
                        Rp {result.pph21Tahunan.toLocaleString('id-ID')}
                      </p>
                    </div>
                  )}
                </div>

                {/* CATATAN */}
                {result.catatan.length > 0 && (
                  <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2">
                    <p className="text-[11px] font-medium text-slate-600">
                      Catatan Perhitungan:
                    </p>
                    <ul className="mt-1 list-disc space-y-1 pl-4 text-[11px] text-slate-600">
                      {result.catatan.map((note, idx) => (
                        <li key={idx}>{note}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* INFO KECIL */}
                <p className="mt-1 text-[10px] text-slate-500">
                  Hasil ini hanya simulasi berdasarkan tarif TER / progresif.
                  Untuk pelaporan resmi dan rekonsiliasi, tetap disarankan
                  melakukan review bersama tim pajak atau konsultan.
                </p>
              </div>
            </SectionCard>
          )}
          {/* ERROR + NAV + RESET */}
          <div className="mt-1 space-y-3 border-t border-dashed border-slate-200 pt-3">
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-700">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span className="inline-flex h-6 items-center rounded-full bg-slate-100 px-2 text-[10px] font-medium text-slate-700">
                  Step {step} / {MAX_STEP}
                </span>
                <span>
                  {step < MAX_INPUT_STEP
                    ? 'Lengkapi data lalu klik Lanjut.'
                    : step === MAX_INPUT_STEP
                    ? 'Klik Hitung PPh21 untuk pindah ke section hasil.'
                    : 'Ini adalah ringkasan hasil. Anda bisa kembali untuk mengubah data jika perlu.'}
                </span>
              </div>

              <div className="flex gap-2">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
                  >
                    Kembali
                  </button>
                )}

                {step < MAX_INPUT_STEP && (
                  <Button type="button" size="md" onClick={handleNext}>
                    Lanjut
                  </Button>
                )}

                {step === MAX_INPUT_STEP && (
                  <Button type="submit" size="md" disabled={isSubmitting}>
                    {isSubmitting ? 'Menghitung...' : 'Hitung PPh21'}
                  </Button>
                )}

                {step === MAX_STEP && (
                  <Button
                    type="button"
                    size="md"
                    variant="secondary"
                    onClick={() => setStep(1)}
                  >
                    Ubah Data
                  </Button>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setForm(initialForm);
                  setResult(null);
                  setError(null);
                  setStep(1);
                }}
                className="text-[11px] text-slate-500 underline-offset-2 hover:text-emerald-700 hover:underline"
              >
                Reset semua step
              </button>
            </div>
          </div>
        </form>

        {/* RIGHT: HELP CARD SELALU DI SEBELAH KANAN */}
        <aside className="space-y-4 md:sticky md:top-24">
          <StepHelpCard step={step} preview={preview} />
        </aside>
      </div>

      {/* DISCLAIMER GLOBAL */}
      <div className="rounded-2xl bg-emerald-900/95 p-4 text-[11px] text-emerald-50 shadow-soft">
        <p className="font-semibold uppercase tracking-wide text-emerald-200">
          Disclaimer
        </p>
        <p className="mt-1">
          Kalkulator ini dibuat untuk keperluan simulasi dan edukasi. Hasil
          perhitungan dapat berbeda dengan perhitungan resmi Direktorat Jenderal
          Pajak atau kebijakan internal perusahaan. Selalu lakukan review
          bersama konsultan pajak sebelum pengambilan keputusan.
        </p>
      </div>
    </div>
  );
}

/* ==== SMALL UI SUBCOMPONENTS ==== */

type SectionCardProps = {
  step: number | string;
  title: string;
  description?: string;
  children: React.ReactNode;
};

function SectionCard({ step, title, description, children }: SectionCardProps) {
  return (
    <section className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-semibold text-emerald-50">
              {step}
            </span>
            <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          </div>
          {description && (
            <p className="mt-1 text-[11px] text-slate-500">{description}</p>
          )}
        </div>
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

type PillButtonProps = {
  active: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
};

function PillButton({ active, onClick, title, subtitle }: PillButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex-1 rounded-xl border px-3 py-3 text-left text-xs md:text-sm',
        active
          ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm'
          : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/60'
      )}
    >
      <p className="font-semibold">{title}</p>
      <p className="mt-0.5 text-[11px] text-slate-500">{subtitle}</p>
    </button>
  );
}

type LabelProps = {
  children: React.ReactNode;
  required?: boolean;
};

function Label({ children, required }: LabelProps) {
  return (
    <label className="text-[11px] font-medium text-slate-700">
      {children}{' '}
      {required && (
        <span className="text-rose-600" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}

// ==== HELP CARD PER STEP (CARD BARU DI KANAN) ====

type StepHelpCardProps = {
  step: number;
  preview: { bruto: number; pengurang: number };
};

function StepHelpCard({ step, preview }: StepHelpCardProps) {
  if (step === 1) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-4 text-[11px] text-slate-600 shadow-soft">
        <p className="text-xs font-semibold text-slate-800">
          Bantuan: Identitas Pegawai
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>
            <span className="font-medium">Nama Pegawai</span> digunakan untuk
            identifikasi di laporan dan bukti potong.
          </li>
          <li>
            <span className="font-medium">Jenis Kelamin</span> tidak mengubah
            nilai pajak, tetapi penting untuk data personal dan administrasi.
          </li>
        </ul>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-4 text-[11px] text-slate-600 shadow-soft">
        <p className="text-xs font-semibold text-slate-800">
          Bantuan: Status PTKP & NPWP
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>
            <span className="font-medium">Status PTKP</span> (TK/K + tanggungan)
            menentukan besar Penghasilan Tidak Kena Pajak.
          </li>
          <li>
            <span className="font-medium">TK</span> = Tidak Kawin,{' '}
            <span className="font-medium">K</span> = Kawin. Angka 0–3
            menunjukkan jumlah tanggungan yang diakui.
          </li>
          <li>
            <span className="font-medium">Memiliki NPWP</span> biasanya wajib
            untuk pegawai tetap. Jika tidak, PPh21 umumnya dikenakan tambahan
            20%.
          </li>
        </ul>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-4 text-[11px] text-slate-600 shadow-soft">
        <p className="text-xs font-semibold text-slate-800">
          Bantuan: Jenis Perhitungan & Periode
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>
            <span className="font-medium">Pajak Per Bulan</span> menghitung
            PPh21 hanya untuk 1 bulan tertentu dengan tarif efektif rata-rata
            (TER).
          </li>
          <li>
            <span className="font-medium">Desember</span> biasanya sebagai
            pelunasan pajak setahun, dihitung dengan tarif progresif tahunan.
          </li>
          <li>
            <span className="font-medium">Total Pajak Tahun Berjalan</span>{' '}
            memperkirakan pajak 1 tahun penuh dari data bruto bulanan.
          </li>
        </ul>
      </div>
    );
  }

  if (step === 4) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-4 text-[11px] text-slate-600 shadow-soft">
        <p className="text-xs font-semibold text-slate-800">
          Bantuan: Komponen Penghasilan Bruto
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>
            <span className="font-medium">Gaji Pokok</span> = penghasilan utama
            yang diterima tiap bulan.
          </li>
          <li>
            <span className="font-medium">Tunjangan Tetap</span> contoh:
            tunjangan jabatan, komunikasi, transport tetap.
          </li>
          <li>
            <span className="font-medium">Tunjangan Tidak Tetap</span> contoh:
            lembur, insentif, uang makan yang tidak fixed.
          </li>
          <li>
            <span className="font-medium">Bonus / THR</span> diisi saat ada
            bonus atau THR di bulan tersebut.
          </li>
          <li>
            <span className="font-medium">Tunjangan PPh (Gross-Up)</span> =
            tunjangan untuk menutup PPh pegawai.
          </li>
          <li>
            <span className="font-medium">JKK & JKM</span> dibayar perusahaan
            tetapi diakui sebagai komponen bruto untuk pajak.
          </li>
        </ul>
        <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-2">
          <p className="text-[10px] text-slate-500">Preview Bruto Bulanan</p>
          <p className="text-sm font-semibold text-emerald-800">
            Rp {preview.bruto.toLocaleString('id-ID')}
          </p>
        </div>
      </div>
    );
  }

  if (step === 5) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-4 text-[11px] text-slate-600 shadow-soft">
        <p className="text-xs font-semibold text-slate-800">
          Bantuan: Potongan yang Diakui Pajak
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>
            <span className="font-medium">Iuran Pensiun / JP</span> tertentu
            bisa mengurangi penghasilan bruto (sesuai regulasi).
          </li>
          <li>
            <span className="font-medium">Iuran JHT</span> yang ditanggung
            pegawai juga bisa menjadi pengurang.
          </li>
          <li>
            <span className="font-medium">Zakat / Sedekah</span> yang disalurkan
            via pemberi kerja & lembaga resmi dapat mengurangi penghasilan kena
            pajak.
          </li>
        </ul>
        <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-2">
          <p className="text-[10px] text-slate-500">
            Preview Pengurang Bulanan
          </p>
          <p className="text-sm font-semibold text-emerald-800">
            Rp {preview.pengurang.toLocaleString('id-ID')}
          </p>
        </div>
      </div>
    );
  }

  if (step === MAX_STEP) {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-white p-4 text-[11px] text-slate-600 shadow-soft">
        <p className="text-xs font-semibold text-emerald-900">
          Bantuan: Membaca Hasil PPh21
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>
            <span className="font-medium">Pengurang Bulanan</span> berisi iuran
            yang diakui pajak (pensiun, JHT, zakat tertentu).
          </li>
          <li>
            Jika jenis perhitungan <span className="font-medium">BULANAN</span>,
            fokus di nilai <span className="font-medium">PPh21 Bulan Ini</span>.
          </li>
          <li>
            Jika jenis perhitungan <span className="font-medium">TAHUNAN</span>,
            perhatikan <span className="font-medium">PKP Tahunan</span> dan{' '}
            <span className="font-medium">PPh21 Tahunan</span> untuk estimasi
            total pajak setahun.
          </li>
        </ul>
        <p className="mt-2 text-[10px] text-slate-500">
          Jika angka terasa tidak wajar, Anda bisa klik{' '}
          <span className="font-medium">Ubah Data</span> untuk kembali ke Step 1
          dan menyesuaikan input.
        </p>
      </div>
    );
  }

  // fallback
  return null;
}
