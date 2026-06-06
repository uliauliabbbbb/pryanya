import type { Product, ProductSet } from '@/types';

const CATEGORY = {
  classic:  { id: 1, name: 'Классика',  slug: 'classic'  },
  premium:  { id: 2, name: 'Премиум',   slug: 'premium'  },
  seasonal: { id: 3, name: 'Сезонные',  slug: 'seasonal' },
} as const;

export const mockProducts: Product[] = [
  { id: 1,  name: 'Классика с глазурью',  price: 180, oldPrice: null, category: CATEGORY.classic,  photo: '/products/1_.png',    badge: 'Хит',      description: 'Тот самый медовый пряник с белой глазурью — рецепт нашей бабушки. Тает во рту, пахнет корицей и детством.', brandBg: '#F472B6', brandIsDark: false, ratingAvg: 5.0, reviewsCount: 248 },
  { id: 2,  name: 'Имбирный с мёдом',     price: 210, oldPrice: 260,  category: CATEGORY.classic,  photo: '/products/2_.png',      badge: null,       description: 'Мягкий имбирный пряник, пропитанный гречишным мёдом. Идеален к чаю с лимоном.', brandBg: '#E8B453', brandIsDark: false, ratingAvg: 4.9, reviewsCount: 192 },
  { id: 3,  name: 'Шоколадный делюкс',    price: 290, oldPrice: null, category: CATEGORY.premium,  photo: '/products/3_.png',  badge: 'Премиум',  description: 'Двойной бельгийский шоколад внутри тёмного пряничного теста. Богатый, насыщенный, для особых моментов.', brandBg: '#7B4F30', brandIsDark: true,  ratingAvg: 4.9, reviewsCount: 156 },
  { id: 4,  name: 'Розовый с малиной',    price: 240, oldPrice: null, category: CATEGORY.premium,  photo: '/products/4_.png',  badge: 'Новинка',  description: 'Нежный пряник с кусочками сублимированной малины и розовой глазурью. Лёгкая кислинка и аромат сада.', brandBg: '#F0729E', brandIsDark: false, ratingAvg: 4.8, reviewsCount: 134 },
  { id: 5,  name: 'Пряник с имбирём',     price: 195, oldPrice: null, category: CATEGORY.classic,  photo: '/products/5_.png',     badge: null,       description: 'Острый и пряный — для тех, кто любит характер. С кусочками засахаренного имбиря.', brandBg: '#C28B3F', brandIsDark: true,  ratingAvg: 4.7, reviewsCount: 88 },
  { id: 6,  name: 'Карамельный',          price: 220, oldPrice: null, category: CATEGORY.classic,  photo: '/products/6_.png',    badge: null,       description: 'Пряник с солёной карамелью внутри и хрустящей сахарной корочкой.', brandBg: '#D89B5A', brandIsDark: false, ratingAvg: 4.8, reviewsCount: 167 },
  { id: 7,  name: 'Лимонная цедра',       price: 200, oldPrice: null, category: CATEGORY.seasonal, photo: '/products/7_.png',      badge: 'Сезонный', description: 'Освежающий весенний пряник с цедрой сицилийского лимона и сахарной пудрой.', brandBg: '#F0D055', brandIsDark: false, ratingAvg: 4.7, reviewsCount: 92 },
  { id: 8,  name: 'Кофейный латте',       price: 260, oldPrice: null, category: CATEGORY.premium,  photo: '/products/8_.png',     badge: 'Хит',      description: 'Аромат свежесваренного эспрессо и мягкая кофейная горчинка. Любимец офисных перерывов.', brandBg: '#6B4423', brandIsDark: true,  ratingAvg: 4.9, reviewsCount: 201 },
  { id: 9,  name: 'Тыквенный пряник',     price: 230, oldPrice: null, category: CATEGORY.seasonal, photo: '/products/9_.png',    badge: 'Сезонный', description: 'Осенний хит — тыквенное пюре, корица, мускатный орех и гвоздика. Уют в каждом кусочке.', brandBg: '#E07A2C', brandIsDark: false, ratingAvg: 4.8, reviewsCount: 78 },
  { id: 10, name: 'Кокосовый рай',        price: 250, oldPrice: null, category: CATEGORY.premium,  photo: '/products/10_.png',    badge: null,       description: 'Тропический пряник с кокосовой стружкой и белым шоколадом. Чуть-чуть лета круглый год.', brandBg: '#EFE6D6', brandIsDark: false, ratingAvg: 4.8, reviewsCount: 113 },
  { id: 11, name: 'Ореховый',             price: 270, oldPrice: null, category: CATEGORY.premium,  photo: '/products/11_.png',       badge: null,       description: 'Грецкий орех, фундук и миндаль в медовом тесте. Хрустит на каждом кусочке.', brandBg: '#A67855', brandIsDark: true,  ratingAvg: 4.9, reviewsCount: 145 },
  { id: 12, name: 'Черничный',            price: 235, oldPrice: null, category: CATEGORY.seasonal, photo: '/products/12_.png',  badge: 'Новинка',  description: 'Сочные ягоды лесной черники в нежном тесте, с лавандовой глазурью.', brandBg: '#7E6FB6', brandIsDark: true,  ratingAvg: 4.7, reviewsCount: 64 },
];

