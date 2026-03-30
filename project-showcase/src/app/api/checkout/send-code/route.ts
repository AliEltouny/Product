import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createVerificationCode } from '@/lib/checkout-store';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const VERIFY_CODE_FROM_EMAIL = process.env.VERIFY_CODE_FROM_EMAIL || 'verifyemaildesd@gmail.com';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Please provide a valid email.' }, { status: 400 });
    }

    const code = createVerificationCode(email);

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json({
          ok: true,
          devCode: code,
          warning: 'SMTP is not configured. Using development verification code.',
        });
      }

      return NextResponse.json(
        { error: 'SMTP is not configured yet. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env.local.' },
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
      from: `Fizzyo Verification <${VERIFY_CODE_FROM_EMAIL}>`,
      to: email,
      subject: 'Your Fizzyo verification code',
      text: `Your verification code is: ${code}\n\nThis code expires in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111;">
          <h2 style="margin: 0 0 12px;">Verify Your Checkout</h2>
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

function isValidEmail(value: unknown) {
  if (typeof value !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
