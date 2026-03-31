import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { db } from '@/lib/firebase';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const ORDER_FROM_EMAIL = process.env.ORDER_FROM_EMAIL || 'verifyemaildesd@gmail.com';
const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL;

export async function POST(
  request: Request,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const orderNumber = params.orderNumber;
    const { type, description } = await request.json();

    if (!orderNumber || !type) {
      return NextResponse.json(
        { error: 'Order number and issue type are required.' },
        { status: 400 }
      );
    }

    // Get order details
    const orderDoc = await db.collection('orders').doc(orderNumber).get();
    if (!orderDoc.exists) {
      return NextResponse.json(
        { error: 'Order not found.' },
        { status: 404 }
      );
    }

    const orderData = orderDoc.data();

    // Add complaint/issue record
    await db.collection('orders').doc(orderNumber).collection('issues').add({
      type,
      description,
      createdAt: Date.now(),
      status: 'pending',
    });

    // Send email notification
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

      const issueLabel = type === 'not_received' ? 'Not Received' : 'Issue Reported';

      // Email to customer
      await transporter.sendMail({
        from: `Fizzyo Support <${ORDER_FROM_EMAIL}>`,
        to: orderData?.customerEmail,
        subject: `Issue Reported: ${orderNumber}`,
        text: `Your issue for order ${orderNumber} has been received: ${issueLabel}\n\nWe will investigate and get back to you within 1-2 business days.`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.55; color: #111;">
            <h2>Issue Report Received</h2>
            <p><strong>Order Number:</strong> ${orderNumber}</p>
            <p><strong>Issue Type:</strong> ${issueLabel}</p>
            ${description ? `<p><strong>Details:</strong> ${description}</p>` : ''}
            <p>We will investigate and get back to you within 1-2 business days.</p>
          </div>
        `,
      });

      // Email to admin
      if (CONTACT_TO_EMAIL) {
        await transporter.sendMail({
          from: `Fizzyo Support <${ORDER_FROM_EMAIL}>`,
          to: CONTACT_TO_EMAIL,
          subject: `Issue Report: ${orderNumber}`,
          text: `Customer reported an issue with order ${orderNumber}.\nType: ${issueLabel}\nDescription: ${description}\nCustomer Email: ${orderData?.customerEmail}`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.55; color: #111;">
              <h2>Customer Issue Report</h2>
              <p><strong>Order Number:</strong> ${orderNumber}</p>
              <p><strong>Issue Type:</strong> ${issueLabel}</p>
              ${description ? `<p><strong>Details:</strong> ${description}</p>` : ''}
              <p><strong>Customer Email:</strong> ${orderData?.customerEmail}</p>
              <p><strong>Customer Phone:</strong> ${orderData?.customerPhone}</p>
            </div>
          `,
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to report issue.' },
      { status: 500 }
    );
  }
}
