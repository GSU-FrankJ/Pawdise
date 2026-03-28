'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';
import type { Session } from '@supabase/supabase-js';

export default function AuthCallback() {
  const router = useRouter();
  const claimed = useRef(false);

  useEffect(() => {
    const claimAndRedirect = async (session: Session) => {
      if (claimed.current) return;
      claimed.current = true;

      const sessionId = localStorage.getItem('pawdise_session_id');
      const petId = localStorage.getItem('pawdise_pet_id');

      if (sessionId && petId) {
        await fetch(`/api/pets/${petId}/claim`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ session_id: sessionId }),
        });

        localStorage.removeItem('pawdise_session_id');
        localStorage.removeItem('pawdise_pet_id');
      }

      router.push('/dashboard');
    };

    // Listen for sign-in event (handles OAuth redirect with hash fragment)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        claimAndRedirect(session);
      }
    });

    // Fallback: check if session already exists
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) claimAndRedirect(session);
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <main className="min-h-dvh flex items-center justify-center">
      <p className="text-cosmic-muted font-body text-sm">Signing in...</p>
    </main>
  );
}
