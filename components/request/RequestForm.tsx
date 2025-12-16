'use client';

import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';

type Props = {
  // kalau nanti mau multi-language, bisa kirim label dari i18n
  t?: {
    heading?: string;
    subtitle?: string;
    fullNameLabel?: string;
    emailLabel?: string;
    phoneLabel?: string;
    companyLabel?: string;
    serviceTypeLabel?: string;
    messageLabel?: string;
    submitLabel?: string;
    successMessage?: string;
    errorMessage?: string;
  };
};

const SERVICE_OPTIONS = [
  { value: 'individual', label: 'Pajak Individu' },
  { value: 'company', label: 'Pajak Perusahaan' },
  { value: 'consultation', label: 'Konsultasi Pajak' },
];

export function RequestForm({ t }: Props) {
  const searchParams = useSearchParams();
  const serviceParam = searchParams.get('service');

  const normalizedServiceParam =
    serviceParam &&
    ['individual', 'company', 'consultation'].includes(serviceParam)
      ? serviceParam
      : 'individual';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [serviceType, setServiceType] = useState<string>(
    normalizedServiceParam
  );
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorText, setErrorText] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setStatus('idle');
    setErrorText(null);

    try {
      const res = await fetch('/api/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          companyName,
          serviceType,
          message,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setStatus('error');
        setErrorText(
          data?.error ??
            t?.errorMessage ??
            'Terjadi kesalahan saat mengirim permintaan.'
        );
        return;
      }

      // success 🎉
      setStatus('success');

      // reset form sederhana
      setFullName('');
      setEmail('');
      setPhone('');
      setCompanyName('');
      setServiceType('individual');
      setMessage('');
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorText(
        t?.errorMessage ?? 'Terjadi kesalahan saat mengirim permintaan.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-3xl bg-white p-5 shadow-soft ring-1 ring-emerald-50 md:p-6"
    >
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-900 md:text-2xl">
          {t?.heading ?? 'Ajukan Konsultasi Pajak'}
        </h1>
        <p className="text-sm text-slate-600">
          {t?.subtitle ??
            'Isi formulir di bawah ini dan tim CekPajak akan menghubungi Anda secepatnya.'}
        </p>
      </div>

      {/* Nama lengkap */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-800">
          {t?.fullNameLabel ?? 'Nama Lengkap'}
        </label>
        <input
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500/40 focus:bg-white focus:ring-2"
          placeholder="Masukkan nama lengkap Anda"
        />
      </div>

      {/* Email */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-800">
          {t?.emailLabel ?? 'Email'}
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500/40 focus:bg-white focus:ring-2"
          placeholder="nama@email.com"
        />
      </div>

      {/* Telepon */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-800">
          {t?.phoneLabel ?? 'Nomor WhatsApp / Telepon'}
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500/40 focus:bg-white focus:ring-2"
          placeholder="+62..."
        />
      </div>

      {/* Perusahaan (opsional) */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-800">
          {t?.companyLabel ?? 'Nama Perusahaan (opsional)'}
        </label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500/40 focus:bg-white focus:ring-2"
          placeholder="Jika ada"
        />
      </div>

      {/* Jenis layanan */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-800">
          {t?.serviceTypeLabel ?? 'Jenis Layanan'}
        </label>
        <select
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500/40 focus:bg-white focus:ring-2"
        >
          {SERVICE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Pesan */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-800">
          {t?.messageLabel ?? 'Ceritakan singkat kebutuhan pajak Anda'}
        </label>
        <textarea
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500/40 focus:bg-white focus:ring-2"
          placeholder="Contoh: SPT pribadi karyawan, pajak UMKM, atau pendampingan pemeriksaan..."
        />
      </div>

      {/* Status / error */}
      {status === 'success' && (
        <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
          {t?.successMessage ??
            'Permintaan konsultasi berhasil dikirim. Tim kami akan menghubungi Anda segera.'}
        </div>
      )}

      {status === 'error' && (
        <div className="rounded-2xl bg-red-50 px-3 py-2 text-xs text-red-700">
          {errorText}
        </div>
      )}

      {/* Submit */}
      <div className="pt-1">
        <Button
          type="submit"
          variant="primary"
          size="md"
          className={cn('w-full md:w-auto', isSubmitting && 'opacity-80')}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? 'Mengirim...'
            : t?.submitLabel ?? 'Kirim Permintaan Konsultasi'}
        </Button>
      </div>
    </form>
  );
}
