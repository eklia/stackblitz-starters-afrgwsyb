// lib/tax/pph21-ter.ts
export type JenisKelamin = 'L' | 'P';

export type PtkpStatus =
  | 'TK/0'
  | 'TK/1'
  | 'TK/2'
  | 'TK/3'
  | 'K/0'
  | 'K/1'
  | 'K/2'
  | 'K/3';

export type JenisPerhitungan = 'BULANAN' | 'TAHUNAN';

export type BulanPenghasilan =
  | 'JANUARI'
  | 'FEBRUARI'
  | 'MARET'
  | 'APRIL'
  | 'MEI'
  | 'JUNI'
  | 'JULI'
  | 'AGUSTUS'
  | 'SEPTEMBER'
  | 'OKTOBER'
  | 'NOVEMBER'
  | 'DESEMBER';

export type Pph21TerInput = {
  nama: string;
  jenisKelamin: JenisKelamin;
  statusPtkp: PtkpStatus;
  hasNpwp: boolean;
  jenisPerhitungan: JenisPerhitungan;
  bulan?: BulanPenghasilan;

  // SECTION 5 — masa penghasilan setahun (1–12, hanya untuk tahunan)
  masaKerjaSetahun?: number;

  // SECTION 6 — bruto bulanan
  gajiPokok: number;
  tunjanganTetap: number;
  tunjanganTidakTetap: number;
  bonus: number;
  thr: number;
  tunjanganLain: number;
  jkkPerusahaan: number;
  jkmPerusahaan: number;
  bpjsKesehatanPerusahaan: number;

  // SECTION 7 — potongan
  iuranPensiun: number;
  iuranJht: number;
  zakatMelaluiPemberiKerja: number;

  // info tambahan hanya untuk display/log, tidak mempengaruhi hitung
  tanggalMasuk?: string;
  tanggalKeluar?: string;
};

export type Pph21TerResult = {
  jenisPerhitungan: JenisPerhitungan;
  bulan?: BulanPenghasilan;

  brutoBulanan: number;
  pengurangBulanan: number;
  biayaJabatanBulanan: number;
  nettoBulanan: number;

  brutoSetahun: number;
  pengurangSetahun: number;
  nettoSetahun: number;
  masaKerjaSetahun: number;

  ptkp: number;
  pkpTahunan?: number;

  kategoriTer?: 'A' | 'B' | 'C';
  tarifTer?: number;

  pph21Bulanan?: number;
  pph21Tahunan?: number;

  catatan: string[];
};

/* ========= HELPER: PTKP ========= */

