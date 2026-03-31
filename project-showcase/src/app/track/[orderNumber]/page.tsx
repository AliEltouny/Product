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
  
  // Cancel order state
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelingOrder, setIsCancelingOrder] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  
  // Not received complaint state
  const [showNotReceivedForm, setShowNotReceivedForm] = useState(false);
  const [notReceivedReason, setNotReceivedReason] = useState('');
  const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false);
  const [complaintSuccess, setComplaintSuccess] = useState(false);

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

  const submitCancelOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCancelingOrder(true);
    try {
      const response = await fetch(`/api/orders/${orderNumber}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to cancel order.');
      }

      setCancelSuccess(true);
      setCancelReason('');
      setShowCancelForm(false);
      setTimeout(() => setCancelSuccess(false), 5000);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to cancel order.');
    } finally {
      setIsCancelingOrder(false);
    }
  };

  const submitNotReceivedComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingComplaint(true);
    try {
      const response = await fetch(`/api/orders/${orderNumber}/complaint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'not_received', description: notReceivedReason }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to submit complaint.');
      }

      setComplaintSuccess(true);
      setNotReceivedReason('');
      setShowNotReceivedForm(false);
      setTimeout(() => setComplaintSuccess(false), 5000);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to submit complaint.');
    } finally {
      setIsSubmittingComplaint(false);
    }
  };

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
              ) : currentStatus === 'cancelled' ? (
                <p className="text-red-200 mb-8 rounded-lg bg-red-500/20 border border-red-300/30 p-3">This order has been cancelled. If you have any questions, please contact us.</p>
              ) : (
                <p className="text-white/70 mb-8">
                  Your order is {STATUSES[currentStatusIndex]?.label.toLowerCase()}. You will receive email updates as it progresses.
                </p>
              )}

              {currentStatus === 'delivered' && (
                <div className="space-y-4 mb-8">
                  <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                    <div id="rate-experience" />
                    <Button asChild className="w-full rounded-full bg-fizzyo-purple hover:bg-fizzyo-purple/90 text-white px-8 py-6 uppercase text-xs font-bold tracking-widest mb-3">
                      <Link href={`/rate/${orderNumber}`}>Rate Experience</Link>
                    </Button>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                    <div id="cancel-order" />
                    {cancelSuccess && (
                      <div className="mb-4 rounded-lg border border-green-300/30 bg-green-500/20 px-3 py-2 text-green-100 text-sm">
                        Cancellation request submitted. You will receive a confirmation email.
                      </div>
                    )}
                    {!showCancelForm ? (
                      <Button
                        onClick={() => setShowCancelForm(true)}
                        className="w-full rounded-full bg-red-600 hover:bg-red-700 text-white px-6 py-4 uppercase text-xs font-bold tracking-widest"
                      >
                        Cancel Order
                      </Button>
                    ) : (
                      <form onSubmit={submitCancelOrder} className="space-y-3">
                        <textarea
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          placeholder="Why do you want to cancel this order?"
                          className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-white/40 text-sm focus:outline-none focus:border-red-500 focus:bg-white/10"
                          rows={2}
                          required
                        />
                        <div className="flex gap-2">
                          <Button
                            type="submit"
                            disabled={isCancelingOrder || !cancelReason.trim()}
                            className="flex-1 rounded-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 uppercase text-xs font-bold tracking-widest disabled:opacity-70"
                          >
                            {isCancelingOrder ? 'Submitting...' : 'Submit'}
                          </Button>
                          <Button
                            type="button"
                            onClick={() => { setShowCancelForm(false); setCancelReason(''); }}
                            className="flex-1 rounded-full border border-white/20 hover:bg-white/10 text-white px-4 py-2 uppercase text-xs font-bold tracking-widest"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                    <div id="missing-order" />
                    {complaintSuccess && (
                      <div className="mb-4 rounded-lg border border-green-300/30 bg-green-500/20 px-3 py-2 text-green-100 text-sm">
                        Complaint submitted. We will investigate and contact you soon.
                      </div>
                    )}
                    {!showNotReceivedForm ? (
                      <Button
                        onClick={() => setShowNotReceivedForm(true)}
                        className="w-full rounded-full bg-orange-600 hover:bg-orange-700 text-white px-6 py-4 uppercase text-xs font-bold tracking-widest"
                      >
                        Did Not Receive Order
                      </Button>
                    ) : (
                      <form onSubmit={submitNotReceivedComplaint} className="space-y-3">
                        <textarea
                          value={notReceivedReason}
                          onChange={(e) => setNotReceivedReason(e.target.value)}
                          placeholder="Please describe the issue..."
                          className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-white/40 text-sm focus:outline-none focus:border-orange-500 focus:bg-white/10"
                          rows={2}
                          required
                        />
                        <div className="flex gap-2">
                          <Button
                            type="submit"
                            disabled={isSubmittingComplaint || !notReceivedReason.trim()}
                            className="flex-1 rounded-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 uppercase text-xs font-bold tracking-widest disabled:opacity-70"
                          >
                            {isSubmittingComplaint ? 'Submitting...' : 'Submit'}
                          </Button>
                          <Button
                            type="button"
                            onClick={() => { setShowNotReceivedForm(false); setNotReceivedReason(''); }}
                            className="flex-1 rounded-full border border-white/20 hover:bg-white/10 text-white px-4 py-2 uppercase text-xs font-bold tracking-widest"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    )}
                    <p className="text-xs text-white/60 mt-3">Contact: {CONTACT_PHONE}</p>
                  </div>
                </div>
              )}

              {currentStatus !== 'delivered' && currentStatus !== 'cancelled' && (
                <div className="mb-8 rounded-xl border border-white/10 bg-black/30 p-4">
                  <div id="cancel-order" />
                  {cancelSuccess && (
                    <div className="mb-4 rounded-lg border border-green-300/30 bg-green-500/20 px-3 py-2 text-green-100 text-sm">
                      Cancellation request submitted. You will receive a confirmation email.
                    </div>
                  )}
                  {!showCancelForm ? (
                    <Button
                      onClick={() => setShowCancelForm(true)}
                      className="w-full rounded-full bg-red-600 hover:bg-red-700 text-white px-6 py-4 uppercase text-xs font-bold tracking-widest"
                    >
                      Cancel Order
                    </Button>
                  ) : (
                    <form onSubmit={submitCancelOrder} className="space-y-3">
                      <textarea
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="Why do you want to cancel this order?"
                        className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-white/40 text-sm focus:outline-none focus:border-red-500 focus:bg-white/10"
                        rows={2}
                        required
                      />
                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          disabled={isCancelingOrder || !cancelReason.trim()}
                          className="flex-1 rounded-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 uppercase text-xs font-bold tracking-widest disabled:opacity-70"
                        >
                          {isCancelingOrder ? 'Submitting...' : 'Submit'}
                        </Button>
                        <Button
                          type="button"
                          onClick={() => { setShowCancelForm(false); setCancelReason(''); }}
                          className="flex-1 rounded-full border border-white/20 hover:bg-white/10 text-white px-4 py-2 uppercase text-xs font-bold tracking-widest"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
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
