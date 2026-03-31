import { NextResponse } from 'next/server';
import { verifyCode } from '@/lib/checkout-store';
import { createHash } from 'crypto';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'fizzyo2024';
const ADMIN_EMAIL = 'alieltouny.contact@gmail.com';
const SECRET = process.env.SECRET || 'fizzyo-admin-secret-key';

function generateToken(username: string, email: string) {
  const timestamp = Date.now() + 24 * 60 * 60 * 1000;
  const data = `${username}:${email}:${timestamp}`;
  const hash = createHash('sha256').update(data + SECRET).digest('hex');
  return btoa(`${data}:${hash}`);
}

export async function POST(request: Request) {
  try {
    const { username, password, verificationCode } = await request.json();

    if (!username || !password || !verificationCode) {
      return NextResponse.json(
        { error: 'Missing required fields.' },
        { status: 400 }
      );
    }

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    if (!verifyCode(ADMIN_EMAIL, verificationCode)) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code.' },
        { status: 401 }
      );
    }

    // Create token
    const token = generateToken(ADMIN_USERNAME, ADMIN_EMAIL);

    return NextResponse.json({ ok: true, token });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Verification failed.' },
      { status: 500 }
    );
  }
}
