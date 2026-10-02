// Boreal Café Reactive Customer Cart Store
// Persisted to localStorage and synchronized across all components via custom events

export interface CartItem {
  id: string; // unique cart entry id
  menuId: string;
  name: string;
  price: number;
  category: string;
  quantity: number;
  customization?: string | undefined;
}

const KEY_CART = "boreal_cart_v1";

function emitCartUpdate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("boreal-cart-updated"));
  }
}

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY_CART);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function addToCart(item: {
  menuId: string;
  name: string;
  price: number;
  category?: string | undefined;
  customization?: string | undefined;
  quantity?: number | undefined;
}): CartItem[] {
  const current = getCart();
  const qty = item.quantity || 1;
  const existingIndex = current.findIndex(
    (c) => c.menuId === item.menuId && (c.customization || "") === (item.customization || ""),
  );

  let updated: CartItem[];
  if (existingIndex >= 0) {
    updated = current.map((c, i) =>
      i === existingIndex ? { ...c, quantity: c.quantity + qty } : c,
    );
  } else {
    const newItem: CartItem = {
      id: `cart-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      menuId: item.menuId,
      name: item.name,
      price: item.price,
      category: item.category || "Beverage",
      quantity: qty,
      customization: item.customization,
    };
    updated = [...current, newItem];
  }

  try {
    localStorage.setItem(KEY_CART, JSON.stringify(updated));
    emitCartUpdate();
  } catch (e) {
    console.error("Failed to save cart:", e);
  }
  return updated;
}

export function updateCartQuantity(cartItemId: string, delta: number): CartItem[] {
  const current = getCart();
  const updated = current
    .map((item) => {
      if (item.id === cartItemId) {
        const nextQty = item.quantity + delta;
        return nextQty > 0 ? { ...item, quantity: nextQty } : null;
      }
      return item;
    })
    .filter(Boolean) as CartItem[];

  try {
    localStorage.setItem(KEY_CART, JSON.stringify(updated));
    emitCartUpdate();
  } catch (e) {
    console.error("Failed to update cart quantity:", e);
  }
  return updated;
}

export function removeFromCart(cartItemId: string): CartItem[] {
  const current = getCart();
  const updated = current.filter((item) => item.id !== cartItemId);
  try {
    localStorage.setItem(KEY_CART, JSON.stringify(updated));
    emitCartUpdate();
  } catch (e) {
    console.error("Failed to remove item from cart:", e);
  }
  return updated;
}

export function clearCart(): void {
  try {
    localStorage.setItem(KEY_CART, "[]");
    emitCartUpdate();
  } catch (e) {
    console.error("Failed to clear cart:", e);
  }
}

export function getCartTotals(): {
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
} {
  const items = getCart();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Number((subtotal * 0.15).toFixed(2)); // 15% HST in Newfoundland and Labrador
  const total = Number((subtotal + tax).toFixed(2));
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    subtotal: Number(subtotal.toFixed(2)),
    tax,
    total,
    itemCount,
  };
}
