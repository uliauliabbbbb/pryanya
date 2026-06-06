import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';
import type { Product, ProductSet } from '@/types';

export interface CartItem {
  cartId: string;
  kind: 'product' | 'set';
  refId: number;
  name: string;
  price: number;
  photo: string;
  qty: number;
}

interface CartState {
  items: CartItem[];
  open: boolean;
  promo: string;
  promoApplied: { code: string; discount: number } | null;
  toast: string;

  addProduct: (p: Product, qty?: number) => void;
  addSet: (s: ProductSet) => void;
  updateQty: (cartId: string, qty: number) => void;
  removeItem: (cartId: string) => void;
  clear: () => void;
  setOpen: (v: boolean) => void;
  setPromo: (v: string) => void;
  applyPromo: () => Promise<void>;
  showToast: (msg: string) => void;
  clearToast: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      open: false,
      promo: '',
      promoApplied: null,
      toast: '',

      addProduct: (p, qty = 1) => {
        const items = get().items;
        const existing = items.find(it => it.kind === 'product' && it.refId === p.id);
        if (existing) {
          set({
            items: items.map(it =>
              it.cartId === existing.cartId ? { ...it, qty: it.qty + qty } : it,
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                cartId: `p-${p.id}-${Date.now()}`,
                kind: 'product',
                refId: p.id,
                name: p.name,
                price: p.price,
                photo: p.photo,
                qty,
              },
            ],
          });
        }
        get().showToast(`Добавлено: ${p.name}`);
      },

      addSet: (s) => {
        const items = get().items;
        const existing = items.find(it => it.kind === 'set' && it.refId === s.id);
        if (existing) {
          set({
            items: items.map(it =>
              it.cartId === existing.cartId ? { ...it, qty: it.qty + 1 } : it,
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                cartId: `s-${s.id}-${Date.now()}`,
                kind: 'set',
                refId: s.id,
                name: s.name,
                price: s.price,
                photo: s.photo ?? '/products/13_.png',
                qty: 1,
              },
            ],
          });
        }
        get().showToast(`Добавлен сет: ${s.name}`);
      },

      updateQty: (cartId, qty) => {
        if (qty < 1) {
          get().removeItem(cartId);
          return;
        }
        set({
          items: get().items.map(it => (it.cartId === cartId ? { ...it, qty } : it)),
        });
      },

      removeItem: (cartId) => {
        set({ items: get().items.filter(it => it.cartId !== cartId) });
      },

      clear: () => set({ items: [], promo: '', promoApplied: null }),

      setOpen: (v) => set({ open: v }),
      setPromo: (v) => set({ promo: v }),

      applyPromo: async () => {
        const code = get().promo.trim().toUpperCase();
        if (!code) return;
        try {
          const r = await api.get<{ code: string; discount: number }>(
            `/promo/${encodeURIComponent(code)}/check`,
          );
          set({ promoApplied: { code: r.data.code, discount: r.data.discount } });
          get().showToast(`Промокод применён: −${Math.round(r.data.discount * 100)}%`);
        } catch (e) {
          const msg = (e as { response?: { data?: { error?: string } } })
            .response?.data?.error ?? 'Промокод не найден';
          set({ promoApplied: null });
          get().showToast(msg);
        }
      },

      showToast: (msg) => set({ toast: msg }),
      clearToast: () => set({ toast: '' }),
    }),
    {
      name: 'pranya-cart',
      partialize: (state) => ({
        items: state.items,
        promo: state.promo,
        promoApplied: state.promoApplied,
      }),
    },
  ),
);

// Selectors
export const selectCount = (s: CartState) =>
  s.items.reduce((acc, it) => acc + it.qty, 0);

export const selectSubtotal = (s: CartState) =>
  s.items.reduce((acc, it) => acc + it.price * it.qty, 0);

export const selectDiscount = (s: CartState) =>
  s.promoApplied ? Math.round(selectSubtotal(s) * s.promoApplied.discount) : 0;

export const selectTotal = (s: CartState) =>
  selectSubtotal(s) - selectDiscount(s);
