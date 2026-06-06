import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { useApi } from '@/lib/useApi';
import { cn } from '@/lib/utils';

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  position: number;
}

const DELIVERY_ZONES = [
  {
    title: 'Москва',
    hint: 'Курьер в день заказа',
    items: ['В пределах МКАД — от 300 ₽', 'За МКАД (до 10 км) — от 500 ₽', 'Бесплатно от 3000 ₽'],
    emoji: '🚴',
  },
  {
    title: 'Россия',
    hint: 'СДЭК и Почта России',
    items: ['СДЭК (ПВЗ или курьер) — 2–4 дня', 'Почта России — 3–7 дней', 'Стоимость от 250 ₽'],
    emoji: '📦',
  },
];

const PAYMENT = [
  { title: 'Карта онлайн',  hint: 'Visa, Mastercard, МИР',         emoji: '💳' },
  { title: 'Система быстрых платежей', hint: 'СБП по QR-коду',     emoji: '⚡' },
  { title: 'Наличные курьеру',         hint: 'Только по Москве',    emoji: '💵' },
];

export function DeliveryPage() {
  const { data: faq } = useApi<FaqItem[]>('/content/faq');
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <div>
      <PageHeader
        title="Доставка и оплата"
        subtitle="Печём день в день и отправляем по всей России. Срок хранения пряников — 21 день в герметичной упаковке."
      />

      <div className="container-page pb-14">
        {/* Zones */}
        <section className="mb-14 grid grid-cols-1 gap-5 md:grid-cols-2">
          {DELIVERY_ZONES.map(z => (
            <div key={z.title} className="rounded-3xl bg-white p-8 shadow-sm">
              <div className="mb-3 text-5xl">{z.emoji}</div>
              <h3 className="mb-2 font-oswald text-3xl uppercase text-brown">{z.title}</h3>
              <p className="mb-6 text-base font-semibold text-pink">{z.hint}</p>
              <ul className="grid gap-3">
                {z.items.map(it => (
                  <li key={it} className="relative pl-5 text-base font-medium leading-[1.6] text-brown">
                    <span className="absolute left-0 top-[10px] h-2 w-2 rounded-full bg-pink" />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* Payment */}
        <section className="mb-14">
          <h2 className="mb-8 text-center font-oswald text-4xl uppercase text-brown">Как оплатить</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {PAYMENT.map(p => (
              <div key={p.title} className="rounded-3xl bg-cream-2 p-7 text-center">
                <div className="mb-3 text-5xl">{p.emoji}</div>
                <div className="font-oswald text-xl uppercase text-brown">{p.title}</div>
                <p className="mt-2 text-sm font-medium text-brown-soft">{p.hint}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        {faq && faq.length > 0 && (
          <section>
            <h2 className="mb-8 text-center font-oswald text-4xl uppercase text-brown">
              Частые вопросы
            </h2>
            <div className="mx-auto grid max-w-3xl gap-3">
              {faq.map(item => {
                const open = openId === item.id;
                return (
                  <div
                    key={item.id}
                    className={cn(
                      'overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 ease-smooth hover:-translate-y-0.5',
                      open && '-translate-y-0.5',
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenId(open ? null : item.id)}
                      aria-expanded={open}
                      className="group flex w-full items-center justify-between gap-3 px-7 py-6 text-left transition-colors duration-300 hover:bg-pink-soft"
                    >
                      <span
                        className={cn(
                          'font-oswald text-xl uppercase transition-colors duration-300',
                          open ? 'text-pink' : 'text-brown',
                        )}
                      >
                        {item.question}
                      </span>
                      <span
                        className={cn(
                          'grid h-10 w-10 shrink-0 place-items-center rounded-full transition-all duration-300',
                          open
                            ? 'rotate-180 bg-pink text-white'
                            : 'bg-cream-2 text-brown group-hover:bg-pink group-hover:text-white',
                        )}
                      >
                        <ChevronDown size={18} />
                      </span>
                    </button>
                    <div
                      className="overflow-hidden transition-all duration-[350ms] ease-out"
                      style={{ maxHeight: open ? 600 : 0, opacity: open ? 1 : 0 }}
                    >
                      <p className="border-t border-brown/10 px-7 py-6 text-base font-medium leading-[1.7] text-brown">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
