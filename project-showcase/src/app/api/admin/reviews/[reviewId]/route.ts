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

export async function DELETE(
  request: Request,
  { params }: { params: { reviewId: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const reviewId = params.reviewId;

    if (!reviewId) {
      return NextResponse.json(
        { error: 'Review ID is required.' },
        { status: 400 }
      );
    }

    await db.collection('ratings').doc(reviewId).delete();

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete review.' },
      { status: 500 }
    );
  }
}
