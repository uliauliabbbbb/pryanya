import { useEffect, useState } from 'react';
import { Check, Mail, MailOpen, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { ErrorBanner, PageHeader, pickError } from '@/components/admin/AdminUI';
import { cn } from '@/lib/utils';

interface Msg {
  id: number;
  name: string;
  email: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export function AdminMessagesPage() {
  const [items, setItems] = useState<Msg[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const r = await api.get<{ messages: Msg[]; unreadCount: number }>('/contact');
      setItems(r.data.messages);
      setUnread(r.data.unreadCount);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  async function toggleRead(m: Msg) {
    setError(null);
    try {
      const r = await api.patch<Msg>(`/contact/${m.id}`, { isRead: !m.isRead });
      setItems(curr => curr.map(x => x.id === m.id ? r.data : x));
      setUnread(curr => curr + (r.data.isRead ? -1 : 1));
    } catch (e) {
      setError(pickError(e, 'Не удалось обновить'));
    }
  }

  async function handleDelete(m: Msg) {
    if (!confirm(`Удалить сообщение от ${m.name}?`)) return;
    setError(null);
    try {
      await api.delete(`/contact/${m.id}`);
      setItems(curr => curr.filter(x => x.id !== m.id));
      if (!m.isRead) setUnread(curr => curr - 1);
    } catch (e) {
      setError(pickError(e, 'Не удалось удалить'));
    }
  }

  return (
    <div>
      <PageHeader
        title="Сообщения"
        subtitle={`Всего: ${items.length}${unread > 0 ? ` · непрочитанных: ${unread}` : ''}.`}
      />
      <ErrorBanner message={error} />

      {loading ? (
        <div className="py-20 text-center text-brown-soft">Загрузка…</div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl bg-white p-10 text-center text-brown-soft shadow-sm">
          Пока никто не писал.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(m => (
            <div key={m.id} className={cn(
              'rounded-3xl bg-white p-5 shadow-sm transition',
              !m.isRead && 'border-l-4 border-pink',
            )}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-brown">{m.name}</span>
                    <span className="text-brown-soft">·</span>
                    <a
                      href={`mailto:${m.email}`}
                      className="text-pink hover:underline"
                    >
                      {m.email}
                    </a>
                    {!m.isRead && (
                      <span className="rounded-full bg-pink-soft px-2 py-0.5 text-xs font-semibold text-pink">
                        новое
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-xs text-brown-soft">
                    {new Date(m.createdAt).toLocaleString('ru-RU')}
                  </div>
                  <p className="mt-3 whitespace-pre-wrap break-words text-sm text-brown">
                    {m.message}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => toggleRead(m)}
                    aria-label={m.isRead ? 'Отметить непрочитанным' : 'Отметить прочитанным'}
                    title={m.isRead ? 'Отметить непрочитанным' : 'Отметить прочитанным'}
                    className={cn(
                      'grid h-8 w-8 place-items-center rounded-full transition',
                      m.isRead
                        ? 'bg-cream-2 text-brown-soft hover:bg-pink-soft hover:text-pink'
                        : 'bg-pink-soft text-pink hover:bg-pink hover:text-white',
                    )}
                  >
                    {m.isRead ? <Mail size={14} /> : <Check size={14} />}
                  </button>
                  <a
                    href={`mailto:${m.email}?subject=Re:%20Пряня&body=${encodeURIComponent(`Здравствуйте, ${m.name}!\n\n`)}`}
                    aria-label="Ответить"
                    title="Ответить по email"
                    className="grid h-8 w-8 place-items-center rounded-full bg-cream-2 text-brown transition hover:bg-pink-soft hover:text-pink"
                  >
                    <MailOpen size={14} />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDelete(m)}
                    aria-label="Удалить"
                    className="grid h-8 w-8 place-items-center rounded-full bg-cream-2 text-pink transition hover:bg-pink hover:text-white"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
