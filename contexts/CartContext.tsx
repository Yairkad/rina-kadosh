"use client";

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
  useCallback,
  type ReactNode,
} from "react";

const STORAGE_KEY = "rina-kadosh-cart";
const EXPIRY_DAYS = 7;

// ── Types ──────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;           // product_id or bundle_id
  name: string;
  price_per_unit: number;
  quantity: number;
  subtotal: number;
  image: string | null;
  is_bundle: boolean;
  min_type: "units" | "amount" | null;
  min_value: number | null;
  event_slug: string;
  style_slug: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "subtotal"> }
  | { type: "REMOVE_ITEM"; id: string }
  | { type: "UPDATE_QTY"; id: string; quantity: number }
  | { type: "CLEAR" }
  | { type: "OPEN_DRAWER" }
  | { type: "CLOSE_DRAWER" }
  | { type: "LOAD"; items: CartItem[] };

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  totalAmount: number;
  addItem: (item: Omit<CartItem, "subtotal">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => ValidationResult;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  validateItem: (item: Pick<CartItem, "price_per_unit" | "min_type" | "min_value">, quantity: number) => ValidationResult;
  hasSavedCart: boolean;
  dismissRecovery: () => void;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function validate(
  item: Pick<CartItem, "price_per_unit" | "min_type" | "min_value">,
  quantity: number
): ValidationResult {
  if (!item.min_type || !item.min_value) return { valid: true };
  if (item.min_type === "units" && quantity < item.min_value) {
    return { valid: false, error: `מינימום הזמנה: ${item.min_value} יחידות` };
  }
  if (item.min_type === "amount" && quantity * item.price_per_unit < item.min_value) {
    return { valid: false, error: `מינימום הזמנה: ₪${item.min_value}` };
  }
  return { valid: true };
}

function calcSubtotal(price: number, qty: number) {
  return Math.round(price * qty * 100) / 100;
}

// ── Reducer ────────────────────────────────────────────────────────────────

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "LOAD":
      return { ...state, items: action.items };

    case "ADD_ITEM": {
      const { payload } = action;
      const existing = state.items.find((i) => i.id === payload.id);
      let items: CartItem[];
      if (existing && !payload.is_bundle) {
        const newQty = existing.quantity + payload.quantity;
        items = state.items.map((i) =>
          i.id === payload.id
            ? { ...i, quantity: newQty, subtotal: calcSubtotal(i.price_per_unit, newQty) }
            : i
        );
      } else {
        items = [
          ...state.items,
          { ...payload, subtotal: calcSubtotal(payload.price_per_unit, payload.quantity) },
        ];
      }
      return { ...state, items, isOpen: true };
    }

    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };

    case "UPDATE_QTY": {
      const items = state.items.map((i) =>
        i.id === action.id
          ? { ...i, quantity: action.quantity, subtotal: calcSubtotal(i.price_per_unit, action.quantity) }
          : i
      );
      return { ...state, items };
    }

    case "CLEAR":
      return { ...state, items: [] };

    case "OPEN_DRAWER":
      return { ...state, isOpen: true };

    case "CLOSE_DRAWER":
      return { ...state, isOpen: false };

    default:
      return state;
  }
}

// ── Persistence ────────────────────────────────────────────────────────────

function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ items, savedAt: Date.now() })
    );
  } catch {}
}

function loadCart(): CartItem[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const { items, savedAt } = JSON.parse(raw);
    if (Date.now() - savedAt > EXPIRY_DAYS * 86400 * 1000) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return items as CartItem[];
  } catch {
    return null;
  }
}

// ── Context ────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [], isOpen: false });
  const [hasSavedCart, setHasSavedCart] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadCart();
    if (saved && saved.length > 0) {
      dispatch({ type: "LOAD", items: saved });
      setHasSavedCart(true);
    }
    setInitialized(true);
  }, []);

  // Persist on every change (after init)
  useEffect(() => {
    if (!initialized) return;
    saveCart(state.items);
  }, [state.items, initialized]);

  const addItem = useCallback((item: Omit<CartItem, "subtotal">) => {
    dispatch({ type: "ADD_ITEM", payload: item });
  }, []);

  const removeItem = useCallback((id: string) => {
    dispatch({ type: "REMOVE_ITEM", id });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number): ValidationResult => {
    const item = state.items.find((i) => i.id === id);
    if (!item) return { valid: false };
    const result = validate(item, quantity);
    if (result.valid) dispatch({ type: "UPDATE_QTY", id, quantity });
    return result;
  }, [state.items]);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR" });
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  const openDrawer = useCallback(() => dispatch({ type: "OPEN_DRAWER" }), []);
  const closeDrawer = useCallback(() => dispatch({ type: "CLOSE_DRAWER" }), []);

  const validateItem = useCallback(
    (item: Pick<CartItem, "price_per_unit" | "min_type" | "min_value">, quantity: number) =>
      validate(item, quantity),
    []
  );

  const dismissRecovery = useCallback(() => setHasSavedCart(false), []);

  const totalItems = state.items.reduce((s, i) => s + i.quantity, 0);
  const totalAmount = state.items.reduce((s, i) => s + i.subtotal, 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isOpen: state.isOpen,
        totalItems,
        totalAmount,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        openDrawer,
        closeDrawer,
        validateItem,
        hasSavedCart,
        dismissRecovery,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
