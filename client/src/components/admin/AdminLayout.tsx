import { useEffect, useState } from 'react';
import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Boxes, FolderTree, Inbox, Layers, ListOrdered, Users, Ticket } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/store/auth';
import { cn } from '@/lib/utils';

const items = [
  { to: '/admin/products',   label: 'Товары',         Icon: Boxes },
  { to: '/admin/categories', label: 'Категории',      Icon: FolderTree },
  { to: '/admin/sets',       label: 'Сеты',           Icon: Layers },
  { to: '/admin/orders',     label: 'Заказы',         Icon: ListOrdered },
  { to: '/admin/messages',   label: 'Сообщения',      Icon: Inbox },
  { to: '/admin/users',      label: 'Пользователи',   Icon: Users },
  { to: '/admin/promo',      label: 'Промокоды',      Icon: Ticket },
];

export function AdminLayout() {
  const user = useAuth(s => s.user);
  const initialized = useAuth(s => s.initialized);
  const location = useLocation();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (user?.role !== 'ADMIN') return;
    api.get<{ unreadCount: number }>('/contact')
      .then(r => setUnread(r.data.unreadCount))
      .catch(() => { /* без бейджа, если ошибка */ });
  }, [user?.role, location.pathname]);

  if (!initialized) {
    return <div className="container-page py-20 text-center text-brown-soft">Загрузка…</div>;
  }
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container-page py-8">
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-3xl bg-white p-3 shadow-sm h-fit lg:sticky lg:top-24">
          <div className="mb-3 px-3 pt-2">
            <p className="font-oswald text-lg font-bold uppercase text-brown">Админка</p>
            <p className="text-xs text-brown-soft">Пряня · {user.email}</p>
          </div>
          <nav className="grid gap-1">
            {items.map(({ to, label, Icon }) => {
              const showBadge = to === '/admin/messages' && unread > 0;
              return (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition',
                      isActive
                        ? 'bg-pink-soft text-pink'
                        : 'text-brown hover:bg-cream-2',
                    )
                  }
                >
                  <Icon size={16} />
                  <span className="flex-1">{label}</span>
                  {showBadge && (
                    <span className="grid h-5 min-w-[20px] place-items-center rounded-full bg-pink px-1.5 text-[11px] font-bold text-white">
                      {unread}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
