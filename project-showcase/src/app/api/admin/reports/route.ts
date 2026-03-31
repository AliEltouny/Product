import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

function getTokenParts(token: string) {
  const decoded = Buffer.from(token, 'base64').toString('utf-8');
  const parts = decoded.split(':');
  return {
    username: parts[0],
    email: parts[1],
    expiresAt: parseInt(parts[2], 10),
    hash: parts[3],
  };
}

function isTokenValid(token: string): boolean {
  try {
    const parts = getTokenParts(token);
    return parts.expiresAt > Date.now();
  } catch {
    return false;
  }
}

function getDayKey(date: Date): string {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

function getWeekKey(date: Date): string {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().split('T')[0]; // Monday of that week
}

function getMonthKey(date: Date): string {
  return date.toISOString().slice(0, 7); // YYYY-MM
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    if (!isTokenValid(token)) {
      return NextResponse.json(
        { error: 'Token expired' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'month'; // day, week, month, 6months, year

    const now = Date.now();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let startDate = new Date(today);
    let groupByFn: (date: Date) => string = getDayKey;

    switch (period) {
      case 'day':
        startDate = new Date(today);
        groupByFn = getDayKey;
        break;
      case 'week':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 7);
        groupByFn = getWeekKey;
        break;
      case 'month':
        startDate = new Date(today);
        startDate.setMonth(startDate.getMonth() - 1);
        groupByFn = getMonthKey;
        break;
      case '6months':
        startDate = new Date(today);
        startDate.setMonth(startDate.getMonth() - 6);
        groupByFn = getMonthKey;
        break;
      case 'year':
        startDate = new Date(today);
        startDate.setFullYear(startDate.getFullYear() - 1);
        groupByFn = getMonthKey;
        break;
    }

    const startTimestamp = startDate.getTime();

    // Fetch all orders
    const ordersSnapshot = await db
      .collection('orders')
      .where('createdAt', '>=', startTimestamp)
      .get();

    const groupedData: Record<string, { revenue: number; count: number; items: number }> = {};
    let totalRevenue = 0;
    let totalOrders = 0;
    let totalItems = 0;

    for (const orderDoc of ordersSnapshot.docs) {
      const orderData = orderDoc.data();
      const orderDate = new Date(orderData.createdAt);
      const groupKey = groupByFn(orderDate);

      if (!groupedData[groupKey]) {
        groupedData[groupKey] = { revenue: 0, count: 0, items: 0 };
      }

      const subtotal = Number(orderData.subtotal || 0);
      groupedData[groupKey].revenue += subtotal;
      groupedData[groupKey].count += 1;

      // Count items
      const itemsSnapshot = await db
        .collection('orders')
        .doc(orderDoc.id)
        .collection('items')
        .get();

      const itemCount = itemsSnapshot.docs.reduce((sum, doc) => {
        return sum + (doc.data().qty || 0);
      }, 0);

      groupedData[groupKey].items += itemCount;
      totalRevenue += subtotal;
      totalOrders += 1;
      totalItems += itemCount;
    }

    // Sort keys
    const sortedKeys = Object.keys(groupedData).sort();

    return NextResponse.json({
      period,
      startDate: startDate.toISOString(),
      endDate: new Date(now).toISOString(),
      totals: {
        revenue: totalRevenue,
        orders: totalOrders,
        items: totalItems,
        avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      },
      data: sortedKeys.map((key) => ({
        date: key,
        ...groupedData[key],
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}
