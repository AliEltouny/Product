import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { db } from '@/lib/firebase';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const ORDER_FROM_EMAIL = process.env.ORDER_FROM_EMAIL || 'verifyemaildesd@gmail.com';

function getTokenParts(token: string) {
  const decoded = Buffer.from(token, 'base64').toString('utf-8');
  const parts = decoded.split(':');
  return {
    username: parts[0],
    email: parts[1],
    expiresAt: parseInt(parts[2], 10),
    hash: parts[3],
  };
}

function isTokenValid(token: string): boolean {
  try {
    const parts = getTokenParts(token);
    return parts.expiresAt > Date.now();
  } catch {
    return false;
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { issueId: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    if (!isTokenValid(token)) {
      return NextResponse.json({ error: 'Token expired' }, { status: 401 });
    }

    const { action, orderNumber } = await request.json();

    if (!action || !orderNumber) {
      return NextResponse.json(
        { error: 'action and orderNumber are required' },
        { status: 400 }
      );
    }

    // Get the issue
    const issueDoc = await db
      .collection('orders')
      .doc(orderNumber)
      .collection('issues')
      .doc(params.issueId)
      .get();

    if (!issueDoc.exists) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    const issueData = issueDoc.data();

    // Get order to send email
    const orderDoc = await db.collection('orders').doc(orderNumber).get();
    if (!orderDoc.exists) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const orderData = orderDoc.data();

    if (action === 'confirm') {
      // Update issue status to confirmed
      await db
        .collection('orders')
        .doc(orderNumber)
        .collection('issues')
        .doc(params.issueId)
        .update({
          status: 'confirmed',
          confirmedAt: Date.now(),
        });

      // Send confirmation email to customer
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

        const issueType =
          issueData?.type === 'not_received'
            ? 'not received'
            : issueData?.type === 'complaint'
            ? 'complaint'
            : 'cancellation';

        await transporter.sendMail({
          from: `Fizzyo Support <${ORDER_FROM_EMAIL}>`,
          to: orderData?.customerEmail,
          subject: `Order ${orderNumber} - ${issueType === 'cancellation' ? 'Cancellation Confirmed' : 'Issue Resolved'}`,
          text: `Your ${issueType} request for order ${orderNumber} has been confirmed. We will process this within 1-2 business days.`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.55; color: #111;">
              <h2>${issueType === 'cancellation' ? 'Order Cancellation Confirmed' : 'Issue Report Confirmed'}</h2>
              <p><strong>Order Number:</strong> ${orderNumber}</p>
              <p>Your ${issueType} request has been confirmed and approved. We will process this within 1-2 business days.</p>
              <p>If you have any questions, please don't hesitate to contact us.</p>
            </div>
          `,
        });
      }

      return NextResponse.json({ ok: true });
    } else if (action === 'deny') {
      // Update issue status to denied
      await db
        .collection('orders')
        .doc(orderNumber)
        .collection('issues')
        .doc(params.issueId)
        .update({
          status: 'denied',
          deniedAt: Date.now(),
        });

      return NextResponse.json({ ok: true });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update issue' },
      { status: 500 }
    );
  }
}
