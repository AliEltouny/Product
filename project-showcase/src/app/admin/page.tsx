"use client";

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationHint, setVerificationHint] = useState<string | null>(null);

  const handleSendCode = async () => {
    setError(null);
    setVerificationHint(null);

    if (!username.trim()) {
      setError('Please enter a username.');
      return;
    }

    if (!password.trim()) {
      setError('Please enter a password.');
      return;
    }

    setIsSendingCode(true);
    try {
      const response = await fetch('/api/admin/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to send verification code.');
      }

      setCodeSent(true);
      if (data?.devCode) {
        setVerificationHint(`Dev mode code: ${data.devCode}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send verification code.');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerify = async () => {
    setError(null);

    if (!/^\d{6}$/.test(verificationCode.trim())) {
      setError('Verification code must be 6 digits.');
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, verificationCode }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Verification failed.');
      }

      // Store token and redirect to dashboard
      localStorage.setItem('adminToken', data.token);
      window.location.href = '/admin/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <main className="min-h-screen bg-fizzyo-charcoal text-white">
      <Navbar />
      <section className="container mx-auto px-6 pt-36 pb-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="uppercase tracking-[0.35em] text-white/40 text-xs mb-3">Admin Access</p>
            <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter uppercase">
              Admin Login
            </h1>
          </div>
          <Button asChild className="rounded-full bg-white text-fizzyo-charcoal hover:bg-white/90 px-6 py-6 uppercase text-xs font-bold tracking-widest">
            <a href="/">Back Home</a>
          </Button>
        </div>

        <div className="max-w-md mx-auto rounded-2xl border border-white/10 bg-white/5 p-8 space-y-6">
          {!codeSent ? (
            <>
              <div className="space-y-3">
                <label className="text-xs uppercase tracking-[0.2em] text-white/55 block">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="h-11 w-full rounded-xl border border-white/15 bg-black/20 px-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-fizzyo-purple"
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs uppercase tracking-[0.2em] text-white/55 block">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="h-11 w-full rounded-xl border border-white/15 bg-black/20 px-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-fizzyo-purple"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-300/30 bg-red-500/20 px-3 py-2 text-sm text-red-100">
                  {error}
                </div>
              )}

              <Button
                onClick={handleSendCode}
                disabled={isSendingCode}
                className="w-full rounded-full bg-fizzyo-purple hover:bg-fizzyo-purple/90 text-white py-5 uppercase text-xs font-bold tracking-widest disabled:opacity-70"
              >
                {isSendingCode ? 'Sending Code...' : 'Send Verification Code'}
              </Button>
              <p className="text-[11px] text-white/45">
                Verification code will be sent to alieltouny.contact@gmail.com
              </p>
            </>
          ) : (
            <>
              <div className="space-y-3 rounded-xl border border-green-300/20 bg-green-500/10 p-4">
                <p className="text-sm text-green-100">
                  ✓ Check your email for the verification code
                </p>
                <label className="text-xs uppercase tracking-[0.2em] text-green-100/80 block">
                  Verification Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit code"
                  className="h-10 w-full rounded-lg border border-green-200/30 bg-black/20 px-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-green-200"
                />
                {verificationHint && (
                  <p className="text-[11px] text-green-100/85">{verificationHint}</p>
                )}
              </div>

              {error && (
                <div className="rounded-xl border border-red-300/30 bg-red-500/20 px-3 py-2 text-sm text-red-100">
                  {error}
                </div>
              )}

              <Button
                onClick={handleVerify}
                disabled={isVerifying}
                className="w-full rounded-full bg-fizzyo-purple hover:bg-fizzyo-purple/90 text-white py-5 uppercase text-xs font-bold tracking-widest disabled:opacity-70"
              >
                {isVerifying ? 'Verifying...' : 'Verify & Login'}
              </Button>

              <Button
                onClick={() => {
                  setCodeSent(false);
                  setVerificationCode('');
                  setError(null);
                  setVerificationHint(null);
                }}
                variant="ghost"
                className="w-full text-white/60 hover:text-white"
              >
                Back
              </Button>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
