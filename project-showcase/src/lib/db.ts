import { db } from './firebase';

export type OrderStatus = 'pending' | 'prep' | 'out-for-delivery' | 'delivered';

export type CheckoutItemRecord = {
  id: number;
  name: string;
  subtitle: string;
  qty: number;
};

export type OrderRecord = {
  orderNumber: string;
  customerEmail: string;
  customerPhone: string;
  subtotal: number;
  status: OrderStatus;
  createdAt: number;
  statusUpdatedAt: number;
  items: CheckoutItemRecord[];
};

export type RatingRecord = {
  id: string;
  orderNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  rating: number;
  comment: string;
  createdAt: number;
};

// Initialize seed data on first load
let seedInitialized = false;

async function initializeSeedData() {
  if (seedInitialized) return;
  seedInitialized = true;

  try {
    const demoOrderNumber = 'FZY-DEMO0001';
    const now = Date.now() - 7 * 24 * 60 * 60 * 1000;

    // Check if demo order exists
    const orderDoc = await db.collection('orders').doc(demoOrderNumber).get();
    if (orderDoc.exists) return;

    // Create demo order
    await db.collection('orders').doc(demoOrderNumber).set({
      orderNumber: demoOrderNumber,
      customerEmail: 'demo.customer@fizzyo.com',
      customerPhone: '+201000000000',
      subtotal: 11.85,
      status: 'delivered',
      createdAt: now,
      statusUpdatedAt: now,
    });

    // Create demo order items
    await db.collection('orders').doc(demoOrderNumber).collection('items').add({
      id: 1,
      name: 'Cherry',
      subtitle: 'Blast',
      qty: 3,
    });

    // Create demo rating
    await db.collection('ratings').add({
      orderNumber: demoOrderNumber,
      firstName: 'Jessica',
      lastName: 'P.',
      email: 'demo.customer@fizzyo.com',
      rating: 5,
      comment: 'I am obsessed. Cherry feels nostalgic, cleaner than traditional soda, and became my daily can.',
      createdAt: now,
    });
  } catch (error) {
    console.error('Error initializing seed data:', error);
  }
}

// Initialize seed data
initializeSeedData();

export async function createOrderInDb(input: {
  orderNumber: string;
  customerEmail: string;
  customerPhone: string;
  subtotal: number;
  items: CheckoutItemRecord[];
}) {
  const now = Date.now();

  try {
    // Create order document
    await db.collection('orders').doc(input.orderNumber).set({
      orderNumber: input.orderNumber,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      subtotal: input.subtotal,
      status: 'pending',
      createdAt: now,
      statusUpdatedAt: now,
    });

    // Add items as subcollection
    const itemsRef = db.collection('orders').doc(input.orderNumber).collection('items');
    for (const item of input.items) {
      await itemsRef.add({
        id: item.id,
        name: item.name,
        subtitle: item.subtitle,
        qty: item.qty,
      });
    }

    return getOrderFromDb(input.orderNumber);
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

export async function getOrderFromDb(orderNumber: string): Promise<OrderRecord | null> {
  try {
    const orderDoc = await db.collection('orders').doc(orderNumber).get();

    if (!orderDoc.exists) {
      return null;
    }

    const orderData = orderDoc.data() as Omit<OrderRecord, 'items'>;

    // Get items from subcollection
    const itemsSnapshot = await db.collection('orders').doc(orderNumber).collection('items').get();
    const items: CheckoutItemRecord[] = [];

    itemsSnapshot.forEach((doc) => {
      const data = doc.data();
      items.push({
        id: data.id,
        name: data.name,
        subtitle: data.subtitle,
        qty: data.qty,
      });
    });

    return {
      ...orderData,
      items,
    } as OrderRecord;
  } catch (error) {
    console.error('Error getting order:', error);
    return null;
  }
}

export async function updateOrderStatusInDb(orderNumber: string, status: OrderStatus) {
  const now = Date.now();

  try {
    await db.collection('orders').doc(orderNumber).update({
      status,
      statusUpdatedAt: now,
    });

    return getOrderFromDb(orderNumber);
  } catch (error) {
    console.error('Error updating order status:', error);
    return null;
  }
}

export async function getAllOrdersFromDb() {
  try {
    const snapshot = await db.collection('orders').orderBy('createdAt', 'desc').get();
    const orders: OrderRecord[] = [];

    for (const doc of snapshot.docs) {
      const order = await getOrderFromDb(doc.id);
      if (order) {
        orders.push(order);
      }
    }

    return orders;
  } catch (error) {
    console.error('Error getting all orders:', error);
    return [];
  }
}

export async function hasValidOrderForRating(orderNumber: string, email: string) {
  try {
    const orderDoc = await db.collection('orders').doc(orderNumber).get();

    if (!orderDoc.exists) {
      return false;
    }

    const orderData = orderDoc.data();
    return orderData?.customerEmail?.toLowerCase() === email.trim().toLowerCase();
  } catch (error) {
    console.error('Error checking valid order:', error);
    return false;
  }
}

export async function createRatingInDb(input: {
  orderNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  rating: number;
  comment: string;
}) {
  const now = Date.now();

  try {
    const docRef = await db.collection('ratings').add({
      orderNumber: input.orderNumber,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      rating: input.rating,
      comment: input.comment,
      createdAt: now,
    });

    const ratingDoc = await docRef.get();
    const data = ratingDoc.data();

    return {
      id: ratingDoc.id,
      orderNumber: data?.orderNumber,
      firstName: data?.firstName,
      lastName: data?.lastName,
      email: data?.email,
      rating: data?.rating,
      comment: data?.comment,
      createdAt: data?.createdAt,
    } as RatingRecord;
  } catch (error) {
    console.error('Error creating rating:', error);
    throw error;
  }
}

export async function hasExistingRating(orderNumber: string, email: string) {
  try {
    const snapshot = await db
      .collection('ratings')
      .where('orderNumber', '==', orderNumber.trim())
      .where('email', '==', email.trim().toLowerCase())
      .limit(1)
      .get();

    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking existing rating:', error);
    return false;
  }
}

export async function hasExistingRatingForOrder(orderNumber: string) {
  try {
    const snapshot = await db
      .collection('ratings')
      .where('orderNumber', '==', orderNumber.trim())
      .limit(1)
      .get();

    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking existing rating for order:', error);
    return false;
  }
}

export async function listRatingsFromDb(limit = 3): Promise<RatingRecord[]> {
  try {
    const snapshot = await db.collection('ratings').orderBy('createdAt', 'desc').limit(limit).get();

    const ratings: RatingRecord[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      ratings.push({
        id: doc.id,
        orderNumber: data.orderNumber,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        rating: data.rating,
        comment: data.comment,
        createdAt: data.createdAt,
      });
    });

    return ratings;
  } catch (error) {
    console.error('Error listing ratings:', error);
    return [];
  }
}


