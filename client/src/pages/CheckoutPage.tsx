import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { AddressPicker } from '@/components/checkout/AddressPicker';
import {
  selectDiscount,
  selectSubtotal,
  selectTotal,
  useCart,
} from '@/store/cart';
import { useAuth } from '@/store/auth';
import { api } from '@/lib/api';
import { cn, formatPrice } from '@/lib/utils';

const DELIVERY_OPTIONS = [
  { id: 'courier',  title: 'Курьер по Москве',     hint: 'до 15:00 — день в день', price: 300, emoji: '🚴' },
  { id: 'sdek',     title: 'СДЭК — пункт выдачи',  hint: '2–4 дня по России',      price: 250, emoji: '📦' },
  { id: 'post',     title: 'Почта России',         hint: '3–7 дней',                price: 200, emoji: '✉️' },
];

const PAYMENT_OPTIONS = [
  { id: 'card',    title: 'Карта онлайн',        emoji: '💳' },
  { id: 'sbp',     title: 'Через СБП',            emoji: '⚡' },
  { id: 'courier', title: 'Наличные курьеру',     emoji: '💵' },
];

export function CheckoutPage() {
  const navigate = useNavigate();
  const items = useCart(s => s.items);
  const promoApplied = useCart(s => s.promoApplied);
  const subtotal = useCart(selectSubtotal);
  const discount = useCart(selectDiscount);
  const totalBeforeDelivery = useCart(selectTotal);
  const clear = useCart(s => s.clear);
  const user = useAuth(s => s.user);

  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: '',
    city: 'Москва',
    address: '',
    notes: '',
  });
  const [delivery, setDelivery] = useState(DELIVERY_OPTIONS[0]!);
  const [payment, setPayment] = useState(PAYMENT_OPTIONS[0]!);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const total = totalBeforeDelivery + delivery.price;

  if (items.length === 0) {
    return (
      <div>
        <PageHeader title="Оформление заказа" />
        <div className="container-page pb-16 text-center">
          <p className="mb-6 text-brown-soft">Корзина пуста — добавьте что-нибудь</p>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 rounded-full border border-brown/10 bg-white px-7 py-3.5 text-sm font-semibold text-brown transition-all duration-500 ease-smooth hover:border-transparent hover:bg-[#F0729E] hover:text-white"
          >
            В каталог
          </Link>
        </div>
      </div>
    );
  }

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm(f => ({ ...f, [key]: value }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }));
  }

  function validate() {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = 'Укажите имя';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Неверный email';
    if (form.phone.replace(/\D/g, '').length < 10) e.phone = 'Неверный телефон';
    if (!form.address.trim()) e.address = 'Укажите адрес';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;

    // Если не залогинен — кидаем на /auth
    if (!user) {
      navigate('/auth', { state: { from: '/checkout' } });
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const { data } = await api.post<{
        id: number; formattedId: string; total: number;
      }>('/orders', {
        items: items.map(it => ({ kind: it.kind, refId: it.refId, qty: it.qty })),
        promoCode: promoApplied?.code ?? null,
        notes: form.notes || null,
        address: {
          city: form.city,
          street: form.address,
          building: '—',
        },
      });
      clear();
      navigate('/checkout/success', {
        state: {
          total: data.total + delivery.price,
          name: form.name,
          orderNumber: data.formattedId,
        },
      });
    } catch (e) {
      const msg = (e as { response?: { data?: { error?: string } } }).response?.data?.error;
      setSubmitError(msg ?? 'Не удалось оформить заказ');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader title="Оформление заказа" />

      <div className="container-page pb-14">
        <Link
          to="/cart"
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-brown-soft transition hover:text-pink"
        >
          <ArrowLeft size={16} />
          Вернуться в корзину
        </Link>

        <form onSubmit={submit} className="grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
          {/* Form column */}
          <div className="grid gap-7">
            {/* Contacts */}
            <section className="rounded-3xl bg-white p-7 shadow-sm">
              <h3 className="mb-5 font-oswald text-xl uppercase text-brown">Контакты</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Имя" error={errors.name}>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => update('name', e.target.value)}
                    placeholder="Анна"
                    className={inputCls(errors.name)}
                  />
                </Field>
                <Field label="Телефон" error={errors.phone}>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => update('phone', e.target.value)}
                    placeholder="+7 (___) ___-__-__"
                    className={inputCls(errors.phone)}
                  />
                </Field>
                <Field label="Email" error={errors.email} className="sm:col-span-2">
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => update('email', e.target.value)}
                    placeholder="anna@example.com"
                    className={inputCls(errors.email)}
                  />
                </Field>
              </div>
            </section>

            {/* Address */}
            <section className="rounded-3xl bg-white p-7 shadow-sm">
              <h3 className="mb-5 font-oswald text-xl uppercase text-brown">Адрес</h3>
              <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
                <Field label="Город">
                  <input
                    type="text"
                    value={form.city}
                    onChange={e => update('city', e.target.value)}
                    className={inputCls()}
                  />
                </Field>
                <Field label="Улица, дом, квартира">
                  <AddressPicker
                    city={form.city}
                    value={form.address}
                    error={errors.address}
                    onChange={v => update('address', v)}
                  />
                </Field>
                <Field label="Комментарий (необязательно)" className="sm:col-span-2">
                  <textarea
                    value={form.notes}
                    onChange={e => update('notes', e.target.value)}
                    placeholder="Подъезд, код домофона, время доставки…"
                    rows={3}
                    className={cn(inputCls(), 'resize-none')}
                  />
                </Field>
              </div>
            </section>

            {/* Delivery */}
            <section className="rounded-3xl bg-white p-7 shadow-sm">
              <h3 className="mb-5 font-oswald text-xl uppercase text-brown">Доставка</h3>
              <div className="grid gap-3">
                {DELIVERY_OPTIONS.map(opt => (
                  <DeliveryOption
                    key={opt.id}
                    option={opt}
                    active={delivery.id === opt.id}
                    onClick={() => setDelivery(opt)}
                  />
                ))}
              </div>
            </section>

            {/* Payment */}
            <section className="rounded-3xl bg-white p-7 shadow-sm">
              <h3 className="mb-5 font-oswald text-xl uppercase text-brown">Оплата</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                {PAYMENT_OPTIONS.map(opt => (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => setPayment(opt)}
                    className={cn(
                      'flex items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left transition',
                      payment.id === opt.id
                        ? 'border-pink bg-pink-soft'
                        : 'border-brown/10 bg-cream hover:border-brown/25',
                    )}
                  >
                    <span className="text-2xl">{opt.emoji}</span>
                    <span className="text-sm font-semibold text-brown">
                      {opt.title}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Summary column */}
          <aside className="self-start rounded-3xl bg-white p-7 shadow-sm lg:sticky lg:top-24">
            <h3 className="mb-5 font-oswald text-xl uppercase text-brown">Заказ</h3>

            <div className="mb-5 grid max-h-[220px] gap-2 overflow-y-auto pr-1 text-sm">
              {items.map(it => (
                <div key={it.cartId} className="flex justify-between gap-3">
                  <span className="line-clamp-1 text-brown-soft">
                    {it.name} <span className="text-brown/40">× {it.qty}</span>
                  </span>
                  <span className="whitespace-nowrap font-semibold">
                    {formatPrice(it.price * it.qty)}
                  </span>
                </div>
              ))}
            </div>

            <div className="grid gap-2 border-t border-dashed border-brown/15 pt-4 text-sm">
              <Row label="Подытог" value={formatPrice(subtotal)} />
              {discount > 0 && (
                <Row
                  label={`Скидка ${promoApplied?.code ? `(${promoApplied.code})` : ''}`}
                  value={`−${formatPrice(discount)}`}
                  accent
                />
              )}
              <Row label={`Доставка (${delivery.title})`} value={formatPrice(delivery.price)} />
              <div className="flex items-baseline justify-between border-t border-dashed border-brown/15 pt-3">
                <span className="font-oswald text-xl uppercase">Итого</span>
                <span className="font-oswald text-3xl font-bold text-brown">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            {submitError && (
              <div className="mb-3 rounded-xl bg-pink-soft px-4 py-3 text-sm text-pink-deep">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-brown/10 bg-white py-4 text-[15px] font-semibold text-brown transition-all duration-500 ease-smooth hover:border-transparent hover:bg-[#F0729E] hover:text-white disabled:opacity-60"
            >
              {submitting ? 'Создаю заказ…' : 'Подтвердить заказ'}
            </button>

            {!user && (
              <p className="mt-3 text-center text-xs text-brown-soft">
                Чтобы оформить заказ — <Link to="/auth" className="font-semibold text-pink">войдите или зарегистрируйтесь</Link>
              </p>
            )}

            <p className="mt-3 text-center text-xs text-brown-soft">
              Нажимая кнопку, вы соглашаетесь с условиями обработки персональных данных
            </p>
          </aside>
        </form>
      </div>
    </div>
  );
}

// ─── helpers ────────────────────────────────────────────────────

function inputCls(err?: string) {
  return cn(
    'w-full rounded-xl border bg-cream px-4 py-3 text-sm outline-none transition focus:bg-white',
    err
      ? 'border-pink/60 focus:border-pink focus:shadow-[0_0_0_4px_rgba(232,80,138,0.12)]'
      : 'border-brown/10 focus:border-pink focus:shadow-[0_0_0_4px_rgba(232,80,138,0.12)]',
  );
}

interface FieldProps {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}
function Field({ label, error, className, children }: FieldProps) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-brown-soft">
        {label}
      </span>
      {children}
      {error && <span className="mt-1.5 block text-xs text-pink-deep">{error}</span>}
    </label>
  );
}

interface DeliveryOptionProps {
  option: (typeof DELIVERY_OPTIONS)[number];
  active: boolean;
  onClick: () => void;
}
function DeliveryOption({ option, active, onClick }: DeliveryOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center justify-between gap-4 rounded-2xl border-2 px-5 py-4 text-left transition',
        active
          ? 'border-pink bg-pink-soft'
          : 'border-brown/10 bg-cream hover:border-brown/25',
      )}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{option.emoji}</span>
        <div>
          <div className="font-oswald text-base uppercase text-brown">
            {option.title}
          </div>
          <div className="text-xs text-brown-soft">{option.hint}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-oswald text-lg font-bold text-brown">
          {formatPrice(option.price)}
        </span>
        {active && (
          <span className="grid h-6 w-6 place-items-center rounded-full bg-pink text-white">
            <Check size={14} strokeWidth={3} />
          </span>
        )}
      </div>
    </button>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={cn('flex justify-between', accent && 'text-pink-deep')}>
      <span className={accent ? '' : 'text-brown-soft'}>{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
