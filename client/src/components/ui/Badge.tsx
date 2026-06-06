import { cn } from '@/lib/utils';
import type { Badge as BadgeType } from '@/types';

const BADGE_STYLES: Record<BadgeType, string> = {
  'Хит':      'bg-pink text-white',
  'Новинка':  'bg-brown text-cream',
  'Сезонный': 'bg-gold text-brown',
  'Премиум':  'bg-cream-2 text-brown border border-brown/20',
};

interface BadgeProps {
  kind: BadgeType;
  className?: string;
}

export function Badge({ kind, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide',
        BADGE_STYLES[kind],
        className,
      )}
    >
      {kind}
    </span>
  );
}
