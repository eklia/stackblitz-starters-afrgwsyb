// lib/tax/pph-profesional.ts
import type { JenisKelamin, PtkpStatus } from './pph21-ter';

export type FreelancerJobType =
  | 'DOKTER'
  | 'TENAGA_MEDIS_LAINNYA'
  | 'PSIKOLOG'
  | 'PENGACARA_NOTARIS'
  | 'PROFESI_HUKUM_LAINNYA'
  | 'KONSULTAN_KEUANGAN'
  | 'PROFESI_PENDIDIKAN'
  | 'PEKERJA_SENI'
  | 'PEDAGANG'
  | 'JASA_NON_PROFESIONAL'
  | 'LAINNYA';

export type ProfesionalInput = {
  nama: string;
  jenisKelamin: JenisKelamin;
  statusPtkp: PtkpStatus;
  hasNpwp: boolean;

  hasLegalEntity: boolean; // punya PT/CV? kalau YA harusnya ke kalkulator badan
  hasBookkeeping: boolean; // ada pembukuan lengkap?

  jobType: FreelancerJobType;

  omzetSetahun: number; // total pendapatan setahun
  biayaSetahun?: number; // total biaya setahun (hanya dipakai kalau hasBookkeeping = true)
};

export type ProfesionalResult = {
  nama: string;
  jenisKelamin: JenisKelamin;
  statusPtkp: PtkpStatus;
  hasNpwp: boolean;

  hasLegalEntity: boolean;
  hasBookkeeping: boolean;
  jobType: FreelancerJobType;

  metode: 'PEMBUKUAN' | 'NPPN';

  omzetSetahun: number;
  biayaSetahun: number;
  netoNormatif?: number; // hanya kalau pakai NPPN
  dasarPengenaan: number; // neto riil (pembukuan) atau neto normatif (NPPN)

  ptkp: number;
  pkp: number;

  tarifNppn?: number;
  pajakSebelumNpwp: number;
  pajakSetelahNpwp: number;

  catatan: string[];
};

/* ========= HELPER: PTKP (copy dari pph21-ter) ========= */

function getPtkpAmount(status: PtkpStatus): number {
  const dasar = 54_000_000; // TK/0
  const tambahanKawin = 4_500_000;
  const tambahanTanggungan = 4_500_000;

  switch (status) {
    case 'TK/0':
      return dasar;
    case 'TK/1':
      return dasar + 1 * tambahanTanggungan;
    case 'TK/2':
      return dasar + 2 * tambahanTanggungan;
    case 'TK/3':
      return dasar + 3 * tambahanTanggungan;
    case 'K/0':
      return dasar + tambahanKawin;
    case 'K/1':
      return dasar + tambahanKawin + 1 * tambahanTanggungan;
    case 'K/2':
      return dasar + tambahanKawin + 2 * tambahanTanggungan;
    case 'K/3':
      return dasar + tambahanKawin + 3 * tambahanTanggungan;
    default:
      return dasar;
  }
}

/* ========= HELPER: PROGRESIF ========= */

const PROGRESIF = [
  { upTo: 60_000_000, rate: 0.05 },
  { upTo: 250_000_000, rate: 0.15 },
  { upTo: 500_000_000, rate: 0.25 },
  { upTo: 5_000_000_000, rate: 0.3 },
];

function hitungProgresif(pkp: number): number {
  let sisa = pkp;
  let pajak = 0;
  let lower = 0;

  for (const layer of PROGRESIF) {
    if (sisa <= 0) break;
    const batasSegmen = layer.upTo - lower;
    const segmen = Math.min(sisa, batasSegmen);
    pajak += segmen * layer.rate;
    sisa -= segmen;
    lower = layer.upTo;
  }

  if (sisa > 0) {
    pajak += sisa * PROGRESIF[PROGRESIF.length - 1].rate;
  }

  return pajak;
}

function roundDownToThousand(n: number): number {
  return Math.floor(n / 1000) * 1000;
}

/* ========= TARIF NPPN ========= */

