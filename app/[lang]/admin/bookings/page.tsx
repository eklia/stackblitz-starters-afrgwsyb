'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Lang } from '@/lib/types';
import { supabase } from '@/lib/supabase';

type PageProps = {
  params: {
    lang: Lang;
  };
};

type BookingRow = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  topic: string | null;
  notes: string | null;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  session_date: string;
  start_time: string;
  end_time: string;
};

type ConfirmAction = {
  bookingId: string;
  customerName: string;
  currentStatus: BookingRow['status'];
  nextStatus: BookingRow['status'];
} | null;

function formatDate(dateStr: string, lang: Lang) {
  return new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr));
}

function formatDateTime(dateStr: string, lang: Lang) {
  return new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

function formatTime(timeStr: string) {
  return timeStr.slice(0, 5);
}

function getStatusBadgeClass(status: BookingRow['status']) {
  switch (status) {
    case 'confirmed':
      return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    case 'cancelled':
      return 'bg-rose-100 text-rose-700 border border-rose-200';
    case 'completed':
      return 'bg-blue-100 text-blue-700 border border-blue-200';
    default:
      return 'bg-amber-100 text-amber-700 border border-amber-200';
  }
}

function getStatusLabel(status: BookingRow['status']) {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'confirmed':
      return 'Confirmed';
    case 'cancelled':
      return 'Cancelled';
    case 'completed':
      return 'Completed';
    default:
      return status;
  }
}

function getActionLabel(status: BookingRow['status']) {
  switch (status) {
    case 'confirmed':
      return 'confirm this booking';
    case 'completed':
      return 'mark this booking as completed';
    case 'cancelled':
      return 'cancel this booking';
    default:
      return 'update this booking';
  }
}

function getActionButtonClass(status: BookingRow['status']) {
  switch (status) {
    case 'confirmed':
      return 'bg-emerald-600 text-white hover:bg-emerald-700';
    case 'completed':
      return 'bg-blue-600 text-white hover:bg-blue-700';
    case 'cancelled':
      return 'bg-rose-600 text-white hover:bg-rose-700';
    default:
      return 'bg-slate-600 text-white hover:bg-slate-700';
  }
}

