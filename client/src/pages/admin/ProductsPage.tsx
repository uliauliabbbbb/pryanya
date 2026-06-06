import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { api } from '@/lib/api';
import { PhotoField } from '@/components/admin/PhotoField';
import { cn, formatPrice } from '@/lib/utils';
import type { Product } from '@/types';

interface Category {
  id: number;
  name: string;
  slug: string;
}

const BADGES = ['Хит', 'Новинка', 'Сезонный', 'Премиум'] as const;
type BadgeRu = typeof BADGES[number];

interface FormState {
  name: string;
  price: string;
  oldPrice: string;
  categoryId: string;
  photo: string;
  badge: BadgeRu | '';
  description: string;
  brandBg: string;
  brandIsDark: boolean;
}

const EMPTY: FormState = {
  name: '',
  price: '',
  oldPrice: '',
  categoryId: '',
  photo: '/products/1_.png',
  badge: '',
  description: '',
  brandBg: '#F472B6',
  brandIsDark: false,
};

function pickError(e: unknown, fallback: string): string {
  const ax = e as { response?: { data?: { error?: string } } };
  return ax.response?.data?.error ?? fallback;
}

export function AdminProductsPage() {
  const [products, setProducts]   = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]     = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm]           = useState<FormState>(EMPTY);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([
        api.get<Product[]>('/products'),
        api.get<Category[]>('/categories'),
      ]);
      setProducts(p.data);
      setCategories(c.data);
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

  function startEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      price: String(p.price),
      oldPrice: p.oldPrice == null ? '' : String(p.oldPrice),
      categoryId: String(p.category.id),
      photo: p.photo,
      badge: (p.badge ?? '') as BadgeRu | '',
      description: p.description,
      brandBg: p.brandBg,
      brandIsDark: p.brandIsDark,
    });
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      oldPrice: form.oldPrice.trim() === '' ? null : Number(form.oldPrice),
      categoryId: Number(form.categoryId),
      photo: form.photo.trim(),
      badge: form.badge === '' ? null : form.badge,
      description: form.description.trim(),
      brandBg: form.brandBg.trim(),
      brandIsDark: form.brandIsDark,
    };

    try {
      if (editingId == null) {
        await api.post('/products', payload);
      } else {
        await api.patch(`/products/${editingId}`, payload);
      }
      await refresh();
      startCreate();
    } catch (e) {
      setError(pickError(e, 'Не удалось сохранить'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(p: Product) {
    if (!confirm(`Удалить «${p.name}»? Это действие необратимо.`)) return;
    setError(null);
    try {
      await api.delete(`/products/${p.id}`);
      await refresh();
      if (editingId === p.id) startCreate();
    } catch (e) {
      setError(pickError(e, 'Не удалось удалить'));
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-oswald text-3xl font-bold uppercase text-brown">Товары</h1>
          <p className="mt-1 text-sm text-brown-soft">
            Всего пряников: {products.length}. Создание / редактирование / удаление пишет напрямую в БД.
          </p>
        </div>
        {editingId !== null && (
          <button
            type="button"
            onClick={startCreate}
            className="inline-flex items-center gap-2 rounded-full border border-brown/10 bg-white px-4 py-2 text-sm font-semibold text-brown transition hover:bg-cream-2"
          >
            <X size={16} /> Отмена
          </button>
        )}
      </div>

      <form
        onSubmit={handleSave}
        className="mb-10 rounded-3xl bg-white p-6 shadow-sm"
      >
        <h2 className="mb-5 font-oswald text-xl uppercase text-brown">
          {editingId == null ? 'Новый пряник' : `Редактирование #${editingId}`}
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Название">
            <input required maxLength={200} value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="input" />
          </Field>

          <Field label="Категория">
            <select required value={form.categoryId}
              onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
              className="input">
              <option value="">— выбрать —</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Цена (₽)">
            <input required type="number" min="1" step="1" value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              className="input" />
          </Field>

          <Field label="Старая цена (для зачёркивания, опционально)">
            <input type="number" min="1" step="1" value={form.oldPrice}
              onChange={e => setForm(f => ({ ...f, oldPrice: e.target.value }))}
              className="input" />
          </Field>

          <PhotoField
            label="Фото"
            value={form.photo}
            onChange={path => setForm(f => ({ ...f, photo: path }))}
            required
            previewBg={form.brandBg}
          />

          <Field label="Бейдж">
            <select value={form.badge}
              onChange={e => setForm(f => ({ ...f, badge: e.target.value as BadgeRu | '' }))}
              className="input">
              <option value="">— нет —</option>
              {BADGES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </Field>

          <Field label="Цвет фона (HEX #RRGGBB)">
            <div className="flex items-center gap-2">
              <input required pattern="^#[0-9A-Fa-f]{6}$" value={form.brandBg}
                onChange={e => setForm(f => ({ ...f, brandBg: e.target.value }))}
                className="input flex-1" />
              <span
                aria-hidden
                className="h-10 w-10 rounded-full border border-brown/10"
                style={{ background: form.brandBg }}
              />
            </div>
          </Field>

          <Field label="Тёмный фон (брать светлый текст)">
            <label className="inline-flex items-center gap-2 py-2">
              <input type="checkbox" checked={form.brandIsDark}
                onChange={e => setForm(f => ({ ...f, brandIsDark: e.target.checked }))} />
              <span className="text-sm text-brown">да, фон тёмный</span>
            </label>
          </Field>
        </div>

        <Field label="Описание" className="mt-4">
          <textarea required rows={3} value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="input resize-y" />
        </Field>

        {error && (
          <div className="mt-4 rounded-2xl bg-pink/10 px-4 py-3 text-sm text-pink">
            {error}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button type="submit" disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-brown px-6 py-3 text-sm font-semibold text-cream transition hover:bg-pink disabled:opacity-50">
            {saving ? 'Сохраняю…' : editingId == null ? <><Plus size={16}/> Создать</> : 'Сохранить изменения'}
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
                <th className="px-4 py-3">Фото</th>
                <th className="px-4 py-3">Название</th>
                <th className="px-4 py-3">Категория</th>
                <th className="px-4 py-3">Цена</th>
                <th className="px-4 py-3">Бейдж</th>
                <th className="px-4 py-3">Рейтинг</th>
                <th className="px-4 py-3 text-right">Действия</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className={cn(
                  'border-b border-brown/5 transition',
                  editingId === p.id ? 'bg-pink-soft/40' : 'hover:bg-cream-2/50',
                )}>
                  <td className="px-4 py-3 text-brown-soft">#{p.id}</td>
                  <td className="px-4 py-3">
                    <img src={p.photo} alt="" className="h-12 w-12 object-contain"
                      style={{ background: p.brandBg, borderRadius: 8 }} />
                  </td>
                  <td className="px-4 py-3 font-semibold text-brown">{p.name}</td>
                  <td className="px-4 py-3 text-brown-soft">{p.category.name}</td>
                  <td className="px-4 py-3 font-medium">
                    {formatPrice(p.price)}
                    {p.oldPrice && (
                      <span className="ml-2 text-xs text-brown-soft line-through">
                        {formatPrice(p.oldPrice)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-brown-soft">{p.badge ?? '—'}</td>
                  <td className="px-4 py-3 text-brown-soft">
                    {p.ratingAvg.toFixed(1)} ({p.reviewsCount})
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

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-brown-soft">{label}</span>
      {children}
    </label>
  );
}
