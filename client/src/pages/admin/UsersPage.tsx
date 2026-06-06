import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { ErrorBanner, PageHeader, pickError } from '@/components/admin/AdminUI';
import { useAuth } from '@/store/auth';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';

interface UserRow {
  id: number;
  email: string;
  name: string;
  avatar: string | null;
  role: UserRole;
  createdAt: string;
  ordersCount: number;
}

export function AdminUsersPage() {
  const me = useAuth(s => s.user);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const r = await api.get<UserRow[]>('/users');
      setUsers(r.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  async function changeRole(u: UserRow, role: UserRole) {
    setError(null);
    try {
      const r = await api.patch<UserRow>(`/users/${u.id}`, { role });
      setUsers(curr => curr.map(x => x.id === u.id ? r.data : x));
    } catch (e) {
      setError(pickError(e, 'Не удалось обновить роль'));
    }
  }

  async function handleDelete(u: UserRow) {
    if (!confirm(`Удалить пользователя «${u.name}» (${u.email})?`)) return;
    setError(null);
    try {
      await api.delete(`/users/${u.id}`);
      await refresh();
    } catch (e) {
      setError(pickError(e, 'Не удалось удалить'));
    }
  }

  return (
    <div>
      <PageHeader title="Пользователи" subtitle={`Всего: ${users.length}.`} />
      <ErrorBanner message={error} />
      {loading ? (
        <div className="py-20 text-center text-brown-soft">Загрузка…</div>
      ) : (
        <div className="overflow-x-auto rounded-3xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-brown/10 text-xs uppercase tracking-wider text-brown-soft">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Имя</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Роль</th>
                <th className="px-4 py-3">Заказов</th>
                <th className="px-4 py-3">Регистрация</th>
                <th className="px-4 py-3 text-right">Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const isMe = me?.id === u.id;
                return (
                  <tr key={u.id} className="border-b border-brown/5 hover:bg-cream-2/50">
                    <td className="px-4 py-3 text-brown-soft">#{u.id}</td>
                    <td className="px-4 py-3 font-semibold text-brown">
                      <span className="mr-1">{u.avatar ?? '🌸'}</span>{u.name}
                      {isMe && <span className="ml-2 text-xs text-pink">(вы)</span>}
                    </td>
                    <td className="px-4 py-3 text-brown-soft">{u.email}</td>
                    <td className="px-4 py-3">
                      <select value={u.role}
                        disabled={isMe}
                        onChange={e => changeRole(u, e.target.value as UserRole)}
                        className={cn(
                          'rounded-full px-3 py-1.5 text-xs font-semibold transition',
                          u.role === 'ADMIN' ? 'bg-pink-soft text-pink' : 'bg-cream-2 text-brown',
                          isMe && 'opacity-60 cursor-not-allowed',
                        )}>
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-brown-soft">{u.ordersCount}</td>
                    <td className="px-4 py-3 text-brown-soft text-xs">
                      {new Date(u.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => handleDelete(u)}
                          disabled={isMe}
                          aria-label="Удалить"
                          className={cn(
                            'grid h-8 w-8 place-items-center rounded-full bg-cream-2 text-pink transition',
                            isMe ? 'opacity-40 cursor-not-allowed' : 'hover:bg-pink hover:text-white',
                          )}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
