// components/consultation/TaxConsultWizard.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { Lang } from '@/lib/types';

type StepId = 'Q_SUBJECT' | 'Q_PERSONAL_TYPE' | 'RESULT';

type ChatMessage = {
  from: 'bot' | 'user';
  text: string;
};

type SubjectAnswer = 'PERSONAL' | 'BUSINESS';
type PersonalTypeAnswer =
  | 'EMPLOYEE_GAJI'
  | 'EMPLOYEE_GAJI_BONUS'
  | 'FREELANCER'
  | 'OTHER';

type Answers = {
  subject?: SubjectAnswer;
  personalType?: PersonalTypeAnswer;
};

type RecommendationKey =
  | 'PPH21_TER'
  | 'PPH21_TER_SPLIT'
  | 'PPH_PROF'
  | 'PPH_BADAN'
  | 'UNKNOWN';

type Recommendation = {
  key: RecommendationKey;
  title: string;
  description: string;
  href?: string;
};

type ChatOption = {
  value: string;
  label: string;
};

type Props = {
  lang: Lang;
};

export function TaxConsultWizard({ lang }: Props) {
  const isEn = lang === 'en';
  const router = useRouter();

  const [step, setStep] = useState<StepId>('Q_SUBJECT');
  const [answers, setAnswers] = useState<Answers>({});
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(
    null
  );
  const [isBotTyping, setIsBotTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ===================== BOT TYPING HELPER ===================== */

  function addBotMessage(text: string, delayMs = 600) {
    // kalau ada timeout ketikan sebelumnya, bersihkan dulu
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  
    setIsBotTyping(true);
    typingTimeoutRef.current = setTimeout(() => {
      setMessages((prev) => [...prev, { from: 'bot', text }]);
      setIsBotTyping(false);
      typingTimeoutRef.current = null;
    }, delayMs);
  }

  /* ===================== QUESTION & OPTIONS ===================== */

  function getCurrentQuestion(step: StepId): string | null {
    if (step === 'Q_SUBJECT') {
      return isEn
        ? 'Is this tax for an individual (personal) or a business entity (PT/CV, company)?'
        : 'Pajak ini untuk pribadi (orang) atau untuk badan usaha (PT/CV, perusahaan)?';
    }

    if (step === 'Q_PERSONAL_TYPE') {
      return isEn
        ? 'Which situation best describes the income you want to calculate?'
        : 'Situasi mana yang paling menggambarkan penghasilan yang ingin Anda hitung?';
    }

    return null;
  }

  function getOptions(step: StepId, answers: Answers): ChatOption[] {
    if (step === 'Q_SUBJECT') {
      return [
        {
          value: 'PERSONAL',
          label: isEn ? 'Personal / Individual' : 'Pribadi / Orang Pribadi',
        },
        {
          value: 'BUSINESS',
          label: isEn
            ? 'Business / Legal entity (PT/CV, company)'
            : 'Usaha / Badan hukum (PT/CV, perusahaan)',
        },
      ];
    }

    if (step === 'Q_PERSONAL_TYPE' && answers.subject === 'PERSONAL') {
      return [
        {
          value: 'EMPLOYEE_GAJI',
          label: isEn
            ? 'Employee with monthly salary from one employer'
            : 'Pegawai tetap dengan gaji bulanan dari satu pemberi kerja',
        },
        {
          value: 'EMPLOYEE_GAJI_BONUS',
          label: isEn
            ? 'Employee with monthly salary + bonus/THR paid separately in the same month'
            : 'Pegawai tetap dengan gaji bulanan + bonus/THR yang dibayar terpisah dalam bulan yang sama',
        },
        {
          value: 'FREELANCER',
          label: isEn
            ? 'Professional / freelancer (doctor, consultant, tutor, content creator, etc.)'
            : 'Profesional / freelancer (dokter, konsultan, pengajar, content creator, dll.)',
        },
        {
          value: 'OTHER',
          label: isEn
            ? 'Other or I am not sure'
            : 'Lainnya / saya belum yakin',
        },
      ];
    }

    return [];
  }

  /* ===================== RECOMMENDATION ===================== */

  function buildRecommendation(key: RecommendationKey): Recommendation {
    switch (key) {
      case 'PPH21_TER':
        return {
          key,
          href: '/calculators/pph21-ter',
          title: isEn
            ? 'Use the PPh21 TER — Monthly/Annual calculator'
            : 'Gunakan kalkulator PPh21 TER — Bulanan/Tahunan',
          description: isEn
            ? 'Suitable for permanent employees whose income is mainly monthly salary (plus regular allowances) from one employer.'
            : 'Cocok untuk pegawai tetap dengan penghasilan utama berupa gaji bulanan (plus tunjangan rutin) dari satu pemberi kerja.',
        };
      case 'PPH21_TER_SPLIT':
        return {
          key,
          href: '/calculators/pph21-ter-split',
          title: isEn
            ? 'Use the PPh21 TER — Salary & Bonus/THR (2x withholding) calculator'
            : 'Gunakan kalkulator PPh21 TER — Gaji & Bonus/THR (2x potong)',
          description: isEn
            ? 'Useful when, in the same month, the salary is paid first and later there is a separate payment for bonus/THR, both with PPh21 withholding.'
            : 'Dipakai saat dalam bulan yang sama gaji dibayarkan lebih dulu, lalu ada pembayaran terpisah untuk bonus/THR, keduanya dipotong PPh21.',
        };
      case 'PPH_PROF':
        return {
          key,
          href: '/calculators/pph-profesional',
          title: isEn
            ? 'Use the Professional / Freelancer Income Tax calculator'
            : 'Gunakan kalkulator Pajak Profesional / Freelancer',
          description: isEn
            ? 'Designed for individuals earning income from professional or freelance services (doctors, consultants, teachers, artists, etc.), with or without bookkeeping (NPPN).'
            : 'Dirancang untuk Wajib Pajak Orang Pribadi yang memperoleh penghasilan dari jasa profesional / freelance (dokter, konsultan, pengajar, pekerja seni, dll.), baik dengan pembukuan maupun menggunakan NPPN.',
        };
      case 'PPH_BADAN':
        return {
          key,
          href: undefined,
          title: isEn
            ? 'You likely need a Corporate Income Tax (PPh Badan) calculator'
            : 'Anda kemungkinan memerlukan kalkulator PPh Badan (pajak perusahaan)',
          description: isEn
            ? 'Because you are using a legal entity (PT/CV/company), the tax rules follow corporate income tax. Please use a dedicated Corporate Income Tax calculator or consult with your tax advisor.'
            : 'Karena penghasilan berada di bawah badan hukum (PT/CV/perusahaan), perhitungan pajak mengikuti ketentuan PPh Badan. Silakan gunakan kalkulator PPh Badan khusus atau konsultasikan dengan konsultan pajak.',
        };
      case 'UNKNOWN':
      default:
        return {
          key: 'UNKNOWN',
          href: undefined,
          title: isEn
            ? 'No single calculator matches perfectly'
            : 'Belum ada satu kalkulator yang benar-benar pas',
          description: isEn
            ? 'Your situation may involve a mix of several income types. You can still try the available calculators (PPh21 TER for employees or Professional/Freelancer calculator), but it is better to consult a tax advisor for more complex cases.'
            : 'Situasi Anda mungkin melibatkan kombinasi beberapa jenis penghasilan. Anda tetap bisa mencoba kalkulator yang tersedia (PPh21 TER untuk pegawai atau kalkulator Profesional/Freelancer), namun untuk kasus kompleks sebaiknya konsultasi langsung dengan konsultan pajak.',
        };
    }
  }

  /* ===================== FLOW HANDLERS ===================== */

  function handleOptionClick(option: ChatOption) {
    // Tambah pesan user ke chat
    setMessages((prev) => [...prev, { from: 'user', text: option.label }]);

    if (step === 'Q_SUBJECT') {
      const subject = option.value as SubjectAnswer;
      const newAnswers: Answers = { ...answers, subject };
      setAnswers(newAnswers);

      if (subject === 'BUSINESS') {
        const rec = buildRecommendation('PPH_BADAN');
        setRecommendation(rec);
        setStep('RESULT');

        const text = isEn
          ? 'Because this is for a business entity (PT/CV/company), the more appropriate path is Corporate Income Tax (PPh Badan).'
          : 'Karena pajak yang ingin dihitung untuk badan usaha (PT/CV/perusahaan), jalur yang lebih tepat adalah PPh Badan.';
        addBotMessage(text);
        return;
      }

      // PRIBADI → lanjut
      const nextQuestion = getCurrentQuestion('Q_PERSONAL_TYPE');
      setStep('Q_PERSONAL_TYPE');
      if (nextQuestion) {
        addBotMessage(nextQuestion);
      }
      return;
    }

    if (step === 'Q_PERSONAL_TYPE') {
      const personalType = option.value as PersonalTypeAnswer;
      const newAnswers: Answers = { ...answers, personalType };
      setAnswers(newAnswers);

      let recKey: RecommendationKey = 'UNKNOWN';
      if (personalType === 'EMPLOYEE_GAJI') recKey = 'PPH21_TER';
      else if (personalType === 'EMPLOYEE_GAJI_BONUS') recKey = 'PPH21_TER_SPLIT';
      else if (personalType === 'FREELANCER') recKey = 'PPH_PROF';

      const rec = buildRecommendation(recKey);
      setRecommendation(rec);
      setStep('RESULT');

      const text =
        recKey === 'PPH21_TER'
          ? isEn
            ? 'Okay, it looks like you are an employee with a regular monthly salary. I recommend using the PPh21 TER calculator for permanent employees.'
            : 'Baik, sepertinya Anda adalah pegawai dengan gaji bulanan rutin. Saya sarankan memakai kalkulator PPh21 TER untuk pegawai tetap.'
          : recKey === 'PPH21_TER_SPLIT'
          ? isEn
            ? 'Because there is salary and a separate bonus/THR in the same month, it is better to use the PPh21 TER calculator that supports two separate withholdings (salary & bonus/THR).'
            : 'Karena ada gaji dan pembayaran bonus/THR terpisah dalam bulan yang sama, lebih tepat menggunakan kalkulator PPh21 TER yang mendukung 2x potong (gaji & bonus/THR).'
          : recKey === 'PPH_PROF'
          ? isEn
            ? 'Since your income comes from professional/freelance services, the Professional / Freelancer tax calculator will be more suitable.'
            : 'Karena penghasilan Anda berasal dari jasa profesional / freelance, kalkulator pajak Profesional / Freelancer akan lebih sesuai.'
          : isEn
          ? 'Your situation may not match a single simple pattern. I will still show you some calculator options that may be useful as a starting point.'
          : 'Situasi Anda tampaknya tidak persis cocok dengan satu pola sederhana. Saya tetap akan menampilkan beberapa opsi kalkulator yang bisa dipakai sebagai titik awal.';

      addBotMessage(text);
    }
  }

  function handleRestart() {
    const intro1 = isEn
      ? 'Hi! I will ask a few simple questions to help you choose the most suitable tax calculator.'
      : 'Halo! Saya akan bertanya beberapa hal sederhana untuk membantu memilih kalkulator pajak yang paling cocok.';
    const intro2 = isEn
      ? 'First, whose tax do you want to calculate?'
      : 'Pertama, pajak yang ingin Anda hitung ini untuk siapa?';
  
    setStep('Q_SUBJECT');
    setAnswers({});
    setRecommendation(null);
    setIsBotTyping(false);
  
    // Hanya greeting dulu di chat
    setMessages([{ from: 'bot', text: intro1 }]);
  
    // Pertanyaan muncul setelah animasi "lagi ngetik"
    addBotMessage(intro2, 700);
  }
  

  function handleBack() {
    if (step === 'RESULT') {
      if (answers.personalType) {
        setStep('Q_PERSONAL_TYPE');
        setRecommendation(null);
      } else if (answers.subject) {
        setStep('Q_SUBJECT');
        setRecommendation(null);
      } else {
        handleRestart();
      }
      return;
    }

    if (step === 'Q_PERSONAL_TYPE') {
      setStep('Q_SUBJECT');
      setAnswers((prev) => ({ subject: prev.subject }));
      setRecommendation(null);
      return;
    }

    handleRestart();
  }

  useEffect(() => {
    // mulai percakapan pertama kali / ketika bahasa diganti
    handleRestart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEn]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const currentQuestionText =
    step === 'RESULT' ? null : getCurrentQuestion(step);
  const currentOptions =
    step === 'RESULT' ? [] : getOptions(step, answers);
  const canGoBack = step !== 'Q_SUBJECT';

  /* ===================== RENDER ===================== */

  return (
    <div className="mx-auto max-w-4xl space-y-4 md:space-y-6">
      {/* HEADER */}
      <header className="rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 p-5 text-slate-50 shadow-soft md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-100">
              {isEn ? 'Quick Tax Assistant' : 'Asisten Pajak Cepat'}
            </p>
            <h1 className="mt-1 text-lg font-semibold md:text-2xl">
              {isEn
                ? 'Find the right tax calculator for your situation'
                : 'Cari kalkulator pajak yang paling cocok untuk situasi Anda'}
            </h1>
            <p className="mt-1 text-xs text-emerald-50/90 md:text-sm">
              {isEn
                ? 'Answer 1–2 short questions. At the end, we will recommend the most appropriate calculator and give you a button to open it.'
                : 'Jawab 1–2 pertanyaan singkat. Di akhir, kami akan merekomendasikan kalkulator yang paling sesuai dan menampilkan tombol untuk membukanya.'}
            </p>
          </div>
          <div className="flex flex-col items-start gap-1 text-xs md:items-end">
            <span className="inline-flex items-center rounded-full bg-emerald-700/60 px-3 py-1">
              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-200" />
              {isEn
                ? 'Guidance only — not official tax advice'
                : 'Panduan umum — bukan nasihat pajak resmi'}
            </span>
          </div>
        </div>
      </header>

      {/* WRAPPER ala card besar */}
      <section className="rounded-3xl bg-emerald-50/80 p-3 shadow-inner md:p-4">
        {/* New Inquiry */}
        <div className="mb-3 flex justify-start">
          <button
            type="button"
            onClick={handleRestart}
            className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-medium text-emerald-700 shadow-sm ring-1 ring-emerald-100 hover:bg-emerald-50"
          >
            <span aria-hidden="true">↺</span>
            {isEn ? 'New Inquiry' : 'Konsultasi baru'}
          </button>
        </div>

        {/* Card utama */}
        <div className="flex min-h-[420px] flex-col rounded-3xl bg-white p-4 shadow-soft ring-1 ring-emerald-100 md:p-5">
          {/* CHAT AREA */}
          <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl bg-emerald-50/60 p-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  'flex',
                  msg.from === 'bot' ? 'justify-start' : 'justify-end'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-3 py-2 text-[11px] md:text-xs',
                    msg.from === 'bot'
                      ? 'bg-white text-slate-800 shadow-sm ring-1 ring-emerald-50'
                      : 'bg-emerald-600 text-emerald-50 shadow-sm'
                  )}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isBotTyping && (
              <div className="mt-1 flex justify-start">
                <div className="inline-flex items-center gap-1 rounded-2xl bg-white px-3 py-2 text-[11px] text-slate-500 shadow-sm ring-1 ring-emerald-50">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" />
                </div>
              </div>
            )}
          </div>

          {/* BOTTOM AREA */}
          <div className="mt-4 border-t border-slate-100 pt-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div>
                {canGoBack && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-emerald-700"
                  >
                    <span aria-hidden="true">←</span>
                    {isEn ? 'Back' : 'Kembali'}
                  </button>
                )}
              </div>
              {currentQuestionText && step !== 'RESULT' && (
                <p className="flex-1 text-center text-[11px] font-semibold text-slate-800 md:text-xs">
                  {currentQuestionText}
                </p>
              )}
            </div>

            {/* OPTIONS */}
            {currentOptions.length > 0 && (
              <div className="space-y-2">
                <p className="text-center text-[11px] text-slate-500">
                  {isEn
                    ? 'Choose one answer below:'
                    : 'Pilih salah satu jawaban di bawah ini:'}
                </p>
                <div className="mt-1 flex flex-wrap justify-center gap-2">
                  {currentOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleOptionClick(opt)}
                      className="rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-[11px] text-slate-700 shadow-sm hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-800"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* RECOMMENDATION */}
            {step === 'RESULT' && recommendation && (
              <div className="mt-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                  {isEn
                    ? 'Recommended next step'
                    : 'Rekomendasi langkah berikutnya'}
                </p>
                <h2 className="mt-1 text-sm font-semibold text-emerald-900 md:text-base">
                  {recommendation.title}
                </h2>
                <p className="mt-1 text-[11px] text-slate-700">
                  {recommendation.description}
                </p>

                {recommendation.href ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      size="md"
                      onClick={() => router.push(recommendation.href!)}
                    >
                      {isEn
                        ? 'Open recommended calculator'
                        : 'Buka kalkulator yang disarankan'}
                    </Button>
                    <button
                      type="button"
                      onClick={handleRestart}
                      className="text-[11px] text-slate-500 underline-offset-2 hover:text-emerald-700 hover:underline"
                    >
                      {isEn
                        ? 'Start a new consultation'
                        : 'Mulai konsultasi baru'}
                    </button>
                  </div>
                ) : (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <p className="text-[11px] text-amber-700">
                      {isEn
                        ? 'We do not yet have a specific calculator for this case. Please consult a tax advisor or use other calculators as approximation.'
                        : 'Saat ini belum tersedia kalkulator khusus untuk kasus ini. Silakan konsultasi dengan konsultan pajak atau gunakan kalkulator lain sebagai pendekatan.'}
                    </p>
                    <button
                      type="button"
                      onClick={handleRestart}
                      className="text-[11px] text-slate-500 underline-offset-2 hover:text-emerald-700 hover:underline"
                    >
                      {isEn
                        ? 'Start a new consultation'
                        : 'Mulai konsultasi baru'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CATATAN KECIL */}
      <p className="text-[10px] text-slate-500">
        {isEn
          ? 'This assistant only helps you choose a calculator. The final tax payable still depends on the detailed data you fill in and applicable tax regulations.'
          : 'Asisten ini hanya membantu memilih kalkulator. Pajak terutang yang sebenarnya tetap bergantung pada data rinci yang Anda isi di kalkulator dan ketentuan perpajakan yang berlaku.'}
      </p>
    </div>
  );
}
