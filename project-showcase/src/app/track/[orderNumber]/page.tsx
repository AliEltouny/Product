"use client";

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';

type TrackOrderPageProps = {
  params: Promise<{ orderNumber: string }>;
};

const STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'prep', label: 'Preparation' },
  { value: 'out-for-delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
];

const CONTACT_EMAIL = 'alieltouny.contact@gmail.com';
const CONTACT_PHONE = '+201199110023';

export default function TrackOrderPage({ params }: TrackOrderPageProps) {
  const [orderNumber, setOrderNumber] = useState('');
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => {
      setOrderNumber(p.orderNumber);
      fetchOrderStatus(p.orderNumber);
    });
  }, [params]);

  const fetchOrderStatus = async (orderNum: string) => {
    try {
      const response = await fetch(`/api/orders/${orderNum}`);
      if (response.ok) {
        const data = await response.json();
        setCurrentStatus(data.order?.status || 'pending');
        setStatusError(null);
      } else {
        setStatusError('Order not found yet. Please check again in a moment.');
      }
    } catch {
      setStatusError('Could not refresh order status.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!orderNumber) return;
    const interval = window.setInterval(() => {
      fetchOrderStatus(orderNumber);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [orderNumber]);

  const currentStatusIndex = STATUSES.findIndex((s) => s.value === currentStatus);

  return (
    <main className="min-h-screen bg-fizzyo-charcoal text-white">
      <Navbar />
      <section className="container mx-auto px-6 pt-36 pb-16">
        <div className="max-w-2xl mx-auto rounded-2xl border border-white/10 bg-white/5 p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-white/40 mb-3">Track Order</p>
          <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter uppercase mb-8">
            {orderNumber}
          </h1>

          {isLoading ? (
            <p className="text-white/70 mb-8">Loading order status...</p>
          ) : (
            <>
              <div className="mb-12">
                <div className="flex items-center justify-between mb-4">
                  {STATUSES.map((status, index) => {
                    const isActive = index <= currentStatusIndex;
                    return (
                      <div
                        key={status.value}
                        className="flex flex-col items-center gap-2"
                      >
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                            isActive
                              ? 'bg-fizzyo-purple text-white'
                              : 'bg-white/10 text-white/50'
                          }`}
                        >
                          {index + 1}
                        </div>
                        <p
                          className={`text-xs uppercase tracking-wider text-center whitespace-nowrap ${
                            isActive ? 'text-white font-semibold' : 'text-white/50'
                          }`}
                        >
                          {status.label}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center mb-2">
                  {STATUSES.map((_, index) => (
                    <React.Fragment key={index}>
                      <div
                        className={`h-1 flex-1 transition-all ${
                          index <= currentStatusIndex
                            ? 'bg-fizzyo-purple'
                            : 'bg-white/10'
                        }`}
                      />
                      {index < STATUSES.length - 1 && <div className="w-0" />}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/30 p-4 mb-8">
                <p className="text-sm text-white/70 mb-1">Current Status</p>
                <p className="text-2xl font-bold text-fizzyo-purple">
                  {STATUSES[currentStatusIndex]?.label || 'Unknown'}
                </p>
              </div>

              {statusError ? (
                <p className="text-white/70 mb-8">{statusError}</p>
              ) : (
                <p className="text-white/70 mb-8">
                  Your order is {STATUSES[currentStatusIndex]?.label.toLowerCase()}. You will receive email updates as it progresses.
                </p>
              )}

              {currentStatus === 'delivered' && (
                <div className="mb-8 rounded-xl border border-white/10 bg-black/30 p-4">
                  <div id="rate-experience" />
                  <Button asChild className="w-full rounded-full bg-fizzyo-purple hover:bg-fizzyo-purple/90 text-white px-8 py-6 uppercase text-xs font-bold tracking-widest mb-3">
                    <Link href={`/rate/${orderNumber}`}>Rate Experience</Link>
                  </Button>
                  <div id="missing-order" />
                  <a
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(CONTACT_EMAIL)}&su=${encodeURIComponent(`Did not receive order ${orderNumber}`)}&body=${encodeURIComponent(`Hello, I did not receive order ${orderNumber}.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block text-sm text-fizzyo-purple hover:text-fizzyo-purple/80 underline"
                  >
                    Did not receive order? Email us.
                  </a>
                  <p className="text-sm text-white/70 mt-2">Contact: {CONTACT_PHONE}</p>
                </div>
              )}

              <Button asChild className="w-full rounded-full bg-fizzyo-purple hover:bg-fizzyo-purple/90 text-white px-8 py-6 uppercase text-xs font-bold tracking-widest mb-3">
                <Link href="/shop">Back to Shop</Link>
              </Button>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
