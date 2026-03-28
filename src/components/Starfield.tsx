'use client';

import { useEffect, useState } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

export default function Starfield({ count = 40 }: { count?: number }) {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    setStars(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        delay: Math.random() * 6,
        duration: Math.random() * 3 + 2,
      }))
    );
  }, [count]);

  return (
    <>
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-[20%] -left-40 w-[500px] h-[500px] rounded-full bg-cosmic-accent/15 blur-[120px] animate-drift" />
        <div className="absolute bottom-[10%] -right-32 w-[400px] h-[400px] rounded-full bg-cosmic-glow/10 blur-[100px] animate-drift-reverse" />
      </div>
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            }}
          />
        ))}
      </div>
    </>
  );
}
