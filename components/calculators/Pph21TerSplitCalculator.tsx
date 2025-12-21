// components/calculators/Pph21TerSplitCalculator.tsx
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import {
  type JenisKelamin,
  type PtkpStatus,
  type BulanPenghasilan,
} from '@/lib/tax/pph21-ter';
import {
  computePph21TerSplit,
  type TerSplitInput,
  type TerSplitResult,
} from '@/lib/tax/pph21-ter-split';
import type { Lang } from '@/lib/types';

/* ================= FORM STATE ================= */

type FormState = {
  nama: string;
  jenisKelamin: JenisKelamin | '';
  statusPtkp: PtkpStatus | '';
  hasNpwp: '' | 'YA' | 'TIDAK';

  bulanPajak: BulanPenghasilan | '';
  tahunPajak: string;

  tanggalGaji: string;
  tanggalPenghasilanTambahan: string;

  gajiPokok: string;
  tunjanganTetap: string;
  tunjanganTidakTetap: string;
  tunjanganLain: string;
  jkkPerusahaan: string;
  jkmPerusahaan: string;
  bpjsKesehatanPerusahaan: string;

  thr: string;
  bonus: string;
};

const initialForm: FormState = {
  nama: '',
  jenisKelamin: '',
  statusPtkp: '',
  hasNpwp: '',

  bulanPajak: '',
  tahunPajak: '',

  tanggalGaji: '',
  tanggalPenghasilanTambahan: '',

  gajiPokok: '',
  tunjanganTetap: '',
  tunjanganTidakTetap: '',
  tunjanganLain: '',
  jkkPerusahaan: '',
  jkmPerusahaan: '',
  bpjsKesehatanPerusahaan: '',

  thr: '',
  bonus: '',
};

