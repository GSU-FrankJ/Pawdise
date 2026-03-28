'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Starfield from '@/components/Starfield';
import EmotionalLoading from '@/components/EmotionalLoading';
import PetScene from '@/components/PetScene';

// --- Mock data (replace with real API when Person A delivers) ---
const MOCK_PET = {
  name: 'Mochi',
  species: 'Cat',
};

const MOCK_ACTIVITY = {
  activity: 'Mochi found a warm patch of starlight and curled up for a nap.',
  scene: 'cosmic meadow',
};

type PageStatus = 'loading' | 'transitioning' | 'ready';

export default function PetPage() {
  const params = useParams<{ id: string }>();
  // TODO: Use params.id to fetch pet data when API is ready
  void params;
  const [status, setStatus] = useState<PageStatus>('loading');
  const [showReassurance, setShowReassurance] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [artReady, setArtReady] = useState(false);

  // Track elapsed time
  useEffect(() => {
    if (status !== 'loading') return;
    const interval = setInterval(() => setElapsedMs((t) => t + 1000), 1000);
    return () => clearInterval(interval);
  }, [status]);

  // Reassurance after 30s
  useEffect(() => {
    if (elapsedMs >= 30000 && !showReassurance) setShowReassurance(true);
  }, [elapsedMs, showReassurance]);

  // Mock polling: pixel art "completes" after 8s
  useEffect(() => {
    if (status !== 'loading') return;
    const interval = setInterval(() => {
      // TODO: Replace with real GET /api/pets/[id]/pixel-art-status
      if (elapsedMs >= 8000) {
        setArtReady(true);
        clearInterval(interval);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [status, elapsedMs]);

  // Transition when art ready + minimum 5s displayed
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
      <Starfield count={40} />
      <EmotionalLoading
        petName={MOCK_PET.name}
        species={MOCK_PET.species}
        visible={status === 'loading'}
        showReassurance={showReassurance}
      />
      <PetScene
        petName={MOCK_PET.name}
        species={MOCK_PET.species}
        activity={MOCK_ACTIVITY.activity}
        scene={MOCK_ACTIVITY.scene}
        visible={status === 'ready'}
      />
    </main>
  );
}
