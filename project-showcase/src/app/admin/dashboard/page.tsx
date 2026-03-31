"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

type Order = {
  orderNumber: string;
  customerEmail: string;
  customerPhone: string;
  subtotal: number;
  status: string;
  createdAt: number;
  items: Array<{ id: number; name: string; subtitle: string; qty: number }>;
};

type Review = {
  id: string;
  orderNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  rating: number;
  comment: string;
  createdAt: number;
};

type Issue = {
  id: string;
  orderNumber: string;
  type: string;
  description: string;
  status: string;
  createdAt: number;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'reviews' | 'issues'>('orders');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingIssueId, setUpdatingIssueId] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('adminToken');
    if (!storedToken) {
      router.push('/admin');
      return;
    }
    setToken(storedToken);
    fetchData(storedToken);
  }, [router]);

  const fetchData = async (authToken: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const [ordersRes, reviewsRes, issuesRes] = await Promise.all([
        fetch('/api/admin/orders', {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
        fetch('/api/admin/reviews', {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
        fetch('/api/admin/issues', {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
      ]);

      if (!ordersRes.ok || !reviewsRes.ok || !issuesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const ordersData = await ordersRes.json();
      const reviewsData = await reviewsRes.json();
      const issuesData = await issuesRes.json();

      setOrders(ordersData.orders || []);
      setReviews(reviewsData.ratings || []);
      setIssues(issuesData.issues || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!token) return;
    if (!confirm('Are you sure you want to delete this review?')) return;

    setDeletingId(reviewId);
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to delete review');
      }

      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete review');
    } finally {
      setDeletingId(null);
    }
  };

  const handleConfirmIssue = async (issueId: string, orderNumber: string, action: 'confirm' | 'deny') => {
    if (!token) return;

    setUpdatingIssueId(issueId);
    try {
      const response = await fetch(`/api/admin/issues/${issueId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ action, orderNumber }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} issue`);
      }

      // Update issue status locally
      setIssues((prev) =>
        prev.map((issue) =>
          issue.id === issueId ? { ...issue, status: action === 'confirm' ? 'confirmed' : 'denied' } : issue
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} issue`);
    } finally {
      setUpdatingIssueId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin');
  };

  if (!token) return null;

  return (
    <main className="min-h-screen bg-fizzyo-charcoal text-white">
      <Navbar />
      <section className="container mx-auto px-6 pt-36 pb-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="uppercase tracking-[0.35em] text-white/40 text-xs mb-3">Admin Panel</p>
            <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter uppercase">
              Dashboard
            </h1>
          </div>
          <Button
            onClick={handleLogout}
            className="rounded-full bg-red-500/20 border border-red-400/30 text-red-200 hover:bg-red-500/30 px-6 py-6 uppercase text-xs font-bold tracking-widest"
          >
            Logout
          </Button>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-300/30 bg-red-500/20 px-6 py-4 text-red-100 mb-6">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-xs transition-all ${
                activeTab === 'orders'
                  ? 'bg-fizzyo-purple text-white'
                  : 'bg-white/10 text-white/60 hover:text-white'
              }`}
            >
              Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-xs transition-all ${
                activeTab === 'reviews'
                  ? 'bg-fizzyo-purple text-white'
                  : 'bg-white/10 text-white/60 hover:text-white'
              }`}
            >
              Reviews ({reviews.length})
            </button>
            <button
              onClick={() => setActiveTab('issues')}
              className={`px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-xs transition-all ${
                activeTab === 'issues'
                  ? 'bg-fizzyo-purple text-white'
                  : 'bg-white/10 text-white/60 hover:text-white'
              }`}
            >
              Issues ({issues.length})
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-white/60">Loading...</p>
            </div>
          ) : activeTab === 'orders' ? (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                  <p className="text-white/60">No orders yet.</p>
                </div>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.orderNumber}
                    className="rounded-2xl border border-white/10 bg-white/5 p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold">{order.orderNumber}</h3>
                        <p className="text-sm text-white/60">{order.customerEmail}</p>
                        <p className="text-sm text-white/60">{order.customerPhone}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">${Number(order.subtotal || 0).toFixed(2)}</p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mt-2 ${
                            order.status === 'delivered'
                              ? 'bg-green-500/20 text-green-200'
                              : order.status === 'out-for-delivery'
                              ? 'bg-blue-500/20 text-blue-200'
                              : order.status === 'prep'
                              ? 'bg-yellow-500/20 text-yellow-200'
                              : order.status === 'cancelled'
                              ? 'bg-red-500/20 text-red-200'
                              : 'bg-gray-500/20 text-gray-200'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-white/50 mb-2">Items:</p>
                      <ul className="text-sm text-white/70 space-y-1">
                        {(Array.isArray(order.items) ? order.items : []).map((item) => (
                          <li key={item.id}>
                            {item.name} {item.subtitle} x{item.qty}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <p className="text-xs text-white/40 mt-4">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          ) : activeTab === 'reviews' ? (
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                  <p className="text-white/60">No reviews yet.</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-6 relative"
                  >
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      disabled={deletingId === review.id}
                      className="absolute top-4 right-4 p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-200 disabled:opacity-50"
                      aria-label="Delete review"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-bold">
                          {review.firstName} {review.lastName}
                        </p>
                        <div className="flex gap-1">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <span key={i} className="text-yellow-400">
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-white/60">{review.email}</p>
                      <p className="text-sm text-white/60">Order: {review.orderNumber}</p>
                    </div>
                    <p className="text-white/80 mb-4">{review.comment}</p>
                    <p className="text-xs text-white/40">
                      {new Date(review.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {issues.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                  <p className="text-white/60">No issues reported.</p>
                </div>
              ) : (
                issues.map((issue) => (
                  <div
                    key={issue.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold">Order {issue.orderNumber}</h3>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mt-2 ${
                            issue.type === 'cancellation'
                              ? 'bg-red-500/20 text-red-200'
                              : issue.type === 'not_received'
                              ? 'bg-orange-500/20 text-orange-200'
                              : 'bg-gray-500/20 text-gray-200'
                          }`}
                        >
                          {issue.type === 'cancellation' ? 'Cancellation' : issue.type === 'not_received' ? 'Not Received' : issue.type}
                        </span>
                        <span
                          className={`inline-block ml-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mt-2 ${
                            issue.status === 'pending' || issue.status === 'admin-initiated'
                              ? 'bg-yellow-500/20 text-yellow-200'
                              : issue.status === 'confirmed'
                              ? 'bg-green-500/20 text-green-200'
                              : 'bg-gray-500/20 text-gray-200'
                          }`}
                        >
                          {issue.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-white/80 mb-4">{issue.description}</p>
                    {(issue.status === 'pending' || issue.status === 'admin-initiated') && (
                      <div className="flex gap-2 mb-4">
                        <button
                          onClick={() => handleConfirmIssue(issue.id, issue.orderNumber, 'confirm')}
                          disabled={updatingIssueId === issue.id}
                          className="flex-1 rounded-lg bg-green-600 hover:bg-green-700 text-white px-3 py-2 text-xs font-bold uppercase tracking-widest disabled:opacity-70"
                        >
                          {updatingIssueId === issue.id ? 'Updating...' : 'Confirm'}
                        </button>
                        <button
                          onClick={() => handleConfirmIssue(issue.id, issue.orderNumber, 'deny')}
                          disabled={updatingIssueId === issue.id}
                          className="flex-1 rounded-lg bg-red-600 hover:bg-red-700 text-white px-3 py-2 text-xs font-bold uppercase tracking-widest disabled:opacity-70"
                        >
                          {updatingIssueId === issue.id ? 'Updating...' : 'Deny'}
                        </button>
                      </div>
                    )}
                    <p className="text-xs text-white/40">
                      Reported: {new Date(issue.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
