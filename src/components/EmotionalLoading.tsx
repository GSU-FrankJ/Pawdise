'use client';

import { useEffect, useState } from 'react';
import { getSpeciesEmoji } from './SpeciesEmoji';

const LOADING_MESSAGES = [
  (name: string) => `Building a new home for ${name}...`,
  (name: string) => `${name} is exploring the meadow for the first time...`,
  (name: string) => `Finding the perfect sunny spot for ${name}...`,
  (name: string) => `${name} is making new friends...`,
  (name: string) => `Planting flowers in ${name}'s garden...`,
  (name: string) => `${name} is chasing fireflies in the starlight...`,
  (name: string) => `Almost there — ${name} is settling in...`,
];

interface EmotionalLoadingProps {
  petName: string;
  species: string;
  visible: boolean;
  showReassurance: boolean;
}

export default function EmotionalLoading({
  petName,
  species,
  visible,
  showReassurance,
}: EmotionalLoadingProps) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [msgVisible, setMsgVisible] = useState(true);
  const emoji = getSpeciesEmoji(species);

  useEffect(() => {
    if (!visible) return;

    const interval = setInterval(() => {
      setMsgVisible(false);
      setTimeout(() => {
        setMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length);
        setMsgVisible(true);
      }, 400);
    }, 3500);

    return () => clearInterval(interval);
  }, [visible]);

  return (
    <div
      className={`absolute inset-0 flex flex-col items-center justify-center px-6 transition-opacity duration-700 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="relative w-32 h-32 mb-10">
        <div className="absolute inset-0 rounded-2xl bg-cosmic-surface/60 animate-pulse" />
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cosmic-glow/10 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center text-4xl">
          {emoji}
        </div>
      </div>

      <div className="relative h-12 w-full max-w-xs flex items-center justify-center">
        <p
          className={`absolute inset-0 flex items-center justify-center text-cosmic-text font-body text-base sm:text-lg text-center transition-opacity duration-[400ms] ${
            msgVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {LOADING_MESSAGES[msgIndex](petName)}
        </p>
      </div>

      <div className="flex gap-1.5 mt-6">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-cosmic-glow/60 animate-pulse"
            style={{ animationDelay: `${i * 0.3}s` }}
          />
        ))}
      </div>

      {showReassurance && (
        <p className="text-cosmic-muted/60 text-xs font-body mt-8 animate-[fadeIn_0.5s_ease-in]">
          Still working on it — good things take time
        </p>
      )}
    </div>
  );
}
