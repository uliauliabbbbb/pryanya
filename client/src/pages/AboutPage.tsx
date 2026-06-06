import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { useApi } from '@/lib/useApi';
import { cn } from '@/lib/utils';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  position: number;
}

const STATS = [
  { value: 2000, suffix: '+', label: 'счастливых клиентов' },
  { value: 50,   suffix: '+', label: 'авторских вкусов' },
  { value: 5,    suffix: '',  label: 'лет на рынке' },
  { value: 98,   suffix: '%', label: 'возвращаются за добавкой' },
];

const PRINCIPLES = [
  { title: 'Только натуральное', text: 'Мука, мёд, специи, яйца, сливочное масло. Никаких консервантов и улучшителей.' },
  { title: 'Ручная работа',      text: 'Каждый пряник раскатывают, режут и расписывают руками наших кондитеров.' },
  { title: 'Свежесть',           text: 'Печём утром — отправляем днём. Никаких складов и долгого хранения.' },
  { title: 'Эстетика',           text: 'Дизайн упаковки и роспись — наше внутреннее правило. Подарок должен радовать глаз.' },
];

export function AboutPage() {
  const { data: team } = useApi<TeamMember[]>('/content/team');
  const [storyOpen, setStoryOpen] = useState(false);

  return (
    <div>
      <PageHeader
        title="История одной пряничной"
        subtitle="Пять лет назад мы испекли первый пряник на собственной кухне. Сегодня их пекут утром и развозят по всей Москве."
      />

      <div className="container-page pb-16">
        {/* Story — stylish expandable panel */}
        <section className="mx-auto mb-20 max-w-3xl">
          <div
            className="overflow-hidden rounded-[32px] border border-pink/15 animate-fadeInUp"
            style={{
              background:
                'linear-gradient(160deg, #FFF0F5 0%, #FFF8F0 55%, #FBEFE0 100%)',
            }}
          >
            <button
              type="button"
              onClick={() => setStoryOpen(o => !o)}
              aria-expanded={storyOpen}
              className="group flex w-full items-center justify-between gap-6 px-8 py-9 text-left transition-colors duration-300 hover:bg-white/40 sm:px-12 sm:py-11"
            >
              <div>
                <h2 className="font-oswald text-[clamp(28px,4vw,42px)] uppercase leading-[1.1] text-brown">
                  От бабушкиной кухни — к авторской пряничной
                </h2>
                {!storyOpen && (
                  <p className="mt-4 text-base font-light leading-[1.4] text-brown-soft sm:text-lg">
                    Нажмите, чтобы прочитать как из бабушкиного рецепта родилась пряничная мастерская
                  </p>
                )}
              </div>
              <span
                className={cn(
                  'grid h-12 w-12 shrink-0 place-items-center rounded-full transition-all duration-500 ease-smooth sm:h-14 sm:w-14',
                  storyOpen
                    ? 'rotate-180 bg-pink text-white'
                    : 'bg-white/70 text-brown group-hover:bg-pink group-hover:text-white',
                )}
              >
                <ChevronDown size={20} strokeWidth={2.4} />
              </span>
            </button>

            <div
              className="overflow-hidden transition-all duration-700 ease-smooth"
              style={{
                maxHeight: storyOpen ? 900 : 0,
                opacity: storyOpen ? 1 : 0,
              }}
            >
              <div className="grid gap-5 border-t border-pink/15 px-8 py-9 sm:px-12 sm:py-11">
                <p className="text-lg font-light leading-[1.5] text-brown">
                  Анна нашла бабушкин рецепт медового пряника и испекла первую партию для подруг. Через месяц подруги звонили снова — нужно было ещё, и побольше.
                </p>
                <p className="text-lg font-light leading-[1.5] text-brown">
                  Так появилась «Пряня» — маленькая пряничная мастерская, где каждый пряник расписывают вручную, а в тесто кладут только то, что бабушка одобрила бы.
                </p>
                <p className="text-lg font-light leading-[1.5] text-brown">
                  Сегодня нас пять кондитеров, 12 авторских вкусов и две тысячи постоянных клиентов. И всё та же кухня — теперь, правда, побольше.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats — dark brown block */}
        <section
          className="relative mb-20 overflow-hidden rounded-[32px] px-8 py-12 text-white md:px-10 md:py-[50px]"
          style={{ background: 'linear-gradient(135deg, #3D2B1F 0%, #1E140C 100%)' }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 text-[200px] opacity-[0.06]"
          >
            🍪
          </div>
          <div className="relative grid grid-cols-2 gap-8 md:grid-cols-4">
            {STATS.map(s => (
              <div
                key={s.label}
                className="group cursor-default text-center transition-transform duration-500 ease-smooth hover:-translate-y-2"
              >
                <div className="mb-2.5 font-oswald text-[clamp(40px,6vw,64px)] font-bold leading-none text-cream transition-all duration-300 group-hover:scale-110 group-hover:text-pink">
                  <AnimatedCounter value={s.value} suffix={s.suffix} />
                </div>
                <div className="text-sm leading-snug opacity-80 transition-opacity group-hover:opacity-100">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Principles */}
        <section className="mb-20">
          <h2 className="mb-3 text-center font-oswald text-[clamp(28px,4.2vw,42px)] uppercase text-brown">
            Наши принципы
          </h2>
          <p className="mx-auto mb-10 max-w-[580px] text-center text-lg font-medium text-brown-soft">
            Простые правила, по которым мы работаем последние пять лет
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PRINCIPLES.map((p, i) => (
              <div
                key={p.title}
                className="group cursor-default rounded-3xl bg-white p-7 shadow-sm transition-all duration-500 ease-smooth animate-fadeInUp hover:-translate-y-2 hover:bg-pink-soft"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="mb-4 inline-block font-oswald text-base font-bold uppercase tracking-[.16em] text-pink transition-all duration-300 group-hover:scale-125 group-hover:tracking-[.2em]">
                  0{i + 1}
                </div>
                <h3 className="mb-3 font-oswald text-2xl uppercase text-brown transition-colors duration-300 group-hover:text-pink-deep">
                  {p.title}
                </h3>
                <p className="text-base font-medium leading-[1.6] text-brown">{p.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        {team && team.length > 0 && (
          <section>
            <h2 className="mb-3 text-center font-oswald text-[clamp(28px,4.2vw,42px)] uppercase text-brown">
              Команда
            </h2>
            <p className="mx-auto mb-10 max-w-[580px] text-center text-lg font-medium text-brown-soft">
              Те самые люди, которые делают пряники, которые вы любите
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {team.map((m, i) => (
                <div
                  key={m.id}
                  className="group cursor-default rounded-3xl bg-white p-7 text-center shadow-sm transition-all duration-500 ease-smooth animate-fadeInUp hover:-translate-y-2"
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <div className="mx-auto mb-5 h-[120px] w-[120px] overflow-hidden rounded-full transition-all duration-500 ease-smooth group-hover:rotate-[360deg] group-hover:scale-110">
                    <img
                      src="/products/pryanya.jpg"
                      alt={m.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <h3 className="mb-1.5 font-oswald text-2xl uppercase text-brown transition-colors duration-300 group-hover:text-pink-deep">
                    {m.name}
                  </h3>
                  <p className="text-base font-medium text-brown-soft">{m.role}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
