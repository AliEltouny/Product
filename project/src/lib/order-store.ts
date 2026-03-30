import {
  createOrderInDb,
  getAllOrdersFromDb,
  getOrderFromDb,
  type OrderStatus,
  updateOrderStatusInDb,
} from '@/lib/db';

type Order = {
  orderNumber: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{ id: number; name: string; subtitle: string; qty: number }>;
  subtotal: number;
  status: OrderStatus;
  createdAt: number;
  statusUpdatedAt: number;
};

export async function createOrder(order: Omit<Order, 'createdAt' | 'statusUpdatedAt' | 'status'>) {
  return createOrderInDb(order);
}

export async function getOrder(orderNumber: string) {
  return getOrderFromDb(orderNumber);
}

export async function updateOrderStatus(orderNumber: string, status: OrderStatus) {
  return updateOrderStatusInDb(orderNumber, status);
}

export async function getAllOrders() {
  return getAllOrdersFromDb();
}
