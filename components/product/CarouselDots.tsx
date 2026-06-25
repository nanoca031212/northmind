"use client";

interface CarouselDotsProps {
  total: number;
  active: number;
  goTo: (i: number) => void;
}

export function CarouselDots({ total, active, goTo }: CarouselDotsProps) {
  if (total <= 1) return null;

  const MAX = 5;
  const count = Math.min(MAX, total);

  // Sliding window: keep active centered, clamped to bounds
  let start = active - Math.floor(MAX / 2);
  start = Math.max(0, Math.min(start, total - count));

  const indices = Array.from({ length: count }, (_, i) => start + i);

  return (
    <div className="flex justify-center items-center gap-2 mt-3 h-4">
      {indices.map((idx) => {
        const dist = Math.abs(idx - active);
        const isActive = idx === active;
        // scale: 1 → 0.75 → 0.5 based on distance from active
        const scale = dist === 0 ? 1 : dist === 1 ? 0.75 : 0.5;

        return (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            style={{ transform: `scale(${scale})` }}
            className={`h-1.5 rounded-full transition-all duration-300 origin-center ${
              isActive ? "w-5 bg-accent" : "w-1.5 bg-white/20"
            }`}
          />
        );
      })}
    </div>
  );
}
