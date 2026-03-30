export type CartItem = {
  id: number;
  name: string;
  subtitle: string;
  color: string;
  qty: number;
};

const CART_STORAGE_KEY = 'fizzyo:cart';

function readStoredCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => typeof item.id === 'number' && typeof item.qty === 'number');
  } catch {
    return [];
  }
}

function writeStoredCart(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('cart:updated'));
}

export function getCartItems(): CartItem[] {
  return readStoredCart();
}

export function addCartItem(payload: Omit<CartItem, 'qty'>) {
  const items = readStoredCart();
  const existing = items.find((item) => item.id === payload.id);
  if (existing) {
    writeStoredCart(
      items.map((item) =>
        item.id === payload.id ? { ...item, qty: item.qty + 1 } : item
      )
    );
    return;
  }

  writeStoredCart([...items, { ...payload, qty: 1 }]);
}

export function decrementCartItem(id: number) {
  const items = readStoredCart()
    .map((item) => (item.id === id ? { ...item, qty: Math.max(0, item.qty - 1) } : item))
    .filter((item) => item.qty > 0);
  writeStoredCart(items);
}

export function removeCartItem(id: number) {
  writeStoredCart(readStoredCart().filter((item) => item.id !== id));
}

export function clearCart() {
  writeStoredCart([]);
}
