// components/calculators/PphProfesionalCalculator.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { Lang } from '@/lib/types';

import type { JenisKelamin, PtkpStatus } from '@/lib/tax/pph21-ter';
import {
  computePphProfesional,
  type ProfesionalResult,
  type FreelancerJobType,
} from '@/lib/tax/pph-profesional';

type FormState = {
  nama: string;
  jenisKelamin: JenisKelamin | '';

  statusPtkp: PtkpStatus | '';
  hasNpwp: '' | 'YA' | 'TIDAK';
  hasLegalEntity: '' | 'YA' | 'TIDAK';
  hasBookkeeping: '' | 'YA' | 'TIDAK';

  jobType: FreelancerJobType | '';

  omzetSetahun: string;
  biayaSetahun: string;
};

const initialForm: FormState = {
  nama: '',
  jenisKelamin: '',

  statusPtkp: '',
  hasNpwp: '',
  hasLegalEntity: '',
  hasBookkeeping: '',

  jobType: '',

  omzetSetahun: '',
  biayaSetahun: '',
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

const MAX_INPUT_STEP = 3;
const MAX_STEP = 4;

type Props = {
  lang: Lang;
};

export function PphProfesionalCalculator({ lang }: Props) {
  const isEn = lang === 'en';

  const [form, setForm] = useState<FormState>(initialForm);
  const [step, setStep] = useState<number>(1);
  const [result, setResult] = useState<ProfesionalResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ====== VALIDASI ======
  function validateStep(currentStep: number): string | null {
    switch (currentStep) {
      case 1: {
        if (!form.nama.trim()) {
          return isEn ? 'Name is required.' : 'Nama wajib diisi.';
        }
        if (!form.jenisKelamin) {
          return isEn
            ? 'Gender must be selected.'
            : 'Jenis kelamin wajib dipilih.';
        }
        return null;
      }

      case 2: {
        const { statusPtkp, hasNpwp, hasLegalEntity, hasBookkeeping, jobType } =
          form;

        if (!statusPtkp) {
          return isEn
            ? 'PTKP status must be selected.'
            : 'Status PTKP wajib dipilih.';
        }

        if (!hasNpwp) {
          return isEn
            ? 'Please specify whether you have a TIN (NPWP).'
            : 'Harap pilih apakah memiliki NPWP atau tidak.';
        }

        // Pastikan user sudah pilih YA/TIDAK dulu
        if (hasLegalEntity !== 'YA' && hasLegalEntity !== 'TIDAK') {
          return isEn
            ? 'Please specify whether you have a legal entity (PT/CV).'
            : 'Harap pilih apakah memiliki badan hukum (PT/CV) atau tidak.';
        }

        // Kalau YA → langsung info bahwa kalkulator ini bukan untuk PT/CV
        if (hasLegalEntity === 'YA') {
          return isEn
            ? 'This calculator is intended for individuals without a legal entity. Please use the Corporate Income Tax calculator for PT/CV.'
            : 'Kalkulator ini hanya untuk profesional/freelancer tanpa badan hukum. Silakan gunakan kalkulator PPh Badan untuk PT/CV.';
        }

        // Di titik ini, hasLegalEntity pasti "TIDAK"
        if (hasBookkeeping !== 'YA' && hasBookkeeping !== 'TIDAK') {
          return isEn
            ? 'Please specify whether you have complete bookkeeping.'
            : 'Harap pilih apakah memiliki pembukuan lengkap atau tidak.';
        }

        if (!jobType) {
          return isEn
            ? 'Please select your type of profession/work.'
            : 'Harap pilih jenis pekerjaan/profesi.';
        }

        return null;
      }

      case 3: {
        const omzet = parseNumber(form.omzetSetahun);
        if (!form.omzetSetahun || omzet <= 0) {
          return isEn
            ? 'Annual revenue (turnover) must be filled and greater than 0.'
            : 'Omzet / pendapatan setahun wajib diisi dan lebih dari 0.';
        }

        if (form.hasBookkeeping === 'YA') {
          const biaya = parseNumber(form.biayaSetahun);
          if (!form.biayaSetahun) {
            return isEn
              ? 'Total annual expenses must be filled when using bookkeeping.'
              : 'Total biaya setahun wajib diisi jika menggunakan pembukuan.';
          }
          if (biaya < 0) {
            return isEn
              ? 'Expenses cannot be negative.'
              : 'Biaya tidak boleh negatif.';
          }
        }
        return null;
      }

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
  
    // 👉 Hitung dulu flag boolean YA / TIDAK di sini,
    //    sebelum ada branch/narrowing aneh-aneh
    const usesLegalEntity = form.hasLegalEntity === 'YA';
    const usesBookkeeping = form.hasBookkeeping === 'YA';
  
    // Kalau pakai PT/CV, stop di sini
    if (usesLegalEntity) {
      setError(
        isEn
          ? 'This calculator is for individuals without a legal entity. Please use the Corporate Income Tax calculator.'
          : 'Kalkulator ini hanya untuk profesional/freelancer tanpa badan hukum. Silakan gunakan kalkulator PPh Badan untuk PT/CV.'
      );
      return;
    }
  
    const input = {
      nama: form.nama.trim(),
      jenisKelamin: form.jenisKelamin as JenisKelamin,
      statusPtkp: form.statusPtkp as PtkpStatus,
      hasNpwp: form.hasNpwp === 'YA',
  
      // 👉 Pakai flag boolean yang sudah dihitung
      hasLegalEntity: usesLegalEntity,
      hasBookkeeping: usesBookkeeping,
  
      jobType: form.jobType as FreelancerJobType,
  
      omzetSetahun: parseNumber(form.omzetSetahun),
      biayaSetahun: usesBookkeeping
        ? parseNumber(form.biayaSetahun)
        : undefined,
    };
  
    setIsSubmitting(true);
    try {
      const res = computePphProfesional(input);
      setResult(res);
      setStep(MAX_STEP);
    } catch (err) {
      console.error(err);
      setError(
        isEn
          ? 'An error occurred while calculating your tax. Please review your inputs.'
          : 'Terjadi kesalahan saat menghitung pajak. Coba cek kembali input Anda.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==== RENDER ====
  return (
    <div className="mx-auto max-w-5xl space-y-6 md:space-y-8">
      {/* HEADER */}
      <header className="rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 p-5 text-slate-50 shadow-soft md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-100">
              {isEn
                ? 'Freelancer Tax Calculator'
                : 'Kalkulator Pajak Profesional / Freelancer'}
            </p>
            <h1 className="mt-1 text-lg font-semibold md:text-2xl">
              {isEn
                ? 'Estimate Personal Income Tax for Professionals / Freelancers'
                : 'Estimasi Pajak Penghasilan Profesional / Pekerja Bebas'}
            </h1>
            <p className="mt-1 text-xs text-emerald-50/90 md:text-sm">
              {isEn
                ? 'Designed for individuals who earn income from professional / freelance services without using a legal entity (no PT/CV).'
                : 'Dirancang untuk Wajib Pajak Orang Pribadi yang menerima penghasilan dari jasa profesional / freelance tanpa menggunakan badan hukum (tanpa PT/CV).'}
            </p>
          </div>
          <div className="flex flex-col items-start gap-1 text-xs md:items-end">
            <span className="inline-flex items-center rounded-full bg-emerald-700/60 px-3 py-1">
              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-200" />
              {isEn
                ? 'Simulation only — not an official tax calculation'
                : 'Versi simulasi — bukan perhitungan pajak resmi'}
            </span>
            <span className="text-emerald-100/80">
              {isEn ? 'Step' : 'Langkah'} {step} {isEn ? 'of' : 'dari'}{' '}
              {MAX_STEP}
            </span>
          </div>
        </div>
      </header>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl bg-white p-5 shadow-soft ring-1 ring-emerald-50 md:p-6"
      >
        {/* STEP 1 — IDENTITAS */}
        {step === 1 && (
          <SectionCard
            step={step}
            title={isEn ? 'Professional Identity' : 'Identitas Profesional'}
            description={
              isEn
                ? 'Basic identity data used for this tax simulation.'
                : 'Data identitas dasar yang digunakan untuk simulasi pajak.'
            }
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label required>{isEn ? 'Name' : 'Nama Lengkap'}</Label>
                <input
                  type="text"
                  value={form.nama}
                  onChange={(e) => handleChange('nama', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  placeholder={
                    isEn ? 'Example: Andi Pratama' : 'Contoh: Andi Pratama'
                  }
                  required
                />
              </div>
              <div>
                <Label required>
                  {isEn ? 'Gender' : 'Jenis Kelamin'}
                </Label>
                <select
                  value={form.jenisKelamin}
                  onChange={(e) =>
                    handleChange('jenisKelamin', e.target.value)
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  required
                >
                  <option value="">
                    {isEn ? 'Select gender' : 'Pilih jenis kelamin'}
                  </option>
                  <option value="L">
                    {isEn ? 'Male' : 'Laki-laki'}
                  </option>
                  <option value="P">
                    {isEn ? 'Female' : 'Perempuan'}
                  </option>
                </select>
              </div>
            </div>
          </SectionCard>
        )}

        {/* STEP 2 — STATUS + NPWP + BADAN HUKUM + JENIS KERJA */}
        {step === 2 && (
          <SectionCard
            step={step}
            title={
              isEn
                ? 'Tax Status & Work Type'
                : 'Status Perpajakan & Jenis Pekerjaan'
            }
            description={
              isEn
                ? 'These choices affect PTKP, NPPN tariffs, and the calculation method.'
                : 'Pilihan ini mempengaruhi PTKP, tarif NPPN, dan metode perhitungan pajak.'
            }
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label required>
                  {isEn
                    ? 'PTKP Status'
                    : 'Status Perkawinan / Tanggungan (PTKP)'}
                </Label>
                <select
                  value={form.statusPtkp}
                  onChange={(e) =>
                    handleChange('statusPtkp', e.target.value)
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  required
                >
                  <option value="">
                    {isEn ? 'Select PTKP status' : 'Pilih status PTKP'}
                  </option>
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
                <Label required>
                  {isEn ? 'Do you have NPWP?' : 'Memiliki NPWP?'}
                </Label>
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
                      {opt === 'YA'
                        ? isEn
                          ? 'Yes, I have NPWP'
                          : 'Ya, saya punya NPWP'
                        : isEn
                        ? 'No NPWP'
                        : 'Belum punya NPWP'}
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  {isEn
                    ? 'Without NPWP, the final tax is usually increased by 20%.'
                    : 'Jika tidak memiliki NPWP, pajak biasanya ditambah 20%.'}
                </p>
              </div>

              <div>
                <Label required>
                  {isEn
                    ? 'Do you operate through a legal entity (PT/CV)?'
                    : 'Apakah menggunakan badan hukum (PT/CV)?'}
                </Label>
                <div className="mt-1 flex gap-3">
                  {['YA', 'TIDAK'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleChange('hasLegalEntity', opt)}
                      className={cn(
                        'flex-1 rounded-lg border px-3 py-2 text-xs md:text-sm',
                        form.hasLegalEntity === opt
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 text-slate-700 hover:border-emerald-300'
                      )}
                    >
                      {opt === 'YA'
                        ? isEn
                          ? 'Yes, PT/CV'
                          : 'Ya, PT/CV'
                        : isEn
                        ? 'No legal entity'
                        : 'Tidak, atas nama pribadi'}
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-[11px] text-amber-600">
                  {isEn
                    ? 'If you use a PT/CV, please use the Corporate Income Tax calculator (PPh Badan).'
                    : 'Jika menggunakan PT/CV, sebaiknya menggunakan kalkulator PPh Badan (pajak badan usaha).'}
                </p>
              </div>

              <div>
                <Label required>
                  {isEn
                    ? 'Do you have complete bookkeeping?'
                    : 'Apakah memiliki pembukuan lengkap?'}
                </Label>
                <div className="mt-1 flex gap-3">
                  {['YA', 'TIDAK'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleChange('hasBookkeeping', opt)}
                      className={cn(
                        'flex-1 rounded-lg border px-3 py-2 text-xs md:text-sm',
                        form.hasBookkeeping === opt
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 text-slate-700 hover:border-emerald-300'
                      )}
                    >
                      {opt === 'YA'
                        ? isEn
                          ? 'Yes, full bookkeeping'
                          : 'Ya, ada pembukuan lengkap'
                        : isEn
                        ? 'No, use NPPN'
                        : 'Tidak, pakai NPPN'}
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  {isEn
                    ? 'If you do not have bookkeeping, the calculator will use NPPN (normative net income).'
                    : 'Jika tidak memiliki pembukuan, perhitungan akan menggunakan NPPN (Norma Penghitungan Penghasilan Neto).'}
                </p>
              </div>

              <div className="md:col-span-2">
                <Label required>
                  {isEn
                    ? 'Type of Profession / Work'
                    : 'Jenis Pekerjaan / Profesi'}
                </Label>
                <select
                  value={form.jobType}
                  onChange={(e) =>
                    handleChange(
                      'jobType',
                      e.target.value as FreelancerJobType
                    )
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  required
                >
                  <option value="">
                    {isEn
                      ? 'Select profession'
                      : 'Pilih jenis pekerjaan/profesi'}
                  </option>
                  <option value="DOKTER">Dokter</option>
                  <option value="TENAGA_MEDIS_LAINNYA">
                    Tenaga Medis Lainnya
                  </option>
                  <option value="PSIKOLOG">Psikolog</option>
                  <option value="PENGACARA_NOTARIS">
                    Pengacara / Notaris
                  </option>
                  <option value="PROFESI_HUKUM_LAINNYA">
                    Profesi Hukum Lainnya
                  </option>
                  <option value="KONSULTAN_KEUANGAN">
                    Konsultan Keuangan
                  </option>
                  <option value="PROFESI_PENDIDIKAN">
                    Profesi Pendidikan
                  </option>
                  <option value="PEKERJA_SENI">Pekerja Seni</option>
                  <option value="PEDAGANG">Pedagang</option>
                  <option value="JASA_NON_PROFESIONAL">
                    Jasa Non-Profesional
                  </option>
                  <option value="LAINNYA">Lainnya</option>
                </select>
                <p className="mt-1 text-[11px] text-slate-500">
                  {isEn
                    ? 'The profession type determines the NPPN rate if you do not use bookkeeping.'
                    : 'Jenis profesi menentukan tarif NPPN jika Anda tidak menggunakan pembukuan.'}
                </p>
              </div>
            </div>
          </SectionCard>
        )}

        {/* STEP 3 — OMZET & BIAYA */}
        {step === 3 && (
          <SectionCard
            step={step}
            title={
              isEn
                ? 'Annual Revenue & Expenses'
                : 'Omzet & Biaya Setahun'
            }
            description={
              isEn
                ? 'Fill in your total revenue for the year, and if you use bookkeeping, also fill in total expenses.'
                : 'Isi total omzet dalam 1 tahun pajak, dan jika menggunakan pembukuan, isi juga total biaya setahun.'
            }
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label required>
                  {isEn
                    ? 'Total Revenue in a Year (Rp)'
                    : 'Total Pendapatan / Omzet Setahun (Rp)'}
                </Label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[11px] text-slate-400">
                    Rp
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.omzetSetahun}
                    onChange={(e) =>
                      handleChange(
                        'omzetSetahun',
                        formatCurrencyInput(e.target.value)
                      )
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-8 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              {form.hasBookkeeping === 'YA' && (
                <div>
                  <Label required>
                    {isEn
                      ? 'Total Expenses in a Year (Rp)'
                      : 'Total Biaya Setahun (Rp)'}
                  </Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[11px] text-slate-400">
                      Rp
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={form.biayaSetahun}
                      onChange={(e) =>
                        handleChange(
                          'biayaSetahun',
                          formatCurrencyInput(e.target.value)
                        )
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 px-8 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      placeholder="0"
                      required
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {isEn
                      ? 'Fill with total expenses related to your professional income (from your bookkeeping).'
                      : 'Isi dengan total biaya terkait penghasilan profesional (berdasarkan pembukuan).'}
                  </p>
                </div>
              )}
            </div>
          </SectionCard>
        )}

        {/* STEP 4 — HASIL */}
        {step === MAX_STEP && result && (
          <SectionCard
            step={step}
            title={
              isEn ? 'Estimated Tax Result' : 'Hasil Estimasi Pajak'
            }
            description={
              isEn
                ? 'Summary of annual tax estimation based on the inputs you provided.'
                : 'Ringkasan estimasi pajak tahunan berdasarkan data yang Anda isi.'
            }
          >
            <div className="space-y-5 text-sm">
              {/* HIGHLIGHT */}
              <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 text-emerald-50">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-100">
                  {isEn
                    ? 'Estimated Annual Tax'
                    : 'Estimasi Pajak Tahunan'}
                </p>
                <p className="mt-1 text-xl font-semibold md:text-2xl">
                  Rp {result.pajakSetelahNpwp.toLocaleString('id-ID')}
                </p>
                <p className="mt-1 text-[11px] text-emerald-50/90">
                  {isEn
                    ? 'This number is an estimation and may differ from official tax calculation.'
                    : 'Angka ini merupakan estimasi dan dapat berbeda dengan perhitungan pajak resmi.'}
                </p>
              </div>

              {/* RINGKASAN */}
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2">
                  <p className="text-[11px] text-slate-500">
                    {isEn ? 'Calculation Method' : 'Metode Perhitungan'}
                  </p>
                  <p className="text-sm font-semibold text-emerald-800 md:text-base">
                    {result.metode === 'PEMBUKUAN'
                      ? isEn
                        ? 'Bookkeeping (real net income)'
                        : 'Pembukuan (penghasilan neto riil)'
                      : isEn
                      ? 'NPPN (normative net income)'
                      : 'NPPN (penghasilan neto normatif)'}
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2">
                  <p className="text-[11px] text-slate-500">
                    {isEn
                      ? 'Tax before NPWP adjustment'
                      : 'Pajak sebelum penyesuaian NPWP'}
                  </p>
                  <p className="text-sm font-semibold text-emerald-800 md:text-base">
                    Rp {result.pajakSebelumNpwp.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              {/* DETAIL */}
              <div className="overflow-x-auto rounded-xl border border-slate-100 bg-slate-50">
                <table className="min-w-full border-collapse text-[11px] md:text-xs">
                  <tbody>
                    <tr>
                      <td className="px-3 py-2 font-medium text-slate-600">
                        {isEn
                          ? 'Annual Revenue (Turnover)'
                          : 'Omzet / Pendapatan Setahun'}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-800">
                        Rp {result.omzetSetahun.toLocaleString('id-ID')}
                      </td>
                    </tr>
                    {result.metode === 'PEMBUKUAN' && (
                      <tr>
                        <td className="px-3 py-2 font-medium text-slate-600">
                          {isEn
                            ? 'Annual Expenses (Bookkeeping)'
                            : 'Total Biaya Setahun (Pembukuan)'}
                        </td>
                        <td className="px-3 py-2 text-right text-slate-800">
                          Rp {result.biayaSetahun.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    )}
                    {result.metode === 'NPPN' && (
                      <tr>
                        <td className="px-3 py-2 font-medium text-slate-600">
                          {isEn
                            ? 'NPPN Net Income'
                            : 'Penghasilan Neto Menurut NPPN'}
                        </td>
                        <td className="px-3 py-2 text-right text-slate-800">
                          Rp {(result.netoNormatif ?? 0).toLocaleString(
                            'id-ID'
                          )}
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td className="px-3 py-2 font-medium text-slate-600">
                        {isEn ? 'PTKP' : 'PTKP'}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-800">
                        Rp {result.ptkp.toLocaleString('id-ID')}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-medium text-slate-600">
                        {isEn
                          ? 'Annual Taxable Income (PKP)'
                          : 'Penghasilan Kena Pajak (PKP) Tahunan'}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-800">
                        Rp {result.pkp.toLocaleString('id-ID')}
                      </td>
                    </tr>
                    <tr className="bg-emerald-50 font-semibold text-slate-900">
                      <td className="px-3 py-2">
                        {isEn
                          ? 'Estimated Tax Payable (Final)'
                          : 'Estimasi PPh Terutang (Akhir)'}
                      </td>
                      <td className="px-3 py-2 text-right">
                        Rp {result.pajakSetelahNpwp.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* CATATAN */}
              {result.catatan.length > 0 && (
                <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2">
                  <p className="text-[11px] font-medium text-slate-600">
                    {isEn
                      ? 'Calculation Notes:'
                      : 'Catatan Perhitungan:'}
                  </p>
                  <ul className="mt-1 list-disc space-y-1 pl-4 text-[11px] text-slate-600">
                    {result.catatan.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Disclaimer khusus NPPN */}
              <p className="mt-1 text-[10px] text-slate-500">
                {isEn
                  ? 'Disclaimer: The result is an estimation. The displayed figure is not an official tax amount and may differ if you do not meet the requirements for using NPPN or if you use real bookkeeping.'
                  : 'Disclaimer: Hasil perhitungan merupakan estimasi. Angka yang ditampilkan bukan angka pajak resmi dan dapat berbeda apabila Anda belum memenuhi syarat penggunaan NPPN atau menggunakan pembukuan riil.'}
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
                {isEn ? 'Step' : 'Step'} {step} / {MAX_STEP}
              </span>
              <span>
                {step < MAX_INPUT_STEP
                  ? isEn
                    ? 'Complete the data, then click Next.'
                    : 'Lengkapi data lalu klik Lanjut.'
                  : step === MAX_INPUT_STEP
                  ? isEn
                    ? 'Click Calculate Tax to see your estimation.'
                    : 'Klik Hitung Pajak untuk melihat estimasi.'
                  : isEn
                  ? 'This is the summary. You can go back to change the data if needed.'
                  : 'Ini adalah ringkasan. Anda bisa kembali untuk mengubah data jika perlu.'}
              </span>
            </div>

            <div className="flex gap-2">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
                >
                  {isEn ? 'Back' : 'Kembali'}
                </button>
              )}

              {step < MAX_INPUT_STEP && (
                <Button type="button" size="md" onClick={handleNext}>
                  {isEn ? 'Next' : 'Lanjut'}
                </Button>
              )}

              {step === MAX_INPUT_STEP && (
                <Button type="submit" size="md" disabled={isSubmitting}>
                  {isSubmitting
                    ? isEn
                      ? 'Calculating...'
                      : 'Menghitung...'
                    : isEn
                    ? 'Calculate Tax'
                    : 'Hitung Pajak'}
                </Button>
              )}

              {step === MAX_STEP && (
                <Button
                  type="button"
                  size="md"
                  variant="secondary"
                  onClick={() => setStep(1)}
                >
                  {isEn ? 'Edit Data' : 'Ubah Data'}
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
              {isEn ? 'Reset all inputs' : 'Reset semua input'}
            </button>
          </div>
        </div>
      </form>

      {/* DISCLAIMER GLOBAL */}
      <div className="rounded-2xl bg-emerald-900/95 p-4 text-[11px] text-emerald-50 shadow-soft">
        <p className="font-semibold uppercase tracking-wide text-emerald-200">
          {isEn ? 'Disclaimer' : 'Disclaimer'}
        </p>
        <p className="mt-1">
          {isEn
            ? 'This calculator is provided for simulation and educational purposes. The final tax payable must follow applicable regulations, detailed bookkeeping (if any), and official calculations by the tax authority.'
            : 'Kalkulator ini disediakan untuk keperluan simulasi dan edukasi. Pajak terutang yang sebenarnya harus mengikuti ketentuan yang berlaku, pembukuan rinci (jika ada), dan perhitungan resmi otoritas pajak.'}
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
