import { NextResponse } from 'next/server';
import { verifyCode } from '@/lib/checkout-store';
import * as jwt from 'jsonwebtoken';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'fizzyo2024';
const ADMIN_EMAIL = 'alieltouny.contact@gmail.com';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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

    // Create JWT token
    const token = jwt.sign(
      { username, email: ADMIN_EMAIL, isAdmin: true },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return NextResponse.json({ ok: true, token });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Verification failed.' },
      { status: 500 }
    );
  }
}
