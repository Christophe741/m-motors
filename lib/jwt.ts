import { SignJWT, jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export interface JwtPayload {
  sub: string;
  role: string;
}

export async function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      sub: payload.sub as string,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
}

export async function getAuthUser(request: NextRequest): Promise<JwtPayload | null> {
  const token = request.cookies.get('mmotors_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}
