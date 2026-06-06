import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { api } from '@/lib/api';
import { ErrorBanner, Field, PageHeader, pickError } from '@/components/admin/AdminUI';
import { cn } from '@/lib/utils';

interface Category {
  id: number;
  name: string;
  slug: string;
}

const EMPTY = { name: '', slug: '' };

export function AdminCategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const r = await api.get<Category[]>('/categories');
      setItems(r.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  function startCreate() {
    setEditingId(null);
    setForm(EMPTY);
    setError(null);
  }

  function startEdit(c: Category) {
    setEditingId(c.id);
    setForm({ name: c.name, slug: c.slug });
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = { name: form.name.trim(), slug: form.slug.trim() };
    try {
      if (editingId == null) await api.post('/categories', payload);
      else await api.patch(`/categories/${editingId}`, payload);
      await refresh();
      startCreate();
    } catch (e) {
      setError(pickError(e, 'Не удалось сохранить'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(c: Category) {
    if (!confirm(`Удалить категорию «${c.name}»?`)) return;
    setError(null);
    try {
      await api.delete(`/categories/${c.id}`);
      await refresh();
      if (editingId === c.id) startCreate();
    } catch (e) {
      setError(pickError(e, 'Не удалось удалить'));
    }
  }

  return (
    <div>
      <PageHeader
        title="Категории"
        subtitle={`Всего категорий: ${items.length}.`}
        right={editingId !== null && (
          <button type="button" onClick={startCreate}
            className="inline-flex items-center gap-2 rounded-full border border-brown/10 bg-white px-4 py-2 text-sm font-semibold text-brown transition hover:bg-cream-2">
            <X size={16} /> Отмена
          </button>
        )}
      />

      <form onSubmit={handleSave} className="mb-10 rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="mb-5 font-oswald text-xl uppercase text-brown">
          {editingId == null ? 'Новая категория' : `Редактирование #${editingId}`}
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Название">
            <input required maxLength={50} value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="input" />
          </Field>
          <Field label="Slug (a-z, цифры, дефис)">
            <input required pattern="^[a-z0-9-]+$" maxLength={50} value={form.slug}
              onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
              className="input" />
          </Field>
        </div>

        <ErrorBanner message={error} />

        <div className="mt-6 flex gap-3">
          <button type="submit" disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-brown px-6 py-3 text-sm font-semibold text-cream transition hover:bg-pink disabled:opacity-50">
            {saving ? 'Сохраняю…' : editingId == null ? <><Plus size={16}/> Создать</> : 'Сохранить'}
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
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Название</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3 text-right">Действия</th>
              </tr>
            </thead>
            <tbody>
              {items.map(c => (
                <tr key={c.id} className={cn(
                  'border-b border-brown/5 transition',
                  editingId === c.id ? 'bg-pink-soft/40' : 'hover:bg-cream-2/50',
                )}>
                  <td className="px-4 py-3 text-brown-soft">#{c.id}</td>
                  <td className="px-4 py-3 font-semibold text-brown">{c.name}</td>
                  <td className="px-4 py-3 text-brown-soft font-mono text-xs">{c.slug}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => startEdit(c)}
                        aria-label="Редактировать"
                        className="grid h-8 w-8 place-items-center rounded-full bg-cream-2 text-brown transition hover:bg-pink-soft">
                        <Pencil size={14} />
                      </button>
                      <button type="button" onClick={() => handleDelete(c)}
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
