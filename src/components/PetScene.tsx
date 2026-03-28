import Link from 'next/link';
import { getSpeciesEmoji } from './SpeciesEmoji';

interface PetSceneProps {
  petName: string;
  species: string;
  activity: string;
  scene: string;
  visible: boolean;
}

export default function PetScene({
  petName,
  species,
  activity,
  scene,
  visible,
}: PetSceneProps) {
  const emoji = getSpeciesEmoji(species);

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
        <button
          type="button"
          className="text-cosmic-muted hover:text-cosmic-text text-sm font-body font-medium transition-colors border border-cosmic-accent/20 px-4 py-1.5 rounded-full"
        >
          Sign in
        </button>
      </nav>

      <div className="flex-1 flex flex-col items-center px-5 pt-4 pb-12">
        <div className="w-full max-w-md aspect-square rounded-2xl overflow-hidden bg-cosmic-surface/40 mb-6 relative">
          <div className="absolute inset-0 flex items-center justify-center text-6xl">
            {emoji}
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-cosmic-text">
            {petName}
          </h1>
          <span className="text-xs font-body font-medium text-cosmic-glow bg-cosmic-glow/10 px-3 py-1 rounded-full">
            {species}
          </span>
        </div>

        <p className="text-cosmic-text font-body text-base sm:text-lg text-center max-w-sm mb-2 italic">
          {petName} has arrived in their new world
        </p>

        <p className="text-cosmic-muted text-sm sm:text-base font-body text-center max-w-sm mt-4">
          {activity}
        </p>

        <div className="flex gap-4 mt-6 text-xs font-body text-cosmic-muted/60">
          <span>Scene: {scene}</span>
          <span>·</span>
          <span>Just now</span>
        </div>
      </div>
    </div>
  );
}
