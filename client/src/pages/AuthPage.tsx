import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, User as UserIcon } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAuth } from '@/store/auth';
import { cn } from '@/lib/utils';

type Tab = 'login' | 'register';

export function AuthPage() {
  const navigate = useNavigate();
  const user = useAuth(s => s.user);
  const loading = useAuth(s => s.loading);
  const error = useAuth(s => s.error);
  const login = useAuth(s => s.login);
  const register = useAuth(s => s.register);
  const clearError = useAuth(s => s.clearError);

  const [tab, setTab] = useState<Tab>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    if (user) navigate('/account', { replace: true });
  }, [user, navigate]);

  useEffect(() => () => clearError(), [clearError]);

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm(f => ({ ...f, [k]: v }));
    if (error) clearError();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const ok =
      tab === 'login'
        ? await login(form.email, form.password)
        : await register(form);
    if (ok) navigate('/account', { replace: true });
  }

  return (
    <div>
      <PageHeader
        title={tab === 'login' ? 'Вход' : 'Регистрация'}
        subtitle={
          tab === 'login'
            ? 'Войдите чтобы видеть историю заказов и сохранять адреса'
            : 'Создайте аккаунт за 30 секунд — нужны только имя, email и пароль'
        }
      />

      <div className="container-page pb-16">
        <div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-sm">
          {/* Tabs */}
          <div className="mb-7 grid grid-cols-2 gap-1 rounded-full bg-cream-2 p-1">
            <button
              type="button"
              onClick={() => setTab('login')}
              className={cn(
                'rounded-full py-2.5 text-sm font-semibold transition-all',
                tab === 'login' ? 'bg-white text-brown shadow-sm' : 'text-brown-soft',
              )}
            >
              Вход
            </button>
            <button
              type="button"
              onClick={() => setTab('register')}
              className={cn(
                'rounded-full py-2.5 text-sm font-semibold transition-all',
                tab === 'register' ? 'bg-white text-brown shadow-sm' : 'text-brown-soft',
              )}
            >
              Регистрация
            </button>
          </div>

          <form onSubmit={submit} className="grid gap-4">
            {tab === 'register' && (
              <FieldInput
                label="Имя"
                icon={<UserIcon size={16} />}
                value={form.name}
                onChange={v => update('name', v)}
                placeholder="Анна"
                type="text"
                autoComplete="name"
                required
              />
            )}
            <FieldInput
              label="Email"
              icon={<Mail size={16} />}
              value={form.email}
              onChange={v => update('email', v)}
              placeholder="anna@example.com"
              type="email"
              autoComplete="email"
              required
            />
            <FieldInput
              label="Пароль"
              icon={<Lock size={16} />}
              value={form.password}
              onChange={v => update('password', v)}
              placeholder={tab === 'register' ? 'минимум 6 символов' : '••••••••'}
              type="password"
              autoComplete={tab === 'register' ? 'new-password' : 'current-password'}
              minLength={tab === 'register' ? 6 : 1}
              required
            />

            {error && (
              <div className="rounded-xl bg-pink-soft px-4 py-3 text-sm text-pink-deep">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full border border-brown/10 bg-white py-3.5 text-sm font-semibold text-brown transition-all duration-500 ease-smooth hover:border-transparent hover:bg-[#F0729E] hover:text-white disabled:opacity-60"
            >
              {loading
                ? '...'
                : tab === 'login'
                  ? 'Войти'
                  : 'Создать аккаунт'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-brown-soft">
            {tab === 'login' ? (
              <>
                Нет аккаунта?{' '}
                <button
                  type="button"
                  onClick={() => setTab('register')}
                  className="font-semibold text-pink hover:text-pink-deep"
                >
                  Зарегистрируйтесь
                </button>
              </>
            ) : (
              <>
                Уже есть аккаунт?{' '}
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className="font-semibold text-pink hover:text-pink-deep"
                >
                  Войти
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

interface FieldInputProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  minLength?: number;
  required?: boolean;
}
function FieldInput({ label, icon, value, onChange, placeholder, type = 'text', ...rest }: FieldInputProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-brown-soft">
        {label}
      </span>
      <span className="relative block">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brown-soft">
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-brown/10 bg-cream py-3 pl-10 pr-4 text-sm outline-none transition focus:border-pink focus:bg-white focus:shadow-[0_0_0_4px_rgba(232,80,138,0.12)]"
          {...rest}
        />
      </span>
    </label>
  );
}
