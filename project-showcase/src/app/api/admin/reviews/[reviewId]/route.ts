import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { createHash } from 'crypto';

const SECRET = process.env.SECRET || 'fizzyo-admin-secret-key';

function verifyToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const parts = decoded.split(':');
    if (parts.length !== 4) return false;

    const [username, email, expiresAt, hash] = parts;
    const data = `${username}:${email}:${expiresAt}`;
    const expectedHash = createHash('sha256').update(data + SECRET).digest('hex');

    if (hash !== expectedHash) return false;

    const expiresAtMs = Number(expiresAt);
    if (!Number.isFinite(expiresAtMs) || Date.now() > expiresAtMs) return false;

    return true;
  } catch {
    return false;
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
