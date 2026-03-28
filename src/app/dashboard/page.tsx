'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';
import { getSpeciesEmoji } from '@/components/SpeciesEmoji';
import Starfield from '@/components/Starfield';

interface Pet {
  id: string;
  name: string;
  species: string;
  pixel_art_url: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [firstName, setFirstName] = useState('');
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace('/');
        return;
      }

      const fullName =
        session.user.user_metadata?.full_name ??
        session.user.email ??
        'Friend';
      setFirstName(fullName.split(' ')[0]);

      const res = await fetch('/api/pets/mine', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      setPets(data.pets ?? []);
      setLoading(false);
      requestAnimationFrame(() => setMounted(true));
    }

    load();
  }, [router]);

  return (
    <main className="relative min-h-dvh overflow-hidden">
      <Starfield count={50} />

      {/* Noise grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
        aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-5 py-4">
        <Link
          href="/"
          className="font-display text-lg text-cosmic-glow tracking-tight"
        >
          Pawdise
        </Link>
        <Link
          href="/create"
          className="text-cosmic-muted hover:text-cosmic-text text-sm font-body font-medium transition-colors border border-cosmic-accent/20 px-4 py-1.5 rounded-full"
        >
          + New pet
        </Link>
      </nav>

      {/* Content */}
      <div className="relative z-10 px-5 pt-6 pb-16 max-w-3xl mx-auto">
        {/* Title */}
        <h1
          className={`font-display text-3xl sm:text-4xl font-semibold text-cosmic-glow tracking-tight mb-2 transition-all duration-700 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
          style={{
            textShadow:
              '0 0 40px rgba(245, 200, 66, 0.2), 0 0 80px rgba(245, 200, 66, 0.08)',
          }}
        >
          {firstName ? `${firstName}'s Pawdise` : '...'}
        </h1>
        <p
          className={`font-body text-cosmic-muted/60 text-sm mb-10 transition-all duration-700 delay-100 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          Your pets, living happily in their own little worlds.
        </p>

        {loading ? (
          /* Loading skeleton */
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="aspect-square rounded-2xl bg-cosmic-surface/40 animate-pulse"
              />
            ))}
          </div>
        ) : pets.length === 0 ? (
          /* Empty state */
          <div
            className={`flex flex-col items-center justify-center py-20 transition-all duration-700 delay-200 ${
              mounted
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-6'
            }`}
          >
            <span className="text-5xl mb-4">🐾</span>
            <p className="font-body text-cosmic-muted text-base mb-6">
              You don&apos;t have any pets yet.
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 bg-cosmic-glow text-cosmic-bg font-body font-semibold px-6 py-3 rounded-full text-sm transition-all duration-300 hover:shadow-[0_0_40px_rgba(245,200,66,0.3)] hover:scale-[1.03] active:scale-[0.97]"
            >
              Create my first pet
              <svg
                className="w-4 h-4"
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
        ) : (
          /* Pet grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {pets.map((pet, i) => (
              <Link
                key={pet.id}
                href={`/pet/${pet.id}`}
                className={`group relative rounded-2xl overflow-hidden bg-cosmic-surface/40 border border-cosmic-accent/10 transition-all duration-500 hover:border-cosmic-glow/30 hover:shadow-[0_0_30px_rgba(245,200,66,0.12)] hover:scale-[1.02] ${
                  mounted
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
                style={{
                  transitionDelay: mounted ? `${150 + i * 80}ms` : '0ms',
                }}
              >
                {/* Image */}
                <div className="aspect-square relative">
                  {pet.pixel_art_url ? (
                    <img
                      src={pet.pixel_art_url}
                      alt={pet.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">
                      {getSpeciesEmoji(pet.species)}
                    </div>
                  )}
                  {/* Hover glow overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-cosmic-bg/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Name */}
                <div className="absolute bottom-0 left-0 right-0 px-3 py-2.5 bg-gradient-to-t from-cosmic-bg/90 to-transparent">
                  <span className="font-display text-sm sm:text-base font-medium text-cosmic-text">
                    {pet.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
