import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { generateActivity } from "@/lib/claude";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const { data: pet, error: petError } = await supabaseAdmin
    .from("pets")
    .select("id, name, species, breed, traits, habits, bio")
    .eq("id", id)
    .single();

  if (petError || !pet) {
    return NextResponse.json({ error: "Pet not found" }, { status: 404 });
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
