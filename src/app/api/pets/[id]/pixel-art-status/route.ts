import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import {
  pollJobStatus,
  retryPixelArtGeneration,
  triggerTextOnlyGeneration,
} from "@/lib/replicate";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const MAX_RETRIES = 1;

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const { data: pet, error: petError } = await supabaseAdmin
    .from("pets")
    .select("id, species, breed, replicate_job_id, pixel_art_url, original_photo_url")
    .eq("id", id)
    .single();

  if (petError || !pet) {
    return NextResponse.json({ error: "Pet not found" }, { status: 404 });
  }

  // Already done
  if (pet.pixel_art_url) {
    return NextResponse.json({ status: "complete", pixel_art_url: pet.pixel_art_url });
  }

  if (!pet.replicate_job_id) {
    return NextResponse.json({ status: "processing", pixel_art_url: null });
  }

  const result = await pollJobStatus(pet.replicate_job_id);

  if (result.status === "complete" && result.outputUrl) {
    try {
      const pixelArtUrl = await savePixelArtToStorage(id, result.outputUrl);
      const { error: updateError } = await supabaseAdmin
        .from("pets")
        .update({ pixel_art_url: pixelArtUrl })
        .eq("id", id);
      if (updateError) {
        return NextResponse.json(
          { status: "complete", pixel_art_url: result.outputUrl, _dbError: updateError.message },
          { status: 200 }
        );
      }
      return NextResponse.json({ status: "complete", pixel_art_url: pixelArtUrl });
    } catch (err) {
      // Storage save failed — return Replicate URL directly so frontend can still show it
      return NextResponse.json(
        { status: "complete", pixel_art_url: result.outputUrl, _storageError: (err as Error).message },
        { status: 200 }
      );
    }
  }

  if (result.status === "failed") {
    // Check retry count stored in job id suffix (e.g. "jobid:1")
    const [, retryStr] = pet.replicate_job_id.split(":");
    const retryCount = retryStr ? parseInt(retryStr) : 0;

    let newJobId: string | null = null;

    if (retryCount < MAX_RETRIES) {
      // Layer 1: retry with different seed
      newJobId = await retryPixelArtGeneration(
        pet.species,
        pet.breed ?? null,
        pet.original_photo_url ?? null
      );
      newJobId = `${newJobId}:${retryCount + 1}`;
    } else {
      // Layer 2: text-only fallback (no input image)
      newJobId = await triggerTextOnlyGeneration(pet.species, pet.breed ?? null);
      newJobId = `${newJobId}:fallback`;
    }

    await supabaseAdmin
      .from("pets")
      .update({ replicate_job_id: newJobId })
      .eq("id", id);

    return NextResponse.json({ status: "processing", pixel_art_url: null });
  }

  return NextResponse.json({ status: "processing", pixel_art_url: null });
}
