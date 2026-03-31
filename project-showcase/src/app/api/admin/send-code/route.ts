import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createVerificationCode } from '@/lib/checkout-store';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const VERIFY_CODE_FROM_EMAIL = process.env.VERIFY_CODE_FROM_EMAIL || 'verifyemaildesd@gmail.com';

// Hardcoded admin credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'fizzyo2024';
const ADMIN_EMAIL = 'alieltouny.contact@gmail.com';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required.' },
        { status: 400 }
      );
    }

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    const code = createVerificationCode(ADMIN_EMAIL);

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json({
          ok: true,
          devCode: code,
          warning: 'SMTP is not configured. Using development verification code.',
        });
      }

      return NextResponse.json(
        { error: 'SMTP is not configured yet.' },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `Fizzyo Admin <${VERIFY_CODE_FROM_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject: 'Your Fizzyo Admin Verification Code',
      text: `Your admin verification code is: ${code}\n\nThis code expires in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111;">
          <h2 style="margin: 0 0 12px;">Admin Access Verification</h2>
          <p style="margin: 0 0 10px;">Your verification code is:</p>
          <p style="margin: 0 0 12px; font-size: 30px; font-weight: 700; letter-spacing: 4px;">${code}</p>
          <p style="margin: 0; color: #555;">This code expires in 10 minutes.</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send verification code.' },
      { status: 500 }
    );
  }
}
