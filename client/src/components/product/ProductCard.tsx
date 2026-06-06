import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Stars } from '@/components/ui/Stars';
import { useCart } from '@/store/cart';
import { cn, formatPrice } from '@/lib/utils';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  delay?: number;
}

export function ProductCard({ product, delay = 0 }: ProductCardProps) {
  const addProduct = useCart(s => s.addProduct);
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const dark = product.brandIsDark;

  const fgClass = hovered && dark ? 'text-cream' : 'text-brown';
  const mutedClass = hovered
    ? dark ? 'text-cream/70' : 'text-brown/70'
    : 'text-brown-soft';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/catalog/${product.id}`)}
      onKeyDown={e => e.key === 'Enter' && navigate(`/catalog/${product.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative cursor-pointer overflow-hidden rounded-3xl shadow-sm transition-all duration-[400ms] ease-smooth animate-fadeInUp focus:outline-none focus-visible:ring-2 focus-visible:ring-pink"
      style={{
        animationDelay: `${delay}s`,
        backgroundColor: hovered ? product.brandBg : '#FFFFFF',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered ? `0 24px 48px ${product.brandBg}66` : '0 4px 14px rgba(61,43,31,0.06)',
        transition: 'background-color .5s ease, transform .4s cubic-bezier(0.16,1,0.3,1), box-shadow .4s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      {product.badge && (
        <div className="absolute left-3.5 top-3.5 z-10">
          <Badge kind={product.badge} />
        </div>
      )}

      {/* Photo tile */}
      <div
        className="relative flex h-[200px] items-center justify-center overflow-hidden"
        style={{
          background: hovered
            ? 'transparent'
            : 'linear-gradient(160deg, #FFF0F5 0%, #FFF8F0 50%, #FBEFE0 100%)',
          transition: 'background .5s ease',
        }}
      >
        <img
          src={product.photo}
          alt={product.name}
          loading="lazy"
          className="block object-contain transition-all duration-500 ease-smooth"
          style={{
            width:  hovered ? 180 : 160,
            height: hovered ? 180 : 160,
            transform: hovered ? 'rotate(8deg)' : 'rotate(0deg)',
            filter: hovered
              ? 'drop-shadow(0 24px 30px rgba(0,0,0,.25))'
              : 'drop-shadow(0 12px 18px rgba(61,43,31,.15))',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-[1] px-[18px] pb-5 pt-4">
        <span
          className={cn(
            'mb-2 inline-block rounded-full px-2.5 py-[3px] text-[11px] font-semibold transition-colors',
            hovered
              ? dark ? 'bg-white/18 text-cream/70' : 'bg-white/30 text-brown/70'
              : 'bg-cream-2 text-brown-soft',
          )}
        >
          {product.category.name}
        </span>

        <h3
          className={cn(
            'mb-2 line-clamp-2 text-[18px] font-semibold leading-[1.25] transition-colors',
            fgClass,
          )}
        >
          {product.name}
        </h3>

        <div className="mb-3.5 flex items-center gap-2">
          <Stars rating={product.ratingAvg} size={13} />
          <span className={cn('text-xs transition-colors', mutedClass)}>
            {product.ratingAvg.toFixed(1)} ({product.reviewsCount})
          </span>
        </div>

        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-baseline gap-2">
            <span
              className={cn('font-oswald text-[22px] font-bold transition-colors', fgClass)}
            >
              {formatPrice(product.price)}
            </span>
            {product.oldPrice && (
              <span className={cn('text-[13px] line-through transition-colors', mutedClass)}>
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              addProduct(product);
            }}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3.5 py-2.5 text-[13px] font-semibold transition-all duration-300 ease-smooth',
              hovered
                ? dark
                  ? 'bg-cream text-brown hover:bg-[#F0729E] hover:text-white'
                  : 'bg-brown text-cream hover:bg-[#F0729E] hover:text-white'
                : 'border border-brown/10 bg-white text-brown shadow-sm hover:border-transparent hover:bg-[#F0729E] hover:text-white',
            )}
          >
            <Plus size={16} strokeWidth={2.5} />
            В&nbsp;корзину
          </button>
        </div>
      </div>
    </div>
  );
}