function parseNumber(value: string): number {
  const cleaned = value.replace(/[.,\s]/g, '');
  if (!cleaned) return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function formatCurrencyInput(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

const MAX_INPUT_STEP = 5;
const MAX_STEP = 6;

/* ================= I18N COPY ================= */

const TEXT = {
  id: {
    headerBadge: 'Kalkulator PPh21 TER',
    headerTitle: 'Simulasi PPh21 TER — Gaji & Bonus/THR Dalam Satu Bulan',
    headerSubtitle:
      'Hitung PPh21 saat pembayaran gaji, saat bonus/THR, dan total pajak bulan berjalan dengan metode TER (Tarif Efektif Rata-rata).',
    headerHint:
      'Versi simulasi — bukan pengganti review konsultan pajak',
    headerStepLabel: 'Langkah',

    stepsHint: {
      beforeLast: 'Lengkapi data lalu klik Lanjut.',
      lastInput:
        'Klik Hitung PPh21 untuk melihat hasil rekap gaji & bonus/THR.',
      result:
        'Ini adalah ringkasan hasil. Anda bisa kembali untuk mengubah data jika perlu.',
    },

    section1Title: 'Identitas Pegawai',
    section1Desc:
      'Data ini digunakan untuk perhitungan PPh21 bulanan pegawai tetap.',
    section2Title: 'Status Perpajakan Pegawai',
    section2Desc:
      'Status PTKP dan NPWP menentukan kategori TER yang digunakan.',
    section3Title: 'Periode Pajak',
    section3Desc:
      'Pilih bulan dan tahun pajak untuk simulasi perhitungan PPh21.',
    section4Title: 'Data Gaji Rutin',
    section4Desc:
      'Isi penghasilan bulanan rutin yang dibayarkan pada periode tersebut.',
    section5Title: 'Data Penghasilan Tambahan (Bonus / THR)',
    section5Desc:
      'Isi hanya jika pada bulan yang sama ada tambahan penghasilan seperti bonus atau THR.',
    section6Title: 'Hasil Perhitungan PPh21 TER',
    section6Desc:
      'Ringkasan PPh21 saat pembayaran gaji, saat bonus/THR, dan total pajak bulan berjalan.',

    labels: {
      namaPegawai: 'Nama Pegawai',
      jenisKelamin: 'Jenis Kelamin',
      pilihJenisKelamin: 'Pilih jenis kelamin',
      lakiLaki: 'Laki-laki',
      perempuan: 'Perempuan',

      statusPtkp: 'Status PTKP',
      pilihStatusPtkp: 'Pilih status PTKP',

      hasNpwp: 'Memiliki NPWP?',
      yaPunyaNpwp: 'Ya, punya NPWP',
      tidakPunyaNpwp: 'Belum punya NPWP',
      hasNpwpHelper:
        'Pegawai tanpa NPWP umumnya dikenakan tambahan 20% dari PPh terutang.',

      bulanPajak: 'Bulan Pajak',
      pilihBulan: 'Pilih bulan',
      tahunPajak: 'Tahun Pajak',

      tanggalGaji: 'Tanggal Pembayaran Gaji',
      tanggalPenghasilanTambahan:
        'Tanggal Pembayaran Penghasilan Tambahan',

      gajiPokok: 'Gaji Pokok (Rp)',
      tunjanganTetap: 'Tunjangan Tetap (Rp)',
      tunjanganTidakTetap: 'Tunjangan Tidak Tetap / Variabel (Rp)',
      tunjanganLain: 'Tunjangan Lainnya (Rp)',
      jkkPerusahaan: 'Tunjangan JKK (dibayar perusahaan) (Rp)',
      jkmPerusahaan: 'Tunjangan JKM (dibayar perusahaan) (Rp)',
      bpjsKesehatanPerusahaan:
        'Tunjangan BPJS Kesehatan (4% gaji) (Rp)',

      thr: 'Penghasilan Tambahan THR (Rp)',
      bonus: 'Penghasilan Tambahan Bonus (Rp)',

      tableTanggal: 'Tanggal',
      tableJenis: 'Jenis',
      tableBruto: 'Bruto (Rp)',
      tablePph21: 'PPh21 (Rp)',
      tableNetto: 'Netto (Rp)',
      tableTotal: 'TOTAL',

      jenisGaji: 'Gaji',
      jenisBonusThr: 'Bonus/THR',
    },

    buttons: {
      back: 'Kembali',
      next: 'Lanjut',
      submitIdle: 'Hitung PPh21 TER',
      submitLoading: 'Menghitung...',
      changeData: 'Ubah Data',
      resetAll: 'Reset semua input',
    },

    errors: {
      namaRequired: 'Nama pegawai wajib diisi.',
      genderRequired: 'Jenis kelamin pegawai wajib dipilih.',
      statusPtkpRequired: 'Status PTKP wajib dipilih.',
      hasNpwpRequired:
        'Harap pilih apakah pegawai memiliki NPWP atau tidak.',
      bulanRequired: 'Bulan pajak wajib dipilih.',
      tahunRequired: 'Tahun pajak wajib diisi (misal: 2025).',
      tahunNumber: 'Tahun pajak harus berupa angka.',
      gajiRequired: 'Gaji pokok wajib diisi dan lebih dari 0.',
      genericError:
        'Terjadi kesalahan saat menghitung PPh21 TER. Coba cek kembali input Anda.',
    },

    result: {
      highlightPrefix: 'Total PPh21 Bulan',
      highlightDesc: (kategori: string) =>
        `Dihitung dengan metode TER kategori ${kategori} berdasarkan total penghasilan sebulan (gaji rutin + bonus/THR).`,
      pphSaatGaji: 'PPh21 saat pembayaran gaji',
      pphSaatBonus: 'PPh21 saat pembayaran bonus/THR',
      catatanTitle: 'Catatan Perhitungan:',
      resultFooter:
        'Hasil ini hanya simulasi berdasarkan tarif TER. Untuk pelaporan resmi dan rekonsiliasi, tetap disarankan melakukan review bersama tim pajak atau konsultan.',
    },

    stepChip: 'Step',
    disclaimerTitle: 'Disclaimer',
    disclaimerText:
      'Kalkulator ini dibuat untuk keperluan simulasi dan edukasi. Hasil perhitungan dapat berbeda dengan perhitungan resmi Direktorat Jenderal Pajak atau kebijakan internal perusahaan. Selalu lakukan review bersama konsultan pajak sebelum pengambilan keputusan.',
    currencyPrefix: 'Rp',
  },

  en: {
    headerBadge: 'PPh21 TER Calculator',
    headerTitle: 'PPh21 TER Simulation — Salary & Bonus/THR in One Month',
    headerSubtitle:
      'Calculate PPh21 at salary payment, at bonus/THR payment, and the total tax for the month using TER (Effective Average Rate) method.',
    headerHint:
      'Simulation version — not a substitute for professional tax advice',
    headerStepLabel: 'Step',

    stepsHint: {
      beforeLast: 'Complete the data, then click Next.',
      lastInput:
        'Click Calculate PPh21 to see the salary & bonus/THR summary.',
      result:
        'This is the summary. You can go back and change the data if needed.',
    },

    section1Title: 'Employee Identity',
    section1Desc:
      'This data is used to calculate monthly PPh21 for permanent employees.',
    section2Title: 'Employee Tax Status',
    section2Desc:
      'PTKP status and NPWP determine which TER category is used.',
    section3Title: 'Tax Period',
    section3Desc:
      'Select the tax month and year for this PPh21 simulation.',
    section4Title: 'Regular Salary Data',
    section4Desc:
      'Fill in the regular monthly income paid in this period.',
    section5Title: 'Additional Income Data (Bonus / THR)',
    section5Desc:
      'Fill in only if there is additional income such as bonus or THR in the same month.',
    section6Title: 'PPh21 TER Calculation Result',
    section6Desc:
      'Summary of PPh21 at salary payment, at bonus/THR, and total tax for the month.',

    labels: {
      namaPegawai: 'Employee Name',
      jenisKelamin: 'Gender',
      pilihJenisKelamin: 'Select gender',
      lakiLaki: 'Male',
      perempuan: 'Female',

      statusPtkp: 'PTKP Status',
      pilihStatusPtkp: 'Select PTKP status',

      hasNpwp: 'Has NPWP?',
      yaPunyaNpwp: 'Yes, has NPWP',
      tidakPunyaNpwp: 'No NPWP',
      hasNpwpHelper:
        'Employees without NPWP are generally subject to an additional 20% of PPh payable.',

      bulanPajak: 'Tax Month',
      pilihBulan: 'Select month',
      tahunPajak: 'Tax Year',

      tanggalGaji: 'Salary Payment Date',
      tanggalPenghasilanTambahan: 'Additional Income Payment Date',

      gajiPokok: 'Basic Salary (Rp)',
      tunjanganTetap: 'Fixed Allowance (Rp)',
      tunjanganTidakTetap: 'Variable / Non-fixed Allowance (Rp)',
      tunjanganLain: 'Other Allowances (Rp)',
      jkkPerusahaan: 'JKK Allowance (paid by employer) (Rp)',
      jkmPerusahaan: 'JKM Allowance (paid by employer) (Rp)',
      bpjsKesehatanPerusahaan:
        'BPJS Health Allowance (4% of salary) (Rp)',

      thr: 'THR Additional Income (Rp)',
      bonus: 'Bonus Additional Income (Rp)',

      tableTanggal: 'Date',
      tableJenis: 'Type',
      tableBruto: 'Gross (Rp)',
      tablePph21: 'PPh21 (Rp)',
      tableNetto: 'Net (Rp)',
      tableTotal: 'TOTAL',

      jenisGaji: 'Salary',
      jenisBonusThr: 'Bonus/THR',
    },

    buttons: {
      back: 'Back',
      next: 'Next',
      submitIdle: 'Calculate PPh21 TER',
      submitLoading: 'Calculating...',
      changeData: 'Edit Data',
      resetAll: 'Reset all inputs',
    },

    errors: {
      namaRequired: 'Employee name is required.',
      genderRequired: 'Employee gender is required.',
      statusPtkpRequired: 'PTKP status is required.',
      hasNpwpRequired:
        'Please choose whether the employee has NPWP or not.',
      bulanRequired: 'Tax month is required.',
      tahunRequired: 'Tax year is required (e.g. 2025).',
      tahunNumber: 'Tax year must be a number.',
      gajiRequired: 'Basic salary must be filled and greater than 0.',
      genericError:
        'An error occurred while calculating PPh21 TER. Please check your inputs.',
    },

    result: {
      highlightPrefix: 'Total PPh21 in',
      highlightDesc: (kategori: string) =>
        `Calculated using TER category ${kategori} based on total monthly income (regular salary + bonus/THR).`,
      pphSaatGaji: 'PPh21 at salary payment',
      pphSaatBonus: 'PPh21 at bonus/THR payment',
      catatanTitle: 'Calculation Notes:',
      resultFooter:
        'This result is a simulation based on TER. For official reporting and reconciliation, please review with your tax team or consultant.',
    },

    stepChip: 'Step',
    disclaimerTitle: 'Disclaimer',
    disclaimerText:
      'This calculator is built for simulation and educational purposes. Actual calculations may differ from the official calculation by the Tax Authority (DJP) or your company’s internal policy. Always consult a tax professional before making decisions.',
    currencyPrefix: 'Rp',
  },
} as const;

type TextBundle = (typeof TEXT)[keyof typeof TEXT];

function getText(lang: Lang): TextBundle {
  return TEXT[lang] ?? TEXT.id;
}

/* ================= MAIN COMPONENT ================= */

type Pph21TerSplitCalculatorProps = {
  lang: Lang;
};

export function Pph21TerSplitCalculator({
  lang,
}: Pph21TerSplitCalculatorProps) {
  const t = getText(lang);
  const isEn = lang === 'en';

  const [form, setForm] = useState<FormState>(initialForm);
  const [step, setStep] = useState<number>(1);
  const [result, setResult] = useState<TerSplitResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // PREVIEW UNTUK HELP CARD
  const preview = useMemo(() => {
    const brutoGaji =
      parseNumber(form.gajiPokok) +
      parseNumber(form.tunjanganTetap) +
      parseNumber(form.tunjanganTidakTetap) +
      parseNumber(form.tunjanganLain) +
      parseNumber(form.jkkPerusahaan) +
      parseNumber(form.jkmPerusahaan) +
      parseNumber(form.bpjsKesehatanPerusahaan);

    const brutoTambahan = parseNumber(form.thr) + parseNumber(form.bonus);
    const totalSebulan = brutoGaji + brutoTambahan;

    return { brutoGaji, brutoTambahan, totalSebulan };
  }, [form]);

  // ====== VALIDASI ======
  function validateStep(currentStep: number): string | null {
    switch (currentStep) {
      case 1:
        if (!form.nama.trim()) return t.errors.namaRequired;
        if (!form.jenisKelamin) return t.errors.genderRequired;
        return null;
      case 2:
        if (!form.statusPtkp) return t.errors.statusPtkpRequired;
        if (!form.hasNpwp) return t.errors.hasNpwpRequired;
        return null;
      case 3:
        if (!form.bulanPajak) return t.errors.bulanRequired;
        if (!form.tahunPajak) return t.errors.tahunRequired;
        if (Number.isNaN(Number(form.tahunPajak)))
          return t.errors.tahunNumber;
        return null;
      case 4:
        if (!form.gajiPokok || parseNumber(form.gajiPokok) <= 0)
          return t.errors.gajiRequired;
        return null;
      case 5:
        return null;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const err = validateAllSteps();
    if (err) {
      setError(err);
      return;
    }

    if (!form.statusPtkp) {
      setError(t.errors.statusPtkpRequired);
      return;
    }
    if (!form.bulanPajak) {
      setError(t.errors.bulanRequired);
      return;
    }

    const tahunPajakNum = Number(form.tahunPajak) || new Date().getFullYear();

    const input: TerSplitInput = {
      nama: form.nama.trim(),
      jenisKelamin: form.jenisKelamin as JenisKelamin,
      statusPtkp: form.statusPtkp as PtkpStatus,
      hasNpwp: form.hasNpwp === 'YA',

      bulanPajak: form.bulanPajak as BulanPenghasilan,
      tahunPajak: tahunPajakNum,

      tanggalGaji: form.tanggalGaji || undefined,
      tanggalPenghasilanTambahan:
        form.tanggalPenghasilanTambahan || undefined,

      gajiPokok: parseNumber(form.gajiPokok),
      tunjanganTetap: parseNumber(form.tunjanganTetap),
      tunjanganTidakTetap: parseNumber(form.tunjanganTidakTetap),
      tunjanganLain: parseNumber(form.tunjanganLain),
      jkkPerusahaan: parseNumber(form.jkkPerusahaan),
      jkmPerusahaan: parseNumber(form.jkmPerusahaan),
      bpjsKesehatanPerusahaan: parseNumber(
        form.bpjsKesehatanPerusahaan
      ),

      thr: parseNumber(form.thr),
      bonus: parseNumber(form.bonus),
    };

    setIsSubmitting(true);
    try {
      const res = computePph21TerSplit(input);
      setResult(res);
      setStep(MAX_STEP);
    } catch (err) {
      console.error(err);
      setError(t.errors.genericError);
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
              {t.headerBadge}
            </p>
            <h1 className="mt-1 text-lg font-semibold md:text-2xl">
              {t.headerTitle}
            </h1>
            <p className="mt-1 text-xs text-emerald-50/90 md:text-sm">
              {t.headerSubtitle}
            </p>
          </div>
          <div className="flex flex-col items-start gap-1 text-xs md:items-end">
            <span className="inline-flex items-center rounded-full bg-emerald-700/60 px-3 py-1">
              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-200" />
              {t.headerHint}
            </span>
            <span className="text-emerald-100/80">
              {t.headerStepLabel} {step} / {MAX_STEP}
            </span>
          </div>
        </div>
      </header>

      {/* GRID: FORM KIRI, HELP KANAN */}
      <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)] md:items-start">
        {/* FORM + HASIL */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl bg-white p-5 shadow-soft ring-1 ring-emerald-50 md:p-6"
        >
          {/* STEP 1 — IDENTITAS */}
          {step === 1 && (
            <SectionCard
              step={step}
              title={t.section1Title}
              description={t.section1Desc}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label required>{t.labels.namaPegawai}</Label>
                  <input
                    type="text"
                    value={form.nama}
                    onChange={(e) => handleChange('nama', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    placeholder={
                      isEn
                        ? 'Example: Dina Andayani'
                        : 'Contoh: Dina Andayani'
                    }
                    required
                  />
                </div>
                <div>
                  <Label required>{t.labels.jenisKelamin}</Label>
                  <select
                    value={form.jenisKelamin}
                    onChange={(e) =>
                      handleChange('jenisKelamin', e.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    required
                  >
                    <option value="">{t.labels.pilihJenisKelamin}</option>
                    <option value="L">{t.labels.lakiLaki}</option>
                    <option value="P">{t.labels.perempuan}</option>
                  </select>
                </div>
              </div>
            </SectionCard>
          )}

          {/* STEP 2 — STATUS PAJAK */}
          {step === 2 && (
            <SectionCard
              step={step}
              title={t.section2Title}
              description={t.section2Desc}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label required>{t.labels.statusPtkp}</Label>
                  <select
                    value={form.statusPtkp}
                    onChange={(e) =>
                      handleChange('statusPtkp', e.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    required
                  >
                    <option value="">{t.labels.pilihStatusPtkp}</option>
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
                  <Label required>{t.labels.hasNpwp}</Label>
                  <div className="mt-1 flex gap-3">
                    {(['YA', 'TIDAK'] as const).map((opt) => (
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
                        {opt === 'YA'
                          ? t.labels.yaPunyaNpwp
                          : t.labels.tidakPunyaNpwp}
                      </button>
                    ))}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {t.labels.hasNpwpHelper}
                  </p>
                </div>
              </div>
            </SectionCard>
          )}

          {/* STEP 3 — PERIODE PAJAK */}
          {step === 3 && (
            <SectionCard
              step={step}
              title={t.section3Title}
              description={t.section3Desc}
            >
              <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2">
                  <Label required>{t.labels.bulanPajak}</Label>
                  <select
                    value={form.bulanPajak}
                    onChange={(e) =>
                      handleChange('bulanPajak', e.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    required
                  >
                    <option value="">{t.labels.pilihBulan}</option>
                    <option value="JANUARI">
                      {isEn ? 'January' : 'Januari'}
                    </option>
                    <option value="FEBRUARI">
                      {isEn ? 'February' : 'Februari'}
                    </option>
                    <option value="MARET">{isEn ? 'March' : 'Maret'}</option>
                    <option value="APRIL">{isEn ? 'April' : 'April'}</option>
                    <option value="MEI">{isEn ? 'May' : 'Mei'}</option>
                    <option value="JUNI">{isEn ? 'June' : 'Juni'}</option>
                    <option value="JULI">{isEn ? 'July' : 'Juli'}</option>
                    <option value="AGUSTUS">
                      {isEn ? 'August' : 'Agustus'}
                    </option>
                    <option value="SEPTEMBER">
                      {isEn ? 'September' : 'September'}
                    </option>
                    <option value="OKTOBER">
                      {isEn ? 'October' : 'Oktober'}
                    </option>
                    <option value="NOVEMBER">
                      {isEn ? 'November' : 'November'}
                    </option>
                    <option value="DESEMBER">
                      {isEn ? 'December' : 'Desember'}
                    </option>
                  </select>
                </div>

                <div>
                  <Label required>{t.labels.tahunPajak}</Label>
                  <input
                    type="number"
                    value={form.tahunPajak}
                    onChange={(e) =>
                      handleChange('tahunPajak', e.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    placeholder="2025"
                    min={2000}
                    max={2100}
                    required
                  />
                </div>
              </div>
            </SectionCard>
          )}

          {/* STEP 4 — GAJI RUTIN */}
          {step === 4 && (
            <SectionCard
              step={step}
              title={t.section4Title}
              description={t.section4Desc}
            >
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label>{t.labels.tanggalGaji}</Label>
                  <input
                    type="date"
                    value={form.tanggalGaji}
                    onChange={(e) =>
                      handleChange('tanggalGaji', e.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>

              <div className="mt-3 grid gap-4 md:grid-cols-2">
                {(
                  [
                    ['gajiPokok', t.labels.gajiPokok, true],
                    ['tunjanganTetap', t.labels.tunjanganTetap, false],
                    [
                      'tunjanganTidakTetap',
                      t.labels.tunjanganTidakTetap,
                      false,
                    ],
                    ['tunjanganLain', t.labels.tunjanganLain, false],
                    ['jkkPerusahaan', t.labels.jkkPerusahaan, false],
                    ['jkmPerusahaan', t.labels.jkmPerusahaan, false],
                    [
                      'bpjsKesehatanPerusahaan',
                      t.labels.bpjsKesehatanPerusahaan,
                      false,
                    ],
                  ] as const
                ).map(([field, label, required]) => (
                  <div key={field}>
                    <Label required={required}>{label}</Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[11px] text-slate-400">
                        {t.currencyPrefix}
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

          {/* STEP 5 — PENGHASILAN TAMBAHAN */}
          {step === 5 && (
            <SectionCard
              step={step}
              title={t.section5Title}
              description={t.section5Desc}
            >
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label>{t.labels.tanggalPenghasilanTambahan}</Label>
                  <input
                    type="date"
                    value={form.tanggalPenghasilanTambahan}
                    onChange={(e) =>
                      handleChange(
                        'tanggalPenghasilanTambahan',
                        e.target.value
                      )
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>

              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <div>
                  <Label>{t.labels.thr}</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[11px] text-slate-400">
                      {t.currencyPrefix}
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={form.thr}
                      onChange={(e) =>
                        handleChange(
                          'thr',
                          formatCurrencyInput(e.target.value)
                        )
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 px-8 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <Label>{t.labels.bonus}</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[11px] text-slate-400">
                      {t.currencyPrefix}
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={form.bonus}
                      onChange={(e) =>
                        handleChange(
                          'bonus',
                          formatCurrencyInput(e.target.value)
                        )
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 px-8 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </SectionCard>
          )}

          {/* STEP 6 — HASIL */}
          {step === MAX_STEP && result && (
            <SectionCard
              step={step}
              title={t.section6Title}
              description={t.section6Desc}
            >
              <div className="space-y-5 text-sm">
                {/* HIGHLIGHT TOTAL BULANAN */}
                <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 text-emerald-50">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-100">
                    {t.result.highlightPrefix}{' '}
                    {result.bulanPajak.toLowerCase().replace(/^\w/, (c) =>
                      c.toUpperCase()
                    )}{' '}
                    {result.tahunPajak}
                  </p>
                  <p className="mt-1 text-xl font-semibold md:text-2xl">
                    {t.currencyPrefix}{' '}
                    {result.pph21Sebulan.toLocaleString('id-ID')}
                  </p>
                  <p className="mt-1 text-[11px] text-emerald-50/90">
                    {t.result.highlightDesc(result.kategoriTer)}
                  </p>
                </div>

                {/* RINGKASAN ANGKA UTAMA */}
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2">
                    <p className="text-[11px] text-slate-500">
                      {t.result.pphSaatGaji}
                    </p>
                    <p className="text-sm font-semibold text-emerald-800 md:text-base">
                      {t.currencyPrefix}{' '}
                      {result.pph21SaatGaji.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2">
                    <p className="text-[11px] text-slate-500">
                      {t.result.pphSaatBonus}
                    </p>
                    <p className="text-sm font-semibold text-emerald-800 md:text-base">
                      {t.currencyPrefix}{' '}
                      {result.pph21SaatBonusThr.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                {/* REKAP TABEL */}
                <div className="mt-2 overflow-x-auto rounded-xl border border-slate-100 bg-slate-50">
                  <table className="min-w-full border-collapse text-[11px] md:text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700">
                        <th className="px-3 py-2 text-left font-semibold">
                          {t.labels.tableTanggal}
                        </th>
                        <th className="px-3 py-2 text-left font-semibold">
                          {t.labels.tableJenis}
                        </th>
                        <th className="px-3 py-2 text-right font-semibold">
                          {t.labels.tableBruto}
                        </th>
                        <th className="px-3 py-2 text-right font-semibold">
                          {t.labels.tablePph21}
                        </th>
                        <th className="px-3 py-2 text-right font-semibold">
                          {t.labels.tableNetto}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.rows.map((row, idx) => (
                        <tr
                          key={idx}
                          className={
                            idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                          }
                        >
                          <td className="px-3 py-2 align-middle text-slate-600">
                            {row.tanggal || '-'}
                          </td>
                          <td className="px-3 py-2 align-middle text-slate-700">
                            {row.jenis === 'GAJI'
                              ? t.labels.jenisGaji
                              : t.labels.jenisBonusThr}
                          </td>
                          <td className="px-3 py-2 align-middle text-right text-slate-700">
                            {row.bruto.toLocaleString('id-ID')}
                          </td>
                          <td className="px-3 py-2 align-middle text-right text-rose-600">
                            {row.pph21.toLocaleString('id-ID')}
                          </td>
                          <td className="px-3 py-2 align-middle text-right text-emerald-700">
                            {row.netto.toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-emerald-50 font-semibold text-slate-900">
                        <td className="px-3 py-2" colSpan={2}>
                          {t.labels.tableTotal}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {result.brutoTotalSebulan.toLocaleString('id-ID')}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {result.pph21Sebulan.toLocaleString('id-ID')}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {(
                            result.brutoTotalSebulan - result.pph21Sebulan
                          ).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* CATATAN */}
                {result.catatan.length > 0 && (
                  <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2">
                    <p className="text-[11px] font-medium text-slate-600">
                      {t.result.catatanTitle}
                    </p>
                    <ul className="mt-1 list-disc space-y-1 pl-4 text-[11px] text-slate-600">
                      {result.catatan.map((note: string, idx: number) => (
                        <li key={idx}>{note}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="mt-1 text-[10px] text-slate-500">
                  {t.result.resultFooter}
                </p>
              </div>
            </SectionCard>
          )}

          {/* FOOTER NAV + RESET */}
          <div className="mt-1 space-y-3 border-t border-dashed border-slate-200 pt-3">
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-700">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span className="inline-flex h-6 items-center rounded-full bg-slate-100 px-2 text-[10px] font-medium text-slate-700">
                  {t.stepChip} {step} / {MAX_STEP}
                </span>
                <span>
                  {step < MAX_INPUT_STEP
                    ? t.stepsHint.beforeLast
                    : step === MAX_INPUT_STEP
                    ? t.stepsHint.lastInput
                    : t.stepsHint.result}
                </span>
              </div>

              <div className="flex gap-2">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
                  >
                    {t.buttons.back}
                  </button>
                )}

                {step < MAX_INPUT_STEP && (
                  <Button type="button" size="md" onClick={handleNext}>
                    {t.buttons.next}
                  </Button>
                )}

                {step === MAX_INPUT_STEP && (
                  <Button type="submit" size="md" disabled={isSubmitting}>
                    {isSubmitting
                      ? t.buttons.submitLoading
                      : t.buttons.submitIdle}
                  </Button>
                )}

                {step === MAX_STEP && (
                  <Button
                    type="button"
                    size="md"
                    variant="secondary"
                    onClick={() => setStep(1)}
                  >
                    {t.buttons.changeData}
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
                {t.buttons.resetAll}
              </button>
            </div>
          </div>
        </form>

        {/* HELP CARD KANAN */}
        <aside className="space-y-4 md:sticky md:top-24">
          <StepHelpCardSplit step={step} preview={preview} lang={lang} />
        </aside>
      </div>

      {/* DISCLAIMER GLOBAL */}
      <div className="rounded-2xl bg-emerald-900/95 p-4 text-[11px] text-emerald-50 shadow-soft">
        <p className="font-semibold uppercase tracking-wide text-emerald-200">
          {t.disclaimerTitle}
        </p>
        <p className="mt-1">{t.disclaimerText}</p>
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

function SectionCard({
  step,
  title,
  description,
  children,
}: SectionCardProps) {
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

/* ==== HELP CARD UNTUK TER SPLIT ==== */

type StepHelpCardSplitProps = {
  step: number;
  preview: {
    brutoGaji: number;
    brutoTambahan: number;
    totalSebulan: number;
  };
  lang: Lang;
};

function StepHelpCardSplit({
  step,
  preview,
  lang,
}: StepHelpCardSplitProps) {
  const isEn = lang === 'en';

  // STEP 1
  if (step === 1) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-4 text-[11px] text-slate-600 shadow-soft">
        <p className="text-xs font-semibold text-slate-800">
          {isEn
            ? 'Help: Employee Identity'
            : 'Bantuan: Identitas Pegawai'}
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>
            <span className="font-medium">
              {isEn ? 'Employee Name' : 'Nama Pegawai'}
            </span>{' '}
            {isEn
              ? 'will be shown in reports and withholding slips.'
              : 'akan muncul di laporan dan bukti potong.'}
          </li>
          <li>
            <span className="font-medium">
              {isEn ? 'Gender' : 'Jenis Kelamin'}
            </span>{' '}
            {isEn
              ? 'does not change the tax amount, but is important for administrative data.'
              : 'tidak mengubah nilai pajak, tapi penting untuk data administrasi pegawai.'}
          </li>
        </ul>
      </div>
    );
  }

  // STEP 2
  if (step === 2) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-4 text-[11px] text-slate-600 shadow-soft">
        <p className="text-xs font-semibold text-slate-800">
          {isEn
            ? 'Help: PTKP Status & NPWP'
            : 'Bantuan: Status PTKP & NPWP'}
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>
            <span className="font-medium">PTKP</span>{' '}
            {isEn
              ? 'is the non-taxable income threshold. The higher it is, the smaller the annual PKP.'
              : 'adalah batas penghasilan tidak kena pajak. Semakin tinggi PTKP, semakin kecil PKP tahunan.'}
          </li>
          <li>
            <span className="font-medium">TK</span> ={' '}
            {isEn ? 'Single / not married' : 'Tidak kawin'},{' '}
            <span className="font-medium">K</span> ={' '}
            {isEn ? 'Married' : 'Kawin'}.{' '}
            {isEn
              ? 'The number 0–3 indicates the number of dependents recognized.'
              : 'Angka 0–3 menunjukkan jumlah tanggungan yang diakui pajak.'}
          </li>
          <li>
            <span className="font-medium">
              {isEn ? 'Without NPWP' : 'Tanpa NPWP'}
            </span>{' '}
            {isEn
              ? 'PPh21 is usually increased by 20% (penalty tariff).'
              : 'PPh21 umumnya dikenakan tambahan 20% (tarif sanksi).'}
          </li>
        </ul>
      </div>
    );
  }

  // STEP 3
  if (step === 3) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-4 text-[11px] text-slate-600 shadow-soft">
        <p className="text-xs font-semibold text-slate-800">
          {isEn
            ? 'Help: Tax Period for Split'
            : 'Bantuan: Periode Pajak untuk Split'}
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>
            {isEn ? (
              <>
                This calculator assumes salary and bonus/THR are paid in the{' '}
                <span className="font-medium">same month</span>, but can have{' '}
                <span className="font-medium">different payment dates</span>.
              </>
            ) : (
              <>
                Kalkulator ini mengasumsikan gaji dan bonus/THR dibayar dalam{' '}
                <span className="font-medium">bulan pajak yang sama</span>,
                namun bisa punya <span className="font-medium">tanggal bayar berbeda</span>.
              </>
            )}
          </li>
          <li>
            {isEn ? (
              <>
                Later the tool will calculate{' '}
                <span className="font-medium">PPh21 at salary date</span> and{' '}
                <span className="font-medium">PPh21 at bonus/THR date</span>{' '}
                using one TER category.
              </>
            ) : (
              <>
                Nantinya akan dihitung{' '}
                <span className="font-medium">
                  PPh21 saat bayar gaji
                </span>{' '}
                dan{' '}
                <span className="font-medium">
                  PPh21 saat bayar bonus/THR
                </span>{' '}
                dengan 1 kategori TER yang sama.
              </>
            )}
          </li>
          <li>
            {isEn
              ? 'Tax month and year are used only as labels and for documentation.'
              : 'Bulan dan tahun pajak digunakan terutama untuk label dan dokumentasi.'}
          </li>
        </ul>
      </div>
    );
  }

  // STEP 4
  if (step === 4) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-4 text-[11px] text-slate-600 shadow-soft">
        <p className="text-xs font-semibold text-slate-800">
          {isEn
            ? 'Help: Regular Salary Components'
            : 'Bantuan: Komponen Gaji Rutin'}
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>
            <span className="font-medium">
              {isEn ? 'Basic Salary' : 'Gaji Pokok'}
            </span>{' '}
            {isEn
              ? 'is the main fixed income each month.'
              : 'adalah penghasilan tetap utama pegawai setiap bulan.'}
          </li>
          <li>
            <span className="font-medium">
              {isEn ? 'Fixed Allowance' : 'Tunjangan Tetap'}
            </span>{' '}
            {isEn
              ? 'such as fixed transport, position allowance, etc.'
              : 'misalnya transport tetap, tunjangan jabatan, dan sejenisnya.'}
          </li>
          <li>
            <span className="font-medium">
              {isEn ? 'Non-fixed Allowance' : 'Tunjangan Tidak Tetap'}
            </span>{' '}
            {isEn
              ? 'such as overtime or incentives that may vary each month.'
              : 'misalnya lembur atau insentif yang besarannya bisa berubah tiap bulan.'}
          </li>
          <li>
            <span className="font-medium">JKK / JKM / BPJS</span>{' '}
            {isEn
              ? 'paid by the employer are treated as gross income for PPh21 calculation.'
              : 'yang dibayar perusahaan tetap dianggap penghasilan bruto untuk perhitungan PPh21.'}
          </li>
        </ul>

        <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-2">
          <p className="text-[10px] text-slate-500">
            {isEn
              ? 'Preview: Regular Salary Gross'
              : 'Preview: Bruto Gaji Rutin'}
          </p>
          <p className="text-sm font-semibold text-emerald-800">
            Rp {preview.brutoGaji.toLocaleString('id-ID')}
          </p>
        </div>
      </div>
    );
  }

  // STEP 5
  if (step === 5) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-4 text-[11px] text-slate-600 shadow-soft">
        <p className="text-xs font-semibold text-slate-800">
          {isEn
            ? 'Help: Bonus / THR Components'
            : 'Bantuan: Komponen Bonus / THR'}
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>
            <span className="font-medium">THR</span>{' '}
            {isEn
              ? 'is usually paid once a year before religious holidays.'
              : 'biasanya dibayarkan setahun sekali menjelang hari raya.'}
          </li>
          <li>
            <span className="font-medium">Bonus</span>{' '}
            {isEn
              ? 'can be performance bonus, year-end bonus, etc.'
              : 'bisa berupa bonus kinerja, bonus akhir tahun, dan lain-lain.'}
          </li>
          <li>
            {isEn ? (
              <>
                In this split calculator, PPh21 on salary is calculated{' '}
                <span className="font-medium">first</span> (when salary is
                paid), then when bonus/THR is paid the system will{' '}
                <span className="font-medium">
                  recalculate the full-month tax
                </span>{' '}
                and compute the difference.
              </>
            ) : (
              <>
                Di kalkulator split ini, PPh21 atas gaji dihitung{' '}
                <span className="font-medium">lebih dulu</span> (saat gaji
                dibayar), lalu saat bonus/THR dibayar sistem akan{' '}
                <span className="font-medium">
                  menghitung ulang pajak sebulan penuh
                </span>{' '}
                dan mengambil selisihnya.
              </>
            )}
          </li>
        </ul>

        <div className="mt-3 space-y-2">
          <div className="rounded-lg bg-emerald-50 px-3 py-2">
            <p className="text-[10px] text-slate-500">
              {isEn
                ? 'Preview: Additional Income (Bonus + THR)'
                : 'Preview: Bruto Penghasilan Tambahan (Bonus + THR)'}
            </p>
            <p className="text-sm font-semibold text-emerald-800">
              Rp {preview.brutoTambahan.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="rounded-lg bg-emerald-50 px-3 py-2">
            <p className="text-[10px] text-slate-500">
              {isEn
                ? 'Preview: Total Gross This Month'
                : 'Preview: Total Bruto Sebulan'}
            </p>
            <p className="text-sm font-semibold text-emerald-800">
              Rp {preview.totalSebulan.toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // STEP 6 (HASIL)
  if (step === MAX_STEP) {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-white p-4 text-[11px] text-slate-600 shadow-soft">
        <p className="text-xs font-semibold text-emerald-900">
          {isEn
            ? 'Help: Reading Split PPh21 Result'
            : 'Bantuan: Membaca Hasil PPh21 Split'}
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>
            {isEn ? (
              <>
                <span className="font-medium">
                  PPh21 at salary payment
                </span>{' '}
                is the tax withheld when regular salary is paid.
              </>
            ) : (
              <>
                <span className="font-medium">
                  PPh21 saat pembayaran gaji
                </span>{' '}
                adalah pajak yang dipotong pada saat gaji rutin dibayarkan.
              </>
            )}
          </li>
          <li>
            {isEn ? (
              <>
                <span className="font-medium">
                  PPh21 at bonus/THR payment
                </span>{' '}
                is the additional tax when bonus/THR is paid so that the total
                tax for the month matches the TER table.
              </>
            ) : (
              <>
                <span className="font-medium">
                  PPh21 saat pembayaran bonus/THR
                </span>{' '}
                adalah tambahan pajak ketika bonus/THR dibayarkan sehingga
                total pajak bulan itu sesuai dengan tabel TER.
              </>
            )}
          </li>
          <li>
            {isEn ? (
              <>
                The <span className="font-medium">Total PPh21 This Month</span>{' '}
                is the sum of both, and this is usually what appears in
                monthly PPh21 reporting.
              </>
            ) : (
              <>
                <span className="font-medium">
                  Total PPh21 Bulan Ini
                </span>{' '}
                adalah penjumlahan keduanya, dan biasanya inilah angka yang
                muncul di pelaporan PPh21 masa.
              </>
            )}
          </li>
        </ul>
        <p className="mt-2 text-[10px] text-slate-500">
          {isEn
            ? 'If the result looks off, you can click “Edit Data” on the left and adjust the salary or bonus/THR figures.'
            : 'Jika hasil terasa tidak wajar, Anda bisa klik “Ubah Data” di sebelah kiri dan menyesuaikan kembali angka gaji maupun bonus/THR.'}
        </p>
      </div>
    );
  }

  return null;
}
