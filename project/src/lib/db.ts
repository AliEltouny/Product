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
  id: number;
  orderNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  rating: number;
  comment: string;
  createdAt: number;
};

let dbInstance: Database.Database | null = null;

function getDb() {
  if (dbInstance) return dbInstance;

  const dataDir = path.join(process.cwd(), 'data');
  fs.mkdirSync(dataDir, { recursive: true });

  const dbPath = path.join(dataDir, 'fizzyo.sqlite');
  const db = new Database(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      order_number TEXT PRIMARY KEY,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      subtotal REAL NOT NULL,
      status TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      status_updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT NOT NULL,
      item_id INTEGER NOT NULL,
      item_name TEXT NOT NULL,
      item_subtitle TEXT NOT NULL,
      qty INTEGER NOT NULL,
      FOREIGN KEY(order_number) REFERENCES orders(order_number)
    );

    CREATE TABLE IF NOT EXISTS ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      UNIQUE(order_number, email)
    );
  `);

  dbInstance = db;
  seedDemoRating(db);
  return db;
}

export function createOrderInDb(input: {
  orderNumber: string;
  customerEmail: string;
  customerPhone: string;
  subtotal: number;
  items: CheckoutItemRecord[];
}) {
  const db = getDb();
  const now = Date.now();

  const insertOrder = db.prepare(`
    INSERT INTO orders (order_number, customer_email, customer_phone, subtotal, status, created_at, status_updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertItem = db.prepare(`
    INSERT INTO order_items (order_number, item_id, item_name, item_subtitle, qty)
    VALUES (?, ?, ?, ?, ?)
  `);

  const tx = db.transaction(() => {
    insertOrder.run(
      input.orderNumber,
      input.customerEmail,
      input.customerPhone,
      input.subtotal,
      'pending',
      now,
      now
    );

    for (const item of input.items) {
      insertItem.run(input.orderNumber, item.id, item.name, item.subtitle, item.qty);
    }
  });

  tx();
  return getOrderFromDb(input.orderNumber);
}

export function getOrderFromDb(orderNumber: string): OrderRecord | null {
  const db = getDb();
  const orderRow = db
    .prepare(
      `SELECT order_number, customer_email, customer_phone, subtotal, status, created_at, status_updated_at
       FROM orders WHERE order_number = ?`
    )
    .get(orderNumber) as
    | {
        order_number: string;
        customer_email: string;
        customer_phone: string;
        subtotal: number;
        status: OrderStatus;
        created_at: number;
        status_updated_at: number;
      }
    | undefined;

  if (!orderRow) return null;

  const items = db
    .prepare(
      `SELECT item_id, item_name, item_subtitle, qty
       FROM order_items WHERE order_number = ? ORDER BY id ASC`
    )
    .all(orderNumber) as Array<{
    item_id: number;
    item_name: string;
    item_subtitle: string;
    qty: number;
  }>;

  return {
    orderNumber: orderRow.order_number,
    customerEmail: orderRow.customer_email,
    customerPhone: orderRow.customer_phone,
    subtotal: Number(orderRow.subtotal),
    status: orderRow.status,
    createdAt: orderRow.created_at,
    statusUpdatedAt: orderRow.status_updated_at,
    items: items.map((item) => ({
      id: item.item_id,
      name: item.item_name,
      subtitle: item.item_subtitle,
      qty: item.qty,
    })),
  };
}

export function updateOrderStatusInDb(orderNumber: string, status: OrderStatus) {
  const db = getDb();
  const now = Date.now();
  const result = db
    .prepare(`UPDATE orders SET status = ?, status_updated_at = ? WHERE order_number = ?`)
    .run(status, now, orderNumber);

  if (result.changes === 0) return null;
  return getOrderFromDb(orderNumber);
}

export function getAllOrdersFromDb() {
  const db = getDb();
  const rows = db
    .prepare(`SELECT order_number FROM orders ORDER BY created_at DESC`)
    .all() as Array<{ order_number: string }>;

  return rows
    .map((row) => getOrderFromDb(row.order_number))
    .filter((row): row is OrderRecord => Boolean(row));
}

export function hasValidOrderForRating(orderNumber: string, email: string) {
  const db = getDb();
  const row = db
    .prepare(`SELECT order_number FROM orders WHERE order_number = ? AND LOWER(customer_email) = LOWER(?)`)
    .get(orderNumber.trim(), email.trim());
  return Boolean(row);
}

export function createRatingInDb(input: {
  orderNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  rating: number;
  comment: string;
}) {
  const db = getDb();
  const now = Date.now();

  const result = db
    .prepare(
      `INSERT INTO ratings (order_number, first_name, last_name, email, rating, comment, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      input.orderNumber,
      input.firstName,
      input.lastName,
      input.email,
      input.rating,
      input.comment,
      now
    );

  return db
    .prepare(
      `SELECT id, order_number, first_name, last_name, email, rating, comment, created_at
       FROM ratings WHERE id = ?`
    )
    .get(result.lastInsertRowid) as {
    id: number;
    order_number: string;
    first_name: string;
    last_name: string;
    email: string;
    rating: number;
    comment: string;
    created_at: number;
  };
}

export function hasExistingRating(orderNumber: string, email: string) {
  const db = getDb();
  const row = db
    .prepare(`SELECT id FROM ratings WHERE order_number = ? AND LOWER(email) = LOWER(?)`)
    .get(orderNumber.trim(), email.trim());
  return Boolean(row);
}

export function hasExistingRatingForOrder(orderNumber: string) {
  const db = getDb();
  const row = db
    .prepare(`SELECT id FROM ratings WHERE order_number = ?`)
    .get(orderNumber.trim());
  return Boolean(row);
}

export function listRatingsFromDb(limit = 3): RatingRecord[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT id, order_number, first_name, last_name, email, rating, comment, created_at
       FROM ratings ORDER BY created_at DESC LIMIT ?`
    )
    .all(limit) as Array<{
    id: number;
    order_number: string;
    first_name: string;
    last_name: string;
    email: string;
    rating: number;
    comment: string;
    created_at: number;
  }>;

  return rows.map((row) => ({
    id: row.id,
    orderNumber: row.order_number,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
  }));
}

function seedDemoRating(db: Database.Database) {
  const ratingCount = db.prepare('SELECT COUNT(*) as count FROM ratings').get() as { count: number };
  if (ratingCount.count > 0) return;

  const demoOrderNumber = 'FZY-DEMO0001';
  const now = Date.now() - 7 * 24 * 60 * 60 * 1000;

  db.prepare(
    `INSERT OR IGNORE INTO orders (order_number, customer_email, customer_phone, subtotal, status, created_at, status_updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(demoOrderNumber, 'demo.customer@fizzyo.com', '+201000000000', 11.85, 'delivered', now, now);

  db.prepare(
    `INSERT OR IGNORE INTO order_items (order_number, item_id, item_name, item_subtitle, qty)
     VALUES (?, ?, ?, ?, ?)`
  ).run(demoOrderNumber, 1, 'Cherry', 'Blast', 3);

  db.prepare(
    `INSERT INTO ratings (order_number, first_name, last_name, email, rating, comment, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    demoOrderNumber,
    'Jessica',
    'P.',
    'demo.customer@fizzyo.com',
    5,
    'I am obsessed. Cherry feels nostalgic, cleaner than traditional soda, and became my daily can.',
    now
  );
}
