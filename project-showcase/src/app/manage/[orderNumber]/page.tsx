"use client";

import React, { useCallback, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';

type OrderPageParams = {
  params: Promise<{ orderNumber: string }>;
};

const STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'prep', label: 'In Preparation' },
  { value: 'out-for-delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
];

export default function ManageOrderPage({ params }: OrderPageParams) {
  const [orderNumber, setOrderNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    params.then((p) => setOrderNumber(p.orderNumber));
  }, [params]);

  const updateStatus = useCallback(
    async (newStatus: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/orders/${orderNumber}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || 'Failed to update order status.');
        }

        alert(`Order status updated to: ${newStatus}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update status.');
      } finally {
        setIsLoading(false);
      }
    },
    [orderNumber]
  );

  return (
    <main className="min-h-screen bg-fizzyo-charcoal text-white">
      <Navbar />
      <section className="container mx-auto px-6 pt-36 pb-16">
        <div className="max-w-2xl mx-auto rounded-2xl border border-white/10 bg-white/5 p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-white/40 mb-3">Manage Order</p>
          <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter uppercase mb-4">
            {orderNumber}
          </h1>
          <p className="text-white/70 mb-8">
            Update the order status below. This will be reflected on the customer's tracking page.
          </p>

          {error && (
            <div className="mb-6 rounded-xl border border-red-300/30 bg-red-500/20 px-4 py-3 text-red-100">
              {error}
            </div>
          )}

          <div className="space-y-3 mb-8">
            {STATUSES.map((status) => (
              <Button
                key={status.value}
                onClick={() => updateStatus(status.value)}
                disabled={isLoading}
                className="w-full rounded-full bg-fizzyo-purple hover:bg-fizzyo-purple/90 text-white px-6 py-5 uppercase text-xs font-bold tracking-widest disabled:opacity-70"
              >
                {isLoading ? 'Updating...' : `Set to ${status.label}`}
              </Button>
            ))}
          </div>

          <Button asChild variant="ghost" className="w-full rounded-full border border-white/20 hover:bg-white/10 text-white px-6 py-5 uppercase text-xs font-bold tracking-widest">
            <Link href="/shop">Back to Shop</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
