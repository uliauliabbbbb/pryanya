import clsx, { type ClassValue } from 'clsx';

export const cn = (...inputs: ClassValue[]) => clsx(inputs);

export const formatPrice = (n: number | string) =>
  `${Number(n).toLocaleString('ru-RU')} ₽`;

export const formatOrderId = (id: number) =>
  `#PR-${String(id).padStart(4, '0')}`;
