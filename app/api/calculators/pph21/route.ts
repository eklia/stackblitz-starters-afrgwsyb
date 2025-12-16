// app/api/calculators/pph21/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { computePph21, Pph21Input } from '@/lib/tax/pph21';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<Pph21Input>;

    const monthlyGross = Number(body.monthlyGross);
    const status = body.status ?? 'TK/0';

    if (!Number.isFinite(monthlyGross) || monthlyGross <= 0) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Gaji bruto bulanan tidak valid.',
        },
        { status: 400 }
      );
    }

    const result = computePph21({
      monthlyGross,
      status,
    });

    return NextResponse.json(
      {
        ok: true,
        result,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Error in /api/calculators/pph21:', err);
    return NextResponse.json(
      {
        ok: false,
        error: 'Terjadi kesalahan pada server.',
      },
      { status: 500 }
    );
  }
}
