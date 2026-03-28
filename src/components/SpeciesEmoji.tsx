const SPECIES_EMOJI: Record<string, string> = {
  Cat: '🐱',
  Dog: '🐶',
  Bird: '🐦',
  Rabbit: '🐰',
};

export function getSpeciesEmoji(species: string): string {
  return SPECIES_EMOJI[species] ?? '🐾';
}
