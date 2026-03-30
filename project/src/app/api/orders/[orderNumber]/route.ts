import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getOrder, updateOrderStatus } from '@/lib/order-store';

type UpdateOrderPayload = {
  status: 'pending' | 'prep' | 'out-for-delivery' | 'delivered';
};

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const ORDER_FROM_EMAIL = process.env.ORDER_FROM_EMAIL || 'verifyemaildesd@gmail.com';
const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';

const DRIVER_NAME = 'Ahmed Mohamed';
const DRIVER_PHONE = '+201244442030';

const STATUS_LABELS: Record<UpdateOrderPayload['status'], string> = {
  pending: 'Pending',
  prep: 'Preparation',
  'out-for-delivery': 'Out for Delivery',
  delivered: 'Delivered',
};

export async function GET(_request: Request, { params }: { params: Promise<{ orderNumber: string }> }) {
  try {
    const { orderNumber } = await params;
    const order = await getOrder(orderNumber);

    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, order });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch order.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ orderNumber: string }> }) {
  try {
    const { orderNumber } = await params;
    const { status } = (await request.json()) as UpdateOrderPayload;

    if (!['pending', 'prep', 'out-for-delivery', 'delivered'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
    }

    const order = await updateOrderStatus(orderNumber, status);
    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    const trackingUrl = `${APP_BASE_URL}/track/${order.orderNumber}`;
    const rateUrl = `${APP_BASE_URL}/rate/${order.orderNumber}`;
    const missingUrl = `${trackingUrl}#missing-order`;

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

      const baseLines = [
        `Order Number: ${order.orderNumber}`,
        `New Status: ${STATUS_LABELS[status]}`,
        `Track Order: ${trackingUrl}`,
      ];

      if (status === 'out-for-delivery') {
        baseLines.push(`Driver: ${DRIVER_NAME}`);
        baseLines.push(`Driver Phone: ${DRIVER_PHONE}`);
      }

      if (status === 'delivered') {
        baseLines.push(`Rate Experience: ${rateUrl}`);
        baseLines.push(`Order Not Received: ${missingUrl}`);
      }

      await transporter.sendMail({
        from: `Fizzyo Orders <${ORDER_FROM_EMAIL}>`,
        to: order.customerEmail,
        replyTo: ORDER_FROM_EMAIL,
        subject: `Order Update: ${order.orderNumber} is now ${STATUS_LABELS[status]}`,
        text: baseLines.join('\n'),
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.55; color: #111; max-width: 640px;">
            <h2 style="margin: 0 0 10px;">Your Order Status Was Updated</h2>
            <p style="margin: 0 0 8px;"><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p style="margin: 0 0 8px;"><strong>New Status:</strong> ${STATUS_LABELS[status]}</p>
            ${status === 'out-for-delivery' ? `<p style="margin: 0 0 8px;"><strong>Driver:</strong> ${DRIVER_NAME}</p><p style="margin: 0 0 8px;"><strong>Driver Phone:</strong> ${DRIVER_PHONE}</p>` : ''}
            <a href="${trackingUrl}" style="display: inline-block; margin-top: 8px; margin-right: 8px; background: #6d28d9; color: #fff; text-decoration: none; padding: 10px 18px; border-radius: 999px; font-weight: 700;">Track Order</a>
            ${status === 'delivered' ? `<a href="${rateUrl}" style="display: inline-block; margin-top: 8px; margin-right: 8px; background: #111; color: #fff; text-decoration: none; padding: 10px 18px; border-radius: 999px; font-weight: 700;">Rate Experience</a><a href="${missingUrl}" style="display: inline-block; margin-top: 8px; color: #6d28d9; text-decoration: underline; font-weight: 600;">Order not received?</a>` : ''}
          </div>
        `,
      });
    }

    return NextResponse.json({ ok: true, order, notificationSent: smtpConfigured });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update order.' },
      { status: 500 }
    );
  }
}
