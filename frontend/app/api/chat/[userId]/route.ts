import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { getCookie } from '@/lib/cookies';

export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
  const { userId } = params;

  // Get the auth token from cookies
  const token = cookies().get('token')?.value;

  // Get the request body
  const body = await request.json();

  try {
    // Forward the request to the backend
    const backendResponse = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8000'}/api/${userId}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await backendResponse.json();

    return new Response(JSON.stringify(data), {
      status: backendResponse.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error forwarding request to backend:', error);
    return new Response(JSON.stringify({ error: 'Failed to connect to backend' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}