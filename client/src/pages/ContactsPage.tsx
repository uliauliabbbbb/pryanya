import { useState } from 'react';
import { Clock, Mail, MapPin, Phone, Send } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { ShopMap } from '@/components/layout/ShopMap';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

const CONTACTS = [
  { icon: <MapPin size={18} />, title: 'Адрес',   value: 'Москва, ул. Медовая, 12' },
  { icon: <Phone size={18} />,  title: 'Телефон', value: '+7 (495) 123-45-67' },
  { icon: <Mail size={18} />,   title: 'Email',   value: 'hello@pranya.ru' },
  { icon: <Clock size={18} />,  title: 'Часы',    value: 'Пн–Пт: 9:00–19:00 / Сб–Вс: 11:00–17:00' },
];

const SOCIALS = [
  { label: 'Telegram',  url: '#' },
  { label: 'VK',        url: '#' },
  { label: 'Instagram', url: '#' },
];

export function ContactsPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: undefined }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!form.name.trim()) errs.name = 'Укажите имя';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Неверный email';
    if (form.message.trim().length < 5) errs.message = 'Минимум 5 символов';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      await api.post('/contact', {
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      });
      setSent(true);
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: string } } })
        .response?.data?.error ?? 'Не удалось отправить, попробуйте ещё раз';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Контакты"
        subtitle="Напишите нам по любому вопросу — про индивидуальный сет, оптовый заказ или просто посоветоваться по вкусам."
      />

      <div className="container-page pb-14">
        <div className="grid grid-cols-1 gap-7 lg:grid-cols-[1fr_1fr]">
          {/* Map + contacts */}
          <div className="grid gap-5">
            <ShopMap />

            {/* Contact list */}
            <div className="rounded-3xl bg-white p-7 shadow-sm">
              <ul className="grid gap-5">
                {CONTACTS.map(c => (
                  <li key={c.title} className="flex items-start gap-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-pink-soft text-pink">
                      {c.icon}
                    </span>
                    <div>
                      <div className="text-sm font-bold uppercase tracking-wide text-brown-soft">
                        {c.title}
                      </div>
                      <div className="mt-1 text-base font-semibold text-brown">{c.value}</div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-7 border-t border-brown/10 pt-5">
                <div className="mb-3 text-sm font-bold uppercase tracking-wide text-brown-soft">
                  Соцсети
                </div>
                <div className="flex flex-wrap gap-2">
                  {SOCIALS.map(s => (
                    <a
                      key={s.label}
                      href={s.url}
                      className="rounded-full bg-cream-2 px-5 py-2.5 text-base font-semibold text-brown transition hover:bg-pink-soft hover:text-pink"
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="self-start rounded-3xl bg-white p-8 shadow-sm">
            <h3 className="mb-2 font-oswald text-3xl uppercase text-brown">Написать нам</h3>
            <p className="mb-7 text-base font-medium text-brown-soft">
              Ответим в течение дня, чаще быстрее
            </p>

            {sent && (
              <div className="mb-5 rounded-xl bg-pink-soft px-4 py-3 text-base font-bold text-pink-deep">
                ✓ Сообщение отправлено! Мы напишем вам на почту.
              </div>
            )}
            {submitError && (
              <div className="mb-5 rounded-xl bg-pink/10 px-4 py-3 text-base font-medium text-pink-deep">
                {submitError}
              </div>
            )}

            <form onSubmit={submit} className="grid gap-5">
              <label className="block">
                <span className="mb-2 block text-sm font-bold uppercase tracking-wide text-brown-soft">
                  Имя
                </span>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                  placeholder="Анна"
                  className={inputCls(errors.name)}
                />
                {errors.name && <span className="mt-1.5 block text-sm font-medium text-pink-deep">{errors.name}</span>}
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold uppercase tracking-wide text-brown-soft">
                  Email
                </span>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                  placeholder="anna@example.com"
                  className={inputCls(errors.email)}
                />
                {errors.email && <span className="mt-1.5 block text-sm font-medium text-pink-deep">{errors.email}</span>}
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold uppercase tracking-wide text-brown-soft">
                  Сообщение
                </span>
                <textarea
                  value={form.message}
                  onChange={e => update('message', e.target.value)}
                  placeholder="Расскажите, что нужно"
                  rows={5}
                  className={cn(inputCls(errors.message), 'resize-none')}
                />
                {errors.message && <span className="mt-1.5 block text-sm font-medium text-pink-deep">{errors.message}</span>}
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full border border-brown/10 bg-white py-4 text-base font-bold text-brown transition-all duration-500 ease-smooth hover:border-transparent hover:bg-[#F0729E] hover:text-white disabled:opacity-60"
              >
                {submitting ? 'Отправляю…' : (<>Отправить <Send size={18} /></>)}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function inputCls(err?: string) {
  return cn(
    'w-full rounded-xl border bg-cream px-4 py-3.5 text-base font-medium outline-none transition focus:bg-white focus:border-pink focus:shadow-[0_0_0_4px_rgba(232,80,138,0.12)]',
    err ? 'border-pink/60' : 'border-brown/10',
  );
}
