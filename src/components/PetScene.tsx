'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getSpeciesEmoji } from './SpeciesEmoji';
import { supabase } from '@/lib/supabase-browser';
import type { User } from '@supabase/supabase-js';

interface PetSceneProps {
  petName: string;
  species: string;
  pixelArtUrl: string | null;
  activity: string | null;
  scene: string | null;
  timeOfDay: string | null;
  weather: string | null;
  mood: string | null;
  visible: boolean;
}

export default function PetScene({
  petName,
  species,
  pixelArtUrl,
  activity,
  scene,
  timeOfDay,
  weather,
  mood,
  visible,
}: PetSceneProps) {
  const emoji = getSpeciesEmoji(species);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  return (
    <div
      className={`absolute inset-0 flex flex-col transition-opacity duration-700 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <nav className="relative z-10 flex items-center justify-between px-5 py-4">
        <Link
          href="/"
          className="font-display text-lg text-cosmic-glow tracking-tight"
        >
          Pawdise
        </Link>
        {user ? (
          <span className="text-cosmic-muted text-sm font-body font-medium px-4 py-1.5">
            {user.user_metadata?.full_name ?? user.email ?? 'Signed in'}
          </span>
        ) : (
          <button
            type="button"
            onClick={() =>
              supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                  redirectTo: `${window.location.origin}/auth/callback`,
                },
              })
            }
            className="text-cosmic-muted hover:text-cosmic-text text-sm font-body font-medium transition-colors border border-cosmic-accent/20 px-4 py-1.5 rounded-full"
          >
            Sign in
          </button>
        )}
      </nav>

      <div className="flex-1 flex flex-col items-center px-5 pt-4 pb-12">
        {/* Scene image */}
        <div className="w-full max-w-md aspect-square rounded-2xl overflow-hidden bg-cosmic-surface/40 mb-6 relative border border-cosmic-accent/10 shadow-[0_0_40px_rgba(125,92,191,0.1)]">
          {/* Emoji fallback (always rendered behind) */}
          <div className="absolute inset-0 flex items-center justify-center text-6xl">
            {emoji}
          </div>
          {/* Pixel art (fade-in on load) */}
          {pixelArtUrl && (
            <img
              src={pixelArtUrl}
              alt={`${petName} in Pawdise`}
              onLoad={() => setImgLoaded(true)}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                imgLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}
        </div>

        {/* Pet name + species badge */}
        <div className="flex items-center gap-3 mb-4">
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-cosmic-text">
            {petName}
          </h1>
          <span className="text-sm bg-cosmic-glow/10 px-2.5 py-1 rounded-full">
            {emoji}
          </span>
        </div>

        {/* Activity text */}
        {activity ? (
          <p className="text-cosmic-muted text-sm sm:text-base font-body text-center max-w-sm mt-2 animate-[fadeIn_0.6s_ease-in]">
            {activity}
          </p>
        ) : (
          <div className="h-5 w-48 rounded-full bg-cosmic-surface/60 animate-pulse mt-2" />
        )}

        {/* Scene details */}
        {scene && (
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-6 text-xs font-body text-cosmic-muted/60">
            <span>{scene}</span>
            {timeOfDay && (
              <>
                <span>·</span>
                <span>{timeOfDay}</span>
              </>
            )}
            {weather && (
              <>
                <span>·</span>
                <span>{weather}</span>
              </>
            )}
            {mood && (
              <>
                <span>·</span>
                <span>{mood}</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
