import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, User, Menu, X, Shield } from 'lucide-react';
import { CartButton } from './CartPanel';
import { useAuth } from '@/store/auth';
import { cn } from '@/lib/utils';

const nav = [
  { to: '/',         label: 'Главная',  end: true },
  { to: '/catalog',  label: 'Каталог' },
  { to: '/sets',     label: 'Сеты' },
  { to: '/about',    label: 'Мы' },
  { to: '/delivery', label: 'Доставка' },
  { to: '/contacts', label: 'Контакты' },
];

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span
        className="grid h-10 w-10 place-items-center rounded-full text-xl shadow-pink"
        style={{ background: 'linear-gradient(135deg, #E8508A 0%, #D4A853 100%)' }}
      >
        🍪
      </span>
      <span className="font-oswald text-[26px] font-bold leading-none tracking-tight text-brown">
        Пряня
      </span>
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const user = useAuth(s => s.user);

  return (
    <header className="sticky top-0 z-40 border-b border-brown/10 bg-cream/85 backdrop-blur-md">
      <div className="container-page flex items-center justify-between gap-5 py-3.5">
        <Logo />

        <nav className="hidden items-center gap-1.5 lg:flex">
          {nav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-pink-soft text-pink'
                    : 'text-brown hover:bg-pink-soft/50',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="relative hidden xl:block">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brown-soft" />
            <input
              type="search"
              placeholder="Поиск пряников…"
              onFocus={() => navigate('/catalog')}
              className="w-52 rounded-full border border-brown/10 bg-white py-2.5 pl-9 pr-3 text-[13px] outline-none transition focus:border-pink focus:shadow-[0_0_0_4px_rgba(232,80,138,0.12)]"
            />
          </div>

          {user?.role === 'ADMIN' && (
            <Link
              to="/admin"
              aria-label="Админка"
              title="Админка"
              className="grid h-[42px] w-[42px] place-items-center rounded-full bg-brown text-cream transition hover:scale-105 hover:bg-pink"
            >
              <Shield size={18} />
            </Link>
          )}

          <Link
            to={user ? '/account' : '/auth'}
            aria-label={user ? 'Личный кабинет' : 'Войти'}
            title={user ? user.name : 'Войти'}
            className="grid h-[42px] w-[42px] place-items-center rounded-full bg-cream-2 text-brown transition hover:scale-105 hover:bg-pink-soft"
          >
            {user ? <span className="text-xl">{user.avatar ?? '🌸'}</span> : <User size={18} />}
          </Link>

          <CartButton />

          <button
            type="button"
            aria-label="Меню"
            onClick={() => setOpen(o => !o)}
            className="grid h-[42px] w-[42px] place-items-center rounded-full bg-cream-2 text-brown lg:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-brown/10 bg-cream px-5 py-4 animate-fadeInUp lg:hidden">
          <nav className="grid gap-1">
            {nav.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'rounded-2xl px-4 py-3 text-sm font-medium transition',
                    isActive ? 'bg-pink-soft text-pink' : 'text-brown',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
