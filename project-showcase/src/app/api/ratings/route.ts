import { NextResponse } from 'next/server';
import {
  createRatingInDb,
  hasExistingRatingForOrder,
  hasValidOrderForRating,
  listRatingsFromDb,
} from '@/lib/db';

type CreateRatingPayload = {
  orderNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  rating: number;
  comment: string;
};

export async function GET() {
  try {
    const ratings = await listRatingsFromDb(6);
    return NextResponse.json({ ok: true, ratings });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load ratings.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CreateRatingPayload;

    if (!payload.orderNumber || !payload.firstName || !payload.lastName || !payload.email || !payload.comment) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email.trim())) {
      return NextResponse.json({ error: 'Invalid email format.' }, { status: 400 });
    }

    if (!Number.isInteger(payload.rating) || payload.rating < 1 || payload.rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5.' }, { status: 400 });
    }

    if (!(await hasValidOrderForRating(payload.orderNumber, payload.email))) {
      return NextResponse.json(
        { error: 'Invalid order ID or email. Rating requires a valid order tied to this email.' },
        { status: 400 }
      );
    }

    if (await hasExistingRatingForOrder(payload.orderNumber)) {
      return NextResponse.json({ error: 'This order ID has already been rated.' }, { status: 400 });
    }

    const rating = await createRatingInDb({
      orderNumber: payload.orderNumber.trim(),
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      email: payload.email.trim().toLowerCase(),
      rating: payload.rating,
      comment: payload.comment.trim(),
    });

    return NextResponse.json({ ok: true, rating });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save rating.' },
      { status: 500 }
    );
  }
}
