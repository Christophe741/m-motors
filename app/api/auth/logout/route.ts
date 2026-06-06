import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api-handler';

export const POST = withErrorHandler(async () => {
  const response = NextResponse.json({ success: true });
  response.cookies.set('mmotors_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });
  return response;
});
