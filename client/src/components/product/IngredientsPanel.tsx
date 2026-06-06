import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IngredientsPanelProps {
  items: string[];
}

export function IngredientsPanel({ items }: IngredientsPanelProps) {
  const [open, setOpen] = useState(false);
  if (items.length === 0) return null;

  return (
    <div className="mt-7 overflow-hidden rounded-2xl bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-6 py-[18px] text-left transition hover:bg-cream/50"
      >
        <span className="font-oswald text-[15px] uppercase tracking-[.04em] text-brown">
          Этот пряник содержит
        </span>
        <span
          className={cn(
            'grid h-8 w-8 place-items-center rounded-full bg-cream-2 text-brown transition-transform duration-200',
            open && 'rotate-180',
          )}
        >
          <ChevronDown size={16} />
        </span>
      </button>

      <div
        className="overflow-hidden transition-all duration-[350ms] ease-out"
        style={{
          maxHeight: open ? 600 : 0,
          opacity: open ? 1 : 0,
        }}
      >
        <div className="border-t border-brown/10 px-6 pb-5 pt-4">
          <ul className="grid grid-cols-1 gap-x-5 gap-y-2 sm:grid-cols-2">
            {items.map((ing, i) => (
              <li
                key={i}
                className="relative pl-3.5 text-sm leading-[1.5] text-brown-soft"
              >
                <span className="absolute left-0 top-[9px] h-[5px] w-[5px] rounded-full bg-pink" />
                {ing}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs italic text-brown-soft/70">
            Без консервантов и искусственных красителей. Срок хранения — 21 день.
          </p>
        </div>
      </div>
    </div>
  );
}
