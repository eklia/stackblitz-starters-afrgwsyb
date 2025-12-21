// lib/tax/pph21-ter-split.ts
import {
    type JenisKelamin,
    type PtkpStatus,
    type BulanPenghasilan,
    type TerCategory,
    getTerCategory,
    getTerRateFromStatus,
  } from './pph21-ter';
  
  export type TerSplitInput = {
    nama: string;
    jenisKelamin: JenisKelamin;
    statusPtkp: PtkpStatus;
    hasNpwp: boolean;
  
    bulanPajak: BulanPenghasilan;
    tahunPajak: number;
  
    tanggalGaji?: string; // 'YYYY-MM-DD'
    tanggalPenghasilanTambahan?: string; // 'YYYY-MM-DD'
  
    // SECTION 4 — penghasilan rutin (gaji)
    gajiPokok: number;
    tunjanganTetap: number;
    tunjanganTidakTetap: number;
    tunjanganLain: number;
    jkkPerusahaan: number;
    jkmPerusahaan: number;
    bpjsKesehatanPerusahaan: number;
  
    // SECTION 5 — penghasilan tambahan
    thr: number;
    bonus: number;
  };
  
  export type TerSplitPaymentLabel = 'GAJI' | 'BONUS/THR';
  
  export type TerSplitRow = {
    tanggal: string | null;
    jenis: TerSplitPaymentLabel;
    bruto: number;
    pph21: number;
    netto: number;
  };
  
  export type TerSplitResult = {
    nama: string;
    statusPtkp: PtkpStatus;
    hasNpwp: boolean;
  
    bulanPajak: BulanPenghasilan;
    tahunPajak: number;
  
    kategoriTer: TerCategory;
  
    brutoRutin: number;
    brutoTambahan: number;
    brutoTotalSebulan: number;
  
    tarifTerRutin: number; // tarif yang dipakai saat gaji
    tarifTerTotal: number; // tarif yang dipakai untuk total sebulan
  
    pph21SaatGaji: number;
    pph21SaatBonusThr: number;
    pph21Sebulan: number;
  
    rows: TerSplitRow[];
    catatan: string[];
  };
  
  function normalizeDateOrNull(s?: string): string | null {
    if (!s) return null;
    // di sini kita nggak parse apa-apa, cukup simpan string buat display
    return s;
  }
  
  export function computePph21TerSplit(input: TerSplitInput): TerSplitResult {
    // 1) Hitung bruto‐bruto
    const brutoRutin =
      input.gajiPokok +
      input.tunjanganTetap +
      input.tunjanganTidakTetap +
      input.tunjanganLain +
      input.jkkPerusahaan +
      input.jkmPerusahaan +
      input.bpjsKesehatanPerusahaan;
  
    const brutoTambahan = input.thr + input.bonus;
    const brutoTotalSebulan = brutoRutin + brutoTambahan;
  
    const kategoriTer = getTerCategory(input.statusPtkp);
    const multiplierNpwp = input.hasNpwp ? 1 : 1.2;
  
    // 2) Tarif TER untuk gaji rutin & total sebulan
    const tarifTerRutin =
      brutoRutin > 0
        ? getTerRateFromStatus(input.statusPtkp, brutoRutin)
        : 0;
  
    const tarifTerTotal =
      brutoTotalSebulan > 0
        ? getTerRateFromStatus(input.statusPtkp, brutoTotalSebulan)
        : 0;
  
    // 3) PPh21 saat gaji & total sebulan (pakai pembulatan yang konsisten)
    const rawPphGaji = brutoRutin * tarifTerRutin * multiplierNpwp;
    const rawPphTotal = brutoTotalSebulan * tarifTerTotal * multiplierNpwp;
  
    const pph21Sebulan = Math.round(rawPphTotal);
    const pph21SaatGaji = Math.round(rawPphGaji);
  
    // PPh bonus = selisih total - yang sudah dipotong
    const pph21SaatBonusThr = Math.max(pph21Sebulan - pph21SaatGaji, 0);
  
    // 4) Susun row tabel rekap
    const rows: TerSplitRow[] = [];
  
    if (brutoRutin > 0) {
      rows.push({
        tanggal: normalizeDateOrNull(input.tanggalGaji),
        jenis: 'GAJI',
        bruto: brutoRutin,
        pph21: pph21SaatGaji,
        netto: brutoRutin - pph21SaatGaji,
      });
    }
  
    if (brutoTambahan > 0) {
      rows.push({
        tanggal: normalizeDateOrNull(input.tanggalPenghasilanTambahan),
        jenis: 'BONUS/THR',
        bruto: brutoTambahan,
        pph21: pph21SaatBonusThr,
        netto: brutoTambahan - pph21SaatBonusThr,
      });
    }
  
    const catatan: string[] = [];
  
    catatan.push(
      `Kategori TER: ${kategoriTer}. Tarif TER rutin dan total diambil dari tabel kategori ini berdasarkan penghasilan bruto bulanan.`
    );
  
    if (!input.hasNpwp) {
      catatan.push('Tanpa NPWP: PPh21 dikenakan tambahan 20% (×120%).');
    }
  
    if (brutoTambahan > 0) {
      catatan.push(
        'PPh21 saat bonus/THR dihitung sebagai selisih antara PPh21 total sebulan dan PPh21 yang sudah dipotong saat pembayaran gaji.'
      );
    }
  
    return {
      nama: input.nama,
      statusPtkp: input.statusPtkp,
      hasNpwp: input.hasNpwp,
      bulanPajak: input.bulanPajak,
      tahunPajak: input.tahunPajak,
      kategoriTer,
  
      brutoRutin,
      brutoTambahan,
      brutoTotalSebulan,
  
      tarifTerRutin,
      tarifTerTotal,
  
      pph21SaatGaji,
      pph21SaatBonusThr,
      pph21Sebulan,
  
      rows,
      catatan,
    };
  }
  