import { Link } from 'react-router-dom';

const COLUMNS = [
  {
    title: 'Магазин',
    items: [
      { label: 'Каталог', to: '/catalog' },
      { label: 'Сеты', to: '/sets' },
      { label: 'Сезонные', to: '/catalog' },
      { label: 'Подарочные карты', to: '/sets' },
    ],
  },
  {
    title: 'Компания',
    items: [
      { label: 'О нас', to: '/about' },
      { label: 'Доставка', to: '/delivery' },
      { label: 'Контакты', to: '/contacts' },
      { label: 'Оптовикам', to: '/contacts' },
    ],
  },
  {
    title: 'Помощь',
    items: [
      { label: 'FAQ', to: '/delivery' },
      { label: 'Возврат', to: '/delivery' },
      { label: 'Политика конфиденциальности', to: '/' },
      { label: 'Условия использования', to: '/' },
    ],
  },
];

const SOCIALS = ['Tg', 'Vk', 'In', 'Yt'];

export function Footer() {
  return (
    <footer className="mt-20 bg-brown pt-[60px] pb-[30px] text-cream">
      <div className="container-page grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        {/* Brand block */}
        <div>
          <div className="mb-4 flex items-center gap-2.5">
            <span
              className="grid h-[42px] w-[42px] place-items-center rounded-full text-[22px] shadow-pink"
              style={{ background: 'linear-gradient(135deg, #E8508A 0%, #D4A853 100%)' }}
            >
              🍪
            </span>
            <span className="font-oswald text-[28px] font-bold tracking-[-0.025em] text-white">
              Пряня
            </span>
          </div>
          <p className="max-w-[300px] text-sm leading-[1.7] text-cream/75">
            Пряники ручной работы из натуральных ингредиентов. Печём по бабушкиному рецепту с 2021 года.
          </p>
          <div className="mt-5 flex gap-2.5">
            {SOCIALS.map(s => (
              <a
                key={s}
                href="#"
                className="grid h-[38px] w-[38px] place-items-center rounded-full bg-white/10 text-[13px] font-semibold text-white transition hover:bg-pink"
              >
                {s}
              </a>
            ))}
          </div>
        </div>

        {/* Column blocks */}
        {COLUMNS.map(col => (
          <div key={col.title}>
            <h4 className="mb-3.5 font-oswald text-sm font-semibold uppercase tracking-[.12em] text-pink">
              {col.title}
            </h4>
            <ul className="grid gap-2.5">
              {col.items.map(it => (
                <li key={it.label}>
                  <Link to={it.to} className="text-sm text-cream/85 transition hover:text-cream">
                    {it.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="container-page mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6 text-[13px] text-cream/60">
        <span>© {new Date().getFullYear()} Пряня. Все права защищены.</span>
        <span>Москва, ул. Медовая, 12 · +7 (495) 123-45-67</span>
      </div>
    </footer>
  );
}
