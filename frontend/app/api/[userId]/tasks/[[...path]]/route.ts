import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Route Handler Proxy
 * Proxies task-related requests from the frontend to the backend to avoid Mixed Content and CORS issues.
 */

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ userId: string; path?: string[] }> }
) {
  const { userId, path } = await context.params;
  
  // Use the backend URL from environment variables
  const backendUrl = (
    process.env.NEXT_PUBLIC_BACKEND_URL || 
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 
    'https://alishba-abid-dev-todo-backend.hf.space'
  ).replace(/\/$/, '');
  
  // Construct the target path on the backend
  let targetPath = `/api/${userId}/tasks`;
  if (path && path.length > 0) {
    targetPath += `/${path.join('/')}`;
  }
  
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${backendUrl}${targetPath}${searchParams ? `?${searchParams}` : ''}`;
  
  // Prepare headers for the proxied request
  const headers = new Headers();
  
  // Forward essential headers
  const headersToForward = ['authorization', 'content-type', 'accept'];
  headersToForward.forEach(headerName => {
    const value = request.headers.get(headerName);
    if (value) {
      headers.set(headerName, value);
    }
  });

  // Explicitly set the Host header to the target backend
  try {
    const backendHost = new URL(backendUrl).host;
    headers.set('Host', backendHost);
  } catch (e) {
    // Fallback if URL is invalid
  }
  
  let body;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      // For POST, PUT, PATCH, DELETE we forward the body
      body = await request.text();
    } catch (e) {
      // No body or error reading body
    }
  }

  try {
    const response = await fetch(url, {
      method: request.method,
      headers,
      body,
      cache: 'no-store',
      // Important for HuggingFace/Vercel to follow redirects if any
      redirect: 'follow',
    });

    const responseData = await response.text();
    
    // Construct the response
    return new NextResponse(responseData, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('Proxy Error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request to backend' },
      { status: 500 }
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