export const mockSets: ProductSet[] = [
  { id: 1, name: 'Мини-сет «Знакомство»',     count: 4,  items: [1,2,5,6].map(productId => ({ productId, qty: 1 })),                       price: 690,  oldPrice: 820,  description: 'Идеален в подарок или для дегустации — 4 лучших классических вкуса в крафтовой коробке.', isFeatured: false, photo: null },
  { id: 2, name: 'Премиум-бокс',              count: 6,  items: [3,4,8,10,11,1].map(productId => ({ productId, qty: 1 })),                 price: 1290, oldPrice: 1540, description: 'Шесть авторских вкусов в подарочной коробке с лентой и открыткой. Достойный подарок.', isFeatured: false, photo: null },
  { id: 3, name: 'Сезонный сет',              count: 4,  items: [7,9,12,4].map(productId => ({ productId, qty: 1 })),                      price: 890,  oldPrice: 1020, description: 'Четыре сезонных пряника, которые меняются каждый квартал. В этом сезоне — ягоды и осень.', isFeatured: false, photo: null },
  { id: 4, name: 'Мега-сет «Пряня для всех»', count: 12, items: [1,2,3,4,5,6,7,8,9,10,11,12].map(productId => ({ productId, qty: 1 })),    price: 2390, oldPrice: 3010, description: 'Все 12 вкусов в одной коробке — для большой компании, на праздник или офис. Самое выгодное.', isFeatured: true,  photo: '/products/13_.png' },
];

// Состав пряников
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

mockProducts.forEach(p => { p.ingredients = PRODUCT_INGREDIENTS[p.id]; });

export const getProductById = (id: number) =>
  mockProducts.find(p => p.id === id);

export const getRelatedProducts = (id: number, limit = 4): Product[] => {
  const product = getProductById(id);
  if (!product) return [];
  return mockProducts
    .filter(p => p.category.id === product.category.id && p.id !== id)
    .slice(0, limit);
};

export const CATEGORIES_FILTER = ['Все', 'Классика', 'Премиум', 'Сезонные'] as const;
export type CategoryFilter = (typeof CATEGORIES_FILTER)[number];

export type SortOption = 'popular' | 'price-asc' | 'price-desc' | 'rating';

export function filterProducts(
  products: Product[],
  opts: { category?: CategoryFilter; query?: string; sortBy?: SortOption }
): Product[] {
  let result = [...products];
  if (opts.category && opts.category !== 'Все') {
    result = result.filter(p => p.category.name === opts.category);
  }
  if (opts.query) {
    const q = opts.query.trim().toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }
  switch (opts.sortBy) {
    case 'price-asc':  result.sort((a, b) => a.price - b.price); break;
    case 'price-desc': result.sort((a, b) => b.price - a.price); break;
    case 'rating':     result.sort((a, b) => b.ratingAvg - a.ratingAvg); break;
    default:           result.sort((a, b) => b.reviewsCount - a.reviewsCount);
  }
  return result;
}
