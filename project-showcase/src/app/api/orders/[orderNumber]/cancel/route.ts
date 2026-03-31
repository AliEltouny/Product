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
    const { reason, fromAdmin } = await request.json();

    if (!orderNumber) {
      return NextResponse.json(
        { error: 'Order number is required.' },
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

    // Check if order is already cancelled
    if (orderData?.status === 'cancelled') {
      return NextResponse.json(
        { error: 'This order has already been cancelled.' },
        { status: 400 }
      );
    }

    // Add cancellation record
    await db.collection('orders').doc(orderNumber).collection('issues').add({
      type: 'cancellation',
      reason,
      createdAt: Date.now(),
      status: fromAdmin ? 'admin-initiated' : 'pending',
    });

    // Update order status to cancelled
    await db.collection('orders').doc(orderNumber).update({
      status: 'cancelled',
      statusUpdatedAt: Date.now(),
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

      // Email to customer only if not from admin
      if (!fromAdmin) {
        await transporter.sendMail({
          from: `Fizzyo Orders <${ORDER_FROM_EMAIL}>`,
          to: orderData?.customerEmail,
          subject: `Order Cancellation Request: ${orderNumber}`,
          text: `Your order ${orderNumber} cancellation request has been received. We will process this within 1-2 business days.`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.55; color: #111;">
              <h2>Order Cancellation Request Received</h2>
              <p><strong>Order Number:</strong> ${orderNumber}</p>
              <p>We will process your cancellation request within 1-2 business days. If you have any questions, please contact us.</p>
            </div>
          `,
        });
      }

      // Email to admin only if customer initiated
      if (!fromAdmin && CONTACT_TO_EMAIL) {
        await transporter.sendMail({
          from: `Fizzyo Orders <${ORDER_FROM_EMAIL}>`,
          to: CONTACT_TO_EMAIL,
          subject: `Order Cancellation Request: ${orderNumber}`,
          text: `Customer has requested to cancel order ${orderNumber}.\nCustomer Email: ${orderData?.customerEmail}`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.55; color: #111;">
              <h2>Order Cancellation Request</h2>
              <p><strong>Order Number:</strong> ${orderNumber}</p>
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
      { error: error instanceof Error ? error.message : 'Failed to cancel order.' },
      { status: 500 }
    );
  }
}
