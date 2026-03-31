import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

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

export async function DELETE(
  request: Request,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    if (!isTokenValid(token)) {
      return NextResponse.json(
        { error: 'Token expired' },
        { status: 401 }
      );
    }

    const orderNumber = params.orderNumber;

    // Check if order exists
    const orderDoc = await db.collection('orders').doc(orderNumber).get();
    if (!orderDoc.exists) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Delete all items in the order
    const itemsSnapshot = await db
      .collection('orders')
      .doc(orderNumber)
      .collection('items')
      .get();

    for (const itemDoc of itemsSnapshot.docs) {
      await itemDoc.ref.delete();
    }

    // Delete all issues for the order
    const issuesSnapshot = await db
      .collection('orders')
      .doc(orderNumber)
      .collection('issues')
      .get();

    for (const issueDoc of issuesSnapshot.docs) {
      await issueDoc.ref.delete();
    }

    // Delete the order itself
    await db.collection('orders').doc(orderNumber).delete();

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete order' },
      { status: 500 }
    );
  }
}
