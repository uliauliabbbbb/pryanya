import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { ProductCard } from '@/components/product/ProductCard';
import {
  CATEGORIES_FILTER,
  filterProducts,
  type CategoryFilter,
  type SortOption,
} from '@/lib/mockData';
import { useApi } from '@/lib/useApi';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

export function CatalogPage() {
  const [category, setCategory] = useState<CategoryFilter>('Все');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [query, setQuery] = useState('');

  const { data: products, loading, error } = useApi<Product[]>('/products');

  const filtered = useMemo(
    () => products ? filterProducts(products, { category, sortBy, query }) : [],
    [products, category, sortBy, query],
  );

  return (
    <div>
      <PageHeader
        title="Все пряники"
        subtitle="12 авторских вкусов. Каждый расписан вручную и упакован в крафтовую коробку."
      />

      <div className="container-page py-10">
        {/* Filters */}
        <div className="mb-8 flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between md:gap-6">
          {/* Category chips */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES_FILTER.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={cn(
                  'rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-300',
                  category === c
                    ? 'bg-pink text-white shadow-pink'
                    : 'bg-cream-2 text-brown hover:bg-cream',
                )}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Search + sort */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brown/40"
              />
              <input
                type="search"
                placeholder="Поиск пряников…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full rounded-full border border-brown/10 bg-cream py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-pink/40 focus:bg-white sm:w-56"
              />
            </div>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className="cursor-pointer rounded-full border border-brown/10 bg-cream px-4 py-2.5 text-sm font-medium outline-none transition focus:border-pink/40"
            >
              <option value="popular">По популярности</option>
              <option value="price-asc">Сначала дешевле</option>
              <option value="price-desc">Сначала дороже</option>
              <option value="rating">По рейтингу</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="py-20 text-center text-brown-soft">Загружаю каталог…</div>
        ) : error ? (
          <div className="py-20 text-center">
            <div className="mb-4 text-5xl">⚠️</div>
            <h3 className="font-oswald text-xl uppercase text-brown">Ошибка</h3>
            <p className="mt-2 text-brown-soft">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mb-4 text-6xl">🔍</div>
            <h3 className="font-oswald text-2xl uppercase text-brown">Ничего не найдено</h3>
            <p className="mt-2 text-brown-soft">Попробуйте другой запрос или категорию</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p, i) => (
              <ProductCard key={p.id} product={p} delay={i * 0.05} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
