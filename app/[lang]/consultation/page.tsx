'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Lang } from '@/lib/types';
import { supabase } from '@/lib/supabase';

type PageProps = {
  params: {
    lang: Lang;
  };
};

type SessionAvailabilityRow = {
  id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  status: 'open' | 'full' | 'off' | 'cancelled';
  note: string | null;
  day_status: 'available' | 'off' | 'holiday';
  day_note: string | null;
  booked_count: number;
  remaining_slots: number;
};

type DaySummary = {
  date: string;
  dayStatus: 'available' | 'off' | 'holiday';
  dayNote: string | null;
  sessions: SessionAvailabilityRow[];
  totalRemainingSlots: number;
  isAllFull: boolean;
};

function formatDateLabel(dateStr: string, lang: Lang) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function getMonthLabel(date: Date, lang: Lang) {
  return new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'id-ID', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function getWeekdayLabels(lang: Lang) {
  return lang === 'en'
    ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    : ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
}

function formatTime(timeStr: string) {
  return timeStr.slice(0, 5);
}

function toDateString(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isToday(dateStr: string) {
  return toDateString(new Date()) === dateStr;
}

function buildCalendarDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const startDayOfWeek = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: Array<{ date: Date | null }> = [];

  for (let i = 0; i < startDayOfWeek; i++) {
    cells.push({ date: null });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ date: new Date(year, month, day) });
  }

  while (cells.length < 35) {
    cells.push({ date: null });
  }

  if (cells.length < 42) {
    while (cells.length < 42) {
      cells.push({ date: null });
    }
  }

  return cells;
}

function getDayMeta(day?: DaySummary) {
  if (!day) {
    return {
      label: '',
      dotClass: 'bg-slate-300',
      cellClass: 'border-slate-100 bg-slate-50 text-slate-300',
      badgeClass: '',
    };
  }

  if (day.dayStatus === 'holiday') {
    return {
      label: 'Holiday',
      dotClass: 'bg-amber-500',
      cellClass: 'border-amber-200 bg-amber-50 text-amber-800',
      badgeClass: 'bg-amber-100 text-amber-700',
    };
  }

  if (day.dayStatus === 'off') {
    return {
      label: 'Off',
      dotClass: 'bg-slate-400',
      cellClass: 'border-slate-200 bg-slate-100 text-slate-500',
      badgeClass: 'bg-slate-200 text-slate-600',
    };
  }

  if (day.isAllFull) {
    return {
      label: 'Full',
      dotClass: 'bg-rose-500',
      cellClass: 'border-rose-200 bg-rose-50 text-rose-700',
      badgeClass: 'bg-rose-100 text-rose-700',
    };
  }

  return {
    label: 'Available',
    dotClass: 'bg-emerald-500',
    cellClass: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    badgeClass: 'bg-emerald-100 text-emerald-700',
  };
}

