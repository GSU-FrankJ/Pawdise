'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      // Supabase returns tokens in the URL hash — this listens for the session
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          subscription.unsubscribe();

          const sessionId = localStorage.getItem('pawdise_session_id');
          const petId = localStorage.getItem('pawdise_pet_id');

          if (sessionId && petId) {
            await fetch(`/api/pets/${petId}/claim`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ session_id: sessionId }),
            });

            localStorage.removeItem('pawdise_session_id');
            localStorage.removeItem('pawdise_pet_id');
            router.push(`/pet/${petId}`);
          } else {
            router.push('/');
          }
        }
      });

      // Also check if session already exists (e.g. page refresh)
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        subscription.unsubscribe();

        const sessionId = localStorage.getItem('pawdise_session_id');
        const petId = localStorage.getItem('pawdise_pet_id');

        if (sessionId && petId) {
          await fetch(`/api/pets/${petId}/claim`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: sessionId }),
          });

          localStorage.removeItem('pawdise_session_id');
          localStorage.removeItem('pawdise_pet_id');
          router.push(`/pet/${petId}`);
        } else {
          router.push('/');
        }
      }
    };

    handleCallback();
  }, [router]);

  return (
    <main className="min-h-dvh flex items-center justify-center">
      <p className="text-cosmic-muted font-body text-sm">Signing in...</p>
    </main>
  );
}