function getPtkpAmount(status: PtkpStatus): number {
  // PTKP standar (bisa disesuaikan jika partner punya angka terbaru)
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

/* ========= HELPER: KATEGORI TER ========= */

export type TerCategory = 'A' | 'B' | 'C';

/**
 * Menentukan kategori TER (A/B/C) berdasarkan PTKP setahun,
 * sesuai dokumen partner:
 * - TER B → PTKP 63 jt & 67,5 jt
 * - TER C → PTKP 70 jt
 * - selain itu → TER A
 *
 * Kalau angka PTKP di-update, cukup ubah getPtkpAmount.
 */
export function getTerCategory(status: PtkpStatus): TerCategory {
  const ptkp = getPtkpAmount(status);

  // TER B: PTKP 63 jt atau 67,5 jt
  if (ptkp === 63_000_000 || ptkp === 67_500_000) {
    return 'B';
  }

  // TER C: PTKP 70 jt
  if (ptkp === 70_000_000) {
    return 'C';
  }

  // selain itu TER A
  return 'A';
}

type TerBracket = {
  max: number | null; // null = di atas
  rate: number; // misal 0.025 = 2.5%
};

// Tabel A, B, C di bawah mengikuti angka yang kamu kirim (kalau partner update excel final, update di sini)

/** TER Kategori A */
const TER_A: TerBracket[] = [
  { max: 5_400_000, rate: 0 },
  { max: 5_650_000, rate: 0.0025 },
  { max: 5_950_000, rate: 0.005 },
  { max: 6_300_000, rate: 0.0075 },
  { max: 6_750_000, rate: 0.01 },
  { max: 7_500_000, rate: 0.0125 },
  { max: 8_550_000, rate: 0.015 },
  { max: 9_650_000, rate: 0.0175 },
  { max: 10_050_000, rate: 0.02 },
  { max: 10_350_000, rate: 0.0225 },
  { max: 10_700_000, rate: 0.025 },
  { max: 11_050_000, rate: 0.03 },
  { max: 11_600_000, rate: 0.035 },
  { max: 12_500_000, rate: 0.04 },
  { max: 13_750_000, rate: 0.05 },
  { max: 15_100_000, rate: 0.06 },
  { max: 16_950_000, rate: 0.07 },
  { max: 19_750_000, rate: 0.08 },
  { max: 24_150_000, rate: 0.09 },
  { max: 26_450_000, rate: 0.1 },
  { max: 28_000_000, rate: 0.11 },
  { max: 30_050_000, rate: 0.12 },
  { max: 32_400_000, rate: 0.13 },
  { max: 35_400_000, rate: 0.14 },
  { max: 39_100_000, rate: 0.15 },
  { max: 43_850_000, rate: 0.16 },
  { max: 47_800_000, rate: 0.17 },
  { max: 51_400_000, rate: 0.18 },
  { max: 56_300_000, rate: 0.19 },
  { max: 62_200_000, rate: 0.2 },
  { max: 68_600_000, rate: 0.21 },
  { max: 77_500_000, rate: 0.22 },
  { max: 89_000_000, rate: 0.23 },
  { max: 103_000_000, rate: 0.24 },
  { max: 125_000_000, rate: 0.25 },
  { max: 157_000_000, rate: 0.26 },
  { max: 206_000_000, rate: 0.27 },
  { max: 337_000_000, rate: 0.28 },
  { max: 454_000_000, rate: 0.29 },
  { max: 550_000_000, rate: 0.3 },
  { max: 695_000_000, rate: 0.31 },
  { max: 910_000_000, rate: 0.32 },
  { max: 1_400_000_000, rate: 0.33 },
  { max: null, rate: 0.34 },
];

/** TER Kategori B */
const TER_B: TerBracket[] = [
  { max: 6_200_000, rate: 0 },
  { max: 6_500_000, rate: 0.0025 },
  { max: 6_850_000, rate: 0.005 },
  { max: 7_300_000, rate: 0.0075 },
  { max: 9_200_000, rate: 0.01 },
  { max: 10_750_000, rate: 0.015 },
  { max: 11_250_000, rate: 0.02 },
  { max: 11_600_000, rate: 0.025 },
  { max: 12_600_000, rate: 0.03 },
  { max: 13_600_000, rate: 0.04 },
  { max: 14_950_000, rate: 0.05 },
  { max: 16_400_000, rate: 0.06 },
  { max: 18_450_000, rate: 0.07 },
  { max: 21_850_000, rate: 0.08 },
  { max: 26_000_000, rate: 0.09 },
  { max: 27_700_000, rate: 0.1 },
  { max: 29_350_000, rate: 0.11 },
  { max: 31_450_000, rate: 0.12 },
  { max: 33_950_000, rate: 0.13 },
  { max: 37_100_000, rate: 0.14 },
  { max: 41_100_000, rate: 0.15 },
  { max: 45_800_000, rate: 0.16 },
  { max: 49_500_000, rate: 0.17 },
  { max: 53_800_000, rate: 0.18 },
  { max: 58_500_000, rate: 0.19 },
  { max: 64_000_000, rate: 0.2 },
  { max: 71_000_000, rate: 0.21 },
  { max: 80_000_000, rate: 0.22 },
  { max: 93_000_000, rate: 0.23 },
  { max: 109_000_000, rate: 0.24 },
  { max: 129_000_000, rate: 0.25 },
  { max: 163_000_000, rate: 0.26 },
  { max: 211_000_000, rate: 0.27 },
  { max: 374_000_000, rate: 0.28 },
  { max: 459_000_000, rate: 0.29 },
  { max: 555_000_000, rate: 0.3 },
  { max: 704_000_000, rate: 0.31 },
  { max: 957_000_000, rate: 0.32 },
  { max: 1_405_000_000, rate: 0.33 },
  { max: null, rate: 0.34 },
];

/** TER Kategori C */
const TER_C: TerBracket[] = [
  { max: 6_600_000, rate: 0 },
  { max: 6_950_000, rate: 0.0025 },
  { max: 7_350_000, rate: 0.005 },
  { max: 7_800_000, rate: 0.0075 },
  { max: 8_850_000, rate: 0.01 },
  { max: 9_800_000, rate: 0.0125 },
  { max: 10_950_000, rate: 0.015 },
  { max: 11_200_000, rate: 0.0175 },
  { max: 12_050_000, rate: 0.02 },
  { max: 12_950_000, rate: 0.03 },
  { max: 14_150_000, rate: 0.04 },
  { max: 15_550_000, rate: 0.05 },
  { max: 17_050_000, rate: 0.06 },
  { max: 19_500_000, rate: 0.07 },
  { max: 22_700_000, rate: 0.08 },
  { max: 26_600_000, rate: 0.09 },
  { max: 28_100_000, rate: 0.1 },
  { max: 30_100_000, rate: 0.11 },
  { max: 32_600_000, rate: 0.12 },
  { max: 35_400_000, rate: 0.13 },
  { max: 38_900_000, rate: 0.14 },
  { max: 43_000_000, rate: 0.15 },
  { max: 47_400_000, rate: 0.16 },
  { max: 51_200_000, rate: 0.17 },
  { max: 55_800_000, rate: 0.18 },
  { max: 60_400_000, rate: 0.19 },
  { max: 66_700_000, rate: 0.2 },
  { max: 74_500_000, rate: 0.21 },
  { max: 83_200_000, rate: 0.22 },
  { max: 95_000_000, rate: 0.23 },
  { max: 110_000_000, rate: 0.24 },
  { max: 134_000_000, rate: 0.25 },
  { max: 169_000_000, rate: 0.26 },
  { max: 221_000_000, rate: 0.27 },
  { max: 390_000_000, rate: 0.28 },
  // baris "390–463 39%" di spec kelihatan typo, di sini di-normal-kan jadi 29%
  { max: 463_000_000, rate: 0.29 },
  { max: 561_000_000, rate: 0.3 },
  { max: 709_000_000, rate: 0.31 },
  { max: 965_000_000, rate: 0.32 },
  { max: 1_419_000_000, rate: 0.33 },
  { max: null, rate: 0.34 },
];

function findTerRate(kategori: TerCategory, brutoBulanan: number): number {
  const table = kategori === 'A' ? TER_A : kategori === 'B' ? TER_B : TER_C;
  for (const row of table) {
    if (row.max === null || brutoBulanan <= row.max) {
      return row.rate;
    }
  }
  return table[table.length - 1].rate;
}

/**
 * Helper publik: langsung dapat tarif TER dari status PTKP + bruto.
 * Bisa dipakai juga di kalkulator-kalkulator lain (misal gaji + bonus).
 */
export function getTerRateFromStatus(
  status: PtkpStatus,
  brutoBulanan: number
): number {
  const kategori = getTerCategory(status);
  return findTerRate(kategori, brutoBulanan);
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

  // kalau di atas 5 M, pakai tarif layer terakhir (30%) — nanti bisa diupdate jika partner minta 35%
  if (sisa > 0) {
    pajak += sisa * PROGRESIF[PROGRESIF.length - 1].rate;
  }

  return pajak;
}

function roundDownToThousand(n: number): number {
  return Math.floor(n / 1000) * 1000;
}

/* ========= FUNGSI UTAMA ========= */

export function computePph21Ter(input: Pph21TerInput): Pph21TerResult {
  const masaKerja =
    input.masaKerjaSetahun && input.masaKerjaSetahun > 0
      ? Math.min(12, Math.max(1, input.masaKerjaSetahun))
      : 12;

  const brutoBulanan =
    input.gajiPokok +
    input.tunjanganTetap +
    input.tunjanganTidakTetap +
    input.bonus +
    input.thr +
    input.tunjanganLain +
    input.jkkPerusahaan +
    input.jkmPerusahaan +
    input.bpjsKesehatanPerusahaan;

  const biayaJabatanBulanan = Math.min(brutoBulanan * 0.05, 500_000);

  const potonganLainBulanan =
    input.iuranPensiun + input.iuranJht + input.zakatMelaluiPemberiKerja;

  const pengurangBulanan = potonganLainBulanan + biayaJabatanBulanan;
  const nettoBulanan = brutoBulanan - pengurangBulanan;

  const ptkp = getPtkpAmount(input.statusPtkp);
  const catatan: string[] = [];

  // === CASE A: BULANAN Jan–Nov → TER ===
  if (
    input.jenisPerhitungan === 'BULANAN' &&
    input.bulan &&
    input.bulan !== 'DESEMBER'
  ) {
    const kategoriTer = getTerCategory(input.statusPtkp);
    const tarifTer = findTerRate(kategoriTer, brutoBulanan);

    let pph21 = brutoBulanan * tarifTer;
    if (!input.hasNpwp) {
      pph21 *= 1.2;
      catatan.push('Tanpa NPWP: PPh21 dikenakan tambahan 20%.');
    }

    catatan.push(
      `Perhitungan bulanan menggunakan tarif TER kategori ${kategoriTer}.`
    );
    catatan.push(
      'Potongan (iuran + biaya jabatan) tidak mengurangi dasar TER.'
    );

    return {
      jenisPerhitungan: input.jenisPerhitungan,
      bulan: input.bulan,
      brutoBulanan,
      pengurangBulanan,
      biayaJabatanBulanan,
      nettoBulanan,
      brutoSetahun: brutoBulanan * 12,
      pengurangSetahun: pengurangBulanan * 12,
      nettoSetahun: nettoBulanan * 12,
      masaKerjaSetahun: 12,
      ptkp,
      kategoriTer,
      tarifTer,
      pph21Bulanan: Math.round(pph21),
      pph21Tahunan: Math.round(pph21 * 12),
      pkpTahunan: undefined,
      catatan,
    };
  }

  // === CASE B: TOTAL TAHUN BERJALAN (Annual) ===
  if (input.jenisPerhitungan === 'TAHUNAN') {
    const brutoSetahun = brutoBulanan * masaKerja;
    const pengurangSetahun = pengurangBulanan * masaKerja;
    const nettoSetahun = brutoSetahun - pengurangSetahun;

    const pkpRaw = Math.max(0, nettoSetahun - ptkp);
    const pkpTahunan = roundDownToThousand(pkpRaw);

    let pajakSetahun = hitungProgresif(pkpTahunan);
    if (!input.hasNpwp) {
      pajakSetahun *= 1.2;
      catatan.push('Tanpa NPWP: PPh21 dikenakan tambahan 20%.');
    }

    catatan.push(
      `Perhitungan tahunan dengan masa kerja ${masaKerja} bulan dan tarif progresif.`
    );

    return {
      jenisPerhitungan: input.jenisPerhitungan,
      bulan: undefined,
      brutoBulanan,
      pengurangBulanan,
      biayaJabatanBulanan,
      nettoBulanan,
      brutoSetahun,
      pengurangSetahun,
      nettoSetahun,
      masaKerjaSetahun: masaKerja,
      ptkp,
      pkpTahunan,
      pph21Tahunan: Math.round(pajakSetahun),
      pph21Bulanan: Math.round(pajakSetahun / masaKerja),
      catatan,
    };
  }

  // === CASE C: BULAN DESEMBER (progressif, lalu dibagi 12) ===
  if (input.jenisPerhitungan === 'BULANAN' && input.bulan === 'DESEMBER') {
    const nettoSetahun = nettoBulanan * 12;
    const brutoSetahun = brutoBulanan * 12;
    const pengurangSetahun = pengurangBulanan * 12;

    const pkpRaw = Math.max(0, nettoSetahun - ptkp);
    const pkpTahunan = roundDownToThousand(pkpRaw);

    let pajakSetahun = hitungProgresif(pkpTahunan);
    if (!input.hasNpwp) {
      pajakSetahun *= 1.2;
      catatan.push('Tanpa NPWP: PPh21 dikenakan tambahan 20%.');
    }

    const pph21Bulanan = pajakSetahun / 12;

    catatan.push(
      'Bulan Desember dihitung dengan pendekatan pajak tahunan progresif dan dibagi 12.'
    );

    return {
      jenisPerhitungan: input.jenisPerhitungan,
      bulan: input.bulan,
      brutoBulanan,
      pengurangBulanan,
      biayaJabatanBulanan,
      nettoBulanan,
      brutoSetahun,
      pengurangSetahun,
      nettoSetahun,
      masaKerjaSetahun: 12,
      ptkp,
      pkpTahunan,
      pph21Tahunan: Math.round(pajakSetahun),
      pph21Bulanan: Math.round(pph21Bulanan),
      catatan,
    };
  }

  throw new Error('Kombinasi jenis perhitungan / bulan tidak valid.');
}
