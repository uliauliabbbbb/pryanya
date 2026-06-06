import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Minus, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  selectCount,
  selectDiscount,
  selectSubtotal,
  selectTotal,
  useCart,
} from '@/store/cart';
import { formatPrice } from '@/lib/utils';

export function CartPage() {
  const navigate = useNavigate();
  const items = useCart(s => s.items);
  const promo = useCart(s => s.promo);
  const promoApplied = useCart(s => s.promoApplied);
  const setPromo = useCart(s => s.setPromo);
  const applyPromo = useCart(s => s.applyPromo);
  const updateQty = useCart(s => s.updateQty);
  const removeItem = useCart(s => s.removeItem);

  const count = useCart(selectCount);
  const subtotal = useCart(selectSubtotal);
  const discount = useCart(selectDiscount);
  const total = useCart(selectTotal);

  if (items.length === 0) {
    return (
      <div>
        <PageHeader title="Корзина" />
        <div className="container-page pb-20 text-center">
          <div className="mb-5 inline-block animate-floatY text-7xl">🛍️</div>
          <h3 className="mb-3 font-oswald text-2xl uppercase text-brown">
            Корзина пустая
          </h3>
          <p className="mb-7 text-brown-soft">
            Загляните в каталог — 12 авторских вкусов и 4 подарочных сета
          </p>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 rounded-full border border-brown/10 bg-white px-7 py-3.5 text-sm font-semibold text-brown transition-all duration-500 ease-smooth hover:border-transparent hover:bg-[#F0729E] hover:text-white"
          >
            В каталог <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Корзина" subtitle={`${count} в наборе`} />

      <div className="container-page grid grid-cols-1 gap-8 pb-14 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
        {/* Items */}
        <div>
          <Link
            to="/catalog"
            className="mb-5 inline-flex items-center gap-1.5 text-sm text-brown-soft transition hover:text-pink"
          >
            <ArrowLeft size={16} />
            Продолжить покупки
          </Link>

          <div className="grid gap-3.5">
            {items.map(item => (
              <div
                key={item.cartId}
                className="grid grid-cols-[88px_1fr_auto] items-center gap-4 rounded-3xl bg-white p-4 shadow-sm"
              >
                <div className="flex h-[88px] w-[88px] items-center justify-center rounded-2xl bg-gradient-to-br from-pink-soft via-cream to-cream-2">
                  <img
                    src={item.photo}
                    alt={item.name}
                    className="h-[72px] w-[72px] object-contain"
                  />
                </div>

                <div className="min-w-0">
                  <div className="mb-2 font-oswald text-lg uppercase leading-tight text-brown">
                    {item.name}
                  </div>
                  <div className="mb-2 text-base font-bold text-pink">
                    {formatPrice(item.price * item.qty)}
                  </div>
                  <div className="inline-flex items-center rounded-full bg-cream-2 p-0.5">
                    <button
                      type="button"
                      aria-label="Уменьшить"
                      onClick={() => updateQty(item.cartId, item.qty - 1)}
                      className="grid h-7 w-7 place-items-center rounded-full bg-white text-brown transition hover:bg-pink-soft"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="min-w-[32px] text-center text-sm font-bold">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      aria-label="Увеличить"
                      onClick={() => updateQty(item.cartId, item.qty + 1)}
                      className="grid h-7 w-7 place-items-center rounded-full bg-white text-brown transition hover:bg-pink-soft"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  aria-label="Удалить"
                  onClick={() => removeItem(item.cartId)}
                  className="grid h-10 w-10 place-items-center rounded-full text-brown-soft transition hover:bg-pink-soft hover:text-pink-deep"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <aside className="self-start rounded-3xl bg-white p-7 shadow-sm lg:sticky lg:top-24">
          <h3 className="mb-5 font-oswald text-xl uppercase text-brown">
            Ваш заказ
          </h3>

          <div className="mb-5 flex gap-2">
            <input
              type="text"
              placeholder="Промокод"
              value={promo}
              onChange={e => setPromo(e.target.value)}
              className="flex-1 rounded-xl border border-brown/10 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-pink focus:shadow-[0_0_0_4px_rgba(232,80,138,0.12)]"
            />
            <button
              type="button"
              onClick={applyPromo}
              className="rounded-xl bg-brown px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brown/90"
            >
              Применить
            </button>
          </div>
          {promoApplied && (
            <div className="-mt-3 mb-4 text-sm font-semibold text-pink-deep">
              ✓ {promoApplied.code} — скидка {Math.round(promoApplied.discount * 100)}%
            </div>
          )}

          <div className="mb-5 grid gap-2 text-sm">
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
              <span className="font-oswald text-3xl font-bold text-brown">
                {formatPrice(total)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/checkout')}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-brown/10 bg-white py-4 text-[15px] font-semibold text-brown transition-all duration-500 ease-smooth hover:border-transparent hover:bg-[#F0729E] hover:text-white"
          >
            Оформить заказ <ArrowRight size={18} />
          </button>
        </aside>
      </div>
    </div>
  );
}
