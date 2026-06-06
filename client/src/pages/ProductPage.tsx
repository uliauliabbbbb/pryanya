import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Stars } from '@/components/ui/Stars';
import { IngredientsPanel } from '@/components/product/IngredientsPanel';
import { ProductCard } from '@/components/product/ProductCard';
import { useApi } from '@/lib/useApi';
import { useCart } from '@/store/cart';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types';

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);

  const { data: product, loading, error } = useApi<Product>(`/products/${productId}`);
  const { data: related } = useApi<Product[]>(`/products/${productId}/related`);

  const [qty, setQty] = useState(1);
  const addProduct = useCart(s => s.addProduct);

  if (loading) {
    return <div className="container-page py-20 text-center text-brown-soft">Загружаю…</div>;
  }
  if (error || !product) {
    return (
      <div className="container-page py-20 text-center">
        <h3 className="font-oswald text-2xl uppercase text-brown">Пряник не найден</h3>
        <p className="mt-2 text-brown-soft">{error ?? 'Попробуйте каталог'}</p>
        <Link to="/catalog" className="mt-6 inline-block text-pink font-semibold">← В каталог</Link>
      </div>
    );
  }

  return (
    <div className="container-page pt-8 pb-4">
      <Link
        to="/catalog"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-brown-soft transition hover:text-pink"
      >
        <ArrowLeft size={16} />
        Вернуться в каталог
      </Link>

      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-[clamp(40px,7vw,110px)]">
        {/* Photo tile */}
        <div
          className="relative flex h-[360px] items-center justify-center overflow-hidden rounded-[32px] animate-fadeInUp md:h-[440px] lg:h-[520px]"
          style={{
            background: `linear-gradient(160deg, ${product.brandBg}33 0%, ${product.brandBg}1a 60%, #FFF8F0 100%)`,
          }}
        >
          {/* Decorative blur blob */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-[15%] top-[15%] aspect-square w-[70%] rounded-full opacity-20 blur-3xl"
            style={{ background: product.brandBg }}
          />

          {product.badge && (
            <div className="absolute left-6 top-6 z-[2]">
              <Badge kind={product.badge} />
            </div>
          )}

          <img
            src={product.photo}
            alt={product.name}
            className="relative z-[1] block animate-floatY object-contain"
            style={{
              width: 'min(75%, 420px)',
              height: 'auto',
              filter: 'drop-shadow(0 40px 60px rgba(61,43,31,.28))',
            }}
          />
        </div>

        {/* Info */}
        <div className="animate-fadeInUp" style={{ animationDelay: '.1s' }}>
          <span className="mb-3.5 inline-block rounded-full bg-cream-2 px-3 py-1.5 text-xs font-semibold text-brown-soft">
            {product.category.name}
          </span>

          <h1 className="mb-4 font-oswald text-[clamp(32px,5vw,48px)] uppercase leading-[1.05] text-brown">
            {product.name}
          </h1>

          <div className="mb-6 flex items-center gap-3.5">
            <Stars rating={product.ratingAvg} size={18} />
            <span className="text-sm text-brown-soft">
              {product.ratingAvg.toFixed(1)} · {product.reviewsCount} отзывов
            </span>
          </div>

          <p className="mb-7 text-base leading-[1.7] text-brown-soft">
            {product.description}
          </p>

          {/* Price + qty block */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-cream-2 px-7 py-6">
            <div>
              <div className="mb-1.5 text-xs font-semibold uppercase tracking-[.08em] text-brown-soft">
                Цена
              </div>
              <div className="flex items-baseline gap-2.5">
                <span className="font-oswald text-[36px] font-bold leading-none text-brown">
                  {formatPrice(product.price * qty)}
                </span>
                {product.oldPrice && (
                  <span className="text-base text-brown-soft line-through">
                    {formatPrice(product.oldPrice * qty)}
                  </span>
                )}
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-white p-1.5 shadow-sm">
              <button
                type="button"
                aria-label="Уменьшить количество"
                onClick={() => setQty(q => Math.max(1, q - 1))}
                className="grid h-9 w-9 place-items-center rounded-full bg-cream-2 text-brown transition hover:bg-cream-2/70"
              >
                <Minus size={16} />
              </button>
              <span className="min-w-[40px] text-center text-base font-bold">
                {qty}
              </span>
              <button
                type="button"
                aria-label="Увеличить количество"
                onClick={() => setQty(q => q + 1)}
                className="grid h-9 w-9 place-items-center rounded-full bg-pink text-white transition hover:bg-pink-deep"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => addProduct(product, qty)}
              className="inline-flex flex-1 items-center justify-center gap-2.5 rounded-full border border-brown/10 bg-white px-6 py-[18px] text-base font-semibold text-brown transition-all duration-500 ease-smooth hover:border-transparent hover:bg-[#F0729E] hover:text-white"
              style={{ flexBasis: 240 }}
            >
              <ShoppingBag size={18} strokeWidth={2.2} />
              Добавить в корзину
            </button>
          </div>

          {/* Ingredients */}
          {product.ingredients && <IngredientsPanel items={product.ingredients} />}
        </div>
      </div>

      {/* Related */}
      {related && related.length > 0 && (
        <div className="mt-20">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="font-oswald text-[clamp(24px,3.5vw,34px)] uppercase text-brown">
              Похожие пряники
            </h2>
            <Link
              to="/catalog"
              className="inline-flex items-center gap-1 text-sm font-semibold text-pink hover:text-pink-deep"
            >
              Все пряники <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} delay={i * 0.05} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
