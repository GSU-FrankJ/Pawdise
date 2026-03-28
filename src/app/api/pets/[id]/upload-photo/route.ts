import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { triggerPixelArtGeneration } from "@/lib/replicate";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // Verify pet exists
  const { data: pet, error: petError } = await supabaseAdmin
    .from("pets")
    .select("id, species, breed")
    .eq("id", id)
    .single();

  if (petError || !pet) {
    return NextResponse.json({ error: "Pet not found" }, { status: 404 });
  }

  const formData = await req.formData();
  const file = formData.get("photo") as File | null;

  if (!file) {
    return NextResponse.json({ error: "photo is required" }, { status: 400 });
  }

  // Upload original photo to Supabase Storage
  const buffer = await file.arrayBuffer();
  const path = `${id}.${file.type === "image/png" ? "png" : "jpg"}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from("pet-photos")
    .upload(path, Buffer.from(buffer), {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: urlData } = supabaseAdmin.storage
    .from("pet-photos")
    .getPublicUrl(path);
  const originalPhotoUrl = urlData.publicUrl;

  // Kick off Replicate pixel art generation
  const replicateJobId = await triggerPixelArtGeneration(
    pet.species,
    pet.breed ?? null,
    originalPhotoUrl
  );

  // Save photo URL + job ID to DB
  const { error: updateError } = await supabaseAdmin
    .from("pets")
    .update({ original_photo_url: originalPhotoUrl, replicate_job_id: replicateJobId })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ original_photo_url: originalPhotoUrl, replicate_job_id: replicateJobId });
}
