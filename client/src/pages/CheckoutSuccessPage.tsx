import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface LocationState {
  total?: number;
  name?: string;
  orderNumber?: string;
}

export function CheckoutSuccessPage() {
  const navigate = useNavigate();
  const state = (useLocation().state ?? {}) as LocationState;
  const total = state.total ?? 0;
  const name = state.name ?? 'друг';
  const orderNumber = state.orderNumber ?? '';

  // Если зашли напрямую без оформления — отправляем на главную
  useEffect(() => {
    if (!state.total) {
      const t = setTimeout(() => navigate('/', { replace: true }), 0);
      return () => clearTimeout(t);
    }
  }, [state.total, navigate]);

  return (
    <div className="container-page flex flex-col items-center py-20 text-center">
      <div className="mb-6 inline-grid h-24 w-24 animate-scaleIn place-items-center rounded-full bg-pink text-white shadow-pink-lg">
        <Check size={48} strokeWidth={3} />
      </div>

      <p className="mb-3 font-cormorant text-2xl italic text-pink">Спасибо за заказ!</p>

      <h1 className="mb-4 font-oswald text-[clamp(36px,5vw,56px)] uppercase leading-[1.05] text-brown">
        Заказ оформлен
      </h1>

      <p className="mb-1 max-w-md text-base text-brown-soft">
        {name}, ваш заказ <span className="font-bold text-brown">{orderNumber}</span> на сумму{' '}
        <span className="font-bold text-brown">{formatPrice(total)}</span> принят.
      </p>
      <p className="mb-10 max-w-md text-base text-brown-soft">
        Мы написали вам на email с деталями и треком отслеживания.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 rounded-full border border-brown/10 bg-white px-7 py-3.5 text-sm font-semibold text-brown transition-all duration-500 ease-smooth hover:border-transparent hover:bg-[#F0729E] hover:text-white"
        >
          Дальше за пряниками <ArrowRight size={16} />
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-brown/15 bg-white px-7 py-3.5 text-sm font-semibold text-brown transition hover:bg-cream-2"
        >
          На главную
        </Link>
      </div>
    </div>
  );
}
