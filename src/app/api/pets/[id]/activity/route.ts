import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { generateActivity } from "@/lib/claude";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const { data: pet, error: petError } = await supabaseAdmin
    .from("pets")
    .select("id, name, species, breed, traits, habits, bio, current_activity, current_scene, last_activity_at")
    .eq("id", id)
    .single();

  if (petError || !pet) {
    return NextResponse.json({ error: "Pet not found" }, { status: 404 });
  }

  // Reuse existing activity if generated within the last 5 minutes
  if (pet.current_activity && pet.last_activity_at) {
    const age = Date.now() - new Date(pet.last_activity_at).getTime();
    if (age < 5 * 60 * 1000) {
      return NextResponse.json({
        activity: pet.current_activity,
        scene: pet.current_scene,
        generated_at: pet.last_activity_at,
      });
    }
  }

  const result = await generateActivity(pet);

  await supabaseAdmin
    .from("pets")
    .update({
      current_activity: result.activity,
      current_scene: result.scene,
      last_activity_at: result.generated_at,
    })
    .eq("id", id);

  return NextResponse.json(result);
}
