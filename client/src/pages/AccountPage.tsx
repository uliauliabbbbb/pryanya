import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Package } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { api } from '@/lib/api';
import { useAuth } from '@/store/auth';
import { formatPrice } from '@/lib/utils';

interface OrderRow {
  id: number;
  formattedId: string;
  total: number;
  subtotal: number;
  discount: number;
  status: string;
  createdAt: string;
  itemsCount: number;
  userEmail?: string | null;
}

interface AdminOrderRow {
  id: number;
  formattedId: string;
  total: number;
  status: string;
  createdAt: string;
  user: { id: number; email: string; name: string } | null;
  items: Array<{ qty: number }>;
}

const STATUS_RU: Record<string, string> = {
  PROCESSING: 'В работе',
  ASSEMBLING: 'Собирается',
  SHIPPING: 'В пути',
  DELIVERED: 'Доставлен',
};

export function AccountPage() {
  const navigate = useNavigate();
  const user = useAuth(s => s.user);
  const logout = useAuth(s => s.logout);

  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }
    if (isAdmin) {
      api.get<AdminOrderRow[]>('/orders/all')
        .then(r => setOrders(r.data.map(o => ({
          id: o.id,
          formattedId: o.formattedId,
          total: o.total,
          subtotal: 0,
          discount: 0,
          status: o.status,
          createdAt: o.createdAt,
          itemsCount: o.items.reduce((s, i) => s + i.qty, 0),
          userEmail: o.user?.email ?? null,
        }))))
        .catch(() => setOrders([]));
    } else {
      api.get<OrderRow[]>('/orders')
        .then(r => setOrders(r.data))
        .catch(() => setOrders([]));
    }
  }, [user, isAdmin, navigate]);

  if (!user) return null;

  async function handleLogout() {
    await logout();
    navigate('/', { replace: true });
  }

  return (
    <div>
      <PageHeader title="Личный кабинет" />

      <div className="container-page grid grid-cols-1 gap-7 pb-14 lg:grid-cols-[280px_1fr]">
        {/* Profile sidebar */}
        <aside className="self-start rounded-3xl bg-white p-7 shadow-sm">
          <div className="mb-5 flex flex-col items-center text-center">
            <div className="mb-3 grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-pink to-gold text-4xl shadow-pink">
              {user.avatar ?? '🌸'}
            </div>
            <h3 className="font-oswald text-lg uppercase text-brown">{user.name}</h3>
            <p className="mt-1 text-xs text-brown-soft">{user.email}</p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-brown/10 bg-cream py-3 text-sm font-semibold text-brown transition hover:bg-cream-2"
          >
            <LogOut size={16} />
            Выйти
          </button>
        </aside>

        {/* Orders */}
        <section>
          <h3 className="mb-5 font-oswald text-xl uppercase text-brown">
            {isAdmin ? 'Все заказы (админ)' : 'История заказов'}
          </h3>

          {orders === null ? (
            <div className="rounded-3xl bg-white p-10 text-center text-brown-soft shadow-sm">
              Загружаю заказы…
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
              <div className="mb-3 inline-grid h-16 w-16 place-items-center rounded-full bg-cream-2 text-brown">
                <Package size={28} />
              </div>
              <p className="mb-4 text-brown-soft">У вас пока нет заказов</p>
              <Link
                to="/catalog"
                className="inline-flex items-center gap-2 rounded-full border border-brown/10 bg-white px-6 py-3 text-sm font-semibold text-brown transition-all duration-500 ease-smooth hover:border-transparent hover:bg-[#F0729E] hover:text-white"
              >
                Выбрать пряники
              </Link>
            </div>
          ) : (
            <div className="grid gap-3">
              {orders.map(o => (
                <div
                  key={o.id}
                  className="grid grid-cols-[1fr_auto] gap-4 rounded-2xl bg-white p-5 shadow-sm sm:grid-cols-[1fr_auto_auto_auto] sm:items-center"
                >
                  <div>
                    <div className="font-oswald text-lg uppercase text-brown">
                      {o.formattedId}
                    </div>
                    <div className="text-xs text-brown-soft">
                      {new Date(o.createdAt).toLocaleDateString('ru-RU')} · {o.itemsCount} шт
                      {isAdmin && o.userEmail && (
                        <span className="ml-2 text-pink">{o.userEmail}</span>
                      )}
                    </div>
                  </div>
                  <div className="hidden sm:block text-sm text-brown-soft">
                    {STATUS_RU[o.status] ?? o.status}
                  </div>
                  <div className="text-right font-oswald text-xl font-bold text-brown">
                    {formatPrice(o.total)}
                  </div>
                  <span className="inline-block self-center rounded-full bg-pink-soft px-3 py-1 text-[11px] font-bold text-pink-deep sm:hidden">
                    {STATUS_RU[o.status] ?? o.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
