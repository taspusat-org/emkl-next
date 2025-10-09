import { NextRequest, NextResponse } from 'next/server';

const LOCAL_AGENT = 'http://localhost:3004/api/printer';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('path') || '';
  const target = `${LOCAL_AGENT}${url}`;

  try {
    const res = await fetch(target, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to connect local agent' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('path') || '';
  const target = `${LOCAL_AGENT}${url}`;

  try {
    const formData = await req.formData(); // mendukung upload file
    const res = await fetch(target, { method: 'POST', body: formData });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to connect local agent' },
      { status: 500 }
    );
  }
}
