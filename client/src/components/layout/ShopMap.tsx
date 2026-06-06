import { useEffect, useRef } from 'react';
import { useYandexMaps } from '@/lib/useYandexMaps';

interface ShopMapProps {
  /** Координаты магазина [широта, долгота] */
  coords?: [number, number];
  zoom?: number;
  label?: string;
}

// Метро Сокольники (примерно) — улица Медовая в задании вымышленная
const DEFAULT_COORDS: [number, number] = [55.7894, 37.6786];

export function ShopMap({
  coords = DEFAULT_COORDS,
  zoom = 15,
  label = 'Пряня · ул. Медовая, 12',
}: ShopMapProps) {
  const { ymaps, error } = useYandexMaps();
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!ymaps || !containerRef.current || mapRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const map = new (ymaps as any).Map(
      containerRef.current,
      {
        center: coords,
        zoom,
        controls: ['zoomControl'],
      },
      { suppressMapOpenBlock: true },
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const placemark = new (ymaps as any).Placemark(
      coords,
      { hintContent: label, balloonContent: label },
      { preset: 'islands#pinkDotIcon' },
    );
    map.geoObjects.add(placemark);

    mapRef.current = map;

    return () => {
      mapRef.current?.destroy();
      mapRef.current = null;
    };
  }, [ymaps, coords, zoom, label]);

  return (
    <div className="relative h-[320px] overflow-hidden rounded-3xl bg-cream-2 shadow-sm">
      <div ref={containerRef} className="h-full w-full" />
      {!ymaps && !error && (
        <div className="absolute inset-0 flex items-center justify-center text-base font-medium text-brown-soft">
          Загружаю карту…
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
          <div className="text-4xl">📍</div>
          <div className="font-oswald text-lg uppercase text-brown">{label}</div>
          <p className="text-sm text-brown-soft">Карта недоступна: {error}</p>
        </div>
      )}
    </div>
  );
}
