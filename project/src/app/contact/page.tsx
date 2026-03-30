"use client";

import React, { FormEvent, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';

export default function ContactPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !message.trim()) {
      setError('Please enter both your email and message.');
      setSuccess(null);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, message }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to send message.');
      }

      setSuccess('Message has been successfully sent.');
      setEmail('');
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-fizzyo-charcoal text-white">
      <Navbar />

      <section className="container mx-auto px-6 pt-36 pb-16 flex flex-col items-center">
        <div className="max-w-2xl w-full text-center">
          <p className="uppercase tracking-[0.35em] text-white/40 text-xs mb-3">Contact Sales</p>
          <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter uppercase mb-5">Let&apos;s Talk</h1>
          <p className="text-white/70 text-lg leading-relaxed mb-10">
            Share your email and message below. Your request is sent directly to our sales inbox.
          </p>
        </div>

        {success && (
          <div className="mb-6 w-full max-w-2xl rounded-xl border border-green-300/30 bg-green-500/20 px-4 py-3 text-green-100 flex items-start justify-between gap-4">
            <span>{success}</span>
            <button
              type="button"
              aria-label="Dismiss success message"
              onClick={() => setSuccess(null)}
              className="shrink-0 rounded-md p-1 hover:bg-green-400/20 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 w-full max-w-2xl rounded-xl border border-red-300/30 bg-red-500/20 px-4 py-3 text-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 space-y-5">
          <div>
            <label htmlFor="email" className="block uppercase tracking-[0.2em] text-xs text-white/60 mb-2">
              Your Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="you@example.com"
              className="w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white placeholder:text-white/35 outline-none focus:border-fizzyo-purple"
            />
          </div>

          <div>
            <label htmlFor="message" className="block uppercase tracking-[0.2em] text-xs text-white/60 mb-2">
              Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              required
              rows={7}
              placeholder="Tell us what you need..."
              className="w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white placeholder:text-white/35 outline-none focus:border-fizzyo-purple resize-y"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-fizzyo-purple hover:bg-fizzyo-purple/90 text-white px-8 py-6 uppercase text-xs font-bold tracking-widest disabled:opacity-60"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>

            <Button asChild variant="ghost" className="rounded-full border border-white/20 hover:bg-white/10 text-white px-8 py-6 uppercase text-xs font-bold tracking-widest">
              <Link href="/">Back Home</Link>
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
