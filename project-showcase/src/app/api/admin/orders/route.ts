import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { username: string; email: string; isAdmin: boolean };
  } catch {
    return null;
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
