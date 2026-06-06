import { useState } from 'react';

/** Большое «Пряня» — SVG с textLength=spacingAndGlyphs (растягивается на всю ширину). */
export function PranyaSpotlight() {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="animate-fadeInUp px-[2vw] text-center"
      style={{ animationDelay: '0.05s' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <svg
        viewBox="0 0 1000 100"
        preserveAspectRatio="none"
        className="block w-full"
        style={{ height: 'clamp(200px, 38vw, 460px)' }}
      >
        <text
          x="500"
          y="86"
          textAnchor="middle"
          textLength="980"
          lengthAdjust="spacingAndGlyphs"
          fontFamily="'Unbounded', sans-serif"
          fontWeight="800"
          fontSize="110"
          fill={hovered ? '#E8508A' : '#A88968'}
          style={{
            letterSpacing: '-0.01em',
            transition: 'fill 0.45s ease',
          }}
        >
          Пряня
        </text>
      </svg>
    </div>
  );
}
