// app/api/request/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { fullName, email, phone, serviceType, companyName, message } =
      body ?? {};

    // Validasi super basic
    if (!fullName || !email || !serviceType) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      );
    }

    // Log ke server (bisa dilihat di console Vercel / dev)
    console.log('🔔 New consultation request:', {
      fullName,
      email,
      phone,
      serviceType,
      companyName,
      message,
      receivedAt: new Date().toISOString(),
    });

    // TODO: di masa depan bisa:
    // - simpan ke DB
    // - kirim email ke admin
    // - push ke Slack, dsb.

    return NextResponse.json(
      {
        ok: true,
        message: 'Request received',
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Error in /api/request:', err);

    return NextResponse.json(
      {
        ok: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
