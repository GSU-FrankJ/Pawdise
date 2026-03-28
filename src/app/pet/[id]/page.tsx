'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import Starfield from '@/components/Starfield';
import EmotionalLoading from '@/components/EmotionalLoading';
import PetScene from '@/components/PetScene';

interface PetData {
  name: string;
  species: string;
  pixel_art_url: string | null;
  replicate_job_id: string | null;
}

interface ActivityData {
  activity: string;
  scene: string;
}

type PageStatus = 'loading' | 'transitioning' | 'ready';

export default function PetPage() {
  const params = useParams<{ id: string }>();
  const skipLoading = useRef(false);
  const [pet, setPet] = useState<PetData | null>(null);
  const [status, setStatus] = useState<PageStatus>('loading');
  const [showReassurance, setShowReassurance] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [artReady, setArtReady] = useState(false);
  const [activityData, setActivityData] = useState<ActivityData | null>(null);

  // Fetch pet data on mount
  useEffect(() => {
    fetch(`/api/pets/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setPet({
          name: data.name,
          species: data.species,
          pixel_art_url: data.pixel_art_url ?? null,
          replicate_job_id: data.replicate_job_id ?? null,
        });

        // If pixel art already exists, skip polling
        if (data.pixel_art_url || !data.replicate_job_id) {
          setArtReady(true);

          // If pet is fully ready (has art + activity), skip loading screen
          if (data.pixel_art_url && data.current_activity) {
            skipLoading.current = true;
            setActivityData({
              activity: data.current_activity,
              scene: data.current_scene ?? null,
            });
          }
        }
      });
  }, [params.id]);

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

  // Poll pixel-art-status every 3s
  useEffect(() => {
    if (status !== 'loading' || artReady || !pet) return;

    const interval = setInterval(async () => {
      const res = await fetch(`/api/pets/${params.id}/pixel-art-status`);
      const data = await res.json();

      if (data.status === 'complete' && data.pixel_art_url) {
        setPet((p) => (p ? { ...p, pixel_art_url: data.pixel_art_url } : p));
        setArtReady(true);
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [status, artReady, pet, params.id]);

  // Transition when art ready + minimum 5s displayed
  const startTransition = useCallback(() => {
    setStatus('transitioning');
    setTimeout(() => setStatus('ready'), 800);
  }, []);

  useEffect(() => {
    if (!artReady || status !== 'loading') return;
    // Skip 5s wait if pet is already fully generated
    if (skipLoading.current) {
      startTransition();
    } else if (elapsedMs >= 5000) {
      startTransition();
    }
  }, [artReady, elapsedMs, status, startTransition]);

  // Fetch activity when ready
  useEffect(() => {
    if (status !== 'ready' || activityData) return;

    fetch(`/api/pets/${params.id}/activity`)
      .then((r) => r.json())
      .then((data) =>
        setActivityData({ activity: data.activity, scene: data.scene })
      );
  }, [status, activityData, params.id]);

  const petName = pet?.name ?? '...';
  const species = pet?.species ?? 'Other';

  return (
    <main className="relative min-h-dvh overflow-hidden">
      <Starfield count={40} />
      <EmotionalLoading
        petName={petName}
        species={species}
        visible={status === 'loading'}
        showReassurance={showReassurance}
      />
      <PetScene
        petName={petName}
        species={species}
        pixelArtUrl={pet?.pixel_art_url ?? null}
        activity={activityData?.activity ?? null}
        scene={activityData?.scene ?? null}
        timeOfDay={null}
        weather={null}
        mood={null}
        visible={status === 'ready'}
      />
    </main>
  );
}
