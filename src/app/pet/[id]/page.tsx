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
  pixel_art_url: null as string | null,
};

interface ActivityData {
  activity: string;
  scene: string;
  timeOfDay: string;
  weather: string;
  mood: string;
}

// TODO: Replace with real GET /api/pets/[id]/activity
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function fetchActivity(petId: string): Promise<ActivityData> {
  await new Promise((r) => setTimeout(r, 500));
  return {
    activity:
      'Mochi found a warm patch of starlight and curled up for a nap.',
    scene: 'cosmic meadow',
    timeOfDay: 'afternoon',
    weather: 'starlit',
    mood: 'peaceful',
  };
}

type PageStatus = 'loading' | 'transitioning' | 'ready';

export default function PetPage() {
  const params = useParams<{ id: string }>();
  const [status, setStatus] = useState<PageStatus>('loading');
  const [showReassurance, setShowReassurance] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [artReady, setArtReady] = useState(false);
  const [activityData, setActivityData] = useState<ActivityData | null>(null);

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
      if (elapsedMs >= 3000) {
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

  // Fetch activity when ready
  useEffect(() => {
    if (status !== 'ready' || activityData) return;
    fetchActivity(params.id).then(setActivityData);
  }, [status, activityData, params.id]);

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
        pixelArtUrl={MOCK_PET.pixel_art_url}
        activity={activityData?.activity ?? null}
        scene={activityData?.scene ?? null}
        timeOfDay={activityData?.timeOfDay ?? null}
        weather={activityData?.weather ?? null}
        mood={activityData?.mood ?? null}
        visible={status === 'ready'}
      />
    </main>
  );
}
