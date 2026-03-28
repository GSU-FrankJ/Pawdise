'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';

// --- Mock data (replace with real API when Person A delivers) ---
const MOCK_PET = {
  name: 'Mochi',
  species: 'Cat',
  breed: 'Orange tabby',
  pixel_art_url: null as string | null,
};

const MOCK_ACTIVITY = {
  activity: 'Mochi found a warm patch of starlight and curled up for a nap.',
  scene: 'cosmic meadow',
  generated_at: new Date().toISOString(),
};

// --- Loading messages ---
const LOADING_MESSAGES = [
  (name: string) => `Building a new home for ${name}...`,
  (name: string) => `${name} is exploring the meadow for the first time...`,
  (name: string) => `Finding the perfect sunny spot for ${name}...`,
  (name: string) => `${name} is making new friends...`,
  (name: string) => `Planting flowers in ${name}'s garden...`,
  (name: string) => `${name} is chasing fireflies in the starlight...`,
  (name: string) => `Almost there — ${name} is settling in...`,
];

const REASSURANCE_MESSAGE = 'Still working on it — good things take time';

// --- Star type ---
interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

type PageStatus = 'loading' | 'transitioning' | 'ready';

export default function PetPage() {
  const [status, setStatus] = useState<PageStatus>('loading');
  const [stars, setStars] = useState<Star[]>([]);
  const [msgIndex, setMsgIndex] = useState(0);
  const [msgVisible, setMsgVisible] = useState(true);
  const [showReassurance, setShowReassurance] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [artReady, setArtReady] = useState(false);

  // TODO: Read pet name from API response; for now use mock
  const petName = MOCK_PET.name;

  // Generate starfield
  useEffect(() => {
    setStars(
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        delay: Math.random() * 6,
        duration: Math.random() * 3 + 2,
      }))
    );
  }, []);

  // Rotate loading messages every 3.5s
  useEffect(() => {
    if (status !== 'loading') return;

    const interval = setInterval(() => {
      setMsgVisible(false);
      setTimeout(() => {
        setMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length);
        setMsgVisible(true);
      }, 400);
    }, 3500);

    return () => clearInterval(interval);
  }, [status]);

  // Track elapsed time + reassurance at 30s
  useEffect(() => {
    if (status !== 'loading') return;

    const interval = setInterval(() => {
      setElapsedMs((t) => t + 1000);
    }, 1000);

    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (elapsedMs >= 30000 && !showReassurance) {
      setShowReassurance(true);
    }
  }, [elapsedMs, showReassurance]);

  // Mock polling: pixel art "completes" after 8s
  useEffect(() => {
    if (status !== 'loading') return;

    const pollInterval = setInterval(() => {
      // TODO: Replace with real GET /api/pets/[id]/pixel-art-status
      if (elapsedMs >= 8000) {
        setArtReady(true);
        clearInterval(pollInterval);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [status, elapsedMs]);

  // Transition when art is ready AND minimum 5s has passed
  const startTransition = useCallback(() => {
    setStatus('transitioning');
    setTimeout(() => setStatus('ready'), 800);
  }, []);

  useEffect(() => {
    if (artReady && elapsedMs >= 5000 && status === 'loading') {
      startTransition();
    }
  }, [artReady, elapsedMs, status, startTransition]);

  return (
    <main className="relative min-h-dvh overflow-hidden">
      {/* Shared starfield background */}
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

      {/* ===== LOADING STATE ===== */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center px-6 transition-opacity duration-700 ${
          status === 'loading'
            ? 'opacity-100'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Shimmer sprite placeholder */}
        <div className="relative w-32 h-32 mb-10">
          <div className="absolute inset-0 rounded-2xl bg-cosmic-surface/60 animate-pulse" />
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cosmic-glow/10 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center text-cosmic-muted/40 text-4xl font-display">
            {MOCK_PET.species === 'Cat' && '🐱'}
            {MOCK_PET.species === 'Dog' && '🐶'}
            {MOCK_PET.species === 'Bird' && '🐦'}
            {MOCK_PET.species === 'Rabbit' && '🐰'}
            {!['Cat', 'Dog', 'Bird', 'Rabbit'].includes(MOCK_PET.species) &&
              '🐾'}
          </div>
        </div>

        {/* Rotating message */}
        <div className="relative h-12 w-full max-w-xs flex items-center justify-center">
          <p
            className={`absolute inset-0 flex items-center justify-center text-cosmic-text font-body text-base sm:text-lg text-center transition-opacity duration-400 ${
              msgVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {LOADING_MESSAGES[msgIndex](petName)}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1.5 mt-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-cosmic-glow/60 animate-pulse"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </div>

        {/* Reassurance message */}
        {showReassurance && (
          <p className="text-cosmic-muted/60 text-xs font-body mt-8 animate-[fadeIn_0.5s_ease-in]">
            {REASSURANCE_MESSAGE}
          </p>
        )}
      </div>

      {/* ===== READY STATE ===== */}
      <div
        className={`absolute inset-0 flex flex-col transition-opacity duration-700 ${
          status === 'ready'
            ? 'opacity-100'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Navbar */}
        <nav className="relative z-10 flex items-center justify-between px-5 py-4">
          <Link
            href="/"
            className="font-display text-lg text-cosmic-glow tracking-tight"
          >
            Pawdise
          </Link>
          <button
            type="button"
            className="text-cosmic-muted hover:text-cosmic-text text-sm font-body font-medium transition-colors border border-cosmic-accent/20 px-4 py-1.5 rounded-full"
          >
            Sign in
          </button>
        </nav>

        {/* Scene + content */}
        <div className="flex-1 flex flex-col items-center px-5 pt-4 pb-12">
          {/* Scene image */}
          <div className="w-full max-w-md aspect-square rounded-2xl overflow-hidden bg-cosmic-surface/40 mb-6 relative">
            <div className="absolute inset-0 flex items-center justify-center text-6xl">
              {MOCK_PET.species === 'Cat' && '🐱'}
              {MOCK_PET.species === 'Dog' && '🐶'}
              {MOCK_PET.species === 'Bird' && '🐦'}
              {MOCK_PET.species === 'Rabbit' && '🐰'}
              {!['Cat', 'Dog', 'Bird', 'Rabbit'].includes(
                MOCK_PET.species
              ) && '🐾'}
            </div>
          </div>

          {/* Pet name + species badge */}
          <div className="flex items-center gap-3 mb-4">
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-cosmic-text">
              {petName}
            </h1>
            <span className="text-xs font-body font-medium text-cosmic-glow bg-cosmic-glow/10 px-3 py-1 rounded-full">
              {MOCK_PET.species}
            </span>
          </div>

          {/* Arrival message */}
          <p className="text-cosmic-text font-body text-base sm:text-lg text-center max-w-sm mb-2 italic">
            {petName} has arrived in their new world
          </p>

          {/* Activity text */}
          <p className="text-cosmic-muted text-sm sm:text-base font-body text-center max-w-sm mt-4">
            {MOCK_ACTIVITY.activity}
          </p>

          {/* Scene details */}
          <div className="flex gap-4 mt-6 text-xs font-body text-cosmic-muted/60">
            <span>Scene: {MOCK_ACTIVITY.scene}</span>
            <span>·</span>
            <span>Just now</span>
          </div>
        </div>
      </div>
    </main>
  );
}
