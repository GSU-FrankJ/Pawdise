'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

const TOTAL_STEPS = 3;

const STEP_LABELS = ['About your pet', 'Their personality', 'Their story'];

const SPECIES_OPTIONS = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Other'] as const;

interface FormData {
  name: string;
  species: string;
  breed: string;
  traits: string;
  habits: string;
  bio: string;
  photo: File | null;
}

export default function CreatePet() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [form, setForm] = useState<FormData>({
    name: '',
    species: '',
    breed: '',
    traits: '',
    habits: '',
    bio: '',
    photo: null,
  });

  const photoPreviewUrl = useMemo(
    () => (form.photo ? URL.createObjectURL(form.photo) : null),
    [form.photo]
  );

  useEffect(() => {
    return () => {
      if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    };
  }, [photoPreviewUrl]);

  const canAdvance =
    step === 1 ? form.name.trim() !== '' && form.species !== '' : true;

  const goNext = () => {
    if (!canAdvance) return;
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };
  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const sessionId = crypto.randomUUID();
      localStorage.setItem('pawdise_session_id', sessionId);

      // Create pet record
      const createRes = await fetch('/api/pets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          species: form.species,
          breed: form.breed.trim() || null,
          traits: form.traits.trim() || null,
          habits: form.habits.trim() || null,
          bio: form.bio.trim() || null,
          session_id: sessionId,
        }),
      });

      if (!createRes.ok) {
        const err = await createRes.text();
        setUploadError(`Failed to create pet: ${err}`);
        setSubmitting(false);
        return;
      }

      const { id: petId } = await createRes.json();
      localStorage.setItem('pawdise_pet_id', petId);

      // Upload photo if provided
      if (form.photo) {
        const photoData = new FormData();
        photoData.append('photo', form.photo);
        await fetch(`/api/pets/${petId}/upload-photo`, {
          method: 'POST',
          body: photoData,
        });
      }

      router.push(`/pet/${petId}`);
    } catch (e) {
      setUploadError(`Error: ${(e as Error).message}`);
      setSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-dvh flex flex-col items-center justify-center px-4 py-12">
      {/* Back to home */}
      <Link
        href="/"
        className="absolute top-6 left-6 text-cosmic-muted hover:text-cosmic-text transition-colors text-sm font-body flex items-center gap-1.5"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
          />
        </svg>
        Back
      </Link>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => {
          const stepNum = i + 1;
          const isActive = stepNum === step;
          const isComplete = stepNum < step;

          return (
            <div key={stepNum} className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-body font-semibold transition-all duration-300 ${
                  isActive
                    ? 'bg-cosmic-glow text-cosmic-bg shadow-[0_0_20px_rgba(245,200,66,0.3)]'
                    : isComplete
                      ? 'bg-cosmic-glow/20 text-cosmic-glow'
                      : 'bg-cosmic-surface text-cosmic-muted'
                }`}
              >
                {isComplete ? (
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
                      d="m4.5 12.75 6 6 9-13.5"
                    />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>
              {stepNum < TOTAL_STEPS && (
                <div
                  className={`w-8 h-0.5 rounded-full transition-colors duration-300 ${
                    isComplete ? 'bg-cosmic-glow/40' : 'bg-cosmic-surface'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step label */}
      <p className="text-cosmic-muted text-sm font-body mb-6 tracking-wide">
        Step {step} of {TOTAL_STEPS}
        <span className="mx-2 text-cosmic-surface">—</span>
        {STEP_LABELS[step - 1]}
      </p>

      {/* Form card */}
      <div className="w-full max-w-md bg-cosmic-surface/50 backdrop-blur-sm border border-cosmic-accent/10 rounded-2xl p-6 sm:p-8 min-h-[280px] flex flex-col">
        {/* Step content */}
        <div className="flex-1">
          {step === 1 && (
            <div className="space-y-5">
              {/* Pet name */}
              <div>
                <label
                  htmlFor="pet-name"
                  className="block text-sm font-body font-medium text-cosmic-text mb-1.5"
                >
                  Pet name <span className="text-cosmic-glow">*</span>
                </label>
                <input
                  id="pet-name"
                  type="text"
                  placeholder="e.g. Mochi"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="w-full bg-cosmic-bg/60 border border-cosmic-accent/20 rounded-xl px-4 py-3 text-cosmic-text placeholder:text-cosmic-muted/40 font-body text-sm focus:outline-none focus:border-cosmic-glow/50 focus:shadow-[0_0_12px_rgba(245,200,66,0.1)] transition-all"
                />
              </div>

              {/* Species selector */}
              <div>
                <label className="block text-sm font-body font-medium text-cosmic-text mb-2.5">
                  Species <span className="text-cosmic-glow">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {SPECIES_OPTIONS.map((species) => (
                    <button
                      key={species}
                      type="button"
                      onClick={() =>
                        setForm((f) => ({ ...f, species }))
                      }
                      className={`px-4 py-2 rounded-full text-sm font-body font-medium transition-all duration-200 ${
                        form.species === species
                          ? 'bg-cosmic-glow text-cosmic-bg shadow-[0_0_16px_rgba(245,200,66,0.25)]'
                          : 'bg-cosmic-bg/60 text-cosmic-muted border border-cosmic-accent/20 hover:border-cosmic-glow/30 hover:text-cosmic-text'
                      }`}
                    >
                      {species}
                    </button>
                  ))}
                </div>
              </div>

              {/* Breed */}
              <div>
                <label
                  htmlFor="breed"
                  className="block text-sm font-body font-medium text-cosmic-text mb-1.5"
                >
                  Breed{' '}
                  <span className="text-cosmic-muted/50 font-normal">
                    (optional)
                  </span>
                </label>
                <input
                  id="breed"
                  type="text"
                  placeholder="e.g. Orange tabby"
                  value={form.breed}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, breed: e.target.value }))
                  }
                  className="w-full bg-cosmic-bg/60 border border-cosmic-accent/20 rounded-xl px-4 py-3 text-cosmic-text placeholder:text-cosmic-muted/40 font-body text-sm focus:outline-none focus:border-cosmic-glow/50 focus:shadow-[0_0_12px_rgba(245,200,66,0.1)] transition-all"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="traits"
                  className="block text-sm font-body font-medium text-cosmic-text mb-1.5"
                >
                  Personality traits
                </label>
                <textarea
                  id="traits"
                  rows={3}
                  placeholder="e.g. Playful, stubborn, loved cuddles, scared of thunderstorms"
                  value={form.traits}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, traits: e.target.value }))
                  }
                  className="w-full bg-cosmic-bg/60 border border-cosmic-accent/20 rounded-xl px-4 py-3 text-cosmic-text placeholder:text-cosmic-muted/40 font-body text-sm focus:outline-none focus:border-cosmic-glow/50 focus:shadow-[0_0_12px_rgba(245,200,66,0.1)] transition-all resize-none"
                />
              </div>

              <div>
                <label
                  htmlFor="habits"
                  className="block text-sm font-body font-medium text-cosmic-text mb-1.5"
                >
                  Favorite things & habits
                </label>
                <textarea
                  id="habits"
                  rows={3}
                  placeholder="e.g. Always slept on the left pillow, loved tuna treats, went crazy for the red laser pointer"
                  value={form.habits}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, habits: e.target.value }))
                  }
                  className="w-full bg-cosmic-bg/60 border border-cosmic-accent/20 rounded-xl px-4 py-3 text-cosmic-text placeholder:text-cosmic-muted/40 font-body text-sm focus:outline-none focus:border-cosmic-glow/50 focus:shadow-[0_0_12px_rgba(245,200,66,0.1)] transition-all resize-none"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="bio"
                  className="block text-sm font-body font-medium text-cosmic-text mb-1.5"
                >
                  Their story
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  placeholder="Tell their story in your own words..."
                  value={form.bio}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, bio: e.target.value }))
                  }
                  className="w-full bg-cosmic-bg/60 border border-cosmic-accent/20 rounded-xl px-4 py-3 text-cosmic-text placeholder:text-cosmic-muted/40 font-body text-sm focus:outline-none focus:border-cosmic-glow/50 focus:shadow-[0_0_12px_rgba(245,200,66,0.1)] transition-all resize-none"
                />
              </div>

              {/* Photo upload */}
              <div>
                <label className="block text-sm font-body font-medium text-cosmic-text mb-1.5">
                  Photo{' '}
                  <span className="text-cosmic-muted/50 font-normal">
                    (optional)
                  </span>
                </label>

                {form.photo ? (
                  <div className="relative rounded-xl overflow-hidden border border-cosmic-accent/20">
                    <img
                      src={photoPreviewUrl!}
                      alt="Pet preview"
                      className="w-full h-48 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({ ...f, photo: null }))
                      }
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-cosmic-bg/80 text-cosmic-muted hover:text-cosmic-text flex items-center justify-center transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18 18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="photo-input"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files[0];
                      if (!file) return;
                      if (!file.type.startsWith('image/')) {
                        setUploadError('Please upload an image file');
                        return;
                      }
                      if (file.size > 5 * 1024 * 1024) {
                        setUploadError('File must be under 5 MB');
                        return;
                      }
                      setUploadError('');
                      setForm((f) => ({ ...f, photo: file }));
                    }}
                    className="flex flex-col items-center justify-center gap-2 w-full h-36 rounded-xl border-2 border-dashed border-cosmic-accent/20 hover:border-cosmic-glow/30 bg-cosmic-bg/40 cursor-pointer transition-colors"
                  >
                    <svg
                      className="w-8 h-8 text-cosmic-muted/40"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
                      />
                    </svg>
                    <p className="text-cosmic-muted/50 text-xs font-body">
                      Drag & drop or click to upload
                    </p>
                    <p className="text-cosmic-muted/30 text-xs font-body">
                      JPG / PNG, max 5 MB
                    </p>
                    <input
                      id="photo-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (!file.type.startsWith('image/')) {
                          setUploadError('Please upload an image file');
                          return;
                        }
                        if (file.size > 5 * 1024 * 1024) {
                          setUploadError('File must be under 5 MB');
                          return;
                        }
                        setUploadError('');
                        setForm((f) => ({ ...f, photo: file }));
                      }}
                    />
                  </label>
                )}
                {uploadError && (
                  <p className="text-red-400 text-xs font-body mt-2">
                    {uploadError}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Error message */}
        {uploadError && (
          <p className="text-red-400 text-xs font-body mt-4 text-center">
            {uploadError}
          </p>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-cosmic-accent/10">
          {step > 1 ? (
            <button
              type="button"
              onClick={goBack}
              className="text-cosmic-muted hover:text-cosmic-text text-sm font-body font-medium transition-colors"
            >
              Back
            </button>
          ) : (
            <span />
          )}

          <button
            type="button"
            onClick={step < TOTAL_STEPS ? goNext : handleSubmit}
            disabled={!canAdvance || submitting}
            className={`font-body font-semibold px-6 py-2.5 rounded-full text-sm transition-all duration-300 ${
              canAdvance
                ? 'bg-cosmic-glow text-cosmic-bg hover:shadow-[0_0_30px_rgba(245,200,66,0.3)] hover:scale-[1.03] active:scale-[0.97]'
                : 'bg-cosmic-glow/30 text-cosmic-bg/50 cursor-not-allowed'
            }`}
          >
            {step < TOTAL_STEPS
              ? 'Next'
              : `Bring ${form.name.trim() || '...'} to life`}
          </button>
        </div>
      </div>
    </main>
  );
}
