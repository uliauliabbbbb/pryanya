import { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  duration?: number;
}

export function AnimatedCounter({ value, suffix = '', duration = 1800 }: AnimatedCounterProps) {
  const [current, setCurrent] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting && !started.current) {
            started.current = true;
            const startTs = performance.now();
            const tick = (t: number) => {
              const p = Math.min(1, (t - startTs) / duration);
              const ease = 1 - Math.pow(1 - p, 3); // easeOutCubic
              setCurrent(Math.floor(value * ease));
              if (p < 1) requestAnimationFrame(tick);
              else setCurrent(value);
            };
            requestAnimationFrame(tick);
          }
        }
      },
      { threshold: 0.4 },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [value, duration]);

  return (
    <span ref={ref}>
      {current.toLocaleString('ru-RU')}
      {suffix}
    </span>
  );
}
