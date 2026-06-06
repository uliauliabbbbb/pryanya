import { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { ErrorBanner, PageHeader, pickError } from '@/components/admin/AdminUI';
import { cn, formatPrice } from '@/lib/utils';

const STATUSES = ['PROCESSING', 'ASSEMBLING', 'SHIPPING', 'DELIVERED'] as const;
type Status = typeof STATUSES[number];

const STATUS_LABEL: Record<Status, string> = {
  PROCESSING: 'В работе',
  ASSEMBLING: 'Собирается',
  SHIPPING:   'В пути',
  DELIVERED:  'Доставлен',
};

interface OrderItemRow {
  id: number;
  name: string;
  price: number;
  photo: string | null;
  qty: number;
  productId: number | null;
  setId: number | null;
}

interface OrderRow {
  id: number;
  formattedId: string;
  status: Status;
  subtotal: number;
  discount: number;
  total: number;
  promoCode: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  user: { id: number; email: string; name: string } | null;
  address: {
    city: string; street: string; building: string;
    apartment: string | null; postalCode: string | null;
  } | null;
  items: OrderItemRow[];
}

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  async function refresh() {
    setLoading(true);
    try {
      const r = await api.get<OrderRow[]>('/orders/all');
      setOrders(r.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  function toggle(id: number) {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function changeStatus(id: number, status: Status) {
    setError(null);
    try {
      await api.patch(`/orders/${id}/status`, { status });
      setOrders(curr => curr.map(o => o.id === id ? { ...o, status } : o));
    } catch (e) {
      setError(pickError(e, 'Не удалось обновить статус'));
    }
  }

  async function handleDelete(o: OrderRow) {
    if (!confirm(`Удалить заказ ${o.formattedId}?`)) return;
    setError(null);
    try {
      await api.delete(`/orders/${o.id}`);
      await refresh();
    } catch (e) {
      setError(pickError(e, 'Не удалось удалить'));
    }
  }

  return (
    <div>
      <PageHeader title="Заказы" subtitle={`Всего заказов: ${orders.length}.`} />
      <ErrorBanner message={error} />
      {loading ? (
        <div className="py-20 text-center text-brown-soft">Загрузка…</div>
      ) : orders.length === 0 ? (
        <div className="rounded-3xl bg-white p-10 text-center text-brown-soft shadow-sm">
          Заказов пока нет.
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(o => {
            const isOpen = expanded.has(o.id);
            return (
              <div key={o.id} className="overflow-hidden rounded-3xl bg-white shadow-sm">
                <button type="button" onClick={() => toggle(o.id)}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-cream-2/50">
                  {isOpen ? <ChevronDown size={16} className="text-brown-soft" /> : <ChevronRight size={16} className="text-brown-soft" />}
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-3 items-center">
                    <div>
                      <div className="font-semibold text-brown">{o.formattedId}</div>
                      <div className="text-xs text-brown-soft">{new Date(o.createdAt).toLocaleString('ru-RU')}</div>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-brown">{o.user?.name ?? '—'}</div>
                      <div className="text-xs text-brown-soft">{o.user?.email ?? ''}</div>
                    </div>
                    <div className="text-sm font-semibold text-brown">{formatPrice(o.total)}</div>
                    <div className="text-xs text-brown-soft">
                      {o.items.length} поз., {o.items.reduce((s, i) => s + i.qty, 0)} шт.
                    </div>
                    <div onClick={e => e.stopPropagation()}>
                      <select value={o.status}
                        onChange={e => changeStatus(o.id, e.target.value as Status)}
                        className={cn(
                          'rounded-full px-3 py-1.5 text-xs font-semibold transition',
                          o.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                          o.status === 'SHIPPING'  ? 'bg-blue-100 text-blue-700' :
                          o.status === 'ASSEMBLING'? 'bg-yellow-100 text-yellow-800' :
                                                     'bg-pink-soft text-pink',
                        )}>
                        {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                      </select>
                    </div>
                  </div>
                  <span onClick={e => { e.stopPropagation(); handleDelete(o); }}
                    aria-label="Удалить"
                    className="grid h-8 w-8 place-items-center rounded-full bg-cream-2 text-pink transition hover:bg-pink hover:text-white">
                    <Trash2 size={14} />
                  </span>
                </button>
                {isOpen && (
                  <div className="border-t border-brown/10 bg-cream/40 px-5 py-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-brown-soft">Состав</div>
                        <div className="space-y-2">
                          {o.items.map(it => (
                            <div key={it.id} className="flex items-center justify-between text-sm">
                              <span className="text-brown">{it.name} ×{it.qty}</span>
                              <span className="text-brown-soft">{formatPrice(it.price * it.qty)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 border-t border-brown/10 pt-2 text-sm">
                          <div className="flex justify-between text-brown-soft">
                            <span>Сумма</span><span>{formatPrice(o.subtotal)}</span>
                          </div>
                          {o.discount > 0 && (
                            <div className="flex justify-between text-pink">
                              <span>Скидка{o.promoCode ? ` (${o.promoCode})` : ''}</span>
                              <span>−{formatPrice(o.discount)}</span>
                            </div>
                          )}
                          <div className="mt-1 flex justify-between font-semibold text-brown">
                            <span>Итого</span><span>{formatPrice(o.total)}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-brown-soft">Доставка</div>
                        {o.address ? (
                          <div className="text-sm text-brown">
                            {o.address.city}, {o.address.street}, {o.address.building}
                            {o.address.apartment && `, кв. ${o.address.apartment}`}
                            {o.address.postalCode && <div className="text-brown-soft text-xs">{o.address.postalCode}</div>}
                          </div>
                        ) : (
                          <div className="text-sm text-brown-soft">— нет адреса —</div>
                        )}
                        {o.notes && (
                          <div className="mt-3">
                            <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-brown-soft">Комментарий</div>
                            <div className="text-sm text-brown">{o.notes}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
