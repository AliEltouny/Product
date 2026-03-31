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

export async function GET(request: Request) {
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

    // Fetch all orders
    const ordersSnapshot = await db.collection('orders').get();
    const issues: any[] = [];

    // For each order, fetch its issues subcollection
    for (const orderDoc of ordersSnapshot.docs) {
      const orderNumber = orderDoc.id;
      const issuesSnapshot = await db
        .collection('orders')
        .doc(orderNumber)
        .collection('issues')
        .get();

      for (const issueDoc of issuesSnapshot.docs) {
        const issueData = issueDoc.data();
        issues.push({
          id: issueDoc.id,
          orderNumber,
          ...issueData,
        });
      }
    }

    // Sort by created date (newest first)
    issues.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    return NextResponse.json({ issues });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch issues.' },
      { status: 500 }
    );
  }
}