export default function ConsultationPage({ params }: PageProps) {
  const lang: Lang = params.lang === 'en' ? 'en' : 'id';

  const [rows, setRows] = useState<SessionAvailabilityRow[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionAvailabilityRow | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');

  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    topic: '',
    notes: '',
  });

  const fetchAvailability = async () => {
    setLoading(true);
    setError('');

    const { data, error } = await supabase
      .from('session_availability')
      .select('*')
      .order('session_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      setError(error.message);
      setRows([]);
    } else {
      const result = (data ?? []) as SessionAvailabilityRow[];
      setRows(result);

      if (result.length > 0) {
        setSelectedDate((current) => current ?? result[0].session_date);

        if (!selectedDate) {
          const first = new Date(result[0].session_date);
          setCurrentMonth(new Date(first.getFullYear(), first.getMonth(), 1));
        }
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  const days = useMemo<DaySummary[]>(() => {
    const grouped = new Map<string, SessionAvailabilityRow[]>();

    for (const row of rows) {
      const current = grouped.get(row.session_date) ?? [];
      current.push(row);
      grouped.set(row.session_date, current);
    }

    return Array.from(grouped.entries()).map(([date, sessions]) => {
      const dayStatus = sessions[0]?.day_status ?? 'available';
      const dayNote = sessions[0]?.day_note ?? null;
      const totalRemainingSlots = sessions.reduce(
        (sum, item) => sum + item.remaining_slots,
        0
      );

      const activeSessions = sessions.filter(
        (item) => item.status !== 'off' && item.status !== 'cancelled'
      );

      const isAllFull =
        activeSessions.length > 0 &&
        activeSessions.every((item) => item.remaining_slots <= 0);

      return {
        date,
        dayStatus,
        dayNote,
        sessions,
        totalRemainingSlots,
        isAllFull,
      };
    });
  }, [rows]);

  const dayMap = useMemo(() => {
    const map = new Map<string, DaySummary>();
    days.forEach((day) => map.set(day.date, day));
    return map;
  }, [days]);

  const calendarCells = useMemo(() => buildCalendarDays(currentMonth), [currentMonth]);
  const selectedDay = days.find((day) => day.date === selectedDate) ?? null;
  const weekdayLabels = getWeekdayLabels(lang);

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const openBookingModal = (session: SessionAvailabilityRow) => {
    setSelectedSession(session);
    setBookingError('');
    setBookingSuccess('');
    setForm({
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      topic: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const closeBookingModal = () => {
    if (bookingLoading) return;
    setIsModalOpen(false);
    setSelectedSession(null);
    setBookingError('');
    setBookingSuccess('');
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSession) return;

    setBookingLoading(true);
    setBookingError('');
    setBookingSuccess('');

    const { error } = await supabase.rpc('create_booking', {
      p_session_id: selectedSession.id,
      p_customer_name: form.customer_name,
      p_customer_email: form.customer_email,
      p_customer_phone: form.customer_phone || null,
      p_topic: form.topic || null,
      p_notes: form.notes || null,
    });

    if (error) {
      setBookingError(error.message);
      setBookingLoading(false);
      return;
    }

    setBookingSuccess('Booking berhasil dibuat.');
    await fetchAvailability();

    setTimeout(() => {
      setBookingLoading(false);
      setIsModalOpen(false);
      setSelectedSession(null);
      setBookingSuccess('');
    }, 900);
  };

  return (
    <section className="bg-gradient-to-b from-emerald-50 via-white to-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
        <div className="mb-8 rounded-[30px] border border-emerald-100 bg-white/90 p-6 shadow-sm md:p-8">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              Consultation Schedule
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              Pilih tanggal konsultasi
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 md:text-base">
              Pilih tanggal pada kalender untuk melihat sesi konsultasi yang masih
              tersedia, tanggal libur, atau tanggal yang sudah penuh.
            </p>
          </div>
        </div>

        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            Loading schedule...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            Gagal mengambil data jadwal: {error}
          </div>
        )}

        {!loading && !error && (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
              <div className="mb-6 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  ←
                </button>

                <div className="text-center">
                  <h2 className="text-lg font-semibold text-slate-900 md:text-xl">
                    {getMonthLabel(currentMonth, lang)}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Klik tanggal untuk melihat session
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  →
                </button>
              </div>

              <div className="mb-3 grid grid-cols-7 gap-2">
                {weekdayLabels.map((label) => (
                  <div
                    key={label}
                    className="py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500 md:text-xs"
                  >
                    {label}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {calendarCells.map((cell, index) => {
                  if (!cell.date) {
                    return (
                      <div
                        key={`empty-${index}`}
                        className="aspect-square rounded-2xl border border-transparent bg-transparent"
                      />
                    );
                  }

                  const dateStr = toDateString(cell.date);
                  const day = dayMap.get(dateStr);
                  const meta = getDayMeta(day);

                  const selected = selectedDate === dateStr;
                  const today = isToday(dateStr);
                  const disabled = !day;

                  const dayOfWeek = cell.date.getDay();
                  const isSaturday = dayOfWeek === 6;
                  const isSunday = dayOfWeek === 0;

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      disabled={disabled}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`relative aspect-square rounded-2xl border p-2 text-left transition
                        ${disabled
                          ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300'
                          : isSunday
                            ? 'border-rose-200 bg-rose-50 text-rose-700'
                            : isSaturday
                              ? 'border-blue-200 bg-blue-50 text-blue-700'
                              : meta.cellClass}
                        ${selected ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}
                        ${today && !selected ? 'ring-1 ring-slate-300' : ''}
                        ${!disabled && !selected ? 'hover:scale-[1.02] hover:shadow-sm' : ''}
                      `}
                    >
                      <div className="flex h-full flex-col">
                        <div className="flex flex-col">
                          <span
                            className={`text-sm font-semibold md:text-base ${
                              day?.isAllFull ? 'line-through decoration-1' : ''
                            }`}
                          >
                            {cell.date.getDate()}
                          </span>

                          {today && (
                            <span className="mt-1 h-[2px] w-full rounded-full bg-emerald-400 opacity-80" />
                          )}
                        </div>

                        {day ? (
                          <div className="mt-auto">
                            <div className="flex items-center justify-between">
                              <span className={`h-2.5 w-2.5 rounded-full ${meta.dotClass}`} />
                              <span className="text-[10px] font-semibold">
                                {day.totalRemainingSlots}
                              </span>
                            </div>

                            <div className="mt-1 hidden text-[10px] font-medium md:block">
                              {meta.label}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    Available
                  </div>
                </div>

                <div className="rounded-2xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                    Full
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                    Off
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    Holiday
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
              {!selectedDate || !selectedDay ? (
                <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
                  <div className="mb-3 rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
                    No schedule selected
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Pilih tanggal yang tersedia
                  </h3>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                    Tanggal yang memiliki jadwal akan menampilkan status dan jumlah
                    slot yang masih tersedia.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-6 border-b border-slate-100 pb-5">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-semibold text-slate-900">
                        {formatDateLabel(selectedDay.date, lang)}
                      </h2>

                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getDayMeta(selectedDay).badgeClass}`}>
                        {getDayMeta(selectedDay).label}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-500">
                      Total slot tersedia:{' '}
                      <span className="font-semibold text-emerald-700">
                        {selectedDay.totalRemainingSlots}
                      </span>
                    </p>

                    {selectedDay.dayNote && (
                      <p className="mt-2 text-xs text-slate-500">
                        {selectedDay.dayNote}
                      </p>
                    )}
                  </div>

                  <div className="space-y-4">
                    {selectedDay.sessions.map((session) => {
                      const isUnavailable =
                        session.status === 'off' ||
                        session.status === 'cancelled' ||
                        session.remaining_slots <= 0 ||
                        selectedDay.dayStatus === 'off' ||
                        selectedDay.dayStatus === 'holiday';

                      return (
                        <div
                          key={session.id}
                          className={`rounded-2xl border p-4 transition ${
                            isUnavailable
                              ? 'border-slate-200 bg-slate-50'
                              : 'border-emerald-100 bg-gradient-to-r from-white to-emerald-50/50 hover:border-emerald-200 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="text-base font-semibold text-slate-900">
                                  {formatTime(session.start_time)} - {formatTime(session.end_time)}
                                </div>

                                <span
                                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                    isUnavailable
                                      ? 'bg-slate-200 text-slate-600'
                                      : 'bg-emerald-100 text-emerald-700'
                                  }`}
                                >
                                  {isUnavailable ? 'Unavailable' : 'Open'}
                                </span>
                              </div>

                              <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                                <span className="rounded-full bg-slate-100 px-2.5 py-1">
                                  Kapasitas {session.capacity}
                                </span>
                                <span className="rounded-full bg-slate-100 px-2.5 py-1">
                                  Terisi {session.booked_count}
                                </span>
                                <span className="rounded-full bg-slate-100 px-2.5 py-1">
                                  Sisa {session.remaining_slots}
                                </span>
                              </div>

                              {(session.note || session.day_note) && (
                                <div className="mt-3 text-xs leading-5 text-slate-500">
                                  {session.note ?? session.day_note}
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col items-start gap-2 md:items-end">
                              <button
                                type="button"
                                disabled={isUnavailable}
                                onClick={() => openBookingModal(session)}
                                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                                  isUnavailable
                                    ? 'cursor-not-allowed bg-slate-200 text-slate-500'
                                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                }`}
                              >
                                Book Session
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {isModalOpen && selectedSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4">
            <div className="w-full max-w-xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl md:p-7">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                    Booking Session
                  </div>
                  <h3 className="mt-3 text-2xl font-semibold text-slate-900">
                    {formatDateLabel(selectedSession.session_date, lang)}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatTime(selectedSession.start_time)} -{' '}
                    {formatTime(selectedSession.end_time)}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Sisa slot: {selectedSession.remaining_slots}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeBookingModal}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Nama
                  </label>
                  <input
                    type="text"
                    name="customer_name"
                    value={form.customer_name}
                    onChange={handleFormChange}
                    required
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="customer_email"
                    value={form.customer_email}
                    onChange={handleFormChange}
                    required
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    placeholder="nama@email.com"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Nomor WhatsApp
                  </label>
                  <input
                    type="text"
                    name="customer_phone"
                    value={form.customer_phone}
                    onChange={handleFormChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Topik konsultasi
                  </label>
                  <input
                    type="text"
                    name="topic"
                    value={form.topic}
                    onChange={handleFormChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    placeholder="Contoh: Konsultasi PPh UMKM"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Catatan tambahan
                  </label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleFormChange}
                    rows={4}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    placeholder="Tulis kebutuhan atau pertanyaan singkat"
                  />
                </div>

                {bookingError && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {bookingError}
                  </div>
                )}

                {bookingSuccess && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {bookingSuccess}
                  </div>
                )}

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeBookingModal}
                    disabled={bookingLoading}
                    className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {bookingLoading ? 'Processing...' : 'Confirm Booking'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}