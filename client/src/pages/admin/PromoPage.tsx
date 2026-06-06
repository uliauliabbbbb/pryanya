import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { api } from '@/lib/api';
import { ErrorBanner, Field, PageHeader, pickError } from '@/components/admin/AdminUI';
import { cn } from '@/lib/utils';

interface PromoCode {
  code: string;
  discount: number;
  isActive: boolean;
  validUntil: string | null;
}

interface FormState {
  code: string;
  discountPercent: string;
  isActive: boolean;
  validUntil: string;
}

const EMPTY: FormState = { code: '', discountPercent: '10', isActive: true, validUntil: '' };

export function AdminPromoPage() {
  const [items, setItems] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const r = await api.get<PromoCode[]>('/promo');
      setItems(r.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  function startCreate() {
    setEditingCode(null);
    setForm(EMPTY);
    setError(null);
  }

  function startEdit(p: PromoCode) {
    setEditingCode(p.code);
    setForm({
      code: p.code,
      discountPercent: String(Math.round(p.discount * 100)),
      isActive: p.isActive,
      validUntil: p.validUntil ? p.validUntil.slice(0, 10) : '',
    });
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const discount = Number(form.discountPercent) / 100;
    const validUntil = form.validUntil
      ? new Date(form.validUntil + 'T23:59:59Z').toISOString()
      : null;

    try {
      if (editingCode == null) {
        await api.post('/promo', {
          code: form.code.trim().toUpperCase(),
          discount,
          isActive: form.isActive,
          validUntil,
        });
      } else {
        await api.patch(`/promo/${encodeURIComponent(editingCode)}`, {
          discount,
          isActive: form.isActive,
          validUntil,
        });
      }
      await refresh();
      startCreate();
    } catch (e) {
      setError(pickError(e, 'Не удалось сохранить'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(p: PromoCode) {
    if (!confirm(`Удалить промокод ${p.code}?`)) return;
    setError(null);
    try {
      await api.delete(`/promo/${encodeURIComponent(p.code)}`);
      await refresh();
      if (editingCode === p.code) startCreate();
    } catch (e) {
      setError(pickError(e, 'Не удалось удалить'));
    }
  }

  return (
    <div>
      <PageHeader
        title="Промокоды"
        subtitle={`Всего: ${items.length}.`}
        right={editingCode !== null && (
          <button type="button" onClick={startCreate}
            className="inline-flex items-center gap-2 rounded-full border border-brown/10 bg-white px-4 py-2 text-sm font-semibold text-brown transition hover:bg-cream-2">
            <X size={16} /> Отмена
          </button>
        )}
      />

      <form onSubmit={handleSave} className="mb-10 rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="mb-5 font-oswald text-xl uppercase text-brown">
          {editingCode == null ? 'Новый промокод' : `Редактирование ${editingCode}`}
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Код">
            <input required maxLength={50}
              disabled={editingCode !== null}
              value={form.code}
              onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
              className={cn('input', editingCode !== null && 'opacity-60')} />
          </Field>
          <Field label="Скидка (%)">
            <input required type="number" min="0" max="100" step="1"
              value={form.discountPercent}
              onChange={e => setForm(f => ({ ...f, discountPercent: e.target.value }))}
              className="input" />
          </Field>
          <Field label="Активен">
            <label className="inline-flex items-center gap-2 py-2">
              <input type="checkbox" checked={form.isActive}
                onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
              <span className="text-sm text-brown">да</span>
            </label>
          </Field>
          <Field label="Действует до (опц.)">
            <input type="date" value={form.validUntil}
              onChange={e => setForm(f => ({ ...f, validUntil: e.target.value }))}
              className="input" />
          </Field>
        </div>

        <ErrorBanner message={error} />

        <div className="mt-6 flex gap-3">
          <button type="submit" disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-brown px-6 py-3 text-sm font-semibold text-cream transition hover:bg-pink disabled:opacity-50">
            {saving ? 'Сохраняю…' : editingCode == null ? <><Plus size={16}/> Создать</> : 'Сохранить'}
          </button>
        </div>
      </form>

      {loading ? (
        <div className="py-20 text-center text-brown-soft">Загрузка…</div>
      ) : (
        <div className="overflow-x-auto rounded-3xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-brown/10 text-xs uppercase tracking-wider text-brown-soft">
              <tr>
                <th className="px-4 py-3">Код</th>
                <th className="px-4 py-3">Скидка</th>
                <th className="px-4 py-3">Активен</th>
                <th className="px-4 py-3">Действует до</th>
                <th className="px-4 py-3 text-right">Действия</th>
              </tr>
            </thead>
            <tbody>
              {items.map(p => (
                <tr key={p.code} className={cn(
                  'border-b border-brown/5 transition',
                  editingCode === p.code ? 'bg-pink-soft/40' : 'hover:bg-cream-2/50',
                )}>
                  <td className="px-4 py-3 font-mono font-semibold text-brown">{p.code}</td>
                  <td className="px-4 py-3 text-brown">{Math.round(p.discount * 100)}%</td>
                  <td className="px-4 py-3">
                    {(() => {
                      const expired = p.validUntil && new Date(p.validUntil) <= new Date();
                      if (!p.isActive) {
                        return <span className="rounded-full bg-cream-2 px-2 py-0.5 text-xs font-semibold text-brown-soft">нет</span>;
                      }
                      if (expired) {
                        return <span className="rounded-full bg-pink/15 px-2 py-0.5 text-xs font-semibold text-pink-deep">истёк</span>;
                      }
                      return <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">да</span>;
                    })()}
                  </td>
                  <td className="px-4 py-3 text-brown-soft text-xs">
                    {p.validUntil ? new Date(p.validUntil).toLocaleDateString('ru-RU') : '∞'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => startEdit(p)}
                        aria-label="Редактировать"
                        className="grid h-8 w-8 place-items-center rounded-full bg-cream-2 text-brown transition hover:bg-pink-soft">
                        <Pencil size={14} />
                      </button>
                      <button type="button" onClick={() => handleDelete(p)}
                        aria-label="Удалить"
                        className="grid h-8 w-8 place-items-center rounded-full bg-cream-2 text-pink transition hover:bg-pink hover:text-white">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
