import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { useApi } from '@/lib/useApi';
import { useCart } from '@/store/cart';
import { cn, formatPrice } from '@/lib/utils';
import type { Product, ProductSet } from '@/types';

const SET_EMOJI: Record<number, string> = {
  1: '🎁',
  2: '🎀',
  3: '🍂',
  4: '🎉',
};

function SetCard({
  set,
  delay,
  productById,
}: {
  set: ProductSet;
  delay: number;
  productById: Map<number, Product>;
}) {
  const featured = set.isFeatured;
  const discount = set.oldPrice
    ? Math.round((1 - set.price / set.oldPrice) * 100)
    : null;
  const addSet = useCart(s => s.addSet);

  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-3xl bg-white text-brown shadow-sm transition-all duration-500 ease-smooth animate-fadeInUp hover:-translate-y-1.5',
        featured && 'sm:col-span-2',
      )}
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Image area */}
      <div
        className={cn(
          'relative flex items-center justify-center bg-white',
          featured ? 'h-[400px]' : 'h-[200px]',
        )}
        style={{
          background: featured
            ? '#ffffff'
            : 'linear-gradient(160deg, #FFF0F5 0%, #FFF8F0 60%, #FBEFE0 100%)',
        }}
      >
        {set.photo ? (
          <img
            src={set.photo}
            alt={set.name}
            className={cn(
              'block w-auto object-contain transition-transform duration-500 ease-smooth group-hover:scale-105',
              featured ? 'max-h-[360px]' : 'max-h-[180px]',
            )}
            style={{ filter: 'drop-shadow(0 24px 36px rgba(61,43,31,.18))' }}
          />
        ) : (
          <span
            className="block transition-transform duration-500 ease-smooth group-hover:scale-110 group-hover:rotate-[8deg]"
            style={{ fontSize: 96 }}
          >
            {SET_EMOJI[set.id] ?? '🎁'}
          </span>
        )}

        {/* Pranik count chip */}
        <div className="absolute bottom-4 left-4 inline-flex items-center rounded-full bg-brown/85 px-3.5 py-1.5 text-[13px] font-bold text-white backdrop-blur-md">
          {set.count} пряников
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-7">
        <h3
          className={cn(
            'mb-2.5 font-oswald uppercase leading-[1.15] text-brown',
            featured ? 'text-[30px]' : 'text-[22px]',
          )}
        >
          {set.name}
        </h3>

        <p
          className="mb-4 text-sm leading-[1.6] text-brown-soft"
          style={{ minHeight: featured ? undefined : 60 }}
        >
          {set.description}
        </p>

        {/* Set contents */}
        <div className="mb-5">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-[.1em] text-pink">
            Состав
          </div>
          <div className="flex flex-wrap gap-1.5">
            {set.items.map(it => {
              const p = productById.get(it.productId);
              if (!p) return null;
              const firstWord = p.name.split(' ')[0];
              return (
                <span
                  key={it.productId}
                  title={p.name}
                  className="inline-flex items-center gap-1.5 rounded-full bg-cream-2 px-2.5 py-1 text-[11px] font-medium text-brown"
                >
                  <img
                    src={p.photo}
                    alt=""
                    className="block h-[18px] w-[18px] rounded-full object-contain"
                  />
                  {firstWord}
                </span>
              );
            })}
          </div>
        </div>

        {/* Price + CTA */}
        <div className="mt-auto flex flex-wrap items-end justify-between gap-3.5">
          <div>
            {set.oldPrice && (
              <div className="text-xs text-brown-soft line-through">
                {formatPrice(set.oldPrice)}
              </div>
            )}
            <div className="flex items-baseline gap-2">
              <span
                className={cn(
                  'font-oswald font-bold leading-none text-brown',
                  featured ? 'text-[36px]' : 'text-[28px]',
                )}
              >
                {formatPrice(set.price)}
              </span>
              {discount !== null && (
                <span
                  className={cn(
                    'inline-block rounded-full px-2 py-0.5 text-[11px] font-bold',
                    featured
                      ? 'bg-gold text-brown'
                      : 'bg-pink-soft text-pink-deep',
                  )}
                >
                  −{discount}%
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => addSet(set)}
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold transition-all duration-300 ease-smooth hover:-translate-y-0.5',
              featured
                ? 'bg-gold text-brown hover:bg-gold-soft'
                : 'border border-brown/10 bg-white text-brown shadow-sm hover:border-transparent hover:bg-[#F0729E] hover:text-white',
            )}
          >
            Заказать
          </button>
        </div>
      </div>
    </div>
  );
}

export function SetsPage() {
  const { data: sets, loading, error } = useApi<ProductSet[]>('/sets');
  const { data: products } = useApi<Product[]>('/products');
  const productById = useMemo(
    () => new Map((products ?? []).map(p => [p.id, p])),
    [products],
  );

  return (
    <div>
      <PageHeader
        title="Сеты пряников"
        subtitle="Подарите коробку счастья. Сеты упакованы в крафтовые коробки с лентой и открыткой."
      />

      <div className="container-page pb-10">
        {loading ? (
          <div className="py-16 text-center text-brown-soft">Загружаю…</div>
        ) : error ? (
          <div className="py-16 text-center text-pink-deep">{error}</div>
        ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {sets?.map((set, i) => (
            <SetCard key={set.id} set={set} delay={i * 0.08} productById={productById} />
          ))}
        </div>
        )}

        {/* CTA — индивидуальный сет */}
        <div className="mt-16 flex flex-wrap items-center justify-between gap-6 rounded-3xl bg-gradient-to-br from-pink-soft to-cream px-9 py-10">
          <div className="max-w-[520px]">
            <h3 className="mb-2 font-oswald text-[28px] uppercase text-brown">
              Хотите свой сет?
            </h3>
            <p className="text-brown-soft leading-[1.6]">
              Соберём индивидуальный набор под ваш повод — свадьба, корпоратив, день рождения.
              Брендируем коробку и сделаем открытку с вашим текстом.
            </p>
          </div>
          <Link
            to="/contacts"
            className="inline-flex items-center gap-2 rounded-full bg-brown px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-brown/90"
          >
            Заказать индивидуальный сет <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
