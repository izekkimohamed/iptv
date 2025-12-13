// lib/auth.ts
import { cookies } from 'next/headers';

export async function getServerSession() {
  const cookieStore = await cookies();

  // Get all cookies and forward them to your NestJS backend
  const cookieHeader = cookieStore.toString();

  try {
    const response = await fetch(`${process.env.API_URL}/api/auth/get-session`, {
      headers: {
        Cookie: cookieHeader,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    const session = await response.json();
    return session;
  } catch (error) {
    console.error('Failed to get session:', error);
    return null;
  }
}

export async function getUser() {
  const session = await getServerSession();
  return session?.user || null;
}

// Alternative: Get specific auth cookie
export async function getAuthToken() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('better-auth.session_token'); // Replace with your actual cookie name
  return authCookie?.value || null;
}
