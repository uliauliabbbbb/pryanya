import { useEffect, useState } from 'react';

declare global {
  interface Window {
    ymaps?: typeof ymapsType;
  }
}

// Минимальный тип ymaps — то что мы реально используем
interface YMaps {
  ready: (cb: () => void) => void;
  Map: new (
    container: HTMLElement,
    state: { center: [number, number]; zoom: number; controls?: string[] },
    options?: Record<string, unknown>,
  ) => YMap;
  Placemark: new (
    coords: [number, number],
    properties?: Record<string, unknown>,
    options?: Record<string, unknown>,
  ) => YPlacemark;
  SuggestView: new (
    el: HTMLInputElement,
    options?: Record<string, unknown>,
  ) => YSuggestView;
  geocode: (
    request: string | [number, number],
    options?: { results?: number },
  ) => Promise<YGeocodeResult>;
}
interface YMap {
  geoObjects: { add: (o: unknown) => void; remove: (o: unknown) => void };
  setCenter: (coords: [number, number], zoom?: number, options?: Record<string, unknown>) => void;
  destroy: () => void;
}
interface YPlacemark {}
interface YSuggestView {
  events: { add: (name: string, handler: (e: { get: (k: string) => { value: string } }) => void) => void };
  destroy?: () => void;
}
interface YGeocodeResult {
  geoObjects: {
    get: (i: number) => { geometry: { getCoordinates: () => [number, number] } } | null;
  };
}
declare const ymapsType: YMaps;

let scriptPromise: Promise<YMaps> | null = null;

function loadYmaps(): Promise<YMaps> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    if (window.ymaps) {
      window.ymaps.ready(() => resolve(window.ymaps!));
      return;
    }
    const apiKey = import.meta.env.VITE_YANDEX_MAPS_API_KEY ?? '';
    const url = apiKey
      ? `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`
      : `https://api-maps.yandex.ru/2.1/?lang=ru_RU`;
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.onload = () => window.ymaps?.ready(() => resolve(window.ymaps!));
    script.onerror = () => reject(new Error('Не удалось загрузить Яндекс.Карты'));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export function useYandexMaps() {
  const [ymaps, setYmaps] = useState<YMaps | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadYmaps()
      .then(setYmaps)
      .catch(e => setError(e.message));
  }, []);

  return { ymaps, error };
}
