'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

export default function Home() {
  const [stars, setStars] = useState<Star[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setStars(
      Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        delay: Math.random() * 6,
        duration: Math.random() * 3 + 2,
      }))
    );
    setMounted(true);
  }, []);

  return (
    <main className="relative min-h-dvh overflow-hidden flex items-center justify-center">
      {/* Ambient gradient orbs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-[20%] -left-40 w-[500px] h-[500px] rounded-full bg-cosmic-accent/15 blur-[120px] animate-drift" />
        <div className="absolute bottom-[10%] -right-32 w-[400px] h-[400px] rounded-full bg-cosmic-glow/10 blur-[100px] animate-drift-reverse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-cosmic-surface/50 blur-[180px]" />
      </div>

      {/* Starfield */}
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

      {/* Noise grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
        aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Hero content */}
      <div className="relative z-10 text-center px-6 max-w-md mx-auto">
        <h1
          className={`font-display text-7xl sm:text-8xl md:text-9xl font-semibold text-cosmic-glow tracking-tight leading-[0.9] mb-5 transition-all duration-1000 delay-100 ${
            mounted
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
          }`}
          style={{
            textShadow:
              '0 0 60px rgba(245, 200, 66, 0.25), 0 0 120px rgba(245, 200, 66, 0.1)',
          }}
        >
          Pawdise
        </h1>

        <p
          className={`font-display italic text-xl sm:text-2xl text-cosmic-muted tracking-[0.04em] mb-10 transition-all duration-1000 delay-300 ${
            mounted
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-6'
          }`}
        >
          A place where your pet lives on
        </p>

        <p
          className={`text-cosmic-muted/70 text-sm sm:text-base leading-relaxed max-w-xs mx-auto mb-14 transition-all duration-1000 delay-500 ${
            mounted
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-6'
          }`}
        >
          A quiet world where your beloved pet lives on — happy, peaceful,
          forever exploring.
        </p>

        <div
          className={`transition-all duration-1000 delay-700 ${
            mounted
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-6'
          }`}
        >
          <Link
            href="/create"
            className="group relative inline-flex items-center gap-2.5 bg-cosmic-glow text-cosmic-bg font-body font-semibold px-8 py-4 rounded-full text-base sm:text-lg transition-all duration-300 hover:shadow-[0_0_50px_rgba(245,200,66,0.35)] hover:scale-[1.03] active:scale-[0.97]"
          >
            Create my pet
            <svg
              className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </main>
  );
}
