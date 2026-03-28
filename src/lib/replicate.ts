import Replicate from "replicate";
import { supabaseAdmin } from "./supabase";

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! });

// stability-ai/stable-diffusion-img2img — img2img with pixel art prompt
const PIXEL_ART_MODEL = "stability-ai/stable-diffusion-img2img:15a3689ee13b0d2616e98820eca31d4c3abcd36672df6afce5cb6feb1d66087d";

function buildPrompt(species: string, breed?: string | null): string {
  const subject = breed ? `${breed} ${species}` : species;
  return `pixel art of a ${subject}, 16-bit style, cute, game sprite, centered, clean background`;
}

// Trigger pixel art generation (img2img if photoUrl provided, text-only otherwise)
export async function triggerPixelArtGeneration(
  species: string,
  breed: string | null,
  photoUrl: string | null,
  seed?: number
): Promise<string> {
  const prompt = buildPrompt(species, breed);
  const input: Record<string, unknown> = {
    prompt,
    prompt_strength: 0.6,
    seed: seed ?? Math.floor(Math.random() * 1000000),
  };

  if (photoUrl) {
    input.image = photoUrl;
  }

  const prediction = await replicate.predictions.create({
    version: PIXEL_ART_MODEL,
    input,
  });

  return prediction.id;
}

// Poll job status; returns status + output URL if complete
export async function pollJobStatus(jobId: string): Promise<{
  status: "processing" | "complete" | "failed";
  outputUrl: string | null;
}> {
  const prediction = await replicate.predictions.get(jobId);

  if (prediction.status === "succeeded") {
    const output = prediction.output;
    const outputUrl = Array.isArray(output) ? output[0] : (output as string);
    return { status: "complete", outputUrl: outputUrl ?? null };
  }

  if (prediction.status === "failed" || prediction.status === "canceled") {
    return { status: "failed", outputUrl: null };
  }

  return { status: "processing", outputUrl: null };
}

// Download generated image and save to Supabase Storage; returns public URL
export async function savePixelArtToStorage(
  petId: string,
  imageUrl: string
): Promise<string> {
  const response = await fetch(imageUrl);
  const buffer = await response.arrayBuffer();
  const path = `${petId}.png`;

  const { error } = await supabaseAdmin.storage
    .from("pixel-art")
    .upload(path, Buffer.from(buffer), {
      contentType: "image/png",
      upsert: true,
    });

  if (error) throw error;

  const { data } = supabaseAdmin.storage.from("pixel-art").getPublicUrl(path);
  return data.publicUrl;
}

// Retry with a different seed (Layer 1 fallback)
export async function retryPixelArtGeneration(
  species: string,
  breed: string | null,
  photoUrl: string | null
): Promise<string> {
  return triggerPixelArtGeneration(species, breed, photoUrl, Math.floor(Math.random() * 1000000));
}

// Text-only fallback without input image (Layer 2 fallback)
export async function triggerTextOnlyGeneration(
  species: string,
  breed: string | null
): Promise<string> {
  return triggerPixelArtGeneration(species, breed, null);
}
