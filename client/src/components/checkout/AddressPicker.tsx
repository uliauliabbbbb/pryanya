import { useEffect, useRef, useState } from 'react';
import { useYandexMaps } from '@/lib/useYandexMaps';
import { cn } from '@/lib/utils';

interface AddressPickerProps {
  city: string;
  value: string;
  onChange: (value: string, coords?: [number, number]) => void;
  error?: string;
  placeholder?: string;
}

const MOSCOW: [number, number] = [55.751244, 37.618423];

export function AddressPicker({
  city,
  value,
  onChange,
  error,
  placeholder = 'ул. Медовая, 12, кв. 34',
}: AddressPickerProps) {
  const { ymaps, error: ymapsError } = useYandexMaps();
  const inputRef = useRef<HTMLInputElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<ReturnType<NonNullable<typeof ymaps>['Map']['prototype']['constructor']> | null>(null);
  const placemarkRef = useRef<unknown>(null);
  const [coords, setCoords] = useState<[number, number] | null>(null);

  // Initialize map once ymaps is loaded
  useEffect(() => {
    if (!ymaps || !mapContainerRef.current || mapRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mapRef.current = new ymaps.Map(mapContainerRef.current, {
      center: MOSCOW,
      zoom: 11,
      controls: ['zoomControl'],
    }, { suppressMapOpenBlock: true });
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mapRef.current as any)?.destroy?.();
      mapRef.current = null;
    };
  }, [ymaps]);

  // Attach SuggestView to the input
  useEffect(() => {
    if (!ymaps || !inputRef.current) return;
    const suggest = new ymaps.SuggestView(inputRef.current, {
      results: 6,
      provider: {
        // Биас на текущий город
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        suggest: (req: string) => (window.ymaps as any).suggest(`${city || 'Москва'}, ${req}`),
      },
    });

    suggest.events.add('select', e => {
      const text = e.get('item').value;
      // Уберём префикс города если есть
      const cleaned = text.replace(new RegExp(`^${city},?\\s*`, 'i'), '');
      // Geocode для получения координат
      ymaps.geocode(text, { results: 1 }).then(res => {
        const obj = res.geoObjects.get(0);
        if (obj) {
          const c = obj.geometry.getCoordinates();
          setCoords(c);
          onChange(cleaned, c);
        } else {
          onChange(cleaned);
        }
      });
    });

    return () => {
      suggest.destroy?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ymaps, city]);

  // Update marker when coords change
  useEffect(() => {
    if (!ymaps || !mapRef.current || !coords) return;
    if (placemarkRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mapRef.current as any).geoObjects.remove(placemarkRef.current);
    }
    placemarkRef.current = new ymaps.Placemark(coords, {}, {
      preset: 'islands#pinkDotIcon',
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mapRef.current as any).geoObjects.add(placemarkRef.current);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mapRef.current as any).setCenter(coords, 16, { duration: 400 });
  }, [coords, ymaps]);

  return (
    <div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className={cn(
          'w-full rounded-xl border bg-cream px-4 py-3 text-sm outline-none transition focus:bg-white focus:border-pink focus:shadow-[0_0_0_4px_rgba(232,80,138,0.12)]',
          error ? 'border-pink/60' : 'border-brown/10',
        )}
      />
      {error && <span className="mt-1.5 block text-xs text-pink-deep">{error}</span>}

      <div
        ref={mapContainerRef}
        className="mt-3 h-[260px] overflow-hidden rounded-2xl bg-cream-2"
      />
      {ymapsError && (
        <p className="mt-2 text-xs text-brown-soft">
          Не удалось загрузить карту: {ymapsError}
        </p>
      )}
    </div>
  );
}
