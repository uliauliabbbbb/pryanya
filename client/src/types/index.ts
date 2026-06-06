export type Badge = 'Хит' | 'Новинка' | 'Сезонный' | 'Премиум';

export interface Product {
  id: number;
  name: string;
  price: number;
  oldPrice: number | null;
  category: { id: number; name: string; slug: string };
  photo: string;
  badge: Badge | null;
  description: string;
  brandBg: string;
  brandIsDark: boolean;
  ratingAvg: number;
  reviewsCount: number;
  ingredients?: string[];
}

export interface SetProduct {
  productId: number;
  qty: number;
}

export interface ProductSet {
  id: number;
  name: string;
  count: number;
  price: number;
  oldPrice: number | null;
  description: string;
  photo: string | null;
  isFeatured: boolean;
  items: SetProduct[];
}

export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  name: string;
  avatar: string | null;
  role: UserRole;
}
