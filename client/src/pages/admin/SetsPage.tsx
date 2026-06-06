import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { api } from '@/lib/api';
import { ErrorBanner, Field, PageHeader, pickError } from '@/components/admin/AdminUI';
import { PhotoField } from '@/components/admin/PhotoField';
import { cn, formatPrice } from '@/lib/utils';
import type { Product, ProductSet } from '@/types';

interface ItemRow { productId: string; qty: string; }

interface FormState {
  name: string;
  count: string;
  price: string;
  oldPrice: string;
  description: string;
  photo: string;
  isFeatured: boolean;
  items: ItemRow[];
}

const EMPTY: FormState = {
  name: '', count: '', price: '', oldPrice: '',
  description: '', photo: '', isFeatured: false,
  items: [{ productId: '', qty: '1' }],
};

export function AdminSetsPage() {
  const [sets, setSets] = useState<ProductSet[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const [s, p] = await Promise.all([
        api.get<ProductSet[]>('/sets'),
        api.get<Product[]>('/products'),
      ]);
      setSets(s.data);
      setProducts(p.data);
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

  function startEdit(s: ProductSet) {
    setEditingId(s.id);
    setForm({
      name: s.name,
      count: String(s.count),
      price: String(s.price),
      oldPrice: s.oldPrice == null ? '' : String(s.oldPrice),
      description: s.description,
      photo: s.photo ?? '',
      isFeatured: s.isFeatured,
      items: s.items.length
        ? s.items.map(it => ({ productId: String(it.productId), qty: String(it.qty) }))
        : [{ productId: '', qty: '1' }],
    });
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function setItemRow(idx: number, patch: Partial<ItemRow>) {
    setForm(f => ({
      ...f,
      items: f.items.map((it, i) => i === idx ? { ...it, ...patch } : it),
    }));
  }
  function addItemRow() {
    setForm(f => ({ ...f, items: [...f.items, { productId: '', qty: '1' }] }));
  }
  function removeItemRow(idx: number) {
    setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const items = form.items
      .filter(it => it.productId !== '' && Number(it.qty) > 0)
      .map(it => ({ productId: Number(it.productId), qty: Number(it.qty) }));

    if (items.length === 0) {
      setError('Добавьте хотя бы один товар в состав');
      setSaving(false);
      return;
    }

    const payload = {
      name: form.name.trim(),
      count: Number(form.count),
      price: Number(form.price),
      oldPrice: form.oldPrice.trim() === '' ? null : Number(form.oldPrice),
      description: form.description.trim(),
      photo: form.photo.trim() === '' ? null : form.photo.trim(),
      isFeatured: form.isFeatured,
      items,
    };

    try {
      if (editingId == null) await api.post('/sets', payload);
      else await api.patch(`/sets/${editingId}`, payload);
      await refresh();
      startCreate();
    } catch (e) {
      setError(pickError(e, 'Не удалось сохранить'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(s: ProductSet) {
    if (!confirm(`Удалить сет «${s.name}»?`)) return;
    setError(null);
    try {
      await api.delete(`/sets/${s.id}`);
      await refresh();
      if (editingId === s.id) startCreate();
    } catch (e) {
      setError(pickError(e, 'Не удалось удалить'));
    }
  }

  const productById = new Map(products.map(p => [p.id, p]));

  return (
    <div>
      <PageHeader
        title="Сеты"
        subtitle={`Всего сетов: ${sets.length}.`}
        right={editingId !== null && (
          <button type="button" onClick={startCreate}
            className="inline-flex items-center gap-2 rounded-full border border-brown/10 bg-white px-4 py-2 text-sm font-semibold text-brown transition hover:bg-cream-2">
            <X size={16} /> Отмена
          </button>
        )}
      />

      <form onSubmit={handleSave} className="mb-10 rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="mb-5 font-oswald text-xl uppercase text-brown">
          {editingId == null ? 'Новый сет' : `Редактирование #${editingId}`}
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Название">
            <input required maxLength={200} value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="input" />
          </Field>
          <Field label="Кол-во штук в сете">
            <input required type="number" min="1" step="1" value={form.count}
              onChange={e => setForm(f => ({ ...f, count: e.target.value }))}
              className="input" />
          </Field>
          <Field label="Цена (₽)">
            <input required type="number" min="1" step="1" value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              className="input" />
          </Field>
          <Field label="Старая цена (опц.)">
            <input type="number" min="1" step="1" value={form.oldPrice}
              onChange={e => setForm(f => ({ ...f, oldPrice: e.target.value }))}
              className="input" />
          </Field>
          <PhotoField
            label="Фото (опц.)"
            value={form.photo}
            onChange={path => setForm(f => ({ ...f, photo: path }))}
            optional
          />
          <Field label="Крупная карточка">
            <label className="inline-flex items-center gap-2 py-2">
              <input type="checkbox" checked={form.isFeatured}
                onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} />
              <span className="text-sm text-brown">показывать на «/sets» в 2 колонки</span>
            </label>
          </Field>
        </div>

        <Field label="Описание" className="mt-4">
          <textarea required rows={3} value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="input resize-y" />
        </Field>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-brown-soft">Состав сета</span>
            <button type="button" onClick={addItemRow}
              className="inline-flex items-center gap-1 rounded-full bg-cream-2 px-3 py-1 text-xs font-semibold text-brown transition hover:bg-pink-soft">
              <Plus size={12} /> добавить товар
            </button>
          </div>
          <div className="space-y-2">
            {form.items.map((it, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_100px_auto] items-center gap-2">
                <select required value={it.productId}
                  onChange={e => setItemRow(idx, { productId: e.target.value })}
                  className="input">
                  <option value="">— выбрать товар —</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({formatPrice(p.price)})</option>
                  ))}
                </select>
                <input required type="number" min="1" step="1" value={it.qty}
                  onChange={e => setItemRow(idx, { qty: e.target.value })}
                  className="input" />
                <button type="button" onClick={() => removeItemRow(idx)}
                  aria-label="Убрать"
                  className="grid h-9 w-9 place-items-center rounded-full bg-cream-2 text-pink transition hover:bg-pink hover:text-white">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
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
                <th className="px-4 py-3">Цена</th>
                <th className="px-4 py-3">Состав</th>
                <th className="px-4 py-3">Витрина</th>
                <th className="px-4 py-3 text-right">Действия</th>
              </tr>
            </thead>
            <tbody>
              {sets.map(s => (
                <tr key={s.id} className={cn(
                  'border-b border-brown/5 transition',
                  editingId === s.id ? 'bg-pink-soft/40' : 'hover:bg-cream-2/50',
                )}>
                  <td className="px-4 py-3 text-brown-soft">#{s.id}</td>
                  <td className="px-4 py-3 font-semibold text-brown">{s.name}</td>
                  <td className="px-4 py-3 font-medium">
                    {formatPrice(s.price)}
                    {s.oldPrice && (
                      <span className="ml-2 text-xs text-brown-soft line-through">{formatPrice(s.oldPrice)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-brown-soft text-xs">
                    {s.items.map(it => {
                      const p = productById.get(it.productId);
                      return `${p?.name ?? `#${it.productId}`} ×${it.qty}`;
                    }).join(', ') || '—'}
                  </td>
                  <td className="px-4 py-3 text-brown-soft">{s.isFeatured ? 'да' : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => startEdit(s)}
                        aria-label="Редактировать"
                        className="grid h-8 w-8 place-items-center rounded-full bg-cream-2 text-brown transition hover:bg-pink-soft">
                        <Pencil size={14} />
                      </button>
                      <button type="button" onClick={() => handleDelete(s)}
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
