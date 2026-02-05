

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(
  request: NextRequest,
  context: { params: { userId: string } } // ✅ latest recommended
) {
  const { userId } = context.params;

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  const body = await request.json();

  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL!;
    const backendResponse = await fetch(`${backendUrl}/api/${userId}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(body),
    });

    const data = await backendResponse.json();

    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to connect to backend' }, { status: 500 });
  }
}
