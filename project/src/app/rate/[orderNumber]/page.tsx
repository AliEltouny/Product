"use client";

import React, { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';

type RatePageProps = {
  params: Promise<{ orderNumber: string }>;
};

export default function RateOrderPage({ params }: RatePageProps) {
  const [orderNumber, setOrderNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setOrderNumber(p.orderNumber));
  }, [params]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber,
          firstName,
          lastName,
          email,
          rating,
          comment,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to submit rating.');
      }

      setSuccess('Thanks for rating your experience. Your review was submitted successfully.');
      setComment('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit rating.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-fizzyo-charcoal text-white">
      <Navbar />
      <section className="container mx-auto px-6 pt-36 pb-16">
        <div className="max-w-2xl mx-auto rounded-2xl border border-white/10 bg-white/5 p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-white/40 mb-3">Rate Experience</p>
          <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter uppercase mb-4">
            Order {orderNumber}
          </h1>
          <p className="text-white/70 mb-8">
            Share your feedback. A valid order ID with matching customer email is required.
          </p>

          {error && (
            <div className="mb-5 rounded-xl border border-red-300/30 bg-red-500/20 px-4 py-3 text-red-100">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-xl border border-green-300/30 bg-green-500/20 px-4 py-3 text-green-100">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="h-11 w-full rounded-xl border border-white/15 bg-black/20 px-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-fizzyo-purple"
                required
              />
              <input
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="h-11 w-full rounded-xl border border-white/15 bg-black/20 px-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-fizzyo-purple"
                required
              />
            </div>

            <input
              type="email"
              placeholder="Email used for order"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 w-full rounded-xl border border-white/15 bg-black/20 px-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-fizzyo-purple"
              required
            />

            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/55 block mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className={`h-10 w-10 rounded-full border text-sm font-bold ${
                      rating >= value
                        ? 'border-fizzyo-purple bg-fizzyo-purple text-white'
                        : 'border-white/20 bg-black/20 text-white/70'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={5}
              placeholder="Tell us about your experience"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/20 px-3 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-fizzyo-purple"
              required
            />

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-fizzyo-purple hover:bg-fizzyo-purple/90 text-white px-8 py-6 uppercase text-xs font-bold tracking-widest disabled:opacity-70"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Rating'}
              </Button>
              <Button asChild variant="ghost" className="rounded-full border border-white/20 hover:bg-white/10 text-white px-8 py-6 uppercase text-xs font-bold tracking-widest">
                <Link href={`/track/${orderNumber}`}>Back to Tracking</Link>
              </Button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
