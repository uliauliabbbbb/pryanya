import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PranyaSpotlight } from '@/components/home/PranyaSpotlight';
import { FlavorShowcase } from '@/components/home/FlavorShowcase';
import { useApi } from '@/lib/useApi';
import type { Product } from '@/types';

const STATS = [
  { value: '2000+',   label: 'счастливых клиентов' },
  { value: '⭐ 4.9',  label: 'средний рейтинг' },
  { value: '21 день', label: 'свежести без консервантов' },
  { value: '5 лет',   label: 'на рынке' },
];

export function HomePage() {
  const { data: products } = useApi<Product[]>('/products');

  return (
    <section
      className="relative overflow-hidden pb-24 pt-12"
      style={{
        background:
          'linear-gradient(120deg, #FFF0F5 0%, #FFF8F0 35%, #FBEFE0 70%, #FFF0F5 100%)',
      }}
    >
      <PranyaSpotlight />

      <div className="container-page relative text-center">
        <p
          className="mb-9 ml-auto mt-10 max-w-[680px] text-right font-geometria leading-[1.15] text-brown animate-fadeInUp"
          style={{
            animationDelay: '0.15s',
            fontSize: 'clamp(18px, 2.1vw, 26px)',
            fontWeight: 300,
          }}
        >
          Здесь любовь можно почувствовать на вкус — в её самом тёплом и мягком проявлении
        </p>

        {/* Flavor rotator */}
        <div className="animate-fadeInUp mb-12" style={{ animationDelay: '0.25s' }}>
          {products && products.length > 0 ? (
            <FlavorShowcase products={products} />
          ) : (
            <div className="py-32 text-brown-soft">Загружаю вкусы…</div>
          )}
        </div>

        {/* CTA buttons */}
        <div
          className="mb-20 inline-flex flex-wrap justify-center gap-3.5 animate-fadeInUp"
          style={{ animationDelay: '0.35s' }}
        >
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2.5 rounded-full border border-brown/10 bg-white px-8 py-[18px] text-base font-semibold text-brown transition-all duration-500 ease-smooth hover:-translate-y-0.5 hover:border-transparent hover:bg-[#F0729E] hover:text-white"
          >
            Смотреть каталог <ArrowRight size={18} />
          </Link>
          <Link
            to="/sets"
            className="inline-flex items-center gap-2 rounded-full border border-brown/10 bg-white px-8 py-[18px] text-base font-semibold text-brown transition-all duration-500 ease-smooth hover:-translate-y-0.5 hover:border-transparent hover:bg-[#F0729E] hover:text-white"
          >
            Подарочные сеты
          </Link>
        </div>

        {/* Stats strip */}
        <div
          className="flex flex-wrap justify-center gap-x-12 gap-y-5 animate-fadeInUp"
          style={{ animationDelay: '0.5s' }}
        >
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <div className="font-oswald text-3xl font-bold text-brown">{s.value}</div>
              <div className="mt-1 text-sm font-medium text-brown-soft">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Декоративная волна-разделитель */}
      <svg
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        className="absolute bottom-[-1px] left-0 block h-[60px] w-full"
      >
        <path
          d="M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,60 L0,60 Z"
          fill="#FFF8F0"
        />
      </svg>
    </section>
  );
}
