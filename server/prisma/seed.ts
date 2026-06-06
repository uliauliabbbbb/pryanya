import { PrismaClient, BadgeType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ─── Категории ──────────────────────────────────────────────────
const CATEGORIES = [
  { name: 'Классика',  slug: 'classic'  },
  { name: 'Премиум',   slug: 'premium'  },
  { name: 'Сезонные',  slug: 'seasonal' },
];

// ─── Цвета пряников (из design-tokens) ─────────────────────────
const PRODUCT_COLORS: Record<number, { bg: string; dark: boolean }> = {
  1:  { bg: '#F472B6', dark: false },
  2:  { bg: '#E8B453', dark: false },
  3:  { bg: '#7B4F30', dark: true  },
  4:  { bg: '#F0729E', dark: false },
  5:  { bg: '#C28B3F', dark: true  },
  6:  { bg: '#D89B5A', dark: false },
  7:  { bg: '#F0D055', dark: false },
  8:  { bg: '#6B4423', dark: true  },
  9:  { bg: '#E07A2C', dark: false },
  10: { bg: '#EFE6D6', dark: false },
  11: { bg: '#A67855', dark: true  },
  12: { bg: '#7E6FB6', dark: true  },
};

const badgeMap: Record<string, BadgeType> = {
  'Хит':      'HIT',
  'Новинка':  'NEW',
  'Сезонный': 'SEASONAL',
  'Премиум':  'PREMIUM',
};

// ─── Продукты ───────────────────────────────────────────────────
const PRODUCTS = [
  { id: 1,  name: 'Классика с глазурью',  price: 180, oldPrice: null, category: 'Классика',  photo: '/products/1_.png',    badge: 'Хит' as const,      description: 'Тот самый медовый пряник с белой глазурью — рецепт нашей бабушки. Тает во рту, пахнет корицей и детством.' },
  { id: 2,  name: 'Имбирный с мёдом',     price: 210, oldPrice: 260,  category: 'Классика',  photo: '/products/2_.png',      badge: null,                description: 'Мягкий имбирный пряник, пропитанный гречишным мёдом. Идеален к чаю с лимоном.' },
  { id: 3,  name: 'Шоколадный делюкс',    price: 290, oldPrice: null, category: 'Премиум',   photo: '/products/3_.png',  badge: 'Премиум' as const,  description: 'Двойной бельгийский шоколад внутри тёмного пряничного теста. Богатый, насыщенный, для особых моментов.' },
  { id: 4,  name: 'Розовый с малиной',    price: 240, oldPrice: null, category: 'Премиум',   photo: '/products/4_.png',  badge: 'Новинка' as const,  description: 'Нежный пряник с кусочками сублимированной малины и розовой глазурью. Лёгкая кислинка и аромат сада.' },
  { id: 5,  name: 'Пряник с имбирём',     price: 195, oldPrice: null, category: 'Классика',  photo: '/products/5_.png',     badge: null,                description: 'Острый и пряный — для тех, кто любит характер. С кусочками засахаренного имбиря.' },
  { id: 6,  name: 'Карамельный',          price: 220, oldPrice: null, category: 'Классика',  photo: '/products/6_.png',    badge: null,                description: 'Пряник с солёной карамелью внутри и хрустящей сахарной корочкой.' },
  { id: 7,  name: 'Лимонная цедра',       price: 200, oldPrice: null, category: 'Сезонные',  photo: '/products/7_.png',      badge: 'Сезонный' as const, description: 'Освежающий весенний пряник с цедрой сицилийского лимона и сахарной пудрой.' },
  { id: 8,  name: 'Кофейный латте',       price: 260, oldPrice: null, category: 'Премиум',   photo: '/products/8_.png',     badge: 'Хит' as const,      description: 'Аромат свежесваренного эспрессо и мягкая кофейная горчинка. Любимец офисных перерывов.' },
  { id: 9,  name: 'Тыквенный пряник',     price: 230, oldPrice: null, category: 'Сезонные',  photo: '/products/9_.png',    badge: 'Сезонный' as const, description: 'Осенний хит — тыквенное пюре, корица, мускатный орех и гвоздика. Уют в каждом кусочке.' },
  { id: 10, name: 'Кокосовый рай',        price: 250, oldPrice: null, category: 'Премиум',   photo: '/products/10_.png',    badge: null,                description: 'Тропический пряник с кокосовой стружкой и белым шоколадом. Чуть-чуть лета круглый год.' },
  { id: 11, name: 'Ореховый',             price: 270, oldPrice: null, category: 'Премиум',   photo: '/products/11_.png',       badge: null,                description: 'Грецкий орех, фундук и миндаль в медовом тесте. Хрустит на каждом кусочке.' },
  { id: 12, name: 'Черничный',            price: 235, oldPrice: null, category: 'Сезонные',  photo: '/products/12_.png',  badge: 'Новинка' as const,  description: 'Сочные ягоды лесной черники в нежном тесте, с лавандовой глазурью.' },
];

// ─── Состав пряников ────────────────────────────────────────────
const PRODUCT_INGREDIENTS: Record<number, string[]> = {
  1:  ['Мука пшеничная', 'Мёд натуральный', 'Сливочное масло', 'Яйцо куриное', 'Сахарная пудра', 'Корица', 'Имбирь молотый', 'Гвоздика', 'Сода пищевая'],
  2:  ['Мука пшеничная', 'Мёд гречишный', 'Сливочное масло', 'Яйцо куриное', 'Имбирь свежий', 'Корица', 'Кардамон', 'Цедра лимона', 'Сода пищевая'],
  3:  ['Мука пшеничная', 'Шоколад тёмный бельгийский 70%', 'Какао-порошок', 'Сливочное масло', 'Яйцо куриное', 'Сахар тростниковый', 'Мёд', 'Соль морская'],
  4:  ['Мука пшеничная', 'Малина сублимированная', 'Сливочное масло', 'Яйцо куриное', 'Сахарная пудра', 'Мёд', 'Свекольный сок (натуральный краситель)', 'Лимонный сок'],
  5:  ['Мука пшеничная', 'Имбирь засахаренный', 'Имбирь молотый', 'Мёд', 'Сливочное масло', 'Яйцо куриное', 'Корица', 'Чёрный перец', 'Сода'],
  6:  ['Мука пшеничная', 'Карамель солёная (домашняя)', 'Сливочное масло', 'Сливки 33%', 'Яйцо куриное', 'Сахар тростниковый', 'Соль морская', 'Ваниль'],
  7:  ['Мука пшеничная', 'Цедра сицилийского лимона', 'Лимонный сок', 'Сливочное масло', 'Яйцо куриное', 'Сахарная пудра', 'Мёд', 'Кардамон'],
  8:  ['Мука пшеничная', 'Кофе эспрессо свежемолотый', 'Какао', 'Сливочное масло', 'Сливки 33%', 'Яйцо куриное', 'Мёд', 'Ваниль'],
  9:  ['Мука пшеничная', 'Тыквенное пюре', 'Мёд', 'Сливочное масло', 'Яйцо куриное', 'Корица', 'Мускатный орех', 'Гвоздика', 'Имбирь молотый'],
  10: ['Мука пшеничная', 'Кокосовая стружка', 'Белый бельгийский шоколад', 'Сливочное масло', 'Яйцо куриное', 'Кокосовое молоко', 'Сахарная пудра', 'Ваниль'],
  11: ['Мука пшеничная', 'Грецкий орех', 'Фундук', 'Миндаль', 'Мёд', 'Сливочное масло', 'Яйцо куриное', 'Корица', 'Сахар тростниковый'],
  12: ['Мука пшеничная', 'Черника лесная сушёная', 'Лаванда (цветки)', 'Сливочное масло', 'Яйцо куриное', 'Сахарная пудра', 'Мёд', 'Лимонный сок'],
};

// ─── Сеты ───────────────────────────────────────────────────────
const SETS = [
  { id: 1, name: 'Мини-сет «Знакомство»',     count: 4,  productIds: [1, 2, 5, 6],                         price: 690,  oldPrice: 820,  description: 'Идеален в подарок или для дегустации — 4 лучших классических вкуса в крафтовой коробке.', isFeatured: false, photo: null },
  { id: 2, name: 'Премиум-бокс',              count: 6,  productIds: [3, 4, 8, 10, 11, 1],                 price: 1290, oldPrice: 1540, description: 'Шесть авторских вкусов в подарочной коробке с лентой и открыткой. Достойный подарок.',     isFeatured: false, photo: null },
  { id: 3, name: 'Сезонный сет',              count: 4,  productIds: [7, 9, 12, 4],                       price: 890,  oldPrice: 1020, description: 'Четыре сезонных пряника, которые меняются каждый квартал. В этом сезоне — ягоды и осень.', isFeatured: false, photo: null },
  { id: 4, name: 'Мега-сет «Пряня для всех»', count: 12, productIds: [1,2,3,4,5,6,7,8,9,10,11,12],         price: 2390, oldPrice: 3010, description: 'Все 12 вкусов в одной коробке — для большой компании, на праздник или офис. Самое выгодное.', isFeatured: true,  photo: '/products/13_.png' },
];

// ─── Промокоды ──────────────────────────────────────────────────
const PROMO_CODES = [
  { code: 'PRANYA10', discount: 0.10 },
  { code: 'WELCOME',  discount: 0.15 },
  { code: 'SWEET',    discount: 0.05 },
];

// ─── FAQ ────────────────────────────────────────────────────────
const FAQ = [
  { q: 'Как долго хранятся пряники?',           a: 'Наши пряники хранятся 21 день при комнатной температуре в герметичной упаковке. После вскрытия — лучше съесть за неделю.' },
  { q: 'Есть ли доставка по России?',           a: 'Да! Мы отправляем СДЭКом и Почтой России по всей стране. По Москве — курьером в день заказа, если оформите до 15:00.' },
  { q: 'Можно ли заказать индивидуальный сет?', a: 'Конечно. Напишите нам в Telegram или на почту — соберём набор по вашим вкусам и упакуем под ваш повод (свадьба, корпоратив, день рождения).' },
  { q: 'Используете ли вы консерванты?',         a: 'Никогда. Только мука, мёд, специи, яйца, масло и любовь. Поэтому срок хранения — всего 21 день.' },
  { q: 'Как оплатить заказ?',                    a: 'Картой онлайн (Visa, Mastercard, МИР), через СБП, наличными курьеру или переводом для юрлиц.' },
  { q: 'Можно ли вернуть товар?',                a: 'Кондитерские изделия возврату не подлежат, но если что-то не так с заказом — напишите нам, и мы решим вопрос: вернём деньги или пришлём заново.' },
];

// ─── Команда ────────────────────────────────────────────────────
const TEAM = [
  { name: 'Айгуль Байдавлетова', role: 'CEO' },
  { name: 'Ренат Агзамов',       role: 'Технолог производства' },
  { name: 'Артемий Лебедев',     role: 'Креативный директор' },
  { name: 'Максим Дубцов',       role: 'Закупки и качество' },
];

// ════════════════════════════════════════════════════════════════

async function main() {
  console.log('🧹 Очищаю существующие данные...');

  // Порядок важен из-за FK
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.review.deleteMany();
  await prisma.setItem.deleteMany();
  await prisma.set.deleteMany();
  await prisma.productIngredient.deleteMany();
  await prisma.product.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.category.deleteMany();
  await prisma.promoCode.deleteMany();
  await prisma.user.deleteMany();
  await prisma.faqItem.deleteMany();
  await prisma.teamMember.deleteMany();

  // Сброс SERIAL счётчиков, чтобы id совпадали с дизайн-данными
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE categories_id_seq RESTART WITH 1`);
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE products_id_seq   RESTART WITH 1`);
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE sets_id_seq       RESTART WITH 1`);
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE ingredients_id_seq RESTART WITH 1`);

  // ─── Категории ────────────────────────────────────────────
  console.log('📂 Категории...');
  for (const cat of CATEGORIES) {
    await prisma.category.create({ data: cat });
  }
  const catByName = Object.fromEntries(
    (await prisma.category.findMany()).map(c => [c.name, c.id])
  );

  // ─── Ингредиенты (уникальные) ─────────────────────────────
  console.log('🌾 Ингредиенты...');
  const allIngredients = Array.from(
    new Set(Object.values(PRODUCT_INGREDIENTS).flat())
  ).sort((a, b) => a.localeCompare(b, 'ru'));

  for (const name of allIngredients) {
    await prisma.ingredient.create({ data: { name } });
  }
  const ingByName = Object.fromEntries(
    (await prisma.ingredient.findMany()).map(i => [i.name, i.id])
  );

  // ─── Продукты + состав ────────────────────────────────────
  console.log('🍪 Продукты...');
  for (const p of PRODUCTS) {
    const colors = PRODUCT_COLORS[p.id]!;
    await prisma.product.create({
      data: {
        id: p.id,
        name: p.name,
        price: p.price,
        oldPrice: p.oldPrice,
        categoryId: catByName[p.category]!,
        photo: p.photo,
        badge: p.badge ? badgeMap[p.badge] : null,
        description: p.description,
        brandBg: colors.bg,
        brandIsDark: colors.dark,
        ingredients: {
          create: PRODUCT_INGREDIENTS[p.id]!.map((ing, idx) => ({
            ingredientId: ingByName[ing]!,
            position: idx,
          })),
        },
      },
    });
  }

  // ─── Сеты + состав ────────────────────────────────────────
  console.log('🎁 Сеты...');
  for (const s of SETS) {
    await prisma.set.create({
      data: {
        id: s.id,
        name: s.name,
        count: s.count,
        price: s.price,
        oldPrice: s.oldPrice,
        description: s.description,
        photo: s.photo,
        isFeatured: s.isFeatured,
        items: {
          create: s.productIds.map(pid => ({ productId: pid, qty: 1 })),
        },
      },
    });
  }

  // ─── Промокоды ────────────────────────────────────────────
  console.log('🎟  Промокоды...');
  for (const promo of PROMO_CODES) {
    await prisma.promoCode.create({ data: promo });
  }

  // ─── FAQ ─────────────────────────────────────────────────
  console.log('❓ FAQ...');
  for (const [idx, item] of FAQ.entries()) {
    await prisma.faqItem.create({
      data: { question: item.q, answer: item.a, position: idx },
    });
  }

  // ─── Команда ─────────────────────────────────────────────
  console.log('👥 Команда...');
  for (const [idx, m] of TEAM.entries()) {
    await prisma.teamMember.create({
      data: { name: m.name, role: m.role, position: idx },
    });
  }

  // ─── Demo user + admin ────────────────────────────────────
  console.log('👤 Demo user + admin...');
  await prisma.user.create({
    data: {
      email: 'anna@example.com',
      passwordHash: await bcrypt.hash('pranya', 10),
      name: 'Анна Морозова',
      avatar: '🌸',
    },
  });
  await prisma.user.create({
    data: {
      email: 'admin@pranya.ru',
      passwordHash: await bcrypt.hash('admin', 10),
      name: 'Админ',
      avatar: '👑',
      role: 'ADMIN',
    },
  });

  // ─── Поправим SERIAL чтобы следующие insert'ы шли после max id ───
  await prisma.$executeRawUnsafe(
    `SELECT setval('products_id_seq', (SELECT MAX(id) FROM products))`
  );
  await prisma.$executeRawUnsafe(
    `SELECT setval('sets_id_seq', (SELECT MAX(id) FROM sets))`
  );

  console.log('\n✅ Seed успешно завершён');

  const counts = {
    categories:   await prisma.category.count(),
    ingredients:  await prisma.ingredient.count(),
    products:     await prisma.product.count(),
    sets:         await prisma.set.count(),
    promoCodes:   await prisma.promoCode.count(),
    faqItems:     await prisma.faqItem.count(),
    teamMembers:  await prisma.teamMember.count(),
    users:        await prisma.user.count(),
  };
  console.table(counts);
}

main()
  .catch((e) => {
    console.error('❌ Seed упал:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