const NPPN_RATES: Record<FreelancerJobType, number> = {
  DOKTER: 0.5,
  TENAGA_MEDIS_LAINNYA: 0.5,
  PSIKOLOG: 0.5,
  PENGACARA_NOTARIS: 0.5,
  PROFESI_HUKUM_LAINNYA: 0.5,
  KONSULTAN_KEUANGAN: 0.5,
  PROFESI_PENDIDIKAN: 0.5,
  PEKERJA_SENI: 0.5,
  PEDAGANG: 0.3,
  JASA_NON_PROFESIONAL: 0.4,
  LAINNYA: 0.5, // asumsi: 50% untuk "Lainnya" — bisa di-adjust kalau partner kasih angka khusus
};

/* ========= FUNGSI UTAMA ========= */

export function computePphProfesional(
  input: ProfesionalInput
): ProfesionalResult {
  const catatan: string[] = [];

  if (input.hasLegalEntity) {
    catatan.push(
      'Wajib pajak memiliki badan hukum (PT/CV). Kalkulator ini ditujukan untuk profesional/freelancer tanpa badan hukum. Disarankan menggunakan kalkulator PPh Badan.'
    );
  }

  const ptkp = getPtkpAmount(input.statusPtkp);
  const omzet = Math.max(0, input.omzetSetahun || 0);

  let metode: ProfesionalResult['metode'];
  let biayaDipakai = 0;
  let netoNormatif: number | undefined;
  let dasarPengenaan = 0;
  let tarifNppn: number | undefined;

  if (input.hasBookkeeping) {
    // LOGIC 1 — pakai pembukuan riil
    metode = 'PEMBUKUAN';
    biayaDipakai = Math.max(0, input.biayaSetahun || 0);
    dasarPengenaan = Math.max(0, omzet - biayaDipakai);

    catatan.push(
      'Metode perhitungan menggunakan pembukuan riil (omzet dikurangi biaya aktual).'
    );
  } else {
    // LOGIC 2 — pakai NPPN
    metode = 'NPPN';
    const rate = NPPN_RATES[input.jobType] ?? 0.5;
    tarifNppn = rate;
    netoNormatif = omzet * rate;
    dasarPengenaan = Math.max(0, netoNormatif);

    catatan.push(
      `Metode perhitungan menggunakan NPPN dengan tarif ${
        rate * 100
      }% dari omzet setahun.`
    );
  }

  // PKP = dasar pengenaan - PTKP (dibulatkan ke ribuan bawah)
  const pkpRaw = Math.max(0, dasarPengenaan - ptkp);
  const pkp = roundDownToThousand(pkpRaw);

  if (pkp === 0) {
    catatan.push(
      'Setelah dikurangi PTKP, Penghasilan Kena Pajak (PKP) menjadi 0. Tidak ada PPh terutang.'
    );
  }

  let pajakSetahun = hitungProgresif(pkp);
  const pajakSebelumNpwp = pajakSetahun;

  if (!input.hasNpwp) {
    pajakSetahun *= 1.2;
    catatan.push(
      'Wajib pajak tidak memiliki NPWP, sehingga PPh terutang dikenakan tambahan 20%.'
    );
  }

  catatan.push(
    'Tarif progresif yang digunakan: 5% sampai 60 juta, 15% di atas 60–250 juta, 25% di atas 250–500 juta, 30% di atas 500 juta.'
  );

  return {
    nama: input.nama,
    jenisKelamin: input.jenisKelamin,
    statusPtkp: input.statusPtkp,
    hasNpwp: input.hasNpwp,
    hasLegalEntity: input.hasLegalEntity,
    hasBookkeeping: input.hasBookkeeping,
    jobType: input.jobType,

    metode,
    omzetSetahun: omzet,
    biayaSetahun: biayaDipakai,
    netoNormatif,
    dasarPengenaan,
    ptkp,
    pkp,

    tarifNppn,
    pajakSebelumNpwp,
    pajakSetelahNpwp: Math.round(pajakSetahun),

    catatan,
  };
}
