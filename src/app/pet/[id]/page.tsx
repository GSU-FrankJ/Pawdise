'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Starfield from '@/components/Starfield';
import EmotionalLoading from '@/components/EmotionalLoading';
import PetScene from '@/components/PetScene';

interface PetData {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  pixel_art_url: string | null;
  current_activity: string | null;
  current_scene: string | null;
}

interface ActivityData {
  activity: string;
  scene: string;
  timeOfDay: string;
  weather: string;
  mood: string;
}

type PageStatus = 'loading' | 'transitioning' | 'ready';

export default function PetPage() {
  const params = useParams<{ id: string }>();
  const [status, setStatus] = useState<PageStatus>('loading');
  const [showReassurance, setShowReassurance] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [pet, setPet] = useState<PetData | null>(null);
  const [activityData, setActivityData] = useState<ActivityData | null>(null);

  const startTransition = useCallback(() => {
    setStatus('transitioning');
    setTimeout(() => setStatus('ready'), 800);
  }, []);

  // Track elapsed time during loading
  useEffect(() => {
    if (status !== 'loading') return;
    const interval = setInterval(() => setElapsedMs((t) => t + 1000), 1000);
    return () => clearInterval(interval);
  }, [status]);

  // Reassurance after 30s
  useEffect(() => {
    if (elapsedMs >= 30000 && !showReassurance) setShowReassurance(true);
  }, [elapsedMs, showReassurance]);

  // Fetch pet data + start polling or skip straight to ready
  useEffect(() => {
    if (!params.id) return;

    async function init() {
      const res = await fetch(`/api/pets/${params.id}`);
      if (!res.ok) return;
      const data: PetData = await res.json();
      setPet(data);

      // Already has pixel art — show immediately after short delay
      if (data.pixel_art_url) {
        setTimeout(() => startTransition(), 1200);
        return;
      }

      // No pixel art yet — poll for completion
      const poll = setInterval(async () => {
        const r = await fetch(`/api/pets/${params.id}/pixel-art-status`);
        const j = await r.json();
        if (j.status === 'complete' && j.pixel_art_url) {
          clearInterval(poll);
          setPet((prev) => prev ? { ...prev, pixel_art_url: j.pixel_art_url } : prev);
        }
      }, 3000);

      // Min 5s loading then transition when art ready
      const check = setInterval(() => {
        setElapsedMs((t) => {
          if (t >= 5000) {
            clearInterval(check);
            clearInterval(poll);
            startTransition();
          }
          return t;
        });
      }, 500);
    }

    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  // Fetch activity when ready
  useEffect(() => {
    if (status !== 'ready' || activityData || !pet) return;

    // Use cached activity if available
    if (pet.current_activity) {
      setActivityData({
        activity: pet.current_activity,
        scene: pet.current_scene ?? 'Pawdise',
        timeOfDay: 'afternoon',
        weather: 'sunny',
        mood: 'peaceful',
      });
      return;
    }

    // Otherwise call activity API
    fetch(`/api/pets/${params.id}/activity`)
      .then((r) => r.json())
      .then((d) => setActivityData({
        activity: d.activity,
        scene: d.scene,
        timeOfDay: 'afternoon',
        weather: 'sunny',
        mood: 'peaceful',
      }));
  }, [status, activityData, pet, params.id]);

  return (
    <main className="relative min-h-dvh overflow-hidden">
      <Starfield count={40} />
      <EmotionalLoading
        petName={pet?.name ?? '...'}
        species={pet?.species ?? 'pet'}
        visible={status === 'loading'}
        showReassurance={showReassurance}
      />
      <PetScene
        petName={pet?.name ?? ''}
        species={pet?.species ?? ''}
        pixelArtUrl={pet?.pixel_art_url ?? null}
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
