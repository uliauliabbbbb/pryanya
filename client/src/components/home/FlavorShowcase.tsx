import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Stars } from '@/components/ui/Stars';
import { useCart } from '@/store/cart';
import { cn, formatPrice } from '@/lib/utils';
import type { Product } from '@/types';

interface FlavorShowcaseProps {
  products: Product[];
}

export function FlavorShowcase({ products }: FlavorShowcaseProps) {
  const flavors = products.slice(0, 6);
  const addProduct = useCart(s => s.addProduct);

  const [idx, setIdx] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [animating, setAnimating] = useState(false);
  const dragStart = useRef<number | null>(null);
  const dragging = useRef(false);

  const goTo = useCallback((i: number) => {
    setIdx(curr => {
      if (i === curr) return curr;
      setAnimating(true);
      setTimeout(() => {
        setIdx(i);
        setAnimating(false);
      }, 500);
      return curr;
    });
  }, []);

  const goNext = useCallback(
    () => goTo((idx + 1) % flavors.length),
    [idx, flavors.length, goTo],
  );
  const goPrev = useCallback(
    () => goTo((idx - 1 + flavors.length) % flavors.length),
    [idx, flavors.length, goTo],
  );

  // Авто-ротация 4с (пауза при hover)
  useEffect(() => {
    if (hovered || flavors.length < 2) return;
    const t = setInterval(() => goNext(), 4000);
    return () => clearInterval(t);
  }, [hovered, flavors.length, goNext]);

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent) => {
    dragStart.current = e.touches[0]!.clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (dragStart.current == null) return;
    const dx = e.changedTouches[0]!.clientX - dragStart.current;
    if (Math.abs(dx) > 40) (dx < 0 ? goNext : goPrev)();
    dragStart.current = null;
  };

  // Mouse drag (для свайпа на десктопе)
  const onMouseDown = (e: React.MouseEvent) => {
    dragStart.current = e.clientX;
    dragging.current = true;
  };
  const onMouseUp = (e: React.MouseEvent) => {
    if (!dragging.current || dragStart.current == null) return;
    const dx = e.clientX - dragStart.current;
    if (Math.abs(dx) > 60) (dx < 0 ? goNext : goPrev)();
    dragStart.current = null;
    dragging.current = false;
  };
  const onMouseLeaveDrag = () => {
    dragStart.current = null;
    dragging.current = false;
  };

  // Стрелки клавиатуры на hover
  useEffect(() => {
    if (!hovered) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [hovered, goPrev, goNext]);

  if (flavors.length === 0) return null;

  const flavor = flavors[idx]!;
  const show = hovered;
  const dark = flavor.brandIsDark;
  const fg = show ? (dark ? '#FFF8F0' : '#3D2B1F') : '#3D2B1F';
  const fgSoft = show
    ? dark ? 'rgba(255,248,240,0.85)' : 'rgba(61,43,31,0.85)'
    : '#7A5A45';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        onMouseLeaveDrag();
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      className="relative py-10 select-none"
    >
      {/* Arrows */}
      <button
        type="button"
        onClick={goPrev}
        aria-label="Предыдущий вкус"
        className="absolute top-1/2 z-[5] grid h-[54px] w-[54px] -translate-y-1/2 place-items-center rounded-full border border-brown/5 bg-white text-brown shadow-lg transition-all duration-300 ease-smooth hover:scale-110 hover:bg-brown hover:text-white"
        style={{ left: 'clamp(4px, 1vw, 16px)' }}
      >
        <ChevronLeft size={22} strokeWidth={2.4} />
      </button>
      <button
        type="button"
        onClick={goNext}
        aria-label="Следующий вкус"
        className="absolute top-1/2 z-[5] grid h-[54px] w-[54px] -translate-y-1/2 place-items-center rounded-full border border-brown/5 bg-white text-brown shadow-lg transition-all duration-300 ease-smooth hover:scale-110 hover:bg-brown hover:text-white"
        style={{ right: 'clamp(4px, 1vw, 16px)' }}
      >
        <ChevronRight size={22} strokeWidth={2.4} />
      </button>

      {/* Grid */}
      <div
        className="relative mx-auto grid max-w-[1100px] items-center gap-5 lg:grid-cols-[1.1fr_1fr] lg:gap-14"
        style={{ minHeight: 'clamp(360px, 42vw, 520px)' }}
      >
        {/* Coloured banner backdrop */}
        <div
          aria-hidden
          className="absolute z-0 rounded-[32px] transition-all duration-[600ms] ease-smooth"
          style={{
            top: '-4%',
            bottom: '-4%',
            left: '-3%',
            width: '62%',
            background: flavor.brandBg,
            transform: show ? 'scale(1, 1)' : 'scale(0.95, 0)',
            transformOrigin: 'left center',
            opacity: show ? 1 : 0,
            boxShadow: show ? `0 30px 60px ${flavor.brandBg}33` : 'none',
          }}
        />

        {/* LEFT — text */}
        <div
          className="relative z-[1] px-5 py-7 md:px-10"
          style={{
            opacity: animating ? 0 : 1,
            transform: animating ? 'translateY(-20px)' : 'translateY(0)',
            transition: 'opacity 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <div
            className="mb-3.5 text-[13px] font-medium uppercase tracking-[.18em] transition-colors duration-300"
            style={{ color: fgSoft }}
          >
            {flavor.category.name} · {flavor.badge ?? 'Вкус недели'}
          </div>

          <h2
            className="mb-4 font-oswald uppercase leading-[1.1] tracking-[-0.005em] transition-colors duration-300"
            style={{
              color: fg,
              fontSize: 'clamp(36px, 5.6vw, 68px)',
              fontWeight: 700,
            }}
          >
            {flavor.name}
          </h2>

          <p
            className="mb-7 max-w-[440px] font-medium leading-[1.55] transition-colors duration-300"
            style={{
              color: fg,
              opacity: show ? 0.92 : 1,
              fontSize: 'clamp(15px, 1.4vw, 17px)',
            }}
          >
            {flavor.description}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              to={`/catalog/${flavor.id}`}
              className={cn(
                'inline-flex items-center justify-center rounded-full text-sm font-semibold uppercase tracking-[.06em] transition-all duration-[400ms] ease-smooth hover:-translate-y-0.5',
                show ? 'border-2 px-7 py-3.5' : 'border-2 border-transparent px-0 py-3.5',
              )}
              style={{
                color: fg,
                borderColor: show ? (dark ? '#FFF8F0' : '#3D2B1F') : 'transparent',
              }}
            >
              Подробнее
            </Link>

            <button
              type="button"
              onClick={() => addProduct(flavor)}
              className={cn(
                'inline-flex items-center gap-2 rounded-full text-sm font-semibold uppercase tracking-[.06em] transition-all duration-[400ms] ease-smooth hover:-translate-y-0.5',
                show
                  ? 'bg-brown px-7 py-3.5 text-white shadow-[0_10px_24px_rgba(61,43,31,.25)]'
                  : 'px-0 py-3.5 text-brown',
              )}
            >
              Заказать
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Price */}
          <div className="mt-6 inline-flex items-baseline gap-2.5">
            <span
              className="font-oswald font-bold leading-none transition-colors duration-300"
              style={{ color: fg, fontSize: 32 }}
            >
              {formatPrice(flavor.price)}
            </span>
            {flavor.oldPrice && (
              <span
                className="text-sm line-through transition-colors duration-300"
                style={{ color: fg, opacity: 0.5 }}
              >
                {formatPrice(flavor.oldPrice)}
              </span>
            )}
            <Stars rating={flavor.ratingAvg} size={14} />
          </div>
        </div>

        {/* RIGHT — big photo */}
        <div
          className="relative z-[1] flex items-center justify-center"
          style={{
            opacity: animating ? 0 : 1,
            transform: animating ? 'translateY(-20px)' : 'translateY(0)',
            transition: 'opacity 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <div
            className="relative flex aspect-square items-center justify-center"
            style={{ width: 'min(360px, 80%)' }}
          >
            <img
              src={flavor.photo}
              alt={flavor.name}
              className="block animate-floatY"
              style={{
                width: 'clamp(260px, 30vw, 400px)',
                height: 'auto',
                transform: 'rotate(15deg) translateX(250px)',
                filter: 'drop-shadow(0 30px 50px rgba(61,43,31,.25))',
              }}
            />
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="relative z-[2] mt-7 flex items-center justify-center gap-2.5">
        {flavors.map((f, i) => (
          <button
            key={f.id}
            type="button"
            aria-label={`Вкус ${i + 1}: ${f.name}`}
            onClick={() => goTo(i)}
            className="rounded-full border-0 p-0 transition-all duration-[400ms] ease-smooth"
            style={{
              width: i === idx ? 36 : 10,
              height: 10,
              background: i === idx ? '#3D2B1F' : 'rgba(61,43,31,0.20)',
              cursor: 'pointer',
            }}
          />
        ))}
      </div>
    </div>
  );
}
