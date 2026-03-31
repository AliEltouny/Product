import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { createHash } from 'crypto';

const SECRET = process.env.SECRET || 'fizzyo-admin-secret-key';

function verifyToken(token: string): boolean {
  try {
    const [data, hash] = atob(token).split(':').slice(-2);
    const expectedHash = createHash('sha256').update(data.substring(0, data.lastIndexOf(':')) + SECRET).digest('hex');
    return hash === expectedHash;
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const ordersSnapshot = await db.collection('orders').get();
    const orders = ordersSnapshot.docs.map((doc) => ({
      ...doc.data(),
      orderNumber: doc.id,
    }));

    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch orders.' },
      { status: 500 }
    );
  }
}
