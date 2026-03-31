"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Minus, Plus, Trash2, X } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  clearCart,
  decrementCartItem,
  incrementCartItem,
  getCartItems,
  removeCartItem,
  type CartItem,
} from '@/lib/cart';

const PRICE_PER_ITEM = 3.95;

const productImages: Record<number, string> = {
  1: 'https://braszseedmeagubxkkyp.supabase.co/storage/v1/object/public/Products/Cherry%201.png?v=4',
  2: 'https://braszseedmeagubxkkyp.supabase.co/storage/v1/object/public/Products/Grape%201.png?v=4',
  3: 'https://braszseedmeagubxkkyp.supabase.co/storage/v1/object/public/Products/Orange%201.png?v=4',
};

export default function ShopPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'instapay'>('cash');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [instapayId, setInstapayId] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [verificationHint, setVerificationHint] = useState<string | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState<{
    orderNumber: string;
    eta: string;
    trackingUrl: string;
    emailSent?: boolean;
  } | null>(null);

  useEffect(() => {
    const syncCart = () => setItems(getCartItems());
    syncCart();
    window.addEventListener('cart:updated', syncCart as EventListener);
    return () => window.removeEventListener('cart:updated', syncCart as EventListener);
  }, []);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.qty * PRICE_PER_ITEM, 0),
    [items]
  );

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.qty, 0),
    [items]
  );

  const handleSendCode = async () => {
    setCheckoutError(null);
    setVerificationHint(null);

    if (!isValidEmail(email)) {
      setCheckoutError('Enter a valid email first.');
      return;
    }

    if (!isValidPhone(phone)) {
      setCheckoutError('Enter a valid phone number first.');
      return;
    }

    const paymentValidationError = validatePaymentInputs({
      paymentMethod,
      cardNumber,
      cardExpiry,
      cardCvv,
      instapayId,
    });
    if (paymentValidationError) {
      setCheckoutError(paymentValidationError);
      return;
    }

    setIsSendingCode(true);
    try {
      const response = await fetch('/api/checkout/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to send verification code.');
      }
      setCodeSent(true);
      if (data?.devCode) {
        setVerificationHint(`Dev mode code: ${data.devCode}`);
      }
      if (data?.warning) {
        setVerificationHint((prev) => `${prev ? `${prev} | ` : ''}${data.warning}`);
      }
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Failed to send verification code.');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handlePlaceOrder = async () => {
    setCheckoutError(null);

    if (!codeSent) {
      setCheckoutError('Please request and receive your verification code first.');
      return;
    }

    if (!/^\d{6}$/.test(verificationCode.trim())) {
      setCheckoutError('Verification code must be 6 digits.');
      return;
    }

    setIsPlacingOrder(true);
    try {
      const response = await fetch('/api/checkout/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          phone,
          verificationCode,
          paymentMethod,
          cardNumber,
          cardExpiry,
          cardCvv,
          instapayId,
          items,
          subtotal,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to place order.');
      }

      setCheckoutSuccess({
        orderNumber: data.orderNumber,
        eta: data.eta,
        trackingUrl: data.trackingUrl,
        emailSent: data.emailSent,
      });
      clearCart();
      setVerificationCode('');
      setCodeSent(false);
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Failed to place order.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <main className="min-h-screen bg-fizzyo-charcoal text-white">
      <Navbar />
      <section className="container mx-auto px-6 pt-36 pb-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="uppercase tracking-[0.35em] text-white/40 text-xs mb-3">Checkout</p>
            <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter uppercase">Shop Now</h1>
          </div>
          <Button asChild className="rounded-full bg-white text-fizzyo-charcoal hover:bg-white/90 px-6 py-6 uppercase text-xs font-bold tracking-widest">
            <Link href="/">Back Home</Link>
          </Button>
        </div>

        {items.length === 0 && !checkoutSuccess ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
            <p className="text-xl text-white/80 mb-6">Your cart is empty.</p>
            <Button asChild className="rounded-full bg-fizzyo-purple hover:bg-fizzyo-purple/90 text-white px-8 py-6 uppercase text-xs font-bold tracking-widest">
              <Link href="/">Add Items</Link>
            </Button>
          </div>
        ) : items.length === 0 && checkoutSuccess ? (
          <div className="max-w-2xl mx-auto rounded-2xl border border-green-300/30 bg-green-500/20 px-6 py-6 text-green-100 relative">
            <button
              type="button"
              onClick={() => setCheckoutSuccess(null)}
              className="absolute right-3 top-3 rounded-md p-1 hover:bg-green-400/20"
              aria-label="Dismiss order success"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="pr-8">
              <p className="font-semibold flex items-center gap-2 mb-2"><CheckCircle2 className="h-4 w-4" />Successfully ordered. Check your email for confirmation and updates.</p>
              <p>Order: {checkoutSuccess.orderNumber}</p>
              <p>ETA: {checkoutSuccess.eta}</p>
              {checkoutSuccess.emailSent === false && (
                <p className="text-[11px] mt-1">
                  SMTP not configured: confirmation email skipped in development mode.
                </p>
              )}
              <div className="flex gap-2 mt-4">
                <a
                  href={checkoutSuccess.trackingUrl}
                  className="inline-block rounded-full bg-white text-fizzyo-charcoal px-3 py-1.5 text-xs font-bold uppercase tracking-widest"
                >
                  Track Order
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
            <div className="space-y-4">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 pr-24 flex items-center gap-5 transition-[margin-right] duration-300 hover:mr-[72px]"
                >
                  <img
                    src={productImages[item.id]}
                    alt={`${item.name} ${item.subtitle}`}
                    className="h-24 w-24 object-contain rounded-lg bg-black/40"
                  />
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-headline font-bold uppercase tracking-tight">{item.name}</h2>
                    <p className="text-white/60 uppercase tracking-widest text-xs">{item.subtitle}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white/50 absolute right-8 top-1/2 -translate-y-1/2 transition-[right] duration-300 group-hover:right-20">x{item.qty}</p>
                    <p className="text-lg font-bold">${(item.qty * PRICE_PER_ITEM).toFixed(2)}</p>
                    <p className="text-xs text-white/50">${PRICE_PER_ITEM.toFixed(2)} each</p>
                  </div>

                  <div className="absolute inset-y-0 right-0 flex w-[104px] translate-x-full transition-transform duration-300 group-hover:translate-x-0">
                    <button
                      type="button"
                      aria-label={`Increase ${item.name}`}
                      onClick={() => incrementCartItem(item.id)}
                      className="flex-1 bg-white/5 hover:bg-white/10 flex items-center justify-center"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Decrease ${item.name}`}
                      onClick={() => decrementCartItem(item.id)}
                      className="flex-1 bg-white/5 hover:bg-white/10 flex items-center justify-center"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${item.name}`}
                      onClick={() => removeCartItem(item.id)}
                      className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-200 flex items-center justify-center"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <aside className="rounded-2xl border border-white/10 bg-white/5 p-6 sticky top-28 space-y-5">
              <h3 className="text-2xl font-headline font-bold uppercase mb-6">Order Summary</h3>
              <Button
                onClick={() => document.querySelector('aside')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full rounded-full bg-fizzyo-purple hover:bg-fizzyo-purple/90 text-white py-5 uppercase text-xs font-bold tracking-widest lg:hidden"
              >
                Proceed to Checkout
              </Button>
              <div className="flex items-center justify-between text-white/80 mb-3">
                <span>Items</span>
                <span>{totalItems}</span>
              </div>
              <div className="flex items-center justify-between text-xl font-bold mb-6">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <div className="space-y-3">
                <label className="text-xs uppercase tracking-[0.2em] text-white/55 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="h-11 w-full rounded-xl border border-white/15 bg-black/20 px-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-fizzyo-purple"
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs uppercase tracking-[0.2em] text-white/55 block">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+201234567890"
                  className="h-11 w-full rounded-xl border border-white/15 bg-black/20 px-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-fizzyo-purple"
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs uppercase tracking-[0.2em] text-white/55 block">Payment Method</label>
                <Select value={paymentMethod} onValueChange={(value: 'cash' | 'card' | 'instapay') => setPaymentMethod(value)}>
                  <SelectTrigger className="h-11 rounded-xl border-white/15 bg-black/20 text-white placeholder:text-white/35 focus:ring-fizzyo-purple focus:ring-offset-0">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent className="border-white/15 bg-fizzyo-charcoal text-white">
                    <SelectItem value="cash" className="focus:bg-white/10 focus:text-white">Cash on Delivery</SelectItem>
                    <SelectItem value="card" className="focus:bg-white/10 focus:text-white">Card</SelectItem>
                    <SelectItem value="instapay" className="focus:bg-white/10 focus:text-white">InstaPay</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentMethod === 'card' && (
                <div className="space-y-3 rounded-xl border border-white/10 p-3 bg-black/20">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/55">Card Details</p>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cardNumber}
                    onChange={(event) => setCardNumber(formatCardNumber(event.target.value))}
                    placeholder="1234 5678 9012 3456"
                    className="h-10 w-full rounded-lg border border-white/15 bg-black/20 px-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-fizzyo-purple"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={cardExpiry}
                      onChange={(event) => setCardExpiry(formatCardExpiry(event.target.value))}
                      placeholder="MM/YY"
                      className="h-10 w-full rounded-lg border border-white/15 bg-black/20 px-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-fizzyo-purple"
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      value={cardCvv}
                      onChange={(event) => setCardCvv(event.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="CVV"
                      className="h-10 w-full rounded-lg border border-white/15 bg-black/20 px-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-fizzyo-purple"
                    />
                  </div>
                  <p className="text-[11px] text-white/45">Fake card details are accepted, but format must be valid.</p>
                </div>
              )}

              {paymentMethod === 'instapay' && (
                <div className="space-y-3 rounded-xl border border-white/10 p-3 bg-black/20">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/55">InstaPay Details</p>
                  <input
                    type="text"
                    value={instapayId}
                    onChange={(event) => setInstapayId(event.target.value.trimStart())}
                    placeholder="instapay.user_123"
                    className="h-10 w-full rounded-lg border border-white/15 bg-black/20 px-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-fizzyo-purple"
                  />
                  <p className="text-[11px] text-white/45">Use letters, numbers, dot, underscore or dash (4-40 chars).</p>
                </div>
              )}

              <div className="space-y-2">
                <Button
                  onClick={handleSendCode}
                  disabled={isSendingCode || isPlacingOrder}
                  className="w-full rounded-full bg-white text-fizzyo-charcoal hover:bg-white/90 py-5 uppercase text-xs font-bold tracking-widest disabled:opacity-70"
                >
                  {isSendingCode ? 'Sending Code...' : 'Send Verification Code'}
                </Button>
                <p className="text-[11px] text-white/45">
                  Verification email sender: verifyemaildesd@gmail.com
                </p>
              </div>

              {codeSent && (
                <div className="space-y-3 rounded-xl border border-green-300/20 bg-green-500/10 p-3">
                  <label className="text-xs uppercase tracking-[0.2em] text-green-100/80 block">Verification Code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={verificationCode}
                    onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="6-digit code"
                    className="h-10 w-full rounded-lg border border-green-200/30 bg-black/20 px-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-green-200"
                  />
                  {verificationHint && (
                    <p className="text-[11px] text-green-100/85">{verificationHint}</p>
                  )}
                </div>
              )}

              {checkoutError && (
                <div className="rounded-xl border border-red-300/30 bg-red-500/20 px-3 py-2 text-sm text-red-100">
                  {checkoutError}
                </div>
              )}

              {checkoutSuccess && (
                <div className="rounded-xl border border-green-300/30 bg-green-500/20 px-3 py-3 text-sm text-green-100 relative">
                  <button
                    type="button"
                    onClick={() => setCheckoutSuccess(null)}
                    className="absolute right-2 top-2 rounded-md p-1 hover:bg-green-400/20"
                    aria-label="Dismiss order success"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="pr-7">
                    <p className="font-semibold flex items-center gap-2 mb-1"><CheckCircle2 className="h-4 w-4" />Successfully ordered. Check your email for confirmation and updates.</p>
                    <p>Order: {checkoutSuccess.orderNumber}</p>
                    <p>ETA: {checkoutSuccess.eta}</p>
                    {checkoutSuccess.emailSent === false && (
                      <p className="text-[11px] mt-1">
                        SMTP not configured: confirmation email skipped in development mode.
                      </p>
                    )}
                    <div className="flex gap-2 mt-3">
                      <a
                        href={checkoutSuccess.trackingUrl}
                        className="inline-block rounded-full bg-white text-fizzyo-charcoal px-3 py-1.5 text-xs font-bold uppercase tracking-widest"
                      >
                        Track Order
                      </a>
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || isSendingCode || items.length === 0}
                className="w-full rounded-full bg-fizzyo-purple hover:bg-fizzyo-purple/90 text-white py-6 uppercase text-xs font-bold tracking-widest disabled:opacity-70"
              >
                {isPlacingOrder ? 'Processing Order...' : 'Confirm & Place Order'}
              </Button>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidPhone(value: string) {
  return /^[+]?\d{8,15}$/.test(value.replace(/\s+/g, ''));
}

function validatePaymentInputs(params: {
  paymentMethod: 'cash' | 'card' | 'instapay';
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  instapayId: string;
}) {
  if (params.paymentMethod === 'card') {
    const cardDigits = params.cardNumber.replace(/\s+/g, '');
    if (!/^\d{16}$/.test(cardDigits)) return 'Card number must be 16 digits.';
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(params.cardExpiry)) return 'Card expiry must be MM/YY.';
    if (!/^\d{3,4}$/.test(params.cardCvv)) return 'Card CVV must be 3 or 4 digits.';
  }

  if (params.paymentMethod === 'instapay') {
    if (!/^([a-zA-Z0-9._-]{4,40})$/.test(params.instapayId.trim())) {
      return 'InstaPay ID format is invalid.';
    }
  }

  return null;
}

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatCardExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}