export default function AdminBookingsPage({ params }: PageProps) {
  const lang: Lang = params.lang === 'en' ? 'en' : 'id';
  const searchParams = useSearchParams();

  const [rows, setRows] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<'all' | BookingRow['status']>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [search, setSearch] = useState('');

  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  const urlKey = searchParams.get('key');
  const adminKey = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_KEY;
  const authorized = !!adminKey && urlKey === adminKey;

  const fetchBookings = async () => {
    setLoading(true);
    setError('');

    const { data, error } = await supabase
      .from('admin_booking_list')
      .select('*')
      .order('session_date', { ascending: false })
      .order('start_time', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
      setRows([]);
    } else {
      setRows((data ?? []) as BookingRow[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!authorized) {
      setLoading(false);
      return;
    }
    fetchBookings();
  }, [authorized]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const statusMatch = statusFilter === 'all' ? true : row.status === statusFilter;
      const dateMatch = dateFilter ? row.session_date === dateFilter : true;

      const keyword = search.trim().toLowerCase();
      const searchMatch = keyword
        ? [row.customer_name, row.customer_email, row.customer_phone ?? '', row.topic ?? '']
            .join(' ')
            .toLowerCase()
            .includes(keyword)
        : true;

      return statusMatch && dateMatch && searchMatch;
    });
  }, [rows, statusFilter, dateFilter, search]);

  const summary = useMemo(() => {
    return {
      total: rows.length,
      pending: rows.filter((r) => r.status === 'pending').length,
      confirmed: rows.filter((r) => r.status === 'confirmed').length,
      completed: rows.filter((r) => r.status === 'completed').length,
      cancelled: rows.filter((r) => r.status === 'cancelled').length,
    };
  }, [rows]);

  const openConfirmModal = (
    bookingId: string,
    customerName: string,
    currentStatus: BookingRow['status'],
    nextStatus: BookingRow['status']
  ) => {
    if (currentStatus === nextStatus) return;

    setConfirmAction({
      bookingId,
      customerName,
      currentStatus,
      nextStatus,
    });
  };

  const closeConfirmModal = () => {
    if (updatingId) return;
    setConfirmAction(null);
  };

  const handleUpdateStatus = async () => {
    if (!confirmAction) return;

    const { bookingId, nextStatus } = confirmAction;

    setUpdatingId(bookingId);
    setError('');

    const { error } = await supabase
      .from('bookings')
      .update({ status: nextStatus })
      .eq('id', bookingId);

    if (error) {
      setError(error.message);
      setUpdatingId(null);
      return;
    }

    await fetchBookings();
    setUpdatingId(null);
    setConfirmAction(null);
  };

  if (!authorized) {
    return (
      <section className="bg-gradient-to-b from-emerald-50 via-white to-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-[28px] border border-rose-200 bg-white p-8 shadow-sm">
            <div className="inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
              Unauthorized
            </div>
            <h1 className="mt-4 text-2xl font-semibold text-slate-900">
              Admin access denied
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Tambahkan key yang benar di URL untuk membuka dashboard admin.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-b from-emerald-50 via-white to-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
        <div className="mb-8 rounded-[30px] border border-emerald-100 bg-white/90 p-6 shadow-sm md:p-8">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              Admin Dashboard
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              Booking Management
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 md:text-base">
              Lihat booking yang masuk, filter data, dan update status sesuai alur proses.
            </p>
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Total
            </div>
            <div className="mt-2 text-3xl font-semibold text-slate-900">
              {summary.total}
            </div>
          </div>

          <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              Pending
            </div>
            <div className="mt-2 text-3xl font-semibold text-amber-800">
              {summary.pending}
            </div>
          </div>

          <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Confirmed
            </div>
            <div className="mt-2 text-3xl font-semibold text-emerald-800">
              {summary.confirmed}
            </div>
          </div>

          <div className="rounded-[24px] border border-blue-200 bg-blue-50 p-5 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              Completed
            </div>
            <div className="mt-2 text-3xl font-semibold text-blue-800">
              {summary.completed}
            </div>
          </div>

          <div className="rounded-[24px] border border-rose-200 bg-rose-50 p-5 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-rose-700">
              Cancelled
            </div>
            <div className="mt-2 text-3xl font-semibold text-rose-800">
              {summary.cancelled}
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <div className="grid gap-4 md:grid-cols-[220px_220px_minmax(0,1fr)_auto]">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Filter status
              </label>
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as 'all' | BookingRow['status'])
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="all">All status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Filter tanggal
              </label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Search
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama, email, phone, topik"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('all');
                  setDateFilter('');
                  setSearch('');
                }}
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            Loading bookings...
          </div>
        )}

        {!loading && error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            {error}
          </div>
        )}

        {!loading && !error && filteredRows.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            Tidak ada booking yang cocok dengan filter saat ini.
          </div>
        )}

        {!loading && !error && filteredRows.length > 0 && (
          <div className="space-y-4">
            {filteredRows.map((row) => {
              const canConfirm = row.status === 'pending';
              const canComplete = row.status === 'confirmed';
              const canCancel =
                row.status === 'pending' || row.status === 'confirmed';

              return (
                <div
                  key={row.id}
                  className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-slate-900">
                          {row.customer_name}
                        </h2>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusBadgeClass(
                            row.status
                          )}`}
                        >
                          {getStatusLabel(row.status)}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1">
                          {formatDate(row.session_date, lang)}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1">
                          {formatTime(row.start_time)} - {formatTime(row.end_time)}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1">
                          Created {formatDateTime(row.created_at, lang)}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Contact
                          </div>
                          <div className="mt-2 space-y-1 text-sm text-slate-800">
                            <div>{row.customer_email}</div>
                            <div>{row.customer_phone || '-'}</div>
                          </div>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4">
                          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Topic
                          </div>
                          <div className="mt-2 text-sm text-slate-800">
                            {row.topic || '-'}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 rounded-2xl bg-slate-50 p-4">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Notes
                        </div>
                        <div className="mt-2 text-sm leading-6 text-slate-700">
                          {row.notes || '-'}
                        </div>
                      </div>
                    </div>

                    <div className="xl:w-52">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Actions
                        </div>

                        <div className="flex flex-col gap-2">
                          {canConfirm && (
                            <button
                              type="button"
                              disabled={updatingId === row.id}
                              onClick={() =>
                                openConfirmModal(
                                  row.id,
                                  row.customer_name,
                                  row.status,
                                  'confirmed'
                                )
                              }
                              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Confirm Booking
                            </button>
                          )}

                          {canComplete && (
                            <button
                              type="button"
                              disabled={updatingId === row.id}
                              onClick={() =>
                                openConfirmModal(
                                  row.id,
                                  row.customer_name,
                                  row.status,
                                  'completed'
                                )
                              }
                              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Mark Completed
                            </button>
                          )}

                          {canCancel && (
                            <button
                              type="button"
                              disabled={updatingId === row.id}
                              onClick={() =>
                                openConfirmModal(
                                  row.id,
                                  row.customer_name,
                                  row.status,
                                  'cancelled'
                                )
                              }
                              className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Cancel Booking
                            </button>
                          )}

                          {!canConfirm && !canComplete && !canCancel && (
                            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                              No further action
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4">
          <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl md:p-7">
            <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              Confirm Action
            </div>

            <h3 className="mt-4 text-2xl font-semibold text-slate-900">
              Are you sure?
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              You are about to{' '}
              <span className="font-semibold text-slate-900">
                {getActionLabel(confirmAction.nextStatus)}
              </span>{' '}
              for{' '}
              <span className="font-semibold text-slate-900">
                {confirmAction.customerName}
              </span>
              .
            </p>

            <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              Current status:{' '}
              <span className="font-semibold text-slate-900">
                {getStatusLabel(confirmAction.currentStatus)}
              </span>
              <br />
              New status:{' '}
              <span className="font-semibold text-slate-900">
                {getStatusLabel(confirmAction.nextStatus)}
              </span>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeConfirmModal}
                disabled={!!updatingId}
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={!!updatingId}
                className={`rounded-xl px-4 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${getActionButtonClass(
                  confirmAction.nextStatus
                )}`}
              >
                {updatingId ? 'Processing...' : 'Yes, Continue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}