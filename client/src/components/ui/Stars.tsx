import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarsProps {
  rating: number;
  size?: number;
  className?: string;
}

export function Stars({ rating, size = 14, className }: StarsProps) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;

  return (
    <div className={cn('inline-flex items-center gap-0.5', className)}>
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i < full || (i === full && half);
        return (
          <Star
            key={i}
            size={size}
            className={filled ? 'fill-gold text-gold' : 'text-brown/20'}
            strokeWidth={filled ? 1.5 : 1.5}
          />
        );
      })}
    </div>
  );
}
