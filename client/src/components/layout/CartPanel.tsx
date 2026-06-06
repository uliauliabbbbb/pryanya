import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import {
  selectCount,
  selectDiscount,
  selectSubtotal,
  selectTotal,
  useCart,
} from '@/store/cart';
import { cn, formatPrice } from '@/lib/utils';

function pluralizeGoods(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'товар';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'товара';
  return 'товаров';
}

export function CartPanel() {
  const navigate = useNavigate();

  const open = useCart(s => s.open);
  const items = useCart(s => s.items);
  const promo = useCart(s => s.promo);
  const promoApplied = useCart(s => s.promoApplied);
  const setOpen = useCart(s => s.setOpen);
  const setPromo = useCart(s => s.setPromo);
  const applyPromo = useCart(s => s.applyPromo);
  const updateQty = useCart(s => s.updateQty);
  const removeItem = useCart(s => s.removeItem);

  const count = useCart(selectCount);
  const subtotal = useCart(selectSubtotal);
  const discount = useCart(selectDiscount);
  const total = useCart(selectTotal);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Esc closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  const close = () => setOpen(false);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={close}
        aria-hidden
        className={cn(
          'fixed inset-0 z-[100] bg-brown/45 backdrop-blur-sm transition-opacity duration-300',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      {/* Panel */}
      <aside
        className={cn(
          'fixed inset-y-0 right-0 z-[110] flex w-full max-w-[460px] flex-col bg-cream transition-transform duration-[450ms] ease-smooth',
          open ? 'translate-x-0 shadow-[-30px_0_60px_rgba(61,43,31,.18)]' : 'translate-x-full',
        )}
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brown/10 px-6 py-5">
          <div>
            <h3 className="font-oswald text-2xl uppercase text-brown">Корзина</h3>
            <p className="text-xs text-brown-soft">
              {count === 0 ? 'Пока пусто' : `${count} ${pluralizeGoods(count)}`}
            </p>
          </div>
          <button
            type="button"
            aria-label="Закрыть"
            onClick={close}
            className="grid h-[42px] w-[42px] place-items-center rounded-full bg-cream-2 text-brown transition hover:scale-105 hover:bg-pink-soft"
          >
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6">
          {items.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <div className="mb-4 inline-block animate-floatY text-6xl">🛍️</div>
              <h4 className="mb-2 font-oswald text-xl uppercase text-brown">
                Корзина пустая
              </h4>
              <p className="mb-6 text-sm text-brown-soft">
                Загляните в каталог — там 12 вкусов ждут вас
              </p>
              <button
                type="button"
                onClick={() => {
                  close();
                  navigate('/catalog');
                }}
                className="inline-flex items-center gap-2 rounded-full border border-brown/10 bg-white px-6 py-3 text-sm font-semibold text-brown transition-all duration-500 ease-smooth hover:border-transparent hover:bg-[#F0729E] hover:text-white"
              >
                В каталог
              </button>
            </div>
          ) : (
            <div className="grid gap-3.5 py-4">
              {items.map(item => (
                <div
                  key={item.cartId}
                  className="grid grid-cols-[72px_1fr_auto] items-center gap-3.5 rounded-2xl bg-white p-3.5 shadow-sm"
                >
                  <div className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-gradient-to-br from-pink-soft via-cream to-cream-2">
                    <img
                      src={item.photo}
                      alt={item.name}
                      className="h-[60px] w-[60px] object-contain"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="mb-1.5 truncate font-oswald text-[15px] font-semibold uppercase leading-tight text-brown">
                      {item.name}
                    </div>
                    <div className="text-[13px] font-bold text-pink">
                      {formatPrice(item.price * item.qty)}
                    </div>
                    <div className="mt-1.5 inline-flex items-center rounded-full bg-cream-2 p-0.5">
                      <button
                        type="button"
                        aria-label="Уменьшить"
                        onClick={() => updateQty(item.cartId, item.qty - 1)}
                        className="grid h-[26px] w-[26px] place-items-center rounded-full bg-white text-brown transition hover:bg-pink-soft"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="min-w-[28px] text-center text-[13px] font-bold">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        aria-label="Увеличить"
                        onClick={() => updateQty(item.cartId, item.qty + 1)}
                        className="grid h-[26px] w-[26px] place-items-center rounded-full bg-white text-brown transition hover:bg-pink-soft"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    aria-label="Удалить"
                    onClick={() => removeItem(item.cartId)}
                    className="grid h-[34px] w-[34px] place-items-center rounded-full text-brown-soft transition hover:bg-pink-soft hover:text-pink-deep"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-brown/10 bg-white px-6 pb-7 pt-5">
            {/* Promo */}
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                placeholder="Промокод"
                value={promo}
                onChange={e => setPromo(e.target.value)}
                className="flex-1 rounded-xl border border-brown/10 bg-white px-3.5 py-3 text-[13px] outline-none transition focus:border-pink focus:shadow-[0_0_0_4px_rgba(232,80,138,0.12)]"
              />
              <button
                type="button"
                onClick={applyPromo}
                className="rounded-xl bg-brown px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-brown/90"
              >
                Применить
              </button>
            </div>
            {promoApplied && (
              <div className="-mt-2 mb-3.5 text-[13px] font-semibold text-pink-deep">
                ✓ Промокод «{promoApplied.code}» применён — скидка {Math.round(promoApplied.discount * 100)}%
              </div>
            )}

            <div className="mb-4 grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-brown-soft">Подытог</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-pink-deep">
                  <span>Скидка</span>
                  <span className="font-semibold">−{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-brown-soft">Доставка</span>
                <span className="font-semibold">Рассчитается далее</span>
              </div>
              <div className="flex items-baseline justify-between border-t border-dashed border-brown/15 pt-3">
                <span className="font-oswald text-xl uppercase">Итого</span>
                <span className="font-oswald text-[26px] font-bold text-brown">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                close();
                navigate('/checkout');
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-brown/10 bg-white py-4 text-[15px] font-semibold text-brown transition-all duration-500 ease-smooth hover:border-transparent hover:bg-[#F0729E] hover:text-white"
            >
              Оформить заказ <ArrowRight size={18} />
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

export function CartIconBadge() {
  const count = useCart(selectCount);
  if (count === 0) return null;
  return (
    <span
      className="absolute -right-1 -top-1 grid h-5 min-w-[20px] place-items-center rounded-full bg-pink px-1.5 text-[11px] font-bold text-white animate-pulseBadge"
      style={{ boxShadow: '0 4px 10px rgba(232,80,138,.4)' }}
    >
      {count}
    </span>
  );
}

export function CartButton({ className }: { className?: string }) {
  const setOpen = useCart(s => s.setOpen);
  return (
    <button
      type="button"
      aria-label="Корзина"
      onClick={() => setOpen(true)}
      className={cn(
        'relative grid h-[42px] w-[42px] place-items-center rounded-full bg-cream-2 text-brown transition hover:scale-105 hover:bg-pink-soft',
        className,
      )}
    >
      <ShoppingBag size={18} />
      <CartIconBadge />
    </button>
  );
}
