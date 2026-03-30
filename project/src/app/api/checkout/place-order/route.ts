import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { verifyCode } from '@/lib/checkout-store';
import { createOrder } from '@/lib/order-store';

type CheckoutItem = {
  id: number;
  name: string;
  subtitle: string;
  qty: number;
};

type PlaceOrderPayload = {
  email: string;
  phone: string;
  verificationCode: string;
  paymentMethod: 'cash' | 'card' | 'instapay';
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
  instapayId?: string;
  items: CheckoutItem[];
  subtotal: number;
};

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const ORDER_FROM_EMAIL = process.env.ORDER_FROM_EMAIL || 'verifyemaildesd@gmail.com';
const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL;
const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as PlaceOrderPayload;

    const validationError = validatePayload(payload);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const verificationResult = verifyCode(payload.email, payload.verificationCode);
    if (!verificationResult.ok) {
      return NextResponse.json({ error: verificationResult.reason }, { status: 400 });
    }

    const orderNumber = `FZY-${Date.now().toString().slice(-8)}`;
    const eta = getEtaWindow();
    const trackingUrl = `${APP_BASE_URL}/track/${orderNumber}`;
    const manageUrl = `${APP_BASE_URL}/manage/${orderNumber}`;

    await createOrder({
      orderNumber,
      customerEmail: payload.email,
      customerPhone: payload.phone,
      items: payload.items,
      subtotal: payload.subtotal,
    });

    const smtpConfigured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);

    if (smtpConfigured) {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });

      const itemsHtml = payload.items
        .map((item) => `<li>${escapeHtml(item.name)} ${escapeHtml(item.subtitle)} x${item.qty}</li>`)
        .join('');

      const customerEmailHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.55; color: #111; max-width: 640px;">
          <h2 style="margin: 0 0 10px;">Your Fizzyo Order Is Confirmed</h2>
          <p style="margin: 0 0 8px;"><strong>Order Number:</strong> ${orderNumber}</p>
          <p style="margin: 0 0 8px;"><strong>Estimated Arrival:</strong> ${eta}</p>
          <p style="margin: 0 0 14px;"><strong>Total:</strong> $${payload.subtotal.toFixed(2)}</p>
          <p style="margin: 0 0 8px;"><strong>Items:</strong></p>
          <ul style="margin: 0 0 20px; padding-left: 18px;">${itemsHtml}</ul>
          <a href="${trackingUrl}" style="display: inline-block; background: #6d28d9; color: #fff; text-decoration: none; padding: 12px 22px; border-radius: 999px; font-weight: 700;">Track Order</a>
        </div>
      `;

      const contactEmailHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.55; color: #111; max-width: 640px;">
          <h2 style="margin: 0 0 10px;">New Order Placed</h2>
          <p style="margin: 0 0 8px;"><strong>Order Number:</strong> ${orderNumber}</p>
          <p style="margin: 0 0 8px;"><strong>Customer Email:</strong> ${escapeHtml(payload.email)}</p>
          <p style="margin: 0 0 8px;"><strong>Customer Phone:</strong> ${escapeHtml(payload.phone)}</p>
          <p style="margin: 0 0 8px;"><strong>Total:</strong> $${payload.subtotal.toFixed(2)}</p>
          <p style="margin: 0 0 8px;"><strong>Items:</strong></p>
          <ul style="margin: 0 0 20px; padding-left: 18px;">${itemsHtml}</ul>
          <a href="${manageUrl}" style="display: inline-block; background: #6d28d9; color: #fff; text-decoration: none; padding: 12px 22px; border-radius: 999px; font-weight: 700;">Manage Order</a>
        </div>
      `;

      await transporter.sendMail({
        from: `Fizzyo Orders <${ORDER_FROM_EMAIL}>`,
        to: payload.email,
        replyTo: ORDER_FROM_EMAIL,
        subject: `Order Confirmed: ${orderNumber}`,
        text: `Your order is confirmed!\nOrder Number: ${orderNumber}\nEstimated Arrival: ${eta}\nTotal: $${payload.subtotal.toFixed(2)}\nTrack: ${trackingUrl}`,
        html: customerEmailHtml,
      });

      if (CONTACT_TO_EMAIL && CONTACT_TO_EMAIL !== payload.email) {
        await transporter.sendMail({
          from: `Fizzyo Orders <${ORDER_FROM_EMAIL}>`,
          to: CONTACT_TO_EMAIL,
          subject: `New Order: ${orderNumber}`,
          text: `New order placed!\nOrder Number: ${orderNumber}\nCustomer: ${payload.email}\nTotal: $${payload.subtotal.toFixed(2)}\nManage: ${manageUrl}`,
          html: contactEmailHtml,
        });
      }
    } else if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'SMTP is not configured yet. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env.local.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      orderNumber,
      eta,
      trackingUrl,
      manageUrl,
      emailSent: smtpConfigured,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to place order.' },
      { status: 500 }
    );
  }
}

function validatePayload(payload: PlaceOrderPayload) {
  if (!isValidEmail(payload.email)) return 'Please provide a valid email.';
  if (!isValidPhone(payload.phone)) return 'Please provide a valid phone number.';
  if (!payload.verificationCode || !/^\d{6}$/.test(payload.verificationCode.trim())) {
    return 'Verification code must be 6 digits.';
  }

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    return 'Cart is empty.';
  }

  if (typeof payload.subtotal !== 'number' || Number.isNaN(payload.subtotal) || payload.subtotal <= 0) {
    return 'Invalid subtotal.';
  }

  if (payload.paymentMethod === 'card') {
    if (!payload.cardNumber || !/^\d{16}$/.test(payload.cardNumber.replace(/\s+/g, ''))) {
      return 'Card number must be 16 digits.';
    }
    if (!payload.cardExpiry || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(payload.cardExpiry.trim())) {
      return 'Card expiry must be in MM/YY format.';
    }
    if (!payload.cardCvv || !/^\d{3,4}$/.test(payload.cardCvv.trim())) {
      return 'Card CVV must be 3 or 4 digits.';
    }
  }

  if (payload.paymentMethod === 'instapay') {
    if (!payload.instapayId || !/^([a-zA-Z0-9._-]{4,40})$/.test(payload.instapayId.trim())) {
      return 'InstaPay ID format is invalid.';
    }
  }

  return null;
}

function isValidEmail(value: unknown) {
  if (typeof value !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidPhone(value: unknown) {
  if (typeof value !== 'string') return false;
  return /^[+]?\d{8,15}$/.test(value.replace(/\s+/g, ''));
}

function getEtaWindow() {
  const now = new Date();
  const start = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const end = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString('en-US', opts)} - ${end.toLocaleDateString('en-US', opts)}`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
